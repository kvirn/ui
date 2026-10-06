import { Button, ButtonGroup, Card, Icon, Section } from '@kvirn-ui/react'
import type { ButtonProps } from '@kvirn-ui/react'
import contract from '../../../../../packages/react/src/button/button.a11y.md?raw'
import guide from '../../../../../packages/react/src/button/button.md?raw'
import type { Decorator, Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'
import { showSource, usageGuide } from '../../docs-source.ts'
import { expectMinimumTargetSize, expectNoHorizontalOverflow } from '../theme-story-assertions.ts'
import { ApplicationForm, ChangeAddressForm } from './button.fixture.tsx'

// Components/Button: the headless Button, styled by @kvirn-ui/theme/theme.css.
// The keyboard contract is proved in button.test.tsx, so the play functions only read.

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

const variants = ['primary', 'secondary', 'danger'] as const
const variantClass = (variant: (typeof variants)[number]) =>
  variant === 'secondary' ? undefined : `kv-button--${variant}`

/**
 * Counts the clicks the Button lets through, under the story. The count stays at 0 while a focusable disabled button is activated. The Button never
 * calls `onClick` while it is disabled, so the count is the proof. It sits in a decorator, so
 * "Show code" shows only the Button.
 */
function ClickCounter({ children }: { children: (countClick: () => void) => ReactNode }) {
  const [clickCount, setClickCount] = useState(0)
  return (
    <>
      {children(() => setClickCount((count) => count + 1))}
      <p>
        {sv.clickCount}: {clickCount}
      </p>
    </>
  )
}

const withClickCount: Decorator = (Story, { args }) => {
  const onClick = args['onClick'] as ButtonProps['onClick']
  return (
    <ClickCounter>
      {(countClick) =>
        Story({
          args: {
            ...args,
            onClick: (event: Parameters<NonNullable<ButtonProps['onClick']>>[0]) => {
              countClick()
              onClick?.(event)
            },
          },
        })
      }
    </ClickCounter>
  )
}

/** Primary first: it is the main next step, and comes first in DOM and focus order. */
function variantsGroup(
  labels: readonly [string, string, string] = [sv.send, sv.saveDraft, sv.deleteDraft],
) {
  const [primary, secondary, danger] = labels
  return (
    <ButtonGroup>
      <Button className="kv-button--primary">{primary}</Button>
      <Button>{secondary}</Button>
      <Button className="kv-button--danger">{danger}</Button>
    </ButtonGroup>
  )
}

/** Each variant in each state. The state name comes before the button, not in its label. */
function statesMatrix(idPrefix: string) {
  return variants.map((variant) => (
    <section key={variant} className="kv-story-section" aria-labelledby={`${idPrefix}-${variant}`}>
      <h2 id={`${idPrefix}-${variant}`}>{sv.variants[variant]}</h2>
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
  ))
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
  parameters: {
    a11yContract: contract,
    docs: { description: { component: usageGuide(guide) } },
  },
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

/** Enter and Space activate it: the click count under the button shows each activation. */
export const Activation: Story = {
  decorators: [withClickCount],
  play: async ({ canvas }) => {
    const button = canvas.getByRole('button', { name: 'Spara' })
    await expect(button).toHaveAttribute('type', 'button')
    await expect(button).not.toHaveAttribute('data-disabled')
    await expectMinimumTargetSize(button)
  },
}

/**
 * The fixture the keyboard tests drive: a button with a click count, then a second button. Try
 * the keys in the Keyboard section above: Tab and Shift+Tab move between the two, and Enter and
 * Space activate the first.
 */
export const Keyboard: Story = {
  decorators: [withClickCount],
  render: (args) => (
    <ButtonGroup>
      <Button {...args} />
      <Button>Avbryt</Button>
    </ButtonGroup>
  ),
}

/** `kv-button--primary` and `kv-button--danger` are classes you add, and theme.css styles. */
export const Variants: Story = {
  render: () => (
    <>
      {variantsGroup()}
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
  render: () => <>{statesMatrix('states')}</>,
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
    <ButtonGroup>
      <Button {...args} />
      <Button>Avbryt</Button>
    </ButtonGroup>
  ),
  play: async ({ canvas }) => {
    const button = canvas.getByRole('button', { name: 'Skicka' })
    await expect(button).toBeDisabled()
    await expect(button).toHaveAttribute('data-disabled', '')
  },
}

/** Stays in the Tab order with `aria-disabled`, and says why it's disabled. */
export const FocusableWhenDisabled: Story = {
  args: {
    children: 'Skicka',
    className: 'kv-button--primary',
    disabled: true,
    focusableWhenDisabled: true,
  },
  decorators: [withClickCount],
  render: (args) => (
    <>
      <p id="send-reason">{sv.reason}</p>
      <Button {...args} aria-describedby="send-reason" />
    </>
  ),
  play: async ({ canvas }) => {
    const button = canvas.getByRole('button', { name: 'Skicka' })
    await expect(button).toHaveAttribute('aria-disabled', 'true')
    await expect(button).not.toHaveAttribute('disabled')
    await expect(button).toHaveAccessibleDescription(sv.reason)
  },
}

/** `type="submit"` submits. The default `type="button"` never does. */
export const SubmitInForm: Story = {
  parameters: showSource('button/button.fixture.tsx', 'ApplicationForm'),
  render: () => <ApplicationForm />,
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('button', { name: 'Skicka ansökan' })).toHaveAttribute(
      'type',
      'submit',
    )
    await expect(canvas.getByRole('button', { name: 'Börja om' })).toHaveAttribute('type', 'button')
  },
}

/**
 * `type="reset"` restores the form's fields. A disabled button with `focusableWhenDisabled` stays
 * in the Tab order, and clicking it neither calls its `onClick` nor submits the form.
 */
export const ResetAndBlockedClick: Story = {
  parameters: showSource('button/button.fixture.tsx', 'ChangeAddressForm'),
  render: () => <ChangeAddressForm />,
  play: async ({ canvas, userEvent }) => {
    const address = canvas.getByRole('textbox', { name: 'Gatuadress' })
    const reset = canvas.getByRole('button', { name: 'Återställ' })
    const save = canvas.getByRole('button', { name: 'Spara adress' })
    await expect(reset).toHaveAttribute('type', 'reset')
    await expect(save).toHaveAttribute('aria-disabled', 'true')
    await userEvent.clear(address)
    await userEvent.type(address, 'Kungsgatan 5')
    await userEvent.click(save)
    await expect(canvas.getByRole('status')).toBeEmptyDOMElement()
    await userEvent.click(reset)
    await expect(address).toHaveValue('Storgatan 1')
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
  decorators: [
    (Story) => (
      <div className="kv-story-narrow" data-testid="narrow">
        <Story />
      </div>
    ),
  ],
  render: () => (
    <ButtonGroup>
      <Button className="kv-button--primary">{fiSaveLong}</Button>
      <Button>{fiSaveLong}</Button>
    </ButtonGroup>
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
        {variantsGroup()}
      </section>
      <section className="kv-story-section kv-compact" aria-labelledby="density-compact">
        <h2 id="density-compact">{sv.compact}</h2>
        {variantsGroup()}
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
  decorators: [
    (Story) => (
      <div style={siteWideButtonSizing} data-testid="site-wide-sizing">
        <Story />
      </div>
    ),
  ],
  render: () => (
    <>
      {variantsGroup(['OK', sv.saveDraft, sv.deleteDraft])}
      {statesMatrix('site-wide-states')}
    </>
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
 * Your own class (`my-button`) beats the theme's layer, and re-pointed tokens on a wrapper
 * (the story's decorator) recolour the buttons inside it. The teal is a light-theme rebrand, so
 * the story stays light in every theme project: a real rebrand overrides each theme's scale
 * (Foundation/Theming).
 */
export const ThemeOverride: Story = {
  globals: { mode: 'light', contrast: 'standard' },
  decorators: [
    (Story) => (
      <div style={municipalTeal}>
        <Story />
      </div>
    ),
  ],
  render: () => (
    <ButtonGroup>
      <Button className="my-button kv-button--primary">{sv.send}</Button>
      <Button>{sv.saveDraft}</Button>
    </ButtonGroup>
  ),
  play: async ({ canvasElement }) => {
    const root = canvasElement.ownerDocument.documentElement
    await waitFor(() => expect(root).toHaveAttribute('data-kv-color-scheme', 'light'))
    await expect(root).toHaveAttribute('data-kv-contrast', 'standard')
  },
}

/**
 * The action is running: `aria-disabled="true"` and `data-busy`, never native `disabled`, so the
 * look and depth stay, the cursor is `progress`, focus stays and every press is blocked. Pair it
 * with a Progress beside it (Components/Progress).
 */
export const Busy: Story = {
  args: { busy: true, children: sv.send, onClick: fn() },
  play: async ({ canvas, args }) => {
    const button = canvas.getByRole('button', { name: sv.send })
    await expect(button).toHaveAttribute('aria-disabled', 'true')
    await expect(button).toHaveAttribute('data-busy')
    await expect(button).not.toHaveAttribute('disabled')
    await userEvent.click(button)
    await expect(args.onClick).not.toHaveBeenCalled()
  },
}

/** Right to left, in English: the group starts on the right. */
export const RTL: Story = {
  globals: { dir: 'rtl', locale: 'en' },
  render: () => variantsGroup(['Send application', 'Save', 'Delete draft']),
}

/** Every state with the forced-colors marker. */
export const ForcedColors: Story = {
  globals: { forcedColors: 'active' },
  render: (args) => (
    <>
      <Button {...args} />
      {statesMatrix('forced-states')}
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

function depthSurface(heading: string, headingId: string) {
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

/**
 * Button depth: a soft shadow, and a tinted edge (darker at the bottom in light,
 * lighter at the top in dark). It's the default in light and dark, and flat in the contrast
 * themes: use the Theme and Contrast toolbars to compare. The depth is subtle and axe can't
 * judge it, so look at it. Keyboard focus shows only the ring, never a shadow. Every kind on
 * the page (canvas), a surface and a raised surface, at rest, with focus and disabled.
 */
export const Depth: Story = {
  render: () => (
    <>
      <p>{depthText.note}</p>
      {depthSurface(depthText.surfaces.canvas, 'depth-canvas')}
      <Section className="kv-story-section">
        {depthSurface(depthText.surfaces.surface, 'depth-surface')}
      </Section>
      <Card.Root className="kv-story-section">
        <Card.Body>{depthSurface(depthText.surfaces.raised, 'depth-raised')}</Card.Body>
      </Card.Root>
    </>
  ),
  play: async ({ canvas }) => {
    const buttons = canvas.getAllByRole('button')
    await expect(buttons).toHaveLength(27)
    await expect(
      buttons.filter((button) => button.hasAttribute('data-focus-visible')),
    ).toHaveLength(9)
    await expect(buttons.filter((button) => button.hasAttribute('data-disabled'))).toHaveLength(9)
  },
}
