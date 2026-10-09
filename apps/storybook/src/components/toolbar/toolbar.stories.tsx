import { Toolbar } from '@kvirn-ui/react'
import contract from '../../../../../packages/react/src/toolbar/toolbar.a11y.md?raw'
import guide from '../../../../../packages/react/src/toolbar/toolbar.md?raw'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, waitFor } from 'storybook/test'
import { showSource, usageGuide } from '../../docs-source.ts'
import { expectMinimumTargetSize, expectNoHorizontalOverflow } from '../theme-story-assertions.ts'
import {
  FinnishToolbar,
  FormattingToolbar,
  RowActionsToolbar,
  SpacedGroupsToolbar,
  TextToolbar,
} from './toolbar.fixture.tsx'

// Components/Toolbar: one Tab stop for a row of related controls, with the arrow keys between
// them (APG Toolbar, contract: toolbar.a11y.md), styled by @kvirn-ui/theme/theme.css.

const meta = {
  title: 'Components/Toolbar',
  component: Toolbar.Root,
  // Every option at its default, so the main example starts where an adopter starts.
  args: { 'aria-label': 'Formatering', orientation: 'horizontal', loop: true },
  // Every prop of Toolbar.Root in toolbar.tsx and use-toolbar.ts. Any other `<div>` prop passes through.
  argTypes: {
    orientation: {
      control: 'inline-radio',
      options: ['horizontal', 'vertical'],
      description:
        'The axis of the arrow keys. `horizontal` (default): Left and Right, which flip in right-to-left text. `vertical`: Down and Up, and `aria-orientation="vertical"`. The default theme draws horizontal toolbars.',
    },
    loop: {
      control: 'boolean',
      description:
        'Whether the arrows wrap from the last control to the first, and back. Default `true`, as in APG’s example.',
    },
    'aria-label': {
      control: 'text',
      description:
        'The toolbar’s name, from your translations. A name is required: use this or `aria-labelledby`. A development warning says so.',
    },
    'aria-labelledby': {
      control: 'text',
      description: 'The id of the element that names the toolbar. Use it instead of `aria-label`.',
    },
    'aria-controls': {
      control: 'text',
      description:
        'The id of the element the toolbar acts on, such as a text area, as in APG’s example.',
    },
    className: {
      control: false,
      description: 'Your own classes, added to `kv-toolbar`.',
    },
    ref: { control: false, description: 'A ref to the toolbar’s element.' },
    as: { control: false, description: 'Another element for the Root: `section`.' },
  },
  globals: { locale: 'sv' },
  parameters: {
    a11yContract: contract,
    docs: { description: { component: usageGuide(guide) } },
  },
} satisfies Meta<typeof Toolbar.Root>

export default meta
type Story = StoryObj<typeof meta>

/**
 * The main example: a formatting toolbar with three named groups, each one a joined strip of buttons. Tab enters it once, at the
 * first control, and the arrow keys move between the controls, across groups. Fet is on to
 * start with. Every option is a control below.
 */
export const Default: Story = {
  parameters: showSource('toolbar/toolbar.fixture.tsx', 'TextToolbar'),
  render: (args) => <TextToolbar {...args} />,
  play: async ({ canvas }) => {
    const toolbar = canvas.getByRole('toolbar', { name: 'Formatering' })
    await expect(toolbar).not.toHaveAttribute('aria-orientation')
    await expect(canvas.getByRole('group', { name: 'Textstil' })).toHaveClass(
      'kv-button-group--attached',
    )
    // One Tab stop: the first control has tabindex 0 and the other six -1. The controls
    // register after the first render.
    await waitFor(() => expect(toolbar.querySelectorAll('[tabindex="0"]')).toHaveLength(1))
    await expect(toolbar.querySelectorAll('[tabindex="-1"]')).toHaveLength(6)
    await expect(canvas.getByRole('button', { name: 'Fet' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    for (const control of canvas.getAllByRole('button')) {
      await expectMinimumTargetSize(control)
    }
  },
}

/** `Toolbar.Group` is attached by default; `layout="spaced"` gives a group a gap between its buttons instead. */
export const SpacedGroups: Story = {
  parameters: showSource('toolbar/toolbar.fixture.tsx', 'SpacedGroupsToolbar'),
  render: () => <SpacedGroupsToolbar />,
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('group', { name: 'Textstil' })).not.toHaveClass(
      'kv-button-group--attached',
    )
  },
}

/**
 * The fixture the keyboard tests drive: a button before, the toolbar, a button after and a counter.
 * It holds a disabled button, a Listbox trigger and a Popover trigger, put in with `Toolbar.Item`
 * and `as`. Try the keys in the Keyboard section above: Tab enters at the first control and
 * leaves with the next Tab, the arrows move and wrap, and Home and End go to the ends.
 */
export const Keyboard: Story = {
  parameters: showSource('toolbar/toolbar.fixture.tsx', 'FormattingToolbar'),
  render: () => <FormattingToolbar locale="sv" />,
  play: async ({ canvas }) => {
    const toolbar = canvas.getByRole('toolbar', { name: 'Formatering' })
    await waitFor(() => expect(toolbar.querySelectorAll('[tabindex="0"]')).toHaveLength(1))
    // The Listbox trigger sets its own tabindex 0, and the toolbar's roving one wins.
    await expect(canvas.getByRole('combobox', { name: 'Texttyp' })).toHaveAttribute(
      'tabindex',
      '-1',
    )
    // A disabled control stays focusable, so the arrows reach it.
    await expect(canvas.getByRole('button', { name: 'Gör om' })).toHaveAttribute(
      'aria-disabled',
      'true',
    )
  },
}

/**
 * `orientation="vertical"`: Down and Up move between the controls, and the toolbar says
 * `aria-orientation="vertical"`. Left and Right are not taken. The layout is your own CSS.
 */
export const Vertical: Story = {
  parameters: showSource('toolbar/toolbar.fixture.tsx', 'RowActionsToolbar'),
  render: () => <RowActionsToolbar />,
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('toolbar', { name: 'Åtgärder för raden' })).toHaveAttribute(
      'aria-orientation',
      'vertical',
    )
  },
}

/**
 * Names are long in Finnish. The toolbar wraps group by group in a narrow column, and a group
 * wider than the row wraps inside itself: nothing shrinks, truncates or scrolls sideways (1.4.10).
 */
export const Wrapping: Story = {
  globals: { locale: 'fi' },
  parameters: showSource('toolbar/toolbar.fixture.tsx', 'FinnishToolbar'),
  render: () => (
    <div className="kv-story-narrow" data-testid="narrow">
      <FinnishToolbar />
    </div>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('toolbar', { name: 'Muotoilu' })).toBeVisible()
    await expectNoHorizontalOverflow(canvas.getByTestId('narrow'))
    for (const control of canvas.getAllByRole('button')) {
      await expectMinimumTargetSize(control)
    }
  },
}

/** Inside `kv-compact`, controls are 32px from 64rem, and every one is still at least 24 × 24 (2.5.8). */
export const CompactDensity: Story = {
  render: (args) => (
    <div className="kv-compact">
      <TextToolbar {...args} />
    </div>
  ),
  play: async ({ canvas }) => {
    for (const control of canvas.getAllByRole('button')) {
      await expectMinimumTargetSize(control)
    }
  },
}

/** Right to left, in English: the arrows flip, so Left is the next control and Right the previous. */
export const RTL: Story = {
  globals: { dir: 'rtl', locale: 'en' },
  parameters: showSource('toolbar/toolbar.fixture.tsx', 'FormattingToolbar'),
  render: () => <FormattingToolbar locale="en" />,
}

/**
 * Forced colours: a pressed toggle is a `Highlight` fill with `HighlightText`, the buttons keep
 * their edges, and the line between groups is `GrayText`. This story sets forced colours for review,
 * and the dedicated forced-colours sweep (`E2E_BROWSERS=sweep`) checks it with real emulation.
 */
export const ForcedColors: Story = {
  globals: { forcedColors: 'active' },
  parameters: showSource('toolbar/toolbar.fixture.tsx', 'TextToolbar'),
  render: (args) => <TextToolbar {...args} />,
}
