import { Menu } from '@kvirn/ui'
import contract from '../../../../../packages/react/src/menu/menu.a11y.md?raw'
import guide from '../../../../../packages/react/src/menu/menu.md?raw'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, waitFor } from 'storybook/test'
import { showSource, usageGuide } from '../../docs-source.ts'
import { localeOf } from '../form/form.fixture.tsx'
import {
  expectAnimationsSettled,
  expectMinimumTargetSize,
  expectNoHorizontalOverflow,
} from '../theme-story-assertions.ts'
import {
  ActionsMenu,
  ControlledMenu,
  DisabledItemsMenu,
  GroupedMenu,
  HookMenu,
  KeyboardMenu,
  LongMenu,
  ToolbarMenu,
  TooltipMenu,
  ViewOptionsMenu,
} from './menu.fixture.tsx'

// Components/Menu: a button that opens a short list of actions (APG Menu Button, contract:
// menu.a11y.md), styled by @kvirn/theme/theme.css. Actions, not navigation: links to pages are
// a Navigation.

const description = usageGuide(guide)

const meta = {
  title: 'Components/Choice and overlays/Menu',
  component: Menu.Root,
  argTypes: {
    open: { control: 'boolean', description: 'Controlled: whether the menu is open.' },
    defaultOpen: { control: 'boolean', description: 'Uncontrolled: whether it starts open.' },
    onOpenChange: { control: false },
    placement: {
      control: 'select',
      options: [
        'bottom-start',
        'bottom',
        'bottom-end',
        'top-start',
        'top',
        'top-end',
        'start',
        'end',
      ],
      description: 'Where the menu goes when there is room. It flips when it does not fit.',
    },
    offset: { control: 'number', description: 'The gap to the trigger in pixels. Default 4.' },
    padding: {
      control: 'number',
      description: 'The space kept to the edge of the viewport in pixels. Default 8.',
    },
  },
  args: { onOpenChange: fn() },
  globals: { locale: 'en' },
  parameters: {
    a11yContract: contract,
    docs: {
      description: { component: description },
    },
  },
} satisfies Meta<typeof Menu.Root>

export default meta
type Story = StoryObj<typeof meta>

const isPopupOpen = () =>
  document.querySelector('.kv-menu-popup')?.matches(':popover-open') === true

const openPopup = () => document.querySelector<HTMLElement>('.kv-menu-popup:popover-open')

/** Closed: a button that says it has a menu (`aria-haspopup="menu"`) and is collapsed. */
export const Default: Story = {
  parameters: showSource('menu/menu.fixture.tsx', 'ActionsMenu'),
  render: (args, { globals }) => <ActionsMenu {...args} locale={localeOf(globals)} />,
}

/** Pressing the trigger opens the menu with focus on the first item, in the top layer under the button. */
export const Open: Story = {
  args: { defaultOpen: true },
  parameters: showSource('menu/menu.fixture.tsx', 'ActionsMenu'),
  decorators: [
    (Story) => (
      <div style={{ minBlockSize: '16rem' }}>
        <Story />
      </div>
    ),
  ],
  render: (args, { globals }) => <ActionsMenu {...args} locale={localeOf(globals)} />,
  play: async ({ canvas }) => {
    await waitFor(() => expect(isPopupOpen()).toBe(true))
    await expectAnimationsSettled()
    for (const item of canvas.getAllByRole('menuitem')) {
      await expectMinimumTargetSize(item)
    }
  },
}

/** Groups and separators: a named group is a `role="group"`, and a separator is not an item. */
export const WithGroupsAndSeparators: Story = {
  args: { defaultOpen: true },
  parameters: showSource('menu/menu.fixture.tsx', 'GroupedMenu'),
  decorators: [
    (Story) => (
      <div style={{ minBlockSize: '20rem' }}>
        <Story />
      </div>
    ),
  ],
  render: (args, { globals }) => <GroupedMenu {...args} locale={localeOf(globals)} />,
  play: async () => {
    await waitFor(() => expect(isPopupOpen()).toBe(true))
    await expectAnimationsSettled()
  },
}

/** A checkbox item has a tick when it is checked, a radio item a dot: the shape, not the colour, says so. */
export const CheckboxAndRadioItems: Story = {
  args: { defaultOpen: true },
  parameters: showSource('menu/menu.fixture.tsx', 'ViewOptionsMenu'),
  decorators: [
    (Story) => (
      <div style={{ minBlockSize: '16rem' }}>
        <Story />
      </div>
    ),
  ],
  render: (args, { globals }) => <ViewOptionsMenu {...args} locale={localeOf(globals)} />,
  play: async () => {
    await waitFor(() => expect(isPopupOpen()).toBe(true))
    await expectAnimationsSettled()
  },
}

/** A disabled item is dimmed, reachable by the arrows, and does nothing: the menu stays open. */
export const DisabledItems: Story = {
  args: { defaultOpen: true },
  parameters: showSource('menu/menu.fixture.tsx', 'DisabledItemsMenu'),
  decorators: [
    (Story) => (
      <div style={{ minBlockSize: '16rem' }}>
        <Story />
      </div>
    ),
  ],
  render: (args, { globals }) => <DisabledItemsMenu {...args} locale={localeOf(globals)} />,
  play: async () => {
    await waitFor(() => expect(isPopupOpen()).toBe(true))
    await expectAnimationsSettled()
  },
}

/**
 * Controlled by your state: the menu shows the `open` it is given and reports every request
 * through `onOpenChange(open, { reason, event })`. Escape, a press outside, an item and the
 * trigger all ask; you decide. The outputs are always in the page.
 */
export const Controlled: Story = {
  parameters: showSource('menu/menu.fixture.tsx', 'ControlledMenu'),
  decorators: [
    (Story) => (
      <div style={{ minBlockSize: '16rem' }}>
        <Story />
      </div>
    ),
  ],
  render: (_args, { globals }) => <ControlledMenu locale={localeOf(globals)} />,
}

/** A menu taller than the room scrolls inside, and its labels wrap: nothing runs off the side (1.4.10). */
export const LongMenuScrolls: Story = {
  parameters: showSource('menu/menu.fixture.tsx', 'LongMenu'),
  render: (args, { globals }) => <LongMenu {...args} locale={localeOf(globals)} />,
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Actions' }))
    await waitFor(() => expect(isPopupOpen()).toBe(true))
    const popup = openPopup()
    if (popup === null) {
      throw new Error('the menu is not open')
    }
    await expectNoHorizontalOverflow(popup)
  },
}

/** In a vertical toolbar the trigger is one of its items: ArrowDown on it opens the menu. */
export const InToolbar: Story = {
  parameters: showSource('menu/menu.fixture.tsx', 'ToolbarMenu'),
  decorators: [
    (Story) => (
      <div style={{ minBlockSize: '16rem' }}>
        <Story />
      </div>
    ),
  ],
  render: (_args, { globals }) => <ToolbarMenu locale={localeOf(globals)} />,
}

/** A tooltip on the trigger closes while the menu is open. */
export const WithTooltip: Story = {
  parameters: showSource('menu/menu.fixture.tsx', 'TooltipMenu'),
  decorators: [
    (Story) => (
      <div style={{ minBlockSize: '16rem' }}>
        <Story />
      </div>
    ),
  ],
  render: (_args, { globals }) => <TooltipMenu locale={localeOf(globals)} />,
  play: async ({ canvas }) => {
    const trigger = canvas.getByRole('button', { name: 'Actions' })
    await userEvent.click(trigger)
    await waitFor(() => expect(isPopupOpen()).toBe(true))
  },
}

/** Right to left, in English: `bottom-start` lines the menu up with the trigger's right edge. */
export const RTL: Story = {
  globals: { dir: 'rtl', locale: 'en' },
  args: { defaultOpen: true },
  parameters: showSource('menu/menu.fixture.tsx', 'ViewOptionsMenu'),
  decorators: [
    (Story) => (
      <div style={{ minBlockSize: '16rem' }}>
        <Story />
      </div>
    ),
  ],
  render: (args) => <ViewOptionsMenu {...args} locale="en" />,
}

/** The popup keeps a visible edge, and the highlighted, checked and disabled items stay apart in forced colours. */
export const ForcedColors: Story = {
  globals: { forcedColors: 'active' },
  args: { defaultOpen: true },
  parameters: showSource('menu/menu.fixture.tsx', 'DisabledItemsMenu'),
  decorators: [
    (Story) => (
      <div style={{ minBlockSize: '16rem' }}>
        <Story />
      </div>
    ),
  ],
  render: (args, { globals }) => <DisabledItemsMenu {...args} locale={localeOf(globals)} />,
}

/**
 * The fixture the keyboard tests drive: a button before, the menu, a button after and a line of
 * text to press on. Try the keys in the Keyboard section above: Enter, Space and the arrows on the
 * trigger, arrows, Home, End and letters in the menu, Tab out of it, and Escape.
 */
export const Keyboard: Story = {
  parameters: showSource('menu/menu.fixture.tsx', 'KeyboardMenu'),
  decorators: [
    (Story) => (
      <div style={{ minBlockSize: '16rem' }}>
        <Story />
      </div>
    ),
  ],
  render: (_args, { globals }) => <KeyboardMenu locale={localeOf(globals)} />,
}

/** Built with `useMenu` on your own elements: the focused item carries `data-highlighted`. */
export const BuiltWithTheHook: Story = {
  parameters: showSource('menu/menu.fixture.tsx', 'HookMenu'),
  decorators: [
    (Story) => (
      <div style={{ minBlockSize: '16rem' }}>
        <Story />
      </div>
    ),
  ],
  render: (_args, { globals }) => <HookMenu locale={localeOf(globals)} />,
  play: async ({ canvas }) => {
    const trigger = canvas.getByRole('button', { name: 'Actions' })
    await userEvent.click(trigger)
    await waitFor(() => expect(isPopupOpen()).toBe(true))
  },
}
