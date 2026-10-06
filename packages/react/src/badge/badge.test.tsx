import { expectNoA11yViolations } from '@kvirn-ui/testing'
import { createRef } from 'react'
import { describe, expect, test } from 'vite-plus/test'
import { page } from 'vite-plus/test/browser'
import { render } from 'vitest-browser-react'
import { Badge } from './badge.tsx'
import { useBadge } from './use-badge.ts'
import type { BadgeVariant } from './use-badge.ts'

// Contract: badge.a11y.md.

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

  test('render changes the element and its function gets the variant', async () => {
    await render(
      <>
        <Badge render={<strong data-testid="element" />}>Ny</Badge>
        <Badge
          variant="warning"
          render={(props, state) => (
            <strong {...props} data-testid="function" title={state.variant} />
          )}
        >
          Ny
        </Badge>
      </>,
    )
    expect(page.getByTestId('element').element().tagName).toBe('STRONG')
    expect(page.getByTestId('function').element().getAttribute('title')).toBe('warning')
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
