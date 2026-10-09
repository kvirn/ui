import { sv } from '@kvirn-ui/i18n/sv'
import { expectNoA11yViolations } from '@kvirn-ui/testing'
import { createRef } from 'react'
import { renderToString } from 'react-dom/server'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vite-plus/test'
import type { MockInstance } from 'vite-plus/test'
import { page, userEvent } from 'vite-plus/test/browser'
import { render } from 'vitest-browser-react'
import { resetDevWarnings } from '../dev/dev-warning.ts'
import { KvirnProvider } from '../provider/kvirn-provider.tsx'
import { CopyButton } from './copy-button.tsx'
import { useCopyButton } from './use-copy-button.ts'

// Contract: copy-button.a11y.md.

type WriteText = (text: string) => Promise<void>

/** The Clipboard API, as a stub that records what was written. */
function stubClipboard(writeText: WriteText) {
  Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true })
}

function stubMissingClipboard() {
  Object.defineProperty(navigator, 'clipboard', { value: undefined, configurable: true })
}

const copyButton = () => page.getByRole('button', { name: 'Copy' })
const failedText = 'Could not copy. Select the text and copy it yourself.'
const politeRegion = () => page.getByRole('status')
const assertiveRegion = () => page.getByRole('alert')

let consoleWarn: MockInstance<Console['warn']>

beforeEach(() => {
  resetDevWarnings()
  consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {})
})

afterEach(() => {
  Reflect.deleteProperty(navigator, 'clipboard')
  window.getSelection()?.removeAllRanges()
  vi.useRealTimers()
  consoleWarn.mockRestore()
})

describe('copying', () => {
  test('writes the text to the clipboard on click', async () => {
    const written: string[] = []
    stubClipboard(async (text) => {
      written.push(text)
    })
    await render(
      <KvirnProvider>
        <CopyButton text="PK-2026-004217" />
      </KvirnProvider>,
    )
    await userEvent.click(copyButton())
    expect(written).toEqual(['PK-2026-004217'])
  })

  test('a function text is read at click time', async () => {
    const written: string[] = []
    stubClipboard(async (text) => {
      written.push(text)
    })
    let current = 'första'
    await render(
      <KvirnProvider>
        <CopyButton text={() => current} />
      </KvirnProvider>,
    )
    current = 'andra'
    await userEvent.click(copyButton())
    expect(written).toEqual(['andra'])
  })

  test('calls onCopied with the text after it was written', async () => {
    stubClipboard(async () => {})
    const onCopied = vi.fn<(text: string) => void>()
    await render(
      <KvirnProvider>
        <CopyButton text="123" onCopied={onCopied} />
      </KvirnProvider>,
    )
    await userEvent.click(copyButton())
    await expect.poll(() => onCopied.mock.calls).toEqual([['123']])
  })

  test('data-status is idle, then copied, then idle again after five seconds', async () => {
    stubClipboard(async () => {})
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
    await render(
      <KvirnProvider>
        <CopyButton text="123" />
      </KvirnProvider>,
    )
    await expect.element(copyButton()).toHaveAttribute('data-status', 'idle')
    await userEvent.click(copyButton())
    await expect.element(copyButton()).toHaveAttribute('data-status', 'copied')
    await vi.advanceTimersByTimeAsync(5000)
    await expect.element(copyButton()).toHaveAttribute('data-status', 'idle')
  })

  test('a disabled copy button copies nothing', async () => {
    const writeText = vi.fn<WriteText>(async () => {})
    stubClipboard(writeText)
    await render(
      <KvirnProvider>
        <CopyButton text="123" disabled focusableWhenDisabled />
      </KvirnProvider>,
    )
    await userEvent.click(copyButton(), { force: true })
    expect(writeText).not.toHaveBeenCalled()
  })

  test('useCopyButton gives the label and a status for your own button', async () => {
    stubClipboard(async () => {})
    function Own() {
      const copy = useCopyButton({ text: 'abc' })
      return (
        <button {...copy.buttonProps} data-testid="own">
          {copy.label} {copy.status}
        </button>
      )
    }
    await render(
      <KvirnProvider>
        <Own />
      </KvirnProvider>,
    )
    await expect.element(page.getByTestId('own')).toHaveTextContent('Copy idle')
    await userEvent.click(page.getByTestId('own'))
    await expect.element(page.getByTestId('own')).toHaveTextContent('Copy copied')
  })
})

describe('announcements', () => {
  test('announces copyButton.copied politely after a copy', async () => {
    stubClipboard(async () => {})
    await render(
      <KvirnProvider>
        <CopyButton text="123" />
      </KvirnProvider>,
    )
    await expect.element(politeRegion()).toHaveTextContent('')
    await userEvent.click(copyButton())
    await expect.element(politeRegion()).toHaveTextContent('Copied')
    await expect.element(assertiveRegion()).toHaveTextContent('')
  })

  test('announces nothing on render', async () => {
    stubClipboard(async () => {})
    await render(
      <KvirnProvider>
        <CopyButton text="123" />
      </KvirnProvider>,
    )
    await expect.element(politeRegion()).toHaveTextContent('')
    await expect.element(assertiveRegion()).toHaveTextContent('')
  })

  test('announces the result in the provider locale', async () => {
    stubClipboard(async () => {})
    await render(
      <KvirnProvider locale="sv" messages={sv}>
        <CopyButton text="123" />
      </KvirnProvider>,
    )
    await userEvent.click(page.getByRole('button', { name: 'Kopiera' }))
    await expect.element(politeRegion()).toHaveTextContent('Kopierat')
  })

  test('the instance messages override the announcement and the label', async () => {
    stubClipboard(async () => {})
    await render(
      <KvirnProvider>
        <CopyButton
          text="123"
          messages={{ label: 'Kopiera nummer', copied: 'Numret kopierades' }}
        />
      </KvirnProvider>,
    )
    await userEvent.click(page.getByRole('button', { name: 'Kopiera nummer' }))
    await expect.element(politeRegion()).toHaveTextContent('Numret kopierades')
  })

  test('says it again when the button is pressed again', async () => {
    stubClipboard(async () => {})
    await render(
      <KvirnProvider>
        <CopyButton text="123" />
      </KvirnProvider>,
    )
    await userEvent.click(copyButton())
    await expect.element(politeRegion()).toHaveTextContent('Copied')
    await userEvent.click(copyButton())
    await expect.element(politeRegion()).toHaveTextContent('')
    await expect.element(politeRegion()).toHaveTextContent('Copied')
  })
})

describe('name', () => {
  test('the accessible name is Copy and stays Copy while copied and failed', async () => {
    stubClipboard(async () => {})
    await render(
      <KvirnProvider>
        <CopyButton text="123" />
      </KvirnProvider>,
    )
    await expect.element(copyButton()).toBeVisible()
    await userEvent.click(copyButton())
    await expect.element(politeRegion()).toHaveTextContent('Copied')
    await expect.element(copyButton()).toBeVisible()
    stubClipboard(async () => {
      throw new Error('denied')
    })
    await userEvent.click(copyButton())
    await expect.element(assertiveRegion()).toHaveTextContent(failedText)
    await expect.element(copyButton()).toBeVisible()
  })

  test('children replace the label and become the name', async () => {
    await render(
      <KvirnProvider>
        <CopyButton text="123">Kopiera ärendenumret</CopyButton>
      </KvirnProvider>,
    )
    await expect.element(page.getByRole('button', { name: 'Kopiera ärendenumret' })).toBeVisible()
  })

  test('is a button of type button, with no ARIA of its own, and passes the ref through', async () => {
    const ref = createRef<HTMLButtonElement>()
    await render(
      <KvirnProvider>
        <CopyButton text="123" ref={ref} />
      </KvirnProvider>,
    )
    const element = copyButton().element()
    expect(element.tagName).toBe('BUTTON')
    expect(element.getAttribute('type')).toBe('button')
    expect(element.getAttributeNames().filter((name) => name.startsWith('aria-'))).toEqual([])
    expect(ref.current).toBe(element)
  })

  test('renders the label on the server', () => {
    const html = renderToString(
      <KvirnProvider>
        <CopyButton text="123" />
      </KvirnProvider>,
    )
    expect(html).toContain('>Copy</button>')
  })
})

describe('failure', () => {
  test('announces copyButton.failed assertively when the write is rejected', async () => {
    stubClipboard(async () => {
      throw new Error('denied')
    })
    const onCopyError = vi.fn<() => void>()
    await render(
      <KvirnProvider>
        <CopyButton text="123" onCopyError={onCopyError} />
      </KvirnProvider>,
    )
    await userEvent.click(copyButton())
    await expect
      .element(assertiveRegion())
      .toHaveTextContent('Could not copy. Select the text and copy it yourself.')
    await expect.element(politeRegion()).toHaveTextContent('')
    await expect.element(copyButton()).toHaveAttribute('data-status', 'failed')
    expect(onCopyError).toHaveBeenCalledTimes(1)
  })

  test('fails the same way when there is no Clipboard API (an insecure context)', async () => {
    stubMissingClipboard()
    await render(
      <KvirnProvider>
        <CopyButton text="123" />
      </KvirnProvider>,
    )
    await userEvent.click(copyButton())
    await expect.element(assertiveRegion()).toHaveTextContent(failedText)
  })

  test('selects the text in the textRef element so it can be copied by hand', async () => {
    stubMissingClipboard()
    const textRef = createRef<HTMLElement>()
    await render(
      <KvirnProvider>
        <p>
          Ärendenummer <span ref={textRef}>PK-2026-004217</span>
        </p>
        <CopyButton text="PK-2026-004217" textRef={textRef} />
      </KvirnProvider>,
    )
    await userEvent.click(copyButton())
    await expect.element(assertiveRegion()).toHaveTextContent(failedText)
    expect(window.getSelection()?.toString()).toBe('PK-2026-004217')
  })

  test('selects nothing when there is no textRef, and still announces', async () => {
    stubMissingClipboard()
    await render(
      <KvirnProvider>
        <CopyButton text="123" />
      </KvirnProvider>,
    )
    await userEvent.click(copyButton())
    await expect.element(assertiveRegion()).toHaveTextContent(failedText)
    expect(window.getSelection()?.toString()).toBe('')
  })

  test('Enter on a refused copy selects the text and keeps focus on the button', async () => {
    stubMissingClipboard()
    const textRef = createRef<HTMLElement>()
    await render(
      <KvirnProvider>
        <span ref={textRef}>123</span>
        <CopyButton text="123" textRef={textRef} />
      </KvirnProvider>,
    )
    await userEvent.keyboard('{Tab}')
    await userEvent.keyboard('{Enter}')
    await expect.element(assertiveRegion()).toHaveTextContent(failedText)
    expect(window.getSelection()?.toString()).toBe('123')
    await expect.element(copyButton()).toHaveFocus()
  })
})

describe('keyboard', () => {
  test('Tab moves focus to the copy button', async () => {
    await render(
      <KvirnProvider>
        <CopyButton text="123" />
      </KvirnProvider>,
    )
    await userEvent.keyboard('{Tab}')
    await expect.element(copyButton()).toHaveFocus()
  })

  test('Shift+Tab moves focus off the copy button', async () => {
    await render(
      <KvirnProvider>
        <button type="button">Före</button>
        <CopyButton text="123" />
      </KvirnProvider>,
    )
    await userEvent.keyboard('{Tab}{Tab}')
    await expect.element(copyButton()).toHaveFocus()
    await userEvent.keyboard('{Shift>}{Tab}{/Shift}')
    await expect.element(page.getByRole('button', { name: 'Före' })).toHaveFocus()
  })

  test('a disabled copy button is skipped by Tab', async () => {
    await render(
      <KvirnProvider>
        <CopyButton text="123" disabled />
        <button type="button">Efter</button>
      </KvirnProvider>,
    )
    await userEvent.keyboard('{Tab}')
    await expect.element(page.getByRole('button', { name: 'Efter' })).toHaveFocus()
  })

  test('a focusable disabled copy button is reached by Tab and copies nothing', async () => {
    const writeText = vi.fn<WriteText>(async () => {})
    stubClipboard(writeText)
    await render(
      <KvirnProvider>
        <CopyButton text="123" disabled focusableWhenDisabled />
      </KvirnProvider>,
    )
    await userEvent.keyboard('{Tab}')
    await expect.element(copyButton()).toHaveFocus()
    await userEvent.keyboard('{Enter}')
    await userEvent.keyboard(' ')
    expect(writeText).not.toHaveBeenCalled()
  })

  test('Enter copies the text and keeps focus on the button', async () => {
    const written: string[] = []
    stubClipboard(async (text) => {
      written.push(text)
    })
    await render(
      <KvirnProvider>
        <CopyButton text="123" />
      </KvirnProvider>,
    )
    await userEvent.keyboard('{Tab}')
    await userEvent.keyboard('{Enter}')
    await expect.element(politeRegion()).toHaveTextContent('Copied')
    expect(written).toEqual(['123'])
    await expect.element(copyButton()).toHaveFocus()
  })

  test('Space copies on key up and keeps focus on the button', async () => {
    const writeText = vi.fn<WriteText>(async () => {})
    stubClipboard(writeText)
    await render(
      <KvirnProvider>
        <CopyButton text="123" />
      </KvirnProvider>,
    )
    await userEvent.keyboard('{Tab}')
    await userEvent.keyboard('{Space>}')
    expect(writeText).not.toHaveBeenCalled()
    await userEvent.keyboard('{/Space}')
    expect(writeText).toHaveBeenCalledTimes(1)
    await expect.element(copyButton()).toHaveFocus()
  })
})

describe('visible status', () => {
  const statusElement = () => document.querySelector('.kv-copy-status')

  test('shows nothing before the first press', async () => {
    await render(
      <KvirnProvider>
        <CopyButton text="123" />
      </KvirnProvider>,
    )
    expect(statusElement()).toBeNull()
  })

  test('shows copyButton.copied after a copy, outside the button and not as a live region', async () => {
    stubClipboard(async () => {})
    await render(
      <KvirnProvider>
        <CopyButton text="123" />
      </KvirnProvider>,
    )
    await userEvent.click(copyButton())
    await expect.poll(() => statusElement()?.textContent).toBe('Copied')
    const status = statusElement()
    expect(status?.hasAttribute('aria-live')).toBe(false)
    expect(status?.hasAttribute('role')).toBe(false)
    expect(status?.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true')
    expect(copyButton().element().contains(status)).toBe(false)
    expect(copyButton().element().nextElementSibling).toBe(status)
    expect(copyButton().element().hasAttribute('aria-describedby')).toBe(false)
  })

  test('shows copyButton.failed after a refusal, in the provider locale', async () => {
    stubMissingClipboard()
    await render(
      <KvirnProvider locale="sv" messages={sv}>
        <CopyButton text="123" />
      </KvirnProvider>,
    )
    await userEvent.click(page.getByRole('button', { name: 'Kopiera' }))
    await expect.poll(() => statusElement()?.textContent).toBe(sv.copyButton.failed)
  })

  test('the instance messages override the visible status', async () => {
    stubClipboard(async () => {})
    await render(
      <KvirnProvider>
        <CopyButton text="123" messages={{ copied: 'Numret kopierades' }} />
      </KvirnProvider>,
    )
    await userEvent.click(copyButton())
    await expect.poll(() => statusElement()?.textContent).toBe('Numret kopierades')
  })

  test('copied clears after five seconds', async () => {
    stubClipboard(async () => {})
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
    await render(
      <KvirnProvider>
        <CopyButton text="123" />
      </KvirnProvider>,
    )
    await userEvent.click(copyButton())
    await expect.poll(() => statusElement()?.textContent).toBe('Copied')
    await vi.advanceTimersByTimeAsync(4999)
    expect(statusElement()).not.toBeNull()
    await vi.advanceTimersByTimeAsync(1)
    await expect.poll(() => statusElement()).toBeNull()
  })

  test('failed stays past five seconds and is replaced by the next press', async () => {
    stubMissingClipboard()
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
    await render(
      <KvirnProvider>
        <CopyButton text="123" />
      </KvirnProvider>,
    )
    await userEvent.click(copyButton())
    await expect.poll(() => statusElement()?.textContent).toBe(failedText)
    await vi.advanceTimersByTimeAsync(60000)
    expect(statusElement()?.textContent).toBe(failedText)
    await expect.element(copyButton()).toHaveAttribute('data-status', 'failed')
    stubClipboard(async () => {})
    await userEvent.click(copyButton())
    await expect.poll(() => statusElement()?.textContent).toBe('Copied')
  })

  test('a press clears the old status at once, before the write settles', async () => {
    stubClipboard(async () => {})
    await render(
      <KvirnProvider>
        <CopyButton text="123" />
      </KvirnProvider>,
    )
    await userEvent.click(copyButton())
    await expect.element(copyButton()).toHaveAttribute('data-status', 'copied')
    stubClipboard(() => new Promise<void>(() => {}))
    await userEvent.click(copyButton())
    await expect.element(copyButton()).toHaveAttribute('data-status', 'idle')
  })

  test('the name stays Copy in every state', async () => {
    stubClipboard(async () => {})
    await render(
      <KvirnProvider>
        <CopyButton text="123" />
      </KvirnProvider>,
    )
    await userEvent.click(copyButton())
    await expect.poll(() => statusElement()?.textContent).toBe('Copied')
    await expect.element(copyButton()).toBeVisible()
    expect(copyButton().element().textContent).toBe('Copy')
  })

  test('status={false} renders no status and still announces', async () => {
    stubClipboard(async () => {})
    await render(
      <KvirnProvider>
        <CopyButton text="123" status={false} />
      </KvirnProvider>,
    )
    await userEvent.click(copyButton())
    await expect.element(politeRegion()).toHaveTextContent('Copied')
    await expect.element(copyButton()).toHaveAttribute('data-status', 'copied')
    expect(statusElement()).toBeNull()
  })

  test('a disabled button shows no status', async () => {
    await render(
      <KvirnProvider>
        <CopyButton text="123" disabled />
      </KvirnProvider>,
    )
    expect(statusElement()).toBeNull()
  })
})

describe('accessibility', () => {
  test('has no axe violations idle, after a copy and after a failure', async () => {
    stubClipboard(async () => {})
    const { container } = await render(
      <KvirnProvider>
        <main>
          <p>
            Ärendenummer <span>PK-2026-004217</span>
          </p>
          <CopyButton text="PK-2026-004217" />
        </main>
      </KvirnProvider>,
    )
    await expectNoA11yViolations(container)
    await userEvent.click(copyButton())
    await expect.element(politeRegion()).toHaveTextContent('Copied')
    await expectNoA11yViolations(container)
    expect(document.querySelector('.kv-copy-status')?.textContent).toBe('Copied')
    stubMissingClipboard()
    await userEvent.click(copyButton())
    await expect.element(assertiveRegion()).toHaveTextContent(failedText)
    await expect.poll(() => document.querySelector('.kv-copy-status')?.textContent).toBe(failedText)
    await expectNoA11yViolations(container)
  })

  test('warns in development when there is no provider to announce the result', async () => {
    stubClipboard(async () => {})
    await render(<CopyButton text="123" />)
    expect(consoleWarn).toHaveBeenCalled()
  })
})
