import { Tooltip } from '@kvirn-ui/react'
import contract from '../../../../../packages/react/src/tooltip/tooltip.a11y.md?raw'
import guide from '../../../../../packages/react/src/tooltip/tooltip.md?raw'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn, waitFor } from 'storybook/test'
import { showSource, usageGuide } from '../../docs-source.ts'
import { expectMinimumTargetSize } from '../theme-story-assertions.ts'
import {
  BoldToggle,
  FormattingToolbar,
  LongTooltip,
  PrintButton,
  SearchButton,
  TextToolbar,
  TooltipAtTheTop,
  TooltipInAPopover,
} from './tooltip.fixture.tsx'

// Components/Tooltip: a name and a shortcut for a control, shown on hover and keyboard focus
// (APG Tooltip, contract: tooltip.a11y.md), styled by @kvirn-ui/theme/theme.css.

/** An open tooltip fades in: wait for it, so the checks that follow see it fully drawn. */
const waitForFade = () =>
  waitFor(() =>
    expect(document.getAnimations().every((animation) => animation.playState !== 'running')).toBe(
      true,
    ),
  )

const meta = {
  title: 'Components/Tooltip',
  component: Tooltip.Root,
  // Every option at its default, so the main example starts where an adopter starts.
  args: {
    defaultOpen: false,
    placement: 'top',
    offset: 4,
    padding: 8,
    delay: 500,
    closeDelay: 100,
    onOpenChange: fn(),
  },
  // Every prop of Tooltip.Root in tooltip.tsx and use-tooltip.ts. The parts' props are in the API section.
  argTypes: {
    open: {
      control: 'boolean',
      description:
        'Controlled: whether the tooltip is open. Pair it with `onOpenChange`. Leave it unset for an uncontrolled tooltip.',
    },
    defaultOpen: {
      control: 'boolean',
      description: 'Uncontrolled: whether the tooltip starts open. Default `false`.',
    },
    onOpenChange: {
      control: false,
      description:
        'Called when the user opens or closes it, with `(open, { reason })`. The reason is `hover`, `focus`, `escape`, `pointer-leave`, `blur` or `trigger-press`. It only reports: with `open` set, you change it.',
    },
    placement: {
      control: 'select',
      options: [
        'top',
        'top-start',
        'top-end',
        'bottom',
        'bottom-start',
        'bottom-end',
        'start',
        'end',
      ],
      description:
        'Where the tooltip goes when there is room. Default `top`: above, because the text the user works on is usually below. It flips when it doesn’t fit, so it doesn’t cover its trigger.',
    },
    offset: {
      control: 'number',
      description: 'The gap between the trigger and the tooltip, in pixels. Default 4.',
    },
    padding: {
      control: 'number',
      description: 'The space kept to the edge of the viewport, in pixels. Default 8.',
    },
    delay: {
      control: 'number',
      description:
        'Milliseconds the pointer rests on the trigger before it opens. Default 500. Keyboard focus opens it at once, and so does the next tooltip right after one closed.',
    },
    closeDelay: {
      control: 'number',
      description:
        'Milliseconds after the pointer leaves before it closes, so the pointer can cross onto the tooltip. Default 100.',
    },
    group: {
      control: false,
      description:
        'Where tooltips share their delay. Default: one group for the page. Make one with `createTooltipGroup()` to scope it.',
    },
    children: { control: false, description: '`Tooltip.Trigger` and `Tooltip.Popup`.' },
  },
  globals: { locale: 'sv' },
  parameters: {
    a11yContract: contract,
    docs: { description: { component: usageGuide(guide) } },
  },
} satisfies Meta<typeof Tooltip.Root>

export default meta
type Story = StoryObj<typeof meta>

const isTooltipShown = () =>
  document.querySelector('.kv-tooltip')?.matches(':popover-open') === true

/**
 * The main example: an icon-only button whose tooltip repeats its name. Hover the button for half a
 * second, or Tab to it, and press Escape to hide the tooltip. Every option is a control below.
 */
export const Default: Story = {
  parameters: showSource('tooltip/tooltip.fixture.tsx', 'SearchButton'),
  render: (args) => (
    <div style={{ paddingBlockStart: '4rem' }}>
      <SearchButton {...args} />
    </div>
  ),
  play: async ({ canvas }) => {
    const button = canvas.getByRole('button', { name: 'Sök' })
    // A tooltip with only the name adds no description: the name is the button's own.
    await expect(button).not.toHaveAttribute('aria-describedby')
    await expect(document.querySelector('.kv-tooltip')).toHaveAttribute('role', 'tooltip')
    await expect(document.querySelector('.kv-tooltip-name')).toHaveAttribute('aria-hidden', 'true')
    await expect(isTooltipShown()).toBe(false)
    await expectMinimumTargetSize(button)
  },
}

/**
 * A name and a shortcut. The name is hidden from assistive technology and the shortcut is the
 * button's description, so a screen reader hears the name once and learns the shortcut. The
 * button keeps its own `aria-keyshortcuts`.
 */
export const WithAShortcut: Story = {
  parameters: showSource('tooltip/tooltip.fixture.tsx', 'BoldToggle'),
  render: (args) => (
    <div style={{ paddingBlockStart: '4rem' }}>
      <BoldToggle {...args} />
    </div>
  ),
  play: async ({ canvas }) => {
    const toggle = canvas.getByRole('button', { name: 'Fetstil' })
    await expect(toggle).toHaveAttribute('aria-pressed', 'false')
    await expect(toggle).toHaveAttribute('aria-keyshortcuts', 'Control+B')
    const shortcut = document.getElementById(toggle.getAttribute('aria-describedby') ?? '')
    await expect(shortcut).toHaveTextContent('Ctrl+B')
  },
}

/**
 * Plain text is the button's description as a whole, as in APG: it adds something the name doesn't
 * say. Never essential information, because a touch user never sees it.
 */
export const PlainDescription: Story = {
  parameters: showSource('tooltip/tooltip.fixture.tsx', 'PrintButton'),
  render: (args) => (
    <div style={{ paddingBlockStart: '4rem' }}>
      <PrintButton {...args} />
    </div>
  ),
  play: async ({ canvas }) => {
    const button = canvas.getByRole('button', { name: 'Skriv ut' })
    await expect(button).toHaveAttribute(
      'aria-describedby',
      document.querySelector('.kv-tooltip')?.id ?? '',
    )
  },
}

/**
 * Open from the start (`defaultOpen`), for review: the tooltip above its button, in the top layer.
 * Opening is never by itself in real use: the pointer or keyboard focus does it.
 */
export const Open: Story = {
  args: { defaultOpen: true },
  parameters: showSource('tooltip/tooltip.fixture.tsx', 'BoldToggle'),
  render: (args) => (
    <div style={{ paddingBlock: '4rem 2rem' }}>
      <BoldToggle {...args} />
    </div>
  ),
  play: async ({ canvas }) => {
    await waitFor(() => expect(isTooltipShown()).toBe(true))
    await waitForFade()
    await expect(canvas.getByRole('tooltip')).toBeVisible()
    await expect(document.querySelector('.kv-tooltip')).toHaveAttribute('data-open')
  },
}

/**
 * A tooltip on every control of a toolbar, through `as`. A disabled button stays focusable, so
 * its tooltip works too. Arrow along the toolbar: each tooltip opens at once and replaces the last.
 */
export const InAToolbar: Story = {
  parameters: showSource('tooltip/tooltip.fixture.tsx', 'TextToolbar'),
  render: () => (
    <div style={{ paddingBlockStart: '4rem' }}>
      <TextToolbar />
    </div>
  ),
  play: async ({ canvas }) => {
    const toolbar = canvas.getByRole('toolbar', { name: 'Formatering' })
    await waitFor(() => expect(toolbar.querySelectorAll('[tabindex="0"]')).toHaveLength(1))
    // The tooltips are no items: four controls, one Tab stop.
    await expect(toolbar.querySelectorAll('[tabindex]')).toHaveLength(4)
    for (const control of canvas.getAllByRole('button')) {
      await expectMinimumTargetSize(control)
    }
  },
}

/**
 * The fixture the keyboard tests drive: a button before, a toolbar with a tooltip on every control,
 * a button after. Link opens a Popover, and its tooltip closes while the popover is open. Try the
 * keys in the Keyboard section above: Tab to a control and its tooltip opens at once, arrows move
 * along the toolbar, and Escape hides the tooltip. Or hover a control for half a second.
 */
export const Keyboard: Story = {
  parameters: showSource('tooltip/tooltip.fixture.tsx', 'FormattingToolbar'),
  render: () => (
    <div style={{ paddingBlockStart: '4rem' }}>
      <FormattingToolbar locale="sv" />
    </div>
  ),
  play: async ({ canvas }) => {
    const toolbar = canvas.getByRole('toolbar', { name: 'Formatering' })
    await waitFor(() => expect(toolbar.querySelectorAll('[tabindex="0"]')).toHaveLength(1))
    // A disabled control stays focusable, so its tooltip can open.
    await expect(canvas.getByRole('button', { name: 'Gör om' })).toHaveAttribute(
      'aria-disabled',
      'true',
    )
  },
}

/**
 * A tooltip on a control inside a Popover. Escape hides the tooltip and leaves the Popover open: the
 * tooltip is the innermost layer, and the next Escape closes the Popover.
 */
export const UnderAPopover: Story = {
  parameters: showSource('tooltip/tooltip.fixture.tsx', 'TooltipInAPopover'),
  render: () => (
    <div style={{ paddingBlock: '8rem 4rem' }}>
      <TooltipInAPopover />
    </div>
  ),
}

/**
 * Where there is no room above, the tooltip flips below (`data-placement="bottom"`), and it never
 * covers its trigger.
 */
export const FlipsAtTheEdge: Story = {
  args: { defaultOpen: true },
  parameters: showSource('tooltip/tooltip.fixture.tsx', 'TooltipAtTheTop'),
  render: (args) => <TooltipAtTheTop {...args} />,
  play: async () => {
    await waitFor(() => expect(isTooltipShown()).toBe(true))
    await waitFor(() =>
      expect(document.querySelector('.kv-tooltip')?.getAttribute('data-placement')).toMatch(
        /^bottom/,
      ),
    )
    await waitForFade()
  },
}

/**
 * Long text in Finnish: the tooltip is at most 20rem wide and wraps, and is never wider than the
 * viewport (1.4.10). A tooltip is one short line in practice.
 */
export const LongText: Story = {
  args: { defaultOpen: true },
  globals: { locale: 'fi' },
  parameters: showSource('tooltip/tooltip.fixture.tsx', 'LongTooltip'),
  render: (args) => (
    <div className="kv-story-narrow" data-testid="narrow" style={{ paddingBlock: '10rem 2rem' }}>
      <LongTooltip {...args} />
    </div>
  ),
  play: async () => {
    await waitFor(() => expect(isTooltipShown()).toBe(true))
    // The tooltip is in the top layer, so measure it against the viewport, not its container.
    const box = document.querySelector('.kv-tooltip')?.getBoundingClientRect()
    await expect(box?.left ?? 0).toBeGreaterThanOrEqual(0)
    await expect(box?.right ?? 0).toBeLessThanOrEqual(document.documentElement.clientWidth)
  },
}

/**
 * Right to left, in English: the toolbar's arrows flip, and each tooltip is centred on its
 * control, so nothing else flips.
 */
export const RTL: Story = {
  globals: { dir: 'rtl', locale: 'en' },
  parameters: showSource('tooltip/tooltip.fixture.tsx', 'FormattingToolbar'),
  render: () => (
    <div style={{ paddingBlockStart: '4rem' }}>
      <FormattingToolbar locale="en" />
    </div>
  ),
}

/**
 * Forced colours: a `Canvas` fill, `CanvasText` text and a 1px `CanvasText` edge, with no shadow. This story
 * sets forced colours for review, and the dedicated forced-colours sweep (`E2E_BROWSERS=sweep`)
 * checks it with real emulation.
 */
export const ForcedColors: Story = {
  globals: { forcedColors: 'active' },
  args: { defaultOpen: true },
  parameters: showSource('tooltip/tooltip.fixture.tsx', 'BoldToggle'),
  render: (args) => (
    <div style={{ paddingBlock: '4rem 2rem' }}>
      <BoldToggle {...args} />
    </div>
  ),
}
