'use client'
import { Button, Field, Icon, InputGroup } from '@kvirn-ui/react'
import { useRef, useState } from 'react'
import { useInputGroupTexts } from './texts.ts'
import { InEnglishWhenFallback } from '../../components/example-language.tsx'

export function SearchWithClear() {
  const { texts, isFallback } = useInputGroupTexts()
  const inputRef = useRef<HTMLInputElement>(null)
  const [value, setValue] = useState('')
  return (
    <InEnglishWhenFallback isFallback={isFallback}>
      <Field.Root>
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
    </InEnglishWhenFallback>
  )
}
