import { SaveSettings } from './toast.fixture.tsx'
import contract from '../../../../../packages/react/src/toast/toast.a11y.md?raw'
import guide from '../../../../../packages/react/src/toast/toast.md?raw'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { showSource, usageGuide } from '../../docs-source.ts'
import { localeOf } from '../form/form.fixture.tsx'
import { expectNoHorizontalOverflow } from '../theme-story-assertions.ts'
import {
  DeleteDraft,
  EveryToast,
  KeyboardToasts,
  LongToast,
  StackedToasts,
  StatusToasts,
  TimedToasts,
  TwoProviders,
  ToastNextToADialog,
} from './toast.fixture.tsx'

// Components/Toast: `useToast()` and the region that KvirnProvider renders (contract:
// toast.a11y.md). The default theme styles the region and the toasts. A toast is a secondary
// channel: the Docs page opens with when not to use it. Every story presses a button, because a
// toast only exists after something happened.

const description = usageGuide(guide)

const source = (...names: string[]) => showSource('toast/toast.fixture.tsx', ...names)

/** The region is rendered by the provider, outside the story's own element. */
const page = () => within(document.body)

/** The text of a toast, once the fade-in has finished (a toast at opacity 0 is not visible). */
const expectShown = async (text: RegExp) => {
  const element = await page().findByText(text)
  await waitFor(() => expect(element).toBeVisible())
}

/** Text inside the region only: the Announcer's live region keeps the announced text. */
const inRegion = (text: RegExp) => region()?.textContent?.match(text) ?? null

const region = () => document.querySelector<HTMLElement>('.kv-toast-region')

const meta = {
  title: 'Components/Toast',
  component: SaveSettings,
  argTypes: {
    limit: {
      control: { type: 'number', min: 1, max: 20 },
      description:
        'On `KvirnProvider toast`. The most toasts shown at once, default 10. The region scrolls; the next toast is ignored with a development warning.',
    },
    autoDismiss: {
      control: 'select',
      options: [false, 4000, 8000],
      description:
        'On `KvirnProvider toast`. `false` (default): no timers. A number is the time in milliseconds an info or success toast without an action stays, with no minimum (2.2.1 trade-off): tie it to a user setting.',
    },
    variant: {
      control: 'inline-radio',
      options: ['info', 'success'],
      description:
        '`toast.show({ variant })`. Info (default) or success. A warning or an error is an Alert in the page.',
    },
    withBody: {
      control: 'boolean',
      description: '`toast.show({ body })`: more text under the title. Keep it to one sentence.',
    },
    withAction: {
      control: 'boolean',
      description:
        '`toast.show({ action: { label, onPress } })`: one action. A toast with an action is persistent. Pressing it runs `onPress` and closes the toast.',
    },
    focus: {
      control: 'boolean',
      description:
        '`toast.show({ focus: true })`: moves focus to the toast and skips the announcement. Only for something the user just asked for.',
    },
    locale: { control: false, description: 'Set by the locale toolbar.' },
  },
  args: {
    limit: 10,
    autoDismiss: false,
    variant: 'success',
    withBody: false,
    withAction: false,
    focus: false,
  },
  globals: { locale: 'sv' },
  parameters: {
    a11yContract: contract,
    docs: {
      description: { component: description },
      source: source('SaveSettings', 'SaveSettingsButton').docs.source,
    },
  },
  render: (args, { globals }) => <SaveSettings {...args} locale={localeOf(globals)} />,
} satisfies Meta<typeof SaveSettings>

export default meta
type Story = StoryObj<typeof meta>

/**
 * The main example: press the button and a success toast appears in the corner. It is persistent
 * (no timer) and it is announced politely, and focus stays on the button.
 */
export const Default: Story = {
  play: async ({ canvas }) => {
    const button = canvas.getByRole('button', { name: 'Spara aviseringsinställningar' })
    await userEvent.click(button)
    await expectShown(/Aviseringsinställningarna är sparade\./)
    await expect(page().getByRole('region', { name: 'Meddelanden' })).toBeInTheDocument()
    await expect(button).toHaveFocus()
  },
}

/** Info and success, the only two statuses. The status word comes first in the text, so colour is never alone (1.4.1). */
export const Statuses: Story = {
  parameters: source('StatusToasts', 'StatusButtons'),
  render: (_args, { globals }) => <StatusToasts locale={localeOf(globals)} />,
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Starta exporten' }))
    await userEvent.click(canvas.getByRole('button', { name: 'Spara aviseringsinställningar' }))
    await expectShown(/Exporten pågår\./)
    await expectShown(/Aviseringsinställningarna är sparade\./)
  },
}

/**
 * A toast with an action stays until it is closed, whatever `autoDismiss` says. Undo is also a
 * button on the page, so nobody has to find the toast: the toast is a shortcut.
 */
export const WithAction: Story = {
  parameters: source('DeleteDraft', 'DeleteDraftButtons'),
  render: (_args, { globals }) => <DeleteDraft locale={localeOf(globals)} />,
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Ta bort utkastet' }))
    await expect(canvas.getByTestId('draft')).toHaveTextContent('är borttaget')
    await userEvent.click(await page().findByRole('button', { name: 'Ångra' }))
    await expect(canvas.getByTestId('draft')).toHaveTextContent('finns')
    await waitFor(() => expect(inRegion(/Utkastet har tagits bort\./)).toBeNull())
  },
}

/**
 * Timers on, for an app that lets users choose. Only a toast without an action can time out, for
 * an exact number of milliseconds (8000 here, no minimum), and the timer pauses while the pointer
 * is over the toast, while focus is inside it and while the tab or window is hidden (2.2.1). Tie
 * `autoDismiss` to a setting such as "Keep messages longer".
 */
export const AutoDismiss: Story = {
  parameters: source('TimedToasts', 'TimedButtons'),
  render: (_args, { globals }) => <TimedToasts locale={localeOf(globals)} />,
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Kopiera länken' }))
    await expectShown(/Länken har kopierats\./)
    const copied = page().getByText(/Länken har kopierats\./)
    await userEvent.hover(copied)
    await expect(copied).toBeInTheDocument()
    await userEvent.click(canvas.getByRole('button', { name: 'Din rapport är klar.' }))
    await expect(await page().findByRole('button', { name: 'Öppna rapporten' })).toBeInTheDocument()
  },
}

/**
 * A toast that will time out shows how long is left: a ring in the toast's own status colour
 * around Close, draining clockwise (never mirrored). Hover or focus freezes it, and it starts over
 * with at least five seconds when the pointer or focus leaves. A toast with an action never times
 * out, so it has no ring. The ring is decorative (`aria-hidden`) and nothing about it is announced.
 * With reduced motion it steps in quarters instead of moving smoothly.
 */
export const TimerRing: Story = {
  parameters: source('TimedToasts', 'TimedButtons'),
  render: (_args, { globals }) => <TimedToasts locale={localeOf(globals)} />,
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Kopiera länken' }))
    await expectShown(/Länken har kopierats\./)
    const ring = document.querySelector('.kv-toast-timer')
    await expect(ring).toHaveAttribute('aria-hidden', 'true')
    const copied = page().getByText(/Länken har kopierats\./)
    await userEvent.hover(copied)
    await waitFor(() => expect(copied.closest('.kv-toast')).toHaveAttribute('data-paused'))
    await userEvent.click(canvas.getByRole('button', { name: 'Din rapport är klar.' }))
    await expect(await page().findByRole('button', { name: 'Öppna rapporten' })).toBeInTheDocument()
    await expect(document.querySelectorAll('.kv-toast-timer')).toHaveLength(1)
  },
}

/** The ring in RTL: Close sits at the left, and the ring still drains clockwise (a clock is not mirrored). */
export const TimerRingRTL: Story = {
  globals: { dir: 'rtl', locale: 'en' },
  parameters: source('TimedToasts', 'TimedButtons'),
  render: () => <TimedToasts locale="en" />,
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Copy the link' }))
    await expectShown(/Link copied\./)
    await expect(document.querySelector('.kv-toast-timer')).not.toBeNull()
  },
}

/** The ring is drawn in `ButtonText` in forced colours. */
export const TimerRingForcedColors: Story = {
  globals: { forcedColors: 'active' },
  parameters: source('TimedToasts', 'TimedButtons'),
  render: (_args, { globals }) => <TimedToasts locale={localeOf(globals)} />,
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Kopiera länken' }))
    await expectShown(/Länken har kopierats\./)
    await expect(document.querySelector('.kv-toast-timer')).not.toBeNull()
  },
}

/**
 * Every toast shows, up to `limit` (default 10), and the region scrolls. The twelfth press here
 * shows ten and ignores the rest. The same `id` updates a toast in place, so saving ten times is one
 * toast. `dismissAll` closes every toast.
 */
export const Stacking: Story = {
  parameters: source('StackedToasts', 'StackingButtons'),
  render: (_args, { globals }) => <StackedToasts locale={localeOf(globals)} />,
  play: async ({ canvas }) => {
    const count = () => region()?.querySelectorAll('li').length ?? 0
    await userEvent.click(canvas.getByRole('button', { name: 'Visa tre meddelanden' }))
    await expectShown(/Meddelande 1\./)
    await expect(count()).toBe(3)
    await userEvent.click(canvas.getByRole('button', { name: 'Stäng alla meddelanden' }))
    await expect(canvas.getByTestId('outcome')).toHaveTextContent('Alla meddelanden är stängda.')
    await waitFor(() => expect(region()).toBeNull())
    await userEvent.click(canvas.getByRole('button', { name: 'Visa tolv meddelanden' }))
    await waitFor(() => expect(count()).toBe(10))
    await userEvent.click(canvas.getByRole('button', { name: 'Stäng alla meddelanden' }))
    await waitFor(() => expect(region()).toBeNull())
    await userEvent.click(canvas.getByRole('button', { name: 'Spara utkastet' }))
    await userEvent.click(canvas.getByRole('button', { name: 'Spara utkastet' }))
    await waitFor(() => expect(count()).toBe(1))
  },
}

/** Two providers on one page feed one list in one region. */
export const SharedRegion: Story = {
  parameters: source('TwoProviders', 'ShowToastButton'),
  render: (_args, { globals }) => <TwoProviders locale={localeOf(globals)} />,
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Spara aviseringsinställningar' }))
    await userEvent.click(canvas.getByRole('button', { name: 'Kopiera länken' }))
    await expectShown(/Länken har kopierats\./)
    await expect(document.querySelectorAll('.kv-toast-region')).toHaveLength(1)
    await expect(region()?.querySelectorAll('li').length).toBe(2)
  },
}

/**
 * The fixture the keyboard tests drive: a button that shows two toasts, and a button after it. Try
 * the keys in the Keyboard section above: Tab from the page into the toasts, Enter on Close or the
 * action, and Escape inside a toast.
 */
export const Keyboard: Story = {
  parameters: source('KeyboardToasts', 'KeyboardButtons'),
  render: (_args, { globals }) => <KeyboardToasts locale={localeOf(globals)} />,
  play: async ({ canvas }) => {
    const show = canvas.getByRole('button', { name: 'Visa meddelanden' })
    await userEvent.click(show)
    await expectShown(/Utkastet har tagits bort\./)
    await expect(show).toHaveFocus()
    await userEvent.tab()
    await expect(canvas.getByRole('button', { name: 'Efter' })).toHaveFocus()
    await userEvent.tab()
    await expect(page().getByRole('button', { name: 'Ångra' })).toHaveFocus()
    await userEvent.tab()
    await expect(page().getAllByRole('button', { name: 'Stäng meddelandet' })[0]).toHaveFocus()
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(inRegion(/Utkastet har tagits bort\./)).toBeNull())
    await waitFor(() => expect(inRegion(/Exporten pågår\./)).not.toBeNull())
    await expect(canvas.getByRole('button', { name: 'Efter' })).toHaveFocus()
  },
}

/** Right to left, in English: the toasts sit at the inline end, which is the left, and the icons never mirror. */
export const RTL: Story = {
  globals: { dir: 'rtl', locale: 'en' },
  parameters: source('EveryToast', 'EveryToastButton'),
  render: () => <EveryToast locale="en" />,
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Show messages' }))
    await expectShown(/Your report is ready\./)
  },
}

/** The toast keeps its edge and its bar in forced colours, and the status word carries the status. */
export const ForcedColors: Story = {
  globals: { forcedColors: 'active' },
  parameters: source('EveryToast', 'EveryToastButton'),
  render: (_args, { globals }) => <EveryToast locale={localeOf(globals)} />,
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Visa meddelanden' }))
    await expectShown(/Din rapport är klar\./)
  },
}

/** 320 CSS px wide and 256 high: what 400% zoom leaves of a 1280 × 1024 window (1.4.10). */
const reflowViewport = {
  globals: { viewport: { value: 'reflow', isRotated: false } },
  parameters: {
    viewport: {
      options: {
        reflow: {
          name: '400% zoom',
          styles: { width: '320px', height: '256px' },
          type: 'mobile',
        },
      },
    },
  },
} as const

/** Nothing is wider than the window, and the title and Close can be reached: in view, or by scrolling the region. */
const expectToastReflows = async (
  closeName: string,
  titlePattern: RegExp,
  trigger: HTMLElement,
) => {
  await expect(window.innerWidth).toBeLessThanOrEqual(320)
  await expect(window.innerHeight).toBeLessThanOrEqual(256)
  await expectShown(titlePattern)
  const toastRegion = region()
  await expect(toastRegion).not.toBeNull()
  if (toastRegion === null) {
    return
  }
  await expectNoHorizontalOverflow(toastRegion)
  await expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(window.innerWidth)
  const close = page().getByRole('button', { name: closeName })
  const title = page().getByText(titlePattern, { selector: '.kv-alert-title' })
  const inView = (element: Element) => {
    const { top, bottom } = element.getBoundingClientRect()
    return top >= 0 && bottom <= window.innerHeight
  }
  // 2.4.11: a page control that has focus is never entirely under the region.
  trigger.focus()
  await expect(trigger).toHaveFocus()
  const covering = toastRegion.getBoundingClientRect()
  const focused = trigger.getBoundingClientRect()
  const entirelyCovered =
    focused.left >= covering.left &&
    focused.right <= covering.right &&
    focused.top >= covering.top &&
    focused.bottom <= covering.bottom
  await expect(entirelyCovered).toBe(false)
  const overflows = toastRegion.scrollHeight > toastRegion.clientHeight
  if (overflows) {
    await expect(toastRegion).toHaveAttribute('tabindex', '0')
  } else {
    await expect(inView(close)).toBe(true)
    await expect(inView(title)).toBe(true)
  }
}

/** Long Finnish text at 320 × 256: the title wraps or hyphenates, the Close button keeps its size (1.4.10, 2.5.8) and stays reachable. */
export const Reflow320: Story = {
  ...reflowViewport,
  globals: { ...reflowViewport.globals, locale: 'fi' },
  parameters: { ...reflowViewport.parameters, ...source('LongToast', 'LongToastButton') },
  render: (_args, { globals }) => <LongToast locale={localeOf(globals)} />,
  play: async ({ canvas }) => {
    const trigger = canvas.getByRole('button', { name: 'Näytä ilmoitukset' })
    await userEvent.click(trigger)
    await expectToastReflows('Sulje ilmoitus', /Asunnonmuutostyöavustushakemuksesi/, trigger)
  },
}

/** A long title, a body and an action at 320 × 256, in Swedish: every part wraps and none is lost. */
export const LongText: Story = {
  ...reflowViewport,
  globals: { ...reflowViewport.globals, locale: 'sv' },
  parameters: { ...reflowViewport.parameters, ...source('LongToast', 'LongToastButton') },
  render: (_args, { globals }) => <LongToast locale={localeOf(globals)} />,
  play: async ({ canvas }) => {
    const trigger = canvas.getByRole('button', { name: 'Visa meddelanden' })
    await userEvent.click(trigger)
    await expectToastReflows('Stäng meddelandet', /Din ansökan är mottagen/, trigger)
    await expect(page().getByRole('button', { name: 'Ångra' })).toBeInTheDocument()
  },
}

/**
 * Ten toasts, the limit, at 320 × 256: the region scrolls inside the window, can be reached by
 * keyboard (a named scroll region in the Tab order), shows the newest toast, and leaves a focused
 * page control uncovered (1.4.10, 2.1.1, 2.4.11).
 */
export const TenToastsReflow: Story = {
  ...reflowViewport,
  globals: { ...reflowViewport.globals, locale: 'sv' },
  parameters: { ...reflowViewport.parameters, ...source('StackedToasts', 'StackingButtons') },
  render: (_args, { globals }) => <StackedToasts locale={localeOf(globals)} />,
  play: async ({ canvas }) => {
    const trigger = canvas.getByRole('button', { name: 'Visa tolv meddelanden' })
    await userEvent.click(trigger)
    await waitFor(() => expect(region()?.querySelectorAll('li').length).toBe(10))
    const toastRegion = region()
    await expect(toastRegion).not.toBeNull()
    if (toastRegion === null) {
      return
    }
    await expect(window.innerWidth).toBeLessThanOrEqual(320)
    await expect(window.innerHeight).toBeLessThanOrEqual(256)
    await expect(toastRegion.scrollHeight).toBeGreaterThan(toastRegion.clientHeight)
    await expect(toastRegion).toHaveAttribute('tabindex', '0')
    await expect(page().getByRole('region', { name: 'Meddelanden' })).toBe(toastRegion)
    await expectNoHorizontalOverflow(toastRegion)
    const newest = toastRegion.querySelectorAll('li')[9]
    const regionBox = toastRegion.getBoundingClientRect()
    // The region follows the newest toast once it has scrolled there.
    await waitFor(async () => {
      const newestBox = newest?.getBoundingClientRect()
      await expect(newestBox?.top).toBeGreaterThanOrEqual(regionBox.top - 1)
      await expect(newestBox?.bottom).toBeLessThanOrEqual(regionBox.bottom + 1)
    })
    trigger.focus()
    await expect(trigger).toHaveFocus()
    const focused = trigger.getBoundingClientRect()
    await expect(
      focused.left >= regionBox.left &&
        focused.right <= regionBox.right &&
        focused.top >= regionBox.top &&
        focused.bottom <= regionBox.bottom,
    ).toBe(false)
  },
}

/**
 * A toast raised while a modal dialog is open is held and shown when the dialog closes: the page
 * behind a modal is inert, and so would the toast be. "Show a message now" waits; "Save the
 * number" closes the dialog and the toast follows. Focus goes back to the button that opened it.
 */
export const NextToAModal: Story = {
  parameters: source('ToastNextToADialog', 'DialogWithToast'),
  render: (_args, { globals }) => <ToastNextToADialog locale={localeOf(globals)} />,
  play: async ({ canvas }) => {
    const trigger = canvas.getByRole('button', { name: 'Ändra telefonnummer' })
    await userEvent.click(trigger)
    await userEvent.click(await page().findByRole('button', { name: 'Visa ett meddelande nu' }))
    await expect(page().queryByText(/Meddelandet visades när dialogrutan stängdes\./)).toBeNull()
    await userEvent.keyboard('{Escape}')
    await expectShown(/Meddelandet visades när dialogrutan stängdes\./)
    await expect(trigger).toHaveFocus()
  },
}
