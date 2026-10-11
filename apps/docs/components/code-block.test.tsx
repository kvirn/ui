import { KvirnProvider } from '@kvirn-ui/react'
import { expectNoA11yViolations } from '@kvirn-ui/testing'
import { afterEach, describe, expect, test, vi } from 'vite-plus/test'
import { page, userEvent } from 'vite-plus/test/browser'
import { render } from 'vitest-browser-react'
import { messages } from '../messages/en.ts'
import { CodeBlock } from './code-block.tsx'

// Contract: docs/design/docs-code.md §7.

const text = messages.docs.code
const code = "import { Button } from '@kvirn-ui/react'\nconst size = 4"

const copyButton = () => page.getByRole('button', { name: text.copy })
const politeRegion = () => page.getByRole('status')

function stubClipboard(writeText: (value: string) => Promise<void>) {
  Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true })
}

const renderBlock = (block: React.ReactNode) => render(<KvirnProvider>{block}</KvirnProvider>)

afterEach(() => {
  Reflect.deleteProperty(navigator, 'clipboard')
  window.getSelection()?.removeAllRanges()
})

describe('CodeBlock', () => {
  test('Enter and Space on Copy code copy the code, show the status and announce it politely', async () => {
    const writeText = vi.fn<(value: string) => Promise<void>>(async () => {})
    stubClipboard(writeText)
    await renderBlock(<CodeBlock code={code} language="tsx" />)
    const button = copyButton().element() as HTMLButtonElement
    button.focus()
    await userEvent.keyboard('{Enter}')
    await expect.element(politeRegion()).toHaveTextContent(text.copied)
    expect(writeText).toHaveBeenLastCalledWith(code)
    await userEvent.keyboard(' ')
    await vi.waitFor(() => expect(writeText).toHaveBeenCalledTimes(2))
    await expect.element(page.getByText(text.copied, { exact: true }).first()).toBeVisible()
    expect(document.activeElement).toBe(button)
  })

  test('a refused clipboard announces copyFailed, shows it, and selects the code', async () => {
    stubClipboard(async () => {
      throw new Error('denied')
    })
    await renderBlock(<CodeBlock code={code} language="tsx" />)
    await userEvent.click(copyButton())
    await expect.element(politeRegion()).toHaveTextContent(text.copyFailed)
    await vi.waitFor(() => expect(window.getSelection()?.toString()).toBe(code))
    expect(document.activeElement).toBe(copyButton().element())
  })

  test('a refused clipboard with line numbers still selects exactly the code', async () => {
    const style = document.createElement('style')
    style.textContent = '.docs-code-number { user-select: none }'
    document.head.append(style)
    stubClipboard(async () => {
      throw new Error('denied')
    })
    await renderBlock(<CodeBlock code={code} lineNumbers />)
    await userEvent.click(copyButton())
    await vi.waitFor(() => expect(window.getSelection()?.toString()).toBe(code))
    style.remove()
  })

  test('a missing clipboard counts as a refused one', async () => {
    Object.defineProperty(navigator, 'clipboard', { value: undefined, configurable: true })
    await renderBlock(<CodeBlock code={code} />)
    await userEvent.click(copyButton())
    await expect.element(politeRegion()).toHaveTextContent(text.copyFailed)
  })

  test('line numbers are aria-hidden and absent from the copied text', async () => {
    const writeText = vi.fn<(value: string) => Promise<void>>(async () => {})
    stubClipboard(writeText)
    const { container } = await renderBlock(<CodeBlock code={code} lineNumbers />)
    const numbers = [...container.querySelectorAll('[aria-hidden="true"]')].filter((element) =>
      /^\d+$/.test(element.textContent ?? ''),
    )
    expect(numbers.map((element) => element.textContent)).toEqual(['1', '2'])
    await userEvent.click(copyButton())
    expect(writeText).toHaveBeenCalledWith(code)
  })

  test('the scroll area is a named region with a Tab stop only while it overflows', async () => {
    const { container } = await render(
      <KvirnProvider>
        <div style={{ inlineSize: '12rem' }}>
          <CodeBlock code={`const long = '${'x'.repeat(200)}'`} fileName="long.ts" />
          <CodeBlock code="const a = 1" />
        </div>
      </KvirnProvider>,
    )
    const scrollers = container.querySelectorAll<HTMLElement>('.docs-code-scroll')
    await vi.waitFor(() => expect(scrollers[0]?.getAttribute('role')).toBe('region'))
    expect(scrollers[0]?.tabIndex).toBe(0)
    await expect.element(page.getByRole('region', { name: 'long.ts' })).toBeInTheDocument()
    expect(scrollers[1]?.hasAttribute('role')).toBe(false)
    expect(scrollers[1]?.hasAttribute('tabindex')).toBe(false)
  })

  test('Tab reaches the scroll region only while it overflows', async () => {
    await render(
      <KvirnProvider>
        <div style={{ inlineSize: '12rem' }}>
          <CodeBlock code={`const long = '${'x'.repeat(200)}'`} fileName="long.ts" />
          <CodeBlock code="const a = 1" fileName="short.ts" />
          <button type="button">After</button>
        </div>
      </KvirnProvider>,
    )
    await expect.element(page.getByRole('region', { name: 'long.ts' })).toBeInTheDocument()
    const [longCopy, shortCopy] = page.getByRole('button', { name: text.copy }).elements()
    ;(longCopy as HTMLElement).focus()
    await userEvent.tab()
    expect(document.activeElement).toBe(page.getByRole('region', { name: 'long.ts' }).element())
    ;(shortCopy as HTMLElement).focus()
    await userEvent.tab()
    expect(document.activeElement).toBe(page.getByRole('button', { name: 'After' }).element())
  })

  test('an overflowing and a plain block have no axe violations', async () => {
    const { container } = await render(
      <KvirnProvider>
        <div style={{ inlineSize: '12rem' }}>
          <CodeBlock code={`const long = '${'x'.repeat(200)}'`} fileName="long.ts" lineNumbers />
          <CodeBlock code="const a = 1" language="tsx" />
        </div>
      </KvirnProvider>,
    )
    await expect.element(page.getByRole('region', { name: 'long.ts' })).toBeInTheDocument()
    await expectNoA11yViolations(container)
  })

  test('without a file name the overflowing region is named Code', async () => {
    await render(
      <KvirnProvider>
        <div style={{ inlineSize: '12rem' }}>
          <CodeBlock code={`const long = '${'x'.repeat(200)}'`} />
        </div>
      </KvirnProvider>,
    )
    await expect.element(page.getByRole('region', { name: text.label })).toBeInTheDocument()
  })

  test('a first line that names a file, with a note, is the header and not the code', async () => {
    const writeText = vi.fn<(value: string) => Promise<void>>(async () => {})
    stubClipboard(writeText)
    const { container } = await renderBlock(
      <CodeBlock
        code={'// app/layout.tsx (a Server Component)\nexport default function Layout() {}'}
      />,
    )
    const header = container.querySelector('.docs-code-header')
    expect(header?.querySelector('.docs-code-file')?.textContent).toBe('app/layout.tsx')
    expect(header?.querySelector('.docs-code-note')?.textContent).toBe('a Server Component')
    expect(container.querySelector('pre')?.textContent).not.toContain('app/layout.tsx')
    await userEvent.click(copyButton())
    expect(writeText).toHaveBeenCalledWith('export default function Layout() {}')
  })

  test('a colon note after the file name is the note too', async () => {
    const { container } = await renderBlock(
      <CodeBlock
        code={
          '// app/theme.ts: one object for the script and the provider\nexport const theme = {}'
        }
      />,
    )
    expect(container.querySelector('.docs-code-file')?.textContent).toBe('app/theme.ts')
    expect(container.querySelector('.docs-code-note')?.textContent).toBe(
      'one object for the script and the provider',
    )
  })

  test('empty code shows the empty message with no Copy button', async () => {
    await renderBlock(<CodeBlock code="" />)
    await expect.element(page.getByText(text.empty)).toBeVisible()
    expect(page.getByRole('button').elements()).toHaveLength(0)
  })
})
