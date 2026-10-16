// kv-lang-ok-file: the statement names the national terms of each country (tillgänglighetsredogörelse, tilgjengelighetserklæring)
import { PageFrame } from '@kvirn-ui/patterns'
import { AccessibilityStatement } from '@kvirn-ui/patterns/content-types'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'
import source from '../../../../packages/patterns/src/content-types/accessibility-statement/accessibility-statement.tsx?raw'
import { expectNoHorizontalOverflow } from '../components/theme-story-assertions.ts'
import { chromeViewports, narrowGlobals, wideGlobals } from '../patterns/patterns-story-support.tsx'
import { expectPageOutline } from './page-outline.ts'
import { withShell } from './shell.tsx'
// Content types/Accessibility statement: SE, FI, NO and EU variants (docs/design/storybook-patterns-t5.md S7).
// The page is a component in `@kvirn-ui/patterns/content-types`; the source panel shows its module text, which an adopter copies.

const description = `Every public body must publish an accessibility statement and a way to report a problem. This is the page's structure and wording, in a reading column: how accessible the website is, what is not, how it was tested, how to report a problem (a link to the [Form page](?path=/docs/content-types-form-page--docs) and the contact centre), the supervisory authority, and when it was published and reviewed.

**It never states a conformance status.** Where the status goes there is a fill-in box: the adopter writes its own facts (designed and tested to meet WCAG 2.2 AA is a statement about the library, never about your site). Follow the supervisor's own template and verify the wording with your legal team.

- **Sweden** (\`tillgänglighetsredogörelse\`): the supervisor is Digg; the Post and Telecom Authority (PTS) from 2027-01-01 (\`TODO(legal-verify)\`).
- **Finland** (\`saavutettavuusseloste\`): the supervisor is Traficom, and the statement is published in Finnish and Swedish; the page links to both versions.
- **Norway** (\`tilgjengelighetserklæring\`): published in Digdir's uustatus.no tool, so the page links to it and does not repeat it.
- **EU** (the European Accessibility Act): accessibility information for a private-sector service, with the market surveillance authority.

**Page contract.** One \`banner\`, one \`main\`, one \`contentinfo\`; one \`h1\` and \`h2\` sections; a list for the problems, so the count is announced; dates are \`<time>\`; no third-party request (the link to uustatus.no is a plain link out); text in another language carries \`lang\`.
`

const meta = {
  title: 'Content types/Accessibility statement',
  component: PageFrame.Root,
  globals: { locale: 'en' },
  decorators: [withShell],
  parameters: {
    layout: 'fullscreen',
    shell: { header: 'kvirnby' },
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

/** Sweden: Digg supervises, PTS from 2027-01-01. The status is a fill-in box. */
export const Sweden: Story = {
  globals: { ...wideGlobals },
  render: () => <AccessibilityStatement country="se" />,
  play: async ({ canvas, canvasElement }) => {
    await expectPageOutline(canvasElement)
    await expect(canvas.getByText(/Fill in:/)).toBeVisible()
    await expect(canvas.getAllByRole('listitem').length).toBeGreaterThan(0)
  },
}

/** Finland: Traficom supervises, and the statement is also in Finnish and Swedish. */
export const Finland: Story = {
  globals: { ...wideGlobals },
  render: () => <AccessibilityStatement country="fi" />,
  play: async ({ canvas, canvasElement }) => {
    await expectPageOutline(canvasElement)
    await expect(canvas.getByRole('link', { name: 'suomi' })).toHaveAttribute('lang', 'fi')
    await expect(canvas.getByRole('link', { name: 'svenska' })).toHaveAttribute('lang', 'sv')
  },
}

/** Norway: the statement lives at uustatus.no, so the page links to it and does not repeat it. */
export const Norway: Story = {
  globals: { ...wideGlobals },
  render: () => <AccessibilityStatement country="no" />,
  play: async ({ canvas, canvasElement }) => {
    await expectPageOutline(canvasElement)
    await expect(canvas.getByRole('link', { name: /uustatus\.no/ })).toBeVisible()
  },
}

/** The European Accessibility Act: accessibility information for a private-sector service. */
export const EuropeanUnion: Story = {
  globals: { ...wideGlobals },
  render: () => <AccessibilityStatement country="eu" />,
  play: async ({ canvasElement }) => {
    await expectPageOutline(canvasElement)
  },
}

/** 320px: one column, the problems wrap, no sideways scroll. */
export const Narrow: Story = {
  globals: { ...narrowGlobals },
  render: () => <AccessibilityStatement country="se" />,
  play: async ({ canvasElement }) => {
    await expectPageOutline(canvasElement)
    await expectNoHorizontalOverflow(canvasElement)
  },
}

/** Right to left: the breadcrumb and the list flow from the right; DOM order is unchanged. */
export const RTL: Story = {
  globals: { dir: 'rtl', locale: 'en', ...wideGlobals },
  render: () => <AccessibilityStatement country="se" />,
}
