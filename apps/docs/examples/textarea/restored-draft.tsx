'use client'
import { Button, Field, Textarea } from '@kvirn-ui/react'
import { useState } from 'react'
import { useTextareaTexts } from './texts.ts'
import { InEnglishWhenFallback } from '../../components/example-language.tsx'

export function RestoredDraft() {
  const { texts, isFallback } = useTextareaTexts()
  const [value, setValue] = useState('')
  return (
    <InEnglishWhenFallback isFallback={isFallback}>
      <div>
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
    </InEnglishWhenFallback>
  )
}
