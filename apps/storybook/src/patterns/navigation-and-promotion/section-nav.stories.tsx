import { SectionNav } from '@kvirn-ui/patterns'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent } from 'storybook/test'
import contract from '../../../../../packages/patterns/src/navigation-and-promotion/section-nav/section-nav.a11y.md?raw'
import { expectNoHorizontalOverflow } from '../../components/theme-story-assertions.ts'
import {
  chromeViewports,
  expectDrawn,
  narrowGlobals,
  wideGlobals,
} from '../patterns-story-support.tsx'

// Patterns/Navigation and promotion/Section nav (docs/design/storybook-patterns.md section 6).
// The Disclosure below 64rem and the panel from 64rem follow the docs shell's rule.

const description = `The pages of the section, beside \`main\`. Below \`64rem\` it is a **In this section** button that opens the list in the page's flow; from \`64rem\` the button is gone and the list is always shown. The list is a navigation of the same name, with exactly one \`aria-current\`: \`page\` on the page, or \`true\` on the deepest item shown when the page is not listed. Never mark an ancestor.

Use it on every page of a section with three or more pages, in the sidebar or above the content on a narrow screen. Two levels at most on a resident page.

## API

| Part | Element | Props |
| ---- | ------- | ----- |
| \`SectionNav.Root\` | \`<div>\` around a \`Disclosure\` | \`label\` (the navigation's name, required), \`defaultOpen\` (below \`64rem\`). Other \`<div>\` props |
| \`SectionNav.Trigger\` | \`<button>\` | Children are the visible name; shown below \`64rem\` |
| \`SectionNav.Panel\` | \`<div>\` holding a \`<nav>\` and \`<ul>\` | Named by the root's \`label\`. Holds the links |
| \`SectionNav.Link\` | \`<li>\` with \`<a href>\` | \`href\`, \`current\`, \`as\` (a router link) |
| \`SectionNav.Group\` | \`<li>\` | A page with pages under it: a \`GroupLink\` and \`GroupItems\` |
| \`SectionNav.GroupLink\` | \`<a href>\` | The group's own page: \`href\`, \`current\`, \`as\` |
| \`SectionNav.GroupItems\` | nested \`<ul>\` | \`SectionNav.Link\`s |

## Parts and gaps

Parts used: \`Disclosure\`, \`Navigation\`, \`Link\`. No gap.
`

const meta = {
  title: 'Patterns/Navigation and promotion/Section nav',
  component: SectionNav.Root,
  args: { label: 'In this section' },
  globals: { locale: 'en' },
  parameters: {
    a11yContract: contract,
    docs: { description: { component: description } },
    viewport: { options: chromeViewports },
  },
} satisfies Meta<typeof SectionNav.Root>

export default meta
type Story = StoryObj<typeof meta>

/** Wide: the list is always shown, the page is in a nested group, and there is no button. */
export const Default: Story = {
  globals: { ...wideGlobals },
  render: () => (
    <div lang="en">
      <SectionNav.Root label="In this section">
        <SectionNav.Trigger>In this section</SectionNav.Trigger>
        <SectionNav.Panel>
          <SectionNav.Link href="#overview">Overview</SectionNav.Link>
          <SectionNav.Group>
            <SectionNav.GroupLink href="#preschool">Preschool</SectionNav.GroupLink>
            <SectionNav.GroupItems>
              <SectionNav.Link href="#apply" current="page">
                How to apply
              </SectionNav.Link>
              <SectionNav.Link href="#fees">Fees</SectionNav.Link>
              <SectionNav.Link href="#queue">Queue and placement</SectionNav.Link>
            </SectionNav.GroupItems>
          </SectionNav.Group>
          <SectionNav.Link href="#primary">Primary school</SectionNav.Link>
          <SectionNav.Link href="#upper-secondary">Upper secondary school</SectionNav.Link>
        </SectionNav.Panel>
      </SectionNav.Root>
    </div>
  ),
  play: async ({ canvas }) => {
    // The panel keeps `hidden` and the theme shows it from 64rem, so a role query needs `hidden`.
    const nav = canvas.getByRole('navigation', { name: 'In this section', hidden: true })
    await expectDrawn(nav)
    await expect(nav.querySelectorAll('[aria-current]')).toHaveLength(1)
    await expect(canvas.queryByRole('button', { name: 'In this section' })).toBeNull()
  },
}

/** Narrow: closed behind the button; press it to open the list in the flow. */
export const Narrow: Story = {
  ...Default,
  globals: { ...narrowGlobals },
  play: async ({ canvas, canvasElement }) => {
    const trigger = canvas.getByRole('button', { name: 'In this section' })
    await expect(trigger).toHaveAttribute('aria-expanded', 'false')
    await userEvent.click(trigger)
    await expect(trigger).toHaveAttribute('aria-expanded', 'true')
    await expect(canvas.getByRole('navigation', { name: 'In this section' })).toBeVisible()
    await expectNoHorizontalOverflow(canvasElement)
  },
}

/** Narrow and open from the start, for a section landing page. */
export const NarrowOpen: Story = {
  globals: { ...narrowGlobals },
  render: () => (
    <div lang="en">
      <SectionNav.Root label="In this section" defaultOpen>
        <SectionNav.Trigger>In this section</SectionNav.Trigger>
        <SectionNav.Panel>
          <SectionNav.Link href="#overview">Overview</SectionNav.Link>
          <SectionNav.Link href="#preschool" current="page">
            Preschool
          </SectionNav.Link>
          <SectionNav.Link href="#primary">Primary school</SectionNav.Link>
        </SectionNav.Panel>
      </SectionNav.Root>
    </div>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('button', { name: 'In this section' })).toHaveAttribute(
      'aria-expanded',
      'true',
    )
    await expect(canvas.getAllByRole('link')).toHaveLength(3)
  },
}

/** Try the keys (see Keyboard above): Tab to the button, Enter or Space to open, Tab through the links. */
export const Keyboard: Story = { ...Narrow }

/** Right to left: the list starts at the right and the chevron mirrors. */
export const RTL: Story = {
  ...Narrow,
  globals: { ...narrowGlobals, dir: 'rtl', locale: 'en' },
}

/** Forced colours: the button keeps its border and the current page is marked by more than colour. */
export const ForcedColors: Story = {
  ...Narrow,
  globals: { ...narrowGlobals, forcedColors: 'active' },
}
