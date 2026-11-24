'use client'
import { Field } from '@kvirn/ui'
import { RichTextEditor } from '@kvirn/rich-text'
import { useRichTextEditorTexts } from './texts.ts'

export function SmallToolbar() {
  const { texts } = useRichTextEditorTexts()
  return (
    <Field.Root>
      <Field.Label>{texts.eventLabel}</Field.Label>
      <Field.Prose>
        <p>{texts.eventDescription}</p>
      </Field.Prose>
      <RichTextEditor.Root name="event" labels="icon-and-text">
        <RichTextEditor.Toolbar>
          <RichTextEditor.DefaultControls
            include={['undo', 'redo', 'bold', 'italic', 'bulletList', 'orderedList', 'link']}
          />
        </RichTextEditor.Toolbar>
        <RichTextEditor.Content />
      </RichTextEditor.Root>
    </Field.Root>
  )
}
