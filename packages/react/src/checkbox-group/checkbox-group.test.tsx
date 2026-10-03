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
import { Prose } from '../prose/prose.tsx'

// Contract: checkbox-group.a11y.md. The keyboard rows are also covered end to end in
// apps/storybook/src/components/checkbox-group/checkbox-group.e2e.ts.

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
  optionHint?: boolean
}

/** The design spec's contact question, in Swedish. */
function Contact({ withDescription = true, optionHint = false, ...rootProps }: ContactProps) {
  return (
    <CheckboxGroup.Root {...rootProps}>
      <Fieldset.Legend>Hur ska vi kontakta dig?</Fieldset.Legend>
      {withDescription ? <Prose>Välj alla som passar.</Prose> : null}
      {options.map(([value, label]) => (
        <Field.Root key={value}>
          <Checkbox value={value} />
          <Field.Label>{label}</Field.Label>
          {optionHint && value === 'letter' ? <Prose>Tar några dagar extra.</Prose> : null}
        </Field.Root>
      ))}
      <Fieldset.ErrorMessage>Välj hur vi ska kontakta dig</Fieldset.ErrorMessage>
    </CheckboxGroup.Root>
  )
}

describe('rendering', () => {
  test('renders a <fieldset> with its classes, a <legend> first, and forwards ref and props', async () => {
    const ref = createRef<HTMLFieldSetElement>()
    const { container } = await render(
      <CheckboxGroup.Root ref={ref} className="egen" data-testid="root" lang="sv">
        <Fieldset.Legend data-testid="legend">Kontakt</Fieldset.Legend>
      </CheckboxGroup.Root>,
    )
    const root = page.getByTestId('root').element()
    expect(root.tagName).toBe('FIELDSET')
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

  test('the group is named by its legend and described by its hint and error', async () => {
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

  test('an option’s own hint is in that checkbox’s description', async () => {
    await render(sweden(<Contact optionHint />))
    await expect
      .element(page.getByRole('checkbox', { name: 'Brev' }))
      .toHaveAccessibleDescription('Tar några dagar extra.')
    await expect
      .element(page.getByRole('checkbox', { name: 'E-post' }))
      .not.toHaveAttribute('aria-describedby')
  })

  test('render must stay a fieldset: another element warns once', async () => {
    await render(
      <CheckboxGroup.Root render={<div aria-label="Kontakt" />}>
        <Field.Root>
          <Checkbox value="a" />
          <Field.Label>A</Field.Label>
        </Field.Root>
      </CheckboxGroup.Root>,
    )
    expect(consoleWarn.mock.calls.some(([message]) => String(message).includes('fieldset'))).toBe(
      true,
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

  test('the group handles no keys', async () => {
    await render(sweden(<Contact />))
    await userEvent.keyboard('{Tab}')
    await expect.element(page.getByRole('checkbox', { name: 'E-post' })).toHaveFocus()
    await userEvent.keyboard('{ArrowDown}{ArrowRight}{ArrowDown}')
    await expect.element(page.getByRole('checkbox', { name: 'E-post' })).toHaveFocus()
    await userEvent.keyboard('{Tab}')
    await expect.element(page.getByRole('checkbox', { name: 'Sms' })).toHaveFocus()
  })

  test('each checkbox is its own Tab stop, in DOM order', async () => {
    await render(sweden(<Contact />))
    for (const [, label] of options) {
      await userEvent.keyboard('{Tab}')
      await expect.element(page.getByRole('checkbox', { name: label })).toHaveFocus()
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

describe('types', () => {
  test('exports the option, result and detail types', () => {
    expectTypeOf<UseCheckboxGroupOptions['value']>().toEqualTypeOf<readonly string[] | undefined>()
    expectTypeOf<UseCheckboxGroupResult['getCheckboxProps']>().parameter(0).toEqualTypeOf<string>()
    expectTypeOf<CheckboxGroupRootProps['onValueChange']>().toEqualTypeOf<
      ((value: string[], details: CheckboxGroupChangeDetails) => void) | undefined
    >()
  })
})
