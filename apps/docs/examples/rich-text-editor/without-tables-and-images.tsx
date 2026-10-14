'use client'
import { Field } from '@kvirn-ui/react'
import { defaultExtensions, RichTextEditor } from '@kvirn-ui/rich-text'
import { useRichTextEditorTexts } from './texts.ts'

// Tiptap reads the extensions when it creates the editor, so keep them in a constant.
const textOnly = defaultExtensions({ table: false, image: false })

export function WithoutTablesAndImages() {
  const { texts } = useRichTextEditorTexts()
  return (
    <Field.Root>
      <Field.Label>{texts.noticeLabel}</Field.Label>
      <RichTextEditor.Root extensions={textOnly} defaultValue={`<p>${texts.noticeIntro}</p>`}>
        <RichTextEditor.Toolbar />
        <RichTextEditor.Content />
      </RichTextEditor.Root>
    </Field.Root>
  )
}
