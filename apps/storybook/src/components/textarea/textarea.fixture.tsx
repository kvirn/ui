import { Button, Field, Textarea } from '@kvirn-ui/react'
import { useState } from 'react'
import { textsFor } from '../form/form.fixture.tsx'
import type { FormLocale } from '../form/form.fixture.tsx'

// Fixtures for Components/Form/Textarea. Each function is one example, and the story's "Show
// code" prints it (`showSource`), so it reads the way an adopter writes it: the real parts and
// props, with the localised text taken at the top. KvirnUI holds no form state and nothing here
// validates: an invalid example sets `invalid` and writes its message itself, as your form logic
// would. sv, en, fi, nb and nn are written. se shows the English texts, marked lang="en" (3.1.2).

export interface TextareaTexts {
  /** The question. */
  label: string
  /** The description above the box: what to answer. */
  description: string
  /** The help text under the box: a short instruction. */
  hint: string
  /** The ErrorMessage, after submit with nothing written. */
  error: string
  /** A first draft, for the examples that start with a text. */
  draft: string
  /** One sentence, repeated to make a text of any length. */
  sentence: string
  /** The help text under a read-only box: why it can't change. */
  readOnlyHint: string
  /** A long label, for the 320px check. */
  longLabel: string
  /** The ErrorMessage of the example whose text is over the limit. */
  errorTooLong: (limit: number) => string
}

const textsEn: TextareaTexts = {
  label: 'Describe your situation',
  description: 'Tell us what has happened and what you need help with.',
  hint: 'You can reply in Swedish, Finnish or English.',
  error: 'Describe your situation',
  draft: 'I received a letter about my housing allowance and I do not understand what to do.',
  sentence: 'I need help with my application. ',
  readOnlyHint: 'You can’t change the description here.',
  longLabel:
    'Reasons for your housing adaptation grant application and a description of your current housing situation',
  errorTooLong: (limit) => `The description can be at most ${limit} characters. Remove some text.`,
}

const textsSv: TextareaTexts = {
  label: 'Beskriv din situation',
  description: 'Berätta vad som har hänt och vad du behöver hjälp med.',
  hint: 'Du kan svara på svenska, finska eller engelska.',
  error: 'Beskriv din situation',
  draft: 'Jag har fått ett brev om mitt bostadsbidrag och förstår inte vad jag ska göra.',
  sentence: 'Jag behöver hjälp med min ansökan. ',
  readOnlyHint: 'Du kan inte ändra beskrivningen här.',
  longLabel:
    'Skälen till din ansökan om bostadsanpassningsbidrag och en beskrivning av hur du bor i dag',
  errorTooLong: (limit) => `Beskrivningen kan vara högst ${limit} tecken. Ta bort lite text.`,
}

/** Designer drafts for length checks, to be reviewed by a native speaker. */
const textsFi: TextareaTexts = {
  label: 'Kuvaile tilanteesi',
  description: 'Kerro, mitä on tapahtunut ja missä tarvitset apua.',
  hint: 'Voit vastata ruotsiksi, suomeksi tai englanniksi.',
  error: 'Kuvaile tilanteesi',
  draft: 'Sain kirjeen asumistuestani enkä ymmärrä, mitä minun pitäisi tehdä.',
  sentence: 'Tarvitsen apua hakemukseni kanssa. ',
  readOnlyHint: 'Kuvausta ei voi muuttaa täällä.',
  // Soft hyphens (U+00AD) in the long compound: Chromium has no Finnish hyphenation dictionary.
  longLabel:
    'Asunnon­muutostyö­avustus­hakemuksen perustelut ja kuvaus nykyisestä asumistilanteestasi',
  errorTooLong: (limit) => `Kuvaus voi olla enintään ${limit} merkkiä pitkä. Poista tekstiä.`,
}

const textsNb: TextareaTexts = {
  label: 'Beskriv situasjonen din',
  description: 'Fortell hva som har skjedd og hva du trenger hjelp til.',
  hint: 'Du kan svare på norsk, svensk eller engelsk.',
  error: 'Beskriv situasjonen din',
  draft: 'Jeg har fått et brev om bostøtten min og forstår ikke hva jeg skal gjøre.',
  sentence: 'Jeg trenger hjelp med søknaden min. ',
  readOnlyHint: 'Du kan ikke endre beskrivelsen her.',
  longLabel:
    'Begrunnelsen for søknaden din om tilskudd til tilpasning av bolig og en beskrivelse av boforholdet ditt',
  errorTooLong: (limit) => `Beskrivelsen kan være maks ${limit} tegn. Fjern litt tekst.`,
}

const textsNn: TextareaTexts = {
  label: 'Skriv om situasjonen din',
  description: 'Fortel kva som har hendt og kva du treng hjelp til.',
  hint: 'Du kan svare på nynorsk, bokmål eller engelsk.',
  error: 'Skriv om situasjonen din',
  draft: 'Eg har fått eit brev om bustønaden min og forstår ikkje kva eg skal gjere.',
  sentence: 'Eg treng hjelp med søknaden min. ',
  readOnlyHint: 'Du kan ikkje endre skildringa her.',
  longLabel:
    'Grunngjevinga for søknaden din om tilskot til tilpassing av bustad og ei skildring av bustadsituasjonen din',
  errorTooLong: (limit) => `Skildringa kan vere maks ${limit} teikn. Fjern litt tekst.`,
}

/** se has no texts: it shows the English ones, marked lang="en". */
const textareaTexts: Record<FormLocale, TextareaTexts | undefined> = {
  sv: textsSv,
  fi: textsFi,
  nb: textsNb,
  nn: textsNn,
  se: undefined,
  en: textsEn,
}

/** The fixture text in a locale, or the English text with `lang="en"` for se (3.1.2). */
export function textareaTextsFor(locale: FormLocale): {
  text: TextareaTexts
  lang: 'en' | undefined
} {
  const text = textareaTexts[locale]
  return { text: text ?? textsEn, lang: text === undefined ? 'en' : undefined }
}

/** A text of exactly `length` characters, made of repeated sentences. */
export function textOfLength(sentence: string, length: number): string {
  return sentence.repeat(Math.ceil(length / sentence.length)).slice(0, length)
}

/**
 * A plain `<form>` with one Textarea and a submit button: the fixture the keyboard tests drive.
 * Enter is a line break and never submits. The form's `FormData` has the text by `name` on
 * submit. `noValidate` keeps the browser's own validation bubbles from replacing your messages.
 */
export function SituationForm({ locale }: { locale: FormLocale }) {
  const { text, lang } = textareaTextsFor(locale)
  const { text: formText } = textsFor(locale)
  const [sent, setSent] = useState<string | undefined>()
  return (
    <form
      className="kv-story-form"
      lang={lang}
      noValidate
      onSubmit={(event) => {
        event.preventDefault()
        const situation = new FormData(event.currentTarget).get('situation')
        setSent(typeof situation === 'string' ? situation : '')
      }}
    >
      <Field.Root required>
        <Field.Label>{text.label}</Field.Label>
        <Field.Prose>
          <p>{text.description}</p>
        </Field.Prose>
        <Textarea name="situation" />
      </Field.Root>
      <div className="kv-button-group">
        <Button type="submit" className="kv-button--primary">
          {formText.send}
        </Button>
      </div>
      {sent === undefined ? null : (
        <p className="kv-story-form-output" data-testid="sent">
          {formText.sent}: {sent}
        </p>
      )}
    </form>
  )
}

/**
 * Controlled: the value lives in this `useState`, where your form library's state would live.
 * Textarea renders the `value` it's given and reports changes through `onValueChange`.
 */
export function ControlledSituation({ locale }: { locale: FormLocale }) {
  const { text, lang } = textareaTextsFor(locale)
  const { text: formText } = textsFor(locale)
  const [value, setValue] = useState('')
  return (
    <div className="kv-story-form" lang={lang}>
      <Field.Root required>
        <Field.Label>{text.label}</Field.Label>
        <Textarea name="situation" value={value} onValueChange={setValue} />
      </Field.Root>
      <p className="kv-story-form-output">
        {formText.youTyped}: {value}
      </p>
    </div>
  )
}

/**
 * A count of the characters left: `characterCount` with `maxLength`. The limit is not written as
 * the native `maxlength`, so a pasted text is kept whole and the count says how many characters
 * are over. Over the limit is a warning: your form decides on submit.
 */
export function CountedSituation({ locale }: { locale: FormLocale }) {
  const { text, lang } = textareaTextsFor(locale)
  return (
    <div className="kv-story-form" lang={lang}>
      <Field.Root required>
        <Field.Label>{text.label}</Field.Label>
        <Field.Prose>
          <p>{text.description}</p>
        </Field.Prose>
        <Textarea name="situation" maxLength={200} characterCount />
        <Field.HelpText>{text.hint}</Field.HelpText>
      </Field.Root>
    </div>
  )
}

/**
 * The count under, near and over the limit. Near is from 80%: the count is announced when
 * typing pauses. Over is a warning with an icon and weight, never colour alone. On submit, the
 * form writes the error that names the fix.
 */
export function CountStates({ locale }: { locale: FormLocale }) {
  const { text, lang } = textareaTextsFor(locale)
  return (
    <div className="kv-story-form" lang={lang}>
      <Field.Root>
        <Field.Label>{`${text.label} (under)`}</Field.Label>
        <Textarea name="under" maxLength={200} characterCount defaultValue={text.draft} />
      </Field.Root>
      <Field.Root>
        <Field.Label>{`${text.label} (near)`}</Field.Label>
        <Textarea
          name="near"
          maxLength={200}
          characterCount
          defaultValue={textOfLength(text.sentence, 170)}
        />
      </Field.Root>
      <Field.Root invalid>
        <Field.Label>{`${text.label} (over)`}</Field.Label>
        <Textarea
          name="over"
          maxLength={200}
          characterCount
          defaultValue={textOfLength(text.sentence, 212)}
        />
        <Field.ErrorMessage>{text.errorTooLong(200)}</Field.ErrorMessage>
      </Field.Root>
    </div>
  )
}

/**
 * Every state of the box in one column, in the default order (label, description, box, count,
 * help text, error): a description above, invalid, over the limit, disabled and read-only with its
 * help text under the box. The RTL and ForcedColors stories render it.
 */
export function TextareaStates({ locale }: { locale: FormLocale }) {
  const { text, lang } = textareaTextsFor(locale)
  return (
    <div className="kv-story-form" lang={lang}>
      <Field.Root required>
        <Field.Label>{text.label}</Field.Label>
        <Field.Prose>
          <p>{text.description}</p>
        </Field.Prose>
        <Textarea name="situation" maxLength={500} characterCount />
        <Field.HelpText>{text.hint}</Field.HelpText>
      </Field.Root>
      <Field.Root required invalid>
        <Field.Label>{`${text.label} (invalid)`}</Field.Label>
        <Textarea name="invalid" rows={3} />
        <Field.ErrorMessage>{text.error}</Field.ErrorMessage>
      </Field.Root>
      <Field.Root>
        <Field.Label>{`${text.label} (over)`}</Field.Label>
        <Textarea
          name="over"
          rows={3}
          maxLength={60}
          characterCount
          defaultValue={textOfLength(text.sentence, 80)}
        />
      </Field.Root>
      <Field.Root disabled>
        <Field.Label>{`${text.label} (disabled)`}</Field.Label>
        <Textarea name="disabled" rows={3} defaultValue={text.draft} />
      </Field.Root>
      <Field.Root>
        <Field.Label>{`${text.label} (read-only)`}</Field.Label>
        <Textarea name="read-only" rows={3} readOnly defaultValue={text.draft} />
        <Field.HelpText>{text.readOnlyHint}</Field.HelpText>
      </Field.Root>
    </div>
  )
}
