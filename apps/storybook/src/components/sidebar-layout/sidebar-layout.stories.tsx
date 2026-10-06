import { Card, SidebarLayout } from '@kvirn-ui/react'
import contract from '../../../../../packages/react/src/sidebar-layout/sidebar-layout.a11y.md?raw'
import guide from '../../../../../packages/react/src/sidebar-layout/sidebar-layout.md?raw'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'
import { usageGuide } from '../../docs-source.ts'

// Components/SidebarLayout: the headless SidebarLayout, styled by @kvirn-ui/theme/theme.css
// (DESIGN.md, Layout). The sidebar is the first part in the DOM, so it is first in the Tab order.

const description = usageGuide(guide)

const meta = {
  title: 'Components/SidebarLayout',
  component: SidebarLayout.Root,
  args: {
    children: (
      <>
        <SidebarLayout.Sidebar>
          <Card.Root>
            <Card.Body>Sidofält</Card.Body>
          </Card.Root>
        </SidebarLayout.Sidebar>
        <SidebarLayout.Content>
          <Card.Root>
            <Card.Body>Innehåll</Card.Body>
          </Card.Root>
        </SidebarLayout.Content>
      </>
    ),
  },
  argTypes: {
    sidebarWidth: {
      control: 'inline-radio',
      options: ['sm', 'md'],
      description: 'The sidebar track from `64rem`: `sm` 16rem or `md` 20rem (default).',
    },
    render: { control: false },
  },
  parameters: { a11yContract: contract, docs: { description: { component: description } } },
} satisfies Meta<typeof SidebarLayout.Root>

export default meta
type Story = StoryObj<typeof meta>

/** Stacked below `64rem`, side by side from it, with the sidebar at inline start. */
export const Default: Story = {}

/** `sidebarWidth="sm"`: a `16rem` sidebar. */
export const SidebarSmall: Story = { args: { sidebarWidth: 'sm' } }

/** The sidebar as a named `nav`: the layout adds no landmark, `render` does. */
export const AsNavigation: Story = {
  render: (args) => (
    <SidebarLayout.Root {...args}>
      <SidebarLayout.Sidebar render={<nav aria-label="I det här avsnittet" />}>
        <ul>
          <li>
            <a href="#intro">Inledning</a>
          </li>
          <li>
            <a href="#rules">Regler</a>
          </li>
        </ul>
      </SidebarLayout.Sidebar>
      <SidebarLayout.Content>
        <Card.Root>
          <Card.Body>Innehåll</Card.Body>
        </Card.Root>
      </SidebarLayout.Content>
    </SidebarLayout.Root>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('navigation', { name: 'I det här avsnittet' })).toBeVisible()
  },
}

/**
 * A long Finnish word in the sidebar. The layout stacks by viewport width (below `64rem`), so a
 * 320px column inside a wide page can't show it: the 320px check is the manual one and Plan
 * 0051's sweep. Here the word wraps inside its track.
 */
export const LongWord: Story = {
  args: {
    children: (
      <>
        <SidebarLayout.Sidebar data-testid="sidebar">
          <Card.Root>
            <Card.Body>Jätehuoltomaksunpalautuspäätöksentarkistuslomake</Card.Body>
          </Card.Root>
        </SidebarLayout.Sidebar>
        <SidebarLayout.Content data-testid="content">
          <Card.Root>
            <Card.Body>Innehåll</Card.Body>
          </Card.Root>
        </SidebarLayout.Content>
      </>
    ),
  },
  globals: { locale: 'fi' },
  play: async ({ canvas }) => {
    const sidebar = canvas.getByTestId('sidebar')
    await expect(sidebar.scrollWidth).toBeLessThanOrEqual(sidebar.clientWidth)
    await expect(
      sidebar.compareDocumentPosition(canvas.getByTestId('content')) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()
  },
}

/** Right to left: the first part is at the right, and the Tab order is unchanged. */
export const RTL: Story = { globals: { dir: 'rtl', locale: 'en' } }

/** The cards' edges survive forced colours. */
export const ForcedColors: Story = { globals: { forcedColors: 'active' } }
