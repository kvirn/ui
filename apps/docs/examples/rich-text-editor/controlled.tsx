'use client'
import { Button, Field, Stack } from '@kvirn-ui/react'
import { RichTextEditor } from '@kvirn-ui/rich-text'
import type { RichTextValue } from '@kvirn-ui/rich-text'
import { useState } from 'react'
import { useRichTextEditorTexts } from './texts.ts'

export function ControlledCaseNote() {
  const { texts } = useRichTextEditorTexts()
  const [value, setValue] = useState<RichTextValue<'json'>>(null)
  const [outcome, setOutcome] = useState('')

  const standardNote: RichTextValue<'json'> = {
    type: 'doc',
    content: [
      {
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: texts.noteHeading }],
      },
      { type: 'paragraph', content: [{ type: 'text', text: texts.noteBody }] },
    ],
  }

  return (
    <Stack className="kv-stack--gap-8">
      <Field.Root>
        <Field.Label>{texts.noteLabel}</Field.Label>
        <RichTextEditor.Root
          format="json"
          value={value}
          onValueChange={(next) => {
            setValue(next)
            setOutcome('')
          }}
        >
          <RichTextEditor.Toolbar />
          <RichTextEditor.Content />
        </RichTextEditor.Root>
      </Field.Root>
      <div className="kv-button-group">
        <Button
          onClick={() => {
            setValue(standardNote)
            setOutcome(texts.standardNoteInserted)
          }}
        >
          {texts.useStandardNote}
        </Button>
        <Button className="kv-button--primary" onClick={() => setOutcome(texts.noteSaved)}>
          {texts.saveNote}
        </Button>
      </div>
      <output>{outcome}</output>
    </Stack>
  )
}
