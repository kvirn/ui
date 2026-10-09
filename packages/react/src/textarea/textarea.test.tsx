import type { KvirnMessages } from '@kvirn-ui/i18n'
import { sv } from '@kvirn-ui/i18n/sv'
import { expectNoA11yViolations } from '@kvirn-ui/testing'
import { createRef, useState } from 'react'
import { renderToString } from 'react-dom/server'
import { afterEach, beforeEach, describe, expect, expectTypeOf, test, vi } from 'vite-plus/test'
import type { MockInstance } from 'vite-plus/test'
import { page, userEvent } from 'vite-plus/test/browser'
import { render } from 'vitest-browser-react'
import { resetDevWarnings } from '../dev/dev-warning.ts'
import { Field } from '../field/field.tsx'
import { Fieldset } from '../fieldset/fieldset.tsx'
import { KvirnProvider } from '../provider/kvirn-provider.tsx'
import { Textarea } from './textarea.tsx'
import type { TextareaChangeDetails, TextareaProps } from './textarea.tsx'
import { useTextarea } from './use-textarea.ts'
import type { TextareaPartProps, UseTextareaOptions, UseTextareaResult } from './use-textarea.ts'

// Contract: textarea.a11y.md. The count's own text, plural forms and
// announcements are proved in ../character-count/character-count.test.tsx: here only what
// Textarea adds (no native maxlength, the wiring and the details).

let consoleWarn: MockInstance<Console['warn']>

beforeEach(() => {
  resetDevWarnings()
  consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {})
})

afterEach(() => {
  consoleWarn.mockRestore()
})

describe('keyboard', () => {
  function recordPreventedKeys() {
    const keys: string[] = []
    const listener = (event: KeyboardEvent) => {
      if (event.defaultPrevented) keys.push(event.key)
    }
    document.addEventListener('keydown', listener)
    return { keys, stop: () => document.removeEventListener('keydown', listener) }
  }

  test('Tab moves in and out and never inserts a tab', async () => {
    await render(
      <>
        <Textarea aria-label="Situation" />
        <button type="button">Skicka</button>
      </>,
    )
    const box = page.getByRole('textbox', { name: 'Situation' })
    const send = page.getByRole('button', { name: 'Skicka' })
    await userEvent.keyboard('{Tab}')
    await expect.element(box).toHaveFocus()
    await userEvent.keyboard('Hej{Tab}')
    await expect.element(send).toHaveFocus()
    await expect.element(box).toHaveValue('Hej')
    await userEvent.keyboard('{Shift>}{Tab}{/Shift}')
    await expect.element(box).toHaveFocus()
    await expect.element(box).toHaveValue('Hej')
  })

  test('Enter inserts a line break and does not submit', async () => {
    const onSubmit = vi.fn<() => void>()
    await render(
      <form
        aria-label="Ansökan"
        onSubmit={(event) => {
          event.preventDefault()
          onSubmit()
        }}
      >
        <Textarea aria-label="Situation" />
        <button type="submit">Skicka</button>
      </form>,
    )
    const box = page.getByRole('textbox', { name: 'Situation' })
    await userEvent.click(box)
    await userEvent.keyboard('Rad ett{Enter}Rad två')
    await expect.element(box).toHaveValue('Rad ett\nRad två')
    await expect.element(box).toHaveFocus()
    expect(onSubmit).not.toHaveBeenCalled()
    await userEvent.click(page.getByRole('button', { name: 'Skicka' }))
    expect(onSubmit).toHaveBeenCalledTimes(1)
  })

  test('caret keys are not intercepted', async () => {
    await render(<Textarea aria-label="Situation" defaultValue={'Anna\nBritta'} />)
    const box = page.getByRole('textbox', { name: 'Situation' })
    await userEvent.click(box)
    const element = box.element() as HTMLTextAreaElement
    const recorder = recordPreventedKeys()
    await userEvent.keyboard('{End}')
    expect(element.selectionStart).toBe(11)
    await userEvent.keyboard('{Home}')
    expect(element.selectionStart).toBe(5)
    await userEvent.keyboard('{ArrowRight}')
    expect(element.selectionStart).toBe(6)
    await userEvent.keyboard('{ArrowLeft}')
    expect(element.selectionStart).toBe(5)
    await userEvent.keyboard('{ArrowUp}')
    expect(element.selectionStart).toBeLessThanOrEqual(4)
    await userEvent.keyboard('{ArrowDown}{PageUp}{PageDown}')
    recorder.stop()
    expect(element.value).toBe('Anna\nBritta')
    await expect.element(box).toHaveFocus()
    expect(recorder.keys).toEqual([])
  })

  test('caret keys are not intercepted in right to left', async () => {
    await render(
      <div dir="rtl">
        <Textarea aria-label="Situation" defaultValue="abc" />
      </div>,
    )
    const box = page.getByRole('textbox', { name: 'Situation' })
    await userEvent.click(box)
    const recorder = recordPreventedKeys()
    await userEvent.keyboard('{ArrowLeft}{ArrowRight}{Home}{End}{ArrowUp}{ArrowDown}')
    recorder.stop()
    await expect.element(box).toHaveValue('abc')
    await expect.element(box).toHaveFocus()
    expect(recorder.keys).toEqual([])
  })

  test('Control/Command+A selects all the text', async () => {
    await render(<Textarea aria-label="Situation" defaultValue={'Anna\nAndersson'} />)
    const box = page.getByRole('textbox', { name: 'Situation' })
    await userEvent.click(box)
    await userEvent.keyboard('{Control>}a{/Control}')
    const element = box.element() as HTMLTextAreaElement
    expect([element.selectionStart, element.selectionEnd]).toEqual([0, 'Anna\nAndersson'.length])
  })

  test('Escape does nothing: the value and the focus stay', async () => {
    await render(<Textarea aria-label="Situation" defaultValue="Anna" />)
    const box = page.getByRole('textbox', { name: 'Situation' })
    await userEvent.click(box)
    const recorder = recordPreventedKeys()
    await userEvent.keyboard('{Escape}')
    recorder.stop()
    await expect.element(box).toHaveValue('Anna')
    await expect.element(box).toHaveFocus()
    expect(recorder.keys).toEqual([])
  })
})

describe('rendering', () => {
  test('renders a native <textarea> with 5 rows, outside a Field', async () => {
    const { container } = await render(<Textarea aria-label="Beskrivning" />)
    const box = page.getByRole('textbox', { name: 'Beskrivning' })
    expect(box.element().tagName).toBe('TEXTAREA')
    await expect.element(box).toHaveAttribute('rows', '5')
    await expect.element(box).not.toHaveAttribute('id')
    await expect.element(box).not.toHaveAttribute('aria-describedby')
    await expect.element(box).not.toHaveAttribute('aria-invalid')
    await expect.element(box).not.toHaveAttribute('aria-required')
    await expect.element(box).not.toHaveAttribute('maxlength')
    await expectNoA11yViolations(container)
    expect(consoleWarn).not.toHaveBeenCalled()
  })

  test('forwards its ref and native props, and the part class kv-textarea joins a consumer’s', async () => {
    const ref = createRef<HTMLTextAreaElement>()
    await render(
      <Textarea
        ref={ref}
        aria-label="Beskrivning"
        className="egen"
        name="description"
        autoComplete="off"
        rows={8}
        maxLength={400}
        placeholder="Skriv här"
        spellCheck={false}
        defaultValue="Hej"
      />,
    )
    const box = page.getByRole('textbox', { name: 'Beskrivning' })
    expect(ref.current).toBe(box.element())
    await expect.element(box).toHaveClass('egen', 'kv-textarea')
    await expect.element(box).toHaveAttribute('name', 'description')
    await expect.element(box).toHaveAttribute('autocomplete', 'off')
    await expect.element(box).toHaveAttribute('rows', '8')
    // Without characterCount, maxLength is the native attribute.
    await expect.element(box).toHaveAttribute('maxlength', '400')
    await expect.element(box).toHaveAttribute('spellcheck', 'false')
    await expect.element(box).toHaveValue('Hej')
  })

  test('required, readOnly and disabled pass through as native attributes', async () => {
    await render(
      <>
        <Textarea aria-label="Ett" required />
        <Textarea aria-label="Två" readOnly />
        <Textarea aria-label="Tre" disabled />
      </>,
    )
    await expect.element(page.getByRole('textbox', { name: 'Ett' })).toBeRequired()
    await expect.element(page.getByRole('textbox', { name: 'Två' })).toHaveAttribute('readonly')
    await expect.element(page.getByRole('textbox', { name: 'Tre' })).toBeDisabled()
    await expect
      .element(page.getByRole('textbox', { name: 'Tre' }))
      .toHaveAttribute('data-disabled', '')
  })
})

describe('in a Field', () => {
  test('the Field’s label is the name, and its id links them', async () => {
    const { container } = await render(
      <Field.Root required>
        <Field.Label>Beskriv din situation</Field.Label>
        <Textarea name="situation" />
      </Field.Root>,
    )
    const box = page.getByRole('textbox', { name: 'Beskriv din situation' })
    const id = box.element().id
    expect(id).not.toBe('')
    expect(container.querySelector('label')?.getAttribute('for')).toBe(id)
    await expectNoA11yViolations(container)
    expect(consoleWarn).not.toHaveBeenCalled()
  })

  test('takes invalid, required and disabled from the Field, and required is not the native attribute', async () => {
    await render(
      <Field.Root invalid required>
        <Field.Label>Beskrivning</Field.Label>
        <Field.ErrorMessage>Beskriv ärendet</Field.ErrorMessage>
        <Textarea />
      </Field.Root>,
    )
    const box = page.getByRole('textbox', { name: 'Beskrivning' })
    await expect.element(box).toHaveAttribute('aria-invalid', 'true')
    await expect.element(box).toHaveAttribute('aria-required', 'true')
    await expect.element(box).toHaveAttribute('data-invalid', '')
    await expect.element(box).toHaveAttribute('data-required', '')
    expect((box.element() as HTMLTextAreaElement).required).toBe(false)
  })

  test('a disabled Field disables the box', async () => {
    await render(
      <Field.Root disabled>
        <Field.Label marker="none">Beskrivning</Field.Label>
        <Textarea />
      </Field.Root>,
    )
    await expect.element(page.getByRole('textbox', { name: 'Beskrivning' })).toBeDisabled()
  })

  test('the description lists the description, the help text and the error, in DOM order', async () => {
    const { container } = await render(
      <Field.Root invalid>
        <Field.Label>Beskrivning</Field.Label>
        <Field.Prose>Skriv vad som har hänt.</Field.Prose>
        <Textarea />
        <Field.HelpText>Svenska eller engelska.</Field.HelpText>
        <Field.ErrorMessage>Beskriv ärendet</Field.ErrorMessage>
      </Field.Root>,
    )
    await expect
      .element(page.getByRole('textbox', { name: 'Beskrivning (optional)' }))
      .toHaveAccessibleDescription(
        'Skriv vad som har hänt. Svenska eller engelska. Error: Beskriv ärendet',
      )
    await expectNoA11yViolations(container)
  })

  test('keeps your own aria-describedby ids, after the Field’s', async () => {
    await render(
      <>
        <p id="extra">Extra information.</p>
        <Field.Root>
          <Field.Label>Beskrivning</Field.Label>
          <Field.Prose>Som i ärendet.</Field.Prose>
          <Textarea aria-describedby="extra" />
        </Field.Root>
      </>,
    )
    const box = page.getByRole('textbox', { name: 'Beskrivning (optional)' })
    await expect.element(box).toHaveAccessibleDescription('Som i ärendet. Extra information.')
    expect(box.element().getAttribute('aria-describedby')?.endsWith(' extra')).toBe(true)
  })

  test('an id on the Textarea inside a Field is ignored with a dev warning: the label stays associated', async () => {
    await render(
      <Field.Root controlId="fältet">
        <Field.Label marker="none">Beskrivning</Field.Label>
        <Textarea id="annat" />
      </Field.Root>,
    )
    await expect
      .element(page.getByRole('textbox', { name: 'Beskrivning' }))
      .toHaveAttribute('id', 'fältet')
    await vi.waitFor(() => {
      expect(consoleWarn).toHaveBeenCalledTimes(1)
    })
    expect(String(consoleWarn.mock.calls[0]?.[0])).toContain('controlId')
    expect(String(consoleWarn.mock.calls[0]?.[0])).toContain('Textarea')
  })

  test('the accessible name and description follow the locale', async () => {
    await render(
      <KvirnProvider locale="sv-SE" messages={sv}>
        <Field.Root invalid>
          <Field.Label>Beskriv din situation</Field.Label>
          <Field.Prose>Berätta vad som har hänt.</Field.Prose>
          <Textarea />
          <Field.ErrorMessage>Beskriv din situation</Field.ErrorMessage>
        </Field.Root>
      </KvirnProvider>,
    )
    const box = page.getByRole('textbox', { name: 'Beskriv din situation (valfritt)' })
    await expect
      .element(box)
      .toHaveAccessibleDescription('Berätta vad som har hänt. Fel: Beskriv din situation')
  })
})

describe('value', () => {
  test('typing calls onValueChange with the value and reason, and onChange too', async () => {
    const onValueChange = vi.fn<(value: string, details: TextareaChangeDetails) => void>()
    const onChange = vi.fn<(event: React.ChangeEvent<HTMLTextAreaElement>) => void>()
    await render(
      <Textarea aria-label="Beskrivning" onValueChange={onValueChange} onChange={onChange} />,
    )
    const box = page.getByRole('textbox', { name: 'Beskrivning' })
    await userEvent.type(box, 'Hej')
    expect(onValueChange.mock.calls.map(([value]) => value)).toEqual(['H', 'He', 'Hej'])
    const details = onValueChange.mock.calls.at(-1)?.[1]
    expect(details?.reason).toBe('input')
    expect(details?.event.type).toBe('change')
    expect(onChange).toHaveBeenCalledTimes(3)
    // Without a count the details carry no count.
    expect(details).not.toHaveProperty('length')
    expect(details).not.toHaveProperty('isOverLimit')
  })

  test('controlled: the value comes from state', async () => {
    function Controlled() {
      const [value, setValue] = useState('Hej')
      return (
        <>
          <Textarea aria-label="Beskrivning" value={value} onValueChange={setValue} />
          <output>{value}</output>
        </>
      )
    }
    await render(<Controlled />)
    const box = page.getByRole('textbox', { name: 'Beskrivning' })
    await expect.element(box).toHaveValue('Hej')
    await userEvent.click(box)
    await userEvent.keyboard('{End}!')
    await expect.element(box).toHaveValue('Hej!')
    await expect.element(page.getByRole('status')).toHaveTextContent('Hej!')
  })

  test('uncontrolled: defaultValue is kept, and line breaks too', async () => {
    await render(<Textarea aria-label="Beskrivning" defaultValue="Rad ett" />)
    const box = page.getByRole('textbox', { name: 'Beskrivning' })
    await userEvent.click(box)
    await userEvent.keyboard('{End}{Enter}Rad två')
    await expect.element(box).toHaveValue('Rad ett\nRad två')
  })

  test('no form state: a plain <form> submit gets the typed value from the native box', async () => {
    let submitted: FormData | undefined
    await render(
      <form
        aria-label="Ansökan"
        onSubmit={(event) => {
          event.preventDefault()
          submitted = new FormData(event.currentTarget)
        }}
      >
        <Field.Root>
          <Field.Label marker="none">Beskrivning</Field.Label>
          <Textarea name="description" />
        </Field.Root>
        <button type="submit">Skicka</button>
      </form>,
    )
    await userEvent.type(page.getByRole('textbox', { name: 'Beskrivning' }), 'Hej')
    await userEvent.click(page.getByRole('button', { name: 'Skicka' }))
    expect(submitted?.get('description')).toBe('Hej')
  })

  test('no form state: a form library’s spread props and ref reach the native box', async () => {
    const registered: { element: HTMLTextAreaElement | null; changes: string[]; blurs: number } = {
      element: null,
      changes: [],
      blurs: 0,
    }
    // The shape of a form library's register(): name, ref and native handlers.
    const register = (name: string) => ({
      name,
      ref: (element: HTMLTextAreaElement | null) => {
        registered.element = element
      },
      onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        registered.changes.push(event.currentTarget.value)
      },
      onBlur: () => {
        registered.blurs += 1
      },
    })
    await render(
      <Field.Root required>
        <Field.Label>Beskrivning</Field.Label>
        <Textarea {...register('description')} />
      </Field.Root>,
    )
    const box = page.getByRole('textbox', { name: 'Beskrivning' })
    expect(registered.element).toBe(box.element())
    await userEvent.type(box, 'ab')
    await userEvent.keyboard('{Tab}')
    expect(registered.changes).toEqual(['a', 'ab'])
    expect(registered.blurs).toBe(1)
  })

  test('clicking the label focuses the box', async () => {
    await render(
      <Field.Root>
        <Field.Label marker="none">Beskrivning</Field.Label>
        <Textarea />
      </Field.Root>,
    )
    await userEvent.click(page.getByText('Beskrivning', { exact: true }))
    await expect.element(page.getByRole('textbox')).toHaveFocus()
  })
})

describe('focus visible', () => {
  test('sets data-focus-visible on keyboard focus only', async () => {
    await render(
      <>
        <Textarea aria-label="Ett" />
        <Textarea aria-label="Två" />
      </>,
    )
    const first = page.getByRole('textbox', { name: 'Ett' })
    await userEvent.keyboard('{Tab}')
    await expect.element(first).toHaveFocus()
    await expect.element(first).toHaveAttribute('data-focused', '')
    await expect.element(first).toHaveAttribute('data-focus-visible', '')
    const second = page.getByRole('textbox', { name: 'Två' })
    await userEvent.click(second)
    await expect.element(first).not.toHaveAttribute('data-focus-visible')
    await expect.element(first).not.toHaveAttribute('data-focused')
    // A click focuses without the keyboard's sign, and a key brings it back.
    await expect.element(second).toHaveAttribute('data-focused', '')
    await expect.element(second).not.toHaveAttribute('data-focus-visible')
    await userEvent.keyboard('{Shift>}{Tab}{/Shift}{Tab}')
    await expect.element(second).toHaveAttribute('data-focus-visible', '')
  })
})

describe('dev warnings', () => {
  test('a Textarea without a label, outside a Field, warns once', async () => {
    await render(<Textarea placeholder="Beskrivning" />)
    expect(consoleWarn).toHaveBeenCalledTimes(1)
    expect(String(consoleWarn.mock.calls[0]?.[0])).toContain('accessible name')
  })

  test('a Textarea inside a Field without a Label warns once', async () => {
    await render(
      <Field.Root>
        <Textarea />
      </Field.Root>,
    )
    expect(consoleWarn).toHaveBeenCalledTimes(1)
    expect(String(consoleWarn.mock.calls[0]?.[0])).toContain('Field.Label')
  })

  test('aria-label, aria-labelledby and a wrapping <label> are names enough', async () => {
    await render(
      <>
        <Textarea aria-label="Sök" />
        <span id="rubrik">Beskrivning</span>
        <Textarea aria-labelledby="rubrik" />
        <label htmlFor="meddelande">
          Meddelande
          <Textarea id="meddelande" />
        </label>
      </>,
    )
    expect(consoleWarn).not.toHaveBeenCalled()
  })
})

describe('characterCount', () => {
  test('maxLength is the count’s limit and is not written as the native attribute, so a paste is never cut', async () => {
    const { container } = await render(
      <Field.Root>
        <Field.Label>Beskrivning</Field.Label>
        <Textarea characterCount maxLength={100} />
      </Field.Root>,
    )
    const box = page.getByRole('textbox', { name: 'Beskrivning (optional)' })
    await expect.element(box).not.toHaveAttribute('maxlength')
    const long = 'a'.repeat(130)
    await userEvent.fill(box, long)
    await expect.element(box).toHaveValue(long)
    expect(container.querySelector('p')?.textContent).toBe('You have 30 characters too many.')
  })

  test('the count follows the box and describes it, inside a Field and outside one', async () => {
    await render(
      <>
        <Field.Root>
          <Field.Label>I ett fält</Field.Label>
          <Field.Prose>Skriv kort.</Field.Prose>
          <Textarea characterCount maxLength={100} />
        </Field.Root>
        <Textarea aria-label="Utan fält" characterCount maxLength={50} aria-describedby="extra" />
        <p id="extra">Extra.</p>
      </>,
    )
    const inField = page.getByRole('textbox', { name: 'I ett fält (optional)' })
    await expect
      .element(inField)
      .toHaveAccessibleDescription('Skriv kort. You can enter up to 100 characters.')
    await userEvent.type(inField, 'abc')
    await expect
      .element(inField)
      .toHaveAccessibleDescription('Skriv kort. You have 97 characters remaining.')
    const outside = page.getByRole('textbox', { name: 'Utan fält' })
    await expect
      .element(outside)
      .toHaveAccessibleDescription('Extra. You can enter up to 50 characters.')
  })

  test('data-over is on the Textarea and the count while over the limit', async () => {
    const { container } = await render(
      <Field.Root>
        <Field.Label>Beskrivning</Field.Label>
        <Textarea characterCount maxLength={10} />
      </Field.Root>,
    )
    const box = page.getByRole('textbox', { name: 'Beskrivning (optional)' })
    await expect.element(box).not.toHaveAttribute('data-over')
    await userEvent.fill(box, 'a'.repeat(11))
    await expect.element(box).toHaveAttribute('data-over', '')
    expect(container.querySelector('p')?.hasAttribute('data-over')).toBe(true)
    // Over the limit is a warning, not an error: nothing is marked invalid.
    await expect.element(box).not.toHaveAttribute('aria-invalid')
    await userEvent.fill(box, 'a'.repeat(10))
    await expect.element(box).not.toHaveAttribute('data-over')
  })

  test('onValueChange details carry the length, the limit and whether it is over', async () => {
    const onValueChange = vi.fn<(value: string, details: TextareaChangeDetails) => void>()
    await render(
      <Textarea
        aria-label="Beskrivning"
        characterCount
        maxLength={5}
        onValueChange={onValueChange}
      />,
    )
    const box = page.getByRole('textbox', { name: 'Beskrivning' })
    await userEvent.fill(box, 'abc')
    await userEvent.fill(box, 'abcdefg')
    expect(onValueChange.mock.calls.at(-2)?.[1]).toMatchObject({
      reason: 'input',
      length: 3,
      limit: 5,
      isOverLimit: false,
    })
    expect(onValueChange.mock.calls.at(-1)?.[1]).toMatchObject({
      length: 7,
      limit: 5,
      isOverLimit: true,
    })
  })

  test('controlled: the count follows the value, and a defaultValue sets the first count', async () => {
    function Controlled() {
      const [value, setValue] = useState('abc')
      return (
        <>
          <Textarea
            aria-label="Styrd"
            characterCount
            maxLength={10}
            value={value}
            onValueChange={setValue}
          />
          <button type="button" onClick={() => setValue('')}>
            Töm
          </button>
        </>
      )
    }
    const { container } = await render(
      <>
        <Controlled />
        <Textarea aria-label="Ostyrd" characterCount maxLength={10} defaultValue="abcdefgh" />
      </>,
    )
    const counts = () => [...container.querySelectorAll('p')].map((count) => count.textContent)
    expect(counts()).toEqual([
      'You have 7 characters remaining.',
      'You have 2 characters remaining.',
    ])
    await userEvent.click(page.getByRole('button', { name: 'Töm' }))
    expect(counts()[0]).toBe('You can enter up to 10 characters.')
  })

  test('a form reset puts the count back to the default value’s', async () => {
    const { container } = await render(
      <form aria-label="Ansökan">
        <Textarea aria-label="Beskrivning" characterCount maxLength={10} defaultValue="abc" />
        <button type="reset">Rensa</button>
      </form>,
    )
    const count = () => container.querySelector('p')?.textContent
    await userEvent.type(page.getByRole('textbox', { name: 'Beskrivning' }), 'defg')
    expect(count()).toBe('You have 3 characters remaining.')
    await userEvent.click(page.getByRole('button', { name: 'Rensa' }))
    await vi.waitFor(() => {
      expect(count()).toBe('You have 7 characters remaining.')
    })
  })

  test('directly in a Fieldset, the count describes the box and not the fieldset', async () => {
    const { container } = await render(
      <Fieldset.Root>
        <Fieldset.Legend>Din situation</Fieldset.Legend>
        <Textarea aria-label="Beskrivning" characterCount maxLength={100} />
      </Fieldset.Root>,
    )
    await expect
      .element(page.getByRole('textbox', { name: 'Beskrivning' }))
      .toHaveAccessibleDescription('You can enter up to 100 characters.')
    await expect
      .element(page.getByRole('group', { name: 'Din situation' }))
      .not.toHaveAccessibleDescription('You can enter up to 100 characters.')
    await expectNoA11yViolations(container)
  })

  test('an uncontrolled box counts the value the browser restored: on mount and on pageshow', async () => {
    const { container } = await render(
      <Textarea aria-label="Beskrivning" characterCount maxLength={10} defaultValue="abc" />,
    )
    const count = () => container.querySelector('p')?.textContent
    expect(count()).toBe('You have 7 characters remaining.')
    // Form restoration writes the value without an input event, then the page is shown.
    const element = page.getByRole('textbox', { name: 'Beskrivning' }).element()
    ;(element as HTMLTextAreaElement).value = 'abcdef'
    window.dispatchEvent(new Event('pageshow'))
    await vi.waitFor(() => {
      expect(count()).toBe('You have 4 characters remaining.')
    })
  })

  test('countCharacters and messages reach the count', async () => {
    const messages: Partial<KvirnMessages['characterCount']> = {
      remaining: ({ count }) => `${count} kvar i rutan`,
    }
    const { container } = await render(
      <Textarea
        aria-label="Beskrivning"
        characterCount
        maxLength={10}
        defaultValue="abc"
        countCharacters={(value) => value.length * 2}
        messages={messages}
      />,
    )
    expect(container.querySelector('p')?.textContent).toBe('4 kvar i rutan')
  })

  test('the count is said in the provider’s language', async () => {
    await render(
      <KvirnProvider locale="sv" messages={sv}>
        <Field.Root>
          <Field.Label>Beskrivning</Field.Label>
          <Textarea characterCount maxLength={100} />
        </Field.Root>
      </KvirnProvider>,
    )
    await expect
      .element(page.getByRole('textbox', { name: 'Beskrivning (valfritt)' }))
      .toHaveAccessibleDescription('Du kan skriva högst 100 tecken.')
  })

  test('a text set from code is not announced, and what the user types is', async () => {
    function Draft() {
      const [value, setValue] = useState('')
      return (
        <>
          <button type="button" onClick={() => setValue('a'.repeat(100))}>
            Hämta utkast
          </button>
          <Field.Root>
            <Field.Label>Beskrivning</Field.Label>
            <Textarea characterCount maxLength={100} value={value} onValueChange={setValue} />
          </Field.Root>
        </>
      )
    }
    await render(
      <KvirnProvider locale="sv" messages={sv}>
        <Draft />
      </KvirnProvider>,
    )
    const status = page.getByRole('status')
    await userEvent.click(page.getByRole('button', { name: 'Hämta utkast' }))
    // The draft fills the box: the count shows it, but nobody typed it, so nothing is said.
    await expect
      .element(page.getByRole('textbox', { name: 'Beskrivning (valfritt)' }))
      .toHaveAccessibleDescription('Du har 0 tecken kvar.')
    // Longer than the pause before a count is announced (500 ms).
    await new Promise((resolve) => setTimeout(resolve, 700))
    await expect.element(status).toBeEmptyDOMElement()
    await userEvent.type(page.getByRole('textbox', { name: 'Beskrivning (valfritt)' }), 'b')
    await expect.element(status).toHaveTextContent('Du har 1 tecken för mycket.')
  })

  test('characterCount without maxLength warns once and renders no count', async () => {
    const { container } = await render(
      <Field.Root>
        <Field.Label>Beskrivning</Field.Label>
        <Textarea characterCount />
      </Field.Root>,
    )
    expect(container.querySelector('p')).toBeNull()
    await expect
      .element(page.getByRole('textbox', { name: 'Beskrivning (optional)' }))
      .not.toHaveAttribute('aria-describedby')
    await vi.waitFor(() => {
      expect(consoleWarn).toHaveBeenCalledTimes(1)
    })
    const message = String(consoleWarn.mock.calls[0]?.[0])
    expect(message).toContain('maxLength')
    expect(message).toContain('characterCount')
  })

  test('without characterCount, maxLength is untouched and nothing is rendered after the box', async () => {
    const { container } = await render(<Textarea aria-label="Beskrivning" maxLength={10} />)
    expect(container.querySelector('p')).toBeNull()
    await expect
      .element(page.getByRole('textbox', { name: 'Beskrivning' }))
      .toHaveAttribute('maxlength', '10')
  })

  test('has no axe violations under, near and over the limit, and invalid', async () => {
    const { container } = await render(
      <Field.Root required invalid>
        <Field.Label>Beskriv din situation</Field.Label>
        <Field.Prose>Berätta vad som har hänt.</Field.Prose>
        <Textarea characterCount maxLength={20} />
        <Field.HelpText>Svenska eller engelska.</Field.HelpText>
        <Field.ErrorMessage>Beskriv din situation</Field.ErrorMessage>
      </Field.Root>,
    )
    const box = page.getByRole('textbox', { name: 'Beskriv din situation' })
    await expect(expectNoA11yViolations(container)).resolves.toBeUndefined()
    await userEvent.fill(box, 'a'.repeat(17))
    await expect(expectNoA11yViolations(container)).resolves.toBeUndefined()
    await userEvent.fill(box, 'a'.repeat(25))
    await expect(expectNoA11yViolations(container)).resolves.toBeUndefined()
  })
})

describe('useTextarea', () => {
  function HookBox(options: UseTextareaOptions & { label: string }) {
    const { label, ...textareaOptions } = options
    const textarea = useTextarea(textareaOptions)
    return <textarea aria-label={label} {...textarea.textareaProps} />
  }

  test('gives spreadable props for your own <textarea>, reading the nearest Field', async () => {
    const { container } = await render(
      <Field.Root invalid required>
        <Field.Label>Beskrivning</Field.Label>
        <Field.ErrorMessage>Beskriv ärendet</Field.ErrorMessage>
        <HookBox label="Beskrivning" />
      </Field.Root>,
    )
    const box = page.getByRole('textbox', { name: 'Beskrivning' })
    await expect.element(box).toHaveAttribute('aria-invalid', 'true')
    await expect.element(box).toHaveAttribute('aria-required', 'true')
    await expect.element(box).toHaveAccessibleDescription('Error: Beskriv ärendet')
    await expect.element(box).toHaveClass('kv-textarea')
    await expectNoA11yViolations(container)
  })

  test('rows default to 5 and can be set', async () => {
    await render(
      <>
        <HookBox label="Ett" />
        <HookBox label="Två" rows={3} />
      </>,
    )
    await expect.element(page.getByRole('textbox', { name: 'Ett' })).toHaveAttribute('rows', '5')
    await expect.element(page.getByRole('textbox', { name: 'Två' })).toHaveAttribute('rows', '3')
  })

  test('onValueChange works without a Field', async () => {
    const onValueChange = vi.fn<(value: string, details: TextareaChangeDetails) => void>()
    await render(<HookBox label="Beskrivning" onValueChange={onValueChange} />)
    await userEvent.type(page.getByRole('textbox', { name: 'Beskrivning' }), 'a')
    expect(onValueChange).toHaveBeenCalledWith('a', expect.objectContaining({ reason: 'input' }))
  })

  test('reports its state', async () => {
    const seen: Pick<UseTextareaResult, 'isInvalid' | 'isRequired' | 'isDisabled'>[] = []
    function Probe() {
      const { isInvalid, isRequired, isDisabled } = useTextarea()
      seen.push({ isInvalid, isRequired, isDisabled })
      return null
    }
    await render(
      <Field.Root invalid required disabled>
        <Probe />
      </Field.Root>,
    )
    expect(seen.at(-1)).toEqual({ isInvalid: true, isRequired: true, isDisabled: true })
  })
})

describe('server rendering', () => {
  test('renders the box and its count to a string without touching the page', () => {
    const html = renderToString(
      <Textarea aria-label="Beskrivning" characterCount maxLength={10} defaultValue="Hej" />,
    )
    expect(html).toContain('<textarea')
    expect(html).toContain('You have 7 characters remaining.')
  })
})

describe('types', () => {
  test('onValueChange takes the string value and details', () => {
    expectTypeOf<TextareaProps['onValueChange']>().toEqualTypeOf<
      ((value: string, details: TextareaChangeDetails) => void) | undefined
    >()
    expectTypeOf<TextareaChangeDetails['reason']>().toEqualTypeOf<'input'>()
    expectTypeOf<TextareaProps['value']>().toEqualTypeOf<string | undefined>()
    expectTypeOf<TextareaProps['defaultValue']>().toEqualTypeOf<string | undefined>()
    expectTypeOf<TextareaProps['characterCount']>().toEqualTypeOf<boolean | undefined>()
    expectTypeOf<TextareaProps['messages']>().toEqualTypeOf<
      Partial<KvirnMessages['characterCount']> | undefined
    >()
  })

  test('exports the hook and part types', () => {
    expectTypeOf<TextareaPartProps['className']>().toEqualTypeOf<'kv-textarea'>()
    expectTypeOf<UseTextareaResult['textareaProps']>().toEqualTypeOf<TextareaPartProps>()
    expectTypeOf<UseTextareaResult['isFocusVisible']>().toEqualTypeOf<boolean>()
  })
})
