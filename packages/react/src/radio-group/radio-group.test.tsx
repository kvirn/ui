import { sv } from '@kvirn-ui/i18n/sv'
import { expectNoA11yViolations } from '@kvirn-ui/testing'
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
import { KvirnProvider } from '../provider/kvirn-provider.tsx'
import { Radio } from './radio.tsx'
import type { RadioProps, RadioState } from './radio.tsx'
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

const sweden = (children: ReactNode) => (
  <KvirnProvider locale="sv-SE" messages={sv}>
    {children}
  </KvirnProvider>
)

const options = [
  ['1', '1 månad'],
  ['6', '6 månader'],
  ['12', '12 månader'],
] as const

interface DurationProps extends Omit<RadioGroupRootProps, 'children'> {
  disabledOption?: string
  optionHelpText?: boolean
}

/** The design spec's duration question, in Swedish. */
function Duration({ disabledOption, optionHelpText = false, ...rootProps }: DurationProps) {
  return (
    <RadioGroup.Root {...rootProps}>
      <Fieldset.Legend>Hur länge behöver du tillståndet?</Fieldset.Legend>
      <RadioGroup.Prose>Välj ett alternativ.</RadioGroup.Prose>
      {options.map(([value, label]) => (
        <Field.Root key={value}>
          <RadioGroup.Radio value={value} disabled={value === disabledOption} />
          <Field.Label>{label}</Field.Label>
          {optionHelpText && value === '12' ? (
            <Field.HelpText>Lägst pris per månad.</Field.HelpText>
          ) : null}
        </Field.Root>
      ))}
      <Fieldset.ErrorMessage>Välj hur länge du behöver tillståndet</Fieldset.ErrorMessage>
    </RadioGroup.Root>
  )
}

describe('rendering', () => {
  test('renders a group with its part classes, a <legend> first, and forwards ref and props', async () => {
    const ref = createRef<HTMLFieldSetElement>()
    const { container } = await render(
      <RadioGroup.Root ref={ref} className="egen" data-testid="root" lang="sv">
        <Fieldset.Legend data-testid="legend">Språk</Fieldset.Legend>
      </RadioGroup.Root>,
    )
    const root = page.getByTestId('root').element()
    expect(ref.current).toBe(root)
    expect(container.firstElementChild).toBe(root)
    expect(root.classList.contains('kv-radio-group')).toBe(true)
    expect(root.classList.contains('kv-fieldset')).toBe(true)
    expect(root.classList.contains('egen')).toBe(true)
    expect(root.hasAttribute('name')).toBe(false)
    expect(root.firstElementChild).toBe(page.getByTestId('legend').element())
  })

  test('a Radio is a native <input type="radio"> with its class, no ARIA role', async () => {
    const ref = createRef<HTMLInputElement>()
    await render(
      <RadioGroup.Root aria-label="Språk" name="language">
        <Field.Root>
          <RadioGroup.Radio ref={ref} value="sv" className="egen" data-egen="" />
          <Field.Label>Svenska</Field.Label>
        </Field.Root>
      </RadioGroup.Root>,
    )
    const radio = page.getByRole('radio', { name: 'Svenska' })
    expect(ref.current).toBe(radio.element())
    await expect.element(radio).toHaveAttribute('type', 'radio')
    await expect.element(radio).toHaveClass('egen', 'kv-radio')
    await expect.element(radio).toHaveAttribute('value', 'sv')
    await expect.element(radio).toHaveAttribute('data-egen', '')
    await expect.element(radio).not.toHaveAttribute('role')
    await expect.element(radio).not.toHaveAttribute('aria-checked')
  })

  test('the group is named by its legend and described by its help text and error', async () => {
    const { container } = await render(sweden(<Duration invalid />))
    const group = page.getByRole('group', { name: 'Hur länge behöver du tillståndet? (valfritt)' })
    await expect
      .element(group)
      .toHaveAccessibleDescription(
        'Välj ett alternativ. Fel: Välj hur länge du behöver tillståndet',
      )
    expectNoDanglingReferences(container)
    await expectNoA11yViolations(container)
    expect(consoleWarn).not.toHaveBeenCalled()
  })

  test('a required group has no optional marker and carries data-required', async () => {
    await render(sweden(<Duration required />))
    const group = page.getByRole('group', {
      name: 'Hur länge behöver du tillståndet?',
      exact: true,
    })
    await expect.element(group).toHaveAttribute('data-required', '')
    await expect.element(group).not.toHaveAttribute('aria-required')
  })

  test('an option’s own help text is in that radio’s description', async () => {
    await render(sweden(<Duration optionHelpText />))
    await expect
      .element(page.getByRole('radio', { name: '12 månader' }))
      .toHaveAccessibleDescription('Lägst pris per månad.')
  })

  test('an option help text is a Field.HelpText in that option’s Field, outside its label, and has no axe violations', async () => {
    const { container } = await render(sweden(<Duration optionHelpText />))
    const helpText = page.getByText('Lägst pris per månad.').element()
    expect(helpText.id).not.toBe('')
    // It is a sibling of the label, not inside it, so it isn't part of the radio's name or target.
    expect(helpText.closest('label')).toBeNull()
    await expect.element(page.getByRole('radio', { name: '12 månader', exact: true })).toBeVisible()
    // The group's description is its own help text, not the option's.
    await expect
      .element(page.getByRole('group', { name: 'Hur länge behöver du tillståndet? (valfritt)' }))
      .toHaveAccessibleDescription('Välj ett alternativ.')
    expectNoDanglingReferences(container)
    await expectNoA11yViolations(container)
    expect(consoleWarn).not.toHaveBeenCalled()
  })

  test('render as a function gets the part’s props and the state', async () => {
    const seenStates: RadioState[] = []
    await render(
      <RadioGroup.Root aria-label="Språk" name="language" invalid>
        <Field.Root>
          <RadioGroup.Radio
            value="sv"
            render={(partProps, state) => {
              seenStates.push(state)
              return <input {...partProps} data-egen="" />
            }}
          />
          <Field.Label>Svenska</Field.Label>
        </Field.Root>
      </RadioGroup.Root>,
    )
    await expect.element(page.getByRole('radio')).toHaveAttribute('data-egen', '')
    expect(seenStates.at(-1)).toEqual({
      isInvalid: true,
      isDisabled: false,
      isChecked: undefined,
    })
  })
})

describe('name', () => {
  test('every radio gets the group’s name, generated when missing', async () => {
    await render(
      <>
        <RadioGroup.Root aria-label="Ett" name="eget">
          <Field.Root>
            <RadioGroup.Radio value="a" />
            <Field.Label>A</Field.Label>
          </Field.Root>
        </RadioGroup.Root>
        <RadioGroup.Root aria-label="Två">
          <Field.Root>
            <RadioGroup.Radio value="b" />
            <Field.Label>B</Field.Label>
          </Field.Root>
          <Field.Root>
            <RadioGroup.Radio value="c" />
            <Field.Label>C</Field.Label>
          </Field.Root>
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
    await render(sweden(<Controlled />))
    await expect.element(page.getByRole('radio', { name: '6 månader' })).toBeChecked()
    await userEvent.click(page.getByRole('radio', { name: '12 månader' }))
    expect(onValueChange.mock.calls.at(-1)?.[0]).toBe('12')
    expect(onValueChange.mock.calls.at(-1)?.[1].reason).toBe('input')
    expect(onValueChange.mock.calls.at(-1)?.[1].event.type).toBe('change')
    await expect.element(page.getByRole('radio', { name: '12 månader' })).toBeChecked()
    await expect.element(page.getByRole('radio', { name: '6 månader' })).not.toBeChecked()
    await expect.element(page.getByTestId('value')).toHaveTextContent('12')
  })

  test('value={null} is controlled with nothing selected', async () => {
    await render(
      sweden(
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
    await userEvent.click(page.getByRole('radio', { name: '1 månad' }))
    // The parent did not update value, so nothing is checked.
    await expect.element(page.getByRole('radio', { name: '1 månad' })).not.toBeChecked()
  })

  test('uncontrolled: defaultValue and the form submit', async () => {
    const onValueChange = vi.fn<(value: string, details: RadioGroupChangeDetails) => void>()
    let submitted: FormData | undefined
    await render(
      sweden(
        <form
          aria-label="Ansökan"
          onSubmit={(event) => {
            event.preventDefault()
            submitted = new FormData(event.currentTarget)
          }}
        >
          <Duration name="duration" defaultValue="6" onValueChange={onValueChange} />
          <button type="submit">Skicka</button>
        </form>,
      ),
    )
    await expect.element(page.getByRole('radio', { name: '6 månader' })).toBeChecked()
    await userEvent.click(page.getByRole('button', { name: 'Skicka' }))
    expect(submitted?.get('duration')).toBe('6')
    await userEvent.click(page.getByRole('radio', { name: '1 månad' }))
    expect(onValueChange.mock.calls.at(-1)?.[0]).toBe('1')
    await userEvent.click(page.getByRole('button', { name: 'Skicka' }))
    expect(submitted?.get('duration')).toBe('1')
    await expect.element(page.getByRole('radio', { name: '6 månader' })).not.toBeChecked()
  })

  test('a Radio in a group without a value warns once', async () => {
    await render(
      <RadioGroup.Root aria-label="Språk">
        <Field.Root>
          <RadioGroup.Radio />
          <Field.Label>A</Field.Label>
        </Field.Root>
      </RadioGroup.Root>,
    )
    expect(consoleWarn.mock.calls.some(([message]) => String(message).includes('value'))).toBe(true)
  })

  test('data-state is checked or unchecked when the group is controlled, and absent when it is not', async () => {
    await render(
      <>
        <RadioGroup.Root
          aria-label="Ett"
          name="ett"
          value="a"
          onValueChange={vi.fn<(value: string, details: RadioGroupChangeDetails) => void>()}
        >
          <Field.Root>
            <RadioGroup.Radio value="a" />
            <Field.Label>A</Field.Label>
          </Field.Root>
          <Field.Root>
            <RadioGroup.Radio value="b" />
            <Field.Label>B</Field.Label>
          </Field.Root>
        </RadioGroup.Root>
        <RadioGroup.Root aria-label="Två" name="två" defaultValue="c">
          <Field.Root>
            <RadioGroup.Radio value="c" />
            <Field.Label>C</Field.Label>
          </Field.Root>
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
    await render(sweden(<Duration invalid />))
    for (const [, label] of options) {
      const radio = page.getByRole('radio', { name: label })
      await expect.element(radio).toHaveAttribute('data-invalid', '')
      await expect.element(radio).not.toHaveAttribute('aria-invalid')
    }
  })

  test('an invalid or required Field around a Radio never puts aria-invalid or aria-required on it', async () => {
    await render(
      <RadioGroup.Root aria-label="Språk" name="language">
        <Field.Root invalid required>
          <RadioGroup.Radio value="sv" />
          <Field.Label>Svenska</Field.Label>
          <Field.ErrorMessage>Fel</Field.ErrorMessage>
        </Field.Root>
      </RadioGroup.Root>,
    )
    const radio = page.getByRole('radio', { name: 'Svenska' })
    await expect.element(radio).not.toHaveAttribute('aria-invalid')
    await expect.element(radio).not.toHaveAttribute('aria-required')
    await expect.element(radio).toHaveAttribute('data-invalid', '')
  })

  test('a disabled radio is natively disabled', async () => {
    await render(sweden(<Duration disabledOption="6" />))
    await expect.element(page.getByRole('radio', { name: '6 månader' })).toBeDisabled()
    await expect.element(page.getByRole('radio', { name: '1 månad' })).not.toBeDisabled()
  })

  test('disabled disables every radio natively', async () => {
    await render(sweden(<Duration disabled />))
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
      const group = useRadioGroup({ name: 'språk', value: 'sv', onValueChange })
      return (
        <fieldset>
          <legend>Egen</legend>
          <input type="radio" aria-label="Svenska" value="sv" {...group.getRadioProps('sv')} />
          <input type="radio" aria-label="Finska" value="fi" {...group.getRadioProps('fi')} />
        </fieldset>
      )
    }
    await render(<Own />)
    await expect.element(page.getByRole('radio', { name: 'Svenska' })).toBeChecked()
    await expect
      .element(page.getByRole('radio', { name: 'Finska' }))
      .toHaveAttribute('name', 'språk')
    await userEvent.click(page.getByRole('radio', { name: 'Finska' }))
    expect(onValueChange.mock.calls.at(-1)?.[0]).toBe('fi')
  })

  test('useRadio spreads the part props on your own input', async () => {
    function Own() {
      const radio = useRadio({ value: 'sv' })
      return <input aria-label="Egen" {...radio.inputProps} />
    }
    await render(<Own />)
    await expect.element(page.getByRole('radio', { name: 'Egen' })).toBeVisible()
  })

  test('server markup carries the name, checked and data-state', () => {
    const markup = renderToString(
      <RadioGroup.Root name="duration" value="6" onValueChange={() => {}}>
        <Fieldset.Legend>Tid</Fieldset.Legend>
        <Field.Root controlId="sex">
          <RadioGroup.Radio value="6" />
          <Field.Label>6 månader</Field.Label>
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
    expect(RadioGroup.Radio.displayName).toBe('RadioGroup.Radio')
    expect(RadioGroup.Legend.displayName).toBe('RadioGroup.Legend')
    expect(RadioGroup.Prose.displayName).toBe('RadioGroup.Prose')
    expect(RadioGroup.HelpText.displayName).toBe('RadioGroup.HelpText')
    expect(RadioGroup.ErrorMessage.displayName).toBe('RadioGroup.ErrorMessage')
    await render(
      <RadioGroup.Root name="language" invalid>
        <RadioGroup.Legend>Språk</RadioGroup.Legend>
        <RadioGroup.Prose>
          <p>Välj ett.</p>
        </RadioGroup.Prose>
        <RadioGroup.ErrorMessage>Välj språk</RadioGroup.ErrorMessage>
        <Field.Root>
          <Radio value="sv" />
          <Field.Label>Svenska</Field.Label>
        </Field.Root>
      </RadioGroup.Root>,
    )
    const group = page.getByRole('group', { name: 'Språk (optional)' })
    await expect.element(group).toHaveAccessibleDescription('Välj ett. Error: Välj språk')
    await expect
      .element(page.getByRole('radio', { name: 'Svenska' }))
      .toHaveAttribute('name', 'language')
  })

  test('RadioGroup.HelpText is the group’s help text: after the description, before the error', async () => {
    await render(
      <RadioGroup.Root name="language" invalid>
        <RadioGroup.Legend>Språk</RadioGroup.Legend>
        <RadioGroup.Prose>
          <p>Välj ett.</p>
        </RadioGroup.Prose>
        <Field.Root>
          <RadioGroup.Radio value="sv" />
          <Field.Label>Svenska</Field.Label>
        </Field.Root>
        <RadioGroup.HelpText data-testid="helpText">Du kan byta senare.</RadioGroup.HelpText>
        <RadioGroup.ErrorMessage>Välj språk</RadioGroup.ErrorMessage>
      </RadioGroup.Root>,
    )
    const group = page.getByRole('group', { name: 'Språk (optional)' })
    await expect
      .element(group)
      .toHaveAccessibleDescription('Välj ett. Du kan byta senare. Error: Välj språk')
  })
})

describe('keyboard', () => {
  const radio = (name: string) => page.getByRole('radio', { name, exact: true })
  const before = () => page.getByRole('button', { name: 'Tillbaka' })
  const after = () => page.getByRole('button', { name: 'Skicka' })
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
    sweden(
      <>
        <button type="button">Tillbaka</button>
        {group}
        <button type="button">Skicka</button>
      </>,
    )

  test('Tab enters the group at the first radio when none is checked', async () => {
    await render(surrounded(<Duration name="duration" />))
    before().element().focus()
    await userEvent.tab()
    await expect.element(radio('1 månad')).toHaveFocus()
    expect(checkedValue()).toBeNull()
  })

  test('Tab enters the group at the checked radio', async () => {
    await render(surrounded(<Duration name="duration" defaultValue="6" />))
    before().element().focus()
    await userEvent.tab()
    await expect.element(radio('6 månader')).toHaveFocus()
  })

  test('Tab leaves the group after one stop', async () => {
    await render(surrounded(<Duration name="duration" defaultValue="6" />))
    before().element().focus()
    await userEvent.tab()
    await userEvent.keyboard('{ArrowDown}')
    await expect.element(radio('12 månader')).toHaveFocus()
    await userEvent.tab()
    await expect.element(after()).toHaveFocus()
  })

  test('a controlled group is still one Tab stop after an arrow key', async () => {
    function Controlled() {
      const [value, setValue] = useState('12')
      return <Duration name="duration" value={value} onValueChange={setValue} />
    }
    await render(surrounded(<Controlled />))
    radio('12 månader').element().focus()
    await userEvent.keyboard('{ArrowUp}')
    await expect.element(radio('6 månader')).toHaveFocus()
    await expect.element(radio('6 månader')).toBeChecked()
    await userEvent.tab()
    await expect.element(after()).toHaveFocus()
  })

  test('Shift+Tab enters the group at the last radio when none is checked', async () => {
    await render(surrounded(<Duration name="duration" />))
    after().element().focus()
    await userEvent.tab({ shift: true })
    await expect.element(radio('12 månader')).toHaveFocus()
    expect(checkedValue()).toBeNull()
  })

  test('Shift+Tab leaves the group after one stop', async () => {
    await render(surrounded(<Duration name="duration" />))
    radio('1 månad').element().focus()
    await userEvent.keyboard('{ArrowDown}')
    await expect.element(radio('6 månader')).toBeChecked()
    await userEvent.tab({ shift: true })
    await expect.element(before()).toHaveFocus()
    after().element().focus()
    await userEvent.tab({ shift: true })
    await expect.element(radio('6 månader')).toHaveFocus()
  })

  test('ArrowDown and ArrowRight move to the next radio and check it, wrapping', async () => {
    await render(surrounded(<Duration name="duration" />))
    radio('1 månad').element().focus()
    const prevented = recordPreventedKeys()
    await userEvent.keyboard('{ArrowDown}')
    await expect.element(radio('6 månader')).toHaveFocus()
    await expect.element(radio('6 månader')).toBeChecked()
    await userEvent.keyboard('{ArrowRight}')
    await expect.element(radio('12 månader')).toHaveFocus()
    await expect.element(radio('12 månader')).toBeChecked()
    await userEvent.keyboard('{ArrowDown}')
    await expect.element(radio('1 månad')).toHaveFocus()
    await expect.element(radio('1 månad')).toBeChecked()
    expect(checkedValue()).toBe('1')
    prevented.stop()
    expect(prevented.keys).toEqual([])
  })

  test('ArrowUp and ArrowLeft move to the previous radio and check it, wrapping', async () => {
    await render(surrounded(<Duration name="duration" />))
    radio('1 månad').element().focus()
    await userEvent.keyboard('{ArrowUp}')
    await expect.element(radio('12 månader')).toHaveFocus()
    await expect.element(radio('12 månader')).toBeChecked()
    await userEvent.keyboard('{ArrowLeft}')
    await expect.element(radio('6 månader')).toHaveFocus()
    await expect.element(radio('6 månader')).toBeChecked()
    await userEvent.keyboard('{ArrowUp}')
    await expect.element(radio('1 månad')).toHaveFocus()
    expect(checkedValue()).toBe('1')
  })

  test('right to left: ArrowLeft moves to the next radio and ArrowRight to the previous', async () => {
    await render(
      sweden(
        <div dir="rtl">
          <Duration name="duration" />
        </div>,
      ),
    )
    radio('1 månad').element().focus()
    await userEvent.keyboard('{ArrowLeft}')
    await expect.element(radio('6 månader')).toHaveFocus()
    await expect.element(radio('6 månader')).toBeChecked()
    await userEvent.keyboard('{ArrowLeft}')
    await expect.element(radio('12 månader')).toHaveFocus()
    await userEvent.keyboard('{ArrowRight}')
    await expect.element(radio('6 månader')).toHaveFocus()
    await userEvent.keyboard('{ArrowRight}')
    await expect.element(radio('1 månad')).toHaveFocus()
    await expect.element(radio('1 månad')).toBeChecked()
    await userEvent.keyboard('{ArrowDown}')
    await expect.element(radio('6 månader')).toHaveFocus()
  })

  test('Arrow keys skip a disabled radio', async () => {
    await render(surrounded(<Duration name="duration" disabledOption="6" />))
    await expect.element(radio('6 månader')).toBeDisabled()
    before().element().focus()
    await userEvent.tab()
    await expect.element(radio('1 månad')).toHaveFocus()
    await userEvent.keyboard('{ArrowDown}')
    await expect.element(radio('12 månader')).toHaveFocus()
    await expect.element(radio('12 månader')).toBeChecked()
    await userEvent.keyboard('{ArrowUp}')
    await expect.element(radio('1 månad')).toHaveFocus()
    await expect.element(radio('6 månader')).not.toBeChecked()
  })

  test('Space checks the focused radio', async () => {
    await render(surrounded(<Duration name="duration" />))
    before().element().focus()
    await userEvent.tab()
    const first = radio('1 månad')
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
    await userEvent.click(page.getByText('6 månader'))
    await expect.element(radio('6 månader')).toBeChecked()
    await expect.element(radio('6 månader')).toHaveFocus()
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
