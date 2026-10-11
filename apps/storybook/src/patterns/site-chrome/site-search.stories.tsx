import { SiteHeader, SiteSearch } from '@kvirn-ui/patterns'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent } from 'storybook/test'
import contract from '../../../../../packages/patterns/src/site-chrome/site-search/site-search.a11y.md?raw'
import { expectNoHorizontalOverflow } from '../../components/theme-story-assertions.ts'
import { chromeViewports, narrowGlobals } from '../patterns-story-support.tsx'

// Patterns/Site chrome/Site search: the site's search, in the Site header or on the results page.
// Each story is the code an adopter copies: literal JSX, literal text.

const description = `The site's search: a \`<search>\` landmark around a GET form, with the field and a **Search** button joined into one strip (\`Field\`, \`TextInput\` and \`Button\` in an attached \`ButtonGroup\`). The field's label is visually hidden: the button's word is the visible cue, and its name.

Put it in the Site header's \`Masthead\`, and on the results page with the query as \`defaultValue\`. To build the same strip yourself, see [InputGroup › Search](?path=/story/components-forms-inputgroup--search).

## API

| Part | Element | Props |
| ---- | ------- | ----- |
| \`SiteSearch\` | \`<search>\` with a GET \`<form>\` | \`action\` (required): the search page. \`label\` (required): the field's name. Children: the button's word. \`name\` (default \`q\`), \`defaultValue\` |

The pattern has no strings of its own.

## Parts and gaps

Parts used: \`Field\`, \`TextInput\`, \`ButtonGroup\`, \`Button\`. Gap in \`@kvirn-ui/react\`: a search block.
`

const meta = {
  title: 'Patterns/Site chrome/Site search',
  component: SiteSearch,
  args: { action: '#search', label: 'Search the site', children: 'Search' },
  globals: { locale: 'en' },
  parameters: {
    a11yContract: contract,
    docs: { description: { component: description } },
    viewport: { options: chromeViewports },
  },
} satisfies Meta<typeof SiteSearch>

export default meta
type Story = StoryObj<typeof meta>

/** The field and the Search button, one strip. */
export const Default: Story = {
  render: () => (
    <SiteSearch action="#search" label="Search the site">
      Search
    </SiteSearch>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('searchbox', { name: 'Search the site' })).toBeVisible()
    await expect(canvas.getByRole('button', { name: 'Search' })).toHaveAttribute('type', 'submit')
  },
}

/** On the results page: the query already searched for is in the field. */
export const WithValue: Story = {
  render: () => (
    <SiteSearch action="#search" label="Search the site" defaultValue="parking permit">
      Search
    </SiteSearch>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('searchbox', { name: 'Search the site' })).toHaveValue(
      'parking permit',
    )
  },
}

/** On the primary Site header: the field and button keep their look, the ring is `on-primary`. */
export const OnPrimaryBand: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => (
    <SiteHeader.Root variant="primary">
      <SiteHeader.Masthead>
        <SiteSearch action="#search" label="Search the site">
          Search
        </SiteSearch>
      </SiteHeader.Masthead>
    </SiteHeader.Root>
  ),
}

/** At 320px: the strip stays one row and nothing scrolls sideways. */
export const Narrow: Story = {
  globals: { ...narrowGlobals },
  render: () => (
    <SiteSearch action="#search" label="Search the site">
      Search
    </SiteSearch>
  ),
  play: async ({ canvasElement }) => {
    await expectNoHorizontalOverflow(canvasElement)
  },
}

/** Try the keys (see Keyboard above): Tab moves from the field to Search, Enter in the field submits. */
export const Keyboard: Story = {
  render: () => (
    <SiteSearch action="#search" label="Search the site">
      Search
    </SiteSearch>
  ),
  play: async ({ canvas }) => {
    const field = canvas.getByRole('searchbox', { name: 'Search the site' })
    field.focus()
    await userEvent.tab()
    await expect(canvas.getByRole('button', { name: 'Search' })).toHaveFocus()
  },
}

/** Right to left: the button is at the left, the field's squared corners follow. */
export const RTL: Story = {
  globals: { dir: 'rtl', locale: 'en' },
  render: () => (
    <SiteSearch action="#search" label="Search the site">
      Search
    </SiteSearch>
  ),
}

/** Forced colours: the field and the button keep their system edges. */
export const ForcedColors: Story = {
  globals: { forcedColors: 'active' },
  render: () => (
    <SiteSearch action="#search" label="Search the site">
      Search
    </SiteSearch>
  ),
}
