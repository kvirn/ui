import { Button, Field, Fieldset, RadioGroup } from '@kvirn-ui/react'
import { useId, useState } from 'react'
import { choiceTextsFor } from '../form/choice.fixture.tsx'
import type { FormLocale } from '../form/form.fixture.tsx'

// Fixtures for Components/Form/RadioGroup. Each function is one example, and the story's "Show
// code" prints it (`showSource`), so it reads the way an adopter writes it: the real parts and
// props, with the localised text taken at the top. KvirnUI holds no form state and nothing here
// validates.

/**
 * Controlled by your form state. This `useState` stands in for TanStack Form, React Hook Form or
 * your own reducer: the group checks the radio whose value equals `value` (`null` for none), and
 * calls `onValueChange(value, { reason: 'input', event })`. It never stores it.
 */
export function ControlledDurationGroup({ locale }: { locale: FormLocale }) {
  const { text, lang } = choiceTextsFor(locale)
  const [value, setValue] = useState<string | null>('6')
  // Radios that share a name are one group for the whole document, so a Docs page with several
  // groups needs a name each. In your own form, a plain `name="duration"` is enough.
  const name = `duration-${useId()}`
  return (
    <div className="kv-story-form" lang={lang}>
      <RadioGroup.Root name={name} value={value} onValueChange={setValue}>
        <RadioGroup.Legend>{text.durationLegend}</RadioGroup.Legend>
        <RadioGroup.Prose>
          <p>{text.durationHint}</p>
        </RadioGroup.Prose>
        <Field.Root>
          <RadioGroup.Radio value="1" />
          <Field.Label>{text.duration1}</Field.Label>
        </Field.Root>
        <Field.Root>
          <RadioGroup.Radio value="6" />
          <Field.Label>{text.duration6}</Field.Label>
        </Field.Root>
        <Field.Root>
          <RadioGroup.Radio value="12" />
          <Field.Label>{text.duration12}</Field.Label>
        </Field.Root>
      </RadioGroup.Root>
      <p className="kv-story-form-output" data-testid="mirror">
        {text.youChose}: {value}
      </p>
    </div>
  )
}

/**
 * A plain `<form>`: no `value` and no handlers, only `defaultValue` and `name`. The radios are
 * uncontrolled, and the form's `FormData` has the checked value under the group's name.
 * `noValidate` keeps the browser's own validation bubbles from replacing your messages.
 */
export function DurationForm({ locale }: { locale: FormLocale }) {
  const { text, lang } = choiceTextsFor(locale)
  const name = `duration-${useId()}`
  const [sent, setSent] = useState<string | undefined>()
  return (
    <form
      className="kv-story-form"
      lang={lang}
      noValidate
      onSubmit={(event) => {
        event.preventDefault()
        const value = new FormData(event.currentTarget).get(name)
        setSent(typeof value === 'string' ? value : '–')
      }}
    >
      <RadioGroup.Root name={name} defaultValue="1">
        <RadioGroup.Legend>{text.durationLegend}</RadioGroup.Legend>
        <RadioGroup.Prose>
          <p>{text.durationHint}</p>
        </RadioGroup.Prose>
        <Field.Root>
          <RadioGroup.Radio value="1" />
          <Field.Label>{text.duration1}</Field.Label>
        </Field.Root>
        <Field.Root>
          <RadioGroup.Radio value="6" />
          <Field.Label>{text.duration6}</Field.Label>
        </Field.Root>
        <Field.Root>
          <RadioGroup.Radio value="12" />
          <Field.Label>{text.duration12}</Field.Label>
        </Field.Root>
      </RadioGroup.Root>
      <div className="kv-button-group">
        <Button type="submit" className="kv-button--primary">
          {text.send}
        </Button>
      </div>
      {sent === undefined ? null : (
        <p className="kv-story-form-output" data-testid="sent">
          {text.sent}: {sent}
        </p>
      )}
    </form>
  )
}

/**
 * Controlled, with nothing chosen yet: `value={null}`. A question the person hasn't answered
 * shouldn't look answered, so nothing is pre-selected. The group stays controlled: it shows the
 * `value` it is given, and calls `onValueChange(value, { reason: 'input', event })` once a radio is
 * chosen.
 */
export function ControlledEmptyDurationGroup({ locale }: { locale: FormLocale }) {
  const { text, lang } = choiceTextsFor(locale)
  const [value, setValue] = useState<string | null>(null)
  // Radios that share a name are one group for the whole document, so a Docs page with several
  // groups needs a name each. In your own form, a plain `name="duration"` is enough.
  const name = `duration-${useId()}`
  return (
    <div className="kv-story-form" lang={lang}>
      <RadioGroup.Root name={name} value={value} onValueChange={setValue}>
        <RadioGroup.Legend>{text.durationLegend}</RadioGroup.Legend>
        <RadioGroup.Prose>
          <p>{text.durationHint}</p>
        </RadioGroup.Prose>
        <Field.Root>
          <RadioGroup.Radio value="1" />
          <Field.Label>{text.duration1}</Field.Label>
        </Field.Root>
        <Field.Root>
          <RadioGroup.Radio value="6" />
          <Field.Label>{text.duration6}</Field.Label>
        </Field.Root>
        <Field.Root>
          <RadioGroup.Radio value="12" />
          <Field.Label>{text.duration12}</Field.Label>
        </Field.Root>
      </RadioGroup.Root>
      <p className="kv-story-form-output" data-testid="mirror">
        {text.youChose}: {value ?? '–'}
      </p>
    </div>
  )
}

/**
 * Radios without a RadioGroup: each `RadioGroup.Radio` takes its own `name`, `value` and
 * `checked`, inside a `Fieldset` that names the question. A controlled radio carries `data-state`
 * (`checked` or `unchecked`) and never `aria-invalid`. Use `RadioGroup.Root` instead whenever you
 * can: it shares the name and the value for you.
 */
export function StandaloneDurationRadios({ locale }: { locale: FormLocale }) {
  const { text, lang } = choiceTextsFor(locale)
  const [value, setValue] = useState('6')
  const name = `standalone-duration-${useId()}`
  return (
    <Fieldset.Root group required lang={lang}>
      <Fieldset.Legend>{text.durationLegend}</Fieldset.Legend>
      <Field.Root>
        <RadioGroup.Radio
          name={name}
          value="1"
          checked={value === '1'}
          onChange={() => {
            setValue('1')
          }}
        />
        <Field.Label>{text.duration1}</Field.Label>
      </Field.Root>
      <Field.Root>
        <RadioGroup.Radio
          name={name}
          value="6"
          checked={value === '6'}
          onChange={() => {
            setValue('6')
          }}
        />
        <Field.Label>{text.duration6}</Field.Label>
      </Field.Root>
      <Field.Root>
        <RadioGroup.Radio
          name={name}
          value="12"
          checked={value === '12'}
          onChange={() => {
            setValue('12')
          }}
        />
        <Field.Label>{text.duration12}</Field.Label>
      </Field.Root>
    </Fieldset.Root>
  )
}
