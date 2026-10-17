import { sv } from '@kvirn-ui/i18n/sv'
import { expectNoA11yViolations } from '@kvirn-ui/testing'
import { readAloud, readAnnouncements } from '@kvirn-ui/testing/read-aloud'
import { createRef } from 'react'
import type { ComponentPropsWithRef } from 'react'
import { renderToString } from 'react-dom/server'
import { afterEach, beforeEach, describe, expect, expectTypeOf, test, vi } from 'vite-plus/test'
import type { MockInstance } from 'vite-plus/test'
import { page, userEvent } from 'vite-plus/test/browser'
import { render } from 'vitest-browser-react'
import { resetDevWarnings } from '../dev/dev-warning.ts'
import { KvirnProvider } from '../provider/kvirn-provider.tsx'
import { SkipPanel } from './skip-panel.tsx'
import type { UseSkipPanelOptions, SkipPanelPartProps } from './use-skip-panel.ts'

// Contract: skip-panel.a11y.md. Whether the card is visible is the theme's, proved in the
// Storybook stories, where theme.css is loaded.

let consoleWarn: MockInstance<Console['warn']>

beforeEach(() => {
  resetDevWarnings()
  consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {})
})

afterEach(() => {
  consoleWarn.mockRestore()
})

function warnings(): string[] {
  return consoleWarn.mock.calls.map((call) => String(call[0]))
}

const searchChord = { key: 's', alt: true, shift: true } as const
const casesChord = { key: 'm', alt: true, shift: true } as const
const reopenChord = { key: 'k', alt: true, shift: true } as const

function Page({
  onSearch = () => {},
  options = { reopenShortcut: reopenChord },
  withCases = true,
}: {
  onSearch?: () => void
  options?: UseSkipPanelOptions
  withCases?: boolean
}) {
  return (
    <>
      <style>{'a, button, input { display: inline-block; min-block-size: 24px; }'}</style>
      <SkipPanel.Root {...options}>
        <SkipPanel.Group>
          <SkipPanel.Label />
          <SkipPanel.List>
            <SkipPanel.Item>
              <SkipPanel.Link href="#main" />
            </SkipPanel.Item>
            <SkipPanel.Item>
              <SkipPanel.Link href="#nav">Site navigation</SkipPanel.Link>
            </SkipPanel.Item>
          </SkipPanel.List>
        </SkipPanel.Group>
        <SkipPanel.Group>
          <SkipPanel.Label kind="shortcuts" />
          <SkipPanel.List>
            <SkipPanel.Item>
              <SkipPanel.Shortcut shortcut={searchChord} onClick={onSearch}>
                Search
              </SkipPanel.Shortcut>
            </SkipPanel.Item>
            {withCases ? (
              <SkipPanel.Item>
                <SkipPanel.Shortcut as="a" href="#cases" shortcut={casesChord}>
                  My cases
                </SkipPanel.Shortcut>
              </SkipPanel.Item>
            ) : null}
          </SkipPanel.List>
        </SkipPanel.Group>
        <SkipPanel.Hint />
      </SkipPanel.Root>
      <header>
        <a href="/">Municipality</a>
        <nav id="nav" aria-label="Site">
          <a href="/services">Services</a>
        </nav>
      </header>
      <input aria-label="Name" />
      <main id="main">
        <h1>Home</h1>
        <a href="/fees">Fees</a>
        <section id="cases" />
      </main>
    </>
  )
}

const chord = (keys: string) => userEvent.keyboard(keys)
const altShift = (key: string) => `{Alt>}{Shift>}${key}{/Shift}{/Alt}`

function dispatchKey(init: KeyboardEventInit): KeyboardEvent {
  const event = new KeyboardEvent('keydown', { bubbles: true, cancelable: true, ...init })
  document.body.dispatchEvent(event)
  return event
}

const root = () => document.querySelector<HTMLElement>('.kv-skip-panel')!

describe('SkipPanel keyboard', () => {
  test('Tab on page load focuses the first Link', async () => {
    await render(<Page />)
    await userEvent.tab()
    expect(document.activeElement).toBe(page.getByRole('link', { name: 'Main content' }).element())
  })

  test('Tab from any item leaves the panel for the page’s next stop', async () => {
    await render(<Page />)
    await userEvent.tab()
    await userEvent.keyboard('{ArrowDown}{ArrowDown}')
    expect(document.activeElement).toBe(page.getByRole('button', { name: /^Search/ }).element())
    await userEvent.tab()
    expect(document.activeElement).toBe(page.getByRole('link', { name: 'Municipality' }).element())
  })

  test('Shift+Tab from the first item leaves the document', async () => {
    await render(<Page />)
    await userEvent.tab()
    await userEvent.tab({ shift: true })
    expect(root().contains(document.activeElement)).toBe(false)
  })

  test('Shift+Tab from a later item leaves the document backwards', async () => {
    await render(<Page />)
    await userEvent.tab()
    await userEvent.keyboard('{ArrowDown}{ArrowDown}')
    await userEvent.tab({ shift: true })
    expect(root().contains(document.activeElement)).toBe(false)
  })

  test('ArrowDown and ArrowUp move across both groups in order', async () => {
    await render(<Page />)
    await userEvent.tab()
    const names = [/^Main content/, /^Site navigation/, /^Search/, /^My cases/]
    for (const name of names.slice(1)) {
      await userEvent.keyboard('{ArrowDown}')
      expect(document.activeElement?.textContent).toMatch(name)
    }
    for (const name of names.slice(0, -1).reverse()) {
      await userEvent.keyboard('{ArrowUp}')
      expect(document.activeElement?.textContent).toMatch(name)
    }
  })

  test('Home and End go to the first and last item', async () => {
    await render(<Page />)
    await userEvent.tab()
    await userEvent.keyboard('{End}')
    expect(document.activeElement?.textContent).toMatch(/^My cases/)
    await userEvent.keyboard('{Home}')
    expect(document.activeElement?.textContent).toMatch(/^Main content/)
  })

  test('the arrows do not wrap', async () => {
    await render(<Page />)
    await userEvent.tab()
    await userEvent.keyboard('{ArrowUp}')
    expect(document.activeElement?.textContent).toMatch(/^Main content/)
    await userEvent.keyboard('{End}{ArrowDown}')
    expect(document.activeElement?.textContent).toMatch(/^My cases/)
  })

  test('the arrows still move on a collapsed card', async () => {
    await render(<Page />)
    await userEvent.tab()
    await userEvent.keyboard('{Escape}{ArrowDown}')
    expect(document.activeElement?.textContent).toMatch(/^Site navigation/)
    expect(root().hasAttribute('data-collapsed')).toBe(true)
  })

  test('the arrows are not flipped in RTL', async () => {
    await render(
      <KvirnProvider dir="rtl">
        <Page />
      </KvirnProvider>,
    )
    await userEvent.tab()
    await userEvent.keyboard('{ArrowDown}')
    expect(document.activeElement?.textContent).toMatch(/^Site navigation/)
    await userEvent.keyboard('{ArrowUp}')
    expect(document.activeElement?.textContent).toMatch(/^Main content/)
    const keydown = vi.fn<(event: Event) => boolean>((event) => event.defaultPrevented)
    document.addEventListener('keydown', keydown)
    await userEvent.keyboard('{ArrowLeft}{ArrowRight}')
    document.removeEventListener('keydown', keydown)
    expect(keydown).not.toHaveReturnedWith(true)
    expect(document.activeElement?.textContent).toMatch(/^Main content/)
  })

  test('the arrows are not handled outside the card', async () => {
    await render(<Page />)
    page.getByRole('link', { name: 'Fees' }).element().focus()
    const keydown = vi.fn<(event: Event) => boolean>((event) => event.defaultPrevented)
    document.addEventListener('keydown', keydown)
    await userEvent.keyboard('{ArrowDown}{Home}')
    document.removeEventListener('keydown', keydown)
    expect(keydown).not.toHaveReturnedWith(true)
  })

  test('only one item is a Tab stop, and it is the first Link again after focus leaves', async () => {
    await render(<Page />)
    const stops = () =>
      Array.from(root().querySelectorAll('[tabindex="0"]')).map((item) => item.textContent)
    expect(stops()).toEqual(['Main content'])
    await userEvent.tab()
    await userEvent.keyboard('{ArrowDown}{ArrowDown}')
    expect(stops()).toHaveLength(1)
    expect(stops()[0]).toMatch(/^Search/)
    await userEvent.tab()
    expect(stops()).toEqual(['Main content'])
    await userEvent.tab({ shift: true })
    expect(document.activeElement?.textContent).toBe('Main content')
  })

  test('Enter on a Link focuses the target', async () => {
    await render(<Page />)
    await userEvent.tab()
    await userEvent.keyboard('{Enter}')
    expect(document.activeElement).toBe(page.getByRole('main').element())
  })

  test('Enter on a Shortcut button runs its action', async () => {
    const onSearch = vi.fn<() => void>()
    await render(<Page onSearch={onSearch} />)
    page
      .getByRole('button', { name: /^Search/ })
      .element()
      .focus()
    await userEvent.keyboard('{Enter}')
    expect(onSearch).toHaveBeenCalledTimes(1)
  })

  test('Enter on a Shortcut link follows the link', async () => {
    await render(<Page />)
    page
      .getByRole('link', { name: /^My cases/ })
      .element()
      .focus()
    await userEvent.keyboard('{Enter}')
    expect(window.location.hash).toBe('#cases')
    window.location.hash = ''
  })

  test('Space on a Shortcut button runs its action', async () => {
    const onSearch = vi.fn<() => void>()
    await render(<Page onSearch={onSearch} />)
    page
      .getByRole('button', { name: /^Search/ })
      .element()
      .focus()
    await userEvent.keyboard(' ')
    expect(onSearch).toHaveBeenCalledTimes(1)
  })

  test('Space on a Link is not handled', async () => {
    await render(<Page />)
    await userEvent.tab()
    const link = page.getByRole('link', { name: 'Main content' }).element()
    const keydown = vi.fn<(event: Event) => boolean>((event) => event.defaultPrevented)
    link.addEventListener('keydown', keydown)
    await userEvent.keyboard(' ')
    expect(keydown).toHaveReturnedWith(false)
    expect(document.activeElement).toBe(link)
  })

  test('Escape on the floating card reached by Tab collapses it, focus stays, and leaving resets', async () => {
    await render(<Page />)
    await userEvent.tab()
    const link = page.getByRole('link', { name: 'Main content' }).element()
    await userEvent.keyboard('{Escape}')
    expect(root().hasAttribute('data-collapsed')).toBe(true)
    expect(document.activeElement).toBe(link)
    await userEvent.tab()
    expect(root().hasAttribute('data-collapsed')).toBe(false)
  })

  test('the reopen shortcut stores the focused element and focuses the first Link', async () => {
    await render(<Page />)
    page.getByRole('link', { name: 'Fees' }).element().focus()
    await chord(altShift('k'))
    expect(document.activeElement).toBe(page.getByRole('link', { name: 'Main content' }).element())
    expect(root().hasAttribute('data-reopened')).toBe(true)
  })

  test('Escape on a card opened by the reopen shortcut closes it and focus returns', async () => {
    await render(<Page />)
    const before = page.getByRole('link', { name: 'Fees' }).element()
    before.focus()
    await chord(altShift('k'))
    await userEvent.keyboard('{Escape}')
    expect(document.activeElement).toBe(before)
    expect(root().hasAttribute('data-reopened')).toBe(false)
  })

  test('Escape focuses the first Link’s target when the element focused before is gone', async () => {
    function Gone({ show }: { show: boolean }) {
      return (
        <>
          <Page />
          {show ? <button id="gone">Gone</button> : null}
        </>
      )
    }
    const screen = await render(<Gone show />)
    page.getByRole('button', { name: 'Gone' }).element().focus()
    await chord(altShift('k'))
    await screen.rerender(<Gone show={false} />)
    await userEvent.keyboard('{Escape}')
    expect(document.activeElement).toBe(page.getByRole('main').element())
  })

  test('a Shortcut’s chord activates its row', async () => {
    const onSearch = vi.fn<() => void>()
    await render(<Page onSearch={onSearch} />)
    await chord(altShift('s'))
    expect(onSearch).toHaveBeenCalledTimes(1)
  })

  test('a Shortcut’s chord prevents the browser’s own action', async () => {
    await render(<Page />)
    const event = dispatchKey({ key: 'S', code: 'KeyS', altKey: true, shiftKey: true })
    expect(event.defaultPrevented).toBe(true)
  })

  test('a chord is not handled in an editable target', async () => {
    const onSearch = vi.fn<() => void>()
    await render(<Page onSearch={onSearch} />)
    page.getByRole('textbox', { name: 'Name' }).element().focus()
    await chord(altShift('s'))
    await chord(altShift('k'))
    expect(onSearch).not.toHaveBeenCalled()
    expect(root().hasAttribute('data-reopened')).toBe(false)
  })

  test('a chord is not handled with AltGr', async () => {
    const onSearch = vi.fn<() => void>()
    await render(<Page onSearch={onSearch} />)
    const event = dispatchKey({
      key: 'S',
      code: 'KeyS',
      altKey: true,
      shiftKey: true,
      ctrlKey: true,
      modifierAltGraph: true,
    })
    expect(onSearch).not.toHaveBeenCalled()
    expect(event.defaultPrevented).toBe(false)
  })

  test('a chord is not handled with an extra Ctrl or Meta', async () => {
    const onSearch = vi.fn<() => void>()
    await render(<Page onSearch={onSearch} />)
    const withCtrl = dispatchKey({
      key: 'S',
      code: 'KeyS',
      altKey: true,
      shiftKey: true,
      ctrlKey: true,
    })
    const withMeta = dispatchKey({
      key: 'S',
      code: 'KeyS',
      altKey: true,
      shiftKey: true,
      metaKey: true,
    })
    expect(onSearch).not.toHaveBeenCalled()
    expect(withCtrl.defaultPrevented || withMeta.defaultPrevented).toBe(false)
  })

  test('no chord is handled while shortcutsEnabled is false', async () => {
    const onSearch = vi.fn<() => void>()
    await render(
      <Page
        onSearch={onSearch}
        options={{ shortcutsEnabled: false, reopenShortcut: reopenChord }}
      />,
    )
    const search = dispatchKey({ key: 'S', code: 'KeyS', altKey: true, shiftKey: true })
    const reopen = dispatchKey({ key: 'K', code: 'KeyK', altKey: true, shiftKey: true })
    expect(onSearch).not.toHaveBeenCalled()
    expect(search.defaultPrevented || reopen.defaultPrevented).toBe(false)
    expect(root().hasAttribute('data-reopened')).toBe(false)
  })

  test('Escape after the reopen shortcut from nothing focused goes to the first Link’s target, never body', async () => {
    await render(<Page />)
    ;(document.activeElement as HTMLElement).blur()
    await chord(altShift('k'))
    await userEvent.keyboard('{Escape}')
    expect(document.activeElement).toBe(page.getByRole('main').element())
  })

  test('the element to return to is forgotten when focus leaves the card', async () => {
    await render(<Page />)
    page.getByRole('link', { name: 'Fees' }).element().focus()
    await chord(altShift('k'))
    await userEvent.tab()
    expect(root().contains(document.activeElement)).toBe(false)
    ;(document.activeElement as HTMLElement).blur()
    await chord(altShift('k'))
    await userEvent.keyboard('{Escape}')
    expect(document.activeElement).toBe(page.getByRole('main').element())
  })

  test('pressing a row with the mouse keeps focus in the card', async () => {
    await render(<Page />)
    await userEvent.tab()
    const search = page.getByRole('button', { name: /^Search/ }).element()
    const press = new MouseEvent('mousedown', { bubbles: true, cancelable: true })
    search.dispatchEvent(press)
    expect(press.defaultPrevented).toBe(true)
    expect(root().contains(document.activeElement)).toBe(true)
    const onFocused = new MouseEvent('mousedown', { bubbles: true, cancelable: true })
    page.getByRole('link', { name: 'Main content' }).element().dispatchEvent(onFocused)
    expect(onFocused.defaultPrevented).toBe(false)
  })
})

describe('SkipPanel roving tabindex', () => {
  test('an item that mounts later is not an extra Tab stop', async () => {
    function Late({ show }: { show: boolean }) {
      return (
        <SkipPanel.Root>
          <SkipPanel.Link href="#main" />
          {show ? <SkipPanel.Link href="#main">Late link</SkipPanel.Link> : null}
          <SkipPanel.Hint />
        </SkipPanel.Root>
      )
    }
    const screen = await render(<Late show={false} />)
    await screen.rerender(<Late show />)
    expect(root().querySelectorAll('[tabindex="0"]')).toHaveLength(1)
    expect(page.getByRole('link', { name: 'Late link' }).element().getAttribute('tabindex')).toBe(
      '-1',
    )
  })

  test('a consumer’s own aria-describedby on the first Link is merged with the arrow sentence', async () => {
    await render(
      <SkipPanel.Root>
        <SkipPanel.Link href="#main" aria-describedby="note" />
        <SkipPanel.Hint />
        <p id="note">Note</p>
      </SkipPanel.Root>,
    )
    const ids = (page.getByRole('link').element().getAttribute('aria-describedby') ?? '').split(' ')
    expect(ids).toHaveLength(2)
    expect(ids).toContain('note')
  })
})

describe('SkipPanel chords', () => {
  test('the listener is removed when the Root unmounts', async () => {
    const onSearch = vi.fn<() => void>()
    const screen = await render(<Page onSearch={onSearch} />)
    await screen.unmount()
    dispatchKey({ key: 'S', code: 'KeyS', altKey: true, shiftKey: true })
    expect(onSearch).not.toHaveBeenCalled()
  })

  test('no chord is handled inside an inert subtree', async () => {
    const onSearch = vi.fn<() => void>()
    await render(
      <div inert>
        <Page onSearch={onSearch} />
      </div>,
    )
    dispatchKey({ key: 'S', code: 'KeyS', altKey: true, shiftKey: true })
    expect(onSearch).not.toHaveBeenCalled()
  })

  test('no chord is handled while a modal dialog that does not hold the card is open', async () => {
    const onSearch = vi.fn<() => void>()
    await render(
      <>
        <Page onSearch={onSearch} />
        <dialog aria-label="Confirm">
          <button>Close</button>
        </dialog>
      </>,
    )
    const dialog = document.querySelector('dialog')!
    dialog.showModal()
    const event = dispatchKey({ key: 'S', code: 'KeyS', altKey: true, shiftKey: true })
    dialog.close()
    expect(onSearch).not.toHaveBeenCalled()
    expect(event.defaultPrevented).toBe(false)
  })

  test('on Apple platforms AltGraph reported with Option does not reject the chord', async () => {
    const onSearch = vi.fn<() => void>()
    const appleWindow = new Proxy(window, {
      get(target, property) {
        if (property === 'navigator') {
          return { platform: 'MacIntel' }
        }
        const value = Reflect.get(target, property, target)
        return typeof value === 'function' ? value.bind(target) : value
      },
    })
    await render(
      <KvirnProvider env={{ window: appleWindow, document }}>
        <Page onSearch={onSearch} />
      </KvirnProvider>,
    )
    dispatchKey({ key: 'ß', code: 'KeyS', altKey: true, shiftKey: true, modifierAltGraph: true }) // kv-lang-ok: the macOS Option+S character
    expect(onSearch).toHaveBeenCalledTimes(1)
  })
})

describe('SkipPanel read aloud', () => {
  test('reads the skip group named by its Label, then its links', async () => {
    const { container } = await render(<Page />)
    const phrases = await readAloud(container)
    const group = phrases.indexOf('group, Skip to')
    expect(group).toBeGreaterThan(-1)
    const main = phrases.findIndex((phrase) => phrase.startsWith('link, Main content'))
    expect(main).toBeGreaterThan(group)
    expect(phrases.indexOf('link, Site navigation')).toBeGreaterThan(main)
  })

  test('reads the first Link with the arrow-key description', async () => {
    const { container } = await render(<Page />)
    expect(await readAloud(container)).toContain(
      'link, Main content, Use the up and down arrow keys to move between items.',
    )
  })

  test('without a Hint the first Link has no description and a development warning says so', async () => {
    await render(
      <SkipPanel.Root>
        <SkipPanel.Link href="#main" />
        <main id="main" />
      </SkipPanel.Root>,
    )
    expect(page.getByRole('link').element().hasAttribute('aria-describedby')).toBe(false)
    expect(warnings().some((message) => message.includes('SkipPanel.Hint'))).toBe(true)
  })

  test('reads a Shortcut button with its key caps and its chord', async () => {
    const { container } = await render(<Page />)
    const phrases = await readAloud(container)
    expect(phrases).toContain('group, Keyboard shortcuts')
    expect(phrases).toContain('button, Search Alt+Shift+S, key shortcuts Alt+Shift+S')
  })

  test('reads a Shortcut link with its key caps and its chord', async () => {
    const { container } = await render(<Page />)
    expect(await readAloud(container)).toContain(
      'link, My cases Alt+Shift+M, key shortcuts Alt+Shift+M',
    )
  })

  test('with shortcutsEnabled false the group is Quick links and the button has no chord', async () => {
    const { container } = await render(<Page options={{ shortcutsEnabled: false }} />)
    const phrases = await readAloud(container)
    expect(phrases).toContain('group, Quick links')
    expect(phrases).toContain('button, Search')
    expect(phrases.some((phrase) => phrase.includes('key shortcuts'))).toBe(false)
  })

  test('reads the Hint as a paragraph with the chord', async () => {
    const { container } = await render(<Page />)
    const phrases = await readAloud(container)
    const start = phrases.indexOf('paragraph')
    const end = phrases.indexOf('end of paragraph', start)
    expect(phrases.slice(start + 1, end).join(' ')).toBe(
      'Use the up and down arrow keys to move between items. Press Alt + Shift + K to open this list again.',
    )
  })

  test('Escape collapsing the card announces nothing', async () => {
    const { container } = await render(<Page />)
    await userEvent.tab()
    await expect(
      readAnnouncements(container, () => userEvent.keyboard('{Escape}'), { timeout: 300 }),
    ).rejects.toThrow(/No live-region announcement/)
    expect(root().hasAttribute('data-collapsed')).toBe(true)
  })
})

describe('SkipPanel name and attributes', () => {
  test('the groups hold no headings', async () => {
    await render(<Page />)
    expect(document.querySelector('h1, h2, h3, h4, h5, h6, [role="heading"]')?.tagName).toBe('H1')
    expect(root().querySelector('h1, h2, h3, h4, h5, h6, [role="heading"]')).toBeNull()
  })

  test('the lists are lists with items', async () => {
    await render(<Page />)
    expect(page.getByRole('list').elements()).toHaveLength(2)
    expect(page.getByRole('listitem').elements()).toHaveLength(4)
  })

  test('a Shortcut has no aria-label, is a type=button, and draws one key cap per key', async () => {
    await render(<Page />)
    const search = page.getByRole('button', { name: /^Search/ }).element()
    expect(search.hasAttribute('aria-label')).toBe(false)
    expect(search.getAttribute('type')).toBe('button')
    expect(search.querySelectorAll('kbd')).toHaveLength(4)
  })

  test('shortcutsEnabled false draws no key caps', async () => {
    await render(<Page options={{ shortcutsEnabled: false }} />)
    expect(page.getByRole('button', { name: 'Search' }).element().querySelector('kbd')).toBeNull()
  })

  test('the Hint draws the reopen chord as key caps', async () => {
    await render(<Page />)
    expect(document.querySelectorAll('.kv-skip-panel__hint kbd')).toHaveLength(4)
  })

  test('the Hint draws no key caps without a reopenShortcut', async () => {
    await render(<Page options={{}} />)
    expect(document.querySelector('.kv-skip-panel__hint')).not.toBeNull()
    expect(document.querySelector('.kv-skip-panel__hint kbd')).toBeNull()
  })

  test('the Root carries its class', async () => {
    await render(<Page />)
    expect(root().className).toBe('kv-skip-panel')
  })

  test('the parts carry their classes', async () => {
    await render(<Page />)
    for (const name of ['group', 'label', 'list', 'item', 'link', 'shortcut', 'hint']) {
      expect(root().querySelector(`.kv-skip-panel__${name}`)).not.toBeNull()
    }
  })

  test('the sv catalog names the labels', async () => {
    await render(
      <KvirnProvider locale="sv" messages={sv}>
        <Page />
      </KvirnProvider>,
    )
    // kv-lang-ok: proves the sv catalog
    await expect.element(page.getByRole('group', { name: 'Hoppa till' })).toBeInTheDocument()
    // kv-lang-ok: proves the sv catalog
    await expect.element(page.getByRole('link', { name: 'Huvudinnehåll' })).toBeInTheDocument()
    // kv-lang-ok: proves the sv catalog
    expect(page.getByRole('button', { name: /^Search/ }).element().textContent).toContain('Skift')
  })

  test('messages override the Link text per instance', async () => {
    await render(
      <SkipPanel.Root>
        <SkipPanel.Link href="#main" messages={{ mainContent: 'Content' }} />
        <main id="main" />
      </SkipPanel.Root>,
    )
    await expect.element(page.getByRole('link', { name: 'Content' })).toBeInTheDocument()
  })

  test('attributes and the ref pass through, and as={Component} receives the class', async () => {
    const ref = createRef<HTMLButtonElement>()
    function RouterLink({ children, ...anchorProps }: ComponentPropsWithRef<'a'>) {
      return (
        <a {...anchorProps} data-router-link="">
          {children}
        </a>
      )
    }
    await render(
      <SkipPanel.Root className="other">
        <SkipPanel.Shortcut shortcut={searchChord} ref={ref} id="search">
          Search
        </SkipPanel.Shortcut>
        <SkipPanel.Shortcut as={RouterLink} href="/x" shortcut={casesChord} className="egen">
          Cases
        </SkipPanel.Shortcut>
      </SkipPanel.Root>,
    )
    expect(root().className).toBe('other kv-skip-panel')
    expect(ref.current).toBe(page.getByRole('button').element())
    const link = page.getByRole('link', { name: /^Cases/ })
    await expect.element(link).toHaveAttribute('data-router-link', '')
    await expect.element(link).toHaveClass('kv-skip-panel__shortcut', 'egen')
  })

  test('exports its types', () => {
    expectTypeOf<UseSkipPanelOptions['shortcutsEnabled']>().toEqualTypeOf<boolean | undefined>()
    expectTypeOf<SkipPanelPartProps['className']>().toEqualTypeOf<'kv-skip-panel'>()
  })
})

describe('SkipPanel development warnings', () => {
  test('a single character chord with no modifier warns once', async () => {
    await render(<Page options={{ reopenShortcut: { key: 'k' } }} />)
    expect(warnings().filter((message) => message.includes('2.1.4'))).toHaveLength(1)
  })

  test('a Ctrl+Alt chord warns about AltGr', async () => {
    await render(<Page options={{ reopenShortcut: { key: 'k', ctrl: true, alt: true } }} />)
    expect(warnings().some((message) => message.includes('AltGr'))).toBe(true)
  })

  test('good chords do not warn', async () => {
    await render(<Page />)
    expect(warnings()).toEqual([])
  })
})

describe('SkipPanel accessibility', () => {
  test('has no axe violations', async () => {
    const { container } = await render(<Page />)
    await expect.element(page.getByRole('group', { name: 'Skip to' })).toBeInTheDocument()
    await expectNoA11yViolations(container)
  })

  test('has no axe violations while focused and with shortcuts off', async () => {
    const { container } = await render(<Page options={{ shortcutsEnabled: false }} />)
    await userEvent.tab()
    expect(root().contains(document.activeElement)).toBe(true)
    await expectNoA11yViolations(container)
  })
})

describe('server rendering', () => {
  test('renders the card to a string', () => {
    const html = renderToString(<Page />)
    expect(html).toContain('class="kv-skip-panel"')
    expect(html).toContain('role="group"')
    expect(warnings()).toEqual([])
  })
})
