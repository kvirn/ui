import { PageFrame } from '@kvirn-ui/patterns'
import { SearchResults } from '@kvirn-ui/patterns/content-types'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'
import source from '../../../../packages/patterns/src/content-types/search-results/search-results.tsx?raw'
import { expectNoHorizontalOverflow } from '../components/theme-story-assertions.ts'
import { chromeViewports, narrowGlobals, wideGlobals } from '../patterns/patterns-story-support.tsx'
import { expectPageOutline } from './page-outline.ts'
import { withShell } from './shell.tsx'
// Content types/Search results: a whole page in the site chrome (docs/design/storybook-patterns-t5.md S10).
// The page is a component in `@kvirn-ui/patterns/content-types`; the source panel shows its module text, which an adopter copies.

const description = `The search page: the title, the search form, the result count, the filters, the results and Pagination. Results are an ordered list of \`h3\` titles under the count's \`h2\`, one link each, with the path as text and the searched word in a \`<mark>\`. The filters change the results in place and say the new count once, politely, through the provider's announcer. Built from the [Search and filter recipes](?path=/docs/patterns-search-and-forms-filter--docs), a [List](?path=/docs/components-content-list--docs) and [Pagination](?path=/docs/patterns-news-events-and-notices-pagination--docs).

**Page contract.** One \`banner\`, one \`main\`, one \`contentinfo\`; one \`h1\` and no skipped heading level; the skip link is first and targets \`main\`. The header's \`search\` landmark and this page's are named differently ("Search the site", "Find a page"). Designed and tested to meet WCAG 2.2 AA.
`

const meta = {
  title: 'Content types/Search results',
  component: PageFrame.Root,
  globals: { locale: 'en' },
  decorators: [withShell],
  parameters: {
    layout: 'fullscreen',
    shell: { header: 'kvirnby' },
    docs: { description: { component: description }, source: { code: source } },
    viewport: { options: chromeViewports },
  },
} satisfies Meta<typeof PageFrame.Root>

export default meta
type Story = StoryObj<typeof meta>

/** Five hits for "preschool", with the filters above them. */
export const Default: Story = {
  globals: { ...wideGlobals },
  render: () => <SearchResults />,
  play: async ({ canvasElement, canvas }) => {
    await expectPageOutline(canvasElement)
    await expect(canvasElement.querySelectorAll('search')).toHaveLength(2)
    await expect(canvas.getAllByRole('listitem').length).toBeGreaterThan(4)
  },
}

/** One hit: the count says "1 result". */
export const OneResult: Story = {
  globals: { ...wideGlobals },
  render: () => <SearchResults state="one" />,
  play: async ({ canvasElement, canvas }) => {
    await expectPageOutline(canvasElement)
    await expect(canvas.getByRole('heading', { level: 2, name: '1 result' })).toBeVisible()
  },
}

/** A page of ten of 27 hits, with Pagination. */
export const Many: Story = {
  globals: { ...wideGlobals },
  render: () => <SearchResults state="many" />,
  play: async ({ canvasElement, canvas }) => {
    await expectPageOutline(canvasElement)
    await expect(canvas.getByRole('navigation', { name: 'Pages' })).toBeVisible()
  },
}

/** A misspelt word: spelling advice, popular pages and the contact centre. */
export const NoResults: Story = {
  globals: { ...wideGlobals },
  render: () => <SearchResults state="none" />,
  play: async ({ canvasElement }) => {
    await expectPageOutline(canvasElement)
  },
}

/** Nothing typed: a prompt, not an error. */
export const EmptyQuery: Story = {
  globals: { ...wideGlobals },
  render: () => <SearchResults state="empty" />,
  play: async ({ canvasElement }) => {
    await expectPageOutline(canvasElement)
    await expect(canvasElement.querySelector('main ol')).toBeNull()
  },
}

/** Two filters leave nothing: the applied row and Clear all stay in view. */
export const FilteredToNone: Story = {
  globals: { ...wideGlobals },
  render: () => <SearchResults state="filtered" />,
  play: async ({ canvasElement, canvas }) => {
    await expectPageOutline(canvasElement)
    await expect(canvas.getByText('No results match these filters.')).toBeVisible()
    await expect(canvas.getByRole('button', { name: 'Clear all filters' })).toBeVisible()
  },
}

/** 320px: one column, nothing scrolls sideways. */
export const Narrow: Story = {
  ...Many,
  globals: { ...narrowGlobals },
  play: async ({ canvasElement }) => {
    await expectPageOutline(canvasElement)
    await expectNoHorizontalOverflow(canvasElement)
  },
}

/** Right to left; DOM order is unchanged. */
export const RTL: Story = {
  ...Default,
  globals: { dir: 'rtl', locale: 'en', ...wideGlobals },
}
