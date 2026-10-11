import {
  AlertBody,
  AlertInfo,
  AlertTitle,
  Button,
  Card,
  DisplaySettings,
  Heading,
  Popover,
} from '@kvirn-ui/react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent } from 'storybook/test'
import contract from '../../../../../packages/react/src/display-settings/display-settings.a11y.md?raw'
import guide from '../../../../../packages/react/src/display-settings/display-settings.md?raw'
import { usageGuide } from '../../docs-source.ts'

// Components/Choice and overlays/DisplaySettings: colour scheme, contrast and motion, inline or floating.
// Each story is the code an adopter copies.

const description = usageGuide(guide)

const meta = {
  title: 'Components/Choice and overlays/DisplaySettings',
  component: DisplaySettings.Inline,
  globals: { locale: 'en' },
  parameters: {
    a11yContract: contract,
    docs: { description: { component: description } },
  },
} satisfies Meta<typeof DisplaySettings.Inline>

export default meta
type Story = StoryObj<typeof meta>

/** Inline: the panel opens in flow and pushes the content below it down. */
export const Inline: Story = {
  render: () => (
    <>
      <DisplaySettings.Inline />
      <p>This line moves down when the panel opens.</p>
    </>
  ),
  play: async ({ canvas }) => {
    const button = canvas.getByRole('button', { name: 'Display settings' })
    await expect(button).toHaveAttribute('aria-expanded', 'false')
    await userEvent.click(button)
    await expect(button).toHaveAttribute('aria-expanded', 'true')
    await expect(canvas.getByRole('group', { name: 'Colour scheme' })).toBeVisible()
    await expect(canvas.getByRole('group', { name: 'Contrast' })).toBeVisible()
    await expect(canvas.getByRole('group', { name: 'Motion' })).toBeVisible()
  },
}

/** Inline, open from the start. */
export const InlineOpen: Story = {
  render: () => <DisplaySettings.Inline defaultOpen />,
}

/** Floating: the panel is a popover over the page, next to its button. */
export const Floating: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'flex-end',
        alignContent: 'flex-start',
        minBlockSize: '28rem',
      }}
    >
      <DisplaySettings.Floating />
      <p>This line stays where it is when the popup opens.</p>
    </div>
  ),
  play: async ({ canvas }) => {
    const button = canvas.getByRole('button', { name: 'Display settings' })
    await userEvent.click(button)
    await expect(button).toHaveAttribute('aria-expanded', 'true')
    await expect(canvas.getByRole('dialog', { name: 'Display settings' })).toBeVisible()
  },
}

/** Floating, open from the start. */
export const FloatingOpen: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'flex-end',
        alignContent: 'flex-start',
        minBlockSize: '28rem',
      }}
    >
      <DisplaySettings.Floating defaultOpen />
    </div>
  ),
}

/** Your own notes as children: what less motion does, and where the choice is kept. */
export const WithNotes: Story = {
  render: () => (
    <DisplaySettings.Inline defaultOpen>
      <p>
        Less motion turns off the fades and transitions on this site. Nothing moves unless you start
        it.
      </p>
      <AlertInfo>
        <AlertTitle as="p">Privacy</AlertTitle>
        <AlertBody>
          <p>We save your choice in this browser only. We don't use cookies or send it anywhere.</p>
        </AlertBody>
      </AlertInfo>
    </DisplaySettings.Inline>
  ),
}

/** Your own notes in the floating layout. */
export const FloatingWithNotes: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'flex-end',
        alignContent: 'flex-start',
        minBlockSize: '36rem',
      }}
    >
      <DisplaySettings.Floating defaultOpen>
        <p>We save your choice in this browser only.</p>
      </DisplaySettings.Floating>
    </div>
  ),
}

/** Compact: a small dropdown, a row of segments for each group. */
export const Compact: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'flex-end',
        alignContent: 'flex-start',
        minBlockSize: '20rem',
      }}
    >
      <DisplaySettings.Compact />
    </div>
  ),
  play: async ({ canvas }) => {
    const button = canvas.getByRole('button', { name: 'Display settings' })
    await userEvent.click(button)
    await expect(canvas.getByRole('dialog', { name: 'Display settings' })).toBeVisible()
    await expect(canvas.getByRole('radio', { name: 'Light' })).toBeEnabled()
    await expect(canvas.getAllByRole('radio', { name: 'Device' })).toHaveLength(3)
  },
}

/** Compact, open from the start. */
export const CompactOpen: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'flex-end',
        alignContent: 'flex-start',
        minBlockSize: '20rem',
      }}
    >
      <DisplaySettings.Compact defaultOpen />
    </div>
  ),
}

/** Compact with a note of your own under the segments. */
export const CompactWithNote: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'flex-end',
        alignContent: 'flex-start',
        minBlockSize: '22rem',
      }}
    >
      <DisplaySettings.Compact defaultOpen>
        <p>We save your choice in this browser only.</p>
      </DisplaySettings.Compact>
    </div>
  ),
}

/** Compact, keyboard: Tab to the button, Enter, then arrows move inside a group and Tab leaves it. */
export const CompactKeyboard: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'flex-end',
        alignContent: 'flex-start',
        minBlockSize: '20rem',
      }}
    >
      <DisplaySettings.Compact />
    </div>
  ),
  play: async ({ canvas }) => {
    await userEvent.tab()
    await userEvent.keyboard('{Enter}')
    await expect(canvas.getByRole('dialog', { name: 'Display settings' })).toBeVisible()
    await userEvent.tab()
    await expect(canvas.getByRole('radio', { name: 'Device', checked: true })).toBeDefined()
    await userEvent.keyboard('{Escape}')
    await expect(canvas.getByRole('button', { name: 'Display settings' })).toHaveFocus()
  },
}

/** Compact, right to left. */
export const CompactRTL: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'flex-end',
        alignContent: 'flex-start',
        minBlockSize: '20rem',
      }}
    >
      <DisplaySettings.Compact defaultOpen />
    </div>
  ),
  globals: { dir: 'rtl', locale: 'en' },
}

/** Compact in forced colours: the checked segment is a \`Highlight\` fill. */
export const CompactForcedColors: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'flex-end',
        alignContent: 'flex-start',
        minBlockSize: '20rem',
      }}
    >
      <DisplaySettings.Compact defaultOpen />
    </div>
  ),
  globals: { forcedColors: 'active' },
}

/** The panel on its own, in your own Card: no trigger, no popup. */
export const PanelInCard: Story = {
  render: () => (
    <Card.Root>
      <Card.Header>
        <Heading as="h2" size="heading-4">
          Display settings
        </Heading>
      </Card.Header>
      <Card.Body>
        <DisplaySettings.Panel />
      </Card.Body>
    </Card.Root>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('group', { name: 'Colour scheme' })).toBeVisible()
    await expect(canvas.queryByRole('button', { name: 'Display settings' })).toBeNull()
  },
}

/** The compact panel in a Card, as a block on a settings page. */
export const CompactPanelInCard: Story = {
  render: () => (
    <Card.Root style={{ maxInlineSize: '24rem' }}>
      <Card.Header>
        <Heading as="h2" size="heading-4">
          Display
        </Heading>
      </Card.Header>
      <Card.Body>
        <DisplaySettings.CompactPanel />
      </Card.Body>
    </Card.Root>
  ),
}

/** The panel in a Popover you build yourself, with your own trigger. The theme styles no Popover, so the popup takes the compact layout's class. */
export const PanelInYourPopover: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'flex-end',
        minBlockSize: '30rem',
      }}
    >
      <Popover.Root placement="bottom-end" defaultOpen>
        <Popover.Trigger as={Button}>Appearance</Popover.Trigger>
        <Popover.Popup aria-label="Appearance" className="kv-display-settings-compact-popup">
          <DisplaySettings.CompactPanel>
            <p>We save your choice in this browser only.</p>
          </DisplaySettings.CompactPanel>
        </Popover.Popup>
      </Popover.Root>
    </div>
  ),
}

/** Tab to the button, Enter opens, Escape closes the floating popup and returns focus. */
export const Keyboard: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'flex-end',
        alignContent: 'flex-start',
        minBlockSize: '28rem',
      }}
    >
      <DisplaySettings.Floating />
    </div>
  ),
  play: async ({ canvas }) => {
    await userEvent.tab()
    const button = canvas.getByRole('button', { name: 'Display settings' })
    await expect(button).toHaveFocus()
    await userEvent.keyboard('{Enter}')
    await expect(canvas.getByRole('dialog', { name: 'Display settings' })).toBeVisible()
    await userEvent.keyboard('{Escape}')
    await expect(button).toHaveFocus()
    await expect(button).toHaveAttribute('aria-expanded', 'false')
  },
}

/** 320px: the three groups wrap into one column. */
export const Narrow: Story = {
  globals: { viewport: { value: 'reflow', isRotated: false } },
  render: () => <DisplaySettings.Inline defaultOpen />,
}

/** Right to left. */
export const RTL: Story = {
  render: () => <DisplaySettings.Inline defaultOpen />,
  globals: { dir: 'rtl', locale: 'en' },
}

/** Forced colours: the radios and the Card keep their system colours. */
export const ForcedColors: Story = {
  render: () => <DisplaySettings.Inline defaultOpen />,
  globals: { forcedColors: 'active' },
}
