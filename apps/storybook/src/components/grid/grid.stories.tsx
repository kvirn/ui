import { Card, Grid } from '@kvirn-ui/react'
import contract from '../../../../../packages/react/src/grid/grid.a11y.md?raw'
import guide from '../../../../../packages/react/src/grid/grid.md?raw'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'
import { usageGuide } from '../../docs-source.ts'
import { expectNoHorizontalOverflow } from '../theme-story-assertions.ts'

// Components/Layout/Grid: the headless Grid, styled by @kvirn-ui/theme/theme.css (DESIGN.md,
// Layout). Every placement is a class on the Root or the Item, never a prop. The responsive forms
// answer the grid's own width, so the stories reflow in the canvas, not only in the window.

const description = usageGuide(guide)

const services = ['Sophämtning', 'Bygglov', 'Skolskjuts', 'Äldreomsorg', 'Bibliotek', 'Simhall']

function cell(label: string, className?: string) {
  return (
    <Grid.Item key={label} className={className}>
      <Card.Root>
        <Card.Body>{label}</Card.Body>
      </Card.Root>
    </Grid.Item>
  )
}

const serviceCells = services.map((service) => cell(service))

const meta = {
  title: 'Components/Layout/Grid',
  component: Grid.Root,
  args: {
    className: 'kv-grid--cols-1 kv-grid--sm-cols-2 kv-grid--lg-cols-3',
    children: serviceCells,
  },
  argTypes: {
    as: { control: false, description: 'Another element: `ul` or `ol`, with `li` Items.' },
  },
  parameters: { a11yContract: contract, docs: { description: { component: description } } },
} satisfies Meta<typeof Grid.Root>

export default meta
type Story = StoryObj<typeof meta>

/** A page layout on 12 columns: one column below `lg`, then 8 + 4. The DOM order is the reading order. */
export const Default: Story = {
  args: {
    className: 'kv-grid--cols-1 kv-grid--lg-cols-12',
    children: [
      cell('Huvudinnehåll', 'kv-grid-item--lg-span-8'),
      cell('Sidopanel', 'kv-grid-item--lg-span-4'),
    ],
  },
}

/** `cols-1` → `sm-cols-2` → `lg-cols-3` → `xl-cols-4`: mobile first, from the grid's own width. */
export const Responsive: Story = {
  args: {
    className: 'kv-grid--cols-1 kv-grid--sm-cols-2 kv-grid--lg-cols-3 kv-grid--xl-cols-4',
  },
}

/** `fit-sm`: as many columns as fit, each at least `14rem`. */
export const FitSmall: Story = { args: { className: 'kv-grid--fit-sm' } }

/** `fit-md`: each column at least `18rem`. */
export const FitMedium: Story = { args: { className: 'kv-grid--fit-md' } }

/** `fit-lg`: fewer, wider columns, each at least `24rem`. */
export const FitLarge: Story = { args: { className: 'kv-grid--fit-lg' } }

/** `span-*` and `span-full`. The items stay in DOM order, so reading and focus order match. */
export const SpansAndLines: Story = {
  args: {
    className: 'kv-grid--cols-1 kv-grid--sm-cols-4',
    children: [
      cell('Rubrik, span-full', 'kv-grid-item--span-full'),
      cell('span-2', 'kv-grid-item--sm-span-2'),
      cell('span-1'),
      cell('span-1'),
      cell('start-2, end-4', 'kv-grid-item--sm-start-2 kv-grid-item--sm-end-4'),
    ],
  },
}

/**
 * `start-*` and `end-*` place an item on a line. Here every item is placed in DOM order, so the
 * visual order equals the reading and focus order (1.3.2, 2.4.3). Placing a later item before an
 * earlier one would break that.
 */
export const Lines: Story = {
  args: {
    className: 'kv-grid--cols-1 kv-grid--sm-cols-6',
    children: [
      cell('Första, 1 till 3', 'kv-grid-item--sm-start-1 kv-grid-item--sm-end-3'),
      cell('Andra, 4 till 7', 'kv-grid-item--sm-start-4 kv-grid-item--sm-end-7'),
    ],
  },
}

/** `rows-*` and `row-span-*`: the first item spans both rows. */
export const Rows: Story = {
  args: {
    className: 'kv-grid--cols-1 kv-grid--sm-cols-2 kv-grid--sm-rows-2',
    children: [cell('row-span-2', 'kv-grid-item--sm-row-span-2'), cell('Överst'), cell('Nederst')],
  },
}

/** `gap-0`, `gap-4` and `gap-8`, then `gap-x-8 gap-y-2`. */
export const Gaps: Story = {
  render: () => (
    <>
      {[
        'kv-grid--gap-0',
        'kv-grid--gap-4',
        'kv-grid--gap-8',
        'kv-grid--gap-x-8 kv-grid--gap-y-2',
      ].map((gap) => (
        <Grid.Root key={gap} className={`kv-grid--cols-1 kv-grid--sm-cols-3 ${gap}`}>
          {cell(gap)}
          {cell('B')}
          {cell('C')}
        </Grid.Root>
      ))}
    </>
  ),
}

/** `items-*` on the Root, `justify-*` on the Root, `self-*` on an Item. */
export const Alignment: Story = {
  render: () => (
    <>
      <Grid.Root className="kv-grid--cols-1 kv-grid--sm-cols-3 kv-grid--items-start">
        {cell('items-start')}
        {cell('Längre text som gör raden högre än de andra cellerna i den här raden')}
        {cell('C')}
      </Grid.Root>
      <Grid.Root className="kv-grid--cols-1 kv-grid--sm-cols-3 kv-grid--items-center">
        {cell('items-center')}
        {cell('Längre text som gör raden högre än de andra cellerna i den här raden')}
        {cell('C')}
      </Grid.Root>
      <Grid.Root className="kv-grid--cols-1 kv-grid--sm-cols-3">
        {cell('Standard')}
        {cell('Längre text som gör raden högre än de andra cellerna i den här raden')}
        {cell('self-end', 'kv-grid-item--self-end')}
      </Grid.Root>
      <Grid.Root className="kv-grid--cols-1 kv-grid--sm-cols-3 kv-grid--justify-items-center">
        {cell('justify-items-center')}
        {cell('B')}
        {cell('C')}
      </Grid.Root>
    </>
  ),
}

/** A subgrid: `kv-grid-item--sm-subgrid` makes the Item a grid on the parent's four column tracks, so its cells line up with the cells around it. */
export const Subgrid: Story = {
  args: { className: 'kv-grid--cols-1 kv-grid--sm-cols-4' },
  render: (args) => (
    <Grid.Root {...args}>
      {cell('Rad 1, kolumn 1')}
      <Grid.Item className="kv-grid-item--sm-subgrid kv-grid-item--sm-span-3">
        {cell('Underrutnät A')}
        {cell('Underrutnät B')}
        {cell('Underrutnät C')}
      </Grid.Item>
    </Grid.Root>
  ),
}

/**
 * A grid in an Item reflows to the Item's width, not the window's: the container query. The inner
 * Root sits inside a `Grid.Item` because the Root wraps itself in a container element: the spans
 * go on the Item, which is the cell in the outer grid.
 */
export const Nested: Story = {
  args: { className: 'kv-grid--cols-1 kv-grid--lg-cols-12' },
  render: (args) => (
    <Grid.Root {...args}>
      <Grid.Item className="kv-grid-item--lg-span-8">
        <Grid.Root className="kv-grid--cols-1 kv-grid--sm-cols-2">
          {cell('Inre A')}
          {cell('Inre B')}
          {cell('Inre C')}
          {cell('Inre D')}
        </Grid.Root>
      </Grid.Item>
      <Grid.Item className="kv-grid-item--lg-span-4">
        <Grid.Root className="kv-grid--cols-1 kv-grid--sm-cols-2">
          {cell('Smal A')}
          {cell('Smal B')}
        </Grid.Root>
      </Grid.Item>
    </Grid.Root>
  ),
}

/** `as="ul"` with `Grid.Item as="li"`: a list of links, announced as a list with a count. */
export const AsList: Story = {
  render: (args) => (
    <Grid.Root as="ul" className={args.className}>
      {services.map((service) => (
        <Grid.Item key={service} as="li">
          <Card.Root>
            <Card.Body>
              <a href="#service">{service}</a>
            </Card.Body>
          </Card.Root>
        </Grid.Item>
      ))}
    </Grid.Root>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('list')).toBeVisible()
    await expect(canvas.getAllByRole('listitem')).toHaveLength(services.length)
  },
}

/** A 320px column: one column, a long Finnish word wraps, nothing scrolls sideways (1.4.10). */
export const Reflow320: Story = {
  args: {
    className: 'kv-grid--cols-1 kv-grid--sm-cols-2 kv-grid--lg-cols-3',
    children: cell('Jätehuoltomaksunpalautuspäätöksentarkistuslomake'),
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

/** Right to left: the first cell is at the right. */
export const RTL: Story = { globals: { dir: 'rtl', locale: 'en' } }

/** The cards' edges survive forced colours. */
export const ForcedColors: Story = { globals: { forcedColors: 'active' } }
