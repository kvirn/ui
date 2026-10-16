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
  defaultValue = 'details',
  onValueChange,
  activationMode,
  orientation,
}: CaseTabsProps) {
  const parts = (
    <>
      <Tabs.List aria-label="The case">
        <Tabs.Tab value="details" style={fixtureTabStyle}>
          Details
        </Tabs.Tab>
        <Tabs.Tab value="documents" style={fixtureTabStyle}>
          Documents
        </Tabs.Tab>
        <Tabs.Tab value="history" style={fixtureTabStyle}>
          History
        </Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel value="details">The details of the case.</Tabs.Panel>
      <Tabs.Panel value="documents">The documents in the case.</Tabs.Panel>
      <Tabs.Panel value="history">The history of the case.</Tabs.Panel>
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
    const list = page.getByRole('tablist', { name: 'The case' })
    await expect.element(list).toBeVisible()
    expect(page.getByRole('tab').elements()).toHaveLength(3)
    await expect.element(tab('Details')).toBeVisible()
    await expect.element(page.getByRole('tabpanel', { name: 'Details' })).toBeVisible()
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
    await render(<CaseTabs defaultValue="documents" />)
    const selected = page
      .getByRole('tab')
      .elements()
      .map((element) => element.getAttribute('aria-selected'))
    expect(selected).toEqual(['false', 'true', 'false'])
  })

  test('every tab controls its panel and every panel is named by its tab, for values with spaces and punctuation too', async () => {
    const values = ['Build and live', "a:b'c", 'a_b', 'a_5f_b']
    await render(
      <Tabs.Root defaultValue="Build and live">
        <Tabs.List aria-label="Topics">
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
      <Tabs.Root defaultValue="a" className="own-rot" data-own="rot">
        <Tabs.List aria-label="Test" className="own-list">
          <Tabs.Tab value="a" className="own-tab">
            A
          </Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="a" className="own-panel">
          Panel A
        </Tabs.Panel>
      </Tabs.Root>,
    )
    const root = container.firstElementChild
    expect(root?.classList.contains('kv-tabs')).toBe(true)
    expect(root?.classList.contains('own-rot')).toBe(true)
    expect(root?.getAttribute('data-own')).toBe('rot')
    await expect.element(page.getByRole('tablist')).toHaveClass('kv-tabs-list', 'own-list')
    await expect.element(tab('A')).toHaveClass('kv-tabs-tab', 'own-tab')
    await expect.element(page.getByRole('tabpanel')).toHaveClass('kv-tabs-panel', 'own-panel')
  })

  test('forwards refs and passes props on', async () => {
    const rootRef = createRef<HTMLDivElement>()
    const listRef = createRef<HTMLDivElement>()
    const tabRef = createRef<HTMLButtonElement>()
    const panelRef = createRef<HTMLDivElement>()
    await render(
      <Tabs.Root ref={rootRef} defaultValue="a" orientation="vertical" activationMode="manual">
        <Tabs.List ref={listRef} aria-label="Test" data-own="list">
          <Tabs.Tab ref={tabRef} value="a">
            A
          </Tabs.Tab>
          <Tabs.Tab value="b" data-own="tab">
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
    await expect.element(page.getByRole('tablist')).toHaveAttribute('data-own', 'list')
    expect(tabRef.current).toBe(tab('A').element())
    await expect.element(tab('B')).toHaveAttribute('data-own', 'tab')
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
          <a href="#contact">Contact</a>
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
    await render(<CaseTabs defaultValue="documents" />)
    expect(tabIndexOf('Details')).toBe('-1')
    expect(tabIndexOf('Documents')).toBe('0')
    expect(tabIndexOf('History')).toBe('-1')
    expect(tabStops()).toBe(1)
  })

  test('a tab that has focus is the Tab stop while focus is in the list, and the selected tab is again once it leaves', async () => {
    await render(<CaseTabs activationMode="manual" defaultValue="documents" />)
    // Manual activation: focus moves to a tab without selecting it.
    tab('Details').element().focus()
    await expect.element(tab('Details')).toHaveAttribute('tabindex', '0')
    await expect.element(tab('Documents')).toHaveAttribute('tabindex', '-1')
    expect(tabStops()).toBe(1)
    await expect.element(tab('Documents')).toHaveAttribute('aria-selected', 'true')
    tab('Details').element().blur()
    await expect.element(tab('Documents')).toHaveAttribute('tabindex', '0')
    await expect.element(tab('Details')).toHaveAttribute('tabindex', '-1')
    expect(tabStops()).toBe(1)
  })

  test('a tab that a pointer selects is the Tab stop', async () => {
    await render(<CaseTabs />)
    await userEvent.click(tab('History'))
    await expect.element(tab('History')).toHaveAttribute('tabindex', '0')
    expect(tabIndexOf('Details')).toBe('-1')
    expect(tabStops()).toBe(1)
  })
})

describe('selection', () => {
  test('uncontrolled: a click selects the tab and shows its panel', async () => {
    await render(<CaseTabs />)
    await userEvent.click(tab('Documents'))
    await expect.element(tab('Documents')).toHaveAttribute('aria-selected', 'true')
    await expect.element(tab('Details')).toHaveAttribute('aria-selected', 'false')
    await expect.element(page.getByRole('tabpanel', { name: 'Documents' })).toBeVisible()
    expect(page.getByRole('tabpanel').elements()).toHaveLength(1)
  })

  test('controlled: value decides what is selected, and a change from outside moves the selection', async () => {
    function Controlled() {
      const [value, setValue] = useState('details')
      return (
        <>
          <button type="button" style={fixtureTabStyle} onClick={() => setValue('history')}>
            Show history
          </button>
          <CaseTabs value={value} onValueChange={(next) => setValue(next)} />
        </>
      )
    }
    await render(<Controlled />)
    await userEvent.click(tab('Documents'))
    await expect.element(tab('Documents')).toHaveAttribute('aria-selected', 'true')
    await userEvent.click(page.getByRole('button', { name: 'Show history' }))
    await expect.element(tab('History')).toHaveAttribute('aria-selected', 'true')
    await expect.element(tab('Documents')).toHaveAttribute('aria-selected', 'false')
    await expect.element(page.getByRole('tabpanel', { name: 'History' })).toBeVisible()
  })

  test('a controlled owner that refuses keeps the selection, and focus still moves', async () => {
    const onValueChange = vi.fn<(value: string, details: TabsChangeDetails) => void>()
    await render(<CaseTabs value="details" onValueChange={onValueChange} />)
    await userEvent.click(tab('Documents'))
    expect(onValueChange).toHaveBeenCalledTimes(1)
    await expect.element(tab('Details')).toHaveAttribute('aria-selected', 'true')
    await expect.element(tab('Documents')).toHaveAttribute('aria-selected', 'false')
    await expect.element(page.getByRole('tabpanel', { name: 'Details' })).toBeVisible()
    // Focus is on a tab that is not selected, so it is the Tab stop while it has focus.
    await expect.element(tab('Documents')).toHaveFocus()
    await expect.element(tab('Documents')).toHaveAttribute('tabindex', '0')
  })

  test('onValueChange reports the value, the reason and the event: press, arrow-key and home-end-key', async () => {
    const onValueChange = vi.fn<(value: string, details: TabsChangeDetails) => void>()
    await render(<CaseTabs onValueChange={onValueChange} />)
    await userEvent.click(tab('Documents'))
    await userEvent.keyboard('{ArrowRight}')
    await userEvent.keyboard('{Home}')
    await userEvent.keyboard('{End}')
    expect(onValueChange.mock.calls.map(([value, details]) => [value, details.reason])).toEqual([
      ['documents', 'press'],
      ['history', 'arrow-key'],
      ['details', 'home-end-key'],
      ['history', 'home-end-key'],
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
    await userEvent.click(tab('Details'))
    expect(onValueChange).not.toHaveBeenCalled()
  })

  test('manual activation: Enter selects through the click, with the reason press', async () => {
    const onValueChange = vi.fn<(value: string, details: TabsChangeDetails) => void>()
    await render(<CaseTabs activationMode="manual" onValueChange={onValueChange} />)
    tab('Details').element().focus()
    await userEvent.keyboard('{ArrowRight}')
    expect(onValueChange).not.toHaveBeenCalled()
    await expect.element(tab('Documents')).toHaveFocus()
    await userEvent.keyboard('{Enter}')
    expect(onValueChange.mock.calls.map(([value, details]) => [value, details.reason])).toEqual([
      ['documents', 'press'],
    ])
    await expect.element(tab('Documents')).toHaveAttribute('aria-selected', 'true')
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
        <button type="button">Before</button>
        <Tabs.Root defaultValue="details" activationMode={activationMode} orientation={orientation}>
          <Tabs.List aria-label="The case">
            <Tabs.Tab value="details" style={fixtureTabStyle}>
              Details
            </Tabs.Tab>
            <Tabs.Tab value="documents" style={fixtureTabStyle}>
              Documents
            </Tabs.Tab>
            <Tabs.Tab value="history" disabled style={fixtureTabStyle}>
              History
            </Tabs.Tab>
            <Tabs.Tab value="contact" style={fixtureTabStyle}>
              Contact
            </Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel value="details">The details of the case.</Tabs.Panel>
          <Tabs.Panel value="documents" tabIndex={-1}>
            <a href="#decision">Read the decision</a>
          </Tabs.Panel>
          <Tabs.Panel value="history">The history of the case.</Tabs.Panel>
          <Tabs.Panel value="contact">Contact details.</Tabs.Panel>
        </Tabs.Root>
        <button type="button">After</button>
      </>
    )
  }

  test('Tab enters at the selected tab', async () => {
    await render(<KeyboardTabs />)
    await userEvent.tab()
    await expect.element(page.getByRole('button', { name: 'Before' })).toHaveFocus()
    await userEvent.tab()
    await expect.element(tab('Details')).toHaveFocus()
    await userEvent.keyboard('{End}')
    await selectedAndFocused('Contact')
    await userEvent.tab({ shift: true })
    await expect.element(page.getByRole('button', { name: 'Before' })).toHaveFocus()
    await userEvent.tab()
    await expect.element(tab('Contact')).toHaveFocus()
  })

  test('Tab leaves the tab list for the panel', async () => {
    await render(<KeyboardTabs />)
    tab('Details').element().focus()
    await userEvent.tab()
    await expect.element(panel('Details')).toHaveFocus()
    await userEvent.tab()
    await expect.element(page.getByRole('button', { name: 'After' })).toHaveFocus()

    tab('Details').element().focus()
    await userEvent.keyboard('{End}')
    await selectedAndFocused('Contact')
    await userEvent.keyboard('{ArrowLeft}')
    await expect.element(tab('History')).toHaveFocus()
    await expect.element(tab('Contact')).toHaveAttribute('aria-selected', 'true')
    await userEvent.tab()
    await expect.element(panel('Contact')).toHaveFocus()

    tab('Contact').element().focus()
    await userEvent.keyboard('{Home}')
    await userEvent.keyboard('{ArrowRight}')
    await selectedAndFocused('Documents')
    await userEvent.tab()
    await expect.element(page.getByRole('link', { name: 'Read the decision' })).toHaveFocus()
  })

  test('Shift+Tab returns to the selected tab and leaves the list', async () => {
    await render(<KeyboardTabs />)
    tab('Details').element().focus()
    await userEvent.tab()
    await expect.element(panel('Details')).toHaveFocus()
    await userEvent.tab({ shift: true })
    await expect.element(tab('Details')).toHaveFocus()
    await userEvent.tab({ shift: true })
    await expect.element(page.getByRole('button', { name: 'Before' })).toHaveFocus()
  })

  test('ArrowRight and ArrowLeft move, wrap and select', async () => {
    await render(<KeyboardTabs />)
    tab('Details').element().focus()
    await userEvent.keyboard('{ArrowLeft}')
    await selectedAndFocused('Contact')
    await userEvent.keyboard('{ArrowRight}')
    await selectedAndFocused('Details')
    await userEvent.keyboard('{ArrowRight}')
    await selectedAndFocused('Documents')
    await userEvent.keyboard('{ArrowLeft}')
    await selectedAndFocused('Details')
    await expect.element(tab('Details')).toHaveAttribute('aria-selected', 'true')
  })

  test('right to left: the arrows flip', async () => {
    await render(
      <div dir="rtl">
        <KeyboardTabs />
      </div>,
    )
    tab('Details').element().focus()
    await userEvent.keyboard('{ArrowLeft}')
    await selectedAndFocused('Documents')
    await userEvent.keyboard('{ArrowRight}')
    await selectedAndFocused('Details')
    await userEvent.keyboard('{ArrowRight}')
    await selectedAndFocused('Contact')
    await expect.element(tab('Contact')).toHaveAttribute('aria-selected', 'true')
  })

  test('vertical: ArrowDown and ArrowUp move', async () => {
    await render(<KeyboardTabs orientation="vertical" />)
    await expect.element(page.getByRole('tablist')).toHaveAttribute('aria-orientation', 'vertical')
    tab('Details').element().focus()
    await userEvent.keyboard('{ArrowDown}')
    await selectedAndFocused('Documents')
    await userEvent.keyboard('{ArrowRight}')
    await selectedAndFocused('Documents')
    await userEvent.keyboard('{ArrowUp}')
    await selectedAndFocused('Details')
    await userEvent.keyboard('{ArrowUp}')
    await selectedAndFocused('Contact')
    await userEvent.keyboard('{ArrowDown}')
    await selectedAndFocused('Details')
  })

  test('Home and End go to the ends', async () => {
    await render(<KeyboardTabs />)
    tab('Details').element().focus()
    await userEvent.keyboard('{End}')
    await selectedAndFocused('Contact')
    await userEvent.keyboard('{Home}')
    await selectedAndFocused('Details')
    await expect.element(tab('Details')).toHaveAttribute('aria-selected', 'true')
  })

  test('manual activation: arrows move focus, Enter and Space select', async () => {
    await render(<KeyboardTabs activationMode="manual" />)
    tab('Documents').element().focus()
    await userEvent.keyboard('{ArrowLeft}')
    await expect.element(tab('Details')).toHaveFocus()
    await expect.element(tab('Details')).toHaveAttribute('aria-selected', 'true')
    await expect.element(tab('Documents')).toHaveAttribute('aria-selected', 'false')
    await userEvent.keyboard('{End}')
    await expect.element(tab('Contact')).toHaveFocus()
    await expect.element(tab('Contact')).toHaveAttribute('aria-selected', 'false')
    await userEvent.keyboard('{Enter}')
    await selectedAndFocused('Contact')
    await userEvent.keyboard('{Home}')
    await expect.element(tab('Details')).toHaveFocus()
    await expect.element(tab('Contact')).toHaveAttribute('aria-selected', 'true')
    await userEvent.keyboard(' ')
    await selectedAndFocused('Details')
  })

  test('a disabled tab is reachable and never selected', async () => {
    await render(<KeyboardTabs />)
    tab('Details').element().focus()
    await userEvent.keyboard('{ArrowRight}')
    await selectedAndFocused('Documents')
    await userEvent.keyboard('{ArrowRight}')
    await expect.element(tab('History')).toHaveFocus()
    await expect.element(tab('History')).toHaveAttribute('aria-disabled', 'true')
    await expect.element(tab('History')).toHaveAttribute('aria-selected', 'false')
    await expect.element(tab('Documents')).toHaveAttribute('aria-selected', 'true')
    await userEvent.keyboard('{Enter}')
    await userEvent.keyboard(' ')
    await expect.element(tab('History')).toHaveAttribute('aria-selected', 'false')
    await expect.element(tab('Documents')).toHaveAttribute('aria-selected', 'true')
    await userEvent.keyboard('{ArrowRight}')
    await selectedAndFocused('Contact')
  })
})

describe('keys the tabs leave alone', () => {
  test('keys with Control, Alt, Meta or Shift are left alone', async () => {
    await render(<CaseTabs />)
    tab('Details').element().focus()
    await userEvent.keyboard('{Control>}{ArrowRight}{/Control}')
    await userEvent.keyboard('{Alt>}{ArrowRight}{/Alt}')
    await userEvent.keyboard('{Shift>}{ArrowRight}{/Shift}')
    await userEvent.keyboard('{Control>}{End}{/Control}')
    await expect.element(tab('Details')).toHaveFocus()
    await expect.element(tab('Details')).toHaveAttribute('aria-selected', 'true')
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
      <Tabs.Root defaultValue="outer-one">
        <Tabs.List aria-label="Outer">
          <Tabs.Tab value="outer-one" style={fixtureTabStyle}>
            Outer one
          </Tabs.Tab>
          <Tabs.Tab value="outer-two" style={fixtureTabStyle}>
            Outer two
          </Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="outer-one">
          <Tabs.Root defaultValue="inner-one">
            <Tabs.List aria-label="Inner">
              <Tabs.Tab value="inner-one" style={fixtureTabStyle}>
                Inner one
              </Tabs.Tab>
              <Tabs.Tab value="inner-two" style={fixtureTabStyle}>
                Inner two
              </Tabs.Tab>
            </Tabs.List>
            <Tabs.Panel value="inner-one">First inner panel.</Tabs.Panel>
            <Tabs.Panel value="inner-two">Second inner panel.</Tabs.Panel>
          </Tabs.Root>
        </Tabs.Panel>
        <Tabs.Panel value="outer-two">Second outer panel.</Tabs.Panel>
      </Tabs.Root>,
    )
    tab('Inner one').element().focus()
    await userEvent.keyboard('{ArrowRight}')
    await expect.element(tab('Inner two')).toHaveFocus()
    await expect.element(tab('Inner two')).toHaveAttribute('aria-selected', 'true')
    // The outer tabs didn't move.
    await expect.element(tab('Outer one')).toHaveAttribute('aria-selected', 'true')
    tab('Outer one').element().focus()
    await userEvent.keyboard('{ArrowRight}')
    await expect.element(tab('Outer two')).toHaveAttribute('aria-selected', 'true')
    await expect.element(page.getByRole('tabpanel', { name: 'Outer two' })).toBeVisible()
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
  const hookValues = ['one', 'two', 'three']

  function HookTabs({ onDisabledClick }: { onDisabledClick?: () => void }) {
    const tabs = useTabs({ defaultValue: 'one' })
    return (
      <div {...tabs.rootProps}>
        <p>Selected: {tabs.value}</p>
        <div {...tabs.listProps} aria-label="Own">
          {hookValues.map((value) => (
            <button
              key={value}
              {...tabs.getTabProps(value, {
                disabled: value === 'three',
                onClick: value === 'three' ? onDisabledClick : undefined,
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
    await expect.element(page.getByRole('tablist', { name: 'Own' })).toBeVisible()
    expect(tabIndexOf('one')).toBe('0')
    expect(tabIndexOf('two')).toBe('-1')
    await userEvent.click(tab('two'))
    await expect.element(page.getByText('Selected: two')).toBeVisible()
    await expect.element(tab('two')).toHaveAttribute('aria-selected', 'true')
    await expect.element(page.getByRole('tabpanel', { name: 'two' })).toBeVisible()
    // Arrow keys: the list's handler works on your own elements too.
    await userEvent.keyboard('{ArrowRight}')
    await expect.element(tab('three')).toHaveFocus()
    await expect.element(tab('three')).toHaveAttribute('aria-selected', 'false')
    await expectNoA11yViolations(container)
  })

  test('getTabProps gates onClick for a disabled tab, as useButton does', async () => {
    const onDisabledClick = vi.fn<() => void>()
    await render(<HookTabs onDisabledClick={onDisabledClick} />)
    await expect.element(tab('three')).toHaveAttribute('aria-disabled', 'true')
    await userEvent.click(tab('three'), { force: true })
    expect(onDisabledClick).not.toHaveBeenCalled()
    await expect.element(tab('one')).toHaveAttribute('aria-selected', 'true')
  })
})

describe('server rendering', () => {
  const attribute = (tag: string | undefined, name: string) =>
    new RegExp(`\\s${name}="([^"]*)"`).exec(tag ?? '')?.[1]

  test('renders the ids, the hidden panels and the roving tabindex without touching the page', () => {
    const html = renderToString(<CaseTabs defaultValue="documents" />)
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
        <Tabs.List aria-label="Alone list" />
        <Tabs.Tab value="a">Alone tab</Tabs.Tab>
        <Tabs.Panel value="a">Alone panel</Tabs.Panel>
      </>,
    )
    await expect.element(page.getByText('Alone tab')).toBeVisible()
    await expect.element(page.getByText('Alone panel')).toBeVisible()
    expect(consoleWarn).toHaveBeenCalledTimes(3)
    for (const part of ['Tabs.List', 'Tabs.Tab', 'Tabs.Panel']) {
      expect(warnings().some((text) => text.includes(part))).toBe(true)
    }
  })

  test('a value that no tab has: no Tab stop, and nothing shown', async () => {
    await render(<CaseTabs defaultValue="missing" />)
    await expect.element(page.getByRole('tablist')).toBeVisible()
    expect(consoleWarn).toHaveBeenCalledTimes(1)
    expect(warnings()[0]).toContain('"missing"')
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
        <Tabs.List aria-label="Application">
          <Tabs.Tab value="a" style={fixtureTabStyle}>
            Attachments to the building and construction permit application
          </Tabs.Tab>
          <Tabs.Tab value="b" disabled style={fixtureTabStyle}>
            Decision
          </Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="a">Attachments.</Tabs.Panel>
        <Tabs.Panel value="b">Decision.</Tabs.Panel>
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
