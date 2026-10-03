import { expectNoA11yViolations } from '@kvirn-ui/testing'
import { createRef } from 'react'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vite-plus/test'
import type { MockInstance } from 'vite-plus/test'
import { page } from 'vite-plus/test/browser'
import { render } from 'vitest-browser-react'
import { resetDevWarnings } from '../dev/dev-warning.ts'
import { Field } from '../field/field.tsx'
import { Fieldset } from '../fieldset/fieldset.tsx'
import { Heading } from '../heading/heading.tsx'
import { Input } from '../input/input.tsx'
import { Prose, ProseRoot } from './prose.tsx'
import { useProse } from './use-prose.ts'

// Contract: prose.a11y.md.

let consoleWarn: MockInstance<Console['warn']>

beforeEach(() => {
  resetDevWarnings()
  consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {})
})

afterEach(() => {
  consoleWarn.mockRestore()
})

describe('Prose', () => {
  test('renders one <div> with its class, no role or ARIA, and its children', async () => {
    const { container } = await render(<Prose data-testid="prose">Innehåll</Prose>)
    const prose = page.getByTestId('prose').element()
    expect(prose.tagName).toBe('DIV')
    expect(prose.className).toBe('kv-prose')
    expect(
      prose.getAttributeNames().filter((name) => name === 'role' || name.startsWith('aria-')),
    ).toEqual([])
    expect(container.children).toHaveLength(1)
  })

  test('a consumer className and a render element’s className join the class', async () => {
    await render(
      <Prose className="kv-prose--large" render={<article className="annat" data-testid="prose" />}>
        Text
      </Prose>,
    )
    const prose = page.getByTestId('prose')
    expect(prose.element().tagName).toBe('ARTICLE')
    await expect.element(prose).toHaveClass('kv-prose', 'kv-prose--large', 'annat')
  })

  test('Prose, Prose.Root and ProseRoot are the same, and useProse gives the class', () => {
    expect(Prose.Root).toBe(ProseRoot)
    expect(Prose).toBe(ProseRoot)
    expect(useProse().rootProps).toEqual({ className: 'kv-prose' })
  })

  test('has no axe violations', async () => {
    const { container } = await render(
      <main>
        <Prose>
          <Heading level={1}>Kontakta oss</Heading>
          <p>Vi svarar vardagar 9–16.</p>
        </Prose>
      </main>,
    )
    await expect.element(page.getByRole('heading', { level: 1 })).toBeVisible()
    await expectNoA11yViolations(container)
  })
})

describe('Prose as the description of a Field or Fieldset (ADR-0054)', () => {
  test('a Prose in a Field registers its id and the control’s aria-describedby lists it', async () => {
    await render(
      <Field.Root>
        <Field.Label>Personnummer</Field.Label>
        <Prose data-testid="hint">
          <p>12 siffror, utan bindestreck.</p>
        </Prose>
        <Input name="pnr" />
      </Field.Root>,
    )
    const hint = page.getByTestId('hint').element()
    expect(hint.id).not.toBe('')
    expect(hint.className).toBe('kv-prose')
    const input = page.getByRole('textbox')
    await expect.element(input).toHaveAttribute('aria-describedby', hint.id)
    await expect.element(input).toHaveAccessibleDescription('12 siffror, utan bindestreck.')
  })

  test('two Proses are listed in DOM order, then the error', async () => {
    await render(
      <Field.Root invalid>
        <Field.Label>Registreringsnummer</Field.Label>
        <Prose data-testid="first">Det står på registreringsbeviset.</Prose>
        <Input name="registration" />
        <Prose data-testid="second">Till exempel ABC 123</Prose>
        <Field.ErrorMessage>Ange numret</Field.ErrorMessage>
      </Field.Root>,
    )
    const input = page.getByRole('textbox')
    const ids = (input.element().getAttribute('aria-describedby') ?? '').split(' ')
    expect(ids).toHaveLength(3)
    expect(ids[0]).toBe(page.getByTestId('first').element().id)
    expect(ids[1]).toBe(page.getByTestId('second').element().id)
    expect(new Set(ids).size).toBe(3)
    await expect
      .element(input)
      .toHaveAccessibleDescription(
        'Det står på registreringsbeviset. Till exempel ABC 123 Error: Ange numret',
      )
  })

  test('a Prose that mounts later, above the first, is still listed in DOM order', async () => {
    function Example({ showFirst }: { showFirst: boolean }) {
      return (
        <Field.Root>
          <Field.Label>Namn</Field.Label>
          {showFirst ? <Prose>Först.</Prose> : null}
          <Input />
          <Prose>Sist.</Prose>
        </Field.Root>
      )
    }
    const screen = await render(<Example showFirst={false} />)
    const input = page.getByRole('textbox')
    await expect.element(input).toHaveAccessibleDescription('Sist.')
    await screen.rerender(<Example showFirst />)
    await expect.element(input).toHaveAccessibleDescription('Först. Sist.')
    await screen.rerender(<Example showFirst={false} />)
    await expect.element(input).toHaveAccessibleDescription('Sist.')
    expect((input.element().getAttribute('aria-describedby') ?? '').split(' ')).toHaveLength(1)
  })

  test('a Prose in a Fieldset describes the group', async () => {
    await render(
      <Fieldset.Root invalid>
        <Fieldset.Legend>Adress</Fieldset.Legend>
        <Prose data-testid="hint">
          <p>Där du är folkbokförd.</p>
        </Prose>
        <Fieldset.ErrorMessage>Ange din adress</Fieldset.ErrorMessage>
      </Fieldset.Root>,
    )
    const group = page.getByRole('group', { name: 'Adress' })
    const [hintId, errorId] = (group.element().getAttribute('aria-describedby') ?? '').split(' ')
    expect(hintId).toBe(page.getByTestId('hint').element().id)
    expect(errorId).not.toBe(hintId)
    await expect
      .element(group)
      .toHaveAccessibleDescription('Där du är folkbokförd. Error: Ange din adress')
  })

  test('a Prose in a Field inside a Fieldset describes the Field’s control, not the group', async () => {
    await render(
      <Fieldset.Root>
        <Fieldset.Legend>Adress</Fieldset.Legend>
        <Prose>Om gruppen.</Prose>
        <Field.Root>
          <Field.Label>Gata</Field.Label>
          <Prose>Utan nummer.</Prose>
          <Input />
        </Field.Root>
      </Fieldset.Root>,
    )
    await expect
      .element(page.getByRole('group', { name: 'Adress' }))
      .toHaveAccessibleDescription('Om gruppen.')
    await expect.element(page.getByRole('textbox')).toHaveAccessibleDescription('Utan nummer.')
  })

  test('the description is its text content: a heading, list and link inside lose their structure', async () => {
    await render(
      <Field.Root>
        <Field.Label>Namn</Field.Label>
        <Prose>
          <h3>Rubrik</h3>
          <ul>
            <li>Ett</li>
            <li>Två</li>
          </ul>
          <a href="/hjalp">Hjälp</a>
        </Prose>
        <Input />
      </Field.Root>,
    )
    const input = page.getByRole('textbox')
    await expect.element(input).toHaveAccessibleDescription(/Rubrik\s+Ett\s+Två\s+Hjälp/)
  })

  test('invalid and disabled: the Prose gets data-invalid and data-disabled, and render gets the state', async () => {
    const seenStates: unknown[] = []
    await render(
      <Field.Root invalid disabled>
        <Field.Label>Namn</Field.Label>
        <Prose
          data-testid="hint"
          render={(partProps, state) => {
            seenStates.push(state)
            return <p {...partProps} />
          }}
        >
          Som i passet.
        </Prose>
        <Input />
        <Field.ErrorMessage>Ange namn</Field.ErrorMessage>
      </Field.Root>,
    )
    const hint = page.getByTestId('hint')
    await expect.element(hint).toHaveAttribute('data-invalid', '')
    await expect.element(hint).toHaveAttribute('data-disabled', '')
    expect(hint.element().tagName).toBe('P')
    expect(seenStates.at(-1)).toEqual({ isInvalid: true, isRequired: false, isDisabled: true })
  })

  test('keeps the consumer’s ref and className next to the registration', async () => {
    const ref = createRef<HTMLElement>()
    await render(
      <Field.Root>
        <Field.Label>Namn</Field.Label>
        <Prose ref={ref} className="egen" data-testid="hint">
          Som i passet.
        </Prose>
        <Input />
      </Field.Root>,
    )
    expect(ref.current).toBe(page.getByTestId('hint').element())
    await expect.element(page.getByTestId('hint')).toHaveClass('egen', 'kv-prose')
    await expect.element(page.getByRole('textbox')).toHaveAccessibleDescription('Som i passet.')
  })

  test('a Prose outside a Field or Fieldset has no id and does not warn', async () => {
    await render(<Prose data-testid="prose">Innehåll</Prose>)
    const prose = page.getByTestId('prose')
    await expect.element(prose).not.toHaveAttribute('id')
    await expect.element(prose).not.toHaveAttribute('data-invalid')
    await new Promise((resolve) => setTimeout(resolve, 50))
    expect(consoleWarn).not.toHaveBeenCalled()
  })

  test('a Field with a Prose hint has no axe violations', async () => {
    const { container } = await render(
      <Field.Root invalid>
        <Field.Label>Personnummer</Field.Label>
        <Prose>
          <p>12 siffror, utan bindestreck.</p>
        </Prose>
        <Input name="pnr" />
        <Field.ErrorMessage>Ange ditt personnummer</Field.ErrorMessage>
      </Field.Root>,
    )
    await expect.element(page.getByRole('textbox')).toBeVisible()
    await expectNoA11yViolations(container)
  })

  test('a Fieldset with a Prose hint has no axe violations', async () => {
    const { container } = await render(
      <Fieldset.Root group>
        <Fieldset.Legend>Hur vill du bli kontaktad?</Fieldset.Legend>
        <Prose>
          <p>Välj alla som passar.</p>
        </Prose>
        <Field.Root>
          <Field.Label marker="none">E-post</Field.Label>
          <Input type="email" />
        </Field.Root>
      </Fieldset.Root>,
    )
    await expect.element(page.getByRole('group')).toBeVisible()
    await expectNoA11yViolations(container)
  })
})
