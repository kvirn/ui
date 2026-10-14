import '@kvirn-ui/theme/theme.css'
import { KvirnProvider } from '@kvirn-ui/react'
import { expectNoA11yViolations } from '@kvirn-ui/testing'
import { describe, expect, test } from 'vite-plus/test'
import { page } from 'vite-plus/test/browser'
import { render } from 'vitest-browser-react'
import PatternsIndexPage from '../app/(docs)/patterns/page.tsx'
import { PatternPage } from './pattern-page.tsx'
import { patternGroups, patternPages } from './site-sections.ts'

const filledGroups = patternGroups.filter((group) => group.pages.length > 0)

const renderIndex = () =>
  render(
    <KvirnProvider locale="en">
      <PatternsIndexPage />
    </KvirnProvider>,
  )

describe('Patterns index', () => {
  test('one h1', async () => {
    await renderIndex()
    expect(page.getByRole('heading', { level: 1 }).elements()).toHaveLength(1)
  })

  test('one h2 per group with items, with the group id, and none for an empty group', async () => {
    const { container } = await renderIndex()
    expect(page.getByRole('heading', { level: 2 }).elements()).toHaveLength(filledGroups.length)
    for (const group of filledGroups) {
      expect(container.querySelector(`h2#${group.id}`)?.textContent).toBe(group.label)
    }
  })

  test('each group is a list with one item per pattern', async () => {
    const { container } = await renderIndex()
    for (const group of filledGroups) {
      const list = container
        .querySelector(`h2#${group.id}`)
        ?.nextElementSibling?.querySelector('ul')
      expect(list).not.toBeNull()
      expect(list?.querySelectorAll(':scope > li')).toHaveLength(group.pages.length)
    }
  })

  test('one link per pattern, named uniquely and pointing at its page', async () => {
    await renderIndex()
    const names = patternPages.map((pattern) => pattern.label)
    expect(new Set(names).size).toBe(names.length)
    for (const pattern of patternPages) {
      const links = page.getByRole('link', { name: pattern.label, exact: true })
      expect(links.elements()).toHaveLength(1)
      await expect.element(links).toHaveAttribute('href', pattern.href)
    }
  })

  test('previews are hidden from assistive technology', async () => {
    const { container } = await renderIndex()
    const previews = container.querySelectorAll('.docs-gallery-preview')
    expect(previews.length).toBeGreaterThan(0)
    for (const preview of previews) {
      expect(preview.getAttribute('aria-hidden')).toBe('true')
    }
  })

  test('has no axe violations', async () => {
    const { container } = await renderIndex()
    await expect.element(page.getByRole('link', { name: 'Hero' })).toBeInTheDocument()
    await expectNoA11yViolations(container)
  })
})

describe('PatternPage', () => {
  const renderItem = () =>
    render(
      <KvirnProvider locale="en">
        <PatternPage slug="site-alert" />
      </KvirnProvider>,
    )

  test('one h1 named by the pattern, with the summary as the lead', async () => {
    await renderItem()
    const headings = page.getByRole('heading', { level: 1 })
    expect(headings.elements()).toHaveLength(1)
    await expect.element(headings).toHaveTextContent('Site alert')
    const summary = patternPages.find((entry) => entry.label === 'Site alert')!.summary
    await expect.element(page.getByText(summary)).toBeInTheDocument()
  })

  test('lists the native elements it is built from', async () => {
    const { container } = await renderItem()
    const section = container.querySelector('h2#built-from')
    expect(section?.textContent).toContain('Built from')
    await expect
      .element(page.getByRole('listitem').filter({ hasText: 'A named region' }))
      .toBeInTheDocument()
  })

  test('has no axe violations', async () => {
    const { container } = await renderItem()
    await expect.element(page.getByRole('heading', { level: 1 })).toBeInTheDocument()
    await expectNoA11yViolations(container)
  })
})
