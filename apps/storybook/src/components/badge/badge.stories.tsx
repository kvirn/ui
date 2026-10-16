import { Badge } from '@kvirn-ui/react'
import contract from '../../../../../packages/react/src/badge/badge.a11y.md?raw'
import guide from '../../../../../packages/react/src/badge/badge.md?raw'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'
import { usageGuide } from '../../docs-source.ts'

// Components/Badge: the headless Badge, styled by @kvirn-ui/theme. A badge is text, not a
// control, so there's no focusable part and no Keyboard story.

const meta = {
  title: 'Components/Content/Badge',
  component: Badge,
  args: { children: 'Draft' },
  argTypes: { as: { control: false } },
  parameters: {
    a11yContract: contract,
    docs: { description: { component: usageGuide(guide) } },
  },
} satisfies Meta<typeof Badge>

export default meta
type Story = StoryObj<typeof meta>

/** Neutral, the default: a status in words next to a title. */
export const Default: Story = {
  render: (args) => (
    <p>
      Building permit application <Badge {...args} />
    </p>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByText('Draft')).toBeVisible()
  },
}

/** Every variant. The words carry the status, so none of them relies on its colour. */
export const Variants: Story = {
  render: () => (
    <ul>
      <li>
        Case <Badge>Draft</Badge>
      </li>
      <li>
        Case <Badge variant="primary">New</Badge>
      </li>
      <li>
        Case <Badge variant="info">Under review</Badge>
      </li>
      <li>
        Case <Badge variant="success">Approved</Badge>
      </li>
      <li>
        Case <Badge variant="warning">Waiting for more information</Badge>
      </li>
      <li>
        Case <Badge variant="danger">Rejected</Badge>
      </li>
    </ul>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByText('Approved')).toBeVisible()
    await expect(canvas.getByText('Rejected')).toBeVisible()
  },
}

/** In a heading, as on a case card: the badge is part of the heading's text. */
export const InHeading: Story = {
  render: () => (
    <h2>
      Building permit 4 High Street <Badge variant="success">Approved</Badge>
    </h2>
  ),
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('heading', { name: 'Building permit 4 High Street Approved' }),
    ).toBeVisible()
  },
}

/** Right to left: the pill keeps its shape and sits after the title in reading order. */
export const RTL: Story = {
  render: () => (
    <p dir="rtl" lang="ar">
      طلب الترخيص <Badge variant="warning">قيد المراجعة</Badge>
    </p>
  ),
  globals: { dir: 'rtl' },
  play: async ({ canvas }) => {
    await expect(canvas.getByText('قيد المراجعة')).toBeVisible()
  },
}

/** The edge survives forced colours. */
export const ForcedColors: Story = {
  globals: { forcedColors: 'active' },
  render: () => (
    <p>
      <Badge>Draft</Badge> <Badge variant="success">Approved</Badge>{' '}
      <Badge variant="danger">Rejected</Badge>
    </p>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByText('Approved')).toBeVisible()
  },
}

/** At 320px a row of badges wraps between badges, never inside one. */
export const Narrow: Story = {
  globals: { viewport: { value: 'reflow', isRotated: false } },
  parameters: {
    viewport: {
      options: {
        reflow: { name: '320px wide', styles: { width: '320px', height: '568px' }, type: 'mobile' },
      },
    },
  },
  render: () => (
    <div style={{ inlineSize: '20rem', maxInlineSize: '100%' }}>
      <Badge>Draft</Badge> <Badge variant="primary">New</Badge>{' '}
      <Badge variant="info">Under review</Badge>{' '}
      <Badge variant="warning">Waiting for more information</Badge>
    </div>
  ),
  play: async ({ canvas }) => {
    await expect(window.innerWidth).toBeLessThanOrEqual(320)
    await expect(canvas.getByText('Waiting for more information')).toBeVisible()
  },
}
