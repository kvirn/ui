import { Disclosure } from '@kvirn-ui/react'
import contract from '../../../../../packages/react/src/disclosure/disclosure.a11y.md?raw'
import guide from '../../../../../packages/react/src/disclosure/disclosure.md?raw'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'
import { showSource, usageGuide } from '../../docs-source.ts'
import { expectMinimumTargetSize, expectNoHorizontalOverflow } from '../theme-story-assertions.ts'
import {
  ControlledDisclosure,
  DisabledDisclosures,
  EnglishDisclosure,
  FinnishDisclosure,
  FindableDisclosure,
  KeyboardDisclosure,
  OpenFromTheStart,
} from './disclosure.fixture.tsx'

// Components/Disclosure: a button that shows and hides a panel (APG Disclosure, contract:
// disclosure.a11y.md), styled by @kvirn-ui/theme/theme.css. Disclosure has no library strings:
// the trigger's text and the panel are the story's own, in sv by default.

const description = usageGuide(guide)

const meta = {
  title: 'Components/Disclosure',
  component: Disclosure.Root,
  args: {
    defaultOpen: false,
    disabled: false,
    focusableWhenDisabled: false,
    hiddenUntilFound: false,
  },
  // Every option of Disclosure.Root in disclosure.tsx and use-disclosure.ts. The parts' props are
  // in the API section below.
  argTypes: {
    open: {
      control: 'boolean',
      description:
        'Controlled: whether the panel is open. Pair it with `onOpenChange`: with only a control here, a press opens nothing until you change the control (see Controlled).',
    },
    defaultOpen: {
      control: 'boolean',
      description: 'Uncontrolled: whether the panel starts open. Default `false`.',
    },
    onOpenChange: {
      control: false,
      description:
        'Called with the new state and `{ reason, event }` when the user opens or closes the panel: `trigger-press` or `find-in-page`. It only reports. Never called for a press while disabled.',
    },
    disabled: {
      control: 'boolean',
      description:
        'The trigger is natively `disabled` and leaves the Tab order. Sets `data-disabled`. Default `false`.',
    },
    focusableWhenDisabled: {
      control: 'boolean',
      description:
        'With `disabled`: `aria-disabled="true"` instead, so the trigger stays a Tab stop and can point at a reason. It still opens nothing.',
    },
    hiddenUntilFound: {
      control: 'boolean',
      description:
        'A closed panel is `hidden="until-found"`, so find-in-page and `#fragment` links reveal it, and `onOpenChange` runs with the reason `find-in-page`. Default `false`.',
    },
    children: { control: false, description: 'A `Disclosure.Trigger` and its `Disclosure.Panel`.' },
  },
  globals: { locale: 'sv' },
  parameters: { a11yContract: contract, docs: { description: { component: description } } },
} satisfies Meta<typeof Disclosure.Root>

export default meta
type Story = StoryObj<typeof meta>

/**
 * The main example: a button that shows the opening hours. The chevron points down while closed
 * and up while open. Every option of the root is a control below.
 */
export const Default: Story = {
  render: (args) => (
    <Disclosure.Root {...args}>
      <Disclosure.Trigger>Öppettider</Disclosure.Trigger>
      <Disclosure.Panel>
        <p>Måndag till fredag 10–19. Lördag 10–15. Stängt på söndagar.</p>
      </Disclosure.Panel>
    </Disclosure.Root>
  ),
  play: async ({ canvas, userEvent }) => {
    const trigger = canvas.getByRole('button', { name: 'Öppettider' })
    await expect(trigger).toHaveAttribute('aria-expanded', 'false')
    await expectMinimumTargetSize(trigger)
    await userEvent.click(trigger)
    await expect(trigger).toHaveAttribute('aria-expanded', 'true')
    await expect(canvas.getByText(/Måndag till fredag/)).toBeVisible()
  },
}

/**
 * The fixture the keyboard tests drive: a button before, the disclosure and a button after. Try
 * the keys in the Keyboard section above: Enter and Space toggle and keep focus on the button, and
 * the link in the open panel is the next Tab stop.
 */
export const Keyboard: Story = {
  parameters: showSource('disclosure/disclosure.fixture.tsx', 'KeyboardDisclosure'),
  render: () => <KeyboardDisclosure />,
  play: async ({ canvas, userEvent }) => {
    const trigger = canvas.getByRole('button', { name: 'Kontakta oss' })
    trigger.focus()
    await userEvent.keyboard('{Enter}')
    await expect(trigger).toHaveAttribute('aria-expanded', 'true')
    await userEvent.tab()
    await expect(canvas.getByRole('link', { name: '08-123 45 67' })).toHaveFocus()
  },
}

/** `defaultOpen`: shown from the start, with the chevron pointing up. */
export const Open: Story = {
  parameters: showSource('disclosure/disclosure.fixture.tsx', 'OpenFromTheStart'),
  render: () => <OpenFromTheStart />,
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('button', { name: 'Öppettider' })).toHaveAttribute(
      'aria-expanded',
      'true',
    )
  },
}

/**
 * `disabled` takes the trigger out of the Tab order. `focusableWhenDisabled` keeps it a Tab stop
 * with `aria-disabled`, so it can point at the reason with `aria-describedby`. Neither opens.
 */
export const Disabled: Story = {
  parameters: showSource('disclosure/disclosure.fixture.tsx', 'DisabledDisclosures'),
  render: () => <DisabledDisclosures />,
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('button', { name: 'Beslut' })).toBeDisabled()
    const appeal = canvas.getByRole('button', { name: 'Överklagande' })
    await expect(appeal).toHaveAttribute('aria-disabled', 'true')
    await expect(appeal).toHaveAccessibleDescription(
      'Överklagande går att öppna när beslutet är fattat.',
    )
  },
}

/** Controlled: `open` decides, and `onOpenChange` reports the new state and the reason. */
export const Controlled: Story = {
  parameters: showSource('disclosure/disclosure.fixture.tsx', 'ControlledDisclosure'),
  render: () => <ControlledDisclosure />,
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Villkor' }))
    await expect(canvas.getByText('Öppen: ja. Senaste orsak: trigger-press.')).toBeVisible()
  },
}

/**
 * `hiddenUntilFound`: the closed panel is `hidden="until-found"`. Search the page for "tredje
 * våningen": a browser that supports it opens the panel on the match. One that doesn’t treats it
 * as `hidden`.
 */
export const FindInPage: Story = {
  parameters: showSource('disclosure/disclosure.fixture.tsx', 'FindableDisclosure'),
  render: () => <FindableDisclosure />,
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('button', { name: 'Hitta hit' })).toHaveAttribute(
      'aria-expanded',
      'false',
    )
  },
}

/** Long Finnish compounds wrap inside the trigger in a 320px column, and the chevron stays at the end. */
export const NarrowFinnishText: Story = {
  globals: { locale: 'fi' },
  parameters: showSource('disclosure/disclosure.fixture.tsx', 'FinnishDisclosure'),
  render: () => (
    <div className="kv-story-narrow" data-testid="narrow">
      <FinnishDisclosure />
    </div>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('button', { name: /Rakennuslupahakemuksen/ })).toBeVisible()
    await expectNoHorizontalOverflow(canvas.getByTestId('narrow'))
  },
}

/** Right to left, in English: the text starts at the right and the chevron is at the left. */
export const RTL: Story = {
  globals: { dir: 'rtl', locale: 'en' },
  parameters: showSource('disclosure/disclosure.fixture.tsx', 'EnglishDisclosure'),
  render: () => <EnglishDisclosure />,
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('button', { name: 'Opening hours' })).toHaveAttribute(
      'aria-expanded',
      'false',
    )
  },
}

/**
 * Forced colours: the trigger is `CanvasText`, the chevron is `currentColor`, and the focus ring
 * is `Highlight`. The state is the shape of the chevron.
 */
export const ForcedColors: Story = {
  globals: { forcedColors: 'active' },
  parameters: showSource('disclosure/disclosure.fixture.tsx', 'OpenFromTheStart'),
  render: () => <OpenFromTheStart />,
}
