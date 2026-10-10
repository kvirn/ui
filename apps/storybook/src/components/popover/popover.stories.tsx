import { Button, Popover } from '@kvirn-ui/react'
import contract from '../../../../../packages/react/src/popover/popover.a11y.md?raw'
import guide from '../../../../../packages/react/src/popover/popover.md?raw'
import type { Decorator, Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, waitFor } from 'storybook/test'
import { showSource, usageGuide } from '../../docs-source.ts'
import { ControlledPopover } from './popover.fixture.tsx'

// Components/Popover: a button that opens a small floating panel in the browser's top layer
// (contract: popover.a11y.md). The default theme doesn't style it yet, so a decorator draws the
// panel with existing tokens (the code shown for a story has no styling in it).

const description = usageGuide(guide)

/**
 * What the default theme will draw: a raised surface, a 1px edge and a popup shadow. The popup is
 * in the top layer, so the stories' wrapper can't style it: this stylesheet does, for every story.
 * The first and last child of a popup lose their outer margin, as the theme will.
 */
const popupStyles = `
.kv-popover-popup {
  box-sizing: border-box;
  max-inline-size: 20rem;
  padding: var(--kv-space-4, 16px);
  color: var(--kv-color-text, CanvasText);
  background: var(--kv-color-surface-raised, Canvas);
  border: var(--kv-border-width, 1px) solid var(--kv-color-border-control, CanvasText);
  border-radius: var(--kv-radius-xl, 16px);
  box-shadow: var(--kv-shadow-popup, none);
}
.kv-popover-popup :first-child {
  margin-block-start: 0;
}
.kv-popover-popup :last-child {
  margin-block-end: 0;
}
`

/** Room under the trigger, so an open popup doesn't run off the canvas. */
const withRoomBelow: Decorator = (Story) => (
  <div style={{ minBlockSize: '12rem' }}>
    <Story />
  </div>
)

const meta = {
  title: 'Components/Choice and overlays/Popover',
  component: Popover.Root,
  argTypes: {
    open: { control: 'boolean', description: 'Controlled: whether the popup is open.' },
    defaultOpen: { control: 'boolean', description: 'Uncontrolled: whether it starts open.' },
    onOpenChange: { control: false },
    placement: {
      control: 'select',
      options: [
        'bottom-start',
        'bottom',
        'bottom-end',
        'top-start',
        'top',
        'top-end',
        'start',
        'end',
      ],
      description: 'Where the popup goes when there is room. It flips when it does not fit.',
    },
    offset: { control: 'number', description: 'The gap to the trigger in pixels. Default 4.' },
    padding: {
      control: 'number',
      description: 'The space kept to the edge of the viewport in pixels. Default 8.',
    },
    matchAnchorWidth: { control: 'boolean', description: 'Make the popup as wide as the trigger.' },
  },
  args: { onOpenChange: fn() },
  globals: { locale: 'sv' },
  decorators: [
    (Story) => (
      <>
        <style>{popupStyles}</style>
        <Story />
      </>
    ),
  ],
  // A popup with a paragraph and a Close button. Its name is the trigger's wording.
  render: (args) => (
    <Popover.Root {...args}>
      <Popover.Trigger className="kv-button">Om tjänsten</Popover.Trigger>
      <Popover.Popup aria-label="Om tjänsten">
        <p>Tjänsten drivs av kommunen och är öppen dygnet runt.</p>
        <p>
          <Popover.Close className="kv-button">Stäng</Popover.Close>
        </p>
      </Popover.Popup>
    </Popover.Root>
  ),
  parameters: {
    a11yContract: contract,
    docs: {
      description: { component: description },
    },
  },
} satisfies Meta<typeof Popover.Root>

export default meta
type Story = StoryObj<typeof meta>

const isPopupOpen = () =>
  document.querySelector('.kv-popover-popup')?.matches(':popover-open') === true

/** The popup that is open now, for a story with several popovers. */
const openPopup = () => document.querySelector('.kv-popover-popup:popover-open')

/** Closed: a button that says it has a popup (`aria-haspopup="dialog"`) and is collapsed. */
export const Default: Story = {
  play: async ({ canvas }) => {
    const trigger = canvas.getByRole('button', { name: 'Om tjänsten' })
    await expect(trigger).toHaveAttribute('aria-expanded', 'false')
    await expect(trigger).toHaveAttribute('aria-haspopup', 'dialog')
    await expect(trigger).toHaveAttribute('aria-controls')
    await expect(isPopupOpen()).toBe(false)
  },
}

/** Open: the popup sits under the button, in the top layer. Focus has not moved into it. */
export const Open: Story = {
  args: { defaultOpen: true },
  decorators: [withRoomBelow],
  play: async ({ canvas }) => {
    await waitFor(() => expect(isPopupOpen()).toBe(true))
    const trigger = canvas.getByRole('button', { name: 'Om tjänsten' })
    await expect(trigger).toHaveAttribute('aria-expanded', 'true')
    await expect(canvas.getByRole('dialog', { name: 'Om tjänsten' })).toBeVisible()
    await expect(document.querySelector('.kv-popover-popup')).toHaveAttribute('data-open')
  },
}

/**
 * The fixture the keyboard tests drive: a button before, the popover, a button after and a line of
 * text to press on. Try the keys in the Keyboard section above: Enter and Space on the trigger,
 * Tab into the popup and out of it, and Escape.
 */
export const Keyboard: Story = {
  render: (args) => (
    <>
      {/* Above the row, so the popup (placed under the trigger) never covers it. */}
      <p data-testid="outside">Text utanför</p>
      <div className="kv-button-group">
        <Button>Före</Button>
        <Popover.Root {...args}>
          <Popover.Trigger className="kv-button">Om tjänsten</Popover.Trigger>
          <Popover.Popup aria-label="Om tjänsten">
            <p>Tjänsten drivs av kommunen och är öppen dygnet runt.</p>
            <p>
              <Popover.Close className="kv-button">Stäng</Popover.Close>
            </p>
          </Popover.Popup>
        </Popover.Root>
        <Button>Efter</Button>
      </div>
    </>
  ),
}

/** Pressing the trigger opens the popup, and pressing it again closes it. */
export const Toggles: Story = {
  play: async ({ canvas, args }) => {
    const trigger = canvas.getByRole('button', { name: 'Om tjänsten' })
    await userEvent.click(trigger)
    await waitFor(() => expect(isPopupOpen()).toBe(true))
    await expect(args.onOpenChange).toHaveBeenLastCalledWith(
      true,
      expect.objectContaining({ reason: 'trigger-press' }),
    )
    await userEvent.click(trigger)
    await waitFor(() => expect(isPopupOpen()).toBe(false))
    await expect(trigger).toHaveAttribute('aria-expanded', 'false')
  },
}

/**
 * Controlled by your state: the popup shows the `open` it is given and reports every request
 * through `onOpenChange(open, { reason, event })`. Escape, a press outside and Close all ask to
 * close; you decide.
 */
export const Controlled: Story = {
  parameters: showSource('popover/popover.fixture.tsx', 'ControlledPopover'),
  decorators: [
    (Story) => (
      <div style={{ display: 'grid', gap: 'var(--kv-space-3, 12px)', justifyItems: 'start' }}>
        <Story />
      </div>
    ),
  ],
  render: () => <ControlledPopover />,
  play: async ({ canvas }) => {
    const reason = canvas.getByTestId('reason')
    // Your own button opens it: the popup follows `open`, and no request is made.
    await userEvent.click(canvas.getByRole('button', { name: 'Visa från sidan' }))
    await waitFor(() => expect(isPopupOpen()).toBe(true))
    await expect(canvas.getByTestId('state')).toHaveTextContent('öppen')
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(isPopupOpen()).toBe(false))
    await expect(canvas.getByTestId('state')).toHaveTextContent('stängd')
    await expect(reason).toHaveTextContent('escape')
    // Each way of asking has its own reason.
    await userEvent.click(canvas.getByRole('button', { name: 'Om tjänsten' }))
    await waitFor(() => expect(reason).toHaveTextContent('trigger-press'))
    await userEvent.click(canvas.getByRole('button', { name: 'Stäng' }))
    await waitFor(() => expect(reason).toHaveTextContent('close-press'))
    await userEvent.click(canvas.getByRole('button', { name: 'Om tjänsten' }))
    await userEvent.click(canvas.getByTestId('state'))
    await waitFor(() => expect(reason).toHaveTextContent('outside-press'))
    await waitFor(() => expect(isPopupOpen()).toBe(false))
  },
}

/** A popover inside a popover: Escape closes the innermost first, and each returns focus to its own trigger. */
export const Nested: Story = {
  render: () => (
    <Popover.Root>
      <Popover.Trigger className="kv-button">Yttre</Popover.Trigger>
      <Popover.Popup aria-label="Yttre ruta" className="outer">
        <p>Den yttre rutan.</p>
        <Popover.Root>
          <Popover.Trigger className="kv-button">Inre</Popover.Trigger>
          <Popover.Popup aria-label="Inre ruta" className="inner">
            <p>Den inre rutan.</p>
          </Popover.Popup>
        </Popover.Root>
      </Popover.Popup>
    </Popover.Root>
  ),
}

/** At the bottom edge there is no room below, so the popup flips above the trigger (`data-placement="top-start"`). */
export const FlipsAtTheEdge: Story = {
  // The decorator pins the trigger to the bottom of the canvas, so there is no room under it.
  decorators: [
    (Story) => (
      <>
        <style>{`
.kv-story-popover-bottom .kv-popover-trigger {
  position: fixed;
  inset-block-end: 16px;
  inset-inline-start: 16px;
}
`}</style>
        <div className="kv-story-popover-bottom">
          <Story />
        </div>
      </>
    ),
  ],
  render: (args) => (
    <Popover.Root {...args}>
      <Popover.Trigger className="kv-button">Om tjänsten</Popover.Trigger>
      <Popover.Popup aria-label="Om tjänsten">Tjänsten drivs av kommunen.</Popover.Popup>
    </Popover.Root>
  ),
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Om tjänsten' }))
    await waitFor(() =>
      expect(document.querySelector('.kv-popover-popup')).toHaveAttribute(
        'data-placement',
        'top-start',
      ),
    )
  },
}

/** The popup is as wide as the trigger: the same measure a Select or Combobox listbox uses. */
export const MatchAnchorWidth: Story = {
  args: { matchAnchorWidth: true },
  // A wide trigger, so the popup's width follows something you can see.
  decorators: [
    (Story) => (
      <>
        <style>{`
.kv-story-popover-wide .kv-popover-trigger {
  inline-size: 16rem;
}
`}</style>
        <div className="kv-story-popover-wide">
          <Story />
        </div>
      </>
    ),
  ],
  render: (args) => (
    <Popover.Root {...args}>
      <Popover.Trigger className="kv-button">Välj hur vi ska nå dig</Popover.Trigger>
      <Popover.Popup aria-label="Så når vi dig">Vi ringer eller skickar ett sms.</Popover.Popup>
    </Popover.Root>
  ),
}

/**
 * Where the popup goes: `placement` is a side (`top`, `bottom`, `start`, `end`), then `-start`,
 * `-center` or `-end`. `start` and `end` follow the reading direction. Each button here opens a
 * popup with another placement, and `data-placement` on the popup says which one is in use.
 */
export const Placements: Story = {
  decorators: [
    (Story) => (
      <div style={{ paddingBlock: '10rem' }}>
        <Story />
      </div>
    ),
  ],
  render: () => (
    <div className="kv-button-group">
      <Popover.Root placement="top-start">
        <Popover.Trigger className="kv-button">Ovanför</Popover.Trigger>
        <Popover.Popup aria-label="Ovanför">Rutan ligger ovanför knappen.</Popover.Popup>
      </Popover.Root>
      <Popover.Root placement="bottom-end">
        <Popover.Trigger className="kv-button">Under, till slutet</Popover.Trigger>
        <Popover.Popup aria-label="Under, till slutet">
          Rutan slutar där knappen slutar.
        </Popover.Popup>
      </Popover.Root>
      <Popover.Root placement="bottom">
        <Popover.Trigger className="kv-button">Under, i mitten</Popover.Trigger>
        <Popover.Popup aria-label="Under, i mitten">
          Rutan är centrerad under knappen.
        </Popover.Popup>
      </Popover.Root>
    </div>
  ),
  play: async ({ canvas }) => {
    for (const [name, placement] of [
      ['Ovanför', 'top-start'],
      ['Under, till slutet', 'bottom-end'],
      ['Under, i mitten', 'bottom'],
    ] as const) {
      await userEvent.click(canvas.getByRole('button', { name }))
      await waitFor(() => expect(openPopup()).not.toBeNull())
      await waitFor(() =>
        expect(canvas.getByRole('dialog', { name })).toHaveAttribute('data-placement', placement),
      )
      await userEvent.keyboard('{Escape}')
      await waitFor(() => expect(openPopup()).toBeNull())
    }
  },
}

/**
 * Size the popup with the two variables it sets and reads. `--kv-popup-height-limit` (yours, a
 * length) caps the height below the room that is left, so a long popup scrolls inside, and
 * `--kv-anchor-width` (set on the popup, the trigger's width) lets the CSS use it, here as a minimum
 * width. The class that does it is in this story's decorator:
 * `.kv-popover-sized { --kv-popup-height-limit: 8rem; min-inline-size: var(--kv-anchor-width); overflow-y: auto; }`.
 * The popup holds a link, so the region that scrolls has focusable content and a keyboard user can
 * reach the text below the fold (WCAG 2.1.1).
 */
export const SizedWithVariables: Story = {
  decorators: [
    (Story) => (
      <>
        <style>{`
.kv-popover-sized {
  --kv-popup-height-limit: 8rem;
  min-inline-size: var(--kv-anchor-width);
  overflow-y: auto;
}
`}</style>
        <Story />
      </>
    ),
    withRoomBelow,
  ],
  render: (args) => (
    <Popover.Root {...args}>
      <Popover.Trigger className="kv-button">Villkor</Popover.Trigger>
      <Popover.Popup aria-label="Villkor" className="kv-popover-sized">
        {Array.from({ length: 12 }, (_, index) => (
          <p key={index}>Villkor {index + 1}: uppgifter du lämnar används bara för ditt ärende.</p>
        ))}
        <a href="#villkor">Läs hela villkoren</a>
      </Popover.Popup>
    </Popover.Root>
  ),
  play: async ({ canvas }) => {
    const trigger = canvas.getByRole('button', { name: 'Villkor' })
    await userEvent.click(trigger)
    await waitFor(() => expect(isPopupOpen()).toBe(true))
    const popup = canvas.getByRole('dialog', { name: 'Villkor' })
    // The popup publishes the trigger's width, and the long content scrolls inside it (1.4.10).
    await waitFor(() =>
      expect(parseFloat(popup.style.getPropertyValue('--kv-anchor-width'))).toBeCloseTo(
        trigger.getBoundingClientRect().width,
        0,
      ),
    )
    await expect(popup.scrollHeight).toBeGreaterThan(popup.clientHeight)
  },
}

/** A popup taller than the room scrolls inside: its height is limited by `--kv-popup-max-height` (1.4.10). */
export const LongContent: Story = {
  render: (args) => (
    <Popover.Root {...args}>
      <Popover.Trigger className="kv-button">Villkor</Popover.Trigger>
      <Popover.Popup aria-label="Villkor">
        {Array.from({ length: 40 }, (_, index) => (
          <p key={index}>Villkor {index + 1}: uppgifter du lämnar används bara för ditt ärende.</p>
        ))}
      </Popover.Popup>
    </Popover.Root>
  ),
}

/** A popup with a form. Opening doesn't move focus: Tab goes from the trigger into the form. */
export const WithForm: Story = {
  render: (args) => (
    <Popover.Root {...args}>
      <Popover.Trigger className="kv-button">Ändra telefonnummer</Popover.Trigger>
      <Popover.Popup aria-label="Ändra telefonnummer">
        <form
          onSubmit={(event) => {
            event.preventDefault()
          }}
        >
          <label>
            Telefonnummer
            <br />
            <input name="phone" type="tel" autoComplete="tel" className="kv-input" />
          </label>
          <p>
            <button type="submit" className="kv-button kv-button--primary">
              Spara
            </button>{' '}
            <Popover.Close className="kv-button">Avbryt</Popover.Close>
          </p>
        </form>
      </Popover.Popup>
    </Popover.Root>
  ),
}

/** Right to left, in English: `bottom-start` lines the popup up with the trigger's right edge. */
export const RTL: Story = {
  globals: { dir: 'rtl', locale: 'en' },
  render: (args) => (
    <Popover.Root defaultOpen {...args}>
      <Popover.Trigger className="kv-button">About the service</Popover.Trigger>
      <Popover.Popup aria-label="About the service">
        The municipality runs the service, which is open all day.
        <p>
          <Popover.Close className="kv-button">Close</Popover.Close>
        </p>
      </Popover.Popup>
    </Popover.Root>
  ),
}

/** The popup keeps a visible edge in forced colours, and `aria-expanded` carries the state. */
export const ForcedColors: Story = {
  globals: { forcedColors: 'active' },
  args: { defaultOpen: true },
  decorators: [withRoomBelow],
}
