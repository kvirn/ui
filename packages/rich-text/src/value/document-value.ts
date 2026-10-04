import type { Editor, JSONContent } from '@tiptap/core'
import type { Node as ProseMirrorNode } from '@tiptap/pm/model'

/** How the editor reports and takes its value: an HTML string, or Tiptap's JSON document. */
export type RichTextFormat = 'html' | 'json'

/**
 * The editor's value in a format. HTML is a string, and `''` when the text is empty. JSON is
 * Tiptap's document, and `null` when the text is empty.
 */
export type RichTextValue<Format extends RichTextFormat = 'html'> = Format extends 'json'
  ? JSONContent | null
  : string

/**
 * Whether a document has nothing to read (Plan 0036): no text, and no image, table or other
 * content that isn't text. An empty paragraph, heading or list item is empty, so `required` works
 * and the value is `''`, never `<p></p>`. A line break alone is empty too.
 */
export function isDocumentEmpty(document: ProseMirrorNode): boolean {
  if (document.textContent.trim() !== '') {
    return false
  }
  let hasContent = false
  document.descendants((node) => {
    if (hasContent) {
      return false
    }
    const isTable = node.type.spec['tableRole'] === 'table'
    const isLeafContent = node.isLeaf && !node.isText && node.type.name !== 'hardBreak'
    if (isTable || isLeafContent) {
      hasContent = true
    }
    return !hasContent
  })
  return !hasContent
}

/** The editor's current value in `format`. */
export function getDocumentValue<Format extends RichTextFormat>(
  editor: Editor,
  format: Format,
): RichTextValue<Format> {
  const isEmpty = isDocumentEmpty(editor.state.doc)
  // The conditional type can't be narrowed from `format`, so the two branches are cast once.
  if (format === 'json') {
    return (isEmpty ? null : editor.getJSON()) as RichTextValue<Format>
  }
  return (isEmpty ? '' : editor.getHTML()) as RichTextValue<Format>
}

/**
 * A value as one string: the HTML itself, or the JSON text (`''` when empty). It is what the
 * hidden input submits, and what two values are compared by.
 */
export function serializeValue(
  value: RichTextValue<RichTextFormat> | undefined,
  format: RichTextFormat,
): string {
  if (value === undefined || value === null) {
    return ''
  }
  return format === 'json' ? JSON.stringify(value) : String(value)
}

/** The value as the editor's `content`: HTML text, a JSON document, or nothing. */
export function toContent(value: RichTextValue<RichTextFormat> | undefined): string | JSONContent {
  if (value === undefined || value === null) {
    return ''
  }
  return value
}

/**
 * The text a character count counts: what the user can read, with one line break between
 * blocks (not Tiptap's two), so a new paragraph counts like a new line in a Textarea.
 */
export function getPlainText(editor: Editor): string {
  return editor.getText({ blockSeparator: '\n' })
}
