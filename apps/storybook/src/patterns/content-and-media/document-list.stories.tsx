import { kvirnbyDocuments } from '@kvirn-ui/patterns/fixtures'
import { en } from '@kvirn-ui/i18n/en'
import { formatFileSize } from '@kvirn-ui/i18n'
import { Heading, KvirnProvider, Link, List, useFormat } from '@kvirn-ui/react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import contract from '../../../../../packages/patterns/src/content-and-media/document-list/document-list.a11y.md?raw'
import { expect } from 'storybook/test'
import { expectNoHorizontalOverflow } from '../../components/theme-story-assertions.ts'
import { chromeViewports, narrowGlobals, wideGlobals } from '../patterns-story-support.tsx'

// Patterns/Content and media/Document list (docs/design/storybook-patterns-t5.md S16).
// Recipe: a heading, a List and Links; no package code.

const description = `Documents to download, one link each. The file type and size go in the link text ("Budget 2027 (PDF, 2 MB)"), so a resident knows what they get before they follow it (2.4.4, 3.2.5); the size is written with \`formatFileSize\` from \`@kvirn-ui/i18n\`, in the page's locale. The date is a \`<time dateTime>\` written with \`useFormat\`. The list is a \`List\`, so the count is announced; with many documents, group them under a heading one level below the page's (by year here). A document in another language carries \`hrefLang\` on the link and \`lang\` on its text (3.1.2). A document that is not accessible is not linked: say so in text and offer "Ask for it in another format" with a contact (rule R9). Choose the heading \`as\` for the page's outline.

## Parts and gaps

Parts used: \`Heading\`, \`List.Root\`, \`List.Item\`, \`Link.Root\`, native \`time\`, \`formatFileSize\`, \`useFormat\`. No gap.
`

const meta = {
  title: 'Patterns/Content and media/Document list',
  globals: { locale: 'en' },
  parameters: {
    a11yContract: contract,
    docs: { description: { component: description } },
    viewport: { options: chromeViewports },
  },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

function Documents({ count }: { count: number }) {
  const format = useFormat()
  return (
    <List.Root>
      {kvirnbyDocuments.slice(0, count).map((document) => (
        <List.Item key={document.href}>
          <Link.Root href={document.href}>
            {document.name} ({document.type}, {formatFileSize(format, document.bytes)})
          </Link.Root>{' '}
          <time dateTime={document.date}>{format.date(document.date, { dateStyle: 'long' })}</time>
        </List.Item>
      ))}
    </List.Root>
  )
}

function Three() {
  return (
    <KvirnProvider locale="en" messages={en}>
      <div lang="en">
        <Heading as="h2" size="heading-3">
          Documents
        </Heading>
        <Documents count={3} />
      </div>
    </KvirnProvider>
  )
}

function GroupedByYear() {
  const format = useFormat()
  const years = ['2026', '2025', '2024']
  return (
    <div lang="en">
      <Heading as="h2" size="heading-3">
        Documents
      </Heading>
      {years.map((year) => (
        <section key={year} aria-labelledby={`documents-${year}`}>
          <Heading as="h3" size="heading-4" id={`documents-${year}`}>
            {year}
          </Heading>
          <List.Root>
            {kvirnbyDocuments
              .filter((document) => document.date.startsWith(year))
              .map((document) => (
                <List.Item key={document.href}>
                  <Link.Root href={document.href}>
                    {document.name} ({document.type}, {formatFileSize(format, document.bytes)})
                  </Link.Root>{' '}
                  <time dateTime={document.date}>
                    {format.date(document.date, { dateStyle: 'long' })}
                  </time>
                </List.Item>
              ))}
          </List.Root>
        </section>
      ))}
    </div>
  )
}

/** Three documents; type and size in the link text. */
export const ThreeDocuments: Story = {
  render: () => <Three />,
  play: async ({ canvas }) => {
    await expect(canvas.getAllByRole('listitem')).toHaveLength(3)
    await expect(
      canvas.getByRole('link', { name: /^Budget 2027 \(PDF, 2(\.0)? MB\)$/ }),
    ).toBeVisible()
    await expect(
      canvas.getByRole('link', { name: 'Preschool fees 2027 (PDF, 240 kB)' }),
    ).toBeVisible()
  },
}

/** Twelve documents grouped by year, one `h3` per year. */
export const TwelveByYear: Story = {
  render: () => (
    <KvirnProvider locale="en" messages={en}>
      <GroupedByYear />
    </KvirnProvider>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getAllByRole('heading', { level: 3 })).toHaveLength(3)
    await expect(canvas.getAllByRole('link')).toHaveLength(12)
  },
}

/** One document in Finnish: `hrefLang` on the link, `lang` on its text. */
export const OtherLanguage: Story = {
  render: () => (
    <KvirnProvider locale="en" messages={en}>
      <div lang="en">
        <Heading as="h2" size="heading-3">
          Documents
        </Heading>
        <List.Root>
          <List.Item>
            <Link.Root href="#fees-fi" hrefLang="fi">
              {/* kv-lang-ok: a Finnish passage that sets lang (3.1.2) */}
              <span lang="fi">Päiväkodin maksut 2027</span> (PDF, 240 kB)
            </Link.Root>{' '}
            <span>in Finnish</span>
          </List.Item>
          <List.Item>
            <Link.Root href="#fees-2027">Preschool fees 2027 (PDF, 240 kB)</Link.Root>
          </List.Item>
        </List.Root>
      </div>
    </KvirnProvider>
  ),
  play: async ({ canvasElement }) => {
    const link = canvasElement.querySelector('a[hreflang="fi"]')
    await expect(link).not.toBeNull()
    await expect(link?.querySelector('[lang="fi"]')).not.toBeNull()
  },
}

/** One document that is not accessible: text, not a link, and a way to ask for another format. */
export const NotAccessible: Story = {
  render: () => (
    <KvirnProvider locale="en" messages={en}>
      <div lang="en">
        <Heading as="h2" size="heading-3">
          Documents
        </Heading>
        <List.Root>
          <List.Item>
            <Link.Root href="#fees-2027">Preschool fees 2027 (PDF, 240 kB)</Link.Root>
          </List.Item>
          <List.Item>
            Site map from 1998 (scanned paper, not accessible).{' '}
            <Link.Root href="mailto:contact@kvirnby.example">
              Ask for it in another format
            </Link.Root>
          </List.Item>
        </List.Root>
      </div>
    </KvirnProvider>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getAllByRole('link')).toHaveLength(2)
    await expect(canvas.getByText('Site map from 1998', { exact: false })).toBeVisible()
    await expect(canvas.getByRole('link', { name: 'Ask for it in another format' })).toBeVisible()
  },
}

/** 320px: long names wrap; nothing scrolls sideways. */
export const Narrow: Story = {
  ...TwelveByYear,
  globals: { ...narrowGlobals },
  play: async ({ canvasElement }) => {
    await expectNoHorizontalOverflow(canvasElement)
  },
}

/** 80rem. */
export const Wide: Story = {
  ...ThreeDocuments,
  globals: { ...wideGlobals },
}

/** Try the keys: Tab moves from link to link in the order of the list; Enter follows a link. */
export const Keyboard: Story = { ...ThreeDocuments }

/** Right to left. */
export const RTL: Story = {
  ...ThreeDocuments,
  globals: { dir: 'rtl', locale: 'en' },
}

/** Forced colours: links keep their underline and stay visible. */
export const ForcedColors: Story = {
  ...ThreeDocuments,
  globals: { forcedColors: 'active' },
}
