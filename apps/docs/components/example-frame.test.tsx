import { KvirnProvider } from '@kvirn-ui/react'
import { expectNoA11yViolations } from '@kvirn-ui/testing'
import { afterEach, describe, expect, test, vi } from 'vite-plus/test'
import { page, userEvent } from 'vite-plus/test/browser'
import { render } from 'vitest-browser-react'
import { messages } from '../messages/en.ts'
import { ExampleFrame } from './example-frame.tsx'

// Contract: docs/design/docs-code.md §7.

const text = messages.docs.code
const code = "import { Button } from '@kvirn-ui/react'\nconst size = 4"

const toggle = () => page.getByRole('button', { name: text.toggle({ count: 2 }) })
const copyButton = () => page.getByRole('button', { name: text.copy })
const politeRegion = () => page.getByRole('status')

function stubClipboard(writeText: (value: string) => Promise<void>) {
  Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true })
}

const renderFrame = () =>
  render(
    <KvirnProvider>
      <ExampleFrame caption="A button" code={code}>
        <p>An example</p>
      </ExampleFrame>
    </KvirnProvider>,
  )

afterEach(() => {
  Reflect.deleteProperty(navigator, 'clipboard')
  window.getSelection()?.removeAllRanges()
})

describe('ExampleFrame code bar', () => {
  test('the toggle is collapsed, names the line count and points at the panel', async () => {
    const { container } = await renderFrame()
    await expect.element(toggle()).toHaveAttribute('aria-expanded', 'false')
    const panel = container.querySelector('.docs-code-panel')
    expect(toggle().element().getAttribute('aria-controls')).toBe(panel?.id)
    expect(panel?.getAttribute('hidden')).toBe('until-found')
  })

  test('click opens and closes the code, and focus stays on the toggle', async () => {
    const { container } = await renderFrame()
    await userEvent.click(toggle())
    await expect.element(toggle()).toHaveAttribute('aria-expanded', 'true')
    expect(container.querySelector('.docs-code-panel')?.hasAttribute('hidden')).toBe(false)
    expect(document.activeElement).toBe(toggle().element())
    await userEvent.click(toggle())
    await expect.element(toggle()).toHaveAttribute('aria-expanded', 'false')
  })

  test('Enter toggles the code', async () => {
    await renderFrame()
    ;(toggle().element() as HTMLElement).focus()
    await userEvent.keyboard('{Enter}')
    await expect.element(toggle()).toHaveAttribute('aria-expanded', 'true')
    expect(document.activeElement).toBe(toggle().element())
  })

  test('Space toggles the code', async () => {
    await renderFrame()
    ;(toggle().element() as HTMLElement).focus()
    await userEvent.keyboard(' ')
    await expect.element(toggle()).toHaveAttribute('aria-expanded', 'true')
    expect(document.activeElement).toBe(toggle().element())
  })

  test('Tab moves from the toggle to Copy code', async () => {
    await renderFrame()
    ;(toggle().element() as HTMLElement).focus()
    await userEvent.tab()
    expect(document.activeElement).toBe(copyButton().element())
  })

  test('Shift+Tab moves from Copy code back to the toggle', async () => {
    await renderFrame()
    ;(copyButton().element() as HTMLElement).focus()
    await userEvent.tab({ shift: true })
    expect(document.activeElement).toBe(toggle().element())
  })

  test('the open, overflowing code is a region named by the example title and Code', async () => {
    await render(
      <KvirnProvider>
        <div style={{ inlineSize: '12rem' }}>
          <ExampleFrame caption="A button" code={`const long = '${'x'.repeat(200)}'`}>
            <p>An example</p>
          </ExampleFrame>
        </div>
      </KvirnProvider>,
    )
    await userEvent.click(page.getByRole('button', { name: text.toggle({ count: 1 }) }))
    await expect.element(page.getByRole('region', { name: 'A button Code' })).toBeInTheDocument()
  })

  test('a first line that names the file is the code panel’s header, and a copy leaves it out', async () => {
    const writeText = vi.fn<(value: string) => Promise<void>>(async () => {})
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true })
    const { container } = await render(
      <KvirnProvider>
        <ExampleFrame caption="A button" code={'// button/default.tsx\nconst size = 4'}>
          <p>An example</p>
        </ExampleFrame>
      </KvirnProvider>,
    )
    const header = container.querySelector('.docs-code-panel .docs-code-header')
    expect(header?.querySelector('.docs-code-file')?.textContent).toBe('button/default.tsx')
    expect(container.querySelector('.docs-code-panel pre')?.textContent).toBe('const size = 4')
    await userEvent.click(page.getByRole('button', { name: messages.docs.code.copy }))
    expect(writeText).toHaveBeenCalledWith('const size = 4')
    Reflect.deleteProperty(navigator, 'clipboard')
  })

  test('the collapsed frame has no axe violations', async () => {
    const { container } = await renderFrame()
    await expect.element(toggle()).toHaveAttribute('aria-expanded', 'false')
    await expectNoA11yViolations(container)
  })

  test('the open frame with overflowing code has no axe violations', async () => {
    const { container } = await render(
      <KvirnProvider>
        <div style={{ inlineSize: '12rem' }}>
          <ExampleFrame caption="A button" code={`const long = '${'x'.repeat(200)}'`}>
            <p>An example</p>
          </ExampleFrame>
        </div>
      </KvirnProvider>,
    )
    await userEvent.click(page.getByRole('button', { name: text.toggle({ count: 1 }) }))
    await expect.element(page.getByRole('region', { name: 'A button Code' })).toBeInTheDocument()
    await expectNoA11yViolations(container)
  })

  test('copying while the code is collapsed announces copied and keeps it collapsed', async () => {
    const writeText = vi.fn<(value: string) => Promise<void>>(async () => {})
    stubClipboard(writeText)
    await renderFrame()
    await userEvent.click(copyButton())
    await expect.element(politeRegion()).toHaveTextContent(text.copied)
    expect(writeText).toHaveBeenCalledWith(code)
    await expect.element(toggle()).toHaveAttribute('aria-expanded', 'false')
  })

  test('a refused clipboard announces copyFailed, opens the code and selects it', async () => {
    stubClipboard(async () => {
      throw new Error('denied')
    })
    await renderFrame()
    await userEvent.click(copyButton())
    await expect.element(politeRegion()).toHaveTextContent(text.copyFailed)
    await expect.element(toggle()).toHaveAttribute('aria-expanded', 'true')
    await vi.waitFor(() => expect(window.getSelection()?.toString()).toBe(code))
    expect(document.activeElement).toBe(copyButton().element())
  })

  test('find in page (beforematch) opens the panel and the toggle follows', async () => {
    const { container } = await renderFrame()
    container.querySelector('.docs-code-panel')?.dispatchEvent(new Event('beforematch'))
    await expect.element(toggle()).toHaveAttribute('aria-expanded', 'true')
  })
})
