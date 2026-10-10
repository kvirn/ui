import { Link, List } from '@kvirn-ui/react'
import contract from '../../../../../packages/react/src/list/list.a11y.md?raw'
import guide from '../../../../../packages/react/src/list/list.md?raw'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'
import { usageGuide } from '../../docs-source.ts'

// Components/Content/List: the headless List, styled by @kvirn-ui/theme. It is static content, so
// there's no focusable part of its own and no Keyboard story.

const meta = {
  title: 'Components/Content/List',
  component: List.Root,
  argTypes: {
    as: { control: false, description: '`ul` (default) or `ol`.' },
  },
  parameters: {
    a11yContract: contract,
    docs: { description: { component: usageGuide(guide) } },
  },
} satisfies Meta<typeof List.Root>

export default meta
type Story = StoryObj<typeof meta>

/** A link list: no marker, one announced list with a count. Inside a `nav` it is navigation. */
export const Default: Story = {
  render: (args) => (
    <nav aria-label="Related links">
      <List.Root {...args}>
        <List.Item>
          <Link.Root href="#building-permits">Building permits</Link.Root>
        </List.Item>
        <List.Item>
          <Link.Root href="#waste">Waste and recycling</Link.Root>
        </List.Item>
        <List.Item>
          <Link.Root href="#school-transport">School transport</Link.Root>
        </List.Item>
      </List.Root>
    </nav>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('list')).toHaveAttribute('role', 'list')
    await expect(canvas.getAllByRole('listitem')).toHaveLength(3)
    await expect(canvas.getByRole('link', { name: 'Waste and recycling' })).toBeVisible()
  },
}

/** `kv-list--bullet`: for a short list in running content. The list always has `role="list"`, so Safari keeps its list semantics. */
export const Bulleted: Story = {
  args: { className: 'kv-list--bullet' },
  render: (args) => (
    <List.Root {...args}>
      <List.Item>Bring your ID</List.Item>
      <List.Item>Bring the form</List.Item>
      <List.Item>Bring a receipt for the fee</List.Item>
    </List.Root>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('list')).toHaveAttribute('role', 'list')
    await expect(canvas.getAllByRole('listitem')).toHaveLength(3)
  },
}

/** `as="ol"` with `kv-list--decimal`: steps in a fixed order. */
export const Numbered: Story = {
  args: { as: 'ol', className: 'kv-list--decimal' },
  render: (args) => (
    <List.Root {...args}>
      <List.Item>Fill in the application</List.Item>
      <List.Item>Attach your documents</List.Item>
      <List.Item>Wait for the decision</List.Item>
    </List.Root>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('list').tagName).toBe('OL')
    await expect(canvas.getAllByRole('listitem')).toHaveLength(3)
  },
}

/** The four gap steps: `kv-list--gap-2`, 4 (default), `-6` and `-8`. */
export const GapSteps: Story = {
  render: () => (
    <>
      {(['2', '4', '6', '8'] as const).map((gap) => (
        <List.Root key={gap} className={`kv-list--gap-${gap}`} aria-label={`Gap ${gap}`}>
          <List.Item>Gap {gap}: first</List.Item>
          <List.Item>Gap {gap}: second</List.Item>
          <List.Item>Gap {gap}: third</List.Item>
        </List.Root>
      ))}
    </>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getAllByRole('list')).toHaveLength(4)
  },
}

/** A nested list goes inside an item. */
export const Nested: Story = {
  args: { className: 'kv-list--bullet' },
  render: (args) => (
    <List.Root {...args}>
      <List.Item>
        Services
        <List.Root className="kv-list--bullet kv-list--gap-2">
          <List.Item>Building permits</List.Item>
          <List.Item>Waste and recycling</List.Item>
        </List.Root>
      </List.Item>
      <List.Item>Contact</List.Item>
    </List.Root>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getAllByRole('list')).toHaveLength(2)
    await expect(canvas.getAllByRole('listitem')).toHaveLength(4)
  },
}

/** Right to left: the markers and the indent follow the reading direction. */
export const RTL: Story = {
  args: { className: 'kv-list--bullet' },
  render: (args) => (
    <div dir="rtl" lang="ar">
      <List.Root {...args}>
        <List.Item>تصاريح البناء</List.Item>
        <List.Item>النفايات وإعادة التدوير</List.Item>
      </List.Root>
    </div>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getAllByRole('listitem')).toHaveLength(2)
  },
}
