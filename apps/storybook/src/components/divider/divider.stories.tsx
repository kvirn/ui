import { Divider } from '@kvirn-ui/react'
import contract from '../../../../../packages/react/src/divider/divider.a11y.md?raw'
import guide from '../../../../../packages/react/src/divider/divider.md?raw'
import type { CSSProperties } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'
import { en } from '@kvirn-ui/i18n/en'
import { InLanguage } from '../../fixture-language.tsx'
import { usageGuide } from '../../docs-source.ts'

// Components/Content/Divider: the headless Divider, styled by @kvirn-ui/theme. It is static
// content, so there's no focusable part of its own and no Keyboard story.

const meta = {
  title: 'Components/Content/Divider',
  component: Divider,
  parameters: {
    a11yContract: contract,
    docs: { description: { component: usageGuide(guide) } },
  },
} satisfies Meta<typeof Divider>

export default meta
type Story = StoryObj<typeof meta>

/** A thematic break between two topics: a screen reader may announce it as a separator. */
export const Default: Story = {
  render: (args) => (
    <>
      <p>Opening hours</p>
      <Divider {...args} />
      <p>Contact details</p>
    </>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('separator')).toBeVisible()
  },
}

/** A purely visual line: `role="presentation"` keeps it out of the announcements. */
export const Presentation: Story = {
  render: () => (
    <>
      <p>Opening hours</p>
      <Divider role="presentation" />
      <p>Contact details</p>
    </>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.queryByRole('separator')).toBeNull()
    await expect(canvas.getByText('Contact details')).toBeVisible()
  },
}

/** Every value is a CSS variable, set from a class or any ancestor. */
export const CustomVariables: Story = {
  render: () => (
    <div
      style={
        {
          '--kv-divider-margin-block': 'var(--kv-space-8)',
          '--kv-divider-width': '4px',
          '--kv-divider-style': 'dashed',
          '--kv-divider-color': 'var(--kv-color-border)',
        } as CSSProperties
      }
    >
      <p>Opening hours</p>
      <Divider />
      <p>Contact details</p>
    </div>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('separator')).toBeVisible()
  },
}

/** Right to left: the line spans the inline size. Divider holds no strings, so `en` only satisfies the provider. */
export const RTL: Story = {
  render: () => (
    <InLanguage locale="ar" messages={en} dir="rtl">
      <p>ساعات العمل</p>
      <Divider />
      <p>بيانات الاتصال</p>
    </InLanguage>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('separator')).toBeVisible()
  },
}

/** Forced colours: the line is a border, so it keeps its edge. */
export const ForcedColors: Story = {
  globals: { forcedColors: 'active' },
  render: () => (
    <>
      <p>Opening hours</p>
      <Divider />
      <p>Contact details</p>
    </>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('separator')).toBeVisible()
  },
}
