import { PageFrame } from '@kvirn-ui/patterns'
import { Heading } from '@kvirn-ui/react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, within } from 'storybook/test'
import { chromeViewports, wideGlobals } from '../patterns/patterns-story-support.tsx'
import { expectPageOutline } from './kvirnby-chrome.tsx'
import { withShell } from './shell.tsx'
// Content types/Shell: the one frame every content-type story sits in. Story-only.

const description = `A content type is only what sits between the header and the footer. The shell supplies the rest: the skip link first in the DOM, the site header, an optional site alert and the site footer, so a content type never repeats them.

The shell is the \`withShell\` decorator, configured by \`parameters.shell\`. The skip link targets \`#main\`, so the content type renders exactly one \`main\`, through [Page frame](?path=/docs/patterns-site-chrome-page-frame--docs).
`

const meta = {
  title: 'Content types/Shell',
  component: PageFrame.Root,
  globals: { locale: 'en' },
  decorators: [withShell],
  parameters: {
    layout: 'fullscreen',
    docs: { description: { component: description } },
    viewport: { options: chromeViewports },
    shell: { header: 'kvirnby' },
  },
} satisfies Meta<typeof PageFrame.Root>

export default meta
type Story = StoryObj<typeof meta>

/** A placeholder slot in the shell: the skip link, the header, the slot's `main` and the footer. */
export const Default: Story = {
  globals: { ...wideGlobals },
  render: () => (
    <PageFrame.Main>
      <Heading as="h1">Content type</Heading>
      <p>The content type renders here, and only here.</p>
    </PageFrame.Main>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expectPageOutline(canvasElement)
    await userEvent.tab()
    const skipLink = canvas.getByRole('link', { name: /skip/i })
    await expect(skipLink).toHaveFocus()
    await expect(skipLink).toHaveAttribute('href', '#main')
    await expect(canvasElement.querySelector('#main')).toBe(canvas.getByRole('main'))
    const banner = canvas.getByRole('banner')
    await expect(
      skipLink.compareDocumentPosition(banner) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()
  },
}
