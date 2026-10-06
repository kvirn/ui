'use client'
import { Button, Field, Textarea } from '@kvirn-ui/react'
import { useState } from 'react'
import { useTextareaTexts } from './texts.ts'

export function RestoredDraft() {
  const { texts, textLang } = useTextareaTexts()
  const [value, setValue] = useState('')
  return (
    <div lang={textLang}>
      <Field.Root>
        <Field.Label>{texts.label}</Field.Label>
        <Textarea
          name="situation"
          maxLength={200}
          characterCount
          value={value}
          onValueChange={setValue}
        />
      </Field.Root>
      <Button
        onClick={() => {
          setValue(texts.draft)
        }}
      >
        {texts.restoreDraft}
      </Button>
    </div>
  )
}
