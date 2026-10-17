import { SkipPanel } from '@kvirn-ui/react'
import {
  SkipPanelCollapsed,
  SkipPanelDefault,
  SkipPanelForcedColors,
  SkipPanelKeyboard,
  SkipPanelNarrow,
  SkipPanelReopened,
  SkipPanelRtl,
  SkipPanelShortcutsDisabled,
  SkipPanelWithShortcuts,
} from './skip-panel.fixture.tsx'
import contract from '../../../../../packages/react/src/skip-panel/skip-panel.a11y.md?raw'
import guide from '../../../../../packages/react/src/skip-panel/skip-panel.md?raw'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { showSource, usageGuide } from '../../docs-source.ts'
import {
  chromeViewports,
  narrowGlobals,
  wideGlobals,
} from '../../patterns/patterns-story-support.tsx'
import { inDocsFrame } from '../error-summary/error-summary.fixture.tsx'
import { expectNoHorizontalOverflow } from '../theme-story-assertions.ts'

// Components/SkipPanel: the headless SkipPanel, styled by @kvirn-ui/theme (contract:
// skip-panel.a11y.md). The panel is hidden until focus is inside it, so every story is a fixture:
// the panel, a line with a Home link, and the main content. The panel is fixed to the top of the
// window, as on a real site. Each story writes the whole thing out, so its code stands alone. Press Tab in the canvas to show it. The ids start with the story's name: an
// id is unique on a page, and a Docs page shows every story in one document.

const meta = {
  title: 'Components/Navigation/SkipPanel',
  component: SkipPanel.Root,
  globals: { ...wideGlobals, locale: 'en' },
  parameters: {
    viewport: { options: chromeViewports },
    a11yContract: contract,
    docs: { description: { component: usageGuide(guide) } },
  },
} satisfies Meta<typeof SkipPanel.Root>

export default meta
type Story = StoryObj<typeof meta>

function panelOf(canvasElement: HTMLElement) {
  const panel = canvasElement.querySelector<HTMLElement>('.kv-skip-panel')
  if (panel === null) {
    throw new Error('The skip panel is not rendered')
  }
  return panel
}

// A play function that moves focus drags a Docs page with it, so there the stories skip their play.
type Play = NonNullable<Story['play']>
const playUnlessDocs =
  (play: Play): Play =>
  async (context) => {
    if (context.viewMode === 'docs' || inDocsFrame()) {
      return
    }
    await play(context)
  }

// The test runner's frame can't take the hash navigation of a followed link (it closes the browser
// connection), so the play functions that press Enter on a link stop the jump.
function keepFrameStill(panel: HTMLElement) {
  panel.addEventListener('click', (event) => {
    if (event.target instanceof HTMLElement && event.target.closest('a') !== null) {
      event.preventDefault()
    }
  })
}

async function expectHidden(element: HTMLElement) {
  const { width, height } = element.getBoundingClientRect()
  await expect(width).toBeLessThanOrEqual(1)
  await expect(height).toBeLessThanOrEqual(1)
}

async function expectUncovered(element: HTMLElement) {
  element.scrollIntoView({ block: 'nearest', inline: 'nearest' })
  const { left, top, width, height } = element.getBoundingClientRect()
  const hit = document.elementFromPoint(left + width / 2, top + height / 2)
  await expect(hit !== null && element.contains(hit)).toBe(true)
}

async function expectShown(element: HTMLElement) {
  const { width, height } = element.getBoundingClientRect()
  await expect(width).toBeGreaterThanOrEqual(24)
  await expect(height).toBeGreaterThanOrEqual(24)
  await expectUncovered(element)
}

async function expectTabbedOut(panel: HTMLElement, home: HTMLElement) {
  await expect(home).toHaveFocus()
  await expectHidden(panel)
  await expectUncovered(home)
}

async function pressTimes(key: string, count: number) {
  for (let stop = 0; stop < count; stop += 1) {
    await userEvent.keyboard(`{${key}}`)
  }
}

/** Press Tab: the panel is the first stop and shows the skip links. The arrow keys move between them, and the next Tab leaves the panel. */
export const Default: Story = {
  parameters: showSource('skip-panel/skip-panel.fixture.tsx', 'SkipPanelDefault'),
  render: () => <SkipPanelDefault />,
  play: playUnlessDocs(async ({ canvas, canvasElement }) => {
    const panel = panelOf(canvasElement)
    await expectHidden(panel)
    await userEvent.tab()
    const mainContent = within(panel).getByRole('link', { name: 'Main content' })
    await expect(mainContent).toHaveFocus()
    await expectShown(mainContent)
    await pressTimes('ArrowDown', 1)
    await expectShown(within(panel).getByRole('link', { name: 'Site navigation' }))
    await userEvent.tab()
    await expectTabbedOut(panel, canvas.getByRole('link', { name: 'Home' }))
  }),
}

/** Shortcut rows show their keys. The row and its chord run the same action, and the hint names the reopen chord. */
export const WithShortcuts: Story = {
  parameters: showSource('skip-panel/skip-panel.fixture.tsx', 'SkipPanelWithShortcuts'),
  render: () => <SkipPanelWithShortcuts />,
  play: playUnlessDocs(async ({ canvas, canvasElement }) => {
    const panel = panelOf(canvasElement)
    const contact = canvas.getByRole('link', { name: 'Contact us' })
    await userEvent.tab()
    await pressTimes('ArrowDown', 2)
    const row = within(panel).getByRole('button', { name: /Contact us/ })
    await expect(row).toHaveFocus()
    await expectShown(row)
    await userEvent.keyboard('{Enter}')
    await expect(contact).toHaveFocus()
    await expectHidden(panel)
    await expectUncovered(contact)
    canvas.getByRole('link', { name: 'Home' }).focus()
    await userEvent.keyboard('{Alt>}{Shift>}c{/Shift}{/Alt}')
    await expect(contact).toHaveFocus()
    await expectHidden(panel)
  }),
}

/** The reopen chord shows the panel again from anywhere on the page, and Escape returns focus to where you were. */
export const Reopened: Story = {
  parameters: showSource('skip-panel/skip-panel.fixture.tsx', 'SkipPanelReopened'),
  render: () => <SkipPanelReopened />,
  play: playUnlessDocs(async ({ canvas, canvasElement }) => {
    const panel = panelOf(canvasElement)
    const home = canvas.getByRole('link', { name: 'Home' })
    home.focus()
    await userEvent.keyboard('{Alt>}{Shift>}k{/Shift}{/Alt}')
    const mainContent = within(panel).getByRole('link', { name: 'Main content' })
    await waitFor(() => expect(mainContent).toHaveFocus())
    await expectShown(mainContent)
    await expect(panel).toHaveAttribute('data-reopened')
    await userEvent.keyboard('{Escape}')
    await expectTabbedOut(panel, home)
  }),
}

/** Escape shrinks the panel to the row that has focus. Focus doesn't move, and ArrowDown shows the next row alone. */
export const Collapsed: Story = {
  parameters: showSource('skip-panel/skip-panel.fixture.tsx', 'SkipPanelCollapsed'),
  render: () => <SkipPanelCollapsed />,
  play: playUnlessDocs(async ({ canvas, canvasElement }) => {
    const panel = panelOf(canvasElement)
    const inPanel = within(panel)
    const siteNavigation = inPanel.getByRole('link', { name: 'Site navigation' })
    const itemOf = (element: HTMLElement) => element.closest('li') as HTMLElement
    await userEvent.tab()
    await pressTimes('ArrowDown', 1)
    await userEvent.keyboard('{Escape}')
    await expect(panel).toHaveAttribute('data-collapsed')
    await expect(siteNavigation).toHaveFocus()
    await expectShown(siteNavigation)
    await expectHidden(itemOf(inPanel.getByRole('link', { name: 'Main content' })))
    for (const hidden of panel.querySelectorAll<HTMLElement>(
      '.kv-skip-panel__label, .kv-skip-panel__hint',
    )) {
      await expectHidden(hidden)
    }
    await pressTimes('ArrowDown', 1)
    const row = inPanel.getByRole('button', { name: /Contact us/ })
    await expect(row).toHaveFocus()
    await expectShown(row)
    await expectHidden(itemOf(siteNavigation))
    await userEvent.tab()
    await expect(panel).not.toHaveAttribute('data-collapsed')
    await expectTabbedOut(panel, canvas.getByRole('link', { name: 'Home' }))
  }),
}

/** With `shortcutsEnabled` off the rows are plain buttons: no key caps and no chords. */
export const ShortcutsDisabled: Story = {
  parameters: showSource('skip-panel/skip-panel.fixture.tsx', 'SkipPanelShortcutsDisabled'),
  render: () => <SkipPanelShortcutsDisabled />,
  play: playUnlessDocs(async ({ canvas, canvasElement }) => {
    const panel = panelOf(canvasElement)
    const home = canvas.getByRole('link', { name: 'Home' })
    await expect(panel.querySelector('.kv-kbd')).toBeNull()
    await expect(panel.querySelector('[aria-keyshortcuts]')).toBeNull()
    await userEvent.tab()
    await pressTimes('ArrowDown', 2)
    await expect(within(panel).getByRole('button', { name: 'Contact us' })).toHaveFocus()
    await userEvent.keyboard('{Enter}')
    await expect(canvas.getByRole('link', { name: 'Contact us' })).toHaveFocus()
    home.focus()
    await userEvent.keyboard('{Alt>}{Shift>}c{/Shift}{/Alt}')
    await userEvent.keyboard('{Alt>}{Shift>}k{/Shift}{/Alt}')
    await expect(home).toHaveFocus()
    await expectHidden(panel)
  }),
}

/**
 * Try the keys:
 *
 * - Tab: show the panel and focus its first link, and Tab again to leave it
 * - Shift+Tab: leave the panel backwards
 * - Arrow Down and Arrow Up: the next and previous item, without wrapping
 * - Home and End: the first and last item
 * - Enter: follow a link to its target, or run a shortcut button
 * - Space: run a shortcut button (a link scrolls the page, as any link does)
 * - Alt+Shift+C: Contact us, from anywhere on the page
 * - Alt+Shift+H: Home, from anywhere on the page
 * - Escape: shrink the floating panel to the focused row
 * - Alt+Shift+K: show the panel again
 * - Escape: close a panel opened with Alt+Shift+K and return to where you were
 */
export const Keyboard: Story = {
  parameters: showSource('skip-panel/skip-panel.fixture.tsx', 'SkipPanelKeyboard'),
  render: () => <SkipPanelKeyboard />,
  play: playUnlessDocs(async ({ canvas, canvasElement }) => {
    const panel = panelOf(canvasElement)
    keepFrameStill(panel)
    const inPanel = within(panel)
    const mainContent = inPanel.getByRole('link', { name: 'Main content' })
    await userEvent.tab()
    await pressTimes('ArrowDown', 2)
    await expectShown(inPanel.getByRole('button', { name: /Contact us/ }))
    await userEvent.keyboard('{End}')
    await expectShown(inPanel.getByRole('button', { name: /Home/ }))
    await userEvent.keyboard('{Home}')
    await expect(mainContent).toHaveFocus()
    await userEvent.keyboard('{End}')
    await userEvent.tab()
    await expectTabbedOut(panel, canvas.getByRole('link', { name: 'Home' }))
    await userEvent.tab({ shift: true })
    await expect(mainContent).toHaveFocus()
    await expectShown(mainContent)
    await userEvent.keyboard('{Enter}')
    await expect(canvas.getByRole('main')).toHaveFocus()
    await expectHidden(panel)
    await expectUncovered(canvas.getByRole('heading', { level: 1 }))
  }),
}

/** At 320px the panel sits at the top of the page, full width, with each key combination under its label. */
export const Narrow: Story = {
  globals: narrowGlobals,
  parameters: showSource('skip-panel/skip-panel.fixture.tsx', 'SkipPanelNarrow'),
  render: () => <SkipPanelNarrow />,
  play: playUnlessDocs(async ({ canvas, canvasElement }) => {
    const panel = panelOf(canvasElement)
    await expect(window.innerWidth).toBeLessThanOrEqual(320)
    await userEvent.tab()
    await expectShown(within(panel).getByRole('link', { name: 'Main content' }))
    await expectNoHorizontalOverflow(panel)
    for (const [role, name] of [
      ['link', 'Site navigation'],
      ['button', /Contact us/],
      ['button', /Home/],
    ] as const) {
      await pressTimes('ArrowDown', 1)
      const row = within(panel).getByRole(role, { name })
      await expect(row).toHaveFocus()
      await expectShown(row)
    }
    await userEvent.tab()
    await expectTabbedOut(panel, canvas.getByRole('link', { name: 'Home' }))
  }),
}

/** Right to left: the panel starts at the right edge and the key combinations sit at the end of their rows. */
export const RTL: Story = {
  globals: { ...wideGlobals, dir: 'rtl', locale: 'en' },
  parameters: showSource('skip-panel/skip-panel.fixture.tsx', 'SkipPanelRtl'),
  render: () => <SkipPanelRtl />,
  play: playUnlessDocs(async ({ canvas, canvasElement }) => {
    const panel = panelOf(canvasElement)
    await userEvent.tab()
    await expectShown(within(panel).getByRole('link', { name: 'Main content' }))
    await userEvent.keyboard('{End}')
    await userEvent.tab()
    await expectTabbedOut(panel, canvas.getByRole('link', { name: 'Home' }))
  }),
}

/** Forced colours: Canvas with a CanvasText edge, LinkText rows and a Highlight ring, with no shadow to rely on. */
export const ForcedColors: Story = {
  globals: { ...wideGlobals, forcedColors: 'active' },
  parameters: showSource('skip-panel/skip-panel.fixture.tsx', 'SkipPanelForcedColors'),
  render: () => <SkipPanelForcedColors />,
  play: playUnlessDocs(async ({ canvas, canvasElement }) => {
    const panel = panelOf(canvasElement)
    await userEvent.tab()
    await expectShown(within(panel).getByRole('link', { name: 'Main content' }))
    await userEvent.keyboard('{End}')
    await userEvent.tab()
    await expectTabbedOut(panel, canvas.getByRole('link', { name: 'Home' }))
  }),
}
