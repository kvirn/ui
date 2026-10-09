import { expectNoA11yViolations } from '@kvirn-ui/testing'
import { createRef } from 'react'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vite-plus/test'
import type { MockInstance } from 'vite-plus/test'
import { page } from 'vite-plus/test/browser'
import { render } from 'vitest-browser-react'
import { resetDevWarnings } from '../dev/dev-warning.ts'
import { Badge } from './badge.tsx'
import { useBadge } from './use-badge.ts'
import type { BadgeVariant } from './use-badge.ts'

// Contract: badge.a11y.md.

let consoleWarn: MockInstance<Console['warn']>

beforeEach(() => {
  resetDevWarnings()
  consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {})
})

afterEach(() => {
  consoleWarn.mockRestore()
})

const warnings = () => consoleWarn.mock.calls.map(([message]) => String(message))

const variants: BadgeVariant[] = ['neutral', 'primary', 'info', 'success', 'warning', 'danger']

describe('Badge', () => {
  test('renders a span, no role or ARIA, and passes attributes and the ref through', async () => {
    const ref = createRef<HTMLElement>()
    await render(
      <Badge id="status" lang="sv" ref={ref} data-testid="badge">
        Beviljad
      </Badge>,
    )
    const element = page.getByTestId('badge').element()
    expect(element.tagName).toBe('SPAN')
    expect(element.textContent).toBe('Beviljad')
    expect(element.getAttributeNames().sort()).toEqual(['class', 'data-testid', 'id', 'lang'])
    expect(ref.current).toBe(element)
  })

  test('the class is kv-badge, with kv-badge--variant for every variant but neutral', async () => {
    await render(
      <>
        {variants.map((variant) => (
          <Badge key={variant} variant={variant} data-testid={variant}>
            {variant}
          </Badge>
        ))}
      </>,
    )
    expect(page.getByTestId('neutral').element().className).toBe('kv-badge')
    for (const variant of variants.slice(1)) {
      expect(page.getByTestId(variant).element().className).toBe(`kv-badge kv-badge--${variant}`)
    }
  })

  test("the part class joins a consumer's", async () => {
    await render(
      <Badge className="annan" variant="info" data-testid="badge">
        Info
      </Badge>,
    )
    expect(page.getByTestId('badge').element().className).toBe('annan kv-badge kv-badge--info')
  })

  test('useBadge gives the element and the class', () => {
    expect(useBadge().element).toBe('span')
    expect(useBadge().rootProps.className).toBe('kv-badge')
    expect(useBadge({ variant: 'danger' }).rootProps.className).toBe('kv-badge kv-badge--danger')
  })

  test('as changes the element to strong or em', async () => {
    await render(
      <>
        <Badge as="strong" data-testid="strong">
          Ny
        </Badge>
        <Badge as="em" data-testid="em">
          Ny
        </Badge>
      </>,
    )
    expect(page.getByTestId('strong').element().tagName).toBe('STRONG')
    expect(page.getByTestId('em').element().tagName).toBe('EM')
  })

  test('an element outside the allowed list warns once and renders a span', async () => {
    const notAllowed = 'h2' as 'span'
    await render(
      <Badge as={notAllowed} data-testid="badge">
        Ny
      </Badge>,
    )
    expect(page.getByTestId('badge').element().tagName).toBe('SPAN')
    expect(warnings().filter((message) => message.includes('Badge as="h2"'))).toHaveLength(1)
  })

  test('the ref, className and variant still apply to the chosen element', async () => {
    const ref = createRef<HTMLElement>()
    await render(
      <Badge as="strong" variant="warning" ref={ref} className="annan" data-testid="badge">
        Ny
      </Badge>,
    )
    expect(ref.current).toBe(page.getByTestId('badge').element())
    expect(ref.current?.className).toBe('annan kv-badge kv-badge--warning')
  })

  test('is not a Tab stop', async () => {
    await render(<Badge data-testid="badge">Utkast</Badge>)
    const element = page.getByTestId('badge').element()
    expect(element.hasAttribute('tabindex')).toBe(false)
    expect(element.tabIndex).toBe(-1)
  })

  test('has no role and no live region', async () => {
    await render(<Badge data-testid="badge">Utkast</Badge>)
    const element = page.getByTestId('badge').element()
    expect(element.hasAttribute('role')).toBe(false)
    expect(element.hasAttribute('aria-live')).toBe(false)
  })

  test('has no axe violations in any variant', async () => {
    const { container } = await render(
      <main>
        <h1>Mina ärenden</h1>
        <ul>
          {variants.map((variant) => (
            <li key={variant}>
              Ärende <Badge variant={variant}>Status {variant}</Badge>
            </li>
          ))}
        </ul>
      </main>,
    )
    await expect.element(page.getByText('Status danger')).toBeVisible()
    await expectNoA11yViolations(container)
  })
})
