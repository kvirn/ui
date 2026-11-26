import { readAloud } from '@kvirn/testing/read-aloud'
import { createRef } from 'react'
import { describe, expect, test } from 'vite-plus/test'
import { page } from 'vite-plus/test/browser'
import { render } from 'vitest-browser-react'
import { Divider } from './divider.tsx'

// Contract: divider.a11y.md.

describe('Divider', () => {
  test('keeps the kv-divider class next to a className prop', async () => {
    await render(<Divider className="other" data-testid="divider" />)
    expect(page.getByTestId('divider').element().className).toBe('other kv-divider')
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

  describe('read aloud', () => {
    test('a default divider reads as a separator between the paragraphs', async () => {
      const { container } = await render(
        <div>
          <p>Above</p>
          <Divider />
          <p>Below</p>
        </div>,
      )
      const phrases = await readAloud(container)
      const above = phrases.findIndex((phrase) => phrase.includes('Above'))
      const below = phrases.findIndex((phrase) => phrase.includes('Below'))
      expect(phrases.slice(above + 1, below).some((phrase) => phrase.startsWith('separator'))).toBe(
        true,
      )
    })

    test('a presentation divider reads nothing between the paragraphs', async () => {
      const { container } = await render(
        <div>
          <p>Above</p>
          <Divider role="presentation" />
          <p>Below</p>
        </div>,
      )
      const phrases = await readAloud(container)
      expect(phrases.some((phrase) => phrase.startsWith('separator'))).toBe(false)
    })
  })
})
