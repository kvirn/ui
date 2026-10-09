import {
  Button,
  Checkbox,
  CheckboxGroup,
  DateInput,
  Field,
  Fieldset,
  Heading,
  RadioGroup,
  TextInput,
  useDateInput,
} from '@kvirn-ui/react'
import { useId, useState } from 'react'
import { dateTextsFor } from '../date-input/date-input.fixture.tsx'
import { choiceTextsFor } from './choice.fixture.tsx'
import { textsFor } from './form.fixture.tsx'
import type { FormLocale } from './form.fixture.tsx'

// Story fixture for Components/Form/Overview: "Apply for a resident parking permit", a
// short form with every control (docs/design/form-fields.md §4.2, §5). sv, en, fi, nb and nn are
// written. The fi strings are the designer's drafts, for length checks only. se: English, marked
// lang="en" (3.1.2). The other strings come from the fixtures of the pages the controls live on.
//
// KvirnUI holds no form state. Nothing here validates: the `errors` variant sets `invalid` on
// the fields itself and writes the messages, as an implementor's form logic would after a submit.

export interface PermitTexts {
  heading: string
  submit: string
  submitted: string
}

const textsEn: PermitTexts = {
  heading: 'Apply for a resident parking permit',
  submit: 'Send application',
  submitted: 'Applications sent',
}

const textsSv: PermitTexts = {
  heading: 'Ansök om boendeparkeringstillstånd',
  submit: 'Skicka ansökan',
  submitted: 'Skickade ansökningar',
}

/** Designer drafts (docs/design/form-fields.md §4.2), for length checks. */
const textsFi: PermitTexts = {
  heading: 'Hae asukaspysäköintitunnusta',
  submit: 'Lähetä hakemus',
  submitted: 'Lähetetyt hakemukset',
}

const textsNb: PermitTexts = {
  heading: 'Søk om tillatelse til beboerparkering',
  submit: 'Send søknad',
  submitted: 'Sendte søknader',
}

const textsNn: PermitTexts = {
  heading: 'Søk om løyve til bebuarparkering',
  submit: 'Send søknad',
  submitted: 'Sende søknader',
}

const permitTexts: Record<FormLocale, PermitTexts | undefined> = {
  sv: textsSv,
  fi: textsFi,
  nb: textsNb,
  nn: textsNn,
  se: undefined,
  en: textsEn,
}

/** The Overview form's own strings in a locale, for the plays: the heading and the button. se shows English. */
export function permitTextsFor(locale: FormLocale): PermitTexts {
  return permitTexts[locale] ?? textsEn
}

export interface PermitFormProps {
  locale: FormLocale
  /** After a submit that failed: the name, the year, the duration and the declaration are wrong. */
  errors?: boolean
  /** Show how many times the form was submitted, under the submit button. */
  showSubmits?: boolean
}

/**
 * The Overview form: a text field with a help text, a date, a field with a description above and
 * a help text under, an email, an optional phone number, a radio group, a checkbox group, a declaration and a
 * submit button, in one column with `novalidate`. Every question is required but the phone
 * number. After a failed submit, move focus to the first invalid field.
 */
export function PermitForm({ locale, errors = false, showSubmits = false }: PermitFormProps) {
  const permit = permitTextsFor(locale)
  const { text, lang } = textsFor(locale)
  const { text: choice } = choiceTextsFor(locale)
  const { text: date } = dateTextsFor(locale)
  // The date's example is written in the order the boxes are in.
  const { order } = useDateInput()
  // Radios that share a name are one group for the whole document, so on a Docs page every
  // story's radios would act as one. A name per instance keeps the stories apart.
  const durationName = `duration-${useId()}`
  const [submits, setSubmits] = useState(0)
  return (
    <form
      className="kv-story-form"
      lang={lang}
      noValidate
      onSubmit={(event) => {
        event.preventDefault()
        setSubmits((count) => count + 1)
      }}
    >
      <Heading as="h1">{permit.heading}</Heading>

      <Field.Root required invalid={errors}>
        <Field.Label>{text.name}</Field.Label>
        <TextInput name="name" autoComplete="name" />
        <Field.ErrorMessage>{text.nameError}</Field.ErrorMessage>
      </Field.Root>

      <Fieldset.Root group required invalid={errors}>
        <Fieldset.Legend>{date.legend}</Fieldset.Legend>
        <DateInput.Root
          name="birth"
          autoComplete="bday"
          invalidParts={errors ? ['year'] : undefined}
        />
        <Fieldset.HelpText>
          {order[0] === 'year' ? date.hintYearFirst : date.hintDayFirst}
        </Fieldset.HelpText>
        <Fieldset.ErrorMessage>{date.errorYear}</Fieldset.ErrorMessage>
      </Fieldset.Root>

      <Field.Root required>
        <Field.Label>{text.registration}</Field.Label>
        <Field.Prose>
          <p>{text.registrationWhere}</p>
        </Field.Prose>
        <TextInput
          name="registration"
          autoCapitalize="characters"
          autoComplete="off"
          spellCheck={false}
          className="kv-input--width-10"
        />
        <Field.HelpText>{text.registrationHint}</Field.HelpText>
      </Field.Root>

      <Field.Root required>
        <Field.Label>{text.email}</Field.Label>
        <Field.Prose>
          <p>{text.emailHint}</p>
        </Field.Prose>
        <TextInput name="email" type="email" autoComplete="email" spellCheck={false} />
      </Field.Root>

      <Field.Root>
        <Field.Label>{text.phone}</Field.Label>
        <TextInput name="phone" type="tel" autoComplete="tel" className="kv-input--width-20" />
      </Field.Root>

      <RadioGroup.Root name={durationName} required invalid={errors}>
        <RadioGroup.Legend>{choice.durationLegend}</RadioGroup.Legend>
        <RadioGroup.Prose>
          <p>{choice.durationHint}</p>
        </RadioGroup.Prose>
        <Field.Root>
          <RadioGroup.Radio value="1" />
          <Field.Label>{choice.duration1}</Field.Label>
        </Field.Root>
        <Field.Root>
          <RadioGroup.Radio value="6" />
          <Field.Label>{choice.duration6}</Field.Label>
        </Field.Root>
        <Field.Root>
          <RadioGroup.Radio value="12" />
          <Field.Label>{choice.duration12}</Field.Label>
          <Field.HelpText>{choice.duration12Hint}</Field.HelpText>
        </Field.Root>
        <RadioGroup.ErrorMessage>{choice.durationError}</RadioGroup.ErrorMessage>
      </RadioGroup.Root>

      <CheckboxGroup.Root name="contact" required>
        <CheckboxGroup.Legend>{choice.contactLegend}</CheckboxGroup.Legend>
        <CheckboxGroup.Prose>
          <p>{choice.contactHint}</p>
        </CheckboxGroup.Prose>
        <Field.Root>
          <Checkbox value="email" />
          <Field.Label>{choice.contactEmail}</Field.Label>
        </Field.Root>
        <Field.Root>
          <Checkbox value="text" />
          <Field.Label>{choice.contactText}</Field.Label>
        </Field.Root>
        <Field.Root>
          <Checkbox value="letter" />
          <Field.Label>{choice.contactLetter}</Field.Label>
        </Field.Root>
      </CheckboxGroup.Root>

      <Field.Root required invalid={errors}>
        <Checkbox name="declaration" />
        <Field.Label>{choice.declaration}</Field.Label>
        <Field.ErrorMessage>{choice.declarationError}</Field.ErrorMessage>
      </Field.Root>

      <div className="kv-button-group">
        <Button type="submit" className="kv-button--primary">
          {permit.submit}
        </Button>
      </div>
      {showSubmits ? (
        <p className="kv-story-form-output" data-testid="submits">
          {permit.submitted}: {submits}
        </p>
      ) : null}
    </form>
  )
}
