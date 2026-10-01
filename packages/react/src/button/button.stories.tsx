import type { Meta, StoryObj } from '@storybook/react-vite'
import { useId, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import {
  blockSize,
  expectNoHorizontalOverflow,
  expectThemeApplied,
  isThemeLoaded,
  isViewportAtLeast,
  tokenColor,
} from '../stories/theme-story-assertions.ts'
import type { FixedStoryTheme } from '../stories/theme-story-assertions.ts'
import { Button } from './button.tsx'
import type { ButtonProps } from './button.tsx'

// Components/Button: the headless Button, styled by @kvirn-ui/theme/theme.css from the
// Storybook preview (ADR-0013). Theme toolbar › "None (unstyled)" removes the theme again.
// button.e2e.ts runs its keyboard contract against Default, Disabled, FocusableWhenDisabled,
// SubmitInForm, RTL and ForcedColors, so their play functions only read.

/** Fixture text. Stories set `locale` to match it, so `lang` matches the content (3.1.2). */
const sv = {
  heading: 'Knappar',
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
  comfortable: 'Bekväm (standard)',
  compact: 'Kompakt',
}
const fiSaveLong = 'Tallenna rakennuslupahakemuksen luonnos'

function StoryPage({ heading = sv.heading, children }: { heading?: string; children: ReactNode }) {
  return (
    <main>
      <h1>{heading}</h1>
      {children}
    </main>
  )
}

interface ButtonStoryArgs extends ButtonProps {
  heading: string
  clickCountLabel: string
}

/** One button and a click counter: the keyboard contract's fixture. */
function ButtonStory({ heading, clickCountLabel, children, ...buttonProps }: ButtonStoryArgs) {
  const [clickCount, setClickCount] = useState(0)
  return (
    <StoryPage heading={heading}>
      <Button {...buttonProps} onClick={() => setClickCount((count) => count + 1)}>
        {children}
      </Button>
      <p>
        {clickCountLabel}: {clickCount}
      </p>
    </StoryPage>
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
    <div data-kv-button-group="">
      <Button data-variant="primary">{primary}</Button>
      <Button>{secondary}</Button>
      <Button data-variant="danger">{danger}</Button>
    </div>
  )
}

const variants = ['primary', 'secondary', 'danger'] as const
const variantAttribute = (variant: (typeof variants)[number]) =>
  variant === 'secondary' ? undefined : variant

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
              <Button data-variant={variantAttribute(variant)}>{sv.send}</Button>
            </div>
            <div className="kv-story-state">
              <p>{sv.states.disabled}</p>
              <Button data-variant={variantAttribute(variant)} disabled>
                {sv.send}
              </Button>
            </div>
            <div className="kv-story-state">
              <p>{sv.states.focusableDisabled}</p>
              <Button data-variant={variantAttribute(variant)} disabled focusableWhenDisabled>
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
  component: ButtonStory,
  args: { heading: 'Button', clickCountLabel: 'Antal klick', children: 'Spara' },
  globals: { locale: 'sv' },
} satisfies Meta<typeof ButtonStory>

export default meta
type Story = StoryObj<typeof meta>

/** The base look is the secondary button: a primary one is always an explicit choice. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const button = within(canvasElement).getByRole('button', { name: 'Spara' })
    await expect(button).toHaveAttribute('type', 'button')
    await expect(button).toHaveAttribute('data-kv', 'button')
    await expect(button).not.toHaveAttribute('data-disabled')
    await expect(button).toHaveStyle({ borderStyle: 'solid' })
    await expect(blockSize(button)).toBeGreaterThanOrEqual(44)
  },
}

/** `data-variant="primary"` and `"danger"` are plain attributes that theme.css styles. */
export const Variants: Story = {
  render: () => (
    <StoryPage>
      <VariantsGroup />
      <p>{sv.dangerNote}</p>
    </StoryPage>
  ),
  play: async ({ canvasElement }) => {
    const buttons = within(canvasElement).getAllByRole('button')
    await expect(buttons.map((button) => button.textContent)).toEqual([
      sv.send,
      sv.saveDraft,
      sv.deleteDraft,
    ])
    const [primary, secondary, danger] = buttons
    await expect(primary).toHaveAttribute('data-variant', 'primary')
    await expect(primary).toHaveStyle({ backgroundColor: tokenColor(canvasElement, 'primary') })
    await expect(secondary).toHaveStyle({
      backgroundColor: tokenColor(canvasElement, 'surface-raised'),
    })
    await expect(danger).toHaveStyle({ backgroundColor: tokenColor(canvasElement, 'danger') })
  },
}

export const States: Story = {
  render: () => (
    <StoryPage>
      <StatesMatrix />
    </StoryPage>
  ),
  play: async ({ canvasElement }) => {
    const buttons = within(canvasElement).getAllByRole('button', { name: sv.send })
    await expect(buttons).toHaveLength(9)
    for (const button of buttons.filter((_, index) => index % 3 !== 0)) {
      await expect(button).toHaveAttribute('data-disabled')
      await expect(button).toHaveStyle({ borderStyle: 'dashed' })
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
  render: ({ heading, clickCountLabel: _clickCountLabel, children, ...buttonProps }) => (
    <StoryPage heading={heading}>
      <div data-kv-button-group="">
        <Button {...buttonProps}>{children}</Button>
        <Button>Avbryt</Button>
      </div>
    </StoryPage>
  ),
  play: async ({ canvasElement }) => {
    const button = within(canvasElement).getByRole('button', { name: 'Skicka' })
    await expect(button).toBeDisabled()
    await expect(button).toHaveAttribute('data-disabled', '')
    await expect(button).toHaveStyle({ borderStyle: 'dashed' })
  },
}

function FocusableWhenDisabledStory({
  heading,
  clickCountLabel,
  children,
  ...buttonProps
}: ButtonStoryArgs) {
  const reasonId = useId()
  const [clickCount, setClickCount] = useState(0)
  return (
    <StoryPage heading={heading}>
      <p id={reasonId}>{sv.reason}</p>
      <Button
        {...buttonProps}
        data-variant="primary"
        aria-describedby={reasonId}
        onClick={() => setClickCount((count) => count + 1)}
      >
        {children}
      </Button>
      <p>
        {clickCountLabel}: {clickCount}
      </p>
    </StoryPage>
  )
}

/** Stays in the Tab order with `aria-disabled`, and says why it's disabled. */
export const FocusableWhenDisabled: Story = {
  args: { children: 'Skicka', disabled: true, focusableWhenDisabled: true },
  render: (args) => <FocusableWhenDisabledStory {...args} />,
  play: async ({ canvasElement }) => {
    const button = within(canvasElement).getByRole('button', { name: 'Skicka' })
    await expect(button).toHaveAttribute('aria-disabled', 'true')
    await expect(button).not.toHaveAttribute('disabled')
    await expect(button).toHaveAccessibleDescription(sv.reason)
    // Disabled wins over the variant: a dashed edge, not the primary fill.
    await expect(button).toHaveStyle({ borderStyle: 'dashed' })
  },
}

function SubmitInFormStory({ heading }: ButtonStoryArgs) {
  const [name, setName] = useState('')
  const [submittedName, setSubmittedName] = useState<string>()
  return (
    <StoryPage heading={heading}>
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
        <div data-kv-button-group="">
          <Button type="submit" data-variant="primary">
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
    </StoryPage>
  )
}

/** `type="submit"` submits. The default `type="button"` never does. */
export const SubmitInForm: Story = {
  render: (args) => <SubmitInFormStory {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole('button', { name: 'Skicka ansökan' })).toHaveAttribute(
      'type',
      'submit',
    )
    await expect(canvas.getByRole('button', { name: 'Börja om' })).toHaveAttribute('type', 'button')
  },
}

export const FocusVisible: Story = {
  name: 'Focus visible',
  render: () => (
    <StoryPage>
      <VariantsGroup />
    </StoryPage>
  ),
  play: async ({ canvasElement }) => {
    const primary = within(canvasElement).getByRole('button', { name: sv.send })
    await userEvent.tab()
    await expect(primary).toHaveFocus()
    await waitFor(() => expect(primary).toHaveAttribute('data-focus-visible'))
    await expect(primary).toHaveStyle({ outlineWidth: '2px', outlineStyle: 'solid' })
    await expect(primary).toHaveStyle({ outlineOffset: '2px' })
  },
}

export const LongFinnishLabel: Story = {
  name: 'Long Finnish label',
  globals: { locale: 'fi' },
  render: () => (
    <StoryPage heading="Painikkeet">
      <div className="kv-story-narrow" data-kv-button-group="" data-testid="narrow">
        <Button data-variant="primary">{fiSaveLong}</Button>
        <Button>{fiSaveLong}</Button>
      </div>
    </StoryPage>
  ),
  play: async ({ canvasElement }) => {
    const buttons = within(canvasElement).getAllByRole('button', { name: fiSaveLong })
    await expect(buttons).toHaveLength(2)
    await expectNoHorizontalOverflow(within(canvasElement).getByTestId('narrow'))
  },
}

export const ButtonGroupOnANarrowScreen: Story = {
  name: 'Button group on a narrow screen',
  render: () => (
    <StoryPage>
      <VariantsGroup />
    </StoryPage>
  ),
  play: async ({ canvasElement }) => {
    const [primary, secondary, danger] = within(canvasElement).getAllByRole('button')
    if (primary === undefined || secondary === undefined || danger === undefined) {
      throw new Error('Expected three buttons')
    }
    const top = (element: Element) => element.getBoundingClientRect().top
    if (isViewportAtLeast(canvasElement, '40rem')) {
      await expect(top(secondary)).toBe(top(primary))
    } else {
      // Stacked at full width, in DOM order.
      const groupWidth = primary.parentElement?.getBoundingClientRect().width
      for (const button of [primary, secondary, danger]) {
        await expect(button.getBoundingClientRect().width).toBe(groupWidth)
      }
      await expect(top(secondary)).toBeGreaterThan(top(primary))
      await expect(top(danger)).toBeGreaterThan(top(secondary))
    }
  },
}

export const CompactDensity: Story = {
  name: 'Compact density',
  render: () => (
    <StoryPage>
      <section className="kv-story-section" aria-labelledby="density-comfortable">
        <h2 id="density-comfortable">{sv.comfortable}</h2>
        <VariantsGroup />
      </section>
      <section
        className="kv-story-section"
        aria-labelledby="density-compact"
        data-kv-density="compact"
      >
        <h2 id="density-compact">{sv.compact}</h2>
        <VariantsGroup />
      </section>
    </StoryPage>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const comfortable = within(canvas.getByRole('region', { name: sv.comfortable }))
    const compact = within(canvas.getByRole('region', { name: sv.compact }))
    for (const button of comfortable.getAllByRole('button')) {
      await expect(blockSize(button)).toBeGreaterThanOrEqual(44)
    }
    for (const button of compact.getAllByRole('button')) {
      if (isViewportAtLeast(canvasElement, '64rem')) {
        await expect(blockSize(button)).toBeGreaterThanOrEqual(32)
        await expect(blockSize(button)).toBeLessThan(44)
      } else {
        // Below 64rem touch is likely, so compact falls back to 44px targets.
        await expect(blockSize(button)).toBeGreaterThanOrEqual(44)
      }
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

export const ThemeOverride: Story = {
  name: 'Theme override',
  globals: { theme: 'light' },
  render: () => (
    <StoryPage>
      <div style={municipalTeal} data-kv-button-group="">
        <Button data-variant="primary" className="my-button">
          {sv.send}
        </Button>
        <Button>{sv.saveDraft}</Button>
      </div>
    </StoryPage>
  ),
  play: async ({ canvasElement }) => {
    await expectThemeApplied(canvasElement, 'light')
    const primary = within(canvasElement).getByRole('button', { name: sv.send })
    // The override reaches the button, and unlayered consumer CSS beats @layer kv.
    await expect(primary).toHaveStyle({ backgroundColor: 'rgb(0, 112, 122)' })
    await expect(primary).toHaveStyle({ borderRadius: '0px' })
  },
}

function fixedTheme(theme: FixedStoryTheme, name: string): Story {
  return {
    name,
    globals: { theme },
    render: () => (
      <StoryPage>
        <StatesMatrix />
      </StoryPage>
    ),
    play: async ({ canvasElement }) => {
      await expectThemeApplied(canvasElement, theme)
      const [primary] = within(canvasElement).getAllByRole('button', { name: sv.send })
      await expect(primary).toHaveStyle({ backgroundColor: tokenColor(canvasElement, 'primary') })
      await expect(primary).toHaveStyle({ color: tokenColor(canvasElement, 'on-primary') })
    },
  }
}

export const Light: Story = fixedTheme('light', 'Light')
export const Dark: Story = fixedTheme('dark', 'Dark')
export const LightHighContrast: Story = fixedTheme('light-contrast', 'Light, high contrast')
export const DarkHighContrast: Story = fixedTheme('dark-contrast', 'Dark, high contrast')

export const RTL: Story = {
  globals: { dir: 'rtl', locale: 'en' },
  render: () => (
    <StoryPage heading="Button">
      <VariantsGroup labels={['Send application', 'Save', 'Delete draft']} />
    </StoryPage>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const primary = canvas.getByRole('button', { name: 'Send application' })
    const secondary = canvas.getByRole('button', { name: 'Save' })
    if (isViewportAtLeast(canvasElement, '40rem')) {
      // Right to left: the first button is on the right.
      await expect(primary.getBoundingClientRect().right).toBeGreaterThan(
        secondary.getBoundingClientRect().right,
      )
    } else {
      await expect(primary.getBoundingClientRect().top).toBeLessThan(
        secondary.getBoundingClientRect().top,
      )
    }
  },
}

export const ForcedColors: Story = {
  globals: { forcedColors: 'active' },
  render: ({ heading, children }) => (
    <StoryPage heading={heading}>
      <Button>{children}</Button>
      <StatesMatrix />
    </StoryPage>
  ),
}

/** Without theme.css the Button is a plain native button: the package ships no CSS. */
export const Unstyled: Story = {
  globals: { theme: 'none' },
  render: () => (
    <StoryPage>
      <VariantsGroup />
    </StoryPage>
  ),
  play: async ({ canvasElement }) => {
    await expect(isThemeLoaded(canvasElement)).toBe(false)
    const primary = within(canvasElement).getByRole('button', { name: sv.send })
    await expect(primary).toHaveAttribute('data-kv', 'button')
    await expect(primary).toHaveAttribute('data-variant', 'primary')
    await expect(blockSize(primary)).toBeLessThan(44)
  },
}
