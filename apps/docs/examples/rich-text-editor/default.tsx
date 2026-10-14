'use client'
import { Field } from '@kvirn-ui/react'
import { RichTextEditor } from '@kvirn-ui/rich-text'
import { useRichTextEditorTexts } from './texts.ts'

export function DefaultRichTextEditor() {
  const { texts } = useRichTextEditorTexts()
  return (
    <Field.Root>
      <Field.Label>{texts.articleLabel}</Field.Label>
      <Field.Prose>
        <p>{texts.newsDescription}</p>
      </Field.Prose>
      <RichTextEditor.Root defaultValue={`<p>${texts.newsIntro}</p>`}>
        <RichTextEditor.Toolbar />
        <RichTextEditor.Content />
      </RichTextEditor.Root>
    </Field.Root>
  )
}
