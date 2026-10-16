// kv-lang-ok-file: per-locale story texts: the toolbar locale selects the sv, fi, nb, nn or en table
import { Button, checks, Field, masks, TextInput } from '@kvirn-ui/react'
import type { ComponentProps } from 'react'
import { useState } from 'react'
import type { FormLocale } from '../form/form.fixture.tsx'
import { maskTextsFor } from './mask.fixture.tsx'
import type { MaskLocale } from './mask.fixture.tsx'

// Story fixture for the per-family Mask stories. The labels, hints and errors that every family
// shares come from mask.fixture.tsx; only the date, card and time texts are written here. Every
// field shows what the mask hands your form: the displayed text, the unmasked value and whether
// the shape is complete. The checks run on submit, never while typing.

interface FamilyTexts {
  date: string
  dateHint: (example: string) => string
  dateRange: string
  card: string
  cardHint: string
  time: string
  timeHint: string
  minimum: string
  maximum: string
}

const familyTexts: Record<MaskLocale, FamilyTexts> = {
  sv: {
    date: 'Födelsedatum',
    dateHint: (example) => `Skriv datumet i ordningen för språket, till exempel ${example}.`,
    dateRange: 'Datumet ligger utanför det tillåtna intervallet.',
    card: 'Kortnummer',
    cardHint: 'Sexton siffror, till exempel 4111 1111 1111 1111. Mellanrummen sätts ut åt dig.',
    time: 'Klockslag',
    timeHint: 'Fyra siffror, till exempel 0830. Kolonet sätts ut åt dig.',
    minimum: 'Tidigast',
    maximum: 'Senast',
  },
  nb: {
    date: 'Fødselsdato',
    dateHint: (example) => `Skriv datoen i rekkefølgen for språket, for eksempel ${example}.`,
    dateRange: 'Datoen ligger utenfor det tillatte intervallet.',
    card: 'Kortnummer',
    cardHint: 'Seksten siffer, for eksempel 4111 1111 1111 1111. Mellomrommene settes inn for deg.',
    time: 'Klokkeslett',
    timeHint: 'Fire siffer, for eksempel 0830. Kolonet settes inn for deg.',
    minimum: 'Tidligst',
    maximum: 'Senest',
  },
  nn: {
    date: 'Fødselsdato',
    dateHint: (example) => `Skriv datoen i rekkjefølgja for språket, til dømes ${example}.`,
    dateRange: 'Datoen ligg utanfor det tillatne intervallet.',
    card: 'Kortnummer',
    cardHint: 'Seksten siffer, til dømes 4111 1111 1111 1111. Mellomromma blir sette inn for deg.',
    time: 'Klokkeslett',
    timeHint: 'Fire siffer, til dømes 0830. Kolonet blir sett inn for deg.',
    minimum: 'Tidlegast',
    maximum: 'Seinast',
  },
  en: {
    date: 'Date of birth',
    dateHint: (example) => `Write the date in the order of the language, for example ${example}.`,
    dateRange: 'The date is outside the allowed range.',
    card: 'Card number',
    cardHint: 'Sixteen digits, for example 4111 1111 1111 1111. The spaces are added for you.',
    time: 'Time',
    timeHint: 'Four digits, for example 0830. The colon is added for you.',
    minimum: 'Earliest',
    maximum: 'Latest',
  },
}

export const familyTextsFor = (locale: FormLocale): FamilyTexts =>
  familyTexts[maskTextsFor({ locale }).locale]

type FamilyOutcome = { isValid: boolean; reason: string | undefined }

interface FamilyEntry {
  name: string
  label: string
  hint: string
  mask: ComponentProps<typeof TextInput>['mask']
  autoComplete: string
  className: string
  type?: 'tel'
  /** Called on submit with the displayed text and the unmasked value. */
  check?: (displayed: string, unmasked: string) => FamilyOutcome
}

interface FamilyState {
  value: string
  unmasked: string
  isComplete: boolean
}

function FamilyForm({ locale, entries }: { locale: FormLocale; entries: FamilyEntry[] }) {
  const { text } = maskTextsFor({ locale })
  const family = familyTextsFor(locale)
  const [states, setStates] = useState<Record<string, FamilyState>>({})
  const [errors, setErrors] = useState<Record<string, string | undefined>>({})
  const [isChecked, setIsChecked] = useState(false)
  const reasons: Record<string, string> = {
    format: text.checkFormatGeneric,
    date: text.checkDate,
    checkDigit: text.checkControl,
    country: text.checkCountry,
    range: family.dateRange,
  }
  return (
    <form
      className="kv-story-form"
      noValidate
      onSubmit={(event) => {
        event.preventDefault()
        const next: Record<string, string | undefined> = {}
        for (const entry of entries) {
          const state = states[entry.name]
          const outcome = entry.check?.(state?.value ?? '', state?.unmasked ?? '')
          next[entry.name] =
            outcome === undefined || outcome.isValid
              ? undefined
              : (reasons[outcome.reason ?? 'format'] ?? text.checkFormatGeneric)
        }
        setErrors(next)
        setIsChecked(true)
      }}
    >
      {entries.map((entry) => {
        const state = states[entry.name]
        return (
          <Field.Root key={entry.name} required invalid={errors[entry.name] !== undefined}>
            <Field.Label>{entry.label}</Field.Label>
            <Field.Prose>
              <p>{entry.hint}</p>
            </Field.Prose>
            <TextInput
              name={entry.name}
              mask={entry.mask}
              {...(entry.type === undefined ? {} : { type: entry.type })}
              autoComplete={entry.autoComplete}
              className={entry.className}
              onValueChange={(value, details) =>
                setStates((previous) => ({
                  ...previous,
                  [entry.name]: {
                    value,
                    unmasked: details.unmaskedValue ?? '',
                    isComplete: details.isComplete === true,
                  },
                }))
              }
            />
            <p className="kv-story-form-output" data-testid={`${entry.name}-details`}>
              {text.unmasked}: {state?.unmasked ?? ''} · {text.complete}:{' '}
              {state?.isComplete === true ? text.yes : text.no}
            </p>
            <Field.ErrorMessage>{errors[entry.name]}</Field.ErrorMessage>
          </Field.Root>
        )
      })}
      <div className="kv-button-group">
        <Button type="submit" className="kv-button--primary">
          {text.send}
        </Button>
      </div>
      <p className="kv-story-form-output" data-testid="checked">
        {isChecked ? text.sent : ''}
      </p>
    </form>
  )
}

export interface DateFamilyProps {
  locale: FormLocale
  /** `page` follows the provider; any other value pins the mask's own locale. */
  dateLocale: string
  minimum: string
  maximum: string
}

/** The date mask in the page's order or a pinned one, and `checks.date` with its range on submit. */
export function DateFamilyField({ locale, dateLocale, minimum, maximum }: DateFamilyProps) {
  const { text } = maskTextsFor({ locale })
  const family = familyTextsFor(locale)
  const pinned = dateLocale === 'page' ? undefined : dateLocale
  const example = masks
    .date(pinned === undefined ? {} : { locale: pinned })
    .withLocale(maskTextsFor({ locale }).locale)
    .format('2026-10-04')
  return (
    <FamilyForm
      locale={locale}
      entries={[
        {
          name: 'date',
          label: family.date,
          hint: `${family.dateHint(example)} ${family.minimum}: ${minimum}. ${family.maximum}: ${maximum}. ${text.unmasked}: YYYY-MM-DD.`,
          // `mask="date"` follows the provider's locale; `masks.date({ locale })` keeps its own.
          mask: pinned === undefined ? 'date' : masks.date({ locale: pinned }),
          autoComplete: 'bday',
          className: 'kv-input--width-10',
          check: (_displayed, unmasked) =>
            checks.date(unmasked, {
              ...(minimum === '' ? {} : { min: minimum }),
              ...(maximum === '' ? {} : { max: maximum }),
            }),
        },
      ]}
    />
  )
}

/** Swedish, Finnish and Norwegian personal identity numbers, each with its own check reasons. */
export function PersonalIdentityNumberFamilyFields({ locale }: { locale: FormLocale }) {
  const { text } = maskTextsFor({ locale })
  return (
    <FamilyForm
      locale={locale}
      entries={[
        {
          name: 'swedish',
          label: text.personalIdentityNumber,
          hint: text.personalIdentityNumberHint,
          mask: { preset: 'personal-identity-number', country: 'SE' },
          autoComplete: 'off',
          className: 'kv-input--width-20',
          check: (displayed) => checks.personalIdentityNumber(displayed, { country: 'SE' }),
        },
        {
          name: 'finnish',
          label: text.personalIdentityNumberFi,
          hint: text.personalIdentityNumberFiHint,
          mask: { preset: 'personal-identity-number', country: 'FI' },
          autoComplete: 'off',
          className: 'kv-input--width-20',
          check: (displayed) => checks.personalIdentityNumber(displayed, { country: 'FI' }),
        },
        {
          name: 'norwegian',
          label: text.personalIdentityNumberNo,
          hint: text.personalIdentityNumberNoHint,
          mask: { preset: 'personal-identity-number', country: 'NO' },
          autoComplete: 'off',
          className: 'kv-input--width-20',
          check: (displayed) => checks.personalIdentityNumber(displayed, { country: 'NO' }),
        },
      ]}
    />
  )
}

/** Swedish, Finnish and Norwegian organisation numbers. */
export function OrganisationNumberFamilyFields({ locale }: { locale: FormLocale }) {
  const { text } = maskTextsFor({ locale })
  return (
    <FamilyForm
      locale={locale}
      entries={[
        {
          name: 'swedish',
          label: text.organisationNumber,
          hint: text.organisationNumberHint,
          mask: { preset: 'organisation-number', country: 'SE' },
          autoComplete: 'off',
          className: 'kv-input--width-10',
          check: (displayed) => checks.organisationNumber(displayed, { country: 'SE' }),
        },
        {
          name: 'finnish',
          label: text.organisationNumberFi,
          hint: text.organisationNumberFiHint,
          mask: { preset: 'organisation-number', country: 'FI' },
          autoComplete: 'off',
          className: 'kv-input--width-10',
          check: (displayed) => checks.organisationNumber(displayed, { country: 'FI' }),
        },
        {
          name: 'norwegian',
          label: text.organisationNumberNo,
          hint: text.organisationNumberNoHint,
          mask: { preset: 'organisation-number', country: 'NO' },
          autoComplete: 'off',
          className: 'kv-input--width-10',
          check: (displayed) => checks.organisationNumber(displayed, { country: 'NO' }),
        },
      ]}
    />
  )
}

/** An IBAN: grouped in fours as you type, checked for its country, length and check digits. */
export function IbanFamilyField({ locale }: { locale: FormLocale }) {
  const { text } = maskTextsFor({ locale })
  return (
    <FamilyForm
      locale={locale}
      entries={[
        {
          name: 'iban',
          label: text.iban,
          hint: text.ibanHint,
          mask: 'iban',
          autoComplete: 'off',
          className: '',
          check: (displayed) => checks.iban(displayed),
        },
      ]}
    />
  )
}

/** Postal codes: the shape only, so the check is whether the field is complete. */
export function PostalCodeFamilyFields({ locale }: { locale: FormLocale }) {
  const { text } = maskTextsFor({ locale })
  return (
    <FamilyForm
      locale={locale}
      entries={[
        {
          name: 'swedish',
          label: text.postalCode,
          hint: text.postalCodeHint,
          mask: { preset: 'postal-code', country: 'SE' },
          autoComplete: 'postal-code',
          className: 'kv-input--width-6',
        },
        {
          name: 'finnish',
          label: text.postalCodeFi,
          hint: text.postalCodeFiHint,
          mask: { preset: 'postal-code', country: 'FI' },
          autoComplete: 'postal-code',
          className: 'kv-input--width-6',
        },
        {
          name: 'norwegian',
          label: text.postalCodeNo,
          hint: text.postalCodeNoHint,
          mask: { preset: 'postal-code', country: 'NO' },
          autoComplete: 'postal-code',
          className: 'kv-input--width-6',
        },
      ]}
    />
  )
}

/** A telephone number and an email address: filters, so the stored value is what was typed. */
export function ContactFamilyFields({ locale }: { locale: FormLocale }) {
  const { text } = maskTextsFor({ locale })
  return (
    <FamilyForm
      locale={locale}
      entries={[
        {
          name: 'telephone',
          label: text.telephone,
          hint: text.telephoneHint,
          mask: 'telephone',
          type: 'tel',
          autoComplete: 'tel',
          className: 'kv-input--width-20',
        },
        {
          name: 'email',
          label: text.email,
          hint: text.emailHint,
          mask: 'email',
          autoComplete: 'email',
          className: '',
        },
      ]}
    />
  )
}

/** Card and time: no preset, so each is a pattern. The literals are written as you type. */
export function PatternFamilyFields({ locale }: { locale: FormLocale }) {
  const family = familyTextsFor(locale)
  return (
    <FamilyForm
      locale={locale}
      entries={[
        {
          name: 'card',
          label: family.card,
          hint: family.cardHint,
          mask: {
            pattern: '9999 9999 9999 9999',
            attributes: { inputMode: 'numeric', dir: 'ltr' },
          },
          autoComplete: 'cc-number',
          className: 'kv-input--width-20',
        },
        {
          name: 'time',
          label: family.time,
          hint: family.timeHint,
          mask: { pattern: '99:99', attributes: { inputMode: 'numeric', dir: 'ltr' } },
          autoComplete: 'off',
          className: 'kv-input--width-6',
        },
      ]}
    />
  )
}
