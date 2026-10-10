import { Address, Card, Link } from '@kvirn-ui/react'
import contract from '../../../../../packages/react/src/address/address.a11y.md?raw'
import guide from '../../../../../packages/react/src/address/address.md?raw'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'
import { usageGuide } from '../../docs-source.ts'

// Components/Content/Address: the headless Address, styled by @kvirn-ui/theme. It is static
// content, so there's no focusable part of its own and no Keyboard story.

const meta = {
  title: 'Components/Content/Address',
  component: Address,
  parameters: {
    a11yContract: contract,
    docs: { description: { component: usageGuide(guide) } },
  },
} satisfies Meta<typeof Address>

export default meta
type Story = StoryObj<typeof meta>

/** A visiting address, with a phone link and an email link. */
export const Default: Story = {
  render: (args) => (
    <Address {...args}>
      Kvirnby municipality
      <br />
      Visiting address: Storgatan 1, 123 45 Kvirnby
      <br />
      <Link.Root href="tel:+46123456789">+46 123 456 789</Link.Root>
      <br />
      <Link.Root href="mailto:contact@kvirnby.example">contact@kvirnby.example</Link.Root>
    </Address>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByText('Kvirnby municipality', { exact: false })).toBeVisible()
    await expect(canvas.getByRole('link', { name: '+46 123 456 789' })).toBeVisible()
    await expect(canvas.getByRole('link', { name: 'contact@kvirnby.example' })).toBeVisible()
  },
}

/** A postal address: `<br />` breaks the lines inside one `Address`. */
export const PostalAddress: Story = {
  render: () => (
    <Address>
      Kvirnby municipality
      <br />
      Registry office
      <br />
      Box 100
      <br />
      123 45 Kvirnby
    </Address>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByText('Box 100', { exact: false })).toBeVisible()
  },
}

/** In a Card, as on a contact card. The text keeps the body size and is not italic. */
export const InCard: Story = {
  render: () => (
    <Card.Root>
      <Card.Body>
        <Address>
          Kvirnby municipality
          <br />
          Storgatan 1
          <br />
          123 45 Kvirnby
        </Address>
      </Card.Body>
    </Card.Root>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByText('Storgatan 1', { exact: false })).toBeVisible()
  },
}

/** Right to left: the lines follow the reading direction. */
export const RTL: Story = {
  render: () => (
    <Address dir="rtl" lang="ar">
      بلدية كفيرنبي
      <br />
      شارع ستورغاتان 1
      <br />
      <Link.Root href="tel:+46123456789">+46 123 456 789</Link.Root>
    </Address>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('link', { name: '+46 123 456 789' })).toBeVisible()
  },
}
