import { expectNoA11yViolations } from '@kvirn-ui/testing'
import { createRef, useState } from 'react'
import { renderToString } from 'react-dom/server'
import { afterEach, beforeEach, describe, expect, expectTypeOf, test, vi } from 'vite-plus/test'
import type { MockInstance } from 'vite-plus/test'
import { page, userEvent } from 'vite-plus/test/browser'
import { render } from 'vitest-browser-react'
import { resetDevWarnings } from '../dev/dev-warning.ts'
import { Tabs } from './tabs.tsx'
import type { TabsListProps, TabsPanelProps, TabsRootProps, TabsTabProps } from './tabs.tsx'
import { useTabs } from './use-tabs.ts'
import type {
  TabsActivationMode,
  TabsChangeDetails,
  TabsChangeReason,
  TabsListPartProps,
  TabsPanelPartProps,
  TabsRootPartProps,
  TabsTabPartProps,
  UseTabsOptions,
  UseTabsResult,
} from './use-tabs.ts'

// Contract: tabs.a11y.md. This file proves the keyboard rows, the roles, the states, the ids, the
// callbacks and the warnings. Component tests load no theme.

let consoleWarn: MockInstance<Console['warn']>

beforeEach(() => {
  resetDevWarnings()
  consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {})
})

afterEach(() => {
  consoleWarn.mockRestore()
})

/** The fixture's own buttons are unstyled: give them the 24px that 2.5.8 asks for, so axe checks the Tabs. */
const fixtureTabStyle = { minBlockSize: '2rem', minInlineSize: '2rem' }

const tab = (name: string) => page.getByRole('tab', { name, exact: true })
const tabIndexOf = (name: string) => tab(name).element().getAttribute('tabindex')
const tabStops = () =>
  page.getByRole('tablist').element().querySelectorAll('[role="tab"][tabindex="0"]').length

interface CaseTabsProps {
  /** Controlled. Without it the tabs are uncontrolled, and start at `defaultValue`. */
  value?: string | undefined
  defaultValue?: string | undefined
  onValueChange?: ((value: string, details: TabsChangeDetails) => void) | undefined
  activationMode?: TabsActivationMode | undefined
  orientation?: 'horizontal' | 'vertical' | undefined
}

function CaseTabs({
  value,
  defaultValue = 'uppgifter',
  onValueChange,
  activationMode,
  orientation,
}: CaseTabsProps) {
  const parts = (
    <>
      <Tabs.List aria-label="Ärendet">
        <Tabs.Tab value="uppgifter" style={fixtureTabStyle}>
          Uppgifter
        </Tabs.Tab>
        <Tabs.Tab value="handlingar" style={fixtureTabStyle}>
          Handlingar
        </Tabs.Tab>
        <Tabs.Tab value="historik" style={fixtureTabStyle}>
          Historik
        </Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel value="uppgifter">Uppgifterna om ärendet.</Tabs.Panel>
      <Tabs.Panel value="handlingar">Handlingarna i ärendet.</Tabs.Panel>
      <Tabs.Panel value="historik">Ärendets historik.</Tabs.Panel>
    </>
  )
  return value === undefined ? (
    <Tabs.Root
      defaultValue={defaultValue}
      onValueChange={onValueChange}
      activationMode={activationMode}
      orientation={orientation}
    >
      {parts}
    </Tabs.Root>
  ) : (
    <Tabs.Root
      value={value}
      onValueChange={onValueChange}
      activationMode={activationMode}
      orientation={orientation}
    >
      {parts}
    </Tabs.Root>
  )
}

describe('rendering', () => {
  test('is a tablist of tabs and panels with the names the consumer gives, and warns about nothing', async () => {
    const { container } = await render(<CaseTabs />)
    const list = page.getByRole('tablist', { name: 'Ärendet' })
    await expect.element(list).toBeVisible()
    expect(page.getByRole('tab').elements()).toHaveLength(3)
    await expect.element(tab('Uppgifter')).toBeVisible()
    await expect.element(page.getByRole('tabpanel', { name: 'Uppgifter' })).toBeVisible()
    await expectNoA11yViolations(container)
    expect(consoleWarn).not.toHaveBeenCalled()
  })

  test('has no text of its own: the names are the consumer’s, in English too', async () => {
    await render(
      <Tabs.Root defaultValue="details">
        <Tabs.List aria-label="Case">
          <Tabs.Tab value="details" style={fixtureTabStyle}>
            Details
          </Tabs.Tab>
          <Tabs.Tab value="documents" style={fixtureTabStyle}>
            Documents
          </Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="details">The details of the case.</Tabs.Panel>
        <Tabs.Panel value="documents">The documents of the case.</Tabs.Panel>
      </Tabs.Root>,
    )
    await expect.element(page.getByRole('tablist', { name: 'Case' })).toBeVisible()
    await expect.element(tab('Details')).toHaveAttribute('aria-selected', 'true')
    await expect.element(tab('Documents')).toHaveAttribute('aria-selected', 'false')
    await expect.element(page.getByRole('tabpanel', { name: 'Details' })).toBeVisible()
  })

  test('exactly one tab is selected, and aria-selected is explicit on every tab', async () => {
    await render(<CaseTabs defaultValue="handlingar" />)
    const selected = page
      .getByRole('tab')
      .elements()
      .map((element) => element.getAttribute('aria-selected'))
    expect(selected).toEqual(['false', 'true', 'false'])
  })

  test('every tab controls its panel and every panel is named by its tab, for values with spaces and punctuation too', async () => {
    const values = ['Bygga och bo', "a:b'c", 'a_b', 'a_5f_b']
    await render(
      <Tabs.Root defaultValue="Bygga och bo">
        <Tabs.List aria-label="Ämnen">
          {values.map((value) => (
            <Tabs.Tab key={value} value={value} style={fixtureTabStyle}>
              {value}
            </Tabs.Tab>
          ))}
        </Tabs.List>
        {values.map((value) => (
          <Tabs.Panel key={value} value={value}>
            Om {value}
          </Tabs.Panel>
        ))}
      </Tabs.Root>,
    )
    const ids: string[] = []
    for (const element of page.getByRole('tab').elements()) {
      const panel = document.getElementById(element.getAttribute('aria-controls') ?? '')
      expect(panel?.getAttribute('role')).toBe('tabpanel')
      expect(panel?.getAttribute('aria-labelledby')).toBe(element.id)
      expect(element.id).toMatch(/^\S+$/)
      ids.push(element.id, panel?.id ?? '')
    }
    expect(ids).toHaveLength(values.length * 2)
    expect(new Set(ids).size).toBe(values.length * 2)
    expect(consoleWarn).not.toHaveBeenCalled()
  })

  test('inactive panels are hidden but stay in the document, so every aria-controls resolves', async () => {
    await render(<CaseTabs />)
    const panels = page.getByRole('tabpanel', { includeHidden: true }).elements()
    expect(panels.map((panel) => panel.hasAttribute('hidden'))).toEqual([false, true, true])
    expect(page.getByRole('tabpanel').elements()).toHaveLength(1)
  })

  test('horizontal: no aria-orientation, and data-orientation on the root', async () => {
    const { container } = await render(<CaseTabs />)
    await expect.element(page.getByRole('tablist')).not.toHaveAttribute('aria-orientation')
    expect(container.firstElementChild?.getAttribute('data-orientation')).toBe('horizontal')
  })

  test('vertical: aria-orientation="vertical", and data-orientation on the root', async () => {
    const { container } = await render(<CaseTabs orientation="vertical" />)
    await expect.element(page.getByRole('tablist')).toHaveAttribute('aria-orientation', 'vertical')
    expect(container.firstElementChild?.getAttribute('data-orientation')).toBe('vertical')
  })

  test('state is in data attributes: data-selected on the tab and its panel, data-disabled on a disabled tab', async () => {
    await render(
      <Tabs.Root defaultValue="a">
        <Tabs.List aria-label="Test">
          <Tabs.Tab value="a">A</Tabs.Tab>
          <Tabs.Tab value="b" disabled>
            B
          </Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="a">Panel A</Tabs.Panel>
        <Tabs.Panel value="b">Panel B</Tabs.Panel>
      </Tabs.Root>,
    )
    await expect.element(tab('A')).toHaveAttribute('data-selected', '')
    await expect.element(tab('A')).not.toHaveAttribute('data-disabled')
    await expect.element(tab('B')).not.toHaveAttribute('data-selected')
    await expect.element(tab('B')).toHaveAttribute('data-disabled', '')
    await expect.element(page.getByRole('tabpanel')).toHaveAttribute('data-selected', '')
    const hidden = page.getByRole('tabpanel', { includeHidden: true }).elements()[1]
    expect(hidden?.hasAttribute('data-selected')).toBe(false)
  })

  test('the parts render their classes, and the consumer’s join them', async () => {
    const { container } = await render(
      <Tabs.Root defaultValue="a" className="egen-rot" data-egen="rot">
        <Tabs.List aria-label="Test" className="egen-lista">
          <Tabs.Tab value="a" className="egen-flik">
            A
          </Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="a" className="egen-panel">
          Panel A
        </Tabs.Panel>
      </Tabs.Root>,
    )
    const root = container.firstElementChild
    expect(root?.classList.contains('kv-tabs')).toBe(true)
    expect(root?.classList.contains('egen-rot')).toBe(true)
    expect(root?.getAttribute('data-egen')).toBe('rot')
    await expect.element(page.getByRole('tablist')).toHaveClass('kv-tabs-list', 'egen-lista')
    await expect.element(tab('A')).toHaveClass('kv-tabs-tab', 'egen-flik')
    await expect.element(page.getByRole('tabpanel')).toHaveClass('kv-tabs-panel', 'egen-panel')
  })

  test('forwards refs and passes props on', async () => {
    const rootRef = createRef<HTMLDivElement>()
    const listRef = createRef<HTMLDivElement>()
    const tabRef = createRef<HTMLButtonElement>()
    const panelRef = createRef<HTMLDivElement>()
    await render(
      <Tabs.Root ref={rootRef} defaultValue="a" orientation="vertical" activationMode="manual">
        <Tabs.List ref={listRef} aria-label="Test" data-egen="lista">
          <Tabs.Tab ref={tabRef} value="a">
            A
          </Tabs.Tab>
          <Tabs.Tab value="b" data-egen="flik">
            B
          </Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel ref={panelRef} value="a">
          Panel A
        </Tabs.Panel>
        <Tabs.Panel value="b">Panel B</Tabs.Panel>
      </Tabs.Root>,
    )
    expect(rootRef.current?.classList.contains('kv-tabs')).toBe(true)
    expect(rootRef.current?.getAttribute('data-orientation')).toBe('vertical')
    expect(listRef.current).toBe(page.getByRole('tablist').element())
    await expect.element(page.getByRole('tablist')).toHaveAttribute('data-egen', 'lista')
    expect(tabRef.current).toBe(tab('A').element())
    await expect.element(tab('B')).toHaveAttribute('data-egen', 'flik')
    await expect.element(tab('B')).toHaveAttribute('role', 'tab')
    expect(panelRef.current).toBe(page.getByRole('tabpanel').element())
  })

  test('a panel has tabindex 0 by default, and a tabIndex the consumer passes wins', async () => {
    await render(
      <Tabs.Root defaultValue="a">
        <Tabs.List aria-label="Test">
          <Tabs.Tab value="a">A</Tabs.Tab>
          <Tabs.Tab value="b">B</Tabs.Tab>
          <Tabs.Tab value="c">C</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="a" tabIndex={-1}>
          <a href="#kontakt">Kontakt</a>
        </Tabs.Panel>
        <Tabs.Panel value="b">Panel B</Tabs.Panel>
        <Tabs.Panel value="c" tabIndex={-1}>
          Panel C
        </Tabs.Panel>
      </Tabs.Root>,
    )
    const panels = page.getByRole('tabpanel', { includeHidden: true }).elements()
    expect(panels.map((panel) => panel.getAttribute('tabindex'))).toEqual(['-1', '0', '-1'])
  })
})

describe('roving tabindex', () => {
  test('the selected tab is the one Tab stop, and the others are -1', async () => {
    await render(<CaseTabs defaultValue="handlingar" />)
    expect(tabIndexOf('Uppgifter')).toBe('-1')
    expect(tabIndexOf('Handlingar')).toBe('0')
    expect(tabIndexOf('Historik')).toBe('-1')
    expect(tabStops()).toBe(1)
  })

  test('a tab that has focus is the Tab stop while focus is in the list, and the selected tab is again once it leaves', async () => {
    await render(<CaseTabs activationMode="manual" defaultValue="handlingar" />)
    // Manual activation: focus moves to a tab without selecting it.
    tab('Uppgifter').element().focus()
    await expect.element(tab('Uppgifter')).toHaveAttribute('tabindex', '0')
    await expect.element(tab('Handlingar')).toHaveAttribute('tabindex', '-1')
    expect(tabStops()).toBe(1)
    await expect.element(tab('Handlingar')).toHaveAttribute('aria-selected', 'true')
    tab('Uppgifter').element().blur()
    await expect.element(tab('Handlingar')).toHaveAttribute('tabindex', '0')
    await expect.element(tab('Uppgifter')).toHaveAttribute('tabindex', '-1')
    expect(tabStops()).toBe(1)
  })

  test('a tab that a pointer selects is the Tab stop', async () => {
    await render(<CaseTabs />)
    await userEvent.click(tab('Historik'))
    await expect.element(tab('Historik')).toHaveAttribute('tabindex', '0')
    expect(tabIndexOf('Uppgifter')).toBe('-1')
    expect(tabStops()).toBe(1)
  })
})

describe('selection', () => {
  test('uncontrolled: a click selects the tab and shows its panel', async () => {
    await render(<CaseTabs />)
    await userEvent.click(tab('Handlingar'))
    await expect.element(tab('Handlingar')).toHaveAttribute('aria-selected', 'true')
    await expect.element(tab('Uppgifter')).toHaveAttribute('aria-selected', 'false')
    await expect.element(page.getByRole('tabpanel', { name: 'Handlingar' })).toBeVisible()
    expect(page.getByRole('tabpanel').elements()).toHaveLength(1)
  })

  test('controlled: value decides what is selected, and a change from outside moves the selection', async () => {
    function Controlled() {
      const [value, setValue] = useState('uppgifter')
      return (
        <>
          <button type="button" style={fixtureTabStyle} onClick={() => setValue('historik')}>
            Visa historiken
          </button>
          <CaseTabs value={value} onValueChange={(next) => setValue(next)} />
        </>
      )
    }
    await render(<Controlled />)
    await userEvent.click(tab('Handlingar'))
    await expect.element(tab('Handlingar')).toHaveAttribute('aria-selected', 'true')
    await userEvent.click(page.getByRole('button', { name: 'Visa historiken' }))
    await expect.element(tab('Historik')).toHaveAttribute('aria-selected', 'true')
    await expect.element(tab('Handlingar')).toHaveAttribute('aria-selected', 'false')
    await expect.element(page.getByRole('tabpanel', { name: 'Historik' })).toBeVisible()
  })

  test('a controlled owner that refuses keeps the selection, and focus still moves', async () => {
    const onValueChange = vi.fn<(value: string, details: TabsChangeDetails) => void>()
    await render(<CaseTabs value="uppgifter" onValueChange={onValueChange} />)
    await userEvent.click(tab('Handlingar'))
    expect(onValueChange).toHaveBeenCalledTimes(1)
    await expect.element(tab('Uppgifter')).toHaveAttribute('aria-selected', 'true')
    await expect.element(tab('Handlingar')).toHaveAttribute('aria-selected', 'false')
    await expect.element(page.getByRole('tabpanel', { name: 'Uppgifter' })).toBeVisible()
    // Focus is on a tab that is not selected, so it is the Tab stop while it has focus.
    await expect.element(tab('Handlingar')).toHaveFocus()
    await expect.element(tab('Handlingar')).toHaveAttribute('tabindex', '0')
  })

  test('onValueChange reports the value, the reason and the event: press, arrow-key and home-end-key', async () => {
    const onValueChange = vi.fn<(value: string, details: TabsChangeDetails) => void>()
    await render(<CaseTabs onValueChange={onValueChange} />)
    await userEvent.click(tab('Handlingar'))
    await userEvent.keyboard('{ArrowRight}')
    await userEvent.keyboard('{Home}')
    await userEvent.keyboard('{End}')
    expect(onValueChange.mock.calls.map(([value, details]) => [value, details.reason])).toEqual([
      ['handlingar', 'press'],
      ['historik', 'arrow-key'],
      ['uppgifter', 'home-end-key'],
      ['historik', 'home-end-key'],
    ])
    expect(onValueChange.mock.calls.map(([, details]) => details.event.type)).toEqual([
      'click',
      'keydown',
      'keydown',
      'keydown',
    ])
  })

  test('onValueChange is not called for the tab that is already selected', async () => {
    const onValueChange = vi.fn<(value: string, details: TabsChangeDetails) => void>()
    await render(<CaseTabs onValueChange={onValueChange} />)
    await userEvent.click(tab('Uppgifter'))
    expect(onValueChange).not.toHaveBeenCalled()
  })

  test('manual activation: Enter selects through the click, with the reason press', async () => {
    const onValueChange = vi.fn<(value: string, details: TabsChangeDetails) => void>()
    await render(<CaseTabs activationMode="manual" onValueChange={onValueChange} />)
    tab('Uppgifter').element().focus()
    await userEvent.keyboard('{ArrowRight}')
    expect(onValueChange).not.toHaveBeenCalled()
    await expect.element(tab('Handlingar')).toHaveFocus()
    await userEvent.keyboard('{Enter}')
    expect(onValueChange.mock.calls.map(([value, details]) => [value, details.reason])).toEqual([
      ['handlingar', 'press'],
    ])
    await expect.element(tab('Handlingar')).toHaveAttribute('aria-selected', 'true')
  })
})

describe('keyboard contract', () => {
  const panel = (name: string) => page.getByRole('tabpanel', { name, exact: true })
  const selectedAndFocused = async (name: string) => {
    await expect.element(tab(name)).toHaveFocus()
    await expect.element(tab(name)).toHaveAttribute('aria-selected', 'true')
  }

  function KeyboardTabs({
    activationMode,
    orientation,
  }: Pick<CaseTabsProps, 'activationMode' | 'orientation'>) {
    return (
      <>
        <button type="button">Före</button>
        <Tabs.Root
          defaultValue="uppgifter"
          activationMode={activationMode}
          orientation={orientation}
        >
          <Tabs.List aria-label="Ärendet">
            <Tabs.Tab value="uppgifter" style={fixtureTabStyle}>
              Uppgifter
            </Tabs.Tab>
            <Tabs.Tab value="handlingar" style={fixtureTabStyle}>
              Handlingar
            </Tabs.Tab>
            <Tabs.Tab value="historik" disabled style={fixtureTabStyle}>
              Historik
            </Tabs.Tab>
            <Tabs.Tab value="kontakt" style={fixtureTabStyle}>
              Kontakt
            </Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel value="uppgifter">Uppgifterna om ärendet.</Tabs.Panel>
          <Tabs.Panel value="handlingar" tabIndex={-1}>
            <a href="#beslut">Läs beslutet</a>
          </Tabs.Panel>
          <Tabs.Panel value="historik">Ärendets historik.</Tabs.Panel>
          <Tabs.Panel value="kontakt">Kontaktuppgifter.</Tabs.Panel>
        </Tabs.Root>
        <button type="button">Efter</button>
      </>
    )
  }

  test('Tab enters at the selected tab', async () => {
    await render(<KeyboardTabs />)
    await userEvent.tab()
    await expect.element(page.getByRole('button', { name: 'Före' })).toHaveFocus()
    await userEvent.tab()
    await expect.element(tab('Uppgifter')).toHaveFocus()
    await userEvent.keyboard('{End}')
    await selectedAndFocused('Kontakt')
    await userEvent.tab({ shift: true })
    await expect.element(page.getByRole('button', { name: 'Före' })).toHaveFocus()
    await userEvent.tab()
    await expect.element(tab('Kontakt')).toHaveFocus()
  })

  test('Tab leaves the tab list for the panel', async () => {
    await render(<KeyboardTabs />)
    tab('Uppgifter').element().focus()
    await userEvent.tab()
    await expect.element(panel('Uppgifter')).toHaveFocus()
    await userEvent.tab()
    await expect.element(page.getByRole('button', { name: 'Efter' })).toHaveFocus()

    tab('Uppgifter').element().focus()
    await userEvent.keyboard('{End}')
    await selectedAndFocused('Kontakt')
    await userEvent.keyboard('{ArrowLeft}')
    await expect.element(tab('Historik')).toHaveFocus()
    await expect.element(tab('Kontakt')).toHaveAttribute('aria-selected', 'true')
    await userEvent.tab()
    await expect.element(panel('Kontakt')).toHaveFocus()

    tab('Kontakt').element().focus()
    await userEvent.keyboard('{Home}')
    await userEvent.keyboard('{ArrowRight}')
    await selectedAndFocused('Handlingar')
    await userEvent.tab()
    await expect.element(page.getByRole('link', { name: 'Läs beslutet' })).toHaveFocus()
  })

  test('Shift+Tab returns to the selected tab and leaves the list', async () => {
    await render(<KeyboardTabs />)
    tab('Uppgifter').element().focus()
    await userEvent.tab()
    await expect.element(panel('Uppgifter')).toHaveFocus()
    await userEvent.tab({ shift: true })
    await expect.element(tab('Uppgifter')).toHaveFocus()
    await userEvent.tab({ shift: true })
    await expect.element(page.getByRole('button', { name: 'Före' })).toHaveFocus()
  })

  test('ArrowRight and ArrowLeft move, wrap and select', async () => {
    await render(<KeyboardTabs />)
    tab('Uppgifter').element().focus()
    await userEvent.keyboard('{ArrowLeft}')
    await selectedAndFocused('Kontakt')
    await userEvent.keyboard('{ArrowRight}')
    await selectedAndFocused('Uppgifter')
    await userEvent.keyboard('{ArrowRight}')
    await selectedAndFocused('Handlingar')
    await userEvent.keyboard('{ArrowLeft}')
    await selectedAndFocused('Uppgifter')
    await expect.element(tab('Uppgifter')).toHaveAttribute('aria-selected', 'true')
  })

  test('right to left: the arrows flip', async () => {
    await render(
      <div dir="rtl">
        <KeyboardTabs />
      </div>,
    )
    tab('Uppgifter').element().focus()
    await userEvent.keyboard('{ArrowLeft}')
    await selectedAndFocused('Handlingar')
    await userEvent.keyboard('{ArrowRight}')
    await selectedAndFocused('Uppgifter')
    await userEvent.keyboard('{ArrowRight}')
    await selectedAndFocused('Kontakt')
    await expect.element(tab('Kontakt')).toHaveAttribute('aria-selected', 'true')
  })

  test('vertical: ArrowDown and ArrowUp move', async () => {
    await render(<KeyboardTabs orientation="vertical" />)
    await expect.element(page.getByRole('tablist')).toHaveAttribute('aria-orientation', 'vertical')
    tab('Uppgifter').element().focus()
    await userEvent.keyboard('{ArrowDown}')
    await selectedAndFocused('Handlingar')
    await userEvent.keyboard('{ArrowRight}')
    await selectedAndFocused('Handlingar')
    await userEvent.keyboard('{ArrowUp}')
    await selectedAndFocused('Uppgifter')
    await userEvent.keyboard('{ArrowUp}')
    await selectedAndFocused('Kontakt')
    await userEvent.keyboard('{ArrowDown}')
    await selectedAndFocused('Uppgifter')
  })

  test('Home and End go to the ends', async () => {
    await render(<KeyboardTabs />)
    tab('Uppgifter').element().focus()
    await userEvent.keyboard('{End}')
    await selectedAndFocused('Kontakt')
    await userEvent.keyboard('{Home}')
    await selectedAndFocused('Uppgifter')
    await expect.element(tab('Uppgifter')).toHaveAttribute('aria-selected', 'true')
  })

  test('manual activation: arrows move focus, Enter and Space select', async () => {
    await render(<KeyboardTabs activationMode="manual" />)
    tab('Handlingar').element().focus()
    await userEvent.keyboard('{ArrowLeft}')
    await expect.element(tab('Uppgifter')).toHaveFocus()
    await expect.element(tab('Uppgifter')).toHaveAttribute('aria-selected', 'true')
    await expect.element(tab('Handlingar')).toHaveAttribute('aria-selected', 'false')
    await userEvent.keyboard('{End}')
    await expect.element(tab('Kontakt')).toHaveFocus()
    await expect.element(tab('Kontakt')).toHaveAttribute('aria-selected', 'false')
    await userEvent.keyboard('{Enter}')
    await selectedAndFocused('Kontakt')
    await userEvent.keyboard('{Home}')
    await expect.element(tab('Uppgifter')).toHaveFocus()
    await expect.element(tab('Kontakt')).toHaveAttribute('aria-selected', 'true')
    await userEvent.keyboard(' ')
    await selectedAndFocused('Uppgifter')
  })

  test('a disabled tab is reachable and never selected', async () => {
    await render(<KeyboardTabs />)
    tab('Uppgifter').element().focus()
    await userEvent.keyboard('{ArrowRight}')
    await selectedAndFocused('Handlingar')
    await userEvent.keyboard('{ArrowRight}')
    await expect.element(tab('Historik')).toHaveFocus()
    await expect.element(tab('Historik')).toHaveAttribute('aria-disabled', 'true')
    await expect.element(tab('Historik')).toHaveAttribute('aria-selected', 'false')
    await expect.element(tab('Handlingar')).toHaveAttribute('aria-selected', 'true')
    await userEvent.keyboard('{Enter}')
    await userEvent.keyboard(' ')
    await expect.element(tab('Historik')).toHaveAttribute('aria-selected', 'false')
    await expect.element(tab('Handlingar')).toHaveAttribute('aria-selected', 'true')
    await userEvent.keyboard('{ArrowRight}')
    await selectedAndFocused('Kontakt')
  })
})

describe('keys the tabs leave alone', () => {
  test('keys with Control, Alt, Meta or Shift are left alone', async () => {
    await render(<CaseTabs />)
    tab('Uppgifter').element().focus()
    await userEvent.keyboard('{Control>}{ArrowRight}{/Control}')
    await userEvent.keyboard('{Alt>}{ArrowRight}{/Alt}')
    await userEvent.keyboard('{Shift>}{ArrowRight}{/Shift}')
    await userEvent.keyboard('{Control>}{End}{/Control}')
    await expect.element(tab('Uppgifter')).toHaveFocus()
    await expect.element(tab('Uppgifter')).toHaveAttribute('aria-selected', 'true')
  })

  test('a key that was already handled is not taken again', async () => {
    await render(
      <Tabs.Root defaultValue="a">
        <Tabs.List aria-label="Test">
          <Tabs.Tab value="a" onKeyDown={(event) => event.preventDefault()}>
            A
          </Tabs.Tab>
          <Tabs.Tab value="b">B</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="a">Panel A</Tabs.Panel>
        <Tabs.Panel value="b">Panel B</Tabs.Panel>
      </Tabs.Root>,
    )
    tab('A').element().focus()
    await userEvent.keyboard('{ArrowRight}')
    await expect.element(tab('A')).toHaveFocus()
    await expect.element(tab('A')).toHaveAttribute('aria-selected', 'true')
  })

  test('a nested Tabs keeps its own arrows', async () => {
    await render(
      <Tabs.Root defaultValue="yttre-ett">
        <Tabs.List aria-label="Yttre">
          <Tabs.Tab value="yttre-ett" style={fixtureTabStyle}>
            Yttre ett
          </Tabs.Tab>
          <Tabs.Tab value="yttre-tva" style={fixtureTabStyle}>
            Yttre två
          </Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="yttre-ett">
          <Tabs.Root defaultValue="inre-ett">
            <Tabs.List aria-label="Inre">
              <Tabs.Tab value="inre-ett" style={fixtureTabStyle}>
                Inre ett
              </Tabs.Tab>
              <Tabs.Tab value="inre-tva" style={fixtureTabStyle}>
                Inre två
              </Tabs.Tab>
            </Tabs.List>
            <Tabs.Panel value="inre-ett">Första inre panelen.</Tabs.Panel>
            <Tabs.Panel value="inre-tva">Andra inre panelen.</Tabs.Panel>
          </Tabs.Root>
        </Tabs.Panel>
        <Tabs.Panel value="yttre-tva">Andra yttre panelen.</Tabs.Panel>
      </Tabs.Root>,
    )
    tab('Inre ett').element().focus()
    await userEvent.keyboard('{ArrowRight}')
    await expect.element(tab('Inre två')).toHaveFocus()
    await expect.element(tab('Inre två')).toHaveAttribute('aria-selected', 'true')
    // The outer tabs didn't move.
    await expect.element(tab('Yttre ett')).toHaveAttribute('aria-selected', 'true')
    tab('Yttre ett').element().focus()
    await userEvent.keyboard('{ArrowRight}')
    await expect.element(tab('Yttre två')).toHaveAttribute('aria-selected', 'true')
    await expect.element(page.getByRole('tabpanel', { name: 'Yttre två' })).toBeVisible()
  })
})

describe('disabled tabs', () => {
  test('a disabled tab is aria-disabled and not natively disabled, and a click selects nothing and calls nothing', async () => {
    const onClick = vi.fn<() => void>()
    const onValueChange = vi.fn<(value: string, details: TabsChangeDetails) => void>()
    await render(
      <Tabs.Root defaultValue="a" onValueChange={onValueChange}>
        <Tabs.List aria-label="Test">
          <Tabs.Tab value="a" style={fixtureTabStyle}>
            A
          </Tabs.Tab>
          <Tabs.Tab value="b" disabled onClick={onClick} style={fixtureTabStyle}>
            B
          </Tabs.Tab>
          <Tabs.Tab value="c" disabled onClick={onClick} style={fixtureTabStyle}>
            C
          </Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="a">Panel A</Tabs.Panel>
        <Tabs.Panel value="b">Panel B</Tabs.Panel>
        <Tabs.Panel value="c">Panel C</Tabs.Panel>
      </Tabs.Root>,
    )
    for (const name of ['B', 'C']) {
      await expect.element(tab(name)).toHaveAttribute('aria-disabled', 'true')
      await expect.element(tab(name)).not.toHaveAttribute('disabled')
      // `force`: Playwright treats aria-disabled as not enabled, and waits for it otherwise.
      await userEvent.click(tab(name), { force: true })
      // A disabled tab can still take focus: it is discoverable.
      await expect.element(tab(name)).toHaveFocus()
    }
    expect(onClick).not.toHaveBeenCalled()
    expect(onValueChange).not.toHaveBeenCalled()
    await expect.element(tab('A')).toHaveAttribute('aria-selected', 'true')
  })

  test('an enabled tab calls its onClick and selects', async () => {
    const onClick = vi.fn<() => void>()
    await render(
      <Tabs.Root defaultValue="a">
        <Tabs.List aria-label="Test">
          <Tabs.Tab value="a">A</Tabs.Tab>
          <Tabs.Tab value="b" onClick={onClick}>
            B
          </Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="a">Panel A</Tabs.Panel>
        <Tabs.Panel value="b">Panel B</Tabs.Panel>
      </Tabs.Root>,
    )
    await userEvent.click(tab('B'))
    expect(onClick).toHaveBeenCalledTimes(1)
    await expect.element(tab('B')).toHaveAttribute('aria-selected', 'true')
  })
})

describe('useTabs', () => {
  const hookValues = ['ett', 'tva', 'tre']

  function HookTabs({ onDisabledClick }: { onDisabledClick?: () => void }) {
    const tabs = useTabs({ defaultValue: 'ett' })
    return (
      <div {...tabs.rootProps}>
        <p>Vald: {tabs.value}</p>
        <div {...tabs.listProps} aria-label="Egen">
          {hookValues.map((value) => (
            <button
              key={value}
              {...tabs.getTabProps(value, {
                disabled: value === 'tre',
                onClick: value === 'tre' ? onDisabledClick : undefined,
              })}
              style={fixtureTabStyle}
            >
              {value}
            </button>
          ))}
        </div>
        {hookValues.map((value) => (
          <div key={value} {...tabs.getPanelProps(value)}>
            Panelen {value}
          </div>
        ))}
      </div>
    )
  }

  test('gives props for your own elements: roles, ids, the roving tabindex and selection', async () => {
    const onDisabledClick = vi.fn<() => void>()
    const { container } = await render(<HookTabs onDisabledClick={onDisabledClick} />)
    await expect.element(page.getByRole('tablist', { name: 'Egen' })).toBeVisible()
    expect(tabIndexOf('ett')).toBe('0')
    expect(tabIndexOf('tva')).toBe('-1')
    await userEvent.click(tab('tva'))
    await expect.element(page.getByText('Vald: tva')).toBeVisible()
    await expect.element(tab('tva')).toHaveAttribute('aria-selected', 'true')
    await expect.element(page.getByRole('tabpanel', { name: 'tva' })).toBeVisible()
    // Arrow keys: the list's handler works on your own elements too.
    await userEvent.keyboard('{ArrowRight}')
    await expect.element(tab('tre')).toHaveFocus()
    await expect.element(tab('tre')).toHaveAttribute('aria-selected', 'false')
    await expectNoA11yViolations(container)
  })

  test('getTabProps gates onClick for a disabled tab, as useButton does', async () => {
    const onDisabledClick = vi.fn<() => void>()
    await render(<HookTabs onDisabledClick={onDisabledClick} />)
    await expect.element(tab('tre')).toHaveAttribute('aria-disabled', 'true')
    await userEvent.click(tab('tre'), { force: true })
    expect(onDisabledClick).not.toHaveBeenCalled()
    await expect.element(tab('ett')).toHaveAttribute('aria-selected', 'true')
  })
})

describe('server rendering', () => {
  const attribute = (tag: string | undefined, name: string) =>
    new RegExp(`\\s${name}="([^"]*)"`).exec(tag ?? '')?.[1]

  test('renders the ids, the hidden panels and the roving tabindex without touching the page', () => {
    const html = renderToString(<CaseTabs defaultValue="handlingar" />)
    expect(html).toContain('role="tablist"')
    const tabs = html.match(/<button[^>]*>/g) ?? []
    const panels = html.match(/<div[^>]*role="tabpanel"[^>]*>/g) ?? []
    expect(tabs).toHaveLength(3)
    expect(panels).toHaveLength(3)
    // The selected tab is the one Tab stop on the server's first render, before anything registers.
    expect(tabs.map((tag) => attribute(tag, 'tabindex'))).toEqual(['-1', '0', '-1'])
    expect(tabs.map((tag) => attribute(tag, 'aria-selected'))).toEqual(['false', 'true', 'false'])
    expect(panels.map((tag) => tag.includes(' hidden=""'))).toEqual([true, false, true])
    // The tab and its panel point at each other already.
    tabs.forEach((tag, index) => {
      expect(attribute(tag, 'id')).toBeTruthy()
      expect(attribute(tag, 'aria-controls')).toBe(attribute(panels[index], 'id'))
      expect(attribute(panels[index], 'aria-labelledby')).toBe(attribute(tag, 'id'))
    })
  })
})

describe('development warnings', () => {
  const warnings = () => consoleWarn.mock.calls.map((call) => String(call[0]))

  test('a part outside a Tabs.Root warns and still renders', async () => {
    await render(
      <>
        <Tabs.List aria-label="Ensam lista" />
        <Tabs.Tab value="a">Ensam flik</Tabs.Tab>
        <Tabs.Panel value="a">Ensam panel</Tabs.Panel>
      </>,
    )
    await expect.element(page.getByText('Ensam flik')).toBeVisible()
    await expect.element(page.getByText('Ensam panel')).toBeVisible()
    expect(consoleWarn).toHaveBeenCalledTimes(3)
    for (const part of ['Tabs.List', 'Tabs.Tab', 'Tabs.Panel']) {
      expect(warnings().some((text) => text.includes(part))).toBe(true)
    }
  })

  test('a value that no tab has: no Tab stop, and nothing shown', async () => {
    await render(<CaseTabs defaultValue="saknas" />)
    await expect.element(page.getByRole('tablist')).toBeVisible()
    expect(consoleWarn).toHaveBeenCalledTimes(1)
    expect(warnings()[0]).toContain('"saknas"')
    expect(tabStops()).toBe(0)
    expect(page.getByRole('tabpanel').elements()).toHaveLength(0)
  })

  test('a tab without a panel, and a panel without a tab', async () => {
    await render(
      <Tabs.Root defaultValue="a">
        <Tabs.List aria-label="Test">
          <Tabs.Tab value="a">A</Tabs.Tab>
          <Tabs.Tab value="b">B</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="a">Panel A</Tabs.Panel>
        <Tabs.Panel value="c">Panel C</Tabs.Panel>
      </Tabs.Root>,
    )
    await expect.element(page.getByRole('tablist')).toBeVisible()
    expect(consoleWarn).toHaveBeenCalledTimes(2)
    expect(warnings().some((text) => text.includes('"b"') && text.includes('Tabs.Panel'))).toBe(
      true,
    )
    expect(warnings().some((text) => text.includes('"c"') && text.includes('Tabs.Tab'))).toBe(true)
  })
})

describe('accessibility', () => {
  test('no axe violations: automatic activation', async () => {
    const { container } = await render(<CaseTabs />)
    expect(container.querySelector('[role="tablist"]')).not.toBeNull()
    await expectNoA11yViolations(container)
  })

  test('no axe violations: manual activation', async () => {
    const { container } = await render(<CaseTabs activationMode="manual" />)
    expect(container.querySelector('[role="tablist"]')).not.toBeNull()
    await expectNoA11yViolations(container)
  })

  test('no axe violations: vertical', async () => {
    const { container } = await render(<CaseTabs orientation="vertical" />)
    expect(container.querySelector('[role="tablist"]')).not.toBeNull()
    await expectNoA11yViolations(container)
  })

  test('no axe violations: a disabled tab, and a tab with a long label', async () => {
    const { container } = await render(
      <Tabs.Root defaultValue="a">
        <Tabs.List aria-label="Ansökan">
          <Tabs.Tab value="a" style={fixtureTabStyle}>
            Rakennus- ja toimenpidelupahakemuksen liitteet
          </Tabs.Tab>
          <Tabs.Tab value="b" disabled style={fixtureTabStyle}>
            Päätös
          </Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="a">Liitteet.</Tabs.Panel>
        <Tabs.Panel value="b">Päätös.</Tabs.Panel>
      </Tabs.Root>,
    )
    await expectNoA11yViolations(container)
    expect(consoleWarn).not.toHaveBeenCalled()
  })
})

describe('types', () => {
  test('exports the hook and part types', () => {
    expectTypeOf<TabsRootPartProps['className']>().toEqualTypeOf<'kv-tabs'>()
    expectTypeOf<TabsListPartProps['className']>().toEqualTypeOf<'kv-tabs-list'>()
    expectTypeOf<TabsListPartProps['role']>().toEqualTypeOf<'tablist'>()
    expectTypeOf<TabsTabPartProps['className']>().toEqualTypeOf<'kv-tabs-tab'>()
    expectTypeOf<TabsTabPartProps['role']>().toEqualTypeOf<'tab'>()
    expectTypeOf<TabsTabPartProps['tabIndex']>().toEqualTypeOf<0 | -1>()
    expectTypeOf<TabsPanelPartProps['className']>().toEqualTypeOf<'kv-tabs-panel'>()
    expectTypeOf<TabsPanelPartProps['role']>().toEqualTypeOf<'tabpanel'>()
    expectTypeOf<TabsActivationMode>().toEqualTypeOf<'automatic' | 'manual'>()
    expectTypeOf<TabsChangeReason>().toEqualTypeOf<'press' | 'arrow-key' | 'home-end-key'>()
    expectTypeOf<TabsChangeDetails['reason']>().toEqualTypeOf<TabsChangeReason>()
    expectTypeOf<UseTabsResult['value']>().toEqualTypeOf<string>()
  })

  test('one of value and defaultValue is required, and the roles and ids come from the parts', () => {
    expectTypeOf<{ defaultValue: 'a' }>().toExtend<UseTabsOptions>()
    expectTypeOf<{ value: 'a'; onValueChange: () => void }>().toExtend<UseTabsOptions>()
    expectTypeOf<{ activationMode: 'manual' }>().not.toExtend<UseTabsOptions>()
    expectTypeOf<TabsRootProps>().toHaveProperty('onValueChange')
    expectTypeOf<TabsTabProps>().not.toHaveProperty('role')
    expectTypeOf<TabsTabProps>().not.toHaveProperty('aria-selected')
    expectTypeOf<TabsTabProps>().not.toHaveProperty('aria-controls')
    expectTypeOf<TabsTabProps>().not.toHaveProperty('type')
    expectTypeOf<TabsTabProps>().not.toHaveProperty('id')
    expectTypeOf<TabsPanelProps>().not.toHaveProperty('role')
    expectTypeOf<TabsPanelProps>().not.toHaveProperty('aria-labelledby')
    expectTypeOf<TabsPanelProps>().not.toHaveProperty('id')
    expectTypeOf<TabsListProps>().not.toHaveProperty('role')
    expectTypeOf<TabsListProps>().not.toHaveProperty('aria-orientation')
  })
})
