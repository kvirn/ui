'use client'
import { Field } from '@kvirn-ui/react'
import { RichTextEditor } from '@kvirn-ui/rich-text'
import { useRichTextEditorTexts } from './texts.ts'

export function CountedSummary() {
  const { texts } = useRichTextEditorTexts()
  return (
    <Field.Root required>
      <Field.Label>{texts.summaryLabel}</Field.Label>
      <RichTextEditor.Root name="summary" maxLength={200} characterCount>
        <RichTextEditor.Toolbar />
        <RichTextEditor.Content />
      </RichTextEditor.Root>
      <Field.HelpText>{texts.summaryHint}</Field.HelpText>
    </Field.Root>
  )
}
