import { Button, Field, Icon, InputGroup } from '@kvirn-ui/react'
import { useRef, useState } from 'react'
import { textsFor } from '../form/form.fixture.tsx'
import type { FormLocale } from '../form/form.fixture.tsx'

// Fixtures for Components/Form/InputGroup. Each function is one example, and the story's "Show
// code" prints it (`showSource`), so it reads the way an adopter writes it: the real parts and
// props, with the localised text taken at the top. KvirnUI holds no form state: the value of a
// search lives in the `useState` below, where your form library's state would live.

/**
 * A search with a start icon and a clear Button at the end. The Button renders only while there
 * is a value, and clearing moves focus to the Input, so focus never lands on the body when the
 * Button goes away. Nothing is announced: the focused, empty Input is read as such.
 */
export function SearchBoxWithClear({
  locale,
  initialValue = '',
  disabled,
}: {
  locale: FormLocale
  initialValue?: string
  disabled?: boolean
}) {
  const { text, lang } = textsFor(locale)
  const [value, setValue] = useState(initialValue)
  const inputRef = useRef<HTMLInputElement | null>(null)
  return (
    <Field.Root disabled={disabled} lang={lang}>
      <Field.Label marker="none">{text.searchServices}</Field.Label>
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
            disabled={disabled}
            onClick={() => {
              setValue('')
              inputRef.current?.focus()
            }}
          >
            {text.searchClear}
          </Button>
        )}
      </InputGroup.Root>
    </Field.Root>
  )
}

/**
 * The icon-only clear Button, for staff tools and compact density: a button, not a form control,
 * so its name is an `aria-label` from your translations.
 */
export function SearchBoxWithIconOnlyClear({
  locale,
  initialValue = '',
}: {
  locale: FormLocale
  initialValue?: string
}) {
  const { text, lang } = textsFor(locale)
  const [value, setValue] = useState(initialValue)
  const inputRef = useRef<HTMLInputElement | null>(null)
  return (
    <Field.Root lang={lang}>
      <Field.Label marker="none">{text.searchServices}</Field.Label>
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
            className="kv-button--icon-only"
            aria-label={text.searchClearName}
            onClick={() => {
              setValue('')
              inputRef.current?.focus()
            }}
          >
            <Icon name="close" size="20" />
          </Button>
        )}
      </InputGroup.Root>
    </Field.Root>
  )
}
