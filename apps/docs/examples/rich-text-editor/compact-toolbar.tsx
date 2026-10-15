'use client'
import { Field } from '@kvirn-ui/react'
import { RichTextEditor } from '@kvirn-ui/rich-text'
import { useRichTextEditorTexts } from './texts.ts'

export function CompactToolbar() {
  const { texts } = useRichTextEditorTexts()
  return (
    <Field.Root>
      <Field.Label>{texts.eventLabel}</Field.Label>
      <Field.Prose>
        <p>{texts.eventDescription}</p>
      </Field.Prose>
      <RichTextEditor.Root name="event-compact">
        <RichTextEditor.Toolbar>
          <RichTextEditor.CompactControls />
        </RichTextEditor.Toolbar>
        <RichTextEditor.Content />
      </RichTextEditor.Root>
    </Field.Root>
  )
}
