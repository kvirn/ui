import type { KvirnMessages } from '@kvirn-ui/i18n'
import type { Editor } from '@tiptap/core'
import { createContext, useContext } from 'react'
import type { RichTextFormat } from '../value/document-value.ts'
import type { RichTextContentPartProps, RichTextFeatures } from './use-rich-text-editor.ts'

/** What `render` receives as its second argument, and what the parts read. */
export interface RichTextEditorState {
  /** There is nothing to read. */
  isEmpty: boolean
  isFocused: boolean
  isFocusVisible: boolean
  isInvalid: boolean
  isRequired: boolean
  isDisabled: boolean
  isReadOnly: boolean
  /** The text can be edited: not disabled, not read-only. */
  isEditable: boolean
  /** With `characterCount`: the text is longer than the limit. */
  isOverLimit: boolean
}

/** What the parts that name or describe the editable text hand to the `Root`. */
export interface RichTextContentNaming {
  /** An `aria-label` for the editable text, outside a Field. */
  label?: string | undefined
  /** An `aria-labelledby` for the editable text, outside a Field. */
  labelledBy?: string | undefined
  /** Extra ids that describe the editable text. */
  describedBy?: string | undefined
}

/** How a toolbar control shows its name: only an icon (with a tooltip), or the icon and its name. */
export type RichTextLabels = 'icon' | 'icon-and-text'

export interface RichTextEditorContextValue {
  /** The Tiptap editor, `null` until it mounts. */
  editor: Editor | null
  format: RichTextFormat
  state: RichTextEditorState
  features: RichTextFeatures
  /**
   * The `Root`'s per-instance message overrides. A part resolves its own texts with
   * `useMessages('richText', messageOverrides)`.
   */
  messageOverrides: Partial<KvirnMessages['richText']> | undefined
  contentProps: RichTextContentPartProps
  /** The editable text's id: the toolbar's `aria-controls` points at it. */
  contentId: string
  /** The label mode of the whole editor. A `Toolbar` can set its own. */
  labels: RichTextLabels
  /** Whether icon-only controls get a tooltip. A `Toolbar` can set its own. */
  tooltips: boolean
  /** Apple platforms: `Mod` is Command there. Decided after mount, so the first render matches the server's. */
  isMac: boolean
  /** Says something politely, through the provider's live region. */
  announce: (message: string) => void
  /** Puts focus back in the editable text, with the selection where it was. */
  focusText: () => void
  /** The link control registers how to open its form, for Mod-k. Returns the unregister function. */
  registerLinkForm: (open: () => void) => () => void
  /** `Content` says what names it, outside a Field. */
  setContentNaming: (naming: RichTextContentNaming) => void
  /** `KeyboardHint` registers its id while it renders, for the editor's `aria-describedby`. */
  registerKeyboardHint: (id: string) => () => void
  /**
   * The toolbar registers how to focus it, for Alt+F10 (Option+F10). Return `false` when it
   * can't. Returns the unregister function.
   */
  registerToolbar: (focus: () => boolean) => () => void
}

export const RichTextEditorContext = createContext<RichTextEditorContextValue | null>(null)

/**
 * The editor's state and Tiptap `Editor`, for building your own parts inside a
 * `RichTextEditor.Root` (a toolbar button that runs a command, a word count). Throws outside one.
 */
export function useRichTextEditorContext(
  partName = 'useRichTextEditorContext',
): RichTextEditorContextValue {
  const context = useContext(RichTextEditorContext)
  if (context === null) {
    throw new Error(
      `[KvirnUI] ${partName} must be used inside <RichTextEditor.Root>. Wrap your editor parts in it.`,
    )
  }
  return context
}

/** What a `Toolbar` gives its controls: its own label mode and tooltips, and where popups go. */
export interface RichTextToolbarContextValue {
  labels: RichTextLabels
  tooltips: boolean
  /**
   * The element after the toolbar that its popovers render into, so they are siblings of the
   * toolbar, not inside it (design spec §5.5). `null` until it has mounted.
   */
  popupSlot: HTMLElement | null
}

export const RichTextToolbarContext = createContext<RichTextToolbarContextValue | null>(null)
