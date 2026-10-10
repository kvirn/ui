'use client'
import { Button, Field, Icon, InputGroup } from '@kvirn-ui/react'
import { useRef, useState } from 'react'
import { useInputGroupTexts } from './texts.ts'

export function SearchWithClear() {
  const { texts, textLang } = useInputGroupTexts()
  const inputRef = useRef<HTMLInputElement>(null)
  const [value, setValue] = useState('')
  return (
    <Field.Root lang={textLang}>
      <Field.Label marker="none">{texts.searchLabel}</Field.Label>
      <InputGroup.Root>
        <InputGroup.Addon>
          <Icon name="search" size="20" />
        </InputGroup.Addon>
        <InputGroup.Input
          ref={inputRef}
          type="search"
          name="search"
          enterKeyHint="search"
          autoComplete="off"
          value={value}
          onValueChange={setValue}
        />
        {value === '' ? null : (
          <Button
            onClick={() => {
              setValue('')
              inputRef.current?.focus()
            }}
          >
            {texts.searchClear}
          </Button>
        )}
      </InputGroup.Root>
    </Field.Root>
  )
}
