import { getCharacterCount } from '@kvirn-ui/core'
import type { KvirnMessages } from '@kvirn-ui/i18n'
import {
  FieldContext,
  isKeyboardFocus,
  joinIds,
  trackModality,
  useMessages,
  useQuietAnnouncer,
  warnAnnouncerMissing,
  warnOnce,
} from '@kvirn-ui/react/internal'
import { getSchema, resolveExtensions } from '@tiptap/core'
import type { Editor, EditorOptions, Extensions } from '@tiptap/core'
import type { Transaction } from '@tiptap/pm/state'
import { useEditor } from '@tiptap/react'
import { useContext, useEffect, useId, useMemo, useRef, useState } from 'react'
import type { FocusEvent, RefCallback } from 'react'
import { defaultExtensions } from '../extensions/default-extensions.ts'
import type { FormatShortcutName, KvirnKeymapStorage } from '../extensions/kvirn-keymap.ts'
import {
  getDocumentValue,
  getPlainText,
  isDocumentEmpty,
  serializeValue,
  toContent,
} from '../value/document-value.ts'
import type { RichTextFormat, RichTextValue } from '../value/document-value.ts'

/** The second argument of `onValueChange`. */
export interface RichTextChangeDetails {
  /** The Tiptap editor, for anything the value doesn't say. */
  editor: Editor
  /** The transaction that changed the document. */
  transaction: Transaction
  /** There is nothing to read: the value is `''` (or `null` as JSON). */
  isEmpty: boolean
  /** With `characterCount`: the characters in the text, counted as the count counts them. */
  length?: number | undefined
  /** With `characterCount`: the limit (`maxLength`). */
  limit?: number | undefined
  /** With `characterCount`: the text is longer than the limit. A warning, never an error. */
  isOverLimit?: boolean | undefined
}

/** The Tiptap options you may pass through. The hook owns the extensions, content and editability. */
export type RichTextEditorOptions = Omit<
  Partial<EditorOptions>,
  'extensions' | 'content' | 'editable'
>

export interface UseRichTextEditorOptions<Format extends RichTextFormat = 'html'> {
  /**
   * The Tiptap extensions. Default: `defaultExtensions()`. Keep the array stable between renders
   * (a constant, or `useMemo`): Tiptap reads it when it creates the editor.
   */
  extensions?: Extensions | undefined
  /** The value's format: an HTML string (default), or Tiptap's `JSONContent` (`null` when empty). */
  format?: Format | undefined
  /** Controlled: the value from your form state. */
  value?: RichTextValue<Format> | undefined
  /** Uncontrolled: the starting value, and what a form reset goes back to. */
  defaultValue?: RichTextValue<Format> | undefined
  /** Reports each change to the text, with the new value. It only reports. */
  onValueChange?:
    | ((value: RichTextValue<Format>, details: RichTextChangeDetails) => void)
    | undefined
  /** The name a form submits the value under, through a hidden input. */
  name?: string | undefined
  /** `false` makes the text read-only, like `readOnly`. Default `true`. */
  editable?: boolean | undefined
  /** Not editable, not focusable and not submitted. A disabled Field disables the editor too. */
  disabled?: boolean | undefined
  /** Not editable, but focusable, selectable and copyable. */
  readOnly?: boolean | undefined
  /** The limit the character count counts against. It never blocks input. */
  maxLength?: number | undefined
  /** Shows a character count under the box, with `maxLength` as the limit (done by `Root`). */
  characterCount?: boolean | undefined
  /** Counts a text your own way, such as the way your server does. */
  countCharacters?: ((value: string) => number) | undefined
  /** An accessible name, outside a Field. */
  'aria-label'?: string | undefined
  /** An accessible name from other elements, outside a Field. */
  'aria-labelledby'?: string | undefined
  /** Extra ids that describe the text, after a Field's. */
  'aria-describedby'?: string | undefined
  /** Alt+F10 (Option+F10): move focus to your toolbar. Return `false` when there is none. */
  onFocusToolbar?: (() => boolean | void) | undefined
  /** Mod-k: open your link form. Return `false` to let the key pass. */
  onOpenLinkForm?: (() => boolean | void) | undefined
  /** Per-instance overrides for the announcements. */
  messages?: Partial<KvirnMessages['richText']> | undefined
  /** The rest of Tiptap's options, passed to `useEditor`. */
  editorOptions?: RichTextEditorOptions | undefined
}

/** Spread on the box. */
export interface RichTextRootPartProps {
  className: 'kv-rich-text'
  ref: RefCallback<HTMLDivElement>
  'data-empty'?: ''
  'data-focused'?: ''
  'data-focus-visible'?: ''
  'data-invalid'?: ''
  'data-required'?: ''
  'data-disabled'?: ''
  'data-readonly'?: ''
}

/** Spread on the element around the editable text, which Tiptap's `EditorContent` renders. */
export interface RichTextContentPartProps {
  onFocus: (event: FocusEvent<HTMLElement>) => void
  onBlur: (event: FocusEvent<HTMLElement>) => void
}

/** Spread on the hidden input a form submits the value through. */
export interface RichTextHiddenInputPartProps {
  type: 'hidden'
  name: string
  value: string
  disabled?: true
}

/** What the extensions let the text contain: lists and tables decide the keyboard instruction. */
export interface RichTextFeatures {
  lists: boolean
  tables: boolean
  links: boolean
  images: boolean
  bold: boolean
  italic: boolean
  underline: boolean
  strike: boolean
  code: boolean
  bulletList: boolean
  orderedList: boolean
  blockquote: boolean
  codeBlock: boolean
  /** The configured heading levels, in order. Empty without headings. */
  headingLevels: readonly number[]
  /** Undo and redo are there. */
  history: boolean
}

export interface UseRichTextEditorResult {
  /** The Tiptap editor. `null` until it mounts: it is created after the first render. */
  editor: Editor | null
  rootProps: RichTextRootPartProps
  contentProps: RichTextContentPartProps
  /** `undefined` without a `name`. */
  hiddenInputProps: RichTextHiddenInputPartProps | undefined
  /** The text as a character count counts it, with one line break between blocks. */
  text: string
  /** There is nothing to read. */
  isEmpty: boolean
  /** The editable text has focus, however it got it. */
  isFocused: boolean
  /** The editable text has focus from the keyboard (or a script). A click is not. */
  isFocusVisible: boolean
  isDisabled: boolean
  isReadOnly: boolean
  isInvalid: boolean
  isRequired: boolean
  /** Whether the text can be edited. */
  isEditable: boolean
  /** What the extensions allow: lists and tables decide the keyboard instruction. */
  features: RichTextFeatures
  /** The editable text's id: the Field's control id, else a generated one. */
  contentId: string
}

/** What the extensions let the text contain, read from their schema without making an editor. */
export function getRichTextFeatures(extensions: Extensions): RichTextFeatures {
  const { nodes, marks } = getSchema(extensions)
  const resolved = resolveExtensions(extensions)
  const heading = resolved.find((extension) => extension.name === 'heading')
  const levels: unknown = heading?.options?.levels
  return {
    lists: nodes['bulletList'] !== undefined || nodes['orderedList'] !== undefined,
    tables: nodes['table'] !== undefined,
    links: marks['link'] !== undefined,
    images: nodes['image'] !== undefined,
    bold: marks['bold'] !== undefined,
    italic: marks['italic'] !== undefined,
    underline: marks['underline'] !== undefined,
    strike: marks['strike'] !== undefined,
    code: marks['code'] !== undefined,
    bulletList: nodes['bulletList'] !== undefined,
    orderedList: nodes['orderedList'] !== undefined,
    blockquote: nodes['blockquote'] !== undefined,
    codeBlock: nodes['codeBlock'] !== undefined,
    headingLevels:
      nodes['heading'] !== undefined && Array.isArray(levels)
        ? levels.filter((level): level is number => typeof level === 'number')
        : [],
    history: resolved.some((extension) => extension.name === 'undoRedo'),
  }
}

/**
 * A rich text editor's state and props for your own markup (contract: rich-text-editor.a11y.md),
 * on Tiptap's `useEditor`. It is wired to the nearest Field: the Field's label names the editable
 * text, and its description, help text and error describe it. It creates the editor after the first
 * render (`immediatelyRender: false`), so it is safe to server-render.
 *
 * The value is HTML (`''` when empty) or Tiptap's JSON (`null` when empty). A hidden input with
 * `name` submits it and follows a form reset. The output is not sanitized: always sanitize it on
 * the server.
 *
 * @example
 * const richText = useRichTextEditor({ name: 'description', onValueChange: setValue })
 * <div {...richText.rootProps}>
 *   <EditorContent editor={richText.editor} {...richText.contentProps} />
 * </div>
 */
export function useRichTextEditor<Format extends RichTextFormat = 'html'>({
  extensions,
  format = 'html' as Format,
  value,
  defaultValue,
  onValueChange,
  name,
  editable = true,
  disabled = false,
  readOnly = false,
  maxLength,
  characterCount = false,
  countCharacters,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  'aria-describedby': ariaDescribedBy,
  onFocusToolbar,
  onOpenLinkForm,
  messages: messageOverrides,
  editorOptions,
}: UseRichTextEditorOptions<Format> = {}): UseRichTextEditorResult {
  const field = useContext(FieldContext)
  const messages = useMessages('richText', messageOverrides)
  const { announce, isAvailable } = useQuietAnnouncer()

  const extensionList = useMemo(() => extensions ?? defaultExtensions(), [extensions])
  const features = useMemo(() => getRichTextFeatures(extensionList), [extensionList])

  const isDisabled = (field?.state.isDisabled ?? false) || disabled
  const isInvalid = field?.state.isInvalid ?? false
  const isRequired = field?.state.isRequired ?? false
  const isEditable = editable && !readOnly && !isDisabled
  const isReadOnly = !isDisabled && !isEditable

  const startingValue = value ?? defaultValue
  const [serializedValue, setSerializedValue] = useState(() =>
    serializeValue(startingValue, format),
  )
  const [isEmpty, setIsEmpty] = useState(() => serializedValue === '')
  const [text, setText] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const [isFocusVisible, setIsFocusVisible] = useState(false)
  const [rootElement, setRootElement] = useState<HTMLDivElement | null>(null)

  // Tiptap reads the content when it creates the editor, so the first one is kept.
  const [initialContent] = useState(() => toContent(startingValue))
  const latestDefaultValue = useRef(defaultValue)
  useEffect(() => {
    latestDefaultValue.current = defaultValue
  })
  // The controlled value the editor was last given or reported, to tell a new one from an echo.
  const appliedValue = useRef(value === undefined ? undefined : serializeValue(value, format))

  const describedBy = joinIds(field?.controlProps['aria-describedby'], ariaDescribedBy)
  const labelledBy = joinIds(field?.labelId, ariaLabelledBy)
  const generatedId = useId()
  // The editable text always has an id: the toolbar's `aria-controls` points at it.
  const contentId = field?.controlProps.id ?? generatedId
  const attributes = useMemo(() => {
    const result: Record<string, string> = {
      class: 'kv-rich-text-content kv-prose',
      'aria-multiline': 'true',
    }
    result['id'] = contentId
    if (labelledBy !== undefined) result['aria-labelledby'] = labelledBy
    if (ariaLabel !== undefined) result['aria-label'] = ariaLabel
    if (describedBy !== undefined) result['aria-describedby'] = describedBy
    if (isInvalid) result['aria-invalid'] = 'true'
    if (isRequired) result['aria-required'] = 'true'
    if (isDisabled) result['aria-disabled'] = 'true'
    if (isReadOnly) {
      result['aria-readonly'] = 'true'
      // Not editable, yet focusable, so its text can be read, selected and copied.
      result['tabindex'] = '0'
    }
    return result
  }, [contentId, labelledBy, ariaLabel, describedBy, isInvalid, isRequired, isDisabled, isReadOnly])

  const adopterEditorProps = editorOptions?.editorProps
  const editorProps = useMemo(() => {
    const adopterAttributes =
      typeof adopterEditorProps?.attributes === 'object' ? adopterEditorProps.attributes : undefined
    // Our attributes win: they are the editor's accessible name, description and state.
    return { ...adopterEditorProps, attributes: { ...adopterAttributes, ...attributes } }
  }, [adopterEditorProps, attributes])

  const adopterOnUpdate = editorOptions?.onUpdate
  const editor = useEditor({
    ...editorOptions,
    immediatelyRender: false,
    shouldRerenderOnTransaction: false,
    extensions: extensionList,
    content: initialContent,
    editable: isEditable,
    editorProps,
    onUpdate: (props) => {
      const { editor: updated, transaction } = props
      const nextValue = getDocumentValue(updated, format)
      const nextSerialized = serializeValue(nextValue, format)
      const nextEmpty = isDocumentEmpty(updated.state.doc)
      const nextText = getPlainText(updated)
      appliedValue.current = nextSerialized
      setSerializedValue(nextSerialized)
      setIsEmpty(nextEmpty)
      setText(nextText)
      const count =
        characterCount && maxLength !== undefined
          ? getCharacterCount({ value: nextText, limit: maxLength, countCharacters })
          : undefined
      onValueChange?.(nextValue, {
        editor: updated,
        transaction,
        isEmpty: nextEmpty,
        ...(count === undefined
          ? {}
          : { length: count.length, limit: count.limit, isOverLimit: count.isOver }),
      })
      adopterOnUpdate?.(props)
    },
  })

  useEffect(trackModality, [])

  // The editor is created after the first render: take its state as soon as it exists.
  useEffect(() => {
    if (editor === null) {
      return
    }
    setSerializedValue(serializeValue(getDocumentValue(editor, format), format))
    setIsEmpty(isDocumentEmpty(editor.state.doc))
    setText(getPlainText(editor))
  }, [editor, format])

  // `useEditor` keeps the editor's editability as it is, so a change is applied here.
  useEffect(() => {
    editor?.setEditable(isEditable, false)
  }, [editor, isEditable])

  // A controlled value that isn't what the editor holds replaces it. An echo of the last
  // reported value is skipped, so typing never resets the caret.
  const serializedProp = value === undefined ? undefined : serializeValue(value, format)
  useEffect(() => {
    if (
      editor === null ||
      serializedProp === undefined ||
      serializedProp === appliedValue.current
    ) {
      return
    }
    appliedValue.current = serializedProp
    if (serializedProp === serializeValue(getDocumentValue(editor, format), format)) {
      return
    }
    editor.commands.setContent(toContent(value), { emitUpdate: false })
    setSerializedValue(serializeValue(getDocumentValue(editor, format), format))
    setIsEmpty(isDocumentEmpty(editor.state.doc))
    setText(getPlainText(editor))
    // `value` is read only to hand it to the editor: `serializedProp` says when it changed.
  }, [editor, serializedProp, format])

  // A form reset goes back to the default value, and tells the owner.
  useEffect(() => {
    const form = rootElement?.closest('form')
    if (editor === null || form === null || form === undefined) {
      return undefined
    }
    const onReset = () => {
      editor.commands.setContent(toContent(latestDefaultValue.current), { emitUpdate: true })
    }
    form.addEventListener('reset', onReset)
    return () => {
      form.removeEventListener('reset', onReset)
    }
  }, [editor, rootElement])

  // A `<label for>` can't focus a contenteditable, so a click on the Field's label does.
  const labelId = field?.labelId
  useEffect(() => {
    if (editor === null || labelId === undefined || isDisabled) {
      return undefined
    }
    const label = document.getElementById(labelId)
    if (label === null) {
      return undefined
    }
    const focusText = (event: MouseEvent) => {
      if (!event.defaultPrevented) {
        editor.commands.focus()
      }
    }
    label.addEventListener('click', focusText)
    return () => {
      label.removeEventListener('click', focusText)
    }
  }, [editor, labelId, isDisabled])

  // What the Kvirn keymap reports: announced politely, because nothing visible says it worked.
  const formatNames: Record<FormatShortcutName, string> = {
    bold: messages.bold,
    italic: messages.italic,
    underline: messages.underline,
  }
  const latest = useRef({ messages, announce, isAvailable, formatNames })
  useEffect(() => {
    latest.current = { messages, announce, isAvailable, formatNames }
  })
  const latestFocusToolbar = useRef(onFocusToolbar)
  const latestOpenLinkForm = useRef(onOpenLinkForm)
  useEffect(() => {
    latestFocusToolbar.current = onFocusToolbar
    latestOpenLinkForm.current = onOpenLinkForm
  })
  useEffect(() => {
    // Without the Kvirn keymap (custom extensions) there is nothing to wire.
    const keymap: KvirnKeymapStorage | undefined = editor?.storage.kvirnKeymap
    if (keymap === undefined) {
      return undefined
    }
    const say = (message: string) => {
      if (!latest.current.isAvailable) {
        warnAnnouncerMissing()
        return
      }
      latest.current.announce(message)
    }
    keymap.onFocusToolbar = () => latestFocusToolbar.current?.() ?? false
    keymap.onOpenLinkForm = () => latestOpenLinkForm.current?.() ?? false
    keymap.onFormatToggle = (formatName, isOn) => {
      const { messages: current, formatNames: names } = latest.current
      const label = names[formatName]
      say(isOn ? current.formatOn({ name: label }) : current.formatOff({ name: label }))
    }
    keymap.onListLevelChange = (level) => {
      say(latest.current.messages.listLevel({ level }))
    }
    return () => {
      keymap.onFocusToolbar = undefined
      keymap.onOpenLinkForm = undefined
      keymap.onFormatToggle = undefined
      keymap.onListLevelChange = undefined
    }
  }, [editor])

  // Development warnings: the editable text must have a name (WCAG 1.3.1, 4.1.2).
  const hasOwnName = ariaLabel !== undefined || ariaLabelledBy !== undefined
  useEffect(() => {
    if (editor === null) {
      return
    }
    if (labelId !== undefined) {
      if (document.getElementById(labelId) === null) {
        warnOnce(
          'rich-text-editor-in-field-without-label',
          'A RichTextEditor in a Field has no Field.Label, so its editable text has no accessible name (WCAG 1.3.1, 4.1.2). Add <Field.Label> to the Field.',
        )
      }
    } else if (!hasOwnName) {
      warnOnce(
        'rich-text-editor-without-name',
        'A RichTextEditor has no accessible name. Put it in a Field with a Field.Label, or give its Content an aria-label or aria-labelledby (WCAG 1.3.1, 4.1.2).',
      )
    }
  }, [editor, labelId, hasOwnName])

  const rootProps: RichTextRootPartProps = {
    className: 'kv-rich-text',
    ref: setRootElement,
    ...(isEmpty ? { 'data-empty': '' as const } : {}),
    ...(isFocused ? { 'data-focused': '' as const } : {}),
    ...(isFocusVisible ? { 'data-focus-visible': '' as const } : {}),
    ...(isInvalid ? { 'data-invalid': '' as const } : {}),
    ...(isRequired ? { 'data-required': '' as const } : {}),
    ...(isDisabled ? { 'data-disabled': '' as const } : {}),
    ...(isReadOnly ? { 'data-readonly': '' as const } : {}),
  }
  // Stable, so the parts that read it through context don't re-render on every keystroke.
  const contentProps = useMemo<RichTextContentPartProps>(
    () => ({
      onFocus: (event) => {
        setIsFocused(true)
        setIsFocusVisible(event.target instanceof Element && isKeyboardFocus(event.target))
      },
      onBlur: () => {
        setIsFocused(false)
        setIsFocusVisible(false)
      },
    }),
    [],
  )
  const hiddenInputProps: RichTextHiddenInputPartProps | undefined =
    name === undefined
      ? undefined
      : {
          type: 'hidden',
          name,
          value: serializedValue,
          ...(isDisabled ? { disabled: true as const } : {}),
        }

  return {
    editor,
    rootProps,
    contentProps,
    hiddenInputProps,
    text,
    isEmpty,
    isFocused,
    isFocusVisible,
    isDisabled,
    isReadOnly,
    isInvalid,
    isRequired,
    isEditable,
    features,
    contentId,
  }
}
