import { PageFrame } from '@kvirn-ui/patterns'
import { FormPage } from '@kvirn-ui/patterns/content-types'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent } from 'storybook/test'
import source from '../../../../packages/patterns/src/content-types/form-page/form-page.tsx?raw'
import { inDocsFrame } from '../components/error-summary/error-summary.fixture.tsx'
import { expectNoHorizontalOverflow } from '../components/theme-story-assertions.ts'
import { chromeViewports, narrowGlobals, wideGlobals } from '../patterns/patterns-story-support.tsx'
import { expectPageOutline } from './page-outline.ts'
import { withShell } from './shell.tsx'
// Content types/Form page: report an accessibility problem, in the transaction header (docs/design/storybook-patterns-t5.md S7).
// The page is a component in `@kvirn-ui/patterns/content-types`; the source panel shows its module text, which an adopter copies.

const description = `Every adopter must offer a way to report an accessibility problem (Web Accessibility Directive, Art. 7). This is that page: a back link, the title, three questions (which page, prefilled with the address the user came from and editable; what is wrong, with a character count; an optional email address) and Send, in a \`form\`-width column under the transaction header: the logo and the service's name, with no search and no menu, so there is nothing to wander off to. After Send, a confirmation with a reference number and a [CopyButton](?path=/docs/components-forms-copybutton--docs).

Written as literal JSX from shipped parts: [Form with error summary](?path=/docs/patterns-search-and-forms-form-with-error-summary--docs), \`Field\`, \`TextInput\`, \`Textarea\`, \`Alert\`, \`CopyButton\` and \`Link\`. It never asks for a personal identity number, and nothing is sent: the confirmation says so.

**Page contract.** One \`banner\`, one \`main\`, one \`contentinfo\`; one \`h1\`; the skip link is first. After a failed send the error summary is first in \`main\`, takes focus once, and the page title is prefixed. The answers are kept after an error and after a failed send (3.3.7). After a successful send focus moves to the confirmation's \`h1\`. Designed and tested to meet WCAG 2.2 AA.
`

const meta = {
  title: 'Content types/Form page',
  component: PageFrame.Root,
  globals: { locale: 'en' },
  decorators: [withShell],
  parameters: {
    layout: 'fullscreen',
    shell: { header: 'transaction' },
    docs: {
      description: { component: description },
      source: { code: source },
      story: { inline: false, iframeHeight: 720 },
    },
    viewport: { options: chromeViewports },
  },
} satisfies Meta<typeof PageFrame.Root>

export default meta
type Story = StoryObj<typeof meta>

/** The empty form, with the page the user came from filled in. */
export const Default: Story = {
  globals: { ...wideGlobals },
  render: () => <FormPage />,
  play: async ({ canvasElement }) => {
    await expectPageOutline(canvasElement)
  },
}

/** After Send with the page address and the description empty: the summary is first in `main`, and each question keeps its message. */
export const InvalidOnSubmit: Story = {
  globals: { ...wideGlobals },
  render: () => <FormPage state="invalid" />,
  play: async ({ canvas, canvasElement }) => {
    await expectPageOutline(canvasElement)
    await expect(canvas.getByRole('group', { name: /There is a problem/ })).toBeVisible()
  },
}

/** Fill in the description and send again: the summary goes, the confirmation shows and takes focus. */
export const FixedOnNextSubmit: Story = {
  globals: { ...wideGlobals },
  render: () => <FormPage state="invalid" />,
  play: async ({ canvas }) => {
    if (inDocsFrame()) {
      return
    }
    await userEvent.type(
      canvas.getByRole('textbox', { name: /Which page/ }),
      'https://www.kvirnby.example/fees',
    )
    await userEvent.type(
      canvas.getByRole('textbox', { name: /What is wrong/ }),
      'The menu cannot be opened with the keyboard.',
    )
    await userEvent.click(canvas.getByRole('button', { name: 'Send' }))
    await expect(
      canvas.getByRole('heading', { level: 1, name: 'Thank you for your report' }),
    ).toHaveFocus()
  },
}

/** Send a valid report while the service is down: focus moves to the alert's title once, and the answers are kept. */
export const SubmitFailsLive: Story = {
  globals: { ...wideGlobals },
  render: () => <FormPage failNextSend />,
  play: async ({ canvas }) => {
    if (inDocsFrame()) {
      return
    }
    await userEvent.type(canvas.getByRole('textbox', { name: /What is wrong/ }), 'The menu fails.')
    await userEvent.click(canvas.getByRole('button', { name: 'Send' }))
    await expect(canvas.getByRole('heading', { level: 2, name: /We could not send/ })).toHaveFocus()
    await expect(canvas.getByRole('textbox', { name: /What is wrong/ })).toHaveValue(
      'The menu fails.',
    )
  },
}

/** The send failed on our side: an Alert.Danger above the title, and the answers are kept. */
export const SubmitFailed: Story = {
  globals: { ...wideGlobals },
  render: () => <FormPage state="failed" />,
  play: async ({ canvas, canvasElement }) => {
    await expectPageOutline(canvasElement)
    await expect(canvas.getByRole('heading', { level: 2, name: /We could not send/ })).toBeVisible()
    await expect(canvas.getByRole('textbox', { name: /What is wrong/ })).toHaveValue(
      'The contrast on the search button is too low.',
    )
  },
}

/** The confirmation: the reference number, a button that copies it, what happens next, and that nothing was sent. */
export const Sent: Story = {
  globals: { ...wideGlobals },
  render: () => <FormPage state="sent" />,
  play: async ({ canvas, canvasElement }) => {
    await expectPageOutline(canvasElement)
    await expect(canvas.getByRole('button', { name: /Copy reference number/ })).toBeVisible()
  },
}

/** 320px: one column under the transaction header, no sideways scroll. */
export const Narrow: Story = {
  globals: { ...narrowGlobals },
  render: () => <FormPage state="invalid" />,
  play: async ({ canvasElement }) => {
    await expectPageOutline(canvasElement)
    await expectNoHorizontalOverflow(canvasElement)
  },
}

/** Right to left: the back link's arrow and the summary's bar move to the right; DOM order is unchanged. */
export const RTL: Story = {
  globals: { dir: 'rtl', locale: 'en', ...wideGlobals },
  render: () => <FormPage state="invalid" />,
}
