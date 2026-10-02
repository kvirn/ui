import { expectNoA11yViolations } from '@kvirn-ui/testing'
import { describe, expect, test } from 'vite-plus/test'
import { page } from 'vite-plus/test/browser'
import { render } from 'vitest-browser-react'
import { Heading } from '../heading/heading.tsx'
import { Prose, ProseRoot } from './prose.tsx'
import { useProse } from './use-prose.ts'

// Contract: prose.a11y.md.

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
