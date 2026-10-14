import { Pagination } from '@kvirn-ui/react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import contract from '../../../../../packages/patterns/src/navigation-and-promotion/previous-and-next/previous-and-next.a11y.md?raw'
import { expect, userEvent } from 'storybook/test'
import { expectNoHorizontalOverflow } from '../../components/theme-story-assertions.ts'
import { chromeViewports, narrowGlobals, wideGlobals } from '../patterns-story-support.tsx'

// Patterns/Navigation and promotion/Previous and next (docs/design/storybook-patterns-t5.md S15).
// Story-only: a Pagination with Previous and Next and no page numbers.

const description = `The next article in a sequence, such as the pages of a guide. A [Pagination](?path=/docs/components-pagination--docs) with only \`Pagination.Previous\` and \`Pagination.Next\`, each link text naming the page it goes to ("Previous: Badge") so it makes sense alone (2.4.4). Give the \`nav\` a \`label\` that says what the sequence is, because the page also has a breadcrumb and a main navigation (rule R2). The first page has Next only and the last has Previous only: the other is left out, not dimmed (rule R9). Previous comes first in the DOM and Next after it, at every width (rule R5).

A \`Pagination.Status\` ("Page 2 of 5", from the provider's messages) sits between them, so the reader keeps their place and the total (1.3.1, 2.4.8). Below \`40rem\` the theme shows it with Previous and Next.

## Parts and gaps

Parts used: \`Pagination.Root\`, \`Pagination.List\`, \`Pagination.Item\`, \`Pagination.Previous\`, \`Pagination.Status\`, \`Pagination.Next\`. No gap.
`

const meta = {
  title: 'Patterns/Navigation and promotion/Previous and next',
  globals: { locale: 'en' },
  parameters: {
    a11yContract: contract,
    layout: 'padded',
    docs: { description: { component: description } },
    viewport: { options: chromeViewports },
  },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

const previous = (
  <Pagination.Item>
    <Pagination.Previous href="#badge">Previous: Badge</Pagination.Previous>
  </Pagination.Item>
)

const status = (page: number) => (
  <Pagination.Item>
    <Pagination.Status page={page} total={5} />
  </Pagination.Item>
)

const next = (
  <Pagination.Item>
    <Pagination.Next href="#button">Next: Button</Pagination.Next>
  </Pagination.Item>
)

/** A page in the middle of the guide: both links. */
export const Both: Story = {
  render: () => (
    <Pagination.Root label="Guide pages">
      <Pagination.List>
        {previous}
        {status(2)}
        {next}
      </Pagination.List>
    </Pagination.Root>
  ),
  play: async ({ canvas }) => {
    const navigation = canvas.getByRole('navigation', { name: 'Guide pages' })
    await expect(navigation).toBeVisible()
    await expect(canvas.getAllByRole('link')).toHaveLength(2)
    await expect(canvas.getByText('Page 2 of 5')).toBeInTheDocument()
    await expect(canvas.getByRole('link', { name: 'Previous: Badge' })).toBeVisible()
    await expect(canvas.getByRole('link', { name: 'Next: Button' })).toBeVisible()
  },
}

/** The first page: Next only. */
export const First: Story = {
  render: () => (
    <Pagination.Root label="Guide pages">
      <Pagination.List>
        {status(1)}
        {next}
      </Pagination.List>
    </Pagination.Root>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getAllByRole('link')).toHaveLength(1)
    await expect(canvas.queryByRole('link', { name: /Previous/ })).toBeNull()
  },
}

/** The last page: Previous only. */
export const Last: Story = {
  render: () => (
    <Pagination.Root label="Guide pages">
      <Pagination.List>
        {previous}
        {status(5)}
      </Pagination.List>
    </Pagination.Root>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getAllByRole('link')).toHaveLength(1)
    await expect(canvas.queryByRole('link', { name: /Next/ })).toBeNull()
  },
}

/** 320px: the two links stack and wrap; nothing scrolls sideways. */
export const Narrow: Story = {
  ...Both,
  globals: { ...narrowGlobals },
  play: async ({ canvasElement }) => {
    await expectNoHorizontalOverflow(canvasElement)
  },
}

/** 80rem. */
export const Wide: Story = {
  ...Both,
  globals: { ...wideGlobals },
}

/** Try the keys: Tab reaches Previous, then Next; Enter follows the link. */
export const Keyboard: Story = {
  ...Both,
  play: async ({ canvas }) => {
    await userEvent.tab()
    await expect(canvas.getByRole('link', { name: 'Previous: Badge' })).toHaveFocus()
    await userEvent.tab()
    await expect(canvas.getByRole('link', { name: 'Next: Button' })).toHaveFocus()
  },
}

/** Right to left: Previous sits at the start (right) and the arrows mirror. */
export const RTL: Story = {
  ...Both,
  globals: { dir: 'rtl', locale: 'en' },
}

/** Forced colours: both links keep an underline and a visible focus ring. */
export const ForcedColors: Story = {
  ...Both,
  globals: { forcedColors: 'active' },
}
