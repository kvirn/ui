import { en } from '@kvirn-ui/i18n/en'
import { Heading, KvirnProvider, TableOfContents } from '@kvirn-ui/react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import contract from '../../../../../packages/patterns/src/content-and-media/contents/contents.a11y.md?raw'
import { expect, userEvent } from 'storybook/test'
import { expectNoHorizontalOverflow } from '../../components/theme-story-assertions.ts'
import { chromeViewports, narrowGlobals, wideGlobals } from '../patterns-story-support.tsx'

// Patterns/Content and media/Contents (docs/design/storybook-patterns-t5.md S13).
// Story-only: it is the shipped TableOfContents with the page's own headings.

const description = `Jump to a section of a long page. A [TableOfContents](?path=/docs/components-navigation-tableofcontents--docs) whose \`items\` match the \`id\` of each \`h2\` on the page, placed right after the \`h1\` and the preamble. It is its own named \`nav\` ("On this page"; one per page, rule R2) and plain \`#id\` links. Use it from three sections up: with fewer, render nothing. The heading being read is marked with \`aria-current="location"\`. It is not sticky, so DOM, visual and focus order agree (rule R5).

## Parts and gaps

Parts used: \`TableOfContents.Root\`, \`Heading\`. No gap.
`

const meta = {
  title: 'Patterns/Content and media/Contents',
  globals: { locale: 'en' },
  parameters: {
    a11yContract: contract,
    docs: { description: { component: description } },
    viewport: { options: chromeViewports },
  },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

const sections = [
  { id: 'who', label: 'Who can apply', level: 2 },
  { id: 'how', label: 'How to apply', level: 2 },
  { id: 'fees', label: 'Fees', level: 2 },
  { id: 'queue', label: 'The queue and your place', level: 2 },
  { id: 'moving', label: 'If you move or change your mind', level: 2 },
  { id: 'rights', label: 'Your rights and how to complain', level: 2 },
  { id: 'contact', label: 'Contact us', level: 2 },
]

function Page({ items }: { items: typeof sections }) {
  return (
    <KvirnProvider locale="en" messages={en}>
      <div lang="en" className="kv-prose">
        <Heading as="h1" size="heading-1">
          Preschool
        </Heading>
        <p className="kv-lead">Everything about applying for a preschool place.</p>
        {items.length >= 3 ? <TableOfContents.Root items={items} /> : null}
        {items.map((item) => (
          <section key={item.id}>
            <h2 id={item.id}>{item.label}</h2>
            <p>Text about {item.label.toLowerCase()}.</p>
          </section>
        ))}
      </div>
    </KvirnProvider>
  )
}

/** Three entries. */
export const Three: Story = {
  render: () => <Page items={sections.slice(0, 3)} />,
  play: async ({ canvas }) => {
    const nav = canvas.getByRole('navigation', { name: 'On this page' })
    await expect(nav).toBeVisible()
    await expect(canvas.getAllByRole('link')).toHaveLength(3)
  },
}

/** Seven entries. */
export const Seven: Story = {
  render: () => <Page items={sections} />,
  play: async ({ canvas }) => {
    await expect(canvas.getAllByRole('link')).toHaveLength(7)
  },
}

/** Fewer than three sections: no list is rendered, and there is no empty landmark. */
export const TwoSections: Story = {
  render: () => <Page items={sections.slice(0, 2)} />,
  play: async ({ canvas }) => {
    await expect(canvas.queryByRole('navigation')).toBeNull()
  },
}

/** Long titles wrap and are never truncated. */
export const LongTitles: Story = {
  render: () => (
    <Page
      items={[
        {
          id: 'a',
          label:
            'What you need to know about applying for a place in a preschool outside your area',
          level: 2,
        },
        {
          id: 'b',
          label: 'Varhaiskasvatuksenerityisopettajapalvelut ja niiden hakeminen',
          level: 2,
        },
        { id: 'c', label: 'Contact us', level: 2 },
      ]}
    />
  ),
  globals: { ...narrowGlobals },
  play: async ({ canvasElement }) => {
    await expectNoHorizontalOverflow(canvasElement)
  },
}

/** 320px: the list sits above the article; nothing scrolls sideways. */
export const Narrow: Story = {
  ...Seven,
  globals: { ...narrowGlobals },
  play: async ({ canvasElement }) => {
    await expectNoHorizontalOverflow(canvasElement)
  },
}

/** 80rem: the list keeps its measure above the article. */
export const Wide: Story = {
  ...Seven,
  globals: { ...wideGlobals },
}

/** Try the keys: Tab to the first link, Enter jumps to the section, Tab goes on from the heading. */
export const Keyboard: Story = {
  ...Three,
  play: async ({ canvas }) => {
    await userEvent.tab()
    await expect(canvas.getByRole('link', { name: 'Who can apply' })).toHaveFocus()
    await userEvent.tab()
    await expect(canvas.getByRole('link', { name: 'How to apply' })).toHaveFocus()
  },
}

/** Right to left: the list starts at the right. */
export const RTL: Story = {
  ...Seven,
  globals: { dir: 'rtl', locale: 'en' },
}

/** Forced colours: the current section is marked by more than colour. */
export const ForcedColors: Story = {
  ...Seven,
  globals: { forcedColors: 'active' },
}
