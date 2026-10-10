import { createRef } from 'react'
import { describe, expect, test } from 'vite-plus/test'
import { page } from 'vite-plus/test/browser'
import { render } from 'vitest-browser-react'
import { Address } from './address.tsx'

// Contract: address.a11y.md.

describe('Address', () => {
  test('renders an address element, merges className and passes attributes and the ref through', async () => {
    const ref = createRef<HTMLElement>()
    await render(
      <Address className="other" lang="en" ref={ref} data-testid="address">
        Storgatan 1
        <br />
        123 45 Kvirnby
      </Address>,
    )
    const element = page.getByTestId('address').element()
    expect(element.tagName).toBe('ADDRESS')
    expect(element.className).toBe('other kv-address')
    expect(element.getAttribute('lang')).toBe('en')
    expect(ref.current).toBe(element)
  })

  test('is not a Tab stop', async () => {
    await render(<Address data-testid="address">Storgatan 1</Address>)
    const element = page.getByTestId('address').element()
    expect(element.hasAttribute('tabindex')).toBe(false)
  })
})
