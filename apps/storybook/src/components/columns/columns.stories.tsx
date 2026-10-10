import { Card, Columns } from '@kvirn-ui/react'
import contract from '../../../../../packages/react/src/columns/columns.a11y.md?raw'
import guide from '../../../../../packages/react/src/columns/columns.md?raw'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'
import { usageGuide } from '../../docs-source.ts'
import { expectNoHorizontalOverflow } from '../theme-story-assertions.ts'

// Components/Columns: the headless Columns, styled by @kvirn-ui/theme/theme.css (DESIGN.md,
// Layout).

const description = usageGuide(guide)

const services = ['Sophämtning', 'Bygglov', 'Skolskjuts', 'Äldreomsorg', 'Bibliotek', 'Simhall']

const cards = services.map((service) => (
  <Card.Root key={service}>
    <Card.Body>{service}</Card.Body>
  </Card.Root>
))

const meta = {
  title: 'Components/Layout/Columns',
  component: Columns,
  args: { children: cards },
  argTypes: {
    as: { control: false, description: 'Another element: `ul` or `ol`.' },
  },
  parameters: { a11yContract: contract, docs: { description: { component: description } } },
} satisfies Meta<typeof Columns>

export default meta
type Story = StoryObj<typeof meta>

/** As many columns as fit, each at least `18rem`. The DOM order is the reading order. */
export const Default: Story = {}

/** `kv-columns--min-sm`: more, narrower columns. */
export const MinSmall: Story = { args: { className: 'kv-columns--min-sm' } }

/** `kv-columns--min-lg`: fewer, wider columns. */
export const MinLarge: Story = { args: { className: 'kv-columns--min-lg' } }

/** `kv-columns--gap-4`. */
export const Gap4: Story = { args: { className: 'kv-columns--gap-4' } }

/** `kv-columns--gap-8`. */
export const Gap8: Story = { args: { className: 'kv-columns--gap-8' } }

/** `as="ul"`: a list of links to entry points, announced as a list with a count. */
export const AsList: Story = {
  render: (args) => (
    <Columns as="ul" className={args.className}>
      {services.map((service) => (
        <li key={service}>
          <Card.Root>
            <Card.Body>
              <a href="#service">{service}</a>
            </Card.Body>
          </Card.Root>
        </li>
      ))}
    </Columns>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('list')).toBeVisible()
    await expect(canvas.getAllByRole('listitem')).toHaveLength(services.length)
  },
}

/** A 320px column: one column, a long Finnish word wraps, nothing scrolls sideways (1.4.10). */
export const Reflow320: Story = {
  args: {
    className: 'kv-columns--min-lg',
    children: (
      <Card.Root>
        <Card.Body>Jätehuoltomaksunpalautuspäätöksentarkistuslomake</Card.Body>
      </Card.Root>
    ),
  },
  decorators: [(Story) => <div className="kv-story-narrow">{<Story />}</div>],
  globals: { locale: 'fi' },
  play: async ({ canvasElement }) => {
    const column = canvasElement.querySelector<HTMLElement>('.kv-story-narrow')
    if (column === null) {
      throw new Error('no narrow column')
    }
    await expectNoHorizontalOverflow(column)
  },
}

/** Right to left: the first card is at the right. */
export const RTL: Story = { globals: { dir: 'rtl', locale: 'en' } }

/** The cards' edges survive forced colours. */
export const ForcedColors: Story = { globals: { forcedColors: 'active' } }
