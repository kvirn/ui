import { Button, Checkbox, Field } from '@kvirn-ui/react'
import { useState } from 'react'
import { choiceTextsFor } from '../form/choice.fixture.tsx'
import type { FormLocale } from '../form/form.fixture.tsx'

// Fixtures for Components/Form/Checkbox. Each function is one example, and the story's "Show
// code" prints it (`showSource`), so it reads the way an adopter writes it: the real parts and
// props, with the localised text taken at the top. KvirnUI holds no form state and nothing here
// validates.

/**
 * A "select all" box: mixed while some rows are chosen, checked once the user chooses it.
 * `indeterminate` is the DOM property the browser doesn't set for you, so you pass it from your
 * state.
 */
export function SelectAllCheckbox({ locale }: { locale: FormLocale }) {
  const { text, lang } = choiceTextsFor(locale)
  const [state, setState] = useState<'some' | 'all' | 'none'>('some')
  return (
    <Field.Root lang={lang}>
      <Checkbox
        name="all"
        checked={state === 'all'}
        indeterminate={state === 'some'}
        onCheckedChange={(checked) => setState(checked ? 'all' : 'none')}
      />
      <Field.Label marker="none">{text.selectAll}</Field.Label>
    </Field.Root>
  )
}

/**
 * Four checkboxes in a form: a plain one, a mixed "select all", a disabled one and a required
 * declaration. Tab skips the disabled box, and Space toggles the focused one.
 */
export function KeyboardForm({ locale }: { locale: FormLocale }) {
  const { text, lang } = choiceTextsFor(locale)
  const [state, setState] = useState<'some' | 'all' | 'none'>('some')
  return (
    <form className="kv-story-form" lang={lang} noValidate onSubmit={(e) => e.preventDefault()}>
      <Field.Root>
        <Checkbox name="newsletter" />
        <Field.Label marker="none">{text.newsletter}</Field.Label>
      </Field.Root>
      <Field.Root>
        <Checkbox
          name="all"
          checked={state === 'all'}
          indeterminate={state === 'some'}
          onCheckedChange={(checked) => setState(checked ? 'all' : 'none')}
        />
        <Field.Label marker="none">{text.selectAll}</Field.Label>
      </Field.Root>
      <Field.Root disabled>
        <Checkbox name="disabled" />
        <Field.Label marker="none">{text.rowOne}</Field.Label>
      </Field.Root>
      <Field.Root required>
        <Checkbox name="declaration" />
        <Field.Label>{text.declaration}</Field.Label>
      </Field.Root>
      <div className="kv-button-group">
        <Button type="submit" className="kv-button--primary">
          {text.send}
        </Button>
      </div>
    </form>
  )
}

/**
 * Controlled by your form state. This `useState` stands in for TanStack Form, React Hook Form or
 * your own reducer: Checkbox renders the `checked` it's given and calls
 * `onCheckedChange(checked, { reason: 'input', event })`. It never copies the state of its own.
 */
export function ControlledDeclaration({ locale }: { locale: FormLocale }) {
  const { text, lang } = choiceTextsFor(locale)
  const [checked, setChecked] = useState(false)
  return (
    <div className="kv-story-form" lang={lang}>
      <Field.Root required>
        <Checkbox name="declaration" checked={checked} onCheckedChange={setChecked} />
        <Field.Label>{text.declaration}</Field.Label>
      </Field.Root>
      <p className="kv-story-form-output" data-testid="mirror">
        {text.youChose}: {String(checked)}
      </p>
    </div>
  )
}

/**
 * A plain `<form>`: no `checked` and no handlers. The Checkbox is uncontrolled, the browser keeps
 * its state, and the form's `FormData` has it by `name` and `value` on submit.
 */
export function DeclarationForm({ locale }: { locale: FormLocale }) {
  const { text, lang } = choiceTextsFor(locale)
  const [sent, setSent] = useState<string | undefined>()
  return (
    <form
      className="kv-story-form"
      lang={lang}
      noValidate
      onSubmit={(event) => {
        event.preventDefault()
        const declaration = new FormData(event.currentTarget).get('declaration')
        setSent(typeof declaration === 'string' && declaration !== '' ? declaration : '–')
      }}
    >
      <Field.Root required>
        <Checkbox name="declaration" value="intygat" />
        <Field.Label>{text.declaration}</Field.Label>
      </Field.Root>
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
