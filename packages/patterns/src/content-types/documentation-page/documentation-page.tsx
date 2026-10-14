'use client'

import {
  Breadcrumb,
  CodeBlock,
  Container,
  Heading,
  Kbd,
  Pagination,
  Prose,
  Stack,
  Table,
  TableOfContents,
} from '@kvirn-ui/react'
import { PageFrame } from '../../page-frame/page-frame.tsx'
import { SectionNav } from '../../navigation-and-promotion/section-nav/section-nav.tsx'

/**
 * A documentation page, the slot between header and footer: breadcrumb, grouped section
 * navigation, lead, contents, prose with an example and two tables, and previous and next links.
 * Example text is English and fictional.
 */
export function DocumentationPage() {
  return (
    <>
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
                  <Pagination.Previous href="#breadcrumb">Previous: Breadcrumb</Pagination.Previous>
                </Pagination.Item>
                <Pagination.Item>
                  <Pagination.Next href="#pagination">Next: Pagination</Pagination.Next>
                </Pagination.Item>
              </Pagination.List>
            </Pagination.Root>
          </Stack>
        </PageFrame.Main>
      </PageFrame.Body>
    </>
  )
}
