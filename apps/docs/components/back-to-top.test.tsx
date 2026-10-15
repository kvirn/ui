import { KvirnProvider } from '@kvirn-ui/react'
import { expectNoA11yViolations } from '@kvirn-ui/testing'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vite-plus/test'
import { page, userEvent } from 'vite-plus/test/browser'
import { render } from 'vitest-browser-react'
import { messages } from '../messages/en.ts'
import { BackToTop } from './back-to-top.tsx'

// Contract: docs/design/plans/0118-docs-back-to-top.md §Design. The button sits in `hidden` at the
// top, so queries that need the hidden state include hidden elements.
const text = messages.docs
const mainRef = { current: null as HTMLElement | null }

const renderPage = () =>
  render(
    <KvirnProvider locale="en">
      <style>{'button:not([hidden]) { display: inline-block; padding: 8px; margin: 4px; }'}</style>
      <main ref={mainRef} id="main">
        <p>The article.</p>
        <div style={{ height: '5000px' }} />
        <a href="#main">Last link</a>
      </main>
      <BackToTop mainRef={mainRef} />
    </KvirnProvider>,
  )

const button = (includeHidden = false) =>
  page.getByRole('button', { name: text.backToTop, includeHidden })

const scrollPast = async () => {
  window.scrollTo({ top: window.innerHeight * 2, behavior: 'instant' })
  await vi.waitFor(() => expect(window.scrollY).toBeGreaterThan(window.innerHeight * 1.5))
}

beforeEach(async () => {
  await page.viewport(414, 896)
})

afterEach(() => {
  window.scrollTo({ top: 0, behavior: 'instant' })
  vi.restoreAllMocks()
})

describe('Back to top', () => {
  test('is hidden at the top of the page', async () => {
    await renderPage()
    expect(button(true).element().hasAttribute('hidden')).toBe(true)
    expect(page.getByRole('button', { name: text.backToTop }).query()).toBeNull()
  })

  test('appears after the page is scrolled past 1.5 viewport heights', async () => {
    await renderPage()
    await scrollPast()
    await expect.element(button()).toBeVisible()
  })

  test('Tab from the last control in the content reaches the button', async () => {
    await renderPage()
    await scrollPast()
    await expect.element(button()).toBeVisible()
    const lastControl = document.querySelector<HTMLElement>('main a')!
    lastControl.focus()
    await vi.waitFor(() => expect(document.activeElement).toBe(lastControl))
    await userEvent.tab()
    await expect.element(button()).toHaveFocus()
  })

  test('Shift+Tab from the button returns to the last control in the content', async () => {
    await renderPage()
    await scrollPast()
    await expect.element(button()).toBeVisible()
    button().element().focus()
    await userEvent.tab({ shift: true })
    expect(document.activeElement).toBe(document.querySelector('main a'))
  })

  test('stays rendered while focused when the page is scrolled back to the top', async () => {
    await renderPage()
    await scrollPast()
    await expect.element(button()).toBeVisible()
    button().element().focus()
    window.scrollTo({ top: 0, behavior: 'instant' })
    await vi.waitFor(() => expect(window.scrollY).toBe(0))
    // Let the scroll event and the re-render run: without the focus rule the button hides here.
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))
    expect(button(true).element().hasAttribute('hidden')).toBe(false)
    expect(document.activeElement).toBe(button().element())
  })

  test('Enter scrolls to the top, focuses main and hides the button', async () => {
    await renderPage()
    await scrollPast()
    await expect.element(button()).toBeVisible()
    button().element().focus()
    await userEvent.keyboard('{Enter}')
    await vi.waitFor(() => expect(window.scrollY).toBe(0), { timeout: 4000 })
    expect(document.activeElement).toBe(mainRef.current)
    await vi.waitFor(() => expect(button(true).element().hasAttribute('hidden')).toBe(true))
  })

  test('Space activates it like Enter', async () => {
    await renderPage()
    await scrollPast()
    await expect.element(button()).toBeVisible()
    button().element().focus()
    await userEvent.keyboard(' ')
    await vi.waitFor(() => expect(window.scrollY).toBe(0), { timeout: 4000 })
    expect(document.activeElement).toBe(mainRef.current)
  })

  test('scrolls with behavior smooth by default', async () => {
    await renderPage()
    await scrollPast()
    await expect.element(button()).toBeVisible()
    const scrollTo = vi.spyOn(window, 'scrollTo')
    await button().click()
    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' })
  })

  test('uses behavior auto when the reader prefers reduced motion', async () => {
    await renderPage()
    await scrollPast()
    await expect.element(button()).toBeVisible()
    vi.spyOn(window, 'matchMedia').mockImplementation(
      (query) => ({ matches: true, media: query }) as MediaQueryList,
    )
    const scrollTo = vi.spyOn(window, 'scrollTo')
    await button().click()
    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'auto' })
  })

  test('has no axe violations hidden or visible', async () => {
    const { container } = await renderPage()
    await expectNoA11yViolations(container)
    await scrollPast()
    await expect.element(button()).toBeVisible()
    await expectNoA11yViolations(container)
  })
})
