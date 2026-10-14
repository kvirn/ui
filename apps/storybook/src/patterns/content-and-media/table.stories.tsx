import { en } from '@kvirn-ui/i18n/en'
import { KvirnProvider, Table } from '@kvirn-ui/react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import contract from '../../../../../packages/patterns/src/content-and-media/table/table.a11y.md?raw'
import { expect } from 'storybook/test'
import { expectNoHorizontalOverflow } from '../../components/theme-story-assertions.ts'
import { chromeViewports, narrowGlobals, wideGlobals } from '../patterns-story-support.tsx'

// Patterns/Content and media/Table (docs/design/storybook-patterns-t5.md S13).
// Story-only: it is the shipped static Table with a caption and a scroll region.

const description = `Compare figures, here preschool fees. A static [Table](?path=/docs/components-data-and-behaviour-table--docs) with a \`Table.Caption\` that names it, \`Table.ColumnHeader\` and \`Table.RowHeader\` so a screen reader says which headers a cell belongs to (1.3.1), and \`kv-table-column-header--numeric\` and \`kv-table-cell--numeric\` on columns of quantities. Put the unit in the header once. Wrap a wide table in \`Table.ScrollRegion\` named by the caption: it is a Tab stop only while the table overflows, so a keyboard user can scroll it (rule R6). Never turn the table into cards.

## Parts and gaps

Parts used: \`Table.Root\`, \`.ScrollRegion\`, \`.Caption\`, \`.Head\`, \`.Body\`, \`.Row\`, \`.ColumnHeader\`, \`.RowHeader\`, \`.Cell\`. No gap.
`

const meta = {
  title: 'Patterns/Content and media/Table',
  globals: { locale: 'en' },
  parameters: {
    a11yContract: contract,
    docs: { description: { component: description } },
    viewport: { options: chromeViewports },
  },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

const fees = [
  ['Under 30 000', '420', '600', '1 200'],
  ['30 000 to 50 000', '780', '1 100', '1 900'],
  ['50 000 to 70 000', '1 150', '1 500', '2 400'],
  ['Over 70 000', '1 500', '1 900', '2 900'],
]

/** Four columns and row headers. */
export const FourColumns: Story = {
  render: () => (
    <KvirnProvider locale="en" messages={en}>
      <div lang="en">
        <Table.Root>
          <Table.Caption>Preschool fees per month, in kr, by household income</Table.Caption>
          <Table.Head>
            <Table.Row>
              <Table.ColumnHeader>Income per month (kr)</Table.ColumnHeader>
              <Table.ColumnHeader className="kv-table-column-header--numeric">
                Child 1 (kr)
              </Table.ColumnHeader>
              <Table.ColumnHeader className="kv-table-column-header--numeric">
                Child 2 (kr)
              </Table.ColumnHeader>
              <Table.ColumnHeader className="kv-table-column-header--numeric">
                Child 3 (kr)
              </Table.ColumnHeader>
            </Table.Row>
          </Table.Head>
          <Table.Body>
            {fees.map(([income, one, two, three]) => (
              <Table.Row key={income}>
                <Table.RowHeader>{income}</Table.RowHeader>
                <Table.Cell className="kv-table-cell--numeric">{one}</Table.Cell>
                <Table.Cell className="kv-table-cell--numeric">{two}</Table.Cell>
                <Table.Cell className="kv-table-cell--numeric">{three}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </div>
    </KvirnProvider>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('table', { name: /Preschool fees per month/ })).toBeVisible()
    await expect(canvas.getAllByRole('columnheader')).toHaveLength(4)
    await expect(canvas.getAllByRole('rowheader')).toHaveLength(4)
  },
}

/** Six columns overflow at 320px inside a scroll region named by the caption. */
export const OverflowAt320: Story = {
  render: () => (
    <KvirnProvider locale="en" messages={en}>
      <div lang="en">
        <Table.ScrollRegion aria-labelledby="fees-caption">
          <Table.Root aria-labelledby="fees-caption">
            <Table.Caption id="fees-caption">Preschool fees by hours per week</Table.Caption>
            <Table.Head>
              <Table.Row>
                <Table.ColumnHeader>Hours per week</Table.ColumnHeader>
                <Table.ColumnHeader className="kv-table-column-header--numeric">
                  Monthly fee (kr)
                </Table.ColumnHeader>
                <Table.ColumnHeader className="kv-table-column-header--numeric">
                  Meals (kr)
                </Table.ColumnHeader>
                <Table.ColumnHeader className="kv-table-column-header--numeric">
                  Extra hours (kr)
                </Table.ColumnHeader>
                <Table.ColumnHeader className="kv-table-column-header--numeric">
                  Sibling discount (%)
                </Table.ColumnHeader>
                <Table.ColumnHeader className="kv-table-column-header--numeric">
                  Maximum per year (kr)
                </Table.ColumnHeader>
              </Table.Row>
            </Table.Head>
            <Table.Body>
              {[
                ['Up to 15', '420', '300', '60', '25', '5 040'],
                ['16 to 25', '780', '300', '60', '25', '9 360'],
                ['26 to 40', '1 150', '300', '60', '25', '13 800'],
              ].map(([hours, ...numbers]) => (
                <Table.Row key={hours}>
                  <Table.RowHeader>{hours}</Table.RowHeader>
                  {numbers.map((value, index) => (
                    <Table.Cell key={index} className="kv-table-cell--numeric">
                      {value}
                    </Table.Cell>
                  ))}
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        </Table.ScrollRegion>
      </div>
    </KvirnProvider>
  ),
  globals: { ...narrowGlobals },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('table', { name: 'Preschool fees by hours per week' }),
    ).toBeVisible()
    await expect(
      canvas.getByRole('region', { name: 'Preschool fees by hours per week' }),
    ).toBeVisible()
  },
}

/** Try the keys: Tab reaches the scroll region while the table overflows, the arrow keys scroll it. */
export const Keyboard: Story = { ...OverflowAt320 }

/** 320px: the four-column table fits or scrolls inside its region; the page does not. */
export const Narrow: Story = {
  ...FourColumns,
  globals: { ...narrowGlobals },
  play: async ({ canvasElement }) => {
    await expectNoHorizontalOverflow(canvasElement)
  },
}

/** 80rem: the table fills its column. */
export const Wide: Story = {
  ...FourColumns,
  globals: { ...wideGlobals },
}

/** Right to left: text columns start at the right, figures line up at the end. */
export const RTL: Story = {
  ...FourColumns,
  globals: { dir: 'rtl', locale: 'en' },
}

/** Forced colours: cell borders stay visible. */
export const ForcedColors: Story = {
  ...FourColumns,
  globals: { forcedColors: 'active' },
}
