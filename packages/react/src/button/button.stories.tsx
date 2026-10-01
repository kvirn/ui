import type { Meta, StoryObj } from '@storybook/react-vite'
import { useId, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import {
  expectMinimumTargetSize,
  expectNoHorizontalOverflow,
  expectThemeApplied,
  isThemeLoaded,
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
    await expect(button).not.toHaveAttribute('data-disabled')
    await expectMinimumTargetSize(button)
  },
}

/** `kv-button--primary` and `kv-button--danger` are classes you add, and theme.css styles. */
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
      // Disabled isn't shown by colour alone (1.4.1): a dashed edge in every variant.
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
      <div className="kv-button-group">
        <Button {...buttonProps}>{children}</Button>
        <Button>Avbryt</Button>
      </div>
    </StoryPage>
  ),
  play: async ({ canvasElement }) => {
    const button = within(canvasElement).getByRole('button', { name: 'Skicka' })
    await expect(button).toBeDisabled()
    await expect(button).toHaveAttribute('data-disabled', '')
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
        className="kv-button--primary"
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
    // At least 2px (2.4.7, 2.4.13), and offset so it measures against the page, not the fill.
    await expect(primary).toHaveStyle({ outlineWidth: '2px', outlineStyle: 'solid' })
    await expect(primary).toHaveStyle({ outlineOffset: '2px' })
  },
}

export const LongFinnishLabel: Story = {
  name: 'Long Finnish label',
  globals: { locale: 'fi' },
  render: () => (
    <StoryPage heading="Painikkeet">
      <div className="kv-story-narrow kv-button-group" data-testid="narrow">
        <Button className="kv-button--primary">{fiSaveLong}</Button>
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
}

export const CompactDensity: Story = {
  name: 'Compact density',
  render: () => (
    <StoryPage>
      <section className="kv-story-section" aria-labelledby="density-comfortable">
        <h2 id="density-comfortable">{sv.comfortable}</h2>
        <VariantsGroup />
      </section>
      <section className="kv-story-section kv-compact" aria-labelledby="density-compact">
        <h2 id="density-compact">{sv.compact}</h2>
        <VariantsGroup />
      </section>
    </StoryPage>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    // Both densities keep every button at least 24 × 24 (2.5.8), compact included.
    for (const name of [sv.comfortable, sv.compact]) {
      for (const button of within(canvas.getByRole('region', { name })).getAllByRole('button')) {
        await expectMinimumTargetSize(button)
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
      <div style={municipalTeal} className="kv-button-group">
        <Button className="my-button kv-button--primary">{sv.send}</Button>
        <Button>{sv.saveDraft}</Button>
      </div>
    </StoryPage>
  ),
  play: async ({ canvasElement }) => {
    await expectThemeApplied(canvasElement, 'light')
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
  },
}
