import { Button, Field, masks, TextInput } from '@kvirn-ui/react'
import type { TextInputChangeDetails } from '@kvirn-ui/react'
import { useState } from 'react'
import { dateTextsFor } from '../date-input/date-input.fixture.tsx'
import { textsFor } from '../form/form.fixture.tsx'
import type { FormLocale } from '../form/form.fixture.tsx'
import { maskTextsFor } from '../mask/mask.fixture.tsx'

// Fixtures for Components/Form/TextInput. Each function is one example, and the story's "Show
// code" prints it (`showSource`), so it reads the way an adopter writes it: the real parts and
// props, with the localised text taken at the top. KvirnUI holds no form state and nothing here
// validates. Every masked field has a help text that says the format with an example (3.3.2).

/**
 * Controlled: the value lives in this `useState`, where your form library's state would live.
 * TextInput renders the `value` it's given and reports changes through `onValueChange`.
 */
export function ControlledName({ locale }: { locale: FormLocale }) {
  const { text, lang } = textsFor(locale)
  const [value, setValue] = useState('')
  return (
    <div className="kv-story-form" lang={lang}>
      <Field.Root required>
        <Field.Label>{text.name}</Field.Label>
        <TextInput name="name" autoComplete="name" value={value} onValueChange={setValue} />
      </Field.Root>
      <p className="kv-story-form-output">
        {text.youTyped}: {value}
      </p>
    </div>
  )
}

/**
 * A plain `<form>`: no `value` and no handlers. Each TextInput is uncontrolled, and the form's
 * `FormData` has what was typed, by `name`. `noValidate` keeps the browser's own validation
 * bubbles from replacing your messages.
 */
export function NameAndEmailForm({ locale }: { locale: FormLocale }) {
  const { text, lang } = textsFor(locale)
  const [sent, setSent] = useState<string | undefined>()
  return (
    <form
      className="kv-story-form"
      lang={lang}
      noValidate
      onSubmit={(event) => {
        event.preventDefault()
        const data = new FormData(event.currentTarget)
        setSent(
          [data.get('name'), data.get('email')]
            .filter((value) => typeof value === 'string')
            .join(', '),
        )
      }}
    >
      <Field.Root required>
        <Field.Label>{text.name}</Field.Label>
        <TextInput name="name" autoComplete="name" />
      </Field.Root>
      <Field.Root required>
        <Field.Label>{text.email}</Field.Label>
        <TextInput name="email" type="email" autoComplete="email" />
      </Field.Root>
      <div className="kv-button-group">
        <Button type="submit" className="kv-button--primary">
          {text.send}
        </Button>
      </div>
      {sent === undefined ? null : (
        <p className="kv-story-form-output">
          {text.sent}: {sent}
        </p>
      )}
    </form>
  )
}

/**
 * A Swedish personal identity number, by name: the country comes from the provider (`sv` is Sweden). Ten or twelve digits, with or without the hyphen. The mask
 * puts the hyphen in. The help text says the format, because the mask doesn't.
 */
export function PersonalIdentityNumberField({ locale }: { locale: FormLocale }) {
  const { text, lang } = maskTextsFor({ locale })
  return (
    <Field.Root required lang={lang}>
      <Field.Label>{text.personalIdentityNumber}</Field.Label>
      <TextInput
        name="personalIdentityNumber"
        mask="personal-identity-number"
        autoComplete="off"
        className="kv-input--width-20"
      />
      <Field.HelpText>{text.personalIdentityNumberHint}</Field.HelpText>
    </Field.Root>
  )
}

/** A Swedish postcode: text, so the space is inserted as the user types past it. */
export function PostcodeField({ locale }: { locale: FormLocale }) {
  const { text, lang } = maskTextsFor({ locale })
  return (
    <Field.Root required lang={lang}>
      <Field.Label>{text.postalCode}</Field.Label>
      <TextInput
        name="postalCode"
        mask="postal-code"
        autoComplete="postal-code"
        className="kv-input--width-6"
      />
      <Field.HelpText>{text.postalCodeHint}</Field.HelpText>
    </Field.Root>
  )
}

/**
 * The explicit form of the same mask: `masks.postalCode({ country })` builds it with no help
 * from the provider's locale. Prefer the name (`mask="postal-code"`), and use this where you
 * build masks outside React, or want the type of the mask itself.
 */
export function ExplicitPostcodeField({ locale }: { locale: FormLocale }) {
  const { text, lang } = maskTextsFor({ locale })
  return (
    <Field.Root required lang={lang}>
      <Field.Label>{text.postalCode}</Field.Label>
      <TextInput
        name="postalCode"
        mask={masks.postalCode({ country: 'SE' })}
        autoComplete="postal-code"
        className="kv-input--width-6"
      />
      <Field.HelpText>{text.postalCodeHint}</Field.HelpText>
    </Field.Root>
  )
}

/**
 * A date in one field. `masks.date()` follows the provider's locale for the order and the
 * separator. The help text's example comes from the field's own mask, with a day above 12 so the order
 * is clear, and so the help text and the field never disagree.
 */
export function StartDateField({ locale }: { locale: FormLocale }) {
  const { text, lang } = dateTextsFor(locale)
  const example = masks.date().withLocale(locale).format('2026-10-27')
  return (
    <Field.Root required lang={lang}>
      <Field.Label>{text.oneFieldLabel}</Field.Label>
      <TextInput
        name="start"
        mask={masks.date()}
        autoComplete="off"
        className="kv-input--width-10"
      />
      <Field.HelpText>{text.oneFieldHint(example)}</Field.HelpText>
    </Field.Root>
  )
}

/**
 * A reference number is a code, not a quantity: `masks.digits()` keeps the leading zeros that a
 * number would drop. For an amount or a quantity, use NumberInput.
 */
export function ReferenceNumberField({ locale }: { locale: FormLocale }) {
  const { text, lang } = textsFor(locale)
  return (
    <Field.Root required lang={lang}>
      <Field.Label>{text.caseNumber}</Field.Label>
      <TextInput
        name="caseNumber"
        mask={masks.digits()}
        autoComplete="off"
        defaultValue="004512"
        className="kv-input--width-6 kv-input--numeric"
      />
      <Field.HelpText>{text.caseNumberHint}</Field.HelpText>
    </Field.Root>
  )
}

/**
 * A masked value you control, and everything `onValueChange` reports: the unmasked value, whether
 * the shape is complete and the characters the mask dropped (`rejected`). The mask's own
 * announcement is off (`announceRejections={false}`) because this field says it in its own words,
 * in a live region that is on the page before the message.
 */
export function ChangeDetailsField({ locale }: { locale: FormLocale }) {
  const { text, lang } = maskTextsFor({ locale })
  const [value, setValue] = useState('')
  const [details, setDetails] = useState<TextInputChangeDetails | undefined>(undefined)
  const rejected = details?.rejected ?? []
  return (
    <Field.Root required lang={lang}>
      <Field.Label>{text.digits}</Field.Label>
      <TextInput
        name="code"
        mask={masks.digits({ length: 6 })}
        announceRejections={false}
        autoComplete="off"
        className="kv-input--width-10"
        value={value}
        onValueChange={(next, nextDetails) => {
          setValue(next)
          setDetails(nextDetails)
        }}
      />
      <Field.HelpText>{text.digitsHint}</Field.HelpText>
      <output className="kv-story-form-output" data-testid="own-message">
        {rejected.some(({ reason }) => reason === 'digits') ? text.ownRejection : ''}
      </output>
      <p className="kv-story-form-output" data-testid="details">
        {text.rejected}:{' '}
        {rejected.map(({ characters, reason }) => `${characters} (${reason})`).join(', ')} ·{' '}
        {text.unmasked}: {details?.unmaskedValue ?? ''} · {text.complete}:{' '}
        {details?.isComplete === true ? text.yes : text.no}
      </p>
    </Field.Root>
  )
}

/**
 * Your own words for the mask's announcement, for this one input: `messages` replaces
 * `characterNotAllowed` here and leaves the provider's other strings alone.
 */
export function OwnMessagesField({ locale }: { locale: FormLocale }) {
  const { text, lang } = maskTextsFor({ locale })
  return (
    <Field.Root required lang={lang}>
      <Field.Label>{text.digits}</Field.Label>
      <TextInput
        name="code"
        mask={masks.digits({ length: 6 })}
        autoComplete="off"
        className="kv-input--width-10"
        messages={{ characterNotAllowed: () => text.ownRejection }}
      />
      <Field.HelpText>{text.digitsHint}</Field.HelpText>
    </Field.Root>
  )
}

/**
 * Your own `aria-describedby` ids are kept: the Field's help text comes first, then yours. Here
 * a note that sits outside the Field, such as one that belongs to several fields.
 */
export function OwnDescribedByField({ locale }: { locale: FormLocale }) {
  const { text, lang } = maskTextsFor({ locale })
  return (
    <>
      <Field.Root required lang={lang}>
        <Field.Label>{text.caseNumber}</Field.Label>
        <TextInput name="caseNumber" autoComplete="off" aria-describedby="case-number-where" />
        <Field.HelpText>{text.caseNumberHint}</Field.HelpText>
      </Field.Root>
      <p id="case-number-where" lang={lang}>
        {text.describedByNote}
      </p>
    </>
  )
}
