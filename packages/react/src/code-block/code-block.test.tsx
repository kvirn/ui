import { expectNoA11yViolations } from '@kvirn-ui/testing'
import { createRef } from 'react'
import { afterEach, describe, expect, expectTypeOf, test, vi } from 'vite-plus/test'
import { page, userEvent } from 'vite-plus/test/browser'
import { render } from 'vitest-browser-react'
import { KvirnProvider } from '../provider/kvirn-provider.tsx'
import { CodeBlock } from './code-block.tsx'
import type {
  CodeBlockCodeComponentProps,
  CodeBlockLabelComponentProps,
  CodeBlockRootComponentProps,
} from './code-block.tsx'
import { useCodeBlock } from './use-code-block.ts'

// Contract: code-block.a11y.md.

const failedText = 'Could not copy. Select the text and copy it yourself.'
const command = 'pnpm add @kvirn-ui/react'

function stubClipboard(writeText: (text: string) => Promise<void>) {
  Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true })
}

afterEach(() => {
  Reflect.deleteProperty(navigator, 'clipboard')
  window.getSelection()?.removeAllRanges()
})

function Example() {
  return (
    <KvirnProvider>
      <CodeBlock.Root data-testid="root">
        <CodeBlock.Label>Installera</CodeBlock.Label>
        <CodeBlock.Code data-testid="code">{command}</CodeBlock.Code>
        <CodeBlock.Copy />
      </CodeBlock.Root>
    </KvirnProvider>
  )
}

describe('rendering', () => {
  test('Root is a div, Label a p and Code a pre, with the part classes', async () => {
    await render(
      <KvirnProvider>
        <CodeBlock.Root data-testid="root">
          <CodeBlock.Label data-testid="label">Installera</CodeBlock.Label>
          <CodeBlock.Code data-testid="code">{command}</CodeBlock.Code>
        </CodeBlock.Root>
      </KvirnProvider>,
    )
    const root = page.getByTestId('root').element()
    expect(root.tagName).toBe('DIV')
    expect(root.className).toBe('kv-code-block')
    const label = page.getByTestId('label').element()
    expect(label.tagName).toBe('P')
    expect(label.className).toBe('kv-code-block-label')
    const code = page.getByTestId('code').element()
    expect(code.tagName).toBe('PRE')
    expect(code.className).toBe('kv-code-block-code')
    expect(code.hasAttribute('tabindex')).toBe(false)
  })

  test('a className joins the part class and the ref reaches the element', async () => {
    const ref = createRef<HTMLElement>()
    await render(
      <CodeBlock.Code className="annan" ref={ref} data-testid="code">
        {command}
      </CodeBlock.Code>,
    )
    const element = page.getByTestId('code').element()
    expect(element.className).toBe('annan kv-code-block-code')
    expect(ref.current).toBe(element)
  })

  test('no part takes as: the group, the label paragraph and the pre are fixed', () => {
    expectTypeOf<CodeBlockRootComponentProps>().not.toHaveProperty('as')
    expectTypeOf<CodeBlockLabelComponentProps>().not.toHaveProperty('as')
    expectTypeOf<CodeBlockCodeComponentProps>().not.toHaveProperty('as')
  })

  test('Copy keeps its own class next to the Button class', async () => {
    await render(<Example />)
    const className = page.getByRole('button', { name: 'Copy' }).element().className
    expect(className.split(' ')).toEqual(
      expect.arrayContaining(['kv-code-block-copy', 'kv-button']),
    )
  })

  test('useCodeBlock gives the part props and the shared context', () => {
    function Probe() {
      const codeBlock = useCodeBlock()
      return (
        <div {...codeBlock.rootProps} data-testid="probe">
          {codeBlock.hasLabel ? 'label' : 'no label'}
        </div>
      )
    }
    return render(<Probe />).then(() =>
      expect(page.getByTestId('probe').element().className).toBe('kv-code-block'),
    )
  })
})

describe('group', () => {
  test('Root is a group named by the Label', async () => {
    await render(<Example />)
    await expect.element(page.getByRole('group', { name: 'Installera' })).toBeVisible()
  })

  test('Root is a plain div without a Label', async () => {
    await render(
      <KvirnProvider>
        <CodeBlock.Root data-testid="root">
          <CodeBlock.Code>{command}</CodeBlock.Code>
        </CodeBlock.Root>
      </KvirnProvider>,
    )
    const root = page.getByTestId('root').element()
    expect(root.hasAttribute('role')).toBe(false)
    expect(root.hasAttribute('aria-labelledby')).toBe(false)
  })
})

describe('copy', () => {
  test('Enter on Copy writes the code and keeps focus', async () => {
    const written: string[] = []
    stubClipboard(async (text) => {
      written.push(text)
    })
    await render(<Example />)
    await userEvent.keyboard('{Tab}')
    await userEvent.keyboard('{Enter}')
    await expect.element(page.getByRole('status')).toHaveTextContent('Copied')
    expect(written).toEqual([command])
    await expect.element(page.getByRole('button', { name: 'Copy' })).toHaveFocus()
  })

  test('a failed copy selects the code', async () => {
    Object.defineProperty(navigator, 'clipboard', { value: undefined, configurable: true })
    await render(<Example />)
    await userEvent.click(page.getByRole('button', { name: 'Copy' }))
    await expect.element(page.getByRole('alert')).toHaveTextContent(failedText)
    expect(window.getSelection()?.toString()).toBe(command)
  })

  test('Copy shows the visible status after the button, and status={false} removes it', async () => {
    stubClipboard(async () => {})
    await render(
      <KvirnProvider>
        <CodeBlock.Root>
          <CodeBlock.Code>{command}</CodeBlock.Code>
          <CodeBlock.Copy />
        </CodeBlock.Root>
        <CodeBlock.Root>
          <CodeBlock.Code>{command}</CodeBlock.Code>
          <CodeBlock.Copy status={false} />
        </CodeBlock.Root>
      </KvirnProvider>,
    )
    const [first, second] = page.getByRole('button', { name: 'Copy' }).elements()
    await userEvent.click(first as HTMLElement)
    await expect.poll(() => document.querySelectorAll('.kv-copy-status').length).toBe(1)
    expect(first?.nextElementSibling?.className).toBe('kv-copy-status')
    await userEvent.click(second as HTMLElement)
    await expect.poll(() => document.querySelectorAll('.kv-copy-status').length).toBe(1)
  })

  test('text overrides what is copied', async () => {
    const writeText = vi.fn<(text: string) => Promise<void>>(async () => {})
    stubClipboard(writeText)
    await render(
      <KvirnProvider>
        <CodeBlock.Root>
          <CodeBlock.Code>{'$ ' + command}</CodeBlock.Code>
          <CodeBlock.Copy text={command} />
        </CodeBlock.Root>
      </KvirnProvider>,
    )
    await userEvent.click(page.getByRole('button', { name: 'Copy' }))
    expect(writeText).toHaveBeenCalledWith(command)
  })
})

describe('keyboard', () => {
  test('Tab moves focus to the Copy button and skips the code', async () => {
    await render(
      <KvirnProvider>
        <CodeBlock.Root>
          <CodeBlock.Label>Installera</CodeBlock.Label>
          <CodeBlock.Code>{command}</CodeBlock.Code>
          <CodeBlock.Copy />
        </CodeBlock.Root>
        <button type="button">Efter</button>
      </KvirnProvider>,
    )
    await userEvent.keyboard('{Tab}')
    await expect.element(page.getByRole('button', { name: 'Copy' })).toHaveFocus()
    await userEvent.keyboard('{Tab}')
    await expect.element(page.getByRole('button', { name: 'Efter' })).toHaveFocus()
  })

  test('Shift+Tab moves focus off the Copy button', async () => {
    await render(
      <KvirnProvider>
        <button type="button">Före</button>
        <CodeBlock.Root>
          <CodeBlock.Code>{command}</CodeBlock.Code>
          <CodeBlock.Copy />
        </CodeBlock.Root>
      </KvirnProvider>,
    )
    await userEvent.keyboard('{Tab}{Tab}')
    await expect.element(page.getByRole('button', { name: 'Copy' })).toHaveFocus()
    await userEvent.keyboard('{Shift>}{Tab}{/Shift}')
    await expect.element(page.getByRole('button', { name: 'Före' })).toHaveFocus()
  })
})

describe('accessibility', () => {
  test('has no axe violations, with and without a label', async () => {
    const { container } = await render(
      <KvirnProvider>
        <main>
          <CodeBlock.Root>
            <CodeBlock.Label>Installera</CodeBlock.Label>
            <CodeBlock.Code>{command}</CodeBlock.Code>
            <CodeBlock.Copy />
          </CodeBlock.Root>
          <CodeBlock.Root>
            <CodeBlock.Code>{command}</CodeBlock.Code>
          </CodeBlock.Root>
        </main>
      </KvirnProvider>,
    )
    await expect.element(page.getByRole('group', { name: 'Installera' })).toBeVisible()
    await expectNoA11yViolations(container)
  })
})
