'use client'

// Public API of @kvirn-ui/rich-text. The whole entry is client code. Tiptap and ProseMirror are
// peers: this package never bundles them, so the app owns one copy of each.
export { defaultExtensions, isAllowedLinkAddress } from './extensions/default-extensions.ts'
export type { DefaultExtensionsOptions } from './extensions/default-extensions.ts'
export { isAllowedImageSource } from './extensions/image-sources.ts'
export type { ImageSourceOptions } from './extensions/image-sources.ts'
export {
  KvirnKeymap,
  canIndentListItem,
  canOutdentListItem,
  indentListItem,
  outdentListItem,
} from './extensions/kvirn-keymap.ts'
export type {
  FormatShortcutName,
  KvirnKeymapOptions,
  KvirnKeymapStorage,
} from './extensions/kvirn-keymap.ts'
export { isDocumentEmpty } from './value/document-value.ts'
export type { RichTextFormat, RichTextValue } from './value/document-value.ts'
export {
  RichTextEditor,
  RichTextEditorContent,
  RichTextEditorRoot,
} from './rich-text-editor/rich-text-editor.tsx'
export type {
  RichTextEditorContentProps,
  RichTextEditorRootProps,
  RichTextEditorState,
} from './rich-text-editor/rich-text-editor.tsx'
export { BlockFormat } from './rich-text-editor/block-format.tsx'
export type { BlockKey } from './rich-text-editor/block-format.tsx'
export { CommandButton, CommandToggle } from './rich-text-editor/command-controls.tsx'
export type {
  CommandButtonProps,
  CommandControlOptions,
  CommandToggleProps,
} from './rich-text-editor/command-controls.tsx'
export { DefaultControls } from './rich-text-editor/default-controls.tsx'
export type {
  DefaultControlName,
  DefaultControlsProps,
} from './rich-text-editor/default-controls.tsx'
export { ToolbarIcon } from './rich-text-editor/icons.tsx'
export type { RichTextIconName, ToolbarIconProps } from './rich-text-editor/icons.tsx'
export { ImageControl } from './rich-text-editor/image-control.tsx'
export { LinkControl } from './rich-text-editor/link-control.tsx'
export { TableControls } from './rich-text-editor/table-controls.tsx'
export { RichTextEditorGroup, RichTextEditorToolbar } from './rich-text-editor/toolbar.tsx'
export type { RichTextEditorToolbarProps } from './rich-text-editor/toolbar.tsx'
export { describeShortcut } from './rich-text-editor/shortcuts.ts'
export type { DescribedShortcut } from './rich-text-editor/shortcuts.ts'
export { useRichTextEditorContext } from './rich-text-editor/rich-text-editor-context.ts'
export type {
  RichTextContentNaming,
  RichTextEditorContextValue,
  RichTextLabels,
} from './rich-text-editor/rich-text-editor-context.ts'
export { getRichTextFeatures, useRichTextEditor } from './rich-text-editor/use-rich-text-editor.ts'
export type {
  RichTextChangeDetails,
  RichTextContentPartProps,
  RichTextEditorOptions,
  RichTextFeatures,
  RichTextHiddenInputPartProps,
  RichTextRootPartProps,
  UseRichTextEditorOptions,
  UseRichTextEditorResult,
} from './rich-text-editor/use-rich-text-editor.ts'
