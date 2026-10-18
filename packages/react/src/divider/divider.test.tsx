import { expectNoA11yViolations } from '@kvirn-ui/testing'
import { createRef } from 'react'
import { describe, expect, test } from 'vite-plus/test'
import { page } from 'vite-plus/test/browser'
import { render } from 'vitest-browser-react'
import { Divider } from './divider.tsx'

// Contract: divider.a11y.md.

describe('Divider', () => {
  test('renders an hr element', async () => {
    await render(<Divider data-testid="divider" />)
    expect(page.getByTestId('divider').element().tagName).toBe('HR')
  })

  test('keeps the kv-divider class next to a className prop', async () => {
    await render(<Divider className="other" data-testid="divider" />)
    expect(page.getByTestId('divider').element().className).toBe('other kv-divider')
  })

  test('passes role="presentation" through', async () => {
    await render(<Divider role="presentation" data-testid="divider" />)
    expect(page.getByTestId('divider').element().getAttribute('role')).toBe('presentation')
  })

  test('forwards the ref to the hr', async () => {
    const ref = createRef<HTMLHRElement>()
    await render(<Divider ref={ref} data-testid="divider" />)
    expect(ref.current).toBe(page.getByTestId('divider').element())
  })

  test('is not a Tab stop', async () => {
    await render(<Divider data-testid="divider" />)
    expect(page.getByTestId('divider').element().hasAttribute('tabindex')).toBe(false)
  })

  test('has no axe violations as a separator and as presentation', async () => {
    const { container } = await render(
      <main>
        <p>Above</p>
        <Divider />
        <p>Between</p>
        <Divider role="presentation" />
        <p>Below</p>
      </main>,
    )
    await expect.element(page.getByText('Between')).toBeVisible()
    await expectNoA11yViolations(container)
  })
})
