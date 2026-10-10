import { Tabs } from '@kvirn-ui/react'
import contract from '../../../../../packages/react/src/tabs/tabs.a11y.md?raw'
import guide from '../../../../../packages/react/src/tabs/tabs.md?raw'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'
import { showSource, usageGuide } from '../../docs-source.ts'
import { expectMinimumTargetSize, expectNoHorizontalOverflow } from '../theme-story-assertions.ts'
import {
  ApplicationTabs,
  CardTabs,
  CaseTabs,
  CompactCaseTabs,
  ControlledTabs,
  FilingTabs,
  FinnishTabs,
  ReviewTabs,
  SettingsTabs,
} from './tabs.fixture.tsx'

// Components/Tabs: a list of tabs and a panel for each (APG Tabs, contract: tabs.a11y.md), styled
// by @kvirn-ui/theme/theme.css (design spec docs/design/tabs.md).
// Tabs have no library strings: the names and the
// panel texts are the story's own, in sv by default.

// The Docs page opens with the package docs: how to use it, and how to build your own.
const description = usageGuide(guide)

const meta = {
  title: 'Components/Navigation/Tabs',
  component: Tabs.Root,
  // Every option at its default, so the main example starts where an adopter starts.
  args: { defaultValue: 'uppgifter', activationMode: 'automatic', orientation: 'horizontal' },
  // Every prop of Tabs.Root in tabs.tsx and use-tabs.ts. Any other `<div>` prop passes through.
  // The props of the other parts (`value`, `disabled` and `onClick` on a Tab, `value` and `tabIndex`
  // on a Panel, the name of the List) are in the API section below.
  argTypes: {
    defaultValue: {
      control: 'select',
      options: ['uppgifter', 'handlingar', 'historik'],
      description:
        'Uncontrolled: the value of the tab that is selected to begin with. One of `defaultValue` and `value` is required: there is no first-tab fallback.',
    },
    value: {
      control: 'select',
      options: [undefined, 'uppgifter', 'handlingar', 'historik'],
      description:
        'Controlled: the value of the selected tab. Pair it with `onValueChange`: with only a control here, a click selects nothing until you change the control (see Controlled).',
    },
    onValueChange: {
      control: false,
      description:
        'Called with the new value and `{ reason, event }` when the user selects a tab: `press`, `arrow-key` or `home-end-key`. It only reports. Never called for a disabled tab or the selected one.',
    },
    activationMode: {
      control: 'inline-radio',
      options: ['automatic', 'manual'],
      description:
        '`automatic` (default): the arrows, Home and End select the tab they move to, except a disabled one. `manual`: they only move focus, and Enter or Space selects. Use it when a panel is slow to show.',
    },
    orientation: {
      control: 'inline-radio',
      options: ['horizontal', 'vertical'],
      description:
        'The axis of the arrow keys. `horizontal` (default): Left and Right, which flip in right-to-left text. `vertical`: Down and Up, and `aria-orientation="vertical"` on the list. Sets `data-orientation` on the root.',
    },
    className: {
      control: 'text',
      description:
        'Your own classes, added to `kv-tabs`. `kv-compact` on a container makes the tabs 32px from 64rem. The theme has no other modifier: the look comes from the parts and from `data-orientation`.',
    },
    ref: { control: false, description: 'The root’s `<div>`.' },
  },
  globals: { locale: 'sv' },
  parameters: { a11yContract: contract, docs: { description: { component: description } } },
} satisfies Meta<typeof Tabs.Root>

export default meta
type Story = StoryObj<typeof meta>

/**
 * The main example: three tabs for the parts of a case, and a panel for each. The tab list is one
 * Tab stop, at the selected tab, and the arrow keys move between the tabs. Every option of the
 * root is a control below.
 */
export const Default: Story = {
  render: (args) => (
    <Tabs.Root {...args}>
      <Tabs.List aria-label="Ärendet">
        <Tabs.Tab value="uppgifter">Uppgifter</Tabs.Tab>
        <Tabs.Tab value="handlingar">Handlingar</Tabs.Tab>
        <Tabs.Tab value="historik">Historik</Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel value="uppgifter">
        <p>Ansökan om bygglov för Strandvägen 4. Ärendet väntar på granskning.</p>
      </Tabs.Panel>
      <Tabs.Panel value="handlingar">
        <p>Ritningar, situationsplan och kontrollplan har kommit in.</p>
      </Tabs.Panel>
      <Tabs.Panel value="historik">
        <p>Ansökan kom in den 2 september. Komplettering begärdes den 9 september.</p>
      </Tabs.Panel>
    </Tabs.Root>
  ),
  play: async ({ canvas }) => {
    const list = canvas.getByRole('tablist', { name: 'Ärendet' })
    await expect(list).not.toHaveAttribute('aria-orientation')
    const tabs = canvas.getAllByRole('tab')
    await expect(tabs).toHaveLength(3)
    await expect(canvas.getByRole('tab', { name: 'Uppgifter' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    await expect(canvas.getByRole('tabpanel', { name: 'Uppgifter' })).toBeVisible()
    // One Tab stop: the selected tab has tabindex 0 and the others -1.
    await expect(list.querySelectorAll('[tabindex="0"]')).toHaveLength(1)
    for (const tab of tabs) {
      await expectMinimumTargetSize(tab)
    }
  },
}

/**
 * The fixture the keyboard tests drive: a button before, four tabs and a button after. Try the
 * keys in the Keyboard section above: Tab enters at the selected tab and the next Tab leaves for
 * its panel, the arrows move and wrap, and Home and End go to the ends. Historik is disabled: the
 * arrows reach it and never select it. The panel of Handlingar starts with a link, so it sets
 * `tabIndex={-1}`.
 */
export const Keyboard: Story = {
  parameters: showSource('tabs/tabs.fixture.tsx', 'FilingTabs'),
  render: () => <FilingTabs locale="sv" />,
  play: async ({ canvas, canvasElement }) => {
    const list = canvas.getByRole('tablist', { name: 'Ärendet' })
    await expect(list.querySelectorAll('[tabindex="0"]')).toHaveLength(1)
    await expect(canvas.getByRole('tab', { name: 'Historik' })).toHaveAttribute(
      'aria-disabled',
      'true',
    )
    // The panel with a link first leaves the Tab stop to the link. A hidden panel has no
    // accessible name to query, so find it through its tab's `aria-controls`.
    const documentsPanelId = canvas
      .getByRole('tab', { name: 'Handlingar' })
      .getAttribute('aria-controls')
    await expect(canvasElement.querySelector(`[id="${documentsPanelId}"]`)).toHaveAttribute(
      'tabindex',
      '-1',
    )
  },
}

/**
 * Manual activation: the arrows only move focus, and Enter or Space selects the tab. Use it only
 * when showing a panel is slow, so arrowing through the tabs doesn’t load each one.
 */
export const Manual: Story = {
  parameters: showSource('tabs/tabs.fixture.tsx', 'ReviewTabs'),
  render: () => <ReviewTabs />,
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('tab', { name: 'Handlingar' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
  },
}

/**
 * `orientation="vertical"`: the arrows are Down and Up, and the list says
 * `aria-orientation="vertical"`. The theme puts the list beside the panel, and stacks them below
 * 40rem.
 */
export const Vertical: Story = {
  parameters: showSource('tabs/tabs.fixture.tsx', 'SettingsTabs'),
  render: () => <SettingsTabs />,
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('tablist', { name: 'Inställningar' })).toHaveAttribute(
      'aria-orientation',
      'vertical',
    )
  },
}

/**
 * A disabled tab stays focusable and is read as unavailable, and it is never selected. Say why
 * where everyone can read it, and point the tab at the reason with `aria-describedby`.
 */
export const DisabledTab: Story = {
  parameters: showSource('tabs/tabs.fixture.tsx', 'ApplicationTabs'),
  render: () => <ApplicationTabs />,
  play: async ({ canvas }) => {
    const decision = canvas.getByRole('tab', { name: 'Beslut' })
    await expect(decision).toHaveAttribute('aria-disabled', 'true')
    await expect(decision).not.toHaveAttribute('disabled')
    await expect(decision).toHaveAccessibleDescription(
      'Fliken Beslut öppnas när nämnden har fattat sitt beslut.',
    )
  },
}

/**
 * Controlled: `value` decides, and `onValueChange` reports the new value with the reason
 * (`press`, `arrow-key` or `home-end-key`) and the event. The reason of the last change is shown
 * under the tabs.
 */
export const Controlled: Story = {
  parameters: showSource('tabs/tabs.fixture.tsx', 'ControlledTabs'),
  render: () => <ControlledTabs />,
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('tab', { name: 'Handlingar' }))
    await expect(canvas.getByText('Vald flik: handlingar. Senaste orsak: press.')).toBeVisible()
    await expect(canvas.getByRole('tab', { name: 'Handlingar' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
  },
}

/**
 * Long Finnish labels. The list wraps in a narrow column, row by row, and a long word wraps inside
 * its tab: nothing shrinks to nothing, truncates or scrolls sideways (1.4.10). Each row’s
 * selected tab keeps its own bar.
 */
export const LongFinnishText: Story = {
  globals: { locale: 'fi' },
  parameters: showSource('tabs/tabs.fixture.tsx', 'FinnishTabs'),
  render: () => (
    <div className="kv-story-narrow" data-testid="narrow">
      <FinnishTabs />
    </div>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('tablist', { name: 'Rakennuslupa' })).toBeVisible()
    await expectNoHorizontalOverflow(canvas.getByTestId('narrow'))
  },
}

/** Inside `kv-compact` the tabs are 32px high from 64rem, and every tab is still at least 24 × 24 (2.5.8). */
export const CompactDensity: Story = {
  parameters: showSource('tabs/tabs.fixture.tsx', 'CompactCaseTabs'),
  render: () => <CompactCaseTabs />,
  play: async ({ canvas }) => {
    for (const tab of canvas.getAllByRole('tab')) {
      await expectMinimumTargetSize(tab)
    }
  },
}

/** Tabs in the body of a card: the hairline and the panel sit on the card’s surface. */
export const InACard: Story = {
  parameters: showSource('tabs/tabs.fixture.tsx', 'CardTabs'),
  render: () => <CardTabs />,
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('tablist', { name: 'Ärendet' })).toBeVisible()
  },
}

/** Right to left, in English: the arrows flip, so Left is the next tab and Right the previous. */
export const RTL: Story = {
  globals: { dir: 'rtl', locale: 'en' },
  parameters: showSource('tabs/tabs.fixture.tsx', 'FilingTabs'),
  render: () => <FilingTabs locale="en" />,
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('tab', { name: 'Details' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
  },
}

/**
 * Forced colours: the selected tab keeps its straight `CanvasText` bar and its weight, the line
 * under the list is `CanvasText`, and the focus ring is `Highlight`. This story sets forced
 * colours for review, and the dedicated forced-colours sweep (`E2E_BROWSERS=sweep`) checks it
 * with real emulation.
 */
export const ForcedColors: Story = {
  globals: { forcedColors: 'active' },
  parameters: showSource('tabs/tabs.fixture.tsx', 'CaseTabs'),
  render: () => <CaseTabs />,
}
