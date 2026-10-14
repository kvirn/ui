import { Container, Heading, Link, List, Pagination, Stack } from '@kvirn-ui/react'
import { kvirnbyNews, kvirnbySquare } from '@kvirn-ui/patterns/fixtures'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'
import { expectNoHorizontalOverflow } from '../../components/theme-story-assertions.ts'
import { chromeViewports, narrowGlobals, wideGlobals } from '../patterns-story-support.tsx'
import { DateText, ExampleProvider } from './news-events-support.tsx'
import contract from '../../../../../packages/patterns/src/news-events-and-notices/news-list/news-list.a11y.md?raw'

// Patterns/News, events and notices/News list (docs/design/storybook-patterns-t5.md S9).
// Story-only: a recipe from `List`, `Heading`, `Link` and `<time>`.

const description = `Scan recent news, newest first. A \`Heading\` for the list, then a [List](?path=/docs/components-content-list--docs) so the count is announced. Each item has one link, in its heading; below it the date as a \`<time dateTime>\` written with \`useFormat\` (never only "2 days ago"), and a one-sentence summary. An optional decorative image comes last, so DOM order is visual order. The list is one column at \`45rem\`, not a card grid. Choose the heading levels for the page's outline (R1).

## Parts and gaps

Parts used: \`Heading\`, \`Link\`, \`List\`, \`Stack\`, native \`time\` and \`img\`, \`kv-empty-state\`, [Pagination](?path=/docs/components-navigation-pagination--docs). No gap.
`

const meta = {
  title: 'Patterns/News, events and notices/News list',
  globals: { locale: 'en' },
  parameters: {
    a11yContract: contract,
    docs: { description: { component: description } },
    viewport: { options: chromeViewports },
  },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

function News({
  count,
  withImage = false,
  withAllNewsLink = false,
  withPagination = false,
}: {
  count: number
  withImage?: boolean
  withAllNewsLink?: boolean
  withPagination?: boolean
}) {
  return (
    <ExampleProvider>
      <Container size="reading">
        <Stack className="kv-stack--gap-6">
          <Heading as="h2" size="heading-3">
            Latest news
          </Heading>
          <List.Root className="kv-list--gap-8">
            {kvirnbyNews.slice(0, count).map((item) => (
              <List.Item key={item.href}>
                <Stack className="kv-stack--gap-2">
                  <Heading as="h3" size="heading-4">
                    <Link.Root href={item.href}>{item.title}</Link.Root>
                  </Heading>
                  <p>
                    <DateText iso={item.publishedOn} />
                  </p>
                  <p>{item.summary}</p>
                  {withImage ? <img src={kvirnbySquare} alt="" width={120} height={120} /> : null}
                </Stack>
              </List.Item>
            ))}
          </List.Root>
          {withAllNewsLink ? (
            <p>
              <Link.Root href="#all-news">All news</Link.Root>
            </p>
          ) : null}
          {withPagination ? (
            <Pagination.Root>
              <Pagination.List>
                <Pagination.Item>
                  <Pagination.Link page={1} href="?page=1" current />
                </Pagination.Item>
                <Pagination.Item>
                  <Pagination.Link page={2} href="?page=2" />
                </Pagination.Item>
                <Pagination.Item>
                  <Pagination.Status page={1} total={2} />
                </Pagination.Item>
                <Pagination.Item>
                  <Pagination.Next href="?page=2" />
                </Pagination.Item>
              </Pagination.List>
            </Pagination.Root>
          ) : null}
        </Stack>
      </Container>
    </ExampleProvider>
  )
}

/** Three items in a band, with an "All news" link after the list. */
export const Three: Story = {
  globals: { ...wideGlobals },
  render: () => <News count={3} withAllNewsLink />,
  play: async ({ canvas }) => {
    await expect(canvas.getAllByRole('listitem')).toHaveLength(3)
    await expect(canvas.getAllByRole('link', { name: 'All news' })).toHaveLength(1)
  },
}

/** Ten items with Pagination after the list. */
export const TenWithPagination: Story = {
  globals: { ...wideGlobals },
  render: () => <News count={10} withPagination />,
  play: async ({ canvas }) => {
    await expect(canvas.getAllByRole('heading', { level: 3 })).toHaveLength(10)
    await expect(canvas.getByRole('navigation', { name: 'Pages' })).toBeVisible()
  },
}

/** With a decorative image (`alt=""`) after the summary. */
export const WithImage: Story = {
  globals: { ...wideGlobals },
  render: () => <News count={3} withImage />,
}

/** Without images: the same order and spacing. */
export const WithoutImage: Story = {
  globals: { ...wideGlobals },
  render: () => <News count={3} />,
}

/** Nothing published: say what is missing and where to go, never "No data". */
export const Empty: Story = {
  globals: { ...wideGlobals },
  render: () => (
    <ExampleProvider>
      <Container size="reading">
        <div className="kv-empty-state">
          <Heading as="h2" size="heading-3" className="kv-empty-state-title">
            There is no news yet
          </Heading>
          <p className="kv-empty-state-body">
            New items appear here when they are published. In the meantime, read about{' '}
            <Link.Root href="#about">what is happening in Kvirnby</Link.Root>.
          </p>
        </div>
      </Container>
    </ExampleProvider>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.queryByRole('list')).toBeNull()
    await expect(canvas.getByRole('heading', { name: 'There is no news yet' })).toBeVisible()
  },
}

/** 320px: titles wrap, nothing scrolls sideways. */
export const Narrow: Story = {
  globals: { ...narrowGlobals },
  render: () => <News count={3} withImage />,
  play: async ({ canvasElement }) => {
    await expectNoHorizontalOverflow(canvasElement)
  },
}

/** Tab goes from link to link in reading order. */
export const Keyboard: Story = { ...Three }

/** Right to left: the text aligns to the start; DOM order is unchanged. */
export const RTL: Story = {
  ...Three,
  globals: { dir: 'rtl', locale: 'en', ...wideGlobals },
}

/** Forced colours: links keep their underline. */
export const ForcedColors: Story = {
  ...Three,
  globals: { forcedColors: 'active', ...wideGlobals },
}
