import contract from '../../../../../packages/react/src/focus/focus.a11y.md?raw'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { showSource } from '../../docs-source.ts'
import { localeOf, withFormLocale } from '../form/form.fixture.tsx'
import {
  focusLocaleOf,
  InertDrawer,
  InitialFocusChoices,
  LoopDrawer,
  NativeDialog,
  RestoreDrawer,
  RouteMove,
  ScopePart,
  WizardStep,
} from './focus.fixture.tsx'

// Foundation/Focus, the management part (useFocus, FocusScope; contract: focus.a11y.md). One story
// per way to move, hold or return focus; the Docs page is foundation/focus.mdx. The behaviour is
// proved in use-focus.test.tsx.

const source = (...names: string[]) => showSource('focus/focus.fixture.tsx', ...names)

const meta = {
  title: 'Foundation/Focus',
  globals: { locale: 'sv' },
  decorators: [withFormLocale],
  parameters: {
    a11yContract: contract,
  },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

const localeFor = (globals: Record<string, unknown>) => focusLocaleOf(localeOf(globals))

/** The default: a native modal `<dialog>`. The browser holds focus, makes the page inert and returns focus. No hook. */
export const NativeFirst: Story = {
  name: 'Native dialog',
  parameters: source('NativeDialog'),
  render: (_args, { globals }) => <NativeDialog locale={localeFor(globals)} />,
  play: async ({ canvas }) => {
    const opener = canvas.getByRole('button', { name: 'Öppna dialogrutan' })
    await userEvent.click(opener)
    await waitFor(() => expect(document.querySelector('dialog[open]')).not.toBeNull())
    await userEvent.click(await within(document.body).findByRole('button', { name: 'Stäng' }))
    await waitFor(() => expect(opener).toHaveFocus())
  },
}

/** `useFocus({ active })` on a plain drawer: focus moves in on open and returns to the button on close. */
export const Restore: Story = {
  parameters: source('RestoreDrawer'),
  render: (_args, { globals }) => <RestoreDrawer locale={localeFor(globals)} />,
  play: async ({ canvas }) => {
    const opener = canvas.getByRole('button', { name: 'Öppna filter' })
    await userEvent.click(opener)
    await waitFor(() => expect(canvas.getByRole('textbox', { name: 'Sök' })).toHaveFocus())
    await userEvent.click(canvas.getByRole('button', { name: 'Stäng' }))
    await waitFor(() => expect(opener).toHaveFocus())
  },
}

/** `contain: 'loop'`: Tab and Shift+Tab wrap at the drawer's ends. Escape calls `onEscape`: the way out (2.1.2). */
export const Loop: Story = {
  parameters: source('LoopDrawer'),
  render: (_args, { globals }) => <LoopDrawer locale={localeFor(globals)} />,
  play: async ({ canvas }) => {
    const opener = canvas.getByRole('button', { name: 'Öppna filter' })
    await userEvent.click(opener)
    await waitFor(() => expect(canvas.getByRole('textbox', { name: 'Sök' })).toHaveFocus())
    await userEvent.tab({ shift: true })
    await expect(canvas.getByRole('button', { name: 'Stäng' })).toHaveFocus()
    await userEvent.tab()
    await expect(canvas.getByRole('textbox', { name: 'Sök' })).toHaveFocus()
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(opener).toHaveFocus())
  },
}

/** `contain: 'inert'`: the rest of the page is `inert` while the drawer is open, and restored when it closes. */
export const Inert: Story = {
  parameters: source('InertDrawer'),
  render: (_args, { globals }) => <InertDrawer locale={localeFor(globals)} />,
  play: async ({ canvas, canvasElement }) => {
    const opener = canvas.getByRole('button', { name: 'Öppna filter' })
    await userEvent.click(opener)
    await waitFor(() => expect(canvas.getByRole('textbox', { name: 'Sök' })).toHaveFocus())
    await expect(canvasElement.querySelector('[inert]')).not.toBeNull()
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(opener).toHaveFocus())
    await expect(canvasElement.ownerDocument.querySelector('[inert]')).toBeNull()
  },
}

/** `initialFocus`: the first stop (default), the container, a selector, or nowhere. Pick one, then open the drawer. */
export const InitialFocus: Story = {
  name: 'Initial focus',
  parameters: source('InitialFocusChoices'),
  render: (_args, { globals }) => <InitialFocusChoices locale={localeFor(globals)} />,
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('radio', { name: '"#filter-search"' }))
    await userEvent.click(canvas.getByRole('button', { name: 'Öppna filter' }))
    await waitFor(() => expect(canvas.getByRole('textbox', { name: 'Sök' })).toHaveFocus())
  },
}

/** `moveOn` for a wizard step: focus goes to the step's heading and Tab continues from it. */
export const Step: Story = {
  name: 'Wizard step',
  parameters: source('WizardStep'),
  render: (_args, { globals }) => <WizardStep locale={localeFor(globals)} />,
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('heading', { level: 2 })).not.toHaveFocus()
    await userEvent.click(canvas.getByRole('button', { name: 'Nästa steg' }))
    await waitFor(() => expect(canvas.getByRole('heading', { name: 'Steg 2' })).toHaveFocus())
    await userEvent.tab()
    await expect(canvas.getByRole('button', { name: 'Första i steget' })).toHaveFocus()
  },
}

/** `moveOn` on a route: what `useRouteFocus` does, which is built on it. See Route focus. */
export const Route: Story = {
  parameters: source('RouteMove'),
  render: (_args, { globals }) => <RouteMove locale={localeFor(globals)} />,
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Till tjänster' }))
    await waitFor(() => expect(canvas.getByRole('heading', { level: 1 })).toHaveFocus())
    await expect(canvas.getByRole('heading', { level: 1 })).toHaveTextContent('Våra tjänster')
  },
}

/** `FocusScope`: the hook and the element in one part, with `render`. */
export const Part: Story = {
  name: 'FocusScope part',
  parameters: source('ScopePart'),
  render: (_args, { globals }) => <ScopePart locale={localeFor(globals)} />,
  play: async ({ canvas }) => {
    const opener = canvas.getByRole('button', { name: 'Öppna filter' })
    await userEvent.click(opener)
    await waitFor(() => expect(canvas.getByRole('textbox', { name: 'Sök' })).toHaveFocus())
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(opener).toHaveFocus())
  },
}

/** The keys of a contained drawer: Tab wraps at the last stop, Shift+Tab at the first, Escape leaves. */
export const Keyboard: Story = {
  parameters: source('LoopDrawer'),
  render: (_args, { globals }) => <LoopDrawer locale={localeFor(globals)} />,
  play: async ({ canvas }) => {
    const opener = canvas.getByRole('button', { name: 'Öppna filter' })
    await userEvent.click(opener)
    await waitFor(() => expect(canvas.getByRole('textbox', { name: 'Sök' })).toHaveFocus())
    await userEvent.tab()
    await expect(canvas.getByRole('button', { name: 'Använd' })).toHaveFocus()
    await userEvent.tab()
    await expect(canvas.getByRole('button', { name: 'Stäng' })).toHaveFocus()
    await userEvent.tab()
    await expect(canvas.getByRole('textbox', { name: 'Sök' })).toHaveFocus()
    await userEvent.tab({ shift: true })
    await expect(canvas.getByRole('button', { name: 'Stäng' })).toHaveFocus()
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(opener).toHaveFocus())
  },
}

/** Right to left, in English: the same behaviour. */
export const RTL: Story = {
  globals: { dir: 'rtl', locale: 'en' },
  parameters: source('LoopDrawer'),
  render: (_args, { globals }) => <LoopDrawer locale={localeFor(globals)} />,
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Open filters' }))
    await waitFor(() => expect(canvas.getByRole('textbox', { name: 'Search' })).toHaveFocus())
  },
}
