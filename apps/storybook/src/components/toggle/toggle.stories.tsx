import { Card, Icon, Section, Toggle } from '@kvirn-ui/react'
import { eye } from '@kvirn-ui/icons'
import contract from '../../../../../packages/react/src/toggle/toggle.a11y.md?raw'
import guide from '../../../../../packages/react/src/toggle/toggle.md?raw'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { expect, fn, waitFor } from 'storybook/test'
import { showSource, usageGuide } from '../../docs-source.ts'
import { expectMinimumTargetSize, expectNoHorizontalOverflow } from '../theme-story-assertions.ts'

// Components/Toggle: a button that is on or off, styled by @kvirn-ui/theme/theme.css (contract:
// toggle.a11y.md).

/** Fixture text. Stories set `locale` to match it, so `lang` matches the content (3.1.2). */
const text = {
  unread: 'Show only unread',
  showPassword: 'Show password',
  map: 'Show map',
  before: 'Before',
  after: 'After',
  pressedCount: 'Number of changes',
  states: {
    off: 'Off',
    on: 'On',
    disabledOff: 'Disabled, off',
    disabledOn: 'Disabled, on',
    focusableDisabledOn: 'Disabled but focusable, on',
  },
  surfaces: { canvas: 'On the page', section: 'On a surface', card: 'On a card' },
  cardTitle: 'Messages',
}
// kv-lang-ok: Finnish locale story: a long label
const fiLong = 'Näytä vain ne rakennuslupahakemukset, jotka odottavat käsittelyä'

const meta = {
  title: 'Components/Choice and overlays/Toggle',
  component: Toggle,
  // Every option at its default, so the main example starts where an adopter starts.
  args: {
    children: text.unread,
    defaultPressed: false,
    disabled: false,
    focusableWhenDisabled: false,
    onPressedChange: fn(),
  },
  // Every prop in toggle.tsx and use-toggle.ts. Any other native `<button>` prop passes through.
  argTypes: {
    pressed: {
      control: 'boolean',
      description:
        'Controlled: whether the toggle is on. Sets `aria-pressed` and `data-pressed`. Pair it with `onPressedChange`: it only reports, you change `pressed`. Leave it out to let the toggle keep its own state.',
    },
    defaultPressed: {
      control: 'boolean',
      description: 'Uncontrolled: whether the toggle starts on. Default `false`.',
    },
    onPressedChange: {
      control: false,
      description:
        'Called with the new value and `{ event }` when the user switches the toggle. Never called while disabled.',
    },
    disabled: {
      control: 'boolean',
      description:
        'Natively disabled: skipped by Tab, and `aria-pressed` stays. Sets `data-disabled`.',
    },
    focusableWhenDisabled: {
      control: 'boolean',
      description:
        'With `disabled`: stays in the Tab order with `aria-disabled="true"` instead of `disabled`. Switching stays blocked.',
    },
    className: {
      control: 'select',
      options: [undefined, 'kv-button--icon-only'],
      description:
        'Your own classes, added to `kv-button kv-toggle`. `kv-button--icon-only` makes a toggle with only an icon square: give it an `aria-label`.',
    },
    'aria-label': {
      control: 'text',
      description:
        'The name of an icon-only toggle, from your translations. It never changes with the state.',
    },
    onClick: {
      control: false,
      description: 'Called after the switch, on every activation. Never called while disabled.',
    },
    children: { control: 'text', description: 'The visible label, which is the name.' },
    ref: { control: false, description: 'A ref to the `<button>`.' },
  },
  globals: { locale: 'en' },
  parameters: {
    a11yContract: contract,
    docs: { description: { component: usageGuide(guide) } },
  },
} satisfies Meta<typeof Toggle>

export default meta
type Story = StoryObj<typeof meta>

/**
 * The main example: a choice with a direct, visible effect. Press it, or use Enter and Space, and
 * `aria-pressed` switches. The label never changes with the state.
 */
export const Default: Story = {
  play: async ({ canvas }) => {
    const toggle = canvas.getByRole('button', { name: text.unread })
    await expect(toggle).toHaveAttribute('type', 'button')
    await expect(toggle).toHaveAttribute('aria-pressed', 'false')
    await expectMinimumTargetSize(toggle)
  },
}

/** `defaultPressed` starts it on: a solid fill with a light label, and `aria-pressed="true"`. */
export const Pressed: Story = {
  args: { defaultPressed: true },
  play: async ({ canvas }) => {
    const toggle = canvas.getByRole('button', { name: text.unread })
    await expect(toggle).toHaveAttribute('aria-pressed', 'true')
    await expect(toggle).toHaveAttribute('data-pressed', '')
  },
}

function ControlledExample({ label }: { label: string }) {
  const [isShown, setIsShown] = useState(false)
  return (
    <>
      <Toggle pressed={isShown} onPressedChange={setIsShown}>
        {label}
      </Toggle>
      <p>{isShown ? 'The map is shown.' : 'The map is hidden.'}</p>
    </>
  )
}

/**
 * Controlled by your state: the toggle shows the `pressed` it is given and reports each press
 * through `onPressedChange(pressed, { event })`. The label stays the same, "Show map", whatever
 * the state: the screen reader says it is on from `aria-pressed`.
 */
export const Controlled: Story = {
  parameters: showSource('toggle/toggle.stories.tsx', 'ControlledExample'),
  render: () => <ControlledExample label={text.map} />,
  play: async ({ canvas, userEvent }) => {
    const toggle = canvas.getByRole('button', { name: text.map })
    await userEvent.click(toggle)
    await waitFor(() => expect(toggle).toHaveAttribute('aria-pressed', 'true'))
    await expect(canvas.getByText('The map is shown.')).toBeVisible()
    await expect(canvas.getByRole('button', { name: text.map })).toBe(toggle)
  },
}

/**
 * An icon-only toggle: `kv-button--icon-only`, a decorative `Icon` and an `aria-label` from your
 * translations. Use it only where everyone knows the icon.
 */
export const IconOnly: Story = {
  parameters: {
    docs: {
      source: {
        code: `import { eye } from '@kvirn-ui/icons'

<Toggle className="kv-button--icon-only" aria-label="Show password">
  <Icon icon={eye} />
</Toggle>`,
        language: 'tsx',
        type: 'code',
      },
    },
  },
  args: {
    className: 'kv-button--icon-only',
    'aria-label': text.showPassword,
    children: <Icon icon={eye} />,
  },
  play: async ({ canvas, userEvent }) => {
    const toggle = canvas.getByRole('button', { name: text.showPassword })
    await expect(toggle.textContent).toBe('')
    await expectMinimumTargetSize(toggle)
    await userEvent.click(toggle)
    await expect(toggle).toHaveAttribute('aria-pressed', 'true')
    await expect(canvas.getByRole('button', { name: text.showPassword })).toBe(toggle)
  },
}

/** Natively disabled: skipped by Tab. It still says whether it is on. */
export const Disabled: Story = {
  args: { disabled: true, defaultPressed: true },
  render: (args) => (
    <>
      <Toggle {...args} />
      <button type="button" className="kv-button">
        {text.after}
      </button>
    </>
  ),
  play: async ({ canvas }) => {
    const toggle = canvas.getByRole('button', { name: text.unread })
    await expect(toggle).toBeDisabled()
    await expect(toggle).toHaveAttribute('aria-pressed', 'true')
    await expect(toggle).toHaveAttribute('data-disabled', '')
  },
}

function PressCounter({
  children,
  ...toggleProps
}: Parameters<typeof Toggle>[0] & { children: string }) {
  const [changes, setChanges] = useState(0)
  return (
    <>
      <Toggle {...toggleProps} onPressedChange={() => setChanges((count) => count + 1)}>
        {children}
      </Toggle>
      <p>
        {text.pressedCount}: {changes}
      </p>
    </>
  )
}

/**
 * Stays in the Tab order with `aria-disabled`, so a keyboard or screen-reader user finds it.
 * Enter and Space do nothing, and the counter shows it. Say why it is unavailable in text near
 * it, and link that text with `aria-describedby`.
 */
export const FocusableWhenDisabled: Story = {
  parameters: showSource('toggle/toggle.stories.tsx', 'PressCounter'),
  args: { disabled: true, focusableWhenDisabled: true },
  render: (args) => <PressCounter {...args}>{text.unread}</PressCounter>,
  play: async ({ canvas }) => {
    const toggle = canvas.getByRole('button', { name: text.unread })
    await expect(toggle).toHaveAttribute('aria-disabled', 'true')
    await expect(toggle).not.toHaveAttribute('disabled')
    await expect(toggle).toHaveAttribute('aria-pressed', 'false')
  },
}

/**
 * The fixture the keyboard tests drive: a button before, the toggle with a change counter, and a
 * button after. Try the keys in the Keyboard section above: Tab and Shift+Tab move between the
 * three, and Enter and Space switch the toggle.
 */
export const Keyboard: Story = {
  render: (args) => (
    <>
      <button type="button" className="kv-button">
        {text.before}
      </button>
      <PressCounter {...args}>{text.unread}</PressCounter>
      <button type="button" className="kv-button">
        {text.after}
      </button>
    </>
  ),
}

function Matrix() {
  return (
    <div className="kv-story-states">
      <div className="kv-story-state">
        <p>{text.states.off}</p>
        <Toggle>{text.unread}</Toggle>
      </div>
      <div className="kv-story-state">
        <p>{text.states.on}</p>
        <Toggle defaultPressed>{text.unread}</Toggle>
      </div>
      <div className="kv-story-state">
        <p>{text.states.disabledOff}</p>
        <Toggle disabled>{text.unread}</Toggle>
      </div>
      <div className="kv-story-state">
        <p>{text.states.disabledOn}</p>
        <Toggle disabled defaultPressed>
          {text.unread}
        </Toggle>
      </div>
      <div className="kv-story-state">
        <p>{text.states.focusableDisabledOn}</p>
        <Toggle disabled focusableWhenDisabled defaultPressed>
          {text.unread}
        </Toggle>
      </div>
    </div>
  )
}

/**
 * Every state, on the page, on a section and on a card: off, on, and disabled both ways. The
 * pressed fill keeps 3:1 against each surface, in every theme (axe runs in all four). Look at
 * the pressed tile in the Contrast toolbar too, where it is the same as a primary button.
 */
export const States: Story = {
  parameters: showSource('toggle/toggle.stories.tsx', 'Matrix'),
  render: () => (
    <>
      <div className="kv-story-section">
        <h2>{text.surfaces.canvas}</h2>
        <Matrix />
      </div>
      <Section className="kv-story-section">
        <h2>{text.surfaces.section}</h2>
        <Matrix />
      </Section>
      <Card.Root className="kv-story-section">
        <Card.Body>
          <h2>{text.surfaces.card}</h2>
          <Matrix />
        </Card.Body>
      </Card.Root>
    </>
  ),
  play: async ({ canvas }) => {
    const toggles = canvas.getAllByRole('button', { name: text.unread })
    await expect(toggles).toHaveLength(15)
    await expect(toggles.filter((toggle) => toggle.hasAttribute('data-pressed'))).toHaveLength(9)
    await expect(toggles.filter((toggle) => toggle.hasAttribute('data-disabled'))).toHaveLength(9)
    for (const toggle of toggles) {
      await expectMinimumTargetSize(toggle)
    }
  },
}

/** A long Finnish label wraps inside a narrow column instead of overflowing (1.4.10). */
export const LongFinnishLabel: Story = {
  globals: { locale: 'fi' },
  args: { children: fiLong, defaultPressed: true },
  render: (args) => (
    <div className="kv-story-narrow" data-testid="narrow">
      <Toggle {...args} />
    </div>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('button', { name: fiLong })).toBeVisible()
    await expectNoHorizontalOverflow(canvas.getByTestId('narrow'))
  },
}

/** Right to left, in English: the label and the pressed state read the same way. */
export const RTL: Story = {
  globals: { dir: 'rtl', locale: 'en' },
  args: { children: 'Show unread only', defaultPressed: true },
}

/**
 * Forced colours: a pressed toggle is a `Highlight` fill with `HighlightText`, and an unpressed
 * one is a plain button, so the state never rests on colour alone.
 */
export const ForcedColors: Story = {
  parameters: showSource('toggle/toggle.stories.tsx', 'Matrix'),
  globals: { forcedColors: 'active' },
  render: () => <Matrix />,
}
