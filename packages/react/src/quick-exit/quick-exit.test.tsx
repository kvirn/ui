import { sv } from '@kvirn-ui/i18n/sv'
import { expectNoA11yViolations } from '@kvirn-ui/testing'
import { readAloud, readAnnouncements } from '@kvirn-ui/testing/read-aloud'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vite-plus/test'
import type { MockInstance } from 'vite-plus/test'
import { page, userEvent } from 'vite-plus/test/browser'
import { render } from 'vitest-browser-react'
import { resetDevWarnings } from '../dev/dev-warning.ts'
import { KvirnProvider } from '../provider/kvirn-provider.tsx'
import { QuickExit } from './quick-exit.tsx'

// Contract: quick-exit.a11y.md.

const destination = 'https://www.smhi.se'
const link = () => page.getByRole('link', { name: 'Leave this page' })
const politeRegion = () => page.getByRole('status')
const wait = (milliseconds: number) => new Promise((resolve) => setTimeout(resolve, milliseconds))

const originalTitle = document.title
let navigate: ReturnType<typeof vi.fn<(href: string) => void>>
let consoleWarn: MockInstance<Console['warn']>

beforeEach(() => {
  resetDevWarnings()
  navigate = vi.fn<(href: string) => void>()
  consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {})
})

afterEach(() => {
  document.documentElement.style.removeProperty('display')
  document.title = originalTitle
  consoleWarn.mockRestore()
})

async function renderQuickExit(
  options: { shortcut?: boolean; href?: string; windowMs?: number } = {},
  after?: React.ReactNode,
) {
  return render(
    <KvirnProvider>
      <QuickExit.Root navigate={navigate} shortcut={options.shortcut} windowMs={options.windowMs}>
        <QuickExit.Link href={options.href ?? destination} />
        <QuickExit.Hint />
      </QuickExit.Root>
      {after}
    </KvirnProvider>,
  )
}

const isPageHidden = () => document.body.getClientRects().length === 0

const expectedExit = () => {
  expect(navigate).toHaveBeenCalledExactlyOnceWith(destination)
  expect(isPageHidden()).toBe(true)
  expect(document.title).toBe('')
}

describe('keyboard', () => {
  test('Tab moves focus to the link and Shift+Tab leaves it', async () => {
    await renderQuickExit({}, <button type="button">After</button>)
    await userEvent.tab()
    await expect.element(link()).toHaveFocus()
    await userEvent.tab({ shift: true })
    await expect.element(link()).not.toHaveFocus()
  })

  test('Enter on the link hides the page, empties the title and navigates', async () => {
    await renderQuickExit()
    link().element().focus()
    await userEvent.keyboard('{Enter}')
    expectedExit()
  })

  test('Space does nothing', async () => {
    await renderQuickExit()
    link().element().focus()
    await userEvent.keyboard(' ')
    expect(navigate).not.toHaveBeenCalled()
    expect(isPageHidden()).toBe(false)
  })

  test('Shift three times leaves from anywhere on the page', async () => {
    await renderQuickExit()
    await userEvent.keyboard('{Shift}{Shift}{Shift}')
    expectedExit()
  })

  test('another key between the Shifts resets the count', async () => {
    await renderQuickExit()
    await userEvent.keyboard('{Shift}{Shift}a{Shift}{Shift}')
    expect(navigate).not.toHaveBeenCalled()
    await userEvent.keyboard('{Shift}')
    expectedExit()
  })

  test('presses further apart than the window do not add up', async () => {
    await renderQuickExit({ windowMs: 300 })
    await userEvent.keyboard('{Shift}{Shift}')
    await wait(400)
    await userEvent.keyboard('{Shift}')
    expect(navigate).not.toHaveBeenCalled()
  })

  test('a held Shift (repeat) is not counted', async () => {
    await renderQuickExit()
    await userEvent.keyboard('{Shift}')
    for (let count = 0; count < 5; count += 1) {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Shift', repeat: true }))
      document.dispatchEvent(new KeyboardEvent('keyup', { key: 'Shift' }))
    }
    expect(navigate).not.toHaveBeenCalled()
  })

  test('Shift three times works in a text field, and typing capitals does not count', async () => {
    await renderQuickExit({}, <input aria-label="Name" />)
    await userEvent.click(page.getByRole('textbox', { name: 'Name' }))
    await userEvent.keyboard('{Shift>}ABC{/Shift}')
    expect(navigate).not.toHaveBeenCalled()
    await userEvent.keyboard('{Shift}{Shift}')
    expect(navigate).not.toHaveBeenCalled()
    await userEvent.keyboard('{Shift}')
    expectedExit()
  })

  test('Alt, Control or Meta with Shift is not counted', async () => {
    await renderQuickExit()
    await userEvent.keyboard('{Shift}{Shift}')
    for (const modifier of ['Alt', 'Control', 'Meta']) {
      await userEvent.keyboard(`{${modifier}>}{Shift}{Shift}{Shift}{/${modifier}}`)
      await userEvent.keyboard(`{${modifier}>}{Shift>}{/${modifier}}{/Shift}`.repeat(3))
    }
    expect(navigate).not.toHaveBeenCalled()
    await userEvent.keyboard('{Shift}{Shift}')
    expect(navigate).not.toHaveBeenCalled()
  })

  test('Shift+click is not counted', async () => {
    await renderQuickExit({}, <button type="button">After</button>)
    await userEvent.keyboard('{Shift>}')
    await userEvent.click(page.getByRole('button', { name: 'After' }))
    await userEvent.keyboard('{/Shift}{Shift}{Shift}')
    expect(navigate).not.toHaveBeenCalled()
  })

  test('shortcut={false} ignores Shift three times and announces nothing', async () => {
    await renderQuickExit({ shortcut: false })
    await userEvent.keyboard('{Shift}{Shift}{Shift}')
    expect(navigate).not.toHaveBeenCalled()
    await expect.element(politeRegion()).toHaveTextContent('')
  })
})

describe('activation', () => {
  test('a click leaves the page', async () => {
    await renderQuickExit()
    await userEvent.click(link())
    expectedExit()
  })

  test('a Ctrl click leaves this page, not a new tab', async () => {
    await renderQuickExit()
    link()
      .element()
      .dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, ctrlKey: true }))
    expectedExit()
  })

  test('a middle click leaves the page', async () => {
    await renderQuickExit()
    link()
      .element()
      .dispatchEvent(new MouseEvent('auxclick', { bubbles: true, cancelable: true, button: 1 }))
    expectedExit()
  })

  test('the link sends no referrer', async () => {
    await renderQuickExit()
    await expect.element(link()).toHaveAttribute('href', destination)
    await expect.element(link()).toHaveAttribute('rel', 'noreferrer')
    await expect.element(link()).toHaveAttribute('referrerpolicy', 'no-referrer')
  })

  test('data-state is idle, armed after a Shift, and leaving after the exit', async () => {
    await renderQuickExit()
    const root = () => document.querySelector('.kv-quick-exit')
    expect(root()?.getAttribute('data-state')).toBe('idle')
    await userEvent.keyboard('{Shift}')
    await expect.poll(() => root()?.getAttribute('data-state')).toBe('armed')
    await userEvent.keyboard('{Shift}{Shift}')
    await expect.poll(() => root()?.getAttribute('data-state')).toBe('leaving')
  })
})

describe('href', () => {
  test.each(['javascript:alert(1)', 'java\nscript:alert(1)', 'ftp://example.org'])(
    'a non-http(s) href %j renders no href, warns and navigates nowhere',
    async (href) => {
      await renderQuickExit({ href })
      expect(document.querySelector('.kv-quick-exit-link')?.hasAttribute('href')).toBe(false)
      await expect.poll(() => consoleWarn).toHaveBeenCalled()
      document.querySelector<HTMLElement>('.kv-quick-exit-link')?.click()
      await userEvent.keyboard('{Shift}{Shift}')
      await expect.element(politeRegion()).toHaveTextContent('')
      await userEvent.keyboard('{Shift}')
      expect(navigate).not.toHaveBeenCalled()
      expect(isPageHidden()).toBe(false)
    },
  )

  test('a relative href resolves against the page', async () => {
    await renderQuickExit({ href: '/exit' })
    await userEvent.click(link())
    expect(navigate).toHaveBeenCalledExactlyOnceWith(new URL('/exit', location.href).href)
  })

  test('the page is gone after the exit even when the author sets display on the body', async () => {
    const style = document.createElement('style')
    style.textContent = 'body { display: flex !important; }'
    document.head.append(style)
    try {
      await renderQuickExit()
      await userEvent.click(link())
      expect(isPageHidden()).toBe(true)
    } finally {
      style.remove()
    }
  })

  test('a second QuickExit with the shortcut off does not warn', async () => {
    await render(
      <KvirnProvider>
        <QuickExit.Root navigate={navigate}>
          <QuickExit.Link href={destination} />
          <QuickExit.Hint />
        </QuickExit.Root>
        <QuickExit.Root navigate={navigate} shortcut={false}>
          <QuickExit.Link href={destination} />
          <QuickExit.Hint />
        </QuickExit.Root>
      </KvirnProvider>,
    )
    await userEvent.keyboard('{Shift}')
    expect(consoleWarn).not.toHaveBeenCalled()
  })

  test('a second QuickExit warns once in development', async () => {
    await render(
      <KvirnProvider>
        <QuickExit.Root navigate={navigate}>
          <QuickExit.Link href={destination} />
          <QuickExit.Hint />
        </QuickExit.Root>
        <QuickExit.Root navigate={navigate}>
          <QuickExit.Link href={destination} />
          <QuickExit.Hint />
        </QuickExit.Root>
      </KvirnProvider>,
    )
    await expect.poll(() => consoleWarn).toHaveBeenCalledOnce()
  })
})

describe('hint', () => {
  test('the hint is shown when the shortcut is on', async () => {
    await renderQuickExit()
    await expect.element(page.getByText('Or press Shift 3 times.')).toBeVisible()
  })

  test('there is no hint and no description when shortcut={false}', async () => {
    await renderQuickExit({ shortcut: false })
    expect(document.querySelector('.kv-quick-exit-hint')).toBeNull()
    expect(link().element().hasAttribute('aria-describedby')).toBe(false)
  })

  test('warns once in development when the shortcut is on and there is no hint', async () => {
    await render(
      <KvirnProvider>
        <QuickExit.Root navigate={navigate}>
          <QuickExit.Link href={destination} />
        </QuickExit.Root>
      </KvirnProvider>,
    )
    await expect.poll(() => consoleWarn).toHaveBeenCalledOnce()
  })
})

describe('default navigation', () => {
  test('without navigate, the page is replaced through window.location.replace', async () => {
    const replace = vi.fn<(href: string) => void>()
    const location = { href: window.location.href, replace }
    const hostWindow = new Proxy(window, {
      get: (target, property) => {
        if (property === 'location') {
          return location
        }
        const value = Reflect.get(target, property) as unknown
        return typeof value === 'function' ? value.bind(target) : value
      },
    })
    await render(
      <KvirnProvider env={{ window: hostWindow, document }}>
        <QuickExit.Root>
          <QuickExit.Link href="/exit" />
          <QuickExit.Hint />
        </QuickExit.Root>
      </KvirnProvider>,
    )
    await userEvent.click(link())
    expect(replace).toHaveBeenCalledExactlyOnceWith(new URL('/exit', window.location.href).href)
  })
})

describe('read aloud', () => {
  const swedish = (
    <KvirnProvider locale="sv" messages={sv}>
      <QuickExit.Root navigate={navigate}>
        <QuickExit.Link href={destination} />
        <QuickExit.Hint />
      </QuickExit.Root>
      <button type="button">Efter</button>
    </KvirnProvider>
  )

  test('idle reads the link by its name and the hint', async () => {
    const { container } = await render(swedish)
    expect(await readAloud(container)).toContain(
      'link, Lämna sidan, Eller tryck på Skift 3 gånger.',
    )
  })

  test('Shift once says two more presses', async () => {
    const { container } = await render(swedish)
    const announcements = await readAnnouncements(container, async () => {
      await userEvent.keyboard('{Shift}')
    })
    expect(announcements).toEqual(['polite: Tryck på Skift 2 gånger till för att lämna sidan'])
  })

  test('Shift twice says one more press', async () => {
    const { container } = await render(swedish)
    await userEvent.keyboard('{Shift}')
    const announcements = await readAnnouncements(container, async () => {
      await userEvent.keyboard('{Shift}')
    })
    expect(announcements).toEqual(['polite: Tryck på Skift 1 gång till för att lämna sidan'])
  })

  test('Shift+Tab is silent and is not counted', async () => {
    const { container } = await render(swedish)
    await userEvent.tab()
    await expect(
      readAnnouncements(
        container,
        async () => {
          await userEvent.tab({ shift: true })
        },
        { timeout: 600 },
      ),
    ).rejects.toThrow('No live-region announcement')
    await userEvent.keyboard('{Shift}{Shift}')
    expect(navigate).not.toHaveBeenCalled()
  })
})

describe('a11y', () => {
  test('the default render has no axe violations', async () => {
    const { container } = await renderQuickExit()
    await expectNoA11yViolations(container)
  })
})
