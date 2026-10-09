'use client'
import { getCharacterCount } from '@kvirn-ui/core'
import type { KvirnMessages } from '@kvirn-ui/i18n'
import { CharacterCount, mergeProps } from '@kvirn-ui/react'
import {
  FieldContext,
  joinIds,
  useQuietAnnouncer,
  warnAnnouncerMissing,
  warnOnce,
} from '@kvirn-ui/react/internal'
import { EditorContent } from '@tiptap/react'
import {
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react'
import type { ComponentPropsWithRef, ReactElement, ReactNode } from 'react'
import type { RichTextFormat } from '../value/document-value.ts'
import { BlockFormat } from './block-format.tsx'
import { CommandButton, CommandToggle } from './command-controls.tsx'
import { DefaultControls } from './default-controls.tsx'
import { ToolbarIcon } from './icons.tsx'
import { ImageControl } from './image-control.tsx'
import { LinkControl } from './link-control.tsx'
import { isMacPlatform } from './shortcuts.ts'
import { TableControls } from './table-controls.tsx'
import { RichTextEditorGroup, RichTextEditorToolbar } from './toolbar.tsx'
import { RichTextEditorContext, useRichTextEditorContext } from './rich-text-editor-context.ts'
import type {
  RichTextContentNaming,
  RichTextEditorContextValue,
  RichTextEditorState,
  RichTextLabels,
} from './rich-text-editor-context.ts'
import { useRichTextEditor } from './use-rich-text-editor.ts'
import type { UseRichTextEditorOptions } from './use-rich-text-editor.ts'

export interface RichTextEditorRootProps<Format extends RichTextFormat = 'html'>
  extends
    Omit<ComponentPropsWithRef<'div'>, 'defaultValue' | 'onChange' | 'children'>,
    Omit<
      UseRichTextEditorOptions<Format>,
      'aria-label' | 'aria-labelledby' | 'aria-describedby' | 'onFocusToolbar' | 'onOpenLinkForm'
    > {
  /**
   * How the toolbar's icon controls show their names. `'icon'` (default): only the icon, with a
   * tooltip and an `aria-label`. `'icon-and-text'`: the name next to the icon, which suits small,
   * resident-facing editors and touch screens. A `Toolbar` can set its own.
   */
  labels?: RichTextLabels | undefined
  /**
   * Whether icon-only controls get a tooltip with their name and shortcut. Default `true`. Without
   * tooltips an icon-only control has no visible name (a development warning says so). A `Toolbar`
   * can set its own.
   */
  tooltips?: boolean | undefined
  /** Per-instance overrides for the count's texts, with `characterCount`. */
  countMessages?: Partial<KvirnMessages['characterCount']> | undefined
  /** The parts inside the box: `Content`, and the toolbar. */
  children?: ReactNode
}

const noNaming: RichTextContentNaming = {}

/** The platform never changes, so there is nothing to subscribe to. */
const subscribeToNothing = () => () => {}

/**
 * The editor's box: it creates the Tiptap editor, wires it to its Field, and renders the parts you
 * put in it (`Content`, and the toolbar parts) inside the box. Under the box it renders the
 * character count and a hidden input that submits the value under `name` (contract:
 * rich-text-editor.a11y.md). The value is HTML or JSON, and is never sanitized: sanitize
 * it on the server.
 *
 * @example
 * <Field.Root required>
 *   <Field.Label>Beskriv ärendet</Field.Label>
 *   <RichTextEditor.Root name="description">
 *     <RichTextEditor.Content />
 *   </RichTextEditor.Root>
 * </Field.Root>
 */
export function RichTextEditorRoot<Format extends RichTextFormat = 'html'>({
  extensions,
  format,
  value,
  defaultValue,
  onValueChange,
  name,
  editable,
  disabled,
  readOnly,
  maxLength,
  characterCount = false,
  countCharacters,
  messages: messageOverrides,
  countMessages,
  editorOptions,
  labels = 'icon',
  tooltips = true,
  children,
  ref,
  ...otherProps
}: RichTextEditorRootProps<Format>): ReactElement {
  const field = useContext(FieldContext)
  const countId = useId()
  const [naming, setNaming] = useState(noNaming)
  const focusToolbar = useRef<(() => boolean) | null>(null)
  const openLinkForm = useRef<(() => void) | null>(null)
  // The server and the first client render say false, so they match: the platform is read after.
  const isMac = useSyncExternalStore(subscribeToNothing, isMacPlatform, () => false)
  const { announce: say, isAvailable: canAnnounce } = useQuietAnnouncer()

  const limit = characterCount ? maxLength : undefined
  const hasCount = limit !== undefined
  const isOutsideField = field === null
  // Inside a Field, the Field lists the count as one of its descriptions. Outside one the
  // editable text lists it itself.
  const describedBy = joinIds(naming.describedBy, isOutsideField && hasCount ? countId : undefined)

  const richText = useRichTextEditor<Format>({
    extensions,
    format,
    value,
    defaultValue,
    onValueChange,
    name,
    editable,
    disabled,
    readOnly,
    maxLength,
    characterCount,
    countCharacters,
    'aria-label': naming.label,
    'aria-labelledby': naming.labelledBy,
    'aria-describedby': describedBy,
    onFocusToolbar: () => focusToolbar.current?.() ?? false,
    onOpenLinkForm: () => {
      openLinkForm.current?.()
      return openLinkForm.current !== null
    },
    messages: messageOverrides,
    editorOptions,
  })

  useEffect(() => {
    if (characterCount && maxLength === undefined) {
      warnOnce(
        'rich-text-editor-character-count-without-limit',
        'A RichTextEditor has characterCount but no maxLength, so it has no limit to count against and renders no count. Set maxLength to the limit the form allows: it never blocks typing (WCAG 3.3.8).',
      )
    }
  }, [characterCount, maxLength])

  const setContentNaming = useCallback((next: RichTextContentNaming) => {
    setNaming((previous) =>
      previous.label === next.label &&
      previous.labelledBy === next.labelledBy &&
      previous.describedBy === next.describedBy
        ? previous
        : next,
    )
  }, [])
  const registerToolbar = useCallback((focus: () => boolean) => {
    focusToolbar.current = focus
    return () => {
      if (focusToolbar.current === focus) {
        focusToolbar.current = null
      }
    }
  }, [])

  const registerLinkForm = useCallback((open: () => void) => {
    openLinkForm.current = open
    return () => {
      if (openLinkForm.current === open) {
        openLinkForm.current = null
      }
    }
  }, [])
  const announce = useCallback(
    (message: string) => {
      if (canAnnounce) {
        say(message)
      } else {
        warnAnnouncerMissing()
      }
    },
    [say, canAnnounce],
  )
  const editorForFocus = richText.editor
  const focusText = useCallback(() => {
    editorForFocus?.view.focus()
  }, [editorForFocus])

  const count =
    limit === undefined
      ? undefined
      : getCharacterCount({ value: richText.text, limit, countCharacters })
  const {
    editor,
    features,
    contentProps,
    isEmpty,
    isFocused,
    isFocusVisible,
    isInvalid,
    isRequired,
    isDisabled,
    isReadOnly,
    isEditable,
  } = richText
  const isOverLimit = count?.isOver ?? false
  const state = useMemo<RichTextEditorState>(
    () => ({
      isEmpty,
      isFocused,
      isFocusVisible,
      isInvalid,
      isRequired,
      isDisabled,
      isReadOnly,
      isEditable,
      isOverLimit,
    }),
    [
      isEmpty,
      isFocused,
      isFocusVisible,
      isInvalid,
      isRequired,
      isDisabled,
      isReadOnly,
      isEditable,
      isOverLimit,
    ],
  )
  const resolvedFormat: RichTextFormat = format ?? 'html'
  const context = useMemo<RichTextEditorContextValue>(
    () => ({
      editor,
      format: resolvedFormat,
      state,
      features,
      messageOverrides,
      contentProps,
      contentId: richText.contentId,
      labels,
      tooltips,
      isMac,
      announce,
      focusText,
      registerLinkForm,
      setContentNaming,
      registerToolbar,
    }),
    [
      editor,
      resolvedFormat,
      state,
      features,
      messageOverrides,
      contentProps,
      richText.contentId,
      labels,
      tooltips,
      isMac,
      announce,
      focusText,
      registerLinkForm,
      setContentNaming,
      registerToolbar,
    ],
  )

  const box = <div {...mergeProps(otherProps, { ref }, richText.rootProps)}>{children}</div>
  return (
    <RichTextEditorContext value={context}>
      {box}
      {limit === undefined ? null : (
        <CharacterCount
          id={countId}
          value={richText.text}
          limit={limit}
          countCharacters={countCharacters}
          announceChanges={richText.isFocused}
          messages={countMessages}
        />
      )}
      {richText.hiddenInputProps === undefined ? null : <input {...richText.hiddenInputProps} />}
    </RichTextEditorContext>
  )
}
RichTextEditorRoot.displayName = 'RichTextEditor.Root'

export interface RichTextEditorContentProps extends Omit<
  ComponentPropsWithRef<'div'>,
  'children' | 'defaultValue'
> {
  /** The editable text's accessible name, outside a Field. Inside one, the Field's label names it. */
  'aria-label'?: string | undefined
  /** The editable text's accessible name from other elements, outside a Field. */
  'aria-labelledby'?: string | undefined
  /** Extra ids that describe the editable text, after a Field's descriptions. */
  'aria-describedby'?: string | undefined
}

/**
 * The editable text: Tiptap's `EditorContent`, around the `contenteditable` that Tiptap creates
 * after the first render. The `contenteditable` is a `role="textbox"` with `aria-multiline`, named
 * by the Field's label and described by its descriptions, and styled as `kv-prose` so what staff
 * see is what readers get. `aria-label`, `aria-labelledby` and `aria-describedby` go on the
 * editable text, not on this element's wrapper. Everything else goes to the wrapper `<div>`.
 */
export function RichTextEditorContent({
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  'aria-describedby': ariaDescribedBy,
  ref,
  ...otherProps
}: RichTextEditorContentProps): ReactElement {
  const { editor, contentProps, setContentNaming } =
    useRichTextEditorContext('RichTextEditor.Content')
  useLayoutEffect(() => {
    setContentNaming({ label: ariaLabel, labelledBy: ariaLabelledBy, describedBy: ariaDescribedBy })
  }, [setContentNaming, ariaLabel, ariaLabelledBy, ariaDescribedBy])
  const wrapperProps = mergeProps(otherProps, contentProps)
  return <EditorContent {...wrapperProps} editor={editor} innerRef={ref ?? null} />
}
RichTextEditorContent.displayName = 'RichTextEditor.Content'

/**
 * The rich text editor: `RichTextEditor.Root` with `Toolbar` and `Content` inside it. The toolbar
 * holds `DefaultControls`, or your own `Group`s of `CommandButton` and `CommandToggle`. `BlockFormat`,
 * `LinkControl`, `ImageControl` and `TableControls` are the default controls on their own, for a
 * toolbar you build; `Icon` draws the built-in editor icons, or your own paths.
 */
export const RichTextEditor = {
  Root: RichTextEditorRoot,
  Toolbar: RichTextEditorToolbar,
  DefaultControls,
  Group: RichTextEditorGroup,
  CommandButton,
  CommandToggle,
  BlockFormat,
  LinkControl,
  ImageControl,
  TableControls,
  Content: RichTextEditorContent,
  Icon: ToolbarIcon,
} as const
