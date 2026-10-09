import { sv } from '@kvirn-ui/i18n/sv'
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

const sweden = (children: ReactNode) => (
  <KvirnProvider locale="sv-SE" messages={sv}>
    {children}
  </KvirnProvider>
)

const options = [
  ['email', 'E-post'],
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
      <Fieldset.Legend>Hur ska vi kontakta dig?</Fieldset.Legend>
      {withDescription ? <CheckboxGroup.Prose>Välj alla som passar.</CheckboxGroup.Prose> : null}
      {options.map(([value, label]) => (
        <Field.Root key={value}>
          <Checkbox value={value} />
          <Field.Label>{label}</Field.Label>
          {optionHelpText && value === 'letter' ? (
            <Field.HelpText>Tar några dagar extra.</Field.HelpText>
          ) : null}
        </Field.Root>
      ))}
      <Fieldset.ErrorMessage>Välj hur vi ska kontakta dig</Fieldset.ErrorMessage>
    </CheckboxGroup.Root>
  )
}

describe('rendering', () => {
  test('renders a group with its part classes, a <legend> first, and forwards ref and props', async () => {
    const ref = createRef<HTMLFieldSetElement>()
    const { container } = await render(
      <CheckboxGroup.Root ref={ref} className="egen" data-testid="root" lang="sv">
        <Fieldset.Legend data-testid="legend">Kontakt</Fieldset.Legend>
      </CheckboxGroup.Root>,
    )
    const root = page.getByTestId('root').element()
    expect(ref.current).toBe(root)
    expect(container.firstElementChild).toBe(root)
    expect(root.classList.contains('kv-checkbox-group')).toBe(true)
    expect(root.classList.contains('kv-fieldset')).toBe(true)
    expect(root.classList.contains('egen')).toBe(true)
    expect(root.getAttribute('lang')).toBe('sv')
    // The group's `name` is not a fieldset attribute.
    expect(root.hasAttribute('name')).toBe(false)
    expect(root.firstElementChild).toBe(page.getByTestId('legend').element())
  })

  test('the group is named by its legend and described by its help text and error', async () => {
    const { container } = await render(sweden(<Contact invalid />))
    const group = page.getByRole('group', { name: 'Hur ska vi kontakta dig? (valfritt)' })
    await expect
      .element(group)
      .toHaveAccessibleDescription('Välj alla som passar. Fel: Välj hur vi ska kontakta dig')
    await expect.element(group).toHaveAttribute('data-invalid', '')
    expectNoDanglingReferences(container)
    await expectNoA11yViolations(container)
    expect(consoleWarn).not.toHaveBeenCalled()
  })

  test('options carry no optional marker, and the legend does, unless the group is required', async () => {
    await render(
      sweden(
        <>
          <Contact />
          <CheckboxGroup.Root required>
            <Fieldset.Legend>Obligatorisk fråga</Fieldset.Legend>
            <Field.Root>
              <Checkbox value="a" />
              <Field.Label>Alternativ A</Field.Label>
            </Field.Root>
          </CheckboxGroup.Root>
        </>,
      ),
    )
    await expect.element(page.getByRole('checkbox', { name: 'E-post', exact: true })).toBeVisible()
    await expect
      .element(page.getByRole('group', { name: 'Hur ska vi kontakta dig? (valfritt)' }))
      .toBeVisible()
    await expect
      .element(page.getByRole('group', { name: 'Obligatorisk fråga', exact: true }))
      .toHaveAttribute('data-required', '')
  })

  test('an option’s own help text is in that checkbox’s description', async () => {
    await render(sweden(<Contact optionHelpText />))
    await expect
      .element(page.getByRole('checkbox', { name: 'Brev' }))
      .toHaveAccessibleDescription('Tar några dagar extra.')
    await expect
      .element(page.getByRole('checkbox', { name: 'E-post' }))
      .not.toHaveAttribute('aria-describedby')
  })

  test('an option help text is a Field.HelpText in that option’s Field, outside its label, and has no axe violations', async () => {
    const { container } = await render(sweden(<Contact optionHelpText />))
    const helpText = page.getByText('Tar några dagar extra.').element()
    expect(helpText.id).not.toBe('')
    expect(helpText.closest('label')).toBeNull()
    // The group's description is its own help text, not the option's.
    await expect
      .element(page.getByRole('group', { name: 'Hur ska vi kontakta dig? (valfritt)' }))
      .toHaveAccessibleDescription('Välj alla som passar.')
    expectNoDanglingReferences(container)
    await expectNoA11yViolations(container)
    expect(consoleWarn).not.toHaveBeenCalled()
  })

  test('CheckboxGroup.HelpText is the group’s help text: after the description, before the error', async () => {
    expect(CheckboxGroup.HelpText.displayName).toBe('CheckboxGroup.HelpText')
    await render(
      sweden(
        <CheckboxGroup.Root invalid>
          <CheckboxGroup.Legend>Hur ska vi kontakta dig?</CheckboxGroup.Legend>
          <CheckboxGroup.Prose>Välj alla som passar.</CheckboxGroup.Prose>
          <Field.Root>
            <Checkbox value="email" />
            <Field.Label>E-post</Field.Label>
          </Field.Root>
          <CheckboxGroup.HelpText data-testid="helpText">
            Du kan ändra det senare.
          </CheckboxGroup.HelpText>
          <CheckboxGroup.ErrorMessage>Välj hur vi ska kontakta dig</CheckboxGroup.ErrorMessage>
        </CheckboxGroup.Root>,
      ),
    )
    await expect
      .element(page.getByRole('group', { name: 'Hur ska vi kontakta dig? (valfritt)' }))
      .toHaveAccessibleDescription(
        'Välj alla som passar. Du kan ändra det senare. Fel: Välj hur vi ska kontakta dig',
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
    await render(sweden(<Controlled />))
    await expect.element(page.getByRole('checkbox', { name: 'E-post' })).toBeChecked()
    await expect.element(page.getByRole('checkbox', { name: 'Sms' })).not.toBeChecked()
    await userEvent.click(page.getByRole('checkbox', { name: 'Brev' }))
    expect(onValueChange.mock.calls.at(-1)?.[0]).toEqual(['email', 'letter'])
    expect(onValueChange.mock.calls.at(-1)?.[1].reason).toBe('input')
    expect(onValueChange.mock.calls.at(-1)?.[1].event.type).toBe('change')
    await expect.element(page.getByTestId('value')).toHaveTextContent('email,letter')
    await userEvent.click(page.getByRole('checkbox', { name: 'E-post' }))
    expect(onValueChange.mock.calls.at(-1)?.[0]).toEqual(['letter'])
    await expect.element(page.getByRole('checkbox', { name: 'E-post' })).not.toBeChecked()
  })

  test('the group never stores the value: if the parent does not update it, the box stays', async () => {
    const onValueChange = vi.fn<(value: string[], details: CheckboxGroupChangeDetails) => void>()
    await render(sweden(<Contact value={['email']} onValueChange={onValueChange} />))
    await userEvent.click(page.getByRole('checkbox', { name: 'Sms' }))
    expect(onValueChange.mock.calls.at(-1)?.[0]).toEqual(['email', 'text'])
    await expect.element(page.getByRole('checkbox', { name: 'Sms' })).not.toBeChecked()
    await expect.element(page.getByRole('checkbox', { name: 'E-post' })).toBeChecked()
  })

  test('every checkbox gets the group’s name, and a name on a Checkbox wins', async () => {
    await render(
      <CheckboxGroup.Root name="contact" aria-label="Kontakt">
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
      sweden(
        <form
          aria-label="Ansökan"
          onSubmit={(event) => {
            event.preventDefault()
            submitted = new FormData(event.currentTarget)
          }}
        >
          <Contact name="contact" defaultValue={['email']} onValueChange={onValueChange} />
          <button type="submit">Skicka</button>
        </form>,
      ),
    )
    await expect.element(page.getByRole('checkbox', { name: 'E-post' })).toBeChecked()
    await userEvent.click(page.getByRole('checkbox', { name: 'Brev' }))
    expect(onValueChange.mock.calls.at(-1)?.[0]).toEqual(['email', 'letter'])
    await userEvent.click(page.getByRole('checkbox', { name: 'E-post' }))
    expect(onValueChange.mock.calls.at(-1)?.[0]).toEqual(['letter'])
    await userEvent.click(page.getByRole('checkbox', { name: 'Sms' }))
    await userEvent.click(page.getByRole('button', { name: 'Skicka' }))
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
          <Fieldset.Legend>Hur ska vi kontakta dig?</Fieldset.Legend>
          <Field.Root>
            <Checkbox
              value="all"
              indeterminate={value.length > 0 && !value.includes('all')}
              onCheckedChange={() => calls.push('onCheckedChange')}
            />
            <Field.Label>Alla sätt</Field.Label>
          </Field.Root>
          <Field.Root>
            <Checkbox value="email" />
            <Field.Label>E-post</Field.Label>
          </Field.Root>
        </CheckboxGroup.Root>
      )
    }
    await render(<SelectAll />)
    const all = page.getByRole('checkbox', { name: 'Alla sätt' })
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
      <CheckboxGroup.Root aria-label="Kontakt" name="contact">
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
    await render(sweden(<Contact invalid />))
    for (const [, label] of options) {
      const checkbox = page.getByRole('checkbox', { name: label })
      await expect.element(checkbox).toHaveAttribute('data-invalid', '')
      await expect.element(checkbox).not.toHaveAttribute('aria-invalid')
    }
  })

  test('invalid does not cascade to the Fields', async () => {
    const { container } = await render(sweden(<Contact invalid />))
    expect(container.querySelectorAll('.kv-field[data-invalid]')).toHaveLength(0)
  })

  test('disabled disables every checkbox natively', async () => {
    await render(sweden(<Contact disabled />))
    expect((page.getByRole('group').element() as HTMLFieldSetElement).disabled).toBe(true)
    for (const [, label] of options) {
      await expect.element(page.getByRole('checkbox', { name: label })).toBeDisabled()
    }
  })

  test('server markup is complete: the group’s description and each box’s name', () => {
    const markup = renderToString(
      <KvirnProvider locale="sv-SE" messages={sv}>
        <CheckboxGroup.Root name="contact" defaultValue={['email']} invalid>
          <Fieldset.Legend>Kontakt</Fieldset.Legend>
          <Field.Root controlId="a">
            <Checkbox value="email" />
            <Field.Label>E-post</Field.Label>
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
      const group = useCheckboxGroup({ name: 'kontakt', value: ['a'], onValueChange })
      return (
        <fieldset ref={group.groupRef}>
          <legend>Egen</legend>
          <input type="checkbox" aria-label="A" value="a" {...group.getCheckboxProps('a')} />
          <input type="checkbox" aria-label="B" value="b" {...group.getCheckboxProps('b')} />
        </fieldset>
      )
    }
    await render(<Own />)
    await expect.element(page.getByRole('checkbox', { name: 'A' })).toBeChecked()
    await expect
      .element(page.getByRole('checkbox', { name: 'B' }))
      .toHaveAttribute('name', 'kontakt')
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
      sweden(
        <>
          <button type="button">Tillbaka</button>
          <Contact name="contact" />
          <button type="button">Skicka</button>
        </>,
      ),
    )
    page.getByRole('button', { name: 'Tillbaka' }).element().focus()
    for (const name of ['E-post', 'Sms', 'Brev']) {
      await userEvent.tab()
      await expect.element(box(name)).toHaveFocus()
    }
    await userEvent.tab()
    await expect.element(page.getByRole('button', { name: 'Skicka' })).toHaveFocus()
    const root = page.getByRole('group').element()
    expect(root.hasAttribute('tabindex')).toBe(false)
    expect(root.querySelector('legend')?.hasAttribute('tabindex')).toBe(false)
  })

  test('Shift+Tab moves back through the checkboxes', async () => {
    await render(
      sweden(
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
    await expect.element(box('E-post')).toHaveFocus()
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
    await render(sweden(<Controlled />))
    box('Sms').element().focus()
    const prevented = recordPreventedKeys()
    await userEvent.keyboard(' ')
    await expect.element(box('Sms')).toBeChecked()
    expect(onValueChange.mock.calls.at(-1)?.[0]).toEqual(['letter', 'text'])
    await expect.element(box('Brev')).toBeChecked()
    await expect.element(box('E-post')).not.toBeChecked()
    await userEvent.keyboard(' ')
    await expect.element(box('Sms')).not.toBeChecked()
    expect(onValueChange.mock.calls.at(-1)?.[0]).toEqual(['letter'])
    await expect.element(box('Sms')).toHaveFocus()
    prevented.stop()
    expect(prevented.keys).toEqual([])
  })

  test('Arrow keys do not move focus between checkboxes', async () => {
    await render(sweden(<Contact name="contact" />))
    box('Sms').element().focus()
    const prevented = recordPreventedKeys()
    for (const key of ['ArrowDown', 'ArrowRight', 'ArrowUp', 'ArrowLeft']) {
      await userEvent.keyboard(`{${key}}`)
      await expect.element(box('Sms')).toHaveFocus()
    }
    prevented.stop()
    for (const name of ['E-post', 'Sms', 'Brev']) await expect.element(box(name)).not.toBeChecked()
    expect(prevented.keys).toEqual([])
  })

  test('Tab skips the checkboxes of a disabled group (native)', async () => {
    await render(
      sweden(
        <>
          <button type="button">Tillbaka</button>
          <Contact name="contact" disabled />
          <button type="button">Skicka</button>
        </>,
      ),
    )
    for (const name of ['E-post', 'Sms', 'Brev']) await expect.element(box(name)).toBeDisabled()
    page.getByRole('button', { name: 'Tillbaka' }).element().focus()
    await userEvent.tab()
    await expect.element(page.getByRole('button', { name: 'Skicka' })).toHaveFocus()
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
