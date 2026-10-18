import { en } from '@kvirn-ui/i18n/en'
import { expectNoA11yViolations } from '@kvirn-ui/testing'
import { readAloud, readAnnouncements } from '@kvirn-ui/testing/read-aloud'
import { createRef, useState } from 'react'
import type { ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, expectTypeOf, test, vi } from 'vite-plus/test'
import type { MockInstance } from 'vite-plus/test'
import { page, userEvent } from 'vite-plus/test/browser'
import { renderToString } from 'react-dom/server'
import { render } from 'vitest-browser-react'
import { resetDevWarnings } from '../dev/dev-warning.ts'
import { Field } from '../field/field.tsx'
import { Fieldset } from '../fieldset/fieldset.tsx'
import { TextInput } from '../text-input/text-input.tsx'
import { KvirnProvider } from '../provider/kvirn-provider.tsx'
import { Radio } from './radio.tsx'
import type { RadioProps } from './radio.tsx'
import { RadioGroup } from './radio-group.tsx'
import type { RadioGroupRootProps } from './radio-group.tsx'
import { useRadio } from './use-radio.ts'
import type { RadioPartProps, UseRadioResult } from './use-radio.ts'
import { useRadioGroup } from './use-radio-group.ts'
import type {
  RadioGroupChangeDetails,
  UseRadioGroupOptions,
  UseRadioGroupResult,
} from './use-radio-group.ts'

// Contract: radio-group.a11y.md. The keyboard rows are in the `keyboard` block.

let consoleWarn: MockInstance<Console['warn']>

beforeEach(() => {
  resetDevWarnings()
  consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {})
})

afterEach(() => {
  consoleWarn.mockRestore()
})

function expectNoDanglingReferences(container: Element) {
  for (const element of container.querySelectorAll('[aria-describedby]')) {
    const ids = (element.getAttribute('aria-describedby') ?? '').split(' ')
    expect(ids.every((id) => id !== '')).toBe(true)
    for (const id of ids) {
      expect(container.ownerDocument.querySelectorAll(`[id="${id}"]`)).toHaveLength(1)
    }
  }
}

const english = (children: ReactNode) => <KvirnProvider locale="en">{children}</KvirnProvider>

const options = [
  ['1', '1 month'],
  ['6', '6 months'],
  ['12', '12 months'],
] as const

interface DurationProps extends Omit<RadioGroupRootProps, 'children'> {
  disabledOption?: string
  optionHelpText?: boolean
}

/** The design spec's duration question, in Swedish. */
function Duration({ disabledOption, optionHelpText = false, ...rootProps }: DurationProps) {
  return (
    <RadioGroup.Root {...rootProps}>
      <Fieldset.Legend>How long do you need the permit?</Fieldset.Legend>
      <RadioGroup.Prose>Choose one option.</RadioGroup.Prose>
      {options.map(([value, label]) => (
        <RadioGroup.Option key={value}>
          <RadioGroup.Radio value={value} disabled={value === disabledOption} />
          <Field.Label>{label}</Field.Label>
          {optionHelpText && value === '12' ? (
            <Field.HelpText>Lowest price per month.</Field.HelpText>
          ) : null}
        </RadioGroup.Option>
      ))}
      <Fieldset.ErrorMessage>Choose how long you need the permit</Fieldset.ErrorMessage>
    </RadioGroup.Root>
  )
}

describe('rendering', () => {
  test('renders a group with its part classes, a <legend> first, and forwards ref and props', async () => {
    const ref = createRef<HTMLFieldSetElement>()
    const { container } = await render(
      <RadioGroup.Root ref={ref} className="own" data-testid="root">
        <Fieldset.Legend data-testid="legend">Language</Fieldset.Legend>
      </RadioGroup.Root>,
    )
    const root = page.getByTestId('root').element()
    expect(ref.current).toBe(root)
    expect(container.firstElementChild).toBe(root)
    expect(root.classList.contains('kv-radio-group')).toBe(true)
    expect(root.classList.contains('kv-fieldset')).toBe(true)
    expect(root.classList.contains('own')).toBe(true)
    expect(root.hasAttribute('name')).toBe(false)
    expect(root.firstElementChild).toBe(page.getByTestId('legend').element())
  })

  test('a Radio is a native <input type="radio"> with its class, no ARIA role', async () => {
    const ref = createRef<HTMLInputElement>()
    await render(
      <RadioGroup.Root aria-label="Language" name="language">
        <RadioGroup.Option>
          <RadioGroup.Radio ref={ref} value="sv" className="own" data-own="" />
          <Field.Label>Swedish</Field.Label>
        </RadioGroup.Option>
      </RadioGroup.Root>,
    )
    const radio = page.getByRole('radio', { name: 'Swedish' })
    expect(ref.current).toBe(radio.element())
    await expect.element(radio).toHaveAttribute('type', 'radio')
    await expect.element(radio).toHaveClass('own', 'kv-radio')
    await expect.element(radio).toHaveAttribute('value', 'sv')
    await expect.element(radio).toHaveAttribute('data-own', '')
    await expect.element(radio).not.toHaveAttribute('role')
    await expect.element(radio).not.toHaveAttribute('aria-checked')
  })

  test('the group is named by its legend and described by its help text and error', async () => {
    const { container } = await render(english(<Duration invalid />))
    const group = page.getByRole('group', { name: 'How long do you need the permit? (optional)' })
    await expect
      .element(group)
      .toHaveAccessibleDescription('Choose one option. Error: Choose how long you need the permit')
    expectNoDanglingReferences(container)
    await expectNoA11yViolations(container)
    expect(consoleWarn).not.toHaveBeenCalled()
  })

  test('a required group has no optional marker and carries data-required', async () => {
    await render(english(<Duration required />))
    const group = page.getByRole('group', {
      name: 'How long do you need the permit?',
      exact: true,
    })
    await expect.element(group).toHaveAttribute('data-required', '')
    await expect.element(group).not.toHaveAttribute('aria-required')
  })

  test('an option’s own help text is in that radio’s description', async () => {
    await render(english(<Duration optionHelpText />))
    await expect
      .element(page.getByRole('radio', { name: '12 months' }))
      .toHaveAccessibleDescription('Lowest price per month.')
  })

  test('an option help text is a Field.HelpText in that RadioGroup.Option, outside its label, and has no axe violations', async () => {
    const { container } = await render(english(<Duration optionHelpText />))
    const helpText = page.getByText('Lowest price per month.').element()
    expect(helpText.id).not.toBe('')
    // It is a sibling of the label, not inside it, so it isn't part of the radio's name or target.
    expect(helpText.closest('label')).toBeNull()
    await expect.element(page.getByRole('radio', { name: '12 months', exact: true })).toBeVisible()
    // The group's description is its own help text, not the option's.
    await expect
      .element(page.getByRole('group', { name: 'How long do you need the permit? (optional)' }))
      .toHaveAccessibleDescription('Choose one option.')
    expectNoDanglingReferences(container)
    await expectNoA11yViolations(container)
    expect(consoleWarn).not.toHaveBeenCalled()
  })
})

describe('option', () => {
  test('RadioGroup.Option controlId is the radio’s id, so an error summary link can target it', async () => {
    await render(
      english(
        <RadioGroup.Root name="period">
          <RadioGroup.Legend>Period</RadioGroup.Legend>
          <RadioGroup.Option controlId="first-period">
            <RadioGroup.Radio value="1" />
            <Field.Label>One month</Field.Label>
          </RadioGroup.Option>
        </RadioGroup.Root>,
      ),
    )
    await expect
      .element(page.getByRole('radio', { name: 'One month', exact: true }))
      .toHaveAttribute('id', 'first-period')
  })

  test('disabled on a RadioGroup.Option disables only its radio', async () => {
    await render(
      english(
        <RadioGroup.Root name="period">
          <RadioGroup.Legend>Period</RadioGroup.Legend>
          <RadioGroup.Option disabled>
            <RadioGroup.Radio value="1" />
            <Field.Label>One month</Field.Label>
          </RadioGroup.Option>
          <RadioGroup.Option>
            <RadioGroup.Radio value="6" />
            <Field.Label>Six months</Field.Label>
          </RadioGroup.Option>
        </RadioGroup.Root>,
      ),
    )
    await expect.element(page.getByRole('radio', { name: 'One month' })).toBeDisabled()
    await expect.element(page.getByRole('radio', { name: 'Six months' })).toBeEnabled()
  })

  test('a RadioGroup.Option has the kv-option class and no kv-field class', async () => {
    const { container } = await render(english(<Duration />))
    expect(container.querySelectorAll('.kv-option')).toHaveLength(3)
    expect(container.querySelectorAll('.kv-field')).toHaveLength(0)
  })

  test('a Field.ErrorMessage in a RadioGroup.Option renders nothing', async () => {
    const { container } = await render(
      english(
        <RadioGroup.Root name="period" invalid>
          <RadioGroup.Legend>Period</RadioGroup.Legend>
          <RadioGroup.Option>
            <RadioGroup.Radio value="1" />
            <Field.Label>One month</Field.Label>
            <Field.ErrorMessage>Not here</Field.ErrorMessage>
          </RadioGroup.Option>
        </RadioGroup.Root>,
      ),
    )
    expect(container.querySelector('.kv-option .kv-field-error-message')).toBeNull()
  })

  test('as="li" renders the RadioGroup.Option as a list item', async () => {
    const { container } = await render(
      english(
        <RadioGroup.Root name="period">
          <RadioGroup.Legend>Period</RadioGroup.Legend>
          <ul role="list">
            <RadioGroup.Option as="li">
              <RadioGroup.Radio value="1" />
              <Field.Label>One month</Field.Label>
            </RadioGroup.Option>
          </ul>
        </RadioGroup.Root>,
      ),
    )
    expect(container.querySelector('li.kv-option')).not.toBeNull()
  })

  test('a Field.Root around a group radio still names it', async () => {
    const { container } = await render(
      english(
        <RadioGroup.Root name="period">
          <RadioGroup.Legend>Period</RadioGroup.Legend>
          <Field.Root>
            <RadioGroup.Radio value="1" />
            <Field.Label>One month</Field.Label>
          </Field.Root>
        </RadioGroup.Root>,
      ),
    )
    await expect.element(page.getByRole('radio', { name: 'One month', exact: true })).toBeVisible()
    expect(container.querySelectorAll('.kv-field')).toHaveLength(1)
  })
})

describe('name', () => {
  test('every radio gets the group’s name, generated when missing', async () => {
    await render(
      <>
        <RadioGroup.Root aria-label="One" name="eget">
          <RadioGroup.Option>
            <RadioGroup.Radio value="a" />
            <Field.Label>A</Field.Label>
          </RadioGroup.Option>
        </RadioGroup.Root>
        <RadioGroup.Root aria-label="Two">
          <RadioGroup.Option>
            <RadioGroup.Radio value="b" />
            <Field.Label>B</Field.Label>
          </RadioGroup.Option>
          <RadioGroup.Option>
            <RadioGroup.Radio value="c" />
            <Field.Label>C</Field.Label>
          </RadioGroup.Option>
        </RadioGroup.Root>
      </>,
    )
    await expect.element(page.getByRole('radio', { name: 'A' })).toHaveAttribute('name', 'eget')
    const generated = page.getByRole('radio', { name: 'B' }).element().getAttribute('name')
    expect(generated).not.toBeNull()
    expect(generated).not.toBe('')
    expect(page.getByRole('radio', { name: 'C' }).element().getAttribute('name')).toBe(generated)
    expect(generated).not.toBe('eget')
  })
})

describe('value', () => {
  test('a controlled group checks the radio whose value it is given', async () => {
    const onValueChange = vi.fn<(value: string, details: RadioGroupChangeDetails) => void>()
    function Controlled() {
      const [value, setValue] = useState<string | null>('6')
      return (
        <>
          <Duration
            name="duration"
            value={value}
            onValueChange={(next, details) => {
              onValueChange(next, details)
              setValue(next)
            }}
          />
          <output data-testid="value">{value}</output>
        </>
      )
    }
    await render(english(<Controlled />))
    await expect.element(page.getByRole('radio', { name: '6 months' })).toBeChecked()
    await userEvent.click(page.getByRole('radio', { name: '12 months' }))
    expect(onValueChange.mock.calls.at(-1)?.[0]).toBe('12')
    expect(onValueChange.mock.calls.at(-1)?.[1].reason).toBe('input')
    expect(onValueChange.mock.calls.at(-1)?.[1].event.type).toBe('change')
    await expect.element(page.getByRole('radio', { name: '12 months' })).toBeChecked()
    await expect.element(page.getByRole('radio', { name: '6 months' })).not.toBeChecked()
    await expect.element(page.getByTestId('value')).toHaveTextContent('12')
  })

  test('value={null} is controlled with nothing selected', async () => {
    await render(
      english(
        <Duration
          name="duration"
          value={null}
          onValueChange={vi.fn<(value: string, details: RadioGroupChangeDetails) => void>()}
        />,
      ),
    )
    for (const [, label] of options) {
      await expect.element(page.getByRole('radio', { name: label })).not.toBeChecked()
    }
    await userEvent.click(page.getByRole('radio', { name: '1 month' }))
    // The parent did not update value, so nothing is checked.
    await expect.element(page.getByRole('radio', { name: '1 month' })).not.toBeChecked()
  })

  test('uncontrolled: defaultValue and the form submit', async () => {
    const onValueChange = vi.fn<(value: string, details: RadioGroupChangeDetails) => void>()
    let submitted: FormData | undefined
    await render(
      english(
        <form
          aria-label="Application"
          onSubmit={(event) => {
            event.preventDefault()
            submitted = new FormData(event.currentTarget)
          }}
        >
          <Duration name="duration" defaultValue="6" onValueChange={onValueChange} />
          <button type="submit">Submit</button>
        </form>,
      ),
    )
    await expect.element(page.getByRole('radio', { name: '6 months' })).toBeChecked()
    await userEvent.click(page.getByRole('button', { name: 'Submit' }))
    expect(submitted?.get('duration')).toBe('6')
    await userEvent.click(page.getByRole('radio', { name: '1 month' }))
    expect(onValueChange.mock.calls.at(-1)?.[0]).toBe('1')
    await userEvent.click(page.getByRole('button', { name: 'Submit' }))
    expect(submitted?.get('duration')).toBe('1')
    await expect.element(page.getByRole('radio', { name: '6 months' })).not.toBeChecked()
  })

  test('a Radio in a group without a value warns once', async () => {
    await render(
      <RadioGroup.Root aria-label="Language">
        <RadioGroup.Option>
          <RadioGroup.Radio />
          <Field.Label>A</Field.Label>
        </RadioGroup.Option>
      </RadioGroup.Root>,
    )
    expect(consoleWarn.mock.calls.some(([message]) => String(message).includes('value'))).toBe(true)
  })

  test('data-state is checked or unchecked when the group is controlled, and absent when it is not', async () => {
    await render(
      <>
        <RadioGroup.Root
          aria-label="One"
          name="one"
          value="a"
          onValueChange={vi.fn<(value: string, details: RadioGroupChangeDetails) => void>()}
        >
          <RadioGroup.Option>
            <RadioGroup.Radio value="a" />
            <Field.Label>A</Field.Label>
          </RadioGroup.Option>
          <RadioGroup.Option>
            <RadioGroup.Radio value="b" />
            <Field.Label>B</Field.Label>
          </RadioGroup.Option>
        </RadioGroup.Root>
        <RadioGroup.Root aria-label="Two" name="two" defaultValue="c">
          <RadioGroup.Option>
            <RadioGroup.Radio value="c" />
            <Field.Label>C</Field.Label>
          </RadioGroup.Option>
        </RadioGroup.Root>
      </>,
    )
    await expect
      .element(page.getByRole('radio', { name: 'A' }))
      .toHaveAttribute('data-state', 'checked')
    await expect
      .element(page.getByRole('radio', { name: 'B' }))
      .toHaveAttribute('data-state', 'unchecked')
    await expect.element(page.getByRole('radio', { name: 'C' })).not.toHaveAttribute('data-state')
  })
})

describe('state', () => {
  test('invalid styles every radio and sets no aria-invalid', async () => {
    await render(english(<Duration invalid />))
    for (const [, label] of options) {
      const radio = page.getByRole('radio', { name: label })
      await expect.element(radio).toHaveAttribute('data-invalid', '')
      await expect.element(radio).not.toHaveAttribute('aria-invalid')
    }
  })

  test('an invalid or required Field around a Radio never puts aria-invalid or aria-required on it', async () => {
    await render(
      <RadioGroup.Root aria-label="Language" name="language">
        <Field.Root invalid required>
          <RadioGroup.Radio value="sv" />
          <Field.Label>Swedish</Field.Label>
          <Field.ErrorMessage>Invalid</Field.ErrorMessage>
        </Field.Root>
      </RadioGroup.Root>,
    )
    const radio = page.getByRole('radio', { name: 'Swedish' })
    await expect.element(radio).not.toHaveAttribute('aria-invalid')
    await expect.element(radio).not.toHaveAttribute('aria-required')
    await expect.element(radio).toHaveAttribute('data-invalid', '')
  })

  test('a disabled radio is natively disabled', async () => {
    await render(english(<Duration disabledOption="6" />))
    await expect.element(page.getByRole('radio', { name: '6 months' })).toBeDisabled()
    await expect.element(page.getByRole('radio', { name: '1 month' })).not.toBeDisabled()
  })

  test('disabled disables every radio natively', async () => {
    await render(english(<Duration disabled />))
    expect((page.getByRole('group').element() as HTMLFieldSetElement).disabled).toBe(true)
    for (const [, label] of options) {
      await expect.element(page.getByRole('radio', { name: label })).toBeDisabled()
    }
  })
})

describe('useRadioGroup and useRadio', () => {
  test('give the props for your own radios', async () => {
    const onValueChange = vi.fn<(value: string, details: RadioGroupChangeDetails) => void>()
    function Own() {
      const group = useRadioGroup({ name: 'language', value: 'sv', onValueChange })
      return (
        <fieldset>
          <legend>Own</legend>
          <input type="radio" aria-label="Swedish" value="sv" {...group.getRadioProps('sv')} />
          <input type="radio" aria-label="Finnish" value="fi" {...group.getRadioProps('fi')} />
        </fieldset>
      )
    }
    await render(<Own />)
    await expect.element(page.getByRole('radio', { name: 'Swedish' })).toBeChecked()
    await expect
      .element(page.getByRole('radio', { name: 'Finnish' }))
      .toHaveAttribute('name', 'language')
    await userEvent.click(page.getByRole('radio', { name: 'Finnish' }))
    expect(onValueChange.mock.calls.at(-1)?.[0]).toBe('fi')
  })

  test('useRadio spreads the part props on your own input', async () => {
    function Own() {
      const radio = useRadio({ value: 'sv' })
      return <input aria-label="Own" {...radio.inputProps} />
    }
    await render(<Own />)
    await expect.element(page.getByRole('radio', { name: 'Own' })).toBeVisible()
  })

  test('server markup carries the name, checked and data-state', () => {
    const markup = renderToString(
      <RadioGroup.Root name="duration" value="6" onValueChange={() => {}}>
        <Fieldset.Legend>Time</Fieldset.Legend>
        <Field.Root controlId="sex">
          <RadioGroup.Radio value="6" />
          <Field.Label>6 months</Field.Label>
        </Field.Root>
      </RadioGroup.Root>,
    )
    expect(markup).toContain('type="radio"')
    expect(markup).toContain('name="duration"')
    expect(markup).toContain('data-state="checked"')
    expect(markup).toContain('id="sex"')
  })
})

describe('the group’s own part names', () => {
  test('each part has its own display name, and the flat Radio is the same input', async () => {
    expect(RadioGroup.Option.displayName).toBe('RadioGroup.Option')
    expect(RadioGroup.Radio.displayName).toBe('RadioGroup.Radio')
    expect(RadioGroup.Legend.displayName).toBe('RadioGroup.Legend')
    expect(RadioGroup.Prose.displayName).toBe('RadioGroup.Prose')
    expect(RadioGroup.HelpText.displayName).toBe('RadioGroup.HelpText')
    expect(RadioGroup.ErrorMessage.displayName).toBe('RadioGroup.ErrorMessage')
    await render(
      <RadioGroup.Root name="language" invalid>
        <RadioGroup.Legend>Language</RadioGroup.Legend>
        <RadioGroup.Prose>
          <p>Choose one.</p>
        </RadioGroup.Prose>
        <RadioGroup.ErrorMessage>Choose a language</RadioGroup.ErrorMessage>
        <RadioGroup.Option>
          <Radio value="sv" />
          <Field.Label>Swedish</Field.Label>
        </RadioGroup.Option>
      </RadioGroup.Root>,
    )
    const group = page.getByRole('group', { name: 'Language (optional)' })
    await expect.element(group).toHaveAccessibleDescription('Choose one. Error: Choose a language')
    await expect
      .element(page.getByRole('radio', { name: 'Swedish' }))
      .toHaveAttribute('name', 'language')
  })

  test('RadioGroup.HelpText is the group’s help text: after the description, before the error', async () => {
    await render(
      <RadioGroup.Root name="language" invalid>
        <RadioGroup.Legend>Language</RadioGroup.Legend>
        <RadioGroup.Prose>
          <p>Choose one.</p>
        </RadioGroup.Prose>
        <RadioGroup.Option>
          <RadioGroup.Radio value="sv" />
          <Field.Label>Swedish</Field.Label>
        </RadioGroup.Option>
        <RadioGroup.HelpText data-testid="helpText">You can change this later.</RadioGroup.HelpText>
        <RadioGroup.ErrorMessage>Choose a language</RadioGroup.ErrorMessage>
      </RadioGroup.Root>,
    )
    const group = page.getByRole('group', { name: 'Language (optional)' })
    await expect
      .element(group)
      .toHaveAccessibleDescription(
        'Choose one. You can change this later. Error: Choose a language',
      )
  })
})

describe('keyboard', () => {
  const radio = (name: string) => page.getByRole('radio', { name, exact: true })
  const before = () => page.getByRole('button', { name: 'Tillbaka' })
  const after = () => page.getByRole('button', { name: 'Submit' })
  const checkedValue = () =>
    document.querySelector<HTMLInputElement>('.kv-radio:checked')?.value ?? null

  function recordPreventedKeys() {
    const keys: string[] = []
    const listener = (event: KeyboardEvent) => {
      if (event.defaultPrevented) keys.push(event.key)
    }
    document.addEventListener('keydown', listener)
    return { keys, stop: () => document.removeEventListener('keydown', listener) }
  }

  const surrounded = (group: ReactNode) =>
    english(
      <>
        <button type="button">Tillbaka</button>
        {group}
        <button type="button">Submit</button>
      </>,
    )

  test('Tab enters the group at the first radio when none is checked', async () => {
    await render(surrounded(<Duration name="duration" />))
    before().element().focus()
    await userEvent.tab()
    await expect.element(radio('1 month')).toHaveFocus()
    expect(checkedValue()).toBeNull()
  })

  test('Tab enters the group at the checked radio', async () => {
    await render(surrounded(<Duration name="duration" defaultValue="6" />))
    before().element().focus()
    await userEvent.tab()
    await expect.element(radio('6 months')).toHaveFocus()
  })

  test('Tab leaves the group after one stop', async () => {
    await render(surrounded(<Duration name="duration" defaultValue="6" />))
    before().element().focus()
    await userEvent.tab()
    await userEvent.keyboard('{ArrowDown}')
    await expect.element(radio('12 months')).toHaveFocus()
    await userEvent.tab()
    await expect.element(after()).toHaveFocus()
  })

  test('a controlled group is still one Tab stop after an arrow key', async () => {
    function Controlled() {
      const [value, setValue] = useState('12')
      return <Duration name="duration" value={value} onValueChange={setValue} />
    }
    await render(surrounded(<Controlled />))
    radio('12 months').element().focus()
    await userEvent.keyboard('{ArrowUp}')
    await expect.element(radio('6 months')).toHaveFocus()
    await expect.element(radio('6 months')).toBeChecked()
    await userEvent.tab()
    await expect.element(after()).toHaveFocus()
  })

  test('Shift+Tab enters the group at the last radio when none is checked', async () => {
    await render(surrounded(<Duration name="duration" />))
    after().element().focus()
    await userEvent.tab({ shift: true })
    await expect.element(radio('12 months')).toHaveFocus()
    expect(checkedValue()).toBeNull()
  })

  test('Shift+Tab leaves the group after one stop', async () => {
    await render(surrounded(<Duration name="duration" />))
    radio('1 month').element().focus()
    await userEvent.keyboard('{ArrowDown}')
    await expect.element(radio('6 months')).toBeChecked()
    await userEvent.tab({ shift: true })
    await expect.element(before()).toHaveFocus()
    after().element().focus()
    await userEvent.tab({ shift: true })
    await expect.element(radio('6 months')).toHaveFocus()
  })

  test('ArrowDown and ArrowRight move to the next radio and check it, wrapping', async () => {
    await render(surrounded(<Duration name="duration" />))
    radio('1 month').element().focus()
    const prevented = recordPreventedKeys()
    await userEvent.keyboard('{ArrowDown}')
    await expect.element(radio('6 months')).toHaveFocus()
    await expect.element(radio('6 months')).toBeChecked()
    await userEvent.keyboard('{ArrowRight}')
    await expect.element(radio('12 months')).toHaveFocus()
    await expect.element(radio('12 months')).toBeChecked()
    await userEvent.keyboard('{ArrowDown}')
    await expect.element(radio('1 month')).toHaveFocus()
    await expect.element(radio('1 month')).toBeChecked()
    expect(checkedValue()).toBe('1')
    prevented.stop()
    expect(prevented.keys).toEqual([])
  })

  test('ArrowUp and ArrowLeft move to the previous radio and check it, wrapping', async () => {
    await render(surrounded(<Duration name="duration" />))
    radio('1 month').element().focus()
    await userEvent.keyboard('{ArrowUp}')
    await expect.element(radio('12 months')).toHaveFocus()
    await expect.element(radio('12 months')).toBeChecked()
    await userEvent.keyboard('{ArrowLeft}')
    await expect.element(radio('6 months')).toHaveFocus()
    await expect.element(radio('6 months')).toBeChecked()
    await userEvent.keyboard('{ArrowUp}')
    await expect.element(radio('1 month')).toHaveFocus()
    expect(checkedValue()).toBe('1')
  })

  test('right to left: ArrowLeft moves to the next radio and ArrowRight to the previous', async () => {
    await render(
      english(
        <div dir="rtl">
          <Duration name="duration" />
        </div>,
      ),
    )
    radio('1 month').element().focus()
    await userEvent.keyboard('{ArrowLeft}')
    await expect.element(radio('6 months')).toHaveFocus()
    await expect.element(radio('6 months')).toBeChecked()
    await userEvent.keyboard('{ArrowLeft}')
    await expect.element(radio('12 months')).toHaveFocus()
    await userEvent.keyboard('{ArrowRight}')
    await expect.element(radio('6 months')).toHaveFocus()
    await userEvent.keyboard('{ArrowRight}')
    await expect.element(radio('1 month')).toHaveFocus()
    await expect.element(radio('1 month')).toBeChecked()
    await userEvent.keyboard('{ArrowDown}')
    await expect.element(radio('6 months')).toHaveFocus()
  })

  test('Arrow keys skip a disabled radio', async () => {
    await render(surrounded(<Duration name="duration" disabledOption="6" />))
    await expect.element(radio('6 months')).toBeDisabled()
    before().element().focus()
    await userEvent.tab()
    await expect.element(radio('1 month')).toHaveFocus()
    await userEvent.keyboard('{ArrowDown}')
    await expect.element(radio('12 months')).toHaveFocus()
    await expect.element(radio('12 months')).toBeChecked()
    await userEvent.keyboard('{ArrowUp}')
    await expect.element(radio('1 month')).toHaveFocus()
    await expect.element(radio('6 months')).not.toBeChecked()
  })

  test('Space checks the focused radio', async () => {
    await render(surrounded(<Duration name="duration" />))
    before().element().focus()
    await userEvent.tab()
    const first = radio('1 month')
    await expect.element(first).toHaveFocus()
    await expect.element(first).not.toBeChecked()
    const prevented = recordPreventedKeys()
    await userEvent.keyboard(' ')
    await expect.element(first).toBeChecked()
    await userEvent.keyboard(' ')
    await expect.element(first).toBeChecked()
    await expect.element(first).toHaveFocus()
    prevented.stop()
    expect(prevented.keys).toEqual([])
  })

  test('clicking the label text selects the radio', async () => {
    await render(surrounded(<Duration name="duration" />))
    await userEvent.click(page.getByText('6 months'))
    await expect.element(radio('6 months')).toBeChecked()
    await expect.element(radio('6 months')).toHaveFocus()
  })
})

describe('reveal', () => {
  const politeText = () => document.querySelector('[aria-live="polite"]')?.textContent ?? ''
  const radio = (name: string) => page.getByRole('radio', { name, exact: true })
  const reveal = () => document.querySelector<HTMLElement>('.kv-radio-group-reveal')

  function OtherQuestion(props: Omit<RadioGroupRootProps, 'children'>) {
    return (
      <RadioGroup.Root name="source" {...props}>
        <Fieldset.Legend>How did you hear about us?</Fieldset.Legend>
        <RadioGroup.Option>
          <RadioGroup.Radio value="friend" />
          <Field.Label>Through a friend</Field.Label>
        </RadioGroup.Option>
        <RadioGroup.Option>
          <RadioGroup.Radio value="other" />
          <Field.Label>Other</Field.Label>
        </RadioGroup.Option>
        <RadioGroup.Reveal value="other">
          <Field.Root>
            <Field.Label>Describe</Field.Label>
            <TextInput name="other-text" />
          </Field.Root>
        </RadioGroup.Reveal>
      </RadioGroup.Root>
    )
  }

  test('the reveal is hidden until its radio is checked', async () => {
    await render(english(<OtherQuestion />))
    expect(reveal()?.hidden).toBe(true)
    await userEvent.click(radio('Other'))
    expect(reveal()?.hidden).toBe(false)
  })

  test('checking another radio hides the reveal again and keeps what was typed', async () => {
    await render(english(<OtherQuestion />))
    await userEvent.click(radio('Other'))
    await userEvent.type(page.getByRole('textbox', { name: /Describe/ }), 'Radio')
    await userEvent.click(radio('Through a friend'))
    expect(reveal()?.hidden).toBe(true)
    await userEvent.click(radio('Other'))
    await expect.element(page.getByRole('textbox', { name: /Describe/ })).toHaveValue('Radio')
  })

  test('focus stays on the radio when the field appears', async () => {
    await render(english(<OtherQuestion />))
    await userEvent.click(radio('Other'))
    await expect.element(radio('Other')).toHaveFocus()
  })

  test('Tab from the checked radio skips the hidden reveal field and leaves the group', async () => {
    await render(
      english(
        <>
          <OtherQuestion defaultValue="friend" />
          <button type="button">Submit</button>
        </>,
      ),
    )
    radio('Through a friend').element().focus()
    await userEvent.tab()
    await expect.element(page.getByRole('button', { name: 'Submit' })).toHaveFocus()
  })

  test('the reveal follows its radio’s option in DOM order', async () => {
    await render(english(<OtherQuestion />))
    const radioOption = radio('Other').element().closest('.kv-option')
    expect(radioOption?.nextElementSibling).toBe(reveal())
  })

  test('the radio points at the reveal with aria-controls, the others do not', async () => {
    await render(english(<OtherQuestion />))
    expect(radio('Other').element().getAttribute('aria-controls')).toBe(reveal()?.id)
    expect(reveal()?.id).not.toBe('')
    expect(radio('Through a friend').element().hasAttribute('aria-controls')).toBe(false)
  })

  const settle = () => new Promise((resolve) => setTimeout(resolve, 400))
  const shown = `polite: ${en.radioGroup.revealShown}`

  test('it is announced politely, exactly once, when the user checks the radio', async () => {
    const { container } = await render(english(<OtherQuestion />))
    const announcements = await readAnnouncements(container, async () => {
      await userEvent.click(radio('Other'))
    })
    expect(announcements).toEqual([shown])
  })

  test('it is announced again when the user returns to the radio within three seconds', async () => {
    const { container } = await render(english(<OtherQuestion />))
    await userEvent.click(radio('Other'))
    await settle()
    await userEvent.click(radio('Through a friend'))
    const announcements = await readAnnouncements(container, async () => {
      await userEvent.click(radio('Other'))
    })
    expect(announcements).toEqual([shown])
  })

  test('a second group is announced within three seconds of the first', async () => {
    const { container } = await render(
      english(
        <>
          <OtherQuestion name="first" />
          <OtherQuestion name="second" />
        </>,
      ),
    )
    await userEvent.click(page.getByRole('radio', { name: 'Other' }).first())
    await settle()
    const announcements = await readAnnouncements(container, async () => {
      await userEvent.click(page.getByRole('radio', { name: 'Other' }).nth(1))
    })
    expect(announcements).toEqual([shown])
  })

  test('it is not announced on mount with a checked radio', async () => {
    await render(english(<OtherQuestion defaultValue="other" />))
    await settle()
    expect(reveal()?.hidden).toBe(false)
    expect(politeText()).toBe('')
  })

  test('it is not announced when a controlled value is set from outside', async () => {
    function Outside() {
      const [value, setValue] = useState<string | null>(null)
      return (
        <>
          <button type="button" onClick={() => setValue('other')}>
            Set
          </button>
          <OtherQuestion value={value} onValueChange={setValue} />
        </>
      )
    }
    await render(english(<Outside />))
    await userEvent.click(page.getByRole('button', { name: 'Set' }))
    await settle()
    expect(reveal()?.hidden).toBe(false)
    expect(politeText()).toBe('')
  })

  test('it is not announced when the reveal is hidden', async () => {
    await render(english(<OtherQuestion defaultValue="other" />))
    await userEvent.click(radio('Through a friend'))
    await settle()
    expect(reveal()?.hidden).toBe(true)
    expect(politeText()).toBe('')
  })

  test('it is not announced when a form reset hides it', async () => {
    await render(
      english(
        <form>
          <OtherQuestion defaultValue="friend" />
          <button type="reset">Reset</button>
        </form>,
      ),
    )
    await userEvent.click(radio('Other'))
    await settle()
    await expect(
      readAnnouncements(
        document.body,
        async () => {
          await userEvent.click(page.getByRole('button', { name: 'Reset' }))
        },
        { timeout: 600 },
      ),
    ).rejects.toThrow('No live-region announcement')
    await vi.waitFor(() => {
      expect(reveal()?.hidden).toBe(true)
    })
  })

  test('a required Field in the reveal is required', async () => {
    await render(
      english(
        <RadioGroup.Root name="source" defaultValue="other">
          <RadioGroup.Option>
            <RadioGroup.Radio value="other" />
            <Field.Label>Other</Field.Label>
          </RadioGroup.Option>
          <RadioGroup.Reveal value="other">
            <Field.Root required>
              <Field.Label>Describe</Field.Label>
              <TextInput />
            </Field.Root>
          </RadioGroup.Reveal>
        </RadioGroup.Root>,
      ),
    )
    await expect.element(page.getByRole('textbox', { name: /Describe/ })).toBeRequired()
  })

  test('a help text in the reveal is not in the group’s description', async () => {
    await render(
      english(
        <RadioGroup.Root name="source" defaultValue="other">
          <RadioGroup.Legend>How?</RadioGroup.Legend>
          <RadioGroup.Option>
            <RadioGroup.Radio value="other" />
            <Field.Label>Other</Field.Label>
          </RadioGroup.Option>
          <RadioGroup.Reveal value="other">
            <Field.Root>
              <Field.Label>Describe</Field.Label>
              <TextInput />
              <Field.HelpText>A few words</Field.HelpText>
            </Field.Root>
          </RadioGroup.Reveal>
        </RadioGroup.Root>,
      ),
    )
    const group = page.getByRole('group').element()
    expect(group.getAttribute('aria-describedby') ?? '').toBe('')
    await expect
      .element(page.getByRole('textbox', { name: /Describe/ }))
      .toHaveAccessibleDescription('A few words')
  })

  describe('read aloud', () => {
    const controlling = 'radio, Other, not checked, 1 control, position 2, set size 2'
    const field = 'textbox, Describe (optional)'

    test('entering the group reads the radios, the controlling one with its control, and no field', async () => {
      const { container } = await render(english(<OtherQuestion />))
      const phrases = await readAloud(container)
      expect(phrases).toContain('group, How did you hear about us? (optional)')
      expect(phrases).toContain('radio, Through a friend, not checked, position 1, set size 2')
      expect(phrases).toContain(controlling)
      expect(phrases).not.toContain(field)
    })

    test('after checking Other the field is read straight after its radio', async () => {
      const { container } = await render(english(<OtherQuestion />))
      await userEvent.click(radio('Other'))
      await settle()
      const phrases = await readAloud(container)
      expect(phrases.indexOf(field)).toBeGreaterThan(phrases.indexOf(controlling))
      expect(phrases.filter((phrase) => phrase.startsWith('radio'))).toHaveLength(2)
    })

    test('the field reads its label and optional marker as a textbox', async () => {
      const { container } = await render(english(<OtherQuestion defaultValue="other" />))
      const phrases = await readAloud(container)
      expect(phrases).toContain('radio, Other, checked, 1 control, position 2, set size 2')
      expect(phrases).toContain(field)
    })

    test('checking another option removes the field from the reading order', async () => {
      const { container } = await render(english(<OtherQuestion defaultValue="other" />))
      await userEvent.click(radio('Through a friend'))
      const phrases = await readAloud(container)
      expect(phrases).not.toContain(field)
      expect(phrases).not.toContain('Describe')
    })

    test('a form reset removes the field from the reading order', async () => {
      const { container } = await render(
        english(
          <form>
            <OtherQuestion />
            <button type="reset">Reset</button>
          </form>,
        ),
      )
      await userEvent.click(radio('Other'))
      await userEvent.click(page.getByRole('button', { name: 'Reset' }))
      await vi.waitFor(() => {
        expect(reveal()?.hidden).toBe(true)
      })
      expect(await readAloud(container)).not.toContain(field)
    })
  })

  test('a Reveal outside a RadioGroup warns once', async () => {
    await render(
      english(
        <RadioGroup.Reveal value="other">
          <p>More</p>
        </RadioGroup.Reveal>,
      ),
    )
    expect(consoleWarn).toHaveBeenCalledTimes(1)
  })

  test('the message can be overridden per instance', async () => {
    await render(
      english(
        <RadioGroup.Root name="source">
          <RadioGroup.Option>
            <RadioGroup.Radio value="other" />
            <Field.Label>Other</Field.Label>
          </RadioGroup.Option>
          <RadioGroup.Reveal value="other" messages={{ revealShown: 'Write more below' }}>
            <p>More</p>
          </RadioGroup.Reveal>
        </RadioGroup.Root>,
      ),
    )
    await userEvent.click(radio('Other'))
    await vi.waitFor(() => {
      expect(politeText()).toBe('Write more below')
    })
  })

  test('ArrowDown moves from the radio to the next radio, not into the revealed field', async () => {
    await render(english(<OtherQuestion defaultValue="friend" />))
    radio('Through a friend').element().focus()
    await userEvent.keyboard('{ArrowDown}')
    await expect.element(radio('Other')).toHaveFocus()
    await userEvent.keyboard('{ArrowDown}')
    await expect.element(radio('Through a friend')).toHaveFocus()
  })

  test('Tab from the checked radio reaches the revealed field', async () => {
    await render(english(<OtherQuestion defaultValue="other" />))
    radio('Other').element().focus()
    await userEvent.tab()
    await expect.element(page.getByRole('textbox', { name: /Describe/ })).toHaveFocus()
  })

  test('ArrowUp moves from the second radio back to the first, past the revealed field', async () => {
    await render(english(<OtherQuestion defaultValue="other" />))
    radio('Other').element().focus()
    await userEvent.keyboard('{ArrowUp}')
    await expect.element(radio('Through a friend')).toHaveFocus()
  })

  test('Tab from the revealed field continues after the group', async () => {
    await render(
      english(
        <>
          <OtherQuestion defaultValue="other" />
          <button type="button">Submit</button>
        </>,
      ),
    )
    radio('Other').element().focus()
    await userEvent.tab()
    await userEvent.tab()
    await expect.element(page.getByRole('button', { name: 'Submit' })).toHaveFocus()
  })

  test('Shift+Tab from the revealed field returns to the radio', async () => {
    await render(english(<OtherQuestion defaultValue="other" />))
    await userEvent.click(page.getByRole('textbox', { name: /Describe/ }))
    await userEvent.tab({ shift: true })
    await expect.element(radio('Other')).toHaveFocus()
  })
})

describe('types', () => {
  test('exports the prop, option and result types', () => {
    expectTypeOf<RadioGroupRootProps['value']>().toEqualTypeOf<string | null | undefined>()
    expectTypeOf<RadioGroupRootProps['onValueChange']>().toEqualTypeOf<
      ((value: string, details: RadioGroupChangeDetails) => void) | undefined
    >()
    expectTypeOf<UseRadioGroupOptions['defaultValue']>().toEqualTypeOf<string | undefined>()
    expectTypeOf<UseRadioGroupResult['getRadioProps']>().parameter(0).toEqualTypeOf<string>()
    expectTypeOf<RadioProps['value']>().toEqualTypeOf<string | undefined>()
    expectTypeOf<RadioPartProps['className']>().toEqualTypeOf<'kv-radio'>()
    expectTypeOf<UseRadioResult['inputProps']>().toEqualTypeOf<RadioPartProps>()
  })
})
