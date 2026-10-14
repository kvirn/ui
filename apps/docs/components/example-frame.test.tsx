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

const renderFrame = (frameCode = code) =>
  render(
    <KvirnProvider>
      <h2 id="example">A button</h2>
      <ExampleFrame headingId="example" code={frameCode}>
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

  test('Tab moves from the toggle to Copy code while the code is open', async () => {
    await renderFrame()
    await userEvent.click(toggle())
    ;(toggle().element() as HTMLElement).focus()
    await userEvent.tab()
    expect(document.activeElement).toBe(copyButton().element())
  })

  test('Shift+Tab moves from Copy code back to the toggle', async () => {
    await renderFrame()
    await userEvent.click(toggle())
    ;(copyButton().element() as HTMLElement).focus()
    await userEvent.tab({ shift: true })
    expect(document.activeElement).toBe(toggle().element())
  })

  test('collapsed, Copy code is not reachable by role or by Tab', async () => {
    await render(
      <KvirnProvider>
        <h2 id="example">A button</h2>
        <ExampleFrame headingId="example" code={code}>
          <p>An example</p>
        </ExampleFrame>
        <button type="button">After</button>
      </KvirnProvider>,
    )
    expect(copyButton().elements()).toHaveLength(0)
    ;(toggle().element() as HTMLElement).focus()
    await userEvent.tab()
    expect(document.activeElement).toBe(page.getByRole('button', { name: 'After' }).element())
  })

  test('the open, overflowing code is a region named by the example title and Code', async () => {
    await render(
      <KvirnProvider>
        <div style={{ inlineSize: '12rem' }}>
          <h2 id="example">A button</h2>
          <ExampleFrame headingId="example" code={`const long = '${'x'.repeat(200)}'`}>
            <p>An example</p>
          </ExampleFrame>
        </div>
      </KvirnProvider>,
    )
    await userEvent.click(page.getByRole('button', { name: text.toggle({ count: 1 }) }))
    await expect.element(page.getByRole('region', { name: 'A button Code' })).toBeInTheDocument()
  })

  test('a first line that names the file is in the title bar once, and a copy leaves it out', async () => {
    const writeText = vi.fn<(value: string) => Promise<void>>(async () => {})
    stubClipboard(writeText)
    const { container } = await renderFrame('// button/default.tsx\nconst size = 4')
    await expect
      .element(page.getByRole('button', { name: text.toggle({ count: 1 }) }))
      .toBeVisible()
    const bar = container.querySelector('.docs-code-bar')
    expect(bar?.querySelector('.docs-code-meta .docs-code-file')?.textContent).toBe(
      'button/default.tsx',
    )
    expect(container.querySelector('.docs-code-panel .docs-code-file')).toBeNull()
    expect(container.querySelector('.docs-code-panel pre')?.textContent).toBe('const size = 4')
    const figure = container.querySelector('figure')
    expect(figure?.getAttribute('aria-labelledby')).toBe('example')
    expect(figure?.querySelector('[aria-labelledby], [aria-describedby]')).toBeNull()
    await userEvent.click(page.getByRole('button', { name: text.toggle({ count: 1 }) }))
    await userEvent.click(copyButton())
    expect(writeText).toHaveBeenCalledWith('const size = 4')
  })

  test('the status is in the tools row of the open code, before Copy code', async () => {
    stubClipboard(async () => {})
    const { container } = await renderFrame()
    await userEvent.click(toggle())
    await userEvent.click(copyButton())
    await expect.element(politeRegion()).toHaveTextContent(text.copied)
    const tools = container.querySelector('.docs-code-panel .docs-code-tools')
    const status = tools?.querySelector('.docs-code-status')
    expect(status?.textContent).toBe(text.copied)
    expect(status?.compareDocumentPosition(copyButton().element())).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    )
    expect(container.querySelector('.docs-code-bar .docs-code-status')).toBeNull()
  })

  test('the toggle name is the same open and closed', async () => {
    await renderFrame()
    await userEvent.click(toggle())
    await expect.element(toggle()).toHaveAttribute('aria-expanded', 'true')
    expect(toggle().element().textContent).toContain(text.toggle({ count: 2 }))
  })

  test('the region is named by the heading and Code, not by the file name', async () => {
    await render(
      <KvirnProvider>
        <div style={{ inlineSize: '12rem' }}>
          <h2 id="example">A button</h2>
          <ExampleFrame
            headingId="example"
            code={`// button/default.tsx\nconst long = '${'x'.repeat(200)}'`}
          >
            <p>An example</p>
          </ExampleFrame>
        </div>
      </KvirnProvider>,
    )
    await userEvent.click(page.getByRole('button', { name: text.toggle({ count: 1 }) }))
    const region = page.getByRole('region', { name: 'A button Code', exact: true })
    await expect.element(region).toBeInTheDocument()
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
          <h2 id="example">A button</h2>
          <ExampleFrame headingId="example" code={`const long = '${'x'.repeat(200)}'`}>
            <p>An example</p>
          </ExampleFrame>
        </div>
      </KvirnProvider>,
    )
    await userEvent.click(page.getByRole('button', { name: text.toggle({ count: 1 }) }))
    await expect.element(page.getByRole('region', { name: 'A button Code' })).toBeInTheDocument()
    await expectNoA11yViolations(container)
  })

  test('find in page (beforematch) opens the panel and the toggle follows', async () => {
    const { container } = await renderFrame()
    container.querySelector('.docs-code-panel')?.dispatchEvent(new Event('beforematch'))
    await expect.element(toggle()).toHaveAttribute('aria-expanded', 'true')
  })
})
