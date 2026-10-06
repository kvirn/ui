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
import { TextInput } from '../text-input/text-input.tsx'
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
  test('renders one element with the kv-prose class, no role or ARIA, and its children', async () => {
    const { container } = await render(<Prose data-testid="prose">Innehåll</Prose>)
    const prose = page.getByTestId('prose').element()
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

  test('Prose and ProseRoot are one component named Prose, the deprecated Prose.Root is the same, and useProse gives the class', () => {
    expect(Prose.displayName).toBe('Prose')
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

describe('Prose as the description of a Field or Fieldset', () => {
  test('a Prose in a Field registers its id and the control’s aria-describedby lists it', async () => {
    await render(
      <Field.Root>
        <Field.Label>Personnummer</Field.Label>
        <Field.Prose data-testid="description">
          <p>12 siffror, utan bindestreck.</p>
        </Field.Prose>
        <TextInput name="pnr" />
      </Field.Root>,
    )
    const descriptionPart = page.getByTestId('description').element()
    expect(descriptionPart.id).not.toBe('')
    const input = page.getByRole('textbox')
    await expect.element(input).toHaveAttribute('aria-describedby', descriptionPart.id)
    await expect.element(input).toHaveAccessibleDescription('12 siffror, utan bindestreck.')
  })

  test('two Proses are listed in DOM order, then the error', async () => {
    await render(
      <Field.Root invalid>
        <Field.Label>Registreringsnummer</Field.Label>
        <Field.Prose data-testid="first">Det står på registreringsbeviset.</Field.Prose>
        <TextInput name="registration" />
        <Field.Prose data-testid="second">Till exempel ABC 123</Field.Prose>
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
          {showFirst ? <Field.Prose>Först.</Field.Prose> : null}
          <TextInput />
          <Field.Prose>Sist.</Field.Prose>
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
        <Fieldset.Prose data-testid="description">
          <p>Där du är folkbokförd.</p>
        </Fieldset.Prose>
        <Fieldset.ErrorMessage>Ange din adress</Fieldset.ErrorMessage>
      </Fieldset.Root>,
    )
    const group = page.getByRole('group', { name: 'Adress' })
    const [descriptionId, errorId] = (group.element().getAttribute('aria-describedby') ?? '').split(
      ' ',
    )
    expect(descriptionId).toBe(page.getByTestId('description').element().id)
    expect(errorId).not.toBe(descriptionId)
    await expect
      .element(group)
      .toHaveAccessibleDescription('Där du är folkbokförd. Error: Ange din adress')
  })

  test('a Prose in a Field inside a Fieldset describes the Field’s control, not the group', async () => {
    await render(
      <Fieldset.Root>
        <Fieldset.Legend>Adress</Fieldset.Legend>
        <Fieldset.Prose>Om gruppen.</Fieldset.Prose>
        <Field.Root>
          <Field.Label>Gata</Field.Label>
          <Field.Prose>Utan nummer.</Field.Prose>
          <TextInput />
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
        <Field.Prose>
          <h3>Rubrik</h3>
          <ul>
            <li>Ett</li>
            <li>Två</li>
          </ul>
          <a href="/hjalp">Hjälp</a>
        </Field.Prose>
        <TextInput />
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
        <Field.Prose
          data-testid="description"
          render={(partProps, state) => {
            seenStates.push(state)
            return <p {...partProps} />
          }}
        >
          Som i passet.
        </Field.Prose>
        <TextInput />
        <Field.ErrorMessage>Ange namn</Field.ErrorMessage>
      </Field.Root>,
    )
    const descriptionPart = page.getByTestId('description')
    await expect.element(descriptionPart).toHaveAttribute('data-invalid', '')
    await expect.element(descriptionPart).toHaveAttribute('data-disabled', '')
    expect(descriptionPart.element().tagName).toBe('P')
    expect(seenStates.at(-1)).toEqual({ isInvalid: true, isRequired: false, isDisabled: true })
  })

  test('keeps the consumer’s ref next to the registration', async () => {
    const ref = createRef<HTMLElement>()
    await render(
      <Field.Root>
        <Field.Label>Namn</Field.Label>
        <Field.Prose ref={ref} data-testid="description">
          Som i passet.
        </Field.Prose>
        <TextInput />
      </Field.Root>,
    )
    expect(ref.current).toBe(page.getByTestId('description').element())
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

  test('a Field with a Prose help text has no axe violations', async () => {
    const { container } = await render(
      <Field.Root invalid>
        <Field.Label>Personnummer</Field.Label>
        <Field.Prose>
          <p>12 siffror, utan bindestreck.</p>
        </Field.Prose>
        <TextInput name="pnr" />
        <Field.ErrorMessage>Ange ditt personnummer</Field.ErrorMessage>
      </Field.Root>,
    )
    await expect.element(page.getByRole('textbox')).toBeVisible()
    await expectNoA11yViolations(container)
  })

  test('a Fieldset with a Prose help text has no axe violations', async () => {
    const { container } = await render(
      <Fieldset.Root group>
        <Fieldset.Legend>Hur vill du bli kontaktad?</Fieldset.Legend>
        <Fieldset.Prose>
          <p>Välj alla som passar.</p>
        </Fieldset.Prose>
        <Field.Root>
          <Field.Label marker="none">E-post</Field.Label>
          <TextInput type="email" />
        </Field.Root>
      </Fieldset.Root>,
    )
    await expect.element(page.getByRole('group')).toBeVisible()
    await expectNoA11yViolations(container)
  })
})

describe('Prose content classes: kv-inset and kv-steps', () => {
  test('ol.kv-steps keeps the list role with one listitem per step, and no ARIA of its own', async () => {
    await render(
      <Prose>
        <ol className="kv-steps" data-testid="steps">
          <li>
            <h3>Ansök i e-tjänsten</h3>
            <p>Fyll i formuläret.</p>
          </li>
          <li>
            <h3>Du får ett beslut</h3>
            <p>Beslutet kommer med post.</p>
          </li>
          <li>
            <h3>Betala avgiften</h3>
            <p>Avgiften faktureras.</p>
          </li>
        </ol>
        <ol className="kv-steps" type="a" data-testid="lettered">
          <li>Första</li>
        </ol>
      </Prose>,
    )
    const steps = page.getByTestId('steps')
    await expect.element(steps).toHaveAttribute('class', 'kv-steps')
    await expect.element(page.getByTestId('lettered')).toHaveAttribute('type', 'a')
    expect(
      steps
        .element()
        .getAttributeNames()
        .filter((name) => name === 'role'),
    ).toEqual([])
    expect(page.getByRole('list').elements()).toHaveLength(2)
    expect(steps.element().querySelectorAll(':scope > li')).toHaveLength(3)
    expect(steps.element().querySelector('[aria-current], [tabindex]')).toBeNull()
  })

  test('kv-inset adds no role, no live region and no tab stop, and its text stays in the reading order', async () => {
    await render(
      <Prose>
        <h2>Ansökan</h2>
        <div className="kv-inset" data-testid="inset">
          <p>
            <strong>Tänk på:</strong> Ta med legitimation till mötet.
          </p>
        </div>
        <p>Efter mötet får du ett beslut.</p>
      </Prose>,
    )
    const inset = page.getByTestId('inset').element()
    expect(
      inset.getAttributeNames().filter((name) => name === 'role' || name.startsWith('aria-')),
    ).toEqual([])
    expect(inset.closest('[aria-live], [role=status], [role=alert]')).toBeNull()
    expect(inset.querySelector('[tabindex], a, button')).toBeNull()
    expect(page.getByRole('complementary').elements()).toHaveLength(0)
    await expect.element(page.getByText('Tänk på:')).toBeVisible()
  })

  test('an article with an inset, steps and a figure with alt text has no axe violations', async () => {
    const { container } = await render(
      <main>
        <Prose render={<article />}>
          <h1>Ansök om bostadsanpassning</h1>
          <div className="kv-inset">
            <p>
              <strong>Tänk på:</strong> Ta med legitimation till mötet.
            </p>
          </div>
          <h2>Så här går det till</h2>
          <ol className="kv-steps">
            <li>
              <h3>Ansök i e-tjänsten</h3>
              <p>Fyll i formuläret.</p>
            </li>
            <li>
              <h3>Du får ett beslut</h3>
              <p>Beslutet kommer med post.</p>
            </li>
          </ol>
          <figure>
            <img
              alt="Ritning över badrummet"
              src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='4' height='4'/%3E"
              width={4}
              height={4}
            />
            <figcaption>Kvirnby kommun, 2025</figcaption>
          </figure>
        </Prose>
      </main>,
    )
    await expect.element(page.getByRole('figure', { name: 'Kvirnby kommun, 2025' })).toBeVisible()
    await expectNoA11yViolations(container)
  })
})
