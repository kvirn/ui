import { en } from '@kvirn-ui/i18n/en'
import { expectNoA11yViolations } from '@kvirn-ui/testing'
import { createRef, useState } from 'react'
import type { ReactNode, Ref } from 'react'
import { renderToString } from 'react-dom/server'
import { afterEach, beforeEach, describe, expect, expectTypeOf, test, vi } from 'vite-plus/test'
import type { MockInstance } from 'vite-plus/test'
import { page, userEvent } from 'vite-plus/test/browser'
import { render } from 'vitest-browser-react'
import { resetDevWarnings } from '../dev/dev-warning.ts'
import { Field } from '../field/field.tsx'
import { OneTimeCode, OneTimeCodeInput, OneTimeCodeRoot, OneTimeCodeSlot } from '../index.ts'
import type {
  OneTimeCodeInputProps,
  OneTimeCodeRootProps,
  OneTimeCodeSlotProps,
  OneTimeCodeSlotState,
  UseOneTimeCodeOptions,
  UseOneTimeCodeResult,
} from '../index.ts'
import type { TextInputChangeDetails } from '../text-input/use-text-input.ts'
import { KvirnProvider } from '../provider/kvirn-provider.tsx'
import { useOneTimeCode } from './use-one-time-code.ts'

// Contract: one-time-code.a11y.md. The keyboard rows, the pointer, the theme's fallback and the
// display modes are covered end to end in
// apps/storybook/src/components/one-time-code/one-time-code.e2e.ts. Component tests load no
// theme, so the slots are plain spans here: what is asserted is the markup and the state.

let consoleWarn: MockInstance<Console['warn']>

beforeEach(() => {
  resetDevWarnings()
  consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {})
})

afterEach(() => {
  consoleWarn.mockRestore()
})

interface CodeFieldProps {
  pattern?: string
  /** The help text under the label. Default: the six digits of the default pattern. */
  hint?: string
  value?: string
  defaultValue?: string
  invalid?: boolean
  disabled?: boolean
  readOnly?: boolean
  onValueChange?: (value: string, details: TextInputChangeDetails) => void
  onComplete?: (value: string, unmaskedValue: string) => void
  inputRef?: Ref<HTMLInputElement>
  /** Rendered after the field, inside the form: a submit button, for the Enter test. */
  after?: ReactNode
  slotCount?: number
}

/** The design spec's field: label, description above, the row of slots over the one input. */
function CodeField({
  pattern = '999999',
  hint = 'Koden har 6 siffror.',
  slotCount = [...pattern].length,
  invalid = false,
  disabled = false,
  readOnly = false,
  inputRef,
  after,
  ...rootProps
}: CodeFieldProps) {
  return (
    <Field.Root invalid={invalid} disabled={disabled}>
      <Field.Label>Kod från sms:et</Field.Label>
      <Field.Prose>{hint}</Field.Prose>
      <OneTimeCode.Root pattern={pattern} data-testid="root" {...rootProps}>
        <OneTimeCode.Input name="code" readOnly={readOnly} ref={inputRef} />
        {Array.from({ length: slotCount }, (_, index) => (
          <OneTimeCode.Slot key={index} index={index} />
        ))}
      </OneTimeCode.Root>
      {invalid ? <Field.ErrorMessage>Koden stämmer inte.</Field.ErrorMessage> : null}
      {after}
    </Field.Root>
  )
}

const code = () => page.getByRole('textbox', { name: /^Kod från sms:et/ })
const inputElement = () => code().element() as HTMLInputElement
const slots = () => [...document.querySelectorAll<HTMLElement>('.kv-one-time-code-slot')]
const root = () => document.querySelector<HTMLElement>('[data-testid="root"]')
const filledSlots = () => slots().filter((slot) => slot.hasAttribute('data-filled'))
const activeSlots = () => slots().filter((slot) => slot.hasAttribute('data-active'))
const selectedSlots = () => slots().filter((slot) => slot.hasAttribute('data-selected'))
const characters = () => slots().map((slot) => slot.textContent)
/** Every cell of the pattern, characters and separators, in order. */
const cells = () => [
  ...document.querySelectorAll<HTMLElement>('.kv-one-time-code-slot, .kv-one-time-code-separator'),
]
const separators = () => [...document.querySelectorAll<HTMLElement>('.kv-one-time-code-separator')]
const cellTexts = () => cells().map((cell) => cell.textContent)
const isSeparatorCell = (cell: HTMLElement | undefined) =>
  cell?.classList.contains('kv-one-time-code-separator') === true

/** Sets the value the way the browser does, so React sees a real change (not its own setter). */
function setNativeValue(element: HTMLInputElement, value: string): void {
  const descriptor = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')
  const setter: unknown = Reflect.get(descriptor ?? {}, 'set')
  if (typeof setter === 'function') {
    Reflect.apply(setter, element, [value])
  }
}

describe('exports and types', () => {
  test('the parts and the hook are exported, on the namespace and on their own', () => {
    expect(OneTimeCode.Root).toBe(OneTimeCodeRoot)
    expect(OneTimeCode.Input).toBe(OneTimeCodeInput)
    expect(OneTimeCode.Slot).toBe(OneTimeCodeSlot)
    expect(typeof useOneTimeCode).toBe('function')
  })

  test('the option, result and part prop types', () => {
    expectTypeOf<UseOneTimeCodeOptions['pattern']>().toEqualTypeOf<string | undefined>()
    expectTypeOf<UseOneTimeCodeOptions['onComplete']>().toEqualTypeOf<
      ((value: string, unmaskedValue: string) => void) | undefined
    >()
    expectTypeOf<UseOneTimeCodeResult['isComplete']>().toEqualTypeOf<boolean>()
    expectTypeOf<UseOneTimeCodeResult['characterCount']>().toEqualTypeOf<number>()
    expectTypeOf<UseOneTimeCodeResult['pattern']>().toEqualTypeOf<string>()
    expectTypeOf<OneTimeCodeSlotState['kind']>().toEqualTypeOf<'character' | 'separator'>()
    expectTypeOf<OneTimeCodeSlotState['caret']>().toEqualTypeOf<'before' | 'after' | undefined>()
    expectTypeOf<OneTimeCodeRootProps['pattern']>().toEqualTypeOf<string | undefined>()
    expectTypeOf<OneTimeCodeInputProps['name']>().toEqualTypeOf<string | undefined>()
    expectTypeOf<OneTimeCodeSlotProps['index']>().toEqualTypeOf<number>()
  })
})

describe('the input', () => {
  test('is one native text input, named by its label and described by the help text', async () => {
    await render(<CodeField />)
    await expect.element(code()).toBeVisible()
    expect(inputElement().type).toBe('text')
    await expect.element(code()).toHaveAccessibleDescription('Koden har 6 siffror.')
    expect(page.getByRole('textbox').elements()).toHaveLength(1)
  })

  test('has the attributes that make autofill, paste and dictation work', async () => {
    await render(<CodeField />)
    const input = code()
    await expect.element(input).toHaveAttribute('autocomplete', 'one-time-code')
    await expect.element(input).toHaveAttribute('inputmode', 'numeric')
    await expect.element(input).toHaveAttribute('spellcheck', 'false')
    await expect.element(input).toHaveAttribute('autocorrect', 'off')
    await expect.element(input).toHaveAttribute('dir', 'ltr')
    await expect.element(input).toHaveAttribute('name', 'code')
  })

  test('has no maxlength, no pattern and is never a password field', async () => {
    await render(<CodeField />)
    await expect.element(code()).not.toHaveAttribute('maxlength')
    await expect.element(code()).not.toHaveAttribute('pattern')
    await expect.element(code()).not.toHaveAttribute('type', 'password')
  })

  test('letters and digits as typed: the text keyboard, no inputmode and no capitals', async () => {
    await render(<CodeField pattern="********" />)
    await expect.element(code()).not.toHaveAttribute('autocapitalize')
    await expect.element(code()).not.toHaveAttribute('inputmode')
    await userEvent.type(code(), 'k7qx2m9p')
    await expect.element(code()).toHaveValue('k7qx2m9p')
  })

  test('takes aria-invalid, aria-required and disabled from the Field', async () => {
    await render(
      <Field.Root invalid required disabled>
        <Field.Label marker="none">Kod</Field.Label>
        <OneTimeCode.Root>
          <OneTimeCode.Input />
        </OneTimeCode.Root>
        <Field.ErrorMessage>Fel</Field.ErrorMessage>
      </Field.Root>,
    )
    const input = page.getByRole('textbox', { name: 'Kod' })
    await expect.element(input).toHaveAttribute('aria-invalid', 'true')
    await expect.element(input).toHaveAttribute('aria-required', 'true')
    await expect.element(input).toBeDisabled()
  })

  test('the error is part of its description, after the help text', async () => {
    await render(<CodeField invalid />)
    await expect
      .element(code())
      .toHaveAccessibleDescription(/Koden har 6 siffror\..*Koden stämmer inte\./)
  })

  test('an own aria-describedby id comes after the Field ids', async () => {
    await render(
      <Field.Root>
        <Field.Label marker="none">Kod</Field.Label>
        <Field.Prose>Hint</Field.Prose>
        <OneTimeCode.Root>
          <OneTimeCode.Input aria-describedby="own" />
        </OneTimeCode.Root>
        <p id="own">Extra</p>
      </Field.Root>,
    )
    await expect
      .element(page.getByRole('textbox', { name: 'Kod' }))
      .toHaveAccessibleDescription('Hint Extra')
  })
})

describe('the slots', () => {
  test('are aria-hidden, one per character, never focusable', async () => {
    await render(<CodeField defaultValue="481" />)
    expect(slots()).toHaveLength(6)
    for (const slot of slots()) {
      expect(slot.getAttribute('aria-hidden')).toBe('true')
      expect(slot.hasAttribute('tabindex')).toBe(false)
      expect(slot.querySelector('a[href], button, input, select, textarea, [tabindex]')).toBeNull()
    }
    // Hidden from the accessibility tree: the field is the only textbox, and its value is the code.
    await expect.element(code()).toHaveValue('481')
  })

  test('draw the value: the characters, and data-filled on the filled ones', async () => {
    await render(<CodeField defaultValue="481" />)
    expect(characters()).toEqual(['4', '8', '1', '', '', ''])
    expect(filledSlots()).toHaveLength(3)
    expect(slots().map((slot) => slot.hasAttribute('data-filled'))).toEqual([
      true,
      true,
      true,
      false,
      false,
      false,
    ])
  })

  test('follow typing, and the field keeps its focus', async () => {
    await render(<CodeField />)
    await userEvent.type(code(), '4819')
    expect(characters()).toEqual(['4', '8', '1', '9', '', ''])
    await expect.element(code()).toHaveFocus()
  })

  test('are drawn from the input after a form reset', async () => {
    await render(
      <form data-testid="form">
        <CodeField defaultValue="481" />
        <button type="reset">Rensa</button>
      </form>,
    )
    await userEvent.type(code(), '920')
    expect(characters()).toEqual(['4', '8', '1', '9', '2', '0'])
    await userEvent.click(page.getByRole('button', { name: 'Rensa' }))
    await expect.poll(characters).toEqual(['4', '8', '1', '', '', ''])
  })

  test('data-invalid on every slot and on the Root, from the Field', async () => {
    await render(<CodeField defaultValue="481920" invalid />)
    expect(root()?.hasAttribute('data-invalid')).toBe(true)
    expect(slots().every((slot) => slot.hasAttribute('data-invalid'))).toBe(true)
  })

  test('data-disabled on the Root, from the Field', async () => {
    await render(<CodeField defaultValue="481920" disabled />)
    expect(root()?.hasAttribute('data-disabled')).toBe(true)
    await expect.element(code()).toBeDisabled()
  })

  test('a slot has no state attributes it should not have when the field is valid and unfocused', async () => {
    await render(<CodeField defaultValue="481" />)
    for (const slot of slots()) {
      expect(slot.hasAttribute('data-active')).toBe(false)
      expect(slot.hasAttribute('data-selected')).toBe(false)
      expect(slot.hasAttribute('data-caret')).toBe(false)
      expect(slot.hasAttribute('data-invalid')).toBe(false)
    }
  })
})

describe('the root', () => {
  test('has the kv-one-time-code part class and no role', async () => {
    await render(<CodeField />)
    expect(root()?.classList.contains('kv-one-time-code')).toBe(true)
    expect(root()?.hasAttribute('role')).toBe(false)
  })

  test('data-complete when every slot is filled, and never any visual claim of its own', async () => {
    await render(<CodeField />)
    expect(root()?.hasAttribute('data-complete')).toBe(false)
    await userEvent.type(code(), '48192')
    expect(root()?.hasAttribute('data-complete')).toBe(false)
    await userEvent.keyboard('0')
    await expect.poll(() => root()?.hasAttribute('data-complete')).toBe(true)
    await userEvent.keyboard('{Backspace}')
    await expect.poll(() => root()?.hasAttribute('data-complete')).toBe(false)
  })

  test('data-character-count and data-separator-count come from the pattern, in the server render too', async () => {
    const patterns: [string, string, string][] = [
      ['999999', '6', '0'],
      ['****-****', '8', '1'],
      ['***-***-***', '9', '2'],
      ['AA-9999', '6', '1'],
    ]
    for (const [pattern, characterCount, separatorCount] of patterns) {
      const html = renderToString(<CodeField pattern={pattern} />)
      expect(html).toContain(`data-character-count="${characterCount}"`)
      expect(html).toContain(`data-separator-count="${separatorCount}"`)
    }
    const { unmount } = await render(<CodeField pattern="&&&&-&&&&" />)
    expect(root()?.getAttribute('data-character-count')).toBe('8')
    expect(root()?.getAttribute('data-separator-count')).toBe('1')
    await unmount()
    await render(<CodeField />)
    expect(root()?.getAttribute('data-character-count')).toBe('6')
    expect(root()?.getAttribute('data-separator-count')).toBe('0')
  })

  test('data-ready once the hook has started, and not in the server render', async () => {
    const html = renderToString(<CodeField defaultValue="481" />)
    expect(html).not.toContain('data-ready')
    await render(<CodeField />)
    await expect.poll(() => root()?.hasAttribute('data-ready')).toBe(true)
  })

  test('reads the input’s current value when it starts, such as an autofill before hydration', async () => {
    await render(
      <CodeField
        inputRef={(element) => {
          // Runs before the Root's layout effect, like the browser filling the field first.
          if (element !== null) {
            setNativeValue(element, '481920')
          }
        }}
      />,
    )
    await expect.poll(characters).toEqual(['4', '8', '1', '9', '2', '0'])
    expect(root()?.hasAttribute('data-complete')).toBe(true)
    expect(root()?.hasAttribute('data-ready')).toBe(true)
  })
})

describe('a value already in the field when the script starts goes through the mask', () => {
  /** A consumer ref runs before the Root's layout effect, like the browser filling the field first. */
  const filledBefore = (text: string) => (element: HTMLInputElement | null) => {
    if (element !== null) {
      setNativeValue(element, text)
    }
  }

  test('"481 920" typed before the script ends as 481920, in the field and in the boxes', async () => {
    await render(<CodeField inputRef={filledBefore('481 920')} />)
    await expect.poll(characters).toEqual(['4', '8', '1', '9', '2', '0'])
    await expect.element(code()).toHaveValue('481920')
    expect(root()?.hasAttribute('data-complete')).toBe(true)
  })

  test('a seventh digit is not hidden: the field never holds more than the boxes show', async () => {
    await render(<CodeField inputRef={filledBefore('4819207')} />)
    await expect.poll(characters).toEqual(['4', '8', '1', '9', '2', '0'])
    await expect.element(code()).toHaveValue('481920')
    expect(characters().join('')).toBe(inputElement().value)
  })

  test('a letter in a digits code is dropped, so a form never submits what the boxes hide', async () => {
    await render(<CodeField inputRef={filledBefore('48a1')} />)
    await expect.element(code()).toHaveValue('481')
    await expect.poll(characters).toEqual(['4', '8', '1', '', '', ''])
  })

  test('a valid value is not rewritten', async () => {
    await render(<CodeField defaultValue="481920" />)
    await expect.element(code()).toHaveValue('481920')
    expect(root()?.hasAttribute('data-ready')).toBe(true)
  })

  test('a form reset runs the default value through the mask again', async () => {
    await render(
      <form>
        <CodeField defaultValue="481 920" />
        <button type="reset">Rensa</button>
      </form>,
    )
    await expect.element(code()).toHaveValue('481920')
    await userEvent.fill(code(), '1')
    await userEvent.click(page.getByRole('button', { name: 'Rensa' }))
    await expect.poll(characters).toEqual(['4', '8', '1', '9', '2', '0'])
    await expect.element(code()).toHaveValue('481920')
  })
})

describe('typing, paste and autofill', () => {
  test('a letter in a digits code is not inserted', async () => {
    await render(<CodeField />)
    await userEvent.type(code(), '48a1')
    await expect.element(code()).toHaveValue('481')
  })

  test.each(['123 456', '123-456', '123456', 'Your code is 123456', ' 123  456 '])(
    'a paste of %j ends as 123456',
    async (pasted) => {
      await render(<CodeField />)
      await userEvent.fill(code(), pasted)
      await expect.element(code()).toHaveValue('123456')
      expect(characters()).toEqual(['1', '2', '3', '4', '5', '6'])
    },
  )

  test('a seventh digit is not inserted (no maxlength, the mask refuses it)', async () => {
    await render(<CodeField />)
    await userEvent.type(code(), '1234567')
    await expect.element(code()).toHaveValue('123456')
  })

  test('autofill without an inputType fills the whole code', async () => {
    await render(<CodeField />)
    const element = inputElement()
    setNativeValue(element, '481 920')
    element.dispatchEvent(new Event('input', { bubbles: true }))
    await expect.element(code()).toHaveValue('481920')
    expect(characters()).toEqual(['4', '8', '1', '9', '2', '0'])
  })

  test('Backspace deletes before the caret and the later characters move back', async () => {
    await render(<CodeField defaultValue="481920" />)
    inputElement().focus()
    inputElement().setSelectionRange(3, 3)
    await userEvent.keyboard('{Backspace}')
    await expect.element(code()).toHaveValue('48920')
    expect(characters()).toEqual(['4', '8', '9', '2', '0', ''])
  })

  test('Delete deletes after the caret', async () => {
    await render(<CodeField defaultValue="481920" />)
    inputElement().focus()
    inputElement().setSelectionRange(3, 3)
    await userEvent.keyboard('{Delete}')
    await expect.element(code()).toHaveValue('48120')
  })

  test('no auto-advance and no auto-submit: focus stays, and the form does not submit', async () => {
    const onSubmit = vi.fn<(event: { preventDefault: () => void }) => void>((event) =>
      event.preventDefault(),
    )
    await render(
      <form onSubmit={onSubmit}>
        <CodeField after={<button type="submit">Fortsätt</button>} />
      </form>,
    )
    await userEvent.type(code(), '481920')
    await expect.element(code()).toHaveFocus()
    expect(onSubmit).not.toHaveBeenCalled()
    // Enter is native: it submits the form, and the component never prevents it.
    await userEvent.keyboard('{Enter}')
    expect(onSubmit).toHaveBeenCalledTimes(1)
  })

  test('Tab leaves the field, also when the code is complete: the only stop is the input', async () => {
    await render(
      <>
        <CodeField defaultValue="481920" after={<button type="button">Fortsätt</button>} />
      </>,
    )
    await userEvent.tab()
    await expect.element(code()).toHaveFocus()
    await userEvent.tab()
    await expect.element(page.getByRole('button', { name: 'Fortsätt' })).toHaveFocus()
    await userEvent.tab({ shift: true })
    await expect.element(code()).toHaveFocus()
  })
})

describe('value, defaultValue and onValueChange', () => {
  test('onValueChange gets the masked value and the mask details', async () => {
    const reports: { value: string; details: TextInputChangeDetails }[] = []
    await render(
      <CodeField
        onValueChange={(value, details) => {
          reports.push({ value, details })
        }}
      />,
    )
    await userEvent.type(code(), '48a')
    const last = reports.at(-1)
    expect(last?.value).toBe('48')
    expect(last?.details.reason).toBe('input')
    expect(last?.details.unmaskedValue).toBe('48')
    expect(last?.details.isComplete).toBe(false)
    expect(last?.details.rejected).toEqual([{ reason: 'digits', characters: 'a' }])
  })

  test('controlled: the slots and the input follow value', async () => {
    function Controlled() {
      const [value, setValue] = useState('48')
      return (
        <>
          <CodeField value={value} onValueChange={setValue} />
          <button type="button" onClick={() => setValue('')}>
            Töm
          </button>
        </>
      )
    }
    await render(<Controlled />)
    expect(characters()).toEqual(['4', '8', '', '', '', ''])
    await userEvent.type(code(), '1')
    await expect.element(code()).toHaveValue('481')
    expect(characters()).toEqual(['4', '8', '1', '', '', ''])
    await userEvent.click(page.getByRole('button', { name: 'Töm' }))
    await expect.element(code()).toHaveValue('')
    await expect.poll(characters).toEqual(['', '', '', '', '', ''])
  })

  test('an 8 character pattern has 8 slots', async () => {
    await render(<CodeField pattern="99999999" />)
    expect(slots()).toHaveLength(8)
    await userEvent.fill(code(), '12345678')
    await expect.poll(() => root()?.hasAttribute('data-complete')).toBe(true)
  })
})

describe('onComplete', () => {
  test('fires once with the code when it becomes complete, and never moves focus or submits', async () => {
    const onComplete = vi.fn<(value: string, unmaskedValue: string) => void>()
    await render(<CodeField onComplete={onComplete} />)
    await userEvent.type(code(), '48192')
    expect(onComplete).not.toHaveBeenCalled()
    await userEvent.keyboard('0')
    expect(onComplete).toHaveBeenCalledTimes(1)
    expect(onComplete).toHaveBeenCalledWith('481920', '481920')
    await expect.element(code()).toHaveFocus()
  })

  test('fires for a paste of the whole code, and not again for the same code', async () => {
    const onComplete = vi.fn<(value: string, unmaskedValue: string) => void>()
    await render(<CodeField onComplete={onComplete} />)
    await userEvent.fill(code(), 'Your code is 481 920')
    expect(onComplete).toHaveBeenCalledTimes(1)
    expect(onComplete).toHaveBeenLastCalledWith('481920', '481920')
    await userEvent.fill(code(), '481920')
    expect(onComplete).toHaveBeenCalledTimes(1)
    await userEvent.fill(code(), '481921')
    expect(onComplete).toHaveBeenCalledTimes(2)
    expect(onComplete).toHaveBeenLastCalledWith('481921', '481921')
  })

  test('does not fire for an incomplete code', async () => {
    const onComplete = vi.fn<(value: string, unmaskedValue: string) => void>()
    await render(<CodeField onComplete={onComplete} />)
    await userEvent.type(code(), '48192')
    expect(onComplete).not.toHaveBeenCalled()
  })
})

describe('caret and selection are drawn from the input', () => {
  test('no slot is active before the field has focus', async () => {
    await render(<CodeField defaultValue="481" />)
    expect(activeSlots()).toHaveLength(0)
  })

  test('the slot where the next character goes is active, with the caret before it', async () => {
    await render(<CodeField />)
    await userEvent.type(code(), '48')
    await expect.poll(() => activeSlots().length).toBe(1)
    expect(slots().indexOf(activeSlots()[0]!)).toBe(2)
    expect(activeSlots()[0]?.getAttribute('data-caret')).toBe('before')
    expect(activeSlots()[0]?.hasAttribute('data-filled')).toBe(false)
  })

  test('an empty field has the first slot active when it takes focus', async () => {
    await render(<CodeField />)
    await userEvent.click(code())
    await expect.poll(() => slots().indexOf(activeSlots()[0]!)).toBe(0)
  })

  test('ArrowLeft puts the caret before a filled character, and the active slot follows', async () => {
    await render(<CodeField defaultValue="481" />)
    await userEvent.click(code())
    inputElement().setSelectionRange(3, 3)
    await userEvent.keyboard('{ArrowLeft}')
    await expect.poll(() => slots().indexOf(activeSlots()[0]!)).toBe(2)
    expect(activeSlots()[0]?.hasAttribute('data-filled')).toBe(true)
    expect(activeSlots()[0]?.getAttribute('data-caret')).toBe('before')
    await userEvent.keyboard('{Home}')
    await expect.poll(() => slots().indexOf(activeSlots()[0]!)).toBe(0)
    await userEvent.keyboard('{End}')
    await expect.poll(() => slots().indexOf(activeSlots()[0]!)).toBe(3)
  })

  test('a complete code with the caret at the end: the last slot, caret after (not before)', async () => {
    await render(<CodeField />)
    await userEvent.type(code(), '481920')
    await expect.poll(() => activeSlots().length).toBe(1)
    expect(slots().indexOf(activeSlots()[0]!)).toBe(5)
    expect(activeSlots()[0]?.getAttribute('data-caret')).toBe('after')
    await userEvent.keyboard('{ArrowLeft}')
    await expect.poll(() => activeSlots()[0]?.getAttribute('data-caret')).toBe('before')
    expect(slots().indexOf(activeSlots()[0]!)).toBe(5)
  })

  test('Control+A selects the code: data-selected on every filled slot, and no active slot', async () => {
    await render(<CodeField defaultValue="481" />)
    await userEvent.click(code())
    await userEvent.keyboard('{Control>}a{/Control}')
    await expect.poll(() => selectedSlots().length).toBe(3)
    expect(activeSlots()).toHaveLength(0)
    expect(selectedSlots().every((slot) => slot.hasAttribute('data-filled'))).toBe(true)
    expect(slots().every((slot) => !slot.hasAttribute('data-caret'))).toBe(true)
  })

  test('Shift+ArrowLeft extends the selection one slot at a time', async () => {
    await render(<CodeField defaultValue="481" />)
    await userEvent.click(code())
    inputElement().setSelectionRange(3, 3)
    await userEvent.keyboard('{Shift>}{ArrowLeft}{/Shift}')
    await expect.poll(() => selectedSlots().length).toBe(1)
    expect(slots().indexOf(selectedSlots()[0]!)).toBe(2)
    await userEvent.keyboard('{Shift>}{ArrowLeft}{/Shift}')
    await expect.poll(() => selectedSlots().length).toBe(2)
  })

  test('typing over a selection replaces it', async () => {
    await render(<CodeField defaultValue="481" />)
    await userEvent.click(code())
    await userEvent.keyboard('{Control>}a{/Control}')
    await userEvent.keyboard('9')
    await expect.element(code()).toHaveValue('9')
    expect(characters()).toEqual(['9', '', '', '', '', ''])
  })

  test('blur clears the active and selected state', async () => {
    await render(<CodeField defaultValue="481" after={<button type="button">Fortsätt</button>} />)
    await userEvent.click(code())
    await userEvent.keyboard('{Control>}a{/Control}')
    await expect.poll(() => selectedSlots().length).toBe(3)
    await userEvent.tab()
    await expect.poll(() => selectedSlots().length + activeSlots().length).toBe(0)
  })

  test('read-only still shows the caret when focused', async () => {
    await render(<CodeField defaultValue="481" readOnly />)
    await userEvent.click(code())
    inputElement().setSelectionRange(3, 3)
    await expect.poll(() => activeSlots().length).toBe(1)
  })
})

describe('patterns with separators', () => {
  const groupedHint = 'Koden har 8 tecken i två grupper om 4.'

  test.each([
    {
      pattern: '****-****',
      kinds: 'ccccscccc',
      texts: ['', '', '', '', '-', '', '', '', ''],
    },
    {
      pattern: '***-***-***',
      kinds: 'cccscccsccc',
      texts: ['', '', '', '-', '', '', '', '-', '', '', ''],
    },
    { pattern: 'AA-9999', kinds: 'ccscccc', texts: ['', '', '-', '', '', '', ''] },
    { pattern: '&&&&', kinds: 'cccc', texts: ['', '', '', ''] },
  ])('$pattern draws one cell per position of the pattern', async ({ pattern, kinds, texts }) => {
    await render(<CodeField pattern={pattern} />)
    expect(cells()).toHaveLength(pattern.length)
    expect(
      cells()
        .map((cell) => (isSeparatorCell(cell) ? 's' : 'c'))
        .join(''),
    ).toBe(kinds)
    expect(cellTexts()).toEqual(texts)
    expect(slots()).toHaveLength([...pattern].filter((symbol) => symbol !== '-').length)
    expect(separators()).toHaveLength([...pattern].filter((symbol) => symbol === '-').length)
  })

  test('a separator is aria-hidden with its own class, and has no state', async () => {
    await render(<CodeField pattern="****-****" hint={groupedHint} defaultValue="abcd-12" />)
    await userEvent.click(code())
    await userEvent.keyboard('{Control>}a{/Control}')
    await expect.poll(() => selectedSlots().length).toBe(6)
    expect(separators()).toHaveLength(1)
    const [separator] = separators()
    expect(separator?.className).toBe('kv-one-time-code-separator')
    expect(separator?.getAttribute('aria-hidden')).toBe('true')
    expect(separator?.textContent).toBe('-')
    for (const name of ['data-filled', 'data-active', 'data-selected', 'data-caret', 'tabindex']) {
      expect(separator?.hasAttribute(name)).toBe(false)
    }
    // The separator is not a character slot: it never takes the slot class.
    expect(separator?.classList.contains('kv-one-time-code-slot')).toBe(false)
    expect(slots().every((slot) => slot !== separator)).toBe(true)
    await expect.element(code()).toHaveValue('abcd-12')
  })

  test('draws the separator before anything is typed, and the characters around it', async () => {
    await render(<CodeField pattern="****-****" defaultValue="abcd-12" />)
    expect(cellTexts()).toEqual(['a', 'b', 'c', 'd', '-', '1', '2', '', ''])
    expect(filledSlots()).toHaveLength(6)
    expect(slots().filter((slot) => slot.textContent === '')).toHaveLength(2)
  })

  test('typing across the separator: the dash goes in as the fifth character is placed', async () => {
    await render(<CodeField pattern="****-****" hint={groupedHint} />)
    await userEvent.type(code(), 'abcd')
    await expect.element(code()).toHaveValue('abcd')
    expect(cellTexts()).toEqual(['a', 'b', 'c', 'd', '-', '', '', '', ''])
    await userEvent.keyboard('1')
    await expect.element(code()).toHaveValue('abcd-1')
    await userEvent.keyboard('234')
    await expect.element(code()).toHaveValue('abcd-1234')
    expect(cellTexts()).toEqual(['a', 'b', 'c', 'd', '-', '1', '2', '3', '4'])
    await expect.poll(() => root()?.hasAttribute('data-complete')).toBe(true)
    await expect.element(code()).toHaveFocus()
  })

  test('a typed dash after the group is accepted once, and not doubled', async () => {
    await render(<CodeField pattern="****-****" />)
    await userEvent.type(code(), 'abcd--1')
    await expect.element(code()).toHaveValue('abcd-1')
  })

  test.each(['abcd1234', 'abcd-1234', 'abcd 1234', ' abcd  1234 '])(
    'a paste of %j ends as abcd-1234',
    async (pasted) => {
      await render(<CodeField pattern="****-****" />)
      await userEvent.fill(code(), pasted)
      await expect.element(code()).toHaveValue('abcd-1234')
      expect(cellTexts()).toEqual(['a', 'b', 'c', 'd', '-', '1', '2', '3', '4'])
    },
  )

  test('three groups: a paste with or without dashes ends with them', async () => {
    await render(<CodeField pattern="***-***-***" />)
    await userEvent.fill(code(), '123456789')
    await expect.element(code()).toHaveValue('123-456-789')
    await userEvent.fill(code(), '987-654-321')
    await expect.element(code()).toHaveValue('987-654-321')
    expect(cellTexts()).toEqual(['9', '8', '7', '-', '6', '5', '4', '-', '3', '2', '1'])
  })

  test('autofill without a separator ends with it, in the field and in the boxes', async () => {
    await render(<CodeField pattern="****-****" />)
    const element = inputElement()
    setNativeValue(element, 'abcd1234')
    element.dispatchEvent(new Event('input', { bubbles: true }))
    await expect.element(code()).toHaveValue('abcd-1234')
    expect(cellTexts()).toEqual(['a', 'b', 'c', 'd', '-', '1', '2', '3', '4'])
  })

  test('a value in the field before the script starts goes through the mask, separator included', async () => {
    await render(
      <CodeField
        pattern="****-****"
        inputRef={(element) => {
          if (element !== null) {
            setNativeValue(element, 'abcd1234')
          }
        }}
      />,
    )
    await expect.element(code()).toHaveValue('abcd-1234')
    await expect.poll(cellTexts).toEqual(['a', 'b', 'c', 'd', '-', '1', '2', '3', '4'])
  })

  test('AA-9999: lower case is upper-cased, in the field and in the boxes', async () => {
    await render(<CodeField pattern="AA-9999" />)
    await userEvent.type(code(), 'ab1234')
    await expect.element(code()).toHaveValue('AB-1234')
    expect(cellTexts()).toEqual(['A', 'B', '-', '1', '2', '3', '4'])
  })

  test('&&&&: lower case is upper-cased and digits are kept', async () => {
    await render(<CodeField pattern="&&&&" />)
    await userEvent.fill(code(), 'a1b2')
    await expect.element(code()).toHaveValue('A1B2')
    expect(cellTexts()).toEqual(['A', '1', 'B', '2'])
  })

  test('****-****: a lower case letter stays as typed (the boxes show the value)', async () => {
    await render(<CodeField pattern="****-****" />)
    await userEvent.type(code(), 'k7qx')
    await expect.element(code()).toHaveValue('k7qx')
  })

  test('a refused character is not inserted: a digit in the letters, a letter in the digits', async () => {
    await render(<CodeField pattern="AA-9999" />)
    // `1` and `x` are refused (the letters want letters, the digits want digits), `a` becomes `A`.
    await userEvent.type(code(), '1abx1')
    await expect.element(code()).toHaveValue('AB-1')
  })

  test('onValueChange and onComplete get the value with the dash, and the code without it', async () => {
    const reports: { value: string; details: TextInputChangeDetails }[] = []
    const onComplete = vi.fn<(value: string, unmaskedValue: string) => void>()
    await render(
      <CodeField
        pattern="****-****"
        onComplete={onComplete}
        onValueChange={(value, details) => {
          reports.push({ value, details })
        }}
      />,
    )
    await userEvent.type(code(), 'abcd123')
    expect(onComplete).not.toHaveBeenCalled()
    expect(reports.at(-1)?.value).toBe('abcd-123')
    expect(reports.at(-1)?.details.unmaskedValue).toBe('abcd123')
    expect(reports.at(-1)?.details.isComplete).toBe(false)
    await userEvent.keyboard('4')
    expect(onComplete).toHaveBeenCalledTimes(1)
    expect(onComplete).toHaveBeenCalledWith('abcd-1234', 'abcd1234')
    expect(reports.at(-1)?.details.isComplete).toBe(true)
    await expect.element(code()).toHaveFocus()
  })

  test('Backspace deletes the character before the caret, also across the dash', async () => {
    await render(<CodeField pattern="****-****" defaultValue="abcd-1" />)
    await userEvent.click(code())
    inputElement().setSelectionRange(6, 6)
    await userEvent.keyboard('{Backspace}')
    await expect.element(code()).toHaveValue('abcd-')
    await userEvent.keyboard('{Backspace}')
    await expect.element(code()).toHaveValue('abcd')
    await userEvent.keyboard('{Backspace}')
    await expect.element(code()).toHaveValue('abc')
    expect(cellTexts()).toEqual(['a', 'b', 'c', '', '-', '', '', '', ''])
  })

  test('a refused character is announced with the class it needs, and a full code says its length', async () => {
    await render(
      <KvirnProvider locale="en" messages={en}>
        <CodeField pattern="AA-9999" />
      </KvirnProvider>,
    )
    await userEvent.type(code(), '1')
    await expect
      .poll(() => document.body.textContent)
      .toContain('Only letters can be entered here.')
  })

  test('a code that is full says how many characters it has, without counting the dash', async () => {
    await render(
      <KvirnProvider locale="en" messages={en}>
        <CodeField pattern="****-****" defaultValue="abcd-1234" />
      </KvirnProvider>,
    )
    await userEvent.click(code())
    await userEvent.keyboard('{End}5')
    await expect.poll(() => document.body.textContent).toContain('You’ve entered all 8 characters.')
  })

  test.each([
    { pattern: '999999', inputmode: 'numeric', autocapitalize: 'characters' },
    { pattern: '999-999', inputmode: 'numeric', autocapitalize: 'characters' },
    { pattern: '****-****', inputmode: null, autocapitalize: null },
    { pattern: 'aaaa', inputmode: null, autocapitalize: null },
    { pattern: 'AA-9999', inputmode: null, autocapitalize: 'characters' },
    { pattern: '&&&&', inputmode: null, autocapitalize: 'characters' },
    { pattern: '99-AA', inputmode: null, autocapitalize: 'characters' },
  ])(
    '$pattern: inputmode $inputmode, autocapitalize $autocapitalize',
    async ({ pattern, inputmode, autocapitalize }) => {
      await render(<CodeField pattern={pattern} />)
      const read = (name: string) => inputElement().getAttribute(name)
      expect(read('inputmode')).toBe(inputmode)
      expect(read('autocapitalize')).toBe(autocapitalize)
      // the same attributes whatever the pattern
      expect(read('autocomplete')).toBe('one-time-code')
      expect(read('spellcheck')).toBe('false')
      expect(read('autocorrect')).toBe('off')
      expect(read('dir')).toBe('ltr')
      expect(inputElement().hasAttribute('maxlength')).toBe(false)
      expect(inputElement().hasAttribute('pattern')).toBe(false)
    },
  )

  test.each([
    { pattern: '99x9', message: /"x" at position 2/ },
    { pattern: '-999', message: /"-" at position 0/ },
    { pattern: '999-', message: /"-" at position 3/ },
    { pattern: '99--99', message: /"-" at position 3/ },
    { pattern: '', message: /no character symbol/ },
  ])('an invalid pattern %j throws a RangeError that names the problem', ({ pattern, message }) => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    try {
      expect(() => renderToString(<CodeField pattern={pattern} />)).toThrow(RangeError)
      expect(() => renderToString(<CodeField pattern={pattern} />)).toThrow(message)
    } finally {
      consoleError.mockRestore()
    }
  })

  describe('the caret and the active box at a separator', () => {
    const activeCell = () => cells().findIndex((cell) => cell.hasAttribute('data-active'))

    test('the active box is the first character box at or after the caret, never a separator', async () => {
      await render(<CodeField pattern="****-****" defaultValue="abcd-123" />)
      await userEvent.click(code())
      await userEvent.keyboard('{Home}')
      for (const caret of [0, 1, 2, 3, 4, 5, 6, 7, 8]) {
        if (caret > 0) {
          await userEvent.keyboard('{ArrowRight}')
        }
        // Caret 4 is just before the dash: it is drawn after the box before it.
        const expected = caret === 4 ? 3 : caret
        await expect.poll(activeCell).toBe(expected)
        expect(isSeparatorCell(cells()[activeCell()])).toBe(false)
        expect(cells()[expected]?.getAttribute('data-caret')).toBe(caret === 4 ? 'after' : 'before')
      }
    })

    test('a caret just before an existing dash is drawn after the character before it', async () => {
      await render(<CodeField pattern="****-****" defaultValue="abcd-123" />)
      await userEvent.click(code())
      await userEvent.keyboard('{Home}{ArrowRight}{ArrowRight}{ArrowRight}{ArrowRight}')
      await expect.poll(activeCell).toBe(3)
      expect(cells()[3]?.getAttribute('data-caret')).toBe('after')
      expect(cells()[3]?.hasAttribute('data-filled')).toBe(true)
      expect(separators()[0]?.hasAttribute('data-active')).toBe(false)
      expect(separators()[0]?.hasAttribute('data-caret')).toBe(false)
      // the other side of the dash is a different box
      await userEvent.keyboard('{ArrowRight}')
      await expect.poll(activeCell).toBe(5)
      expect(cells()[5]?.getAttribute('data-caret')).toBe('before')
    })

    test('ArrowLeft steps back over the dash in one press, then before the last box of the first group', async () => {
      await render(<CodeField pattern="****-****" defaultValue="abcd-123" />)
      await userEvent.click(code())
      inputElement().setSelectionRange(5, 5)
      await userEvent.keyboard('{ArrowLeft}')
      await expect.poll(activeCell).toBe(3)
      expect(cells()[3]?.getAttribute('data-caret')).toBe('after')
      await userEvent.keyboard('{ArrowLeft}')
      await expect.poll(activeCell).toBe(3)
      expect(cells()[3]?.getAttribute('data-caret')).toBe('before')
    })

    test('with no dash in the value yet, a caret at the end of the group goes to the next group’s first box', async () => {
      await render(<CodeField pattern="****-****" defaultValue="abcd" />)
      await userEvent.click(code())
      await userEvent.keyboard('{End}')
      await expect.poll(activeCell).toBe(5)
      expect(cells()[5]?.getAttribute('data-caret')).toBe('before')
      expect(cells()[5]?.hasAttribute('data-filled')).toBe(false)
    })

    test('at the end of a complete code the caret is after the last character', async () => {
      await render(<CodeField pattern="****-****" />)
      await userEvent.type(code(), 'abcd1234')
      await expect.poll(activeCell).toBe(8)
      expect(cells()[8]?.getAttribute('data-caret')).toBe('after')
      await userEvent.keyboard('{ArrowLeft}')
      await expect.poll(() => cells()[8]?.getAttribute('data-caret')).toBe('before')
    })

    test('a selection across the dash selects the filled characters and never the separator', async () => {
      await render(<CodeField pattern="****-****" defaultValue="abcd-123" />)
      await userEvent.click(code())
      await userEvent.keyboard('{Home}{ArrowRight}{ArrowRight}')
      await userEvent.keyboard(
        '{Shift>}{ArrowRight}{ArrowRight}{ArrowRight}{ArrowRight}{ArrowRight}{/Shift}',
      )
      await expect.poll(() => selectedSlots().length).toBe(4)
      expect(separators()[0]?.hasAttribute('data-selected')).toBe(false)
      expect(activeSlots()).toHaveLength(0)
    })

    test('a press is placed by the character box nearest to it: a separator and a gap are not targets', async () => {
      await render(
        <Field.Root>
          <Field.Label marker="none">Kod</Field.Label>
          <Field.Prose>Åtta tecken.</Field.Prose>
          <OneTimeCode.Root pattern="****-****" defaultValue="abcd-12" style={{ display: 'flex' }}>
            <OneTimeCode.Input style={{ position: 'absolute' }} />
            {Array.from({ length: 9 }, (_, index) => (
              <OneTimeCode.Slot
                key={index}
                index={index}
                style={{ display: 'inline-block', width: '20px', height: '20px' }}
              />
            ))}
          </OneTimeCode.Root>
        </Field.Root>,
      )
      const input = page.getByRole('textbox', { name: 'Kod' }).element() as HTMLInputElement
      const pressAt = (clientX: number) => {
        input.focus()
        input.setSelectionRange(0, 0)
        input.dispatchEvent(
          new MouseEvent('click', { bubbles: true, detail: 1, clientX, clientY: 5 }),
        )
        return input.selectionStart
      }
      const rectOf = (cell: HTMLElement) => cell.getBoundingClientRect()
      const [dash] = separators()
      const dashBox = rectOf(dash!)
      // The left half of the dash is nearest to the box before it (the fourth, position 3), the right
      // half to the first of the second group (position 5, not 4: the dash takes a position).
      expect(pressAt(dashBox.left + 4)).toBe(3)
      expect(pressAt(dashBox.right - 4)).toBe(5)
      // A press on a filled box is before its character, and on an empty box it is at the end.
      expect(pressAt(rectOf(cells()[1]!).left + 10)).toBe(1)
      expect(pressAt(rectOf(cells()[6]!).left + 10)).toBe(6)
      expect(pressAt(rectOf(cells()[8]!).left + 10)).toBe(7)
    })
  })
})

describe('render, refs and merged props', () => {
  test('the input’s own ref and the hook’s both get the element', async () => {
    const ref = createRef<HTMLInputElement>()
    await render(<CodeField inputRef={ref} />)
    expect(ref.current).toBe(inputElement())
  })

  test('className, handlers and data attributes of the consumer are merged, not replaced', async () => {
    const onFocus = vi.fn<() => void>()
    await render(
      <Field.Root>
        <Field.Label marker="none">Kod</Field.Label>
        <OneTimeCode.Root className="mine" data-testid="root">
          <OneTimeCode.Input className="mine-input" onFocus={onFocus} />
          <OneTimeCode.Slot index={0} className="mine-slot" data-extra="" />
        </OneTimeCode.Root>
      </Field.Root>,
    )
    expect(root()?.classList.contains('kv-one-time-code')).toBe(true)
    expect(root()?.classList.contains('mine')).toBe(true)
    await expect
      .element(page.getByRole('textbox', { name: 'Kod' }))
      .toHaveClass('kv-one-time-code-input mine-input')
    expect(slots()[0]?.classList.contains('kv-one-time-code-slot')).toBe(true)
    expect(slots()[0]?.classList.contains('mine-slot')).toBe(true)
    expect(slots()[0]?.hasAttribute('data-extra')).toBe(true)
    await userEvent.click(page.getByRole('textbox', { name: 'Kod' }))
    expect(onFocus).toHaveBeenCalledTimes(1)
  })

  test('render as a function gets the part props and the state', async () => {
    const states: OneTimeCodeSlotState[] = []
    await render(
      <Field.Root>
        <Field.Label marker="none">Kod</Field.Label>
        <OneTimeCode.Root pattern="9999" defaultValue="48">
          <OneTimeCode.Input />
          <OneTimeCode.Slot
            index={0}
            render={(partProps, state) => {
              states.push(state)
              return <b {...partProps} data-testid="bold" />
            }}
          />
        </OneTimeCode.Root>
      </Field.Root>,
    )
    expect(document.querySelector('b[data-testid="bold"]')?.getAttribute('aria-hidden')).toBe(
      'true',
    )
    expect(states.at(-1)).toMatchObject({
      kind: 'character',
      character: '4',
      isFilled: true,
      isActive: false,
    })
  })

  test('render as an element on the Root', async () => {
    await render(
      <Field.Root>
        <Field.Label marker="none">Kod</Field.Label>
        <OneTimeCode.Root render={<section data-testid="root" />}>
          <OneTimeCode.Input />
        </OneTimeCode.Root>
      </Field.Root>,
    )
    expect(root()?.tagName).toBe('SECTION')
  })
})

describe('the hook, on your own elements', () => {
  function Own({ options }: { options?: UseOneTimeCodeOptions }) {
    const oneTimeCode = useOneTimeCode({ pattern: '9999', ...options })
    return (
      <div {...oneTimeCode.rootProps} data-testid="root">
        <label>
          Egen kod
          <input {...oneTimeCode.inputProps} />
        </label>
        {oneTimeCode.slots.map((slot, index) => (
          <span key={index} {...oneTimeCode.getSlotProps(index)}>
            {slot.character}
          </span>
        ))}
        <output data-testid="complete">{String(oneTimeCode.isComplete)}</output>
      </div>
    )
  }

  test('rootProps, inputProps and getSlotProps give the same markup as the components', async () => {
    await render(<Own />)
    const input = page.getByRole('textbox', { name: 'Egen kod' })
    await expect.element(input).toHaveAttribute('autocomplete', 'one-time-code')
    await userEvent.type(input, '4819')
    expect(characters()).toEqual(['4', '8', '1', '9'])
    await expect.poll(() => root()?.hasAttribute('data-complete')).toBe(true)
    expect(document.querySelector('[data-testid="complete"]')?.textContent).toBe('true')
    expect(slots().every((slot) => slot.getAttribute('aria-hidden') === 'true')).toBe(true)
  })

  test('slots carry the state of each position', async () => {
    function Slots() {
      const oneTimeCode = useOneTimeCode({ pattern: '999', defaultValue: '4' })
      return (
        <div {...oneTimeCode.rootProps}>
          <input aria-label="Kod" {...oneTimeCode.inputProps} />
          <pre data-testid="slots">{JSON.stringify(oneTimeCode.slots)}</pre>
        </div>
      )
    }
    await render(<Slots />)
    const read = () =>
      JSON.parse(document.querySelector('[data-testid="slots"]')?.textContent ?? '[]') as unknown
    expect(read()).toEqual([
      { kind: 'character', character: '4', isFilled: true, isActive: false, isSelected: false },
      { kind: 'character', character: '', isFilled: false, isActive: false, isSelected: false },
      { kind: 'character', character: '', isFilled: false, isActive: false, isSelected: false },
    ])
  })
})

describe('the hook with a pattern, on your own elements', () => {
  function Grouped({ pattern }: { pattern: string }) {
    const oneTimeCode = useOneTimeCode({ pattern, defaultValue: '12-3' })
    return (
      <div {...oneTimeCode.rootProps} data-testid="root">
        <label>
          Egen kod
          <input {...oneTimeCode.inputProps} />
        </label>
        {oneTimeCode.slots.map((slot, index) => (
          <span key={index} {...oneTimeCode.getSlotProps(index)}>
            {slot.character}
          </span>
        ))}
        <pre data-testid="slots">{JSON.stringify(oneTimeCode.slots)}</pre>
        <output data-testid="count">{oneTimeCode.characterCount}</output>
        <output data-testid="pattern">{oneTimeCode.pattern}</output>
        <output data-testid="complete">{String(oneTimeCode.isComplete)}</output>
      </div>
    )
  }
  const read = (testId: string) =>
    document.querySelector(`[data-testid="${testId}"]`)?.textContent ?? ''

  test('slots has one entry per position of the pattern, with a kind, and a separator has no state', async () => {
    await render(<Grouped pattern="99-99" />)
    expect(JSON.parse(read('slots')) as unknown).toEqual([
      { kind: 'character', character: '1', isFilled: true, isActive: false, isSelected: false },
      { kind: 'character', character: '2', isFilled: true, isActive: false, isSelected: false },
      { kind: 'separator', character: '-', isFilled: false, isActive: false, isSelected: false },
      { kind: 'character', character: '3', isFilled: true, isActive: false, isSelected: false },
      { kind: 'character', character: '', isFilled: false, isActive: false, isSelected: false },
    ])
  })

  test('characterCount and pattern are in the result, and isComplete ignores the separators', async () => {
    await render(<Grouped pattern="99-99" />)
    expect(read('count')).toBe('4')
    expect(read('pattern')).toBe('99-99')
    expect(read('complete')).toBe('false')
    const input = page.getByRole('textbox', { name: 'Egen kod' }).element() as HTMLInputElement
    input.focus()
    await userEvent.keyboard('{End}4')
    await expect.poll(() => read('complete')).toBe('true')
  })

  test('getSlotProps: a separator has the separator class and aria-hidden, a character the slot class', async () => {
    await render(<Grouped pattern="99-99" />)
    expect(cells().map((cell) => cell.className)).toEqual([
      'kv-one-time-code-slot',
      'kv-one-time-code-slot',
      'kv-one-time-code-separator',
      'kv-one-time-code-slot',
      'kv-one-time-code-slot',
    ])
    expect(cells().every((cell) => cell.getAttribute('aria-hidden') === 'true')).toBe(true)
    const [separator] = separators()
    expect(separator?.getAttributeNames().sort()).toEqual(['aria-hidden', 'class'])
  })

  test('the default pattern is six digits', async () => {
    function Default() {
      const oneTimeCode = useOneTimeCode()
      return (
        <output data-testid="default">
          {oneTimeCode.pattern} {oneTimeCode.characterCount} {oneTimeCode.slots.length}
        </output>
      )
    }
    await render(<Default />)
    expect(read('default')).toBe('999999 6 6')
  })
})

describe('development warnings', () => {
  test('an Input outside a Root warns once, and still renders a native input', async () => {
    await render(
      <Field.Root>
        <Field.Label marker="none">Kod</Field.Label>
        <Field.Prose>Sex siffror.</Field.Prose>
        <OneTimeCode.Input />
      </Field.Root>,
    )
    await expect.element(page.getByRole('textbox', { name: 'Kod' })).toBeVisible()
    expect(consoleWarn).toHaveBeenCalledTimes(1)
    expect(String(consoleWarn.mock.calls[0]?.[0])).toContain('OneTimeCode.Root')
  })

  test('a Slot outside a Root warns once', async () => {
    await render(<OneTimeCode.Slot index={0} />)
    expect(consoleWarn).toHaveBeenCalledTimes(1)
    expect(String(consoleWarn.mock.calls[0]?.[0])).toContain('OneTimeCode.Root')
  })

  test('a Slot whose index is not in the code warns once', async () => {
    await render(<CodeField pattern="9999" slotCount={6} />)
    const warnings = consoleWarn.mock.calls.map((call) => String(call[0]))
    expect(warnings.filter((warning) => warning.includes('index'))).toHaveLength(1)
  })

  test('a Slot is checked against the pattern, separators included', async () => {
    await render(<CodeField pattern="****-****" slotCount={9} />)
    expect(consoleWarn.mock.calls.filter((call) => String(call[0]).includes('index'))).toHaveLength(
      0,
    )
    resetDevWarnings()
    await render(<CodeField pattern="****-****" slotCount={10} />)
    const warnings = consoleWarn.mock.calls.map((call) => String(call[0]))
    expect(warnings.filter((warning) => warning.includes('index 9'))).toHaveLength(1)
  })

  test('too few Slots for the pattern warns once: a character would be typed that nobody sees', async () => {
    // The old idiom: one slot per character, which leaves out the dash.
    await render(<CodeField pattern="****-****" slotCount={8} />)
    const warnings = consoleWarn.mock.calls.map((call) => String(call[0]))
    expect(warnings.filter((warning) => warning.includes('too few'))).toHaveLength(1)
    resetDevWarnings()
    consoleWarn.mockClear()
    await render(<CodeField pattern="****-****" slotCount={9} />)
    expect(
      consoleWarn.mock.calls.filter((call) => String(call[0]).includes('too few')),
    ).toHaveLength(0)
  })

  test('an Input in a Field without a Field.Label warns (3.3.2)', async () => {
    await render(
      <Field.Root>
        <OneTimeCode.Root>
          <OneTimeCode.Input />
        </OneTimeCode.Root>
      </Field.Root>,
    )
    expect(
      consoleWarn.mock.calls.some((call) => String(call[0]).includes('no accessible name')),
    ).toBe(true)
  })

  test('an Input in a Field without a help text warns: the length must be said (3.3.2)', async () => {
    await render(
      <Field.Root>
        <Field.Label marker="none">Kod</Field.Label>
        <OneTimeCode.Root>
          <OneTimeCode.Input />
        </OneTimeCode.Root>
      </Field.Root>,
    )
    expect(consoleWarn.mock.calls.some((call) => String(call[0]).includes('<Prose>'))).toBe(true)
  })

  test('no warning for a complete, well-formed field', async () => {
    await render(<CodeField />)
    expect(consoleWarn).not.toHaveBeenCalled()
  })
})

describe('announcements', () => {
  test('a refused character is announced politely through the Announcer, in the provider’s language', async () => {
    await render(
      <KvirnProvider locale="en" messages={en}>
        <CodeField />
      </KvirnProvider>,
    )
    await userEvent.type(code(), '1a')
    await expect.poll(() => document.body.textContent).toContain('Only digits can be entered here.')
  })
})

describe('axe', () => {
  const states: [string, CodeFieldProps][] = [
    ['empty', {}],
    ['partly filled', { defaultValue: '481' }],
    ['complete', { defaultValue: '481920' }],
    ['invalid', { defaultValue: '481920', invalid: true }],
    ['disabled', { defaultValue: '481920', disabled: true }],
    ['read-only', { defaultValue: '481920', readOnly: true }],
    ['letters and digits in groups', { pattern: '****-****', defaultValue: 'K7QX-2M9P' }],
    ['uppercase letters then digits', { pattern: 'AA-9999', defaultValue: 'AB-12' }],
  ]
  test.each(states)('no violations: %s', async (_name, props) => {
    const { container } = await render(<CodeField {...props} />)
    await expect.element(code()).toBeVisible()
    await expectNoA11yViolations(container)
  })

  test('no violations while focused, with a selection', async () => {
    const { container } = await render(<CodeField defaultValue="481" />)
    await userEvent.click(code())
    await userEvent.keyboard('{Control>}a{/Control}')
    await expect.poll(() => selectedSlots().length).toBe(3)
    await expectNoA11yViolations(container)
  })
})
