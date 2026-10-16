import { ErrorSummary } from '@kvirn-ui/react'
import contract from '../../../../../packages/react/src/error-summary/error-summary.a11y.md?raw'
import guide from '../../../../../packages/react/src/error-summary/error-summary.md?raw'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { expect, userEvent, waitFor } from 'storybook/test'
import { usageGuide } from '../../docs-source.ts'
import { expectNoHorizontalOverflow } from '../theme-story-assertions.ts'
import { inDocsFrame, ParkingForm, withErrorSummaryLocale } from './error-summary.fixture.tsx'

// Components/ErrorSummary: the headless ErrorSummary, an Alert.Danger styled by
// @kvirn-ui/theme/theme.css. The stories are the question page of a parking-permit application
// after a failed submit, in Swedish. The summary takes focus when it appears, and a focus move in
// a Docs frame scrolls the whole page. So the stories set disableAutoFocus, and the two that drive
// focus (OnSubmit, Keyboard) run their play function in the Canvas only. The focus rows are proved
// in error-summary.test.tsx. The library's own words follow the locale toolbar.

const meta = {
  title: 'Components/Forms/ErrorSummary',
  component: ErrorSummary.Root,
  argTypes: {
    focusKey: {
      control: false,
      description:
        'Focus moves to the summary on mount and each time this changes: pass the submit count.',
    },
    prefixDocumentTitle: {
      control: 'boolean',
      description: 'Puts the message `errorSummary.titlePrefix` before the page title while shown.',
    },
    disableAutoFocus: {
      control: 'boolean',
      description:
        'Never moves focus to the summary. For a static preview only: in an app the focus move is the announcement.',
    },
  },
  decorators: [withErrorSummaryLocale],
  globals: { locale: 'en' },
  parameters: {
    a11yContract: contract,
    docs: {
      description: { component: usageGuide(guide) },
      story: { inline: false, iframeHeight: 640 },
    },
  },
} satisfies Meta<typeof ErrorSummary.Root>

export default meta
type Story = StoryObj<typeof meta>

const summaryName = /There is a problem/

/** After a failed submit: the summary above the form, and each link goes to its field or group. */
export const Default: Story = {
  render: () => <ParkingForm prefix="default" disableAutoFocus />,
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('group', { name: summaryName })).toBeVisible()
    await expect(canvas.getByRole('heading', { level: 2 })).toHaveTextContent(summaryName)
    await expect(canvas.getAllByRole('listitem')).toHaveLength(2)
  },
}

/** The page title carries the prefix while the summary is shown (`prefixDocumentTitle`). */
export const TitlePrefix: Story = {
  render: () => <ParkingForm prefix="title-prefix" prefixDocumentTitle disableAutoFocus />,
  play: async () => {
    await waitFor(() => expect(document.title.startsWith('Error: ')).toBe(true))
  },
}

function Submitting() {
  const [submitCount, setSubmitCount] = useState(0)
  return (
    <>
      <button type="button" className="kv-button" onClick={() => setSubmitCount(submitCount + 1)}>
        Send application
      </button>
      <ParkingForm prefix="submitting" focusKey={submitCount} showErrors={submitCount > 0} />
    </>
  )
}

/** A failed submit, as it happens: nothing shows until the button is pressed, then focus moves. */
export const OnSubmit: Story = {
  render: () => <Submitting />,
  play: async ({ canvas }) => {
    if (inDocsFrame()) {
      return
    }
    await expect(canvas.queryByRole('group', { name: summaryName })).toBeNull()
    await userEvent.click(canvas.getAllByRole('button', { name: 'Send application' })[0]!)
    await expect(canvas.getByRole('group', { name: summaryName })).toHaveFocus()
    await userEvent.click(canvas.getByRole('link', { name: 'Enter your email address' }))
    await expect(canvas.getByRole('textbox', { name: /Email/ })).toHaveFocus()
    await userEvent.click(canvas.getAllByRole('button', { name: 'Send application' })[0]!)
    await expect(canvas.getByRole('group', { name: summaryName })).toHaveFocus()
  },
}

/** The keys: Tab goes through the links, and Enter on one moves focus to its field. */
export const Keyboard: Story = {
  render: () => <ParkingForm prefix="keyboard" disableAutoFocus />,
  play: async ({ canvas }) => {
    if (inDocsFrame()) {
      return
    }
    canvas.getByRole('group', { name: summaryName }).focus()
    await userEvent.tab()
    await expect(canvas.getByRole('link', { name: 'Enter your email address' })).toHaveFocus()
    await userEvent.tab()
    await expect(
      canvas.getByRole('link', { name: 'Choose how long the permit should be valid' }),
    ).toHaveFocus()
    await userEvent.tab({ shift: true })
    await userEvent.keyboard('{Enter}')
    await expect(canvas.getByRole('textbox', { name: /Email/ })).toHaveFocus()
  },
}

/** One problem: the same box and list, with a single link. */
export const SingleError: Story = {
  render: () => (
    <ErrorSummary.Root disableAutoFocus>
      <ErrorSummary.Title />
      <ErrorSummary.List>
        <ErrorSummary.Item>
          <ErrorSummary.Link controlId="only-field">Enter your name</ErrorSummary.Link>
        </ErrorSummary.Item>
      </ErrorSummary.List>
    </ErrorSummary.Root>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('group', { name: summaryName })).toBeVisible()
    await expect(canvas.getAllByRole('listitem')).toHaveLength(1)
  },
}

/** A 320px column with long Finnish compound errors: they wrap and nothing scrolls sideways (1.4.10). */
export const Reflow320: Story = {
  render: () => (
    <ErrorSummary.Root disableAutoFocus>
      <ErrorSummary.Title />
      <ErrorSummary.List>
        <ErrorSummary.Item>
          <ErrorSummary.Link controlId="pitka-1">
            {/* kv-lang-ok: long Finnish compound hard case under locale fi */}
            Anna jätehuoltomaksunpalautuspäätöksentarkistuslomakkeen päivämäärä
          </ErrorSummary.Link>
        </ErrorSummary.Item>
        <ErrorSummary.Item>
          {/* kv-lang-ok: Finnish locale story text under locale fi */}
          <ErrorSummary.Link controlId="pitka-2">Valitse maksutapa</ErrorSummary.Link>
        </ErrorSummary.Item>
      </ErrorSummary.List>
    </ErrorSummary.Root>
  ),
  decorators: [(Story) => <div className="kv-story-narrow">{<Story />}</div>],
  globals: { locale: 'fi' },
  play: async ({ canvasElement, canvas }) => {
    const column = canvasElement.querySelector<HTMLElement>('.kv-story-narrow')
    if (column === null) {
      throw new Error('no narrow column')
    }
    // kv-lang-ok: asserts the Finnish summary title under locale fi
    await expect(canvas.getByRole('group', { name: /Lomakkeessa on virheitä/ })).toBeVisible()
    await expectNoHorizontalOverflow(column)
  },
}

/** Right to left, in English: the bar and icon are at the right and the list follows. */
export const RTL: Story = {
  globals: { dir: 'rtl', locale: 'en' },
  render: () => (
    <ErrorSummary.Root disableAutoFocus>
      <ErrorSummary.Title />
      <ErrorSummary.List>
        <ErrorSummary.Item>
          <ErrorSummary.Link controlId="rtl-1">Enter your email address</ErrorSummary.Link>
        </ErrorSummary.Item>
        <ErrorSummary.Item>
          <ErrorSummary.Link controlId="rtl-2">Choose how long the permit lasts</ErrorSummary.Link>
        </ErrorSummary.Item>
      </ErrorSummary.List>
    </ErrorSummary.Root>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('group', { name: /There is a problem/ })).toBeVisible()
  },
}

/** The danger bar, icon, status word and underlined links survive forced colours. */
export const ForcedColors: Story = {
  globals: { forcedColors: 'active' },
  render: () => <ParkingForm prefix="forced" disableAutoFocus />,
}
