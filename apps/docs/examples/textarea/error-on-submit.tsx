'use client'
import { Button, Field, Textarea } from '@kvirn-ui/react'
import { useEffect, useRef, useState } from 'react'
import { useTextareaTexts } from './texts.ts'

const limit = 200

export function ErrorOnSubmit() {
  const { texts, textLang } = useTextareaTexts()
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [value, setValue] = useState('')
  const [isOverLimit, setIsOverLimit] = useState(false)
  const [error, setError] = useState<string | undefined>()
  const [attempts, setAttempts] = useState(0)

  // Focus moves after the error has rendered, so the screen reader reads it with the box.
  useEffect(() => {
    if (attempts > 0 && error !== undefined) {
      textareaRef.current?.focus()
    }
  }, [attempts, error])

  return (
    <form
      lang={textLang}
      noValidate
      onSubmit={(event) => {
        event.preventDefault()
        if (value.trim() === '') {
          setError(texts.errorEmpty)
        } else if (isOverLimit) {
          setError(texts.errorTooLong(limit))
        } else {
          setError(undefined)
        }
        setAttempts((count) => count + 1)
      }}
    >
      <Field.Root required invalid={error !== undefined}>
        <Field.Label>{texts.label}</Field.Label>
        <Textarea
          ref={textareaRef}
          name="situation"
          maxLength={limit}
          characterCount
          value={value}
          onValueChange={(nextValue, details) => {
            setValue(nextValue)
            setIsOverLimit(details.isOverLimit === true)
          }}
        />
        <Field.ErrorMessage>{error}</Field.ErrorMessage>
      </Field.Root>
      <Button type="submit" className="kv-button--primary">
        {texts.send}
      </Button>
    </form>
  )
}
