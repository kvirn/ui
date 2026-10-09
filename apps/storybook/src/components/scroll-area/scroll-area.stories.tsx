import { ScrollArea } from '@kvirn-ui/react'
import contract from '../../../../../packages/react/src/scroll-area/scroll-area.a11y.md?raw'
import guide from '../../../../../packages/react/src/scroll-area/scroll-area.md?raw'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent } from 'storybook/test'
import { showSource, usageGuide } from '../../docs-source.ts'
import { localeOf } from '../form/form.fixture.tsx'
import {
  AlwaysRegionArea,
  FeesTable,
  FittingArea,
  KeyboardArea,
  TallArea,
  scrollAreaTextsFor,
} from './scroll-area.fixture.tsx'

// Components/ScrollArea: a `<div>` with the browser's own scrollbars, styled by
// @kvirn-ui/theme/theme.css. While the content overflows it is a named region and a Tab stop, so a
// keyboard user can scroll it; when it fits it is a plain `<div>`. `Table.ScrollRegion` is the
// same behaviour for a table.

const meta = {
  title: 'Components/ScrollArea',
  component: ScrollArea,
  argTypes: {
    region: {
      control: 'inline-radio',
      options: ['overflow', 'always'],
      description:
        "`'overflow'` (default): a named region only while it scrolls. `'always'`: a named region either way. A Tab stop only while it scrolls.",
    },
    as: { control: false, description: 'Another element: `section`.' },
  },
  globals: { locale: 'sv' },
  parameters: {
    a11yContract: contract,
    docs: { description: { component: usageGuide(guide) } },
  },
} satisfies Meta<typeof ScrollArea>

export default meta
type Story = StoryObj<typeof meta>

/** A table wider than its box: a named region and a Tab stop, with the native scrollbar. */
export const Overflowing: Story = {
  parameters: showSource('scroll-area/scroll-area.fixture.tsx', 'FeesTable'),
  render: (_args, { globals }) => <FeesTable locale={localeOf(globals)} />,
  play: async ({ canvas, globals }) => {
    const { text } = scrollAreaTextsFor(localeOf(globals))
    const area = canvas.getByRole('region', { name: text.feesLabel })
    await expect(area).toHaveAttribute('tabindex', '0')
    await expect(area).toHaveAttribute('data-overflowing')
  },
}

/** Nothing overflows: a plain `<div>`, with no role, no name and no Tab stop. */
export const NoOverflow: Story = {
  parameters: showSource('scroll-area/scroll-area.fixture.tsx', 'FittingArea'),
  render: (_args, { globals }) => <FittingArea locale={localeOf(globals)} />,
  play: async ({ canvas }) => {
    await expect(canvas.queryByRole('region')).toBeNull()
    await expect(canvas.getByText(/./, { selector: 'p' }).parentElement).not.toHaveAttribute(
      'tabindex',
    )
  },
}

/** `region="always"`: a named region that fits too, and not a Tab stop until it scrolls. */
export const RegionAlways: Story = {
  parameters: showSource('scroll-area/scroll-area.fixture.tsx', 'AlwaysRegionArea'),
  render: (_args, { globals }) => <AlwaysRegionArea locale={localeOf(globals)} />,
  play: async ({ canvas, globals }) => {
    const { text } = scrollAreaTextsFor(localeOf(globals))
    const area = canvas.getByRole('region', { name: text.feesLabel })
    await expect(area).not.toHaveAttribute('tabindex')
  },
}

/** A height limit of your own makes it scroll down as well as sideways. */
export const Tall: Story = {
  parameters: showSource('scroll-area/scroll-area.fixture.tsx', 'TallArea'),
  render: (_args, { globals }) => <TallArea locale={localeOf(globals)} />,
  play: async ({ canvas, globals }) => {
    const { text } = scrollAreaTextsFor(localeOf(globals))
    await expect(canvas.getByRole('region', { name: text.feesLabel })).toHaveAttribute(
      'tabindex',
      '0',
    )
  },
}

/**
 * The fixture the keyboard tests drive. Try the keys in the Keyboard table above: the area is one
 * Tab stop between the two buttons.
 */
export const Keyboard: Story = {
  parameters: showSource('scroll-area/scroll-area.fixture.tsx', 'KeyboardArea'),
  render: (_args, { globals }) => <KeyboardArea locale={localeOf(globals)} />,
  play: async ({ canvas, globals }) => {
    const { text } = scrollAreaTextsFor(localeOf(globals))
    const area = canvas.getByRole('region', { name: text.feesLabel })
    canvas.getByRole('button', { name: text.keyboardBefore }).focus()
    await userEvent.tab()
    await expect(area).toHaveFocus()
    await userEvent.tab()
    await expect(canvas.getByRole('button', { name: text.keyboardAfter })).toHaveFocus()
  },
}

/** Right to left, in English: the scroll starts at the right, and the arrow keys reverse. */
export const RTL: Story = {
  globals: { dir: 'rtl', locale: 'en' },
  render: (_args, { globals }) => <FeesTable locale={localeOf(globals)} />,
}

/** The focus ring is an outline in forced colours, and the native scrollbars follow the system. */
export const ForcedColors: Story = {
  globals: { forcedColors: 'active' },
  render: (_args, { globals }) => <FeesTable locale={localeOf(globals)} />,
}
