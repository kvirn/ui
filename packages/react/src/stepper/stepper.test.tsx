import { en } from '@kvirn-ui/i18n/en'
import { fi } from '@kvirn-ui/i18n/fi'
import { nb } from '@kvirn-ui/i18n/nb'
import { nn } from '@kvirn-ui/i18n/nn'
import { se } from '@kvirn-ui/i18n/se'
import { sv } from '@kvirn-ui/i18n/sv'
import { expectNoA11yViolations } from '@kvirn-ui/testing'
import { readAloud } from '@kvirn-ui/testing/read-aloud'
import { createRef } from 'react'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vite-plus/test'
import type { MockInstance } from 'vite-plus/test'
import { page, userEvent } from 'vite-plus/test/browser'
import { render } from 'vitest-browser-react'
import { Button } from '../button/button.tsx'
import { resetDevWarnings } from '../dev/dev-warning.ts'
import { KvirnProvider } from '../provider/kvirn-provider.tsx'
import { Stepper } from './stepper.tsx'
import { useStepper } from './use-stepper.ts'

// Contract: stepper.a11y.md.

let consoleWarn: MockInstance<Console['warn']>

beforeEach(() => {
  resetDevWarnings()
  consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {})
})

afterEach(() => {
  consoleWarn.mockRestore()
})

const warnedWith = (code: string) =>
  consoleWarn.mock.calls.some(([message]) => String(message).includes(code))

describe('Stepper', () => {
  test('renders one p with the position and a class, no role or ARIA, and passes attributes and the ref through', async () => {
    const ref = createRef<HTMLElement>()
    await render(
      <Stepper current={2} total={5} id="step" lang="en" ref={ref} data-testid="stepper" />,
    )
    const element = page.getByTestId('stepper').element()
    expect(element.tagName).toBe('P')
    expect(element.textContent).toBe('Step 2 of 5')
    expect(element.getAttributeNames().sort()).toEqual(['class', 'data-testid', 'id', 'lang'])
    expect(element.className).toBe('kv-stepper')
    expect(ref.current).toBe(element)
  })

  test('a name gives "Step 2 of 5: Your vehicle", a blank name counts as none', async () => {
    await render(
      <>
        <Stepper current={2} total={5} name="Your vehicle" data-testid="named" />
        <Stepper current={2} total={5} name="  " data-testid="blank" />
      </>,
    )
    expect(page.getByTestId('named').element().textContent).toBe('Step 2 of 5: Your vehicle')
    expect(page.getByTestId('blank').element().textContent).toBe('Step 2 of 5')
  })

  test.each([
    ['en', en, 'Step 2 of 5', 'Step 2 of 5: Name'],
    ['sv', sv, 'Steg 2 av 5', 'Steg 2 av 5: Name'],
    ['nb', nb, 'Steg 2 av 5', 'Steg 2 av 5: Name'],
    ['nn', nn, 'Steg 2 av 5', 'Steg 2 av 5: Name'],
    ['fi', fi, 'Vaihe 2/5', 'Vaihe 2/5: Name'],
    ['se', se, 'Step 2 of 5', 'Step 2 of 5: Name'],
  ] as const)(
    'the %s catalog has both messages with the placeholders',
    async (locale, messages, status, statusWithName) => {
      await render(
        <KvirnProvider locale={locale} messages={messages}>
          <Stepper current={2} total={5} data-testid="plain" />
          <Stepper current={2} total={5} name="Name" data-testid="named" />
        </KvirnProvider>,
      )
      expect(page.getByTestId('plain').element().textContent).toBe(status)
      expect(page.getByTestId('named').element().textContent).toBe(statusWithName)
    },
  )

  test('numbers go through format.number', async () => {
    await render(
      <KvirnProvider locale="sv" messages={sv}>
        <Stepper current={2} total={1000} data-testid="stepper" />
      </KvirnProvider>,
    )
    expect(page.getByTestId('stepper').element().textContent).toBe(
      `Steg 2 av ${new Intl.NumberFormat('sv').format(1000)}`,
    )
  })

  test('a provider override and the per-instance messages prop both replace the text', async () => {
    await render(
      <KvirnProvider
        messages={{
          stepper: {
            statusWithName: ({ current, total, name }) => `${name} (${current}/${total})`,
          },
        }}
      >
        <Stepper current={2} total={5} name="Fordonet" data-testid="provider" />
        <Stepper
          current={2}
          total={5}
          messages={{ status: ({ current }) => `Del ${current}` }}
          data-testid="instance"
        />
      </KvirnProvider>,
    )
    expect(page.getByTestId('provider').element().textContent).toBe('Fordonet (2/5)')
    expect(page.getByTestId('instance').element().textContent).toBe('Del 2')
  })

  test('has no role, tabindex, live region or description', async () => {
    await render(<Stepper current={1} total={3} data-testid="stepper" />)
    const element = page.getByTestId('stepper').element()
    expect(element.querySelector('a, button, ol, ul, [role]')).toBeNull()
    expect(document.querySelector('[aria-live]')).toBeNull()
  })

  test('render changes the element and its function gets the state and the text', async () => {
    await render(
      <>
        <Stepper current={1} total={3} render={<div data-testid="element" />} />
        <Stepper
          current={2}
          total={3}
          render={(props, state) => (
            <div {...props} data-testid="function" title={`${state.current}/${state.total}`} />
          )}
        />
      </>,
    )
    expect(page.getByTestId('element').element().tagName).toBe('DIV')
    expect(page.getByTestId('element').element().textContent).toBe('Step 1 of 3')
    expect(page.getByTestId('function').element().textContent).toBe('Step 2 of 3')
    expect(page.getByTestId('function').element().getAttribute('title')).toBe('2/3')
  })

  test('useStepper gives the text, the element and the class', async () => {
    function Own() {
      const stepper = useStepper({ current: 3, total: 4, name: 'Adress' })
      return (
        <p {...stepper.rootProps} data-testid="own" data-element={stepper.element}>
          {stepper.text}
        </p>
      )
    }
    await render(<Own />)
    const element = page.getByTestId('own').element()
    expect(element.textContent).toBe('Step 3 of 4: Adress')
    expect(element.dataset.element).toBe('p')
  })

  test('is the reading stop right after the heading', async () => {
    const { container } = await render(
      <main>
        <h1>Which vehicle is the permit for?</h1>
        <Stepper current={2} total={5} name="Your vehicle" />
      </main>,
    )
    const phrases = await readAloud(container)
    const headingIndex = phrases.findIndex((phrase) => phrase.includes('Which vehicle'))
    expect(phrases[headingIndex]).toContain('heading')
    const stepIndex = phrases.findIndex((phrase) => phrase.includes('Step 2 of 5: Your vehicle'))
    expect(
      phrases.slice(headingIndex + 1, stepIndex + 1).filter((phrase) => phrase !== 'paragraph'),
    ).toEqual(['Step 2 of 5: Your vehicle'])
  })

  test('reads without a name and with a blank name as the position alone', async () => {
    const { container } = await render(
      <main>
        <h1>Which vehicle is the permit for?</h1>
        <Stepper current={2} total={5} />
        <Stepper current={3} total={5} name="  " />
      </main>,
    )
    const phrases = await readAloud(container)
    expect(phrases).toContain('Step 2 of 5')
    expect(phrases).toContain('Step 3 of 5')
    expect(phrases.some((phrase) => phrase.includes(':'))).toBe(false)
  })

  describe('dev warnings', () => {
    test('warns once for a current or total that is not a positive whole number', async () => {
      await render(<Stepper current={0} total={2.5} />)
      expect(warnedWith('positive whole numbers')).toBe(true)
      const count = consoleWarn.mock.calls.length
      await render(<Stepper current={0} total={2.5} />)
      expect(consoleWarn.mock.calls.length).toBe(count)
    })

    test('warns when current is after total', async () => {
      await render(<Stepper current={6} total={5} />)
      expect(warnedWith('current=6 after total=5')).toBe(true)
    })

    test('does not warn for a valid position', async () => {
      await render(<Stepper current={5} total={5} />)
      expect(consoleWarn).not.toHaveBeenCalled()
    })

    test.each(['h1', 'label', 'legend'] as const)('warns once inside a %s', async (tag) => {
      const Tag = tag
      await render(
        <Tag>
          Rubrik <Stepper current={1} total={2} />
        </Tag>,
      )
      expect(warnedWith('so its text joins that name')).toBe(true)
    })

    test('does not warn directly after the heading', async () => {
      await render(
        <>
          <h1>Rubrik</h1>
          <Stepper current={1} total={2} />
        </>,
      )
      expect(consoleWarn).not.toHaveBeenCalled()
    })
  })

  describe('keyboard', () => {
    function Around() {
      return (
        <KvirnProvider>
          <Button>Tillbaka</Button>
          <Stepper current={2} total={5} />
          <input aria-label="Fält" />
        </KvirnProvider>
      )
    }

    test('Tab passes over it', async () => {
      await render(<Around />)
      await userEvent.keyboard('{Tab}')
      await expect.element(page.getByRole('button', { name: 'Tillbaka' })).toHaveFocus()
      await userEvent.keyboard('{Tab}')
      await expect.element(page.getByRole('textbox', { name: 'Fält' })).toHaveFocus()
    })

    test('Shift+Tab passes over it', async () => {
      await render(<Around />)
      page.getByRole('textbox', { name: 'Fält' }).element().focus()
      await userEvent.keyboard('{Shift>}{Tab}{/Shift}')
      await expect.element(page.getByRole('button', { name: 'Tillbaka' })).toHaveFocus()
    })
  })

  test('has no axe violations', async () => {
    const { container } = await render(
      <main>
        <h1>Which vehicle is the permit for?</h1>
        <Stepper current={2} total={5} name="Your vehicle" />
      </main>,
    )
    await expect.element(page.getByText('Step 2 of 5: Your vehicle')).toBeVisible()
    await expectNoA11yViolations(container)
  })
})
