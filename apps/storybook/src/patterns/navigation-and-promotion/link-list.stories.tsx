import { Heading, Icon, Link, List } from '@kvirn-ui/react'
import { external } from '@kvirn-ui/icons'
import type { Meta, StoryObj } from '@storybook/react-vite'
import contract from '../../../../../packages/patterns/src/navigation-and-promotion/link-list/link-list.a11y.md?raw'
import type { ReactNode } from 'react'
import { expect, userEvent } from 'storybook/test'
import { expectNoHorizontalOverflow } from '../../components/theme-story-assertions.ts'
import { chromeViewports, narrowGlobals, wideGlobals } from '../patterns-story-support.tsx'

// Patterns/Navigation and promotion/Link list and related links (docs/design/storybook-patterns-t5.md S15).
// Story-only: one recipe, a heading and a List of links, used for "other ways to contact us" and for "Related pages".

const description = `A few links under a heading: "Other ways to contact us" in the body, or "Related pages" last in \`main\`. A \`Heading\` then a [List](?path=/docs/components-list--docs), so the count is announced, with one \`Link\` per item. Each link makes sense alone (2.4.4). It is not a \`nav\` landmark: a list of links in content is not navigation (rule R2); only a block named and distinct on the page earns one. A link to another site says so in its text or with the new-tab notice, never by the icon alone. Choose the heading level for the page's outline (rule R1).

## Parts and gaps

Parts used: \`Heading\`, \`List.Root\`, \`List.Item\`, \`Link\`, \`Icon\`. No gap.
`

const meta = {
  title: 'Patterns/Navigation and promotion/Link list and related links',
  globals: { locale: 'en' },
  parameters: {
    a11yContract: contract,
    layout: 'padded',
    docs: { description: { component: description } },
    viewport: { options: chromeViewports },
  },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

const links = [
  ['Apply for a preschool place', '#apply'],
  ['Preschool fees', '#fees'],
  ['Opening hours and holidays', '#hours'],
  ['Report an absence', '#absence'],
  ['Find a preschool near you', '#find'],
  ['Special support for children', '#support'],
  ['Moving to another municipality', '#moving'],
  ["Ending your child's place", '#ending'],
]

function LinkList({
  heading,
  count,
  id,
  children,
}: {
  heading: string
  count: number
  id: string
  children?: ReactNode
}) {
  return (
    <section aria-labelledby={id}>
      <Heading as="h2" size="heading-3" id={id}>
        {heading}
      </Heading>
      <List.Root>
        {links.slice(0, count).map(([label, href]) => (
          <List.Item key={href}>
            <Link.Root href={href}>{label}</Link.Root>
          </List.Item>
        ))}
        {children}
      </List.Root>
    </section>
  )
}

/** Three links. */
export const Three: Story = {
  render: () => <LinkList heading="Other ways to get in touch" count={3} id="three" />,
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('heading', { level: 2 })).toBeVisible()
    await expect(canvas.getAllByRole('listitem')).toHaveLength(3)
  },
}

/** Eight links. */
export const Eight: Story = {
  render: () => <LinkList heading="Preschool" count={8} id="eight" />,
  play: async ({ canvas }) => {
    await expect(canvas.getAllByRole('link')).toHaveLength(8)
  },
}

/** "Related pages" as the last block in `main`. */
export const RelatedPages: Story = {
  render: () => (
    <main>
      <Heading as="h1" size="heading-1">
        Preschool fees
      </Heading>
      <p>The fee depends on household income and is capped.</p>
      <LinkList heading="Related pages" count={4} id="related" />
    </main>
  ),
  play: async ({ canvas }) => {
    const list = canvas.getByRole('list')
    await expect(list.closest('section')).toBe(canvas.getByRole('main').lastElementChild)
  },
}

/** A link to another site says so in its name. */
export const LinkToAnotherSite: Story = {
  render: () => (
    <LinkList heading="More information" count={2} id="external">
      <List.Item>
        <Link.Root href="https://example.org/" target="_blank">
          <Link.Icon>
            <Icon icon={external} />
          </Link.Icon>
          The national agency&apos;s guide
          <Link.NewTabNotice />
        </Link.Root>
      </List.Item>
    </LinkList>
  ),
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('link', { name: /The national agency's guide\s*\(opens in a new tab\)/ }),
    ).toHaveAttribute('target', '_blank')
  },
}

/** 320px: links wrap, nothing scrolls sideways. */
export const Narrow: Story = {
  ...Eight,
  globals: { ...narrowGlobals },
  play: async ({ canvasElement }) => {
    await expectNoHorizontalOverflow(canvasElement)
  },
}

/** 80rem. */
export const Wide: Story = {
  ...Eight,
  globals: { ...wideGlobals },
}

/** Try the keys: Tab moves through the links in order, Enter follows one. */
export const Keyboard: Story = {
  ...Three,
  play: async ({ canvas }) => {
    await userEvent.tab()
    await expect(canvas.getByRole('link', { name: 'Apply for a preschool place' })).toHaveFocus()
    await userEvent.tab()
    await expect(canvas.getByRole('link', { name: 'Preschool fees' })).toHaveFocus()
  },
}

/** Right to left: the markers sit at the start. */
export const RTL: Story = {
  ...Three,
  globals: { dir: 'rtl', locale: 'en' },
}

/** Forced colours: links keep their underline and focus ring. */
export const ForcedColors: Story = {
  ...Three,
  globals: { forcedColors: 'active' },
}
