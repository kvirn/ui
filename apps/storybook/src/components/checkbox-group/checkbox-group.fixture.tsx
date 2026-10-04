import { Button, Checkbox, CheckboxGroup, Field } from '@kvirn-ui/react'
import { useState } from 'react'
import { choiceTextsFor } from '../form/choice.fixture.tsx'
import type { FormLocale } from '../form/form.fixture.tsx'

// Fixtures for Components/Form/CheckboxGroup. Each function is one example, and the story's "Show
// code" prints it (`showSource`), so it reads the way an adopter writes it: the real parts and
// props, with the localised text taken at the top. KvirnUI holds no form state and nothing here
// validates.

/**
 * Controlled by your form state. This `useState` stands in for TanStack Form, React Hook Form or
 * your own reducer: the group checks the boxes whose value is in `value`, and calls
 * `onValueChange(next, { reason: 'input', event })` with the array to store. It never stores it.
 */
export function ControlledContactGroup({ locale }: { locale: FormLocale }) {
  const { text, lang } = choiceTextsFor(locale)
  const [value, setValue] = useState<string[]>(['email'])
  return (
    <div className="kv-story-form" lang={lang}>
      <CheckboxGroup.Root name="contact" value={value} onValueChange={setValue}>
        <CheckboxGroup.Legend>{text.contactLegend}</CheckboxGroup.Legend>
        <CheckboxGroup.Prose>
          <p>{text.contactHint}</p>
        </CheckboxGroup.Prose>
        <Field.Root>
          <Checkbox value="email" />
          <Field.Label>{text.contactEmail}</Field.Label>
        </Field.Root>
        <Field.Root>
          <Checkbox value="text" />
          <Field.Label>{text.contactText}</Field.Label>
        </Field.Root>
        <Field.Root>
          <Checkbox value="letter" />
          <Field.Label>{text.contactLetter}</Field.Label>
        </Field.Root>
      </CheckboxGroup.Root>
      <p className="kv-story-form-output" data-testid="mirror">
        {text.youChose}: {value.join(', ')}
      </p>
    </div>
  )
}

/**
 * A plain `<form>`: no `value` and no handlers, only `defaultValue` and `name`. The checkboxes are
 * uncontrolled, and the form's `FormData` has every checked value under the group's name.
 * `noValidate` keeps the browser's own validation bubbles from replacing your messages.
 */
export function ContactForm({ locale }: { locale: FormLocale }) {
  const { text, lang } = choiceTextsFor(locale)
  const [sent, setSent] = useState<string[] | undefined>()
  return (
    <form
      className="kv-story-form"
      lang={lang}
      noValidate
      onSubmit={(event) => {
        event.preventDefault()
        setSent(new FormData(event.currentTarget).getAll('contact').map(String))
      }}
    >
      <CheckboxGroup.Root name="contact" defaultValue={['text']}>
        <CheckboxGroup.Legend>{text.contactLegend}</CheckboxGroup.Legend>
        <CheckboxGroup.Prose>
          <p>{text.contactHint}</p>
        </CheckboxGroup.Prose>
        <Field.Root>
          <Checkbox value="email" />
          <Field.Label>{text.contactEmail}</Field.Label>
        </Field.Root>
        <Field.Root>
          <Checkbox value="text" />
          <Field.Label>{text.contactText}</Field.Label>
        </Field.Root>
        <Field.Root>
          <Checkbox value="letter" />
          <Field.Label>{text.contactLetter}</Field.Label>
        </Field.Root>
      </CheckboxGroup.Root>
      <div className="kv-button-group">
        <Button type="submit" className="kv-button--primary">
          {text.send}
        </Button>
      </div>
      {sent === undefined ? null : (
        <p className="kv-story-form-output" data-testid="sent">
          {text.sent}: {sent.join(', ')}
        </p>
      )}
    </form>
  )
}
