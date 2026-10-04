import { Button, Card, Icon, Section } from '@kvirn-ui/react'
import type { ButtonProps } from '@kvirn-ui/react'
import contract from '../../../../../packages/react/src/button/button.a11y.md?raw'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useId, useState } from 'react'
import type { CSSProperties } from 'react'
import { expect, fn, waitFor, within } from 'storybook/test'
import { expectMinimumTargetSize, expectNoHorizontalOverflow } from '../theme-story-assertions.ts'

// Components/Button: the headless Button, styled by @kvirn-ui/theme/theme.css.
// button.e2e.ts runs its keyboard contract against Default, Activation, Disabled,
// FocusableWhenDisabled, SubmitInForm, RTL and ForcedColors, so their play functions only read.

/** Fixture text. Stories set `locale` to match it, so `lang` matches the content (3.1.2). */
const sv = {
  clickCount: 'Antal klick',
  send: 'Skicka ansökan',
  saveDraft: 'Spara utkast',
  deleteDraft: 'Ta bort utkast',
  reason: 'Fyll i alla obligatoriska fält innan du skickar.',
  dangerNote:
    'Knappar som tar bort något behöver alltid ett bekräftelsesteg. De visas tillsammans här bara för att kunna jämföras.',
  variants: { primary: 'Primär', secondary: 'Sekundär', danger: 'Farlig' },
  states: {
    default: 'Standard',
    disabled: 'Inaktiverad',
    focusableDisabled: 'Inaktiverad men fokuserbar',
  },
  addChild: 'Lägg till ett barn till',
  continue: 'Fortsätt',
  close: 'Stäng',
  comfortable: 'Bekväm (standard)',
  compact: 'Kompakt',
}
const fiSaveLong = 'Tallenna rakennuslupahakemuksen luonnos'

/** Secondary is the base look, with no class. */
const variantClasses = ['kv-button--primary', 'kv-button--danger', 'kv-button--icon-only'] as const

/** One button and a click counter: the keyboard contract's fixture. */
function WithClickCount({ onClick, ...buttonProps }: ButtonProps) {
  const [clickCount, setClickCount] = useState(0)
  return (
    <>
      <Button
        {...buttonProps}
        onClick={(event) => {
          setClickCount((count) => count + 1)
          onClick?.(event)
        }}
      />
      <p>
        {sv.clickCount}: {clickCount}
      </p>
    </>
  )
}

/** Primary first: it is the main next step, and comes first in DOM and focus order. */
function VariantsGroup({
  labels = [sv.send, sv.saveDraft, sv.deleteDraft],
}: {
  labels?: readonly [string, string, string]
}) {
  const [primary, secondary, danger] = labels
  return (
    <div className="kv-button-group">
      <Button className="kv-button--primary">{primary}</Button>
      <Button>{secondary}</Button>
      <Button className="kv-button--danger">{danger}</Button>
    </div>
  )
}

const variants = ['primary', 'secondary', 'danger'] as const
const variantClass = (variant: (typeof variants)[number]) =>
  variant === 'secondary' ? undefined : `kv-button--${variant}`

/** Each variant in each state. The state name comes before the button, not in its label. */
function StatesMatrix() {
  return (
    <>
      {variants.map((variant) => (
        <section key={variant} className="kv-story-section" aria-labelledby={`states-${variant}`}>
          <h2 id={`states-${variant}`}>{sv.variants[variant]}</h2>
          <div className="kv-story-states">
            <div className="kv-story-state">
              <p>{sv.states.default}</p>
              <Button className={variantClass(variant)}>{sv.send}</Button>
            </div>
            <div className="kv-story-state">
              <p>{sv.states.disabled}</p>
              <Button className={variantClass(variant)} disabled>
                {sv.send}
              </Button>
            </div>
            <div className="kv-story-state">
              <p>{sv.states.focusableDisabled}</p>
              <Button className={variantClass(variant)} disabled focusableWhenDisabled>
                {sv.send}
              </Button>
            </div>
          </div>
        </section>
      ))}
    </>
  )
}

const meta = {
  title: 'Components/Button',
  component: Button,
  args: { children: 'Spara', onClick: fn() },
  argTypes: {
    className: {
      control: 'select',
      options: [undefined, ...variantClasses],
      description:
        'Your own classes, added to `kv-button`. The theme styles `kv-button--primary` and `kv-button--danger`; secondary is the base look. `kv-button--icon-only` makes a button with only an icon square.',
    },
    type: { control: 'inline-radio', options: ['button', 'submit', 'reset'] },
    render: { control: false },
  },
  globals: { locale: 'sv' },
  parameters: { a11yContract: contract },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

/** The base look is secondary: a primary button is always an explicit choice. */
export const Default: Story = {
  play: async ({ canvas }) => {
    const button = canvas.getByRole('button', { name: 'Spara' })
    await expect(button).toHaveAttribute('type', 'button')
  },
}

/** `kv-button--primary`: the main next step on a page. */
export const Primary: Story = { args: { className: 'kv-button--primary', children: sv.send } }

/** `kv-button--danger`: removes something, always behind a confirmation step. */
export const Danger: Story = { args: { className: 'kv-button--danger', children: sv.deleteDraft } }

/** An icon before the text. The order in the markup is the order on screen, and RTL flips it. */
export const IconAtStart: Story = {
  args: {
    children: (
      <>
        <Icon name="add" />
        {sv.addChild}
      </>
    ),
  },
  play: async ({ canvas }) => {
    const button = canvas.getByRole('button', { name: sv.addChild })
    await expect(button.firstElementChild).toHaveAttribute('aria-hidden', 'true')
  },
}

/** An icon after the text, here a primary "continue" with an arrow that mirrors in RTL. */
export const IconAtEnd: Story = {
  args: {
    className: 'kv-button--primary',
    children: (
      <>
        {sv.continue}
        <Icon name="arrow-forward" />
      </>
    ),
  },
  play: async ({ canvas }) => {
    const button = canvas.getByRole('button', { name: sv.continue })
    await expect(button.lastElementChild).toHaveAttribute('data-mirror-in-rtl')
  },
}

/**
 * `kv-button--icon-only`: a square target. The name goes on the button (`aria-label` from your
 * translations) and the icon stays decorative. Use it only for actions everyone knows.
 */
export const IconOnly: Story = {
  args: {
    className: 'kv-button--icon-only',
    'aria-label': sv.close,
    children: <Icon name="close" />,
  },
  play: async ({ canvas }) => {
    const button = canvas.getByRole('button', { name: sv.close })
    await expect(button.children).toHaveLength(1)
    await expect(button.textContent).toBe('')
    await expectMinimumTargetSize(button)
  },
}

/** Enter and Space activate it: the counter shows each click. */
export const Activation: Story = {
  render: (args) => <WithClickCount {...args} />,
  play: async ({ canvas }) => {
    const button = canvas.getByRole('button', { name: 'Spara' })
    await expect(button).toHaveAttribute('type', 'button')
    await expect(button).not.toHaveAttribute('data-disabled')
    await expectMinimumTargetSize(button)
  },
}

/**
 * The fixture the keyboard tests drive: a button with a click counter, then a second button. Try
 * the keys in the Keyboard section above: Tab and Shift+Tab move between the two, and Enter and
 * Space activate the first.
 */
export const Keyboard: Story = {
  render: (args) => (
    <div className="kv-button-group">
      <WithClickCount {...args} />
      <Button>Avbryt</Button>
    </div>
  ),
}

/** `kv-button--primary` and `kv-button--danger` are classes you add, and theme.css styles. */
export const Variants: Story = {
  render: () => (
    <>
      <VariantsGroup />
      <p>{sv.dangerNote}</p>
    </>
  ),
  play: async ({ canvas }) => {
    const buttons = canvas.getAllByRole('button')
    await expect(buttons.map((button) => button.textContent)).toEqual([
      sv.send,
      sv.saveDraft,
      sv.deleteDraft,
    ])
  },
}

/** Every variant: enabled, disabled, and disabled but focusable. */
export const States: Story = {
  render: () => <StatesMatrix />,
  play: async ({ canvas }) => {
    const buttons = canvas.getAllByRole('button', { name: sv.send })
    await expect(buttons).toHaveLength(9)
    for (const button of buttons.filter((_, index) => index % 3 !== 0)) {
      await expect(button).toHaveAttribute('data-disabled')
    }
    const focusable = buttons.filter((button) => button.getAttribute('aria-disabled') === 'true')
    await expect(focusable).toHaveLength(3)
    for (const button of focusable) {
      await expect(button).not.toBeDisabled()
    }
  },
}

/** Natively disabled: skipped by Tab. The next button shows where focus goes instead. */
export const Disabled: Story = {
  args: { children: 'Skicka', disabled: true },
  render: (args) => (
    <div className="kv-button-group">
      <Button {...args} />
      <Button>Avbryt</Button>
    </div>
  ),
  play: async ({ canvas }) => {
    const button = canvas.getByRole('button', { name: 'Skicka' })
    await expect(button).toBeDisabled()
    await expect(button).toHaveAttribute('data-disabled', '')
  },
}

function FocusableWhenDisabledStory(buttonProps: ButtonProps) {
  const reasonId = useId()
  return (
    <>
      <p id={reasonId}>{sv.reason}</p>
      <WithClickCount {...buttonProps} aria-describedby={reasonId} />
    </>
  )
}

/** Stays in the Tab order with `aria-disabled`, and says why it's disabled. */
export const FocusableWhenDisabled: Story = {
  args: {
    children: 'Skicka',
    className: 'kv-button--primary',
    disabled: true,
    focusableWhenDisabled: true,
  },
  render: (args) => <FocusableWhenDisabledStory {...args} />,
  play: async ({ canvas }) => {
    const button = canvas.getByRole('button', { name: 'Skicka' })
    await expect(button).toHaveAttribute('aria-disabled', 'true')
    await expect(button).not.toHaveAttribute('disabled')
    await expect(button).toHaveAccessibleDescription(sv.reason)
  },
}

function SubmitInFormStory() {
  const [name, setName] = useState('')
  const [submittedName, setSubmittedName] = useState<string>()
  return (
    <>
      <form
        aria-label="Ansökan"
        onSubmit={(event) => {
          event.preventDefault()
          setSubmittedName(name)
        }}
      >
        <p>
          <label>
            Namn{' '}
            <input
              name="namn"
              autoComplete="name"
              value={name}
              onChange={(event) => setName(event.currentTarget.value)}
            />
          </label>
        </p>
        <div className="kv-button-group">
          <Button type="submit" className="kv-button--primary">
            Skicka ansökan
          </Button>
          <Button
            onClick={() => {
              setName('')
              setSubmittedName(undefined)
            }}
          >
            Börja om
          </Button>
        </div>
      </form>
      {/* The live region is in the DOM before its message, so the message is announced. */}
      <output>
        {submittedName === undefined ? '' : `Ansökan skickad för ${submittedName || 'okänt namn'}`}
      </output>
    </>
  )
}

/** `type="submit"` submits. The default `type="button"` never does. */
export const SubmitInForm: Story = {
  render: () => <SubmitInFormStory />,
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('button', { name: 'Skicka ansökan' })).toHaveAttribute(
      'type',
      'submit',
    )
    await expect(canvas.getByRole('button', { name: 'Börja om' })).toHaveAttribute('type', 'button')
  },
}

/** Keyboard focus shows a 2px ring, offset from the button (2.4.7, 2.4.13). */
export const FocusVisible: Story = {
  args: { className: 'kv-button--primary', children: sv.send },
  play: async ({ canvas, userEvent }) => {
    const button = canvas.getByRole('button', { name: sv.send })
    await userEvent.tab()
    await expect(button).toHaveFocus()
    await waitFor(() => expect(button).toHaveAttribute('data-focus-visible'))
    // 2.4.7: a focused button shows an indicator.
    await expect(getComputedStyle(button).outlineStyle).not.toBe('none')
  },
}

/** A long Finnish label wraps inside a narrow column instead of overflowing (1.4.10). */
export const LongFinnishLabel: Story = {
  globals: { locale: 'fi' },
  render: () => (
    <div className="kv-story-narrow kv-button-group" data-testid="narrow">
      <Button className="kv-button--primary">{fiSaveLong}</Button>
      <Button>{fiSaveLong}</Button>
    </div>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getAllByRole('button', { name: fiSaveLong })).toHaveLength(2)
    await expectNoHorizontalOverflow(canvas.getByTestId('narrow'))
  },
}

/** `kv-compact` makes buttons smaller, and keeps every one at least 24 × 24 (2.5.8). */
export const CompactDensity: Story = {
  render: () => (
    <>
      <section className="kv-story-section" aria-labelledby="density-comfortable">
        <h2 id="density-comfortable">{sv.comfortable}</h2>
        <VariantsGroup />
      </section>
      <section className="kv-story-section kv-compact" aria-labelledby="density-compact">
        <h2 id="density-compact">{sv.compact}</h2>
        <VariantsGroup />
      </section>
    </>
  ),
  play: async ({ canvas }) => {
    for (const name of [sv.comfortable, sv.compact]) {
      for (const button of within(canvas.getByRole('region', { name })).getAllByRole('button')) {
        await expectMinimumTargetSize(button)
      }
    }
  },
}

/**
 * Button sizing set once, without classes: the five `--kv-button-*` properties, here on a
 * container (on `:root` they size every button). This sets the documented floor, 24px, with
 * small labels and padding, and every button still meets 2.5.8 Target Size (Minimum).
 */
const siteWideButtonSizing = {
  '--kv-button-min-block-size': '24px',
  '--kv-button-padding-inline': 'var(--kv-space-2)',
  '--kv-button-font-size': 'var(--kv-font-label-compact-size)',
  '--kv-button-font-weight': 'var(--kv-font-label-compact-weight)',
  '--kv-button-line-height': 'var(--kv-font-label-compact-line-height)',
} as CSSProperties

/** The `--kv-button-*` sizing properties at their documented floor: still 24 × 24 (2.5.8). */
export const SiteWideSizing: Story = {
  render: () => (
    <div style={siteWideButtonSizing} data-testid="site-wide-sizing">
      <VariantsGroup labels={['OK', sv.saveDraft, sv.deleteDraft]} />
      <StatesMatrix />
    </div>
  ),
  play: async ({ canvas }) => {
    const buttons = within(canvas.getByTestId('site-wide-sizing')).getAllByRole('button')
    await expect(buttons).toHaveLength(12)
    for (const button of buttons) {
      await expectMinimumTargetSize(button)
    }
  },
}

/**
 * A municipality's teal on one wrapper: the semantic tokens point at the accent scale (teal
 * by default). An app rebrands on :root instead, by overriding `--kv-primary-*` with its brand
 * scale (Foundation/Theming). On a wrapper the semantic tokens must be re-pointed, because they
 * are resolved on :root.
 */
const municipalTeal = {
  '--kv-color-primary': 'var(--kv-accent-600)',
  '--kv-color-primary-hover': 'var(--kv-accent-700)',
  '--kv-color-focus-ring': 'var(--kv-accent-600)',
} as CSSProperties

/**
 * Your own class (`my-button`) and re-pointed tokens on a wrapper beat the theme's layer. The
 * teal is a light-theme rebrand, so the story stays light in every theme project: a real
 * rebrand overrides each theme's scale (Foundation/Theming).
 */
export const ThemeOverride: Story = {
  globals: { mode: 'light', contrast: 'standard' },
  render: () => (
    <div style={municipalTeal} className="kv-button-group">
      <Button className="my-button kv-button--primary">{sv.send}</Button>
      <Button>{sv.saveDraft}</Button>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const root = canvasElement.ownerDocument.documentElement
    await waitFor(() => expect(root).toHaveAttribute('data-kv-color-scheme', 'light'))
    await expect(root).toHaveAttribute('data-kv-contrast', 'standard')
  },
}

/** Right to left, in English: the group starts on the right. */
export const RTL: Story = {
  globals: { dir: 'rtl', locale: 'en' },
  render: () => <VariantsGroup labels={['Send application', 'Save', 'Delete draft']} />,
}

/** Every state with the forced-colors marker. The e2e suite checks it with real emulation. */
export const ForcedColors: Story = {
  globals: { forcedColors: 'active' },
  render: (args) => (
    <>
      <Button {...args} />
      <StatesMatrix />
    </>
  ),
}

/**
 * One surface of the depth matrix: every kind at rest, with keyboard focus (the ring, and no
 * shadow), and disabled (flat, dashed). `data-focus-visible` is what the Button sets itself
 * after a Tab, passed in so the state can be shown without moving focus.
 */
const depthText = {
  send: sv.send,
  variants: sv.variants,
  states: { rest: 'Standard', focusVisible: 'Tangentbordsfokus', disabled: 'Inaktiverad' },
  surfaces: { canvas: 'På sidan', surface: 'På en yta', raised: 'På ett upphöjt kort' },
  note: 'Hovring och tryckt läge går inte att visa statiskt. För hovring, för pekaren över en knapp. För tryckt läge, håll ned musknappen på den.',
} as const

function DepthSurface({ heading }: { heading: string }) {
  const headingId = useId()
  return (
    <section aria-labelledby={headingId} className="kv-story-section">
      <h2 id={headingId}>{heading}</h2>
      {variants.map((variant) => (
        <div key={variant} className="kv-story-states">
          <div className="kv-story-state">
            <p>
              {depthText.variants[variant]}, {depthText.states.rest}
            </p>
            <Button className={variantClass(variant)}>{depthText.send}</Button>
          </div>
          <div className="kv-story-state">
            <p>
              {depthText.variants[variant]}, {depthText.states.focusVisible}
            </p>
            <Button className={variantClass(variant)} data-focus-visible="">
              {depthText.send}
            </Button>
          </div>
          <div className="kv-story-state">
            <p>
              {depthText.variants[variant]}, {depthText.states.disabled}
            </p>
            <Button className={variantClass(variant)} disabled>
              {depthText.send}
            </Button>
          </div>
        </div>
      ))}
    </section>
  )
}

/** Every kind on the page (canvas), a surface and a raised surface, at rest, with focus and disabled. */
function DepthMatrix() {
  return (
    <>
      <p>{depthText.note}</p>
      <DepthSurface heading={depthText.surfaces.canvas} />
      <Section className="kv-story-section">
        <DepthSurface heading={depthText.surfaces.surface} />
      </Section>
      <Card.Root className="kv-story-section">
        <Card.Body>
          <DepthSurface heading={depthText.surfaces.raised} />
        </Card.Body>
      </Card.Root>
    </>
  )
}

/**
 * Button depth: a soft shadow, and a tinted edge (darker at the bottom in light,
 * lighter at the top in dark). It's the default in light and dark, and flat in the contrast
 * themes: use the Theme and Contrast toolbars to compare. The depth is subtle and axe can't
 * judge it, so look at it. Keyboard focus shows only the ring, never a shadow.
 */
export const Depth: Story = {
  render: () => <DepthMatrix />,
  play: async ({ canvas }) => {
    const buttons = canvas.getAllByRole('button')
    await expect(buttons).toHaveLength(27)
    await expect(
      buttons.filter((button) => button.hasAttribute('data-focus-visible')),
    ).toHaveLength(9)
    await expect(buttons.filter((button) => button.hasAttribute('data-disabled'))).toHaveLength(9)
  },
}
