import { en } from '@kvirn-ui/i18n/en'
import { PageFrame, SectionNav } from '@kvirn-ui/patterns'
import {
  Breadcrumb,
  CodeBlock,
  Container,
  Heading,
  Kbd,
  KvirnProvider,
  Pagination,
  Prose,
  Stack,
  Table,
  TableOfContents,
} from '@kvirn-ui/react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expectNoHorizontalOverflow } from '../components/theme-story-assertions.ts'
import {
  PlaceholderFooter,
  chromeViewports,
  narrowGlobals,
  wideGlobals,
} from '../patterns/patterns-story-support.tsx'
import { KvirnUIDocsHeader, expectPageOutline } from './kvirnby-chrome.tsx'
// Content types/Documentation page: a whole page in the site chrome (docs/design/storybook-patterns.md section 7).
// Story-only: the page is literal JSX of the patterns, which an adopter copies. No data objects.

const description = `A page of a documentation site, in the frame of the reference site: the section navigation beside \`main\` (grouped, collapsed behind a button below \`64rem\`), a breadcrumb, an \`h1\` and a lead, the contents list, prose with an example and two tables, and previous and next links at the end. The page is English and \`lang="en"\` whatever the toolbar says.

Written as literal JSX from the patterns and shipped components: [Page frame](?path=/docs/patterns-site-chrome-page-frame--docs), [Breadcrumb](?path=/docs/components-navigation-breadcrumb--docs), [Section nav](?path=/docs/patterns-navigation-and-promotion-section-nav--docs), and \`TableOfContents\`, \`Prose\`, \`CodeBlock\`, \`Table\`, \`Kbd\` and \`Pagination\`. The previous and next links are a \`Pagination\` with only \`Previous\` and \`Next\`, named by its \`label\`. The header is the KvirnUI docs header: the brand, search and four links, without a language switch or shortcuts.

**Page contract.** One \`banner\`, one \`main\`, one \`contentinfo\`; one \`h1\` and no skipped heading level; the skip link is first and targets \`main\`; the breadcrumb, the section navigation and the previous and next links are named and distinct; the tables are named and scroll in a named region only when they overflow; nothing is sticky. Designed and tested to meet WCAG 2.2 AA.
`

const meta = {
  title: 'Content types/Documentation page',
  component: PageFrame.Root,
  globals: { locale: 'en' },
  parameters: {
    layout: 'fullscreen',
    docs: { description: { component: description } },
    viewport: { options: chromeViewports },
  },
} satisfies Meta<typeof PageFrame.Root>

export default meta
type Story = StoryObj<typeof meta>

/** A component page: contents, example, keyboard and API tables, then previous and next. */
export const Default: Story = {
  globals: { ...wideGlobals },
  render: () => (
    <KvirnProvider locale="en" messages={en}>
      <PageFrame.Root>
        <KvirnUIDocsHeader />
        <Container>
          <Breadcrumb.Root label="You are here">
            <Breadcrumb.List>
              <Breadcrumb.Item>
                <Breadcrumb.Link href="#home">Home</Breadcrumb.Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                <Breadcrumb.Link href="#components">Components</Breadcrumb.Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                <Breadcrumb.Link href="#navigation">Navigation</Breadcrumb.Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                <Breadcrumb.Current>Link</Breadcrumb.Current>
              </Breadcrumb.Item>
            </Breadcrumb.List>
          </Breadcrumb.Root>
        </Container>
        <PageFrame.Body>
          <PageFrame.Sidebar>
            <SectionNav.Root label="Components">
              <SectionNav.Trigger>Components</SectionNav.Trigger>
              <SectionNav.Panel>
                <SectionNav.Group>
                  <SectionNav.GroupLink href="#navigation">Navigation</SectionNav.GroupLink>
                  <SectionNav.GroupItems>
                    <SectionNav.Link href="#breadcrumb">Breadcrumb</SectionNav.Link>
                    <SectionNav.Link href="#link" current="page">
                      Link
                    </SectionNav.Link>
                    <SectionNav.Link href="#pagination">Pagination</SectionNav.Link>
                  </SectionNav.GroupItems>
                </SectionNav.Group>
                <SectionNav.Group>
                  <SectionNav.GroupLink href="#actions">Actions</SectionNav.GroupLink>
                  <SectionNav.GroupItems>
                    <SectionNav.Link href="#button">Button</SectionNav.Link>
                    <SectionNav.Link href="#button-group">Button group</SectionNav.Link>
                  </SectionNav.GroupItems>
                </SectionNav.Group>
                <SectionNav.Group>
                  <SectionNav.GroupLink href="#content">Content</SectionNav.GroupLink>
                  <SectionNav.GroupItems>
                    <SectionNav.Link href="#heading">Heading</SectionNav.Link>
                    <SectionNav.Link href="#prose">Prose</SectionNav.Link>
                  </SectionNav.GroupItems>
                </SectionNav.Group>
              </SectionNav.Panel>
            </SectionNav.Root>
          </PageFrame.Sidebar>
          <PageFrame.Main>
            <Stack className="kv-stack--gap-8">
              <Stack className="kv-stack--gap-4">
                <Heading as="h1">Link</Heading>
                <p className="kv-lead">
                  A native link for navigation, drawn by your router when you register one. For an
                  action, use Button.
                </p>
              </Stack>
              <Stack className="kv-stack--gap-4">
                <Heading as="h2" size="heading-4" id="contents-title">
                  On this page
                </Heading>
                <TableOfContents.Root
                  aria-labelledby="contents-title"
                  items={[
                    { id: 'example', label: 'Example', level: 2 },
                    { id: 'keyboard', label: 'Keyboard', level: 2 },
                    { id: 'api', label: 'API reference', level: 2 },
                  ]}
                />
              </Stack>
              <Prose>
                <h2 id="example">Example</h2>
                <p>
                  A link is an <code>&lt;a href&gt;</code>. Set <code>current</code> on the link to
                  the page you are on, so a screen reader announces it.
                </p>
                <CodeBlock.Root>
                  <CodeBlock.Label>Link to the current page</CodeBlock.Label>
                  <CodeBlock.Code>
                    {`<Link.Root href="/apply" current="page">Apply</Link.Root>`}
                  </CodeBlock.Code>
                  <CodeBlock.Copy />
                </CodeBlock.Root>
                <h2 id="keyboard">Keyboard</h2>
                <Table.ScrollRegion aria-label="Keyboard">
                  <Table.Root>
                    <Table.Caption>Keys on a link</Table.Caption>
                    <Table.Head>
                      <Table.Row>
                        <Table.ColumnHeader>Key</Table.ColumnHeader>
                        <Table.ColumnHeader>Action</Table.ColumnHeader>
                      </Table.Row>
                    </Table.Head>
                    <Table.Body>
                      <Table.Row>
                        <Table.RowHeader>
                          <Kbd>Tab</Kbd>
                        </Table.RowHeader>
                        <Table.Cell>Moves focus to the next link</Table.Cell>
                      </Table.Row>
                      <Table.Row>
                        <Table.RowHeader>
                          <Kbd>Shift</Kbd>+<Kbd>Tab</Kbd>
                        </Table.RowHeader>
                        <Table.Cell>Moves focus to the previous link</Table.Cell>
                      </Table.Row>
                      <Table.Row>
                        <Table.RowHeader>
                          <Kbd>Enter</Kbd>
                        </Table.RowHeader>
                        <Table.Cell>Follows the link</Table.Cell>
                      </Table.Row>
                    </Table.Body>
                  </Table.Root>
                </Table.ScrollRegion>
                <h2 id="api">API reference</h2>
                <h3>Link.Root</h3>
                <Table.ScrollRegion aria-label="Link.Root props">
                  <Table.Root>
                    <Table.Caption>Props of Link.Root</Table.Caption>
                    <Table.Head>
                      <Table.Row>
                        <Table.ColumnHeader>Prop</Table.ColumnHeader>
                        <Table.ColumnHeader>Default</Table.ColumnHeader>
                        <Table.ColumnHeader>Description</Table.ColumnHeader>
                      </Table.Row>
                    </Table.Head>
                    <Table.Body>
                      <Table.Row>
                        <Table.RowHeader>
                          <code>href</code>
                        </Table.RowHeader>
                        <Table.Cell>none</Table.Cell>
                        <Table.Cell>Where the link goes</Table.Cell>
                      </Table.Row>
                      <Table.Row>
                        <Table.RowHeader>
                          <code>current</code>
                        </Table.RowHeader>
                        <Table.Cell>none</Table.Cell>
                        <Table.Cell>
                          Sets <code>aria-current</code>: <code>page</code>, <code>step</code>,{' '}
                          <code>location</code>, <code>date</code>, <code>time</code> or{' '}
                          <code>true</code>
                        </Table.Cell>
                      </Table.Row>
                      <Table.Row>
                        <Table.RowHeader>
                          <code>as</code>
                        </Table.RowHeader>
                        <Table.Cell>
                          <code>a</code>
                        </Table.Cell>
                        <Table.Cell>
                          A component that renders an anchor, such as a router link
                        </Table.Cell>
                      </Table.Row>
                    </Table.Body>
                  </Table.Root>
                </Table.ScrollRegion>
              </Prose>
              <Pagination.Root label="Previous and next page">
                <Pagination.List>
                  <Pagination.Item>
                    <Pagination.Previous href="#breadcrumb">
                      Previous: Breadcrumb
                    </Pagination.Previous>
                  </Pagination.Item>
                  <Pagination.Item>
                    <Pagination.Next href="#pagination">Next: Pagination</Pagination.Next>
                  </Pagination.Item>
                </Pagination.List>
              </Pagination.Root>
            </Stack>
          </PageFrame.Main>
        </PageFrame.Body>
        <PlaceholderFooter>KvirnUI documentation</PlaceholderFooter>
      </PageFrame.Root>
    </KvirnProvider>
  ),
  play: async ({ canvasElement }) => {
    await expectPageOutline(canvasElement)
  },
}

/** 320px: the section navigation is a button above `main`; the tables scroll inside their own region, not the page. */
export const Narrow: Story = {
  ...Default,
  globals: { ...narrowGlobals },
  play: async ({ canvasElement }) => {
    await expectPageOutline(canvasElement)
    await expectNoHorizontalOverflow(canvasElement)
  },
}

/** Right to left: the sidebar moves to the right of `main`; DOM order is unchanged. */
export const RTL: Story = {
  ...Default,
  globals: { dir: 'rtl', locale: 'en', ...wideGlobals },
}
