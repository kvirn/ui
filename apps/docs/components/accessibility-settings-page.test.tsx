import '@kvirn-ui/theme/theme.css'
import { KvirnProvider, useTheme } from '@kvirn-ui/react'
import { expectNoA11yViolations } from '@kvirn-ui/testing'
import { useEffect } from 'react'
import { afterEach, beforeEach, describe, expect, test } from 'vite-plus/test'
import { page, userEvent } from 'vite-plus/test/browser'
import { render } from 'vitest-browser-react'
import AccessibilitySettingsRoute, { metadata } from '../app/(docs)/accessibility-settings/page.tsx'
import { messages } from '../messages/en.ts'

// Contract: Plan 0107 contract, and
// docs/design/accessibility-settings-page.md §4 and §5. The theme script sets the colour scheme
// before first paint, so a test that stands in for JavaScript sets it too.
const text = messages.docs.accessibility

beforeEach(async () => {
  await page.viewport(1280, 900)
  document.documentElement.setAttribute('data-kv-color-scheme', 'light')
})

afterEach(() => {
  localStorage.clear()
  const root = document.documentElement
  for (const name of root.getAttributeNames()) {
    if (name.startsWith('data-kv-')) {
      root.removeAttribute(name)
    }
  }
})

/** The theme store outlives a test: start each one light, as a first visit with no device setting. */
function Reset() {
  const { selectColorScheme } = useTheme()
  useEffect(() => {
    selectColorScheme('light')
  }, [selectColorScheme])
  return null
}

const renderPage = () =>
  render(
    <KvirnProvider locale="en">
      <Reset />
      <AccessibilitySettingsRoute />
    </KvirnProvider>,
  )

describe('Accessibility settings page', () => {
  test('the title is "Accessibility settings – KvirnUI"', () => {
    expect(metadata.title).toBe('Accessibility settings – KvirnUI')
  })

  test('one h1 and the six h2s, in the order of the spec', async () => {
    await renderPage()
    const h1s = page.getByRole('heading', { level: 1 })
    expect(h1s.elements()).toHaveLength(1)
    await expect.element(h1s).toHaveTextContent(messages.docs.header.accessibilitySettings)
    const h2s = page
      .getByRole('heading', { level: 2 })
      .elements()
      .map((heading) => heading.textContent?.replace(/#$/, ''))
      .filter((name) => name !== messages.docs.contents.heading)
    expect(h2s).toEqual([
      text.display.heading,
      text.keyboard.heading,
      text.skip.heading,
      text.zoom.heading,
      text.device.heading,
      text.report.heading,
    ])
  })

  test('the Display panel is present', async () => {
    await renderPage()
    await expect.element(page.getByRole('group', { name: 'Colour scheme' })).toBeVisible()
  })

  test('choosing an option moves no focus and announces nothing', async () => {
    await renderPage()
    const dark = page.getByRole('radio', { name: 'Dark' })
    await userEvent.click(dark)
    expect(document.activeElement).toBe(dark.element())
    expect(page.getByRole('status').element().textContent).toBe('')
  })

  test('the keyboard table has header cells and its keys are in kbd', async () => {
    await renderPage()
    const table = page.getByRole('table', { name: text.keyboard.tableLabel }).element()
    expect(table.querySelectorAll('thead th')).toHaveLength(2)
    expect(table.querySelectorAll('tbody tr')).toHaveLength(text.keyboard.rows.length)
    expect(table.querySelectorAll('tbody th kbd').length).toBeGreaterThan(0)
  })

  test('the keyboard table has the row Ctrl and K, with Command and K on a Mac', async () => {
    await renderPage()
    const table = page.getByRole('table', { name: text.keyboard.tableLabel }).element()
    const row = [...table.querySelectorAll('tbody tr')].find((candidate) =>
      candidate.querySelector('td')?.textContent?.startsWith('Go to the search box.'),
    )
    expect(row?.querySelector('th')?.textContent).toBe('Ctrl and K')
    expect(row?.querySelector('td')?.textContent).toContain('Command and K')
  })

  test('the device settings are an Accordion of four with h3 triggers that open on Enter', async () => {
    await renderPage()
    const triggers = page.getByRole('button', { name: /^(Windows|Mac|iPhone and iPad|Android)$/ })
    expect(triggers.elements()).toHaveLength(4)
    expect(triggers.elements().every((trigger) => trigger.parentElement?.tagName === 'H3')).toBe(
      true,
    )
    const windows = page.getByRole('button', { name: 'Windows' })
    windows.element().focus()
    await userEvent.keyboard('{Enter}')
    expect(windows.element().getAttribute('aria-expanded')).toBe('true')
  })

  test('the report section links GitHub issues and the support address', async () => {
    await renderPage()
    await expect
      .element(page.getByRole('link', { name: text.report.action }))
      .toHaveAttribute('href', 'https://github.com/kvirn/ui/issues')
    await expect
      .element(page.getByRole('link', { name: text.report.email }))
      .toHaveAttribute('href', 'mailto:support@kvirn.com')
  })

  test('the page does not claim compliance or full accessibility', async () => {
    await renderPage()
    const body = document.body.textContent ?? ''
    expect(body).not.toMatch(/compliant|fully accessible|conforms/i)
    expect(body).toContain('designed and tested to meet WCAG 2.2 AA')
  })

  test('the page has no axe violations', async () => {
    const { container } = await renderPage()
    await expect.element(page.getByRole('radio', { name: 'Dark' })).toBeVisible()
    await expectNoA11yViolations(container)
  })
})
