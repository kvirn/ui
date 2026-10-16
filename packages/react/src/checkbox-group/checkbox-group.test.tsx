import { expectNoA11yViolations } from '@kvirn-ui/testing'
import { createRef, useState } from 'react'
import type { ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, expectTypeOf, test, vi } from 'vite-plus/test'
import type { MockInstance } from 'vite-plus/test'
import { page, userEvent } from 'vite-plus/test/browser'
import { renderToString } from 'react-dom/server'
import { render } from 'vitest-browser-react'
import { Checkbox } from '../checkbox/checkbox.tsx'
import { resetDevWarnings } from '../dev/dev-warning.ts'
import { Field } from '../field/field.tsx'
import { Fieldset } from '../fieldset/fieldset.tsx'
import { KvirnProvider } from '../provider/kvirn-provider.tsx'
import { CheckboxGroup } from './checkbox-group.tsx'
import type { CheckboxGroupRootProps } from './checkbox-group.tsx'
import { useCheckboxGroup } from './use-checkbox-group.ts'
import type {
  CheckboxGroupChangeDetails,
  UseCheckboxGroupOptions,
  UseCheckboxGroupResult,
} from './use-checkbox-group.ts'

// Contract: checkbox-group.a11y.md. The keyboard rows are in the `keyboard` block.

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
  ['email', 'Email'],
  ['text', 'Sms'],
  ['letter', 'Brev'],
] as const

interface ContactProps extends Omit<CheckboxGroupRootProps, 'children'> {
  withDescription?: boolean
  optionHelpText?: boolean
}

/** The design spec's contact question, in Swedish. */
function Contact({ withDescription = true, optionHelpText = false, ...rootProps }: ContactProps) {
  return (
    <CheckboxGroup.Root {...rootProps}>
      <Fieldset.Legend>How should we contact you?</Fieldset.Legend>
      {withDescription ? <CheckboxGroup.Prose>Select all that apply.</CheckboxGroup.Prose> : null}
      {options.map(([value, label]) => (
        <Field.Root key={value}>
          <Checkbox value={value} />
          <Field.Label>{label}</Field.Label>
          {optionHelpText && value === 'letter' ? (
            <Field.HelpText>Takes a few extra days.</Field.HelpText>
          ) : null}
        </Field.Root>
      ))}
      <Fieldset.ErrorMessage>Choose how we should contact you</Fieldset.ErrorMessage>
    </CheckboxGroup.Root>
  )
}

describe('rendering', () => {
  test('renders a group with its part classes, a <legend> first, and forwards ref and props', async () => {
    const ref = createRef<HTMLFieldSetElement>()
    const { container } = await render(
      <CheckboxGroup.Root ref={ref} className="egen" data-testid="root">
        <Fieldset.Legend data-testid="legend">Contact</Fieldset.Legend>
      </CheckboxGroup.Root>,
    )
    const root = page.getByTestId('root').element()
    expect(ref).toHaveProperty('current', root)
    expect(container.firstElementChild).toBe(root)
    expect(root.classList.contains('kv-checkbox-group')).toBe(true)
    expect(root.classList.contains('kv-fieldset')).toBe(true)
    expect(root.classList.contains('egen')).toBe(true)
    // The group's `name` is not a fieldset attribute.
    expect(root.hasAttribute('name')).toBe(false)
    expect(root.firstElementChild).toBe(page.getByTestId('legend').element())
  })

  test('the group is named by its legend and described by its help text and error', async () => {
    const { container } = await render(english(<Contact invalid />))
    const group = page.getByRole('group', { name: 'How should we contact you? (optional)' })
    await expect
      .element(group)
      .toHaveAccessibleDescription('Select all that apply. Error: Choose how we should contact you')
    await expect.element(group).toHaveAttribute('data-invalid', '')
    expectNoDanglingReferences(container)
    await expectNoA11yViolations(container)
    expect(consoleWarn).not.toHaveBeenCalled()
  })

  test('options carry no optional marker, and the legend does, unless the group is required', async () => {
    await render(
      english(
        <>
          <Contact />
          <CheckboxGroup.Root required>
            <Fieldset.Legend>Required question</Fieldset.Legend>
            <Field.Root>
              <Checkbox value="a" />
              <Field.Label>Option A</Field.Label>
            </Field.Root>
          </CheckboxGroup.Root>
        </>,
      ),
    )
    await expect.element(page.getByRole('checkbox', { name: 'Email', exact: true })).toBeVisible()
    await expect
      .element(page.getByRole('group', { name: 'How should we contact you? (optional)' }))
      .toBeVisible()
    await expect
      .element(page.getByRole('group', { name: 'Required question', exact: true }))
      .toHaveAttribute('data-required', '')
  })

  test('an option’s own help text is in that checkbox’s description', async () => {
    await render(english(<Contact optionHelpText />))
    await expect
      .element(page.getByRole('checkbox', { name: 'Brev' }))
      .toHaveAccessibleDescription('Takes a few extra days.')
    await expect
      .element(page.getByRole('checkbox', { name: 'Email' }))
      .not.toHaveAttribute('aria-describedby')
  })

  test('an option help text is a Field.HelpText in that option’s Field, outside its label, and has no axe violations', async () => {
    const { container } = await render(english(<Contact optionHelpText />))
    const helpText = page.getByText('Takes a few extra days.').element()
    expect(helpText.id).not.toBe('')
    expect(helpText.closest('label')).toBeNull()
    // The group's description is its own help text, not the option's.
    await expect
      .element(page.getByRole('group', { name: 'How should we contact you? (optional)' }))
      .toHaveAccessibleDescription('Select all that apply.')
    expectNoDanglingReferences(container)
    await expectNoA11yViolations(container)
    expect(consoleWarn).not.toHaveBeenCalled()
  })

  test('CheckboxGroup.HelpText is the group’s help text: after the description, before the error', async () => {
    expect(CheckboxGroup.HelpText.displayName).toBe('CheckboxGroup.HelpText')
    await render(
      english(
        <CheckboxGroup.Root invalid>
          <CheckboxGroup.Legend>How should we contact you?</CheckboxGroup.Legend>
          <CheckboxGroup.Prose>Select all that apply.</CheckboxGroup.Prose>
          <Field.Root>
            <Checkbox value="email" />
            <Field.Label>Email</Field.Label>
          </Field.Root>
          <CheckboxGroup.HelpText data-testid="helpText">
            You can change this later.
          </CheckboxGroup.HelpText>
          <CheckboxGroup.ErrorMessage>Choose how we should contact you</CheckboxGroup.ErrorMessage>
        </CheckboxGroup.Root>,
      ),
    )
    await expect
      .element(page.getByRole('group', { name: 'How should we contact you? (optional)' }))
      .toHaveAccessibleDescription(
        'Select all that apply. You can change this later. Error: Choose how we should contact you',
      )
  })
})

describe('value', () => {
  test('onValueChange reports the next array from the value prop', async () => {
    const onValueChange = vi.fn<(value: string[], details: CheckboxGroupChangeDetails) => void>()
    function Controlled() {
      const [value, setValue] = useState<string[]>(['email'])
      return (
        <>
          <Contact
            name="contact"
            value={value}
            onValueChange={(next, details) => {
              onValueChange(next, details)
              setValue(next)
            }}
          />
          <output data-testid="value">{value.join(',')}</output>
        </>
      )
    }
    await render(english(<Controlled />))
    await expect.element(page.getByRole('checkbox', { name: 'Email' })).toBeChecked()
    await expect.element(page.getByRole('checkbox', { name: 'Sms' })).not.toBeChecked()
    await userEvent.click(page.getByRole('checkbox', { name: 'Brev' }))
    expect(onValueChange.mock.calls.at(-1)?.[0]).toEqual(['email', 'letter'])
    expect(onValueChange.mock.calls.at(-1)?.[1].reason).toBe('input')
    expect(onValueChange.mock.calls.at(-1)?.[1].event.type).toBe('change')
    await expect.element(page.getByTestId('value')).toHaveTextContent('email,letter')
    await userEvent.click(page.getByRole('checkbox', { name: 'Email' }))
    expect(onValueChange.mock.calls.at(-1)?.[0]).toEqual(['letter'])
    await expect.element(page.getByRole('checkbox', { name: 'Email' })).not.toBeChecked()
  })

  test('the group never stores the value: if the parent does not update it, the box stays', async () => {
    const onValueChange = vi.fn<(value: string[], details: CheckboxGroupChangeDetails) => void>()
    await render(english(<Contact value={['email']} onValueChange={onValueChange} />))
    await userEvent.click(page.getByRole('checkbox', { name: 'Sms' }))
    expect(onValueChange.mock.calls.at(-1)?.[0]).toEqual(['email', 'text'])
    await expect.element(page.getByRole('checkbox', { name: 'Sms' })).not.toBeChecked()
    await expect.element(page.getByRole('checkbox', { name: 'Email' })).toBeChecked()
  })

  test('every checkbox gets the group’s name, and a name on a Checkbox wins', async () => {
    await render(
      <CheckboxGroup.Root name="contact" aria-label="Contact">
        <Field.Root>
          <Checkbox value="a" />
          <Field.Label>A</Field.Label>
        </Field.Root>
        <Field.Root>
          <Checkbox value="b" name="eget" />
          <Field.Label>B</Field.Label>
        </Field.Root>
      </CheckboxGroup.Root>,
    )
    await expect
      .element(page.getByRole('checkbox', { name: 'A' }))
      .toHaveAttribute('name', 'contact')
    await expect.element(page.getByRole('checkbox', { name: 'B' })).toHaveAttribute('name', 'eget')
  })

  test('uncontrolled: defaultValue, the form submit and onValueChange', async () => {
    const onValueChange = vi.fn<(value: string[], details: CheckboxGroupChangeDetails) => void>()
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
          <Contact name="contact" defaultValue={['email']} onValueChange={onValueChange} />
          <button type="submit">Send</button>
        </form>,
      ),
    )
    await expect.element(page.getByRole('checkbox', { name: 'Email' })).toBeChecked()
    await userEvent.click(page.getByRole('checkbox', { name: 'Brev' }))
    expect(onValueChange.mock.calls.at(-1)?.[0]).toEqual(['email', 'letter'])
    await userEvent.click(page.getByRole('checkbox', { name: 'Email' }))
    expect(onValueChange.mock.calls.at(-1)?.[0]).toEqual(['letter'])
    await userEvent.click(page.getByRole('checkbox', { name: 'Sms' }))
    await userEvent.click(page.getByRole('button', { name: 'Send' }))
    expect(submitted?.getAll('contact')).toEqual(['text', 'letter'])
  })

  test('a "select all" Checkbox in a group: onValueChange first, with its value added, then its own onCheckedChange', async () => {
    const calls: string[] = []
    const onValueChange = vi.fn<(value: string[], details: CheckboxGroupChangeDetails) => void>()
    function SelectAll() {
      const [value, setValue] = useState<string[]>(['email'])
      return (
        <CheckboxGroup.Root
          name="contact"
          value={value}
          onValueChange={(next, details) => {
            calls.push('onValueChange')
            onValueChange(next, details)
            setValue(next)
          }}
        >
          <Fieldset.Legend>How should we contact you?</Fieldset.Legend>
          <Field.Root>
            <Checkbox
              value="all"
              indeterminate={value.length > 0 && !value.includes('all')}
              onCheckedChange={() => calls.push('onCheckedChange')}
            />
            <Field.Label>All ways</Field.Label>
          </Field.Root>
          <Field.Root>
            <Checkbox value="email" />
            <Field.Label>Email</Field.Label>
          </Field.Root>
        </CheckboxGroup.Root>
      )
    }
    await render(<SelectAll />)
    const all = page.getByRole('checkbox', { name: 'All ways' })
    await expect.element(all).toBePartiallyChecked()
    await userEvent.click(all)
    expect(calls).toEqual(['onValueChange', 'onCheckedChange'])
    expect(onValueChange.mock.calls.at(-1)?.[0]).toEqual(['email', 'all'])
    await expect.element(all).toBeChecked()
    await expect.element(all).not.toBePartiallyChecked()
    await expect.element(all).toHaveAttribute('name', 'contact')
    expect(consoleWarn).not.toHaveBeenCalled()
  })

  test('a Checkbox in a group without a value warns once', async () => {
    await render(
      <CheckboxGroup.Root aria-label="Contact" name="contact">
        <Field.Root>
          <Checkbox />
          <Field.Label>A</Field.Label>
        </Field.Root>
      </CheckboxGroup.Root>,
    )
    expect(consoleWarn).toHaveBeenCalledTimes(1)
    expect(consoleWarn.mock.calls[0]?.[0]).toContain('value')
  })
})

describe('state', () => {
  test('invalid styles every option and sets no aria-invalid', async () => {
    await render(english(<Contact invalid />))
    for (const [, label] of options) {
      const checkbox = page.getByRole('checkbox', { name: label })
      await expect.element(checkbox).toHaveAttribute('data-invalid', '')
      await expect.element(checkbox).not.toHaveAttribute('aria-invalid')
    }
  })

  test('invalid does not cascade to the Fields', async () => {
    const { container } = await render(english(<Contact invalid />))
    expect(container.querySelectorAll('.kv-field[data-invalid]')).toHaveLength(0)
  })

  test('disabled disables every checkbox natively', async () => {
    await render(english(<Contact disabled />))
    expect((page.getByRole('group').element() as HTMLFieldSetElement).disabled).toBe(true)
    for (const [, label] of options) {
      await expect.element(page.getByRole('checkbox', { name: label })).toBeDisabled()
    }
  })

  test('server markup is complete: the group’s description and each box’s name', () => {
    const markup = renderToString(
      <KvirnProvider locale="en">
        <CheckboxGroup.Root name="contact" defaultValue={['email']} invalid>
          <Fieldset.Legend>Contact</Fieldset.Legend>
          <Field.Root controlId="a">
            <Checkbox value="email" />
            <Field.Label>Email</Field.Label>
          </Field.Root>
        </CheckboxGroup.Root>
      </KvirnProvider>,
    )
    expect(markup).toContain('name="contact"')
    expect(markup).toContain('checked=""')
    expect(markup).toContain('data-invalid=""')
    expect(markup).toContain('for="a"')
  })
})

describe('useCheckboxGroup', () => {
  test('gives the props for your own checkboxes', async () => {
    const onValueChange = vi.fn<(value: string[], details: CheckboxGroupChangeDetails) => void>()
    function Own() {
      const group = useCheckboxGroup({ name: 'contact', value: ['a'], onValueChange })
      /* eslint-disable react/refs -- the hook's groupRef and getCheckboxProps are spread, never read in render */
      return (
        <fieldset ref={group.groupRef}>
          <legend>Egen</legend>
          <input type="checkbox" aria-label="A" value="a" {...group.getCheckboxProps('a')} />
          <input type="checkbox" aria-label="B" value="b" {...group.getCheckboxProps('b')} />
        </fieldset>
      )
      /* eslint-enable react/refs */
    }
    await render(<Own />)
    await expect.element(page.getByRole('checkbox', { name: 'A' })).toBeChecked()
    await expect
      .element(page.getByRole('checkbox', { name: 'B' }))
      .toHaveAttribute('name', 'contact')
    await userEvent.click(page.getByRole('checkbox', { name: 'B' }))
    expect(onValueChange.mock.calls.at(-1)?.[0]).toEqual(['a', 'b'])
  })
})

describe('keyboard', () => {
  const box = (name: string) => page.getByRole('checkbox', { name, exact: true })

  function recordPreventedKeys() {
    const keys: string[] = []
    const listener = (event: KeyboardEvent) => {
      if (event.defaultPrevented) keys.push(event.key)
    }
    document.addEventListener('keydown', listener)
    return { keys, stop: () => document.removeEventListener('keydown', listener) }
  }

  test('Tab moves through every checkbox in DOM order', async () => {
    await render(
      english(
        <>
          <button type="button">Tillbaka</button>
          <Contact name="contact" />
          <button type="button">Send</button>
        </>,
      ),
    )
    page.getByRole('button', { name: 'Tillbaka' }).element().focus()
    for (const name of ['Email', 'Sms', 'Brev']) {
      await userEvent.tab()
      await expect.element(box(name)).toHaveFocus()
    }
    await userEvent.tab()
    await expect.element(page.getByRole('button', { name: 'Send' })).toHaveFocus()
    const root = page.getByRole('group').element()
    expect(root.hasAttribute('tabindex')).toBe(false)
    expect(root.querySelector('legend')?.hasAttribute('tabindex')).toBe(false)
  })

  test('Shift+Tab moves back through the checkboxes', async () => {
    await render(
      english(
        <>
          <button type="button">Tillbaka</button>
          <Contact name="contact" />
        </>,
      ),
    )
    box('Brev').element().focus()
    await userEvent.tab({ shift: true })
    await expect.element(box('Sms')).toHaveFocus()
    await userEvent.tab({ shift: true })
    await expect.element(box('Email')).toHaveFocus()
    await userEvent.tab({ shift: true })
    await expect.element(page.getByRole('button', { name: 'Tillbaka' })).toHaveFocus()
  })

  test('Space toggles the focused checkbox and reports the next value', async () => {
    const onValueChange = vi.fn<(value: string[], details: CheckboxGroupChangeDetails) => void>()
    function Controlled() {
      const [value, setValue] = useState<string[]>(['letter'])
      return (
        <Contact
          name="contact"
          value={value}
          onValueChange={(next, details) => {
            onValueChange(next, details)
            setValue(next)
          }}
        />
      )
    }
    await render(english(<Controlled />))
    box('Sms').element().focus()
    const prevented = recordPreventedKeys()
    await userEvent.keyboard(' ')
    await expect.element(box('Sms')).toBeChecked()
    expect(onValueChange.mock.calls.at(-1)?.[0]).toEqual(['letter', 'text'])
    await expect.element(box('Brev')).toBeChecked()
    await expect.element(box('Email')).not.toBeChecked()
    await userEvent.keyboard(' ')
    await expect.element(box('Sms')).not.toBeChecked()
    expect(onValueChange.mock.calls.at(-1)?.[0]).toEqual(['letter'])
    await expect.element(box('Sms')).toHaveFocus()
    prevented.stop()
    expect(prevented.keys).toEqual([])
  })

  test('Arrow keys do not move focus between checkboxes', async () => {
    await render(english(<Contact name="contact" />))
    box('Sms').element().focus()
    const prevented = recordPreventedKeys()
    for (const key of ['ArrowDown', 'ArrowRight', 'ArrowUp', 'ArrowLeft']) {
      await userEvent.keyboard(`{${key}}`)
      await expect.element(box('Sms')).toHaveFocus()
    }
    prevented.stop()
    for (const name of ['Email', 'Sms', 'Brev']) await expect.element(box(name)).not.toBeChecked()
    expect(prevented.keys).toEqual([])
  })

  test('Tab skips the checkboxes of a disabled group (native)', async () => {
    await render(
      english(
        <>
          <button type="button">Tillbaka</button>
          <Contact name="contact" disabled />
          <button type="button">Send</button>
        </>,
      ),
    )
    for (const name of ['Email', 'Sms', 'Brev']) await expect.element(box(name)).toBeDisabled()
    page.getByRole('button', { name: 'Tillbaka' }).element().focus()
    await userEvent.tab()
    await expect.element(page.getByRole('button', { name: 'Send' })).toHaveFocus()
  })
})

describe('types', () => {
  test('exports the option, result and detail types', () => {
    expectTypeOf<UseCheckboxGroupOptions['value']>().toEqualTypeOf<readonly string[] | undefined>()
    expectTypeOf<UseCheckboxGroupResult['getCheckboxProps']>().parameter(0).toEqualTypeOf<string>()
    expectTypeOf<CheckboxGroupRootProps['onValueChange']>().toEqualTypeOf<
      ((value: string[], details: CheckboxGroupChangeDetails) => void) | undefined
    >()
  })
})
