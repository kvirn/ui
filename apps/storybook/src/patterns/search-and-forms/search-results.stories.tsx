import { en } from '@kvirn-ui/i18n/en'
import { kvirnbyPopularPages, kvirnbySearchResults } from '@kvirn-ui/patterns/fixtures'
import {
  Button,
  Checkbox,
  CheckboxGroup,
  Container,
  Field,
  Heading,
  Link,
  List,
  Pagination,
  Stack,
  Tag,
  TagGroup,
  TextInput,
  useAnnouncer,
  useFormat,
} from '@kvirn-ui/react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { expect, userEvent } from 'storybook/test'
import { expectNoHorizontalOverflow } from '../../components/theme-story-assertions.ts'
import { chromeViewports, narrowGlobals, wideGlobals } from '../patterns-story-support.tsx'
import {
  ExampleProvider,
  Hits,
  filterText,
  kindLabels,
  kinds,
  matchingResults,
} from './search-support.tsx'
import contract from '../../../../../packages/patterns/src/search-and-forms/search-results/search-results.a11y.md?raw'

// Patterns/Search and forms/Search results (docs/design/storybook-patterns-t5.md S10).
// Story-only: a recipe from a `search` landmark, Field, TextInput, Button, List, Pagination and a type filter.

const description = `Find a page by words. A \`<search>\` landmark with an \`aria-label\` distinct from the header's, around a GET form with a **visible** label ("Search for"), \`TextInput type="search"\` and a Button that says "Search". Then a count \`Heading\` (\`h2\`), the type filter ([Filter](?path=/docs/patterns-search-and-forms-filter--docs)), and an ordered [List](?path=/docs/components-content-list--docs) so the count is announced. Each hit has its title as the only link (\`h3\`), the path as text, and an excerpt with the searched word in \`<mark>\`. [Pagination](?path=/docs/patterns-news-events-and-notices-pagination--docs) follows a long list. Choose the heading levels for the page's outline (R1).

**States.** Results; one; none (spelling advice, popular pages and the contact centre); empty query (a prompt, not an error: nothing is announced on load); many with Pagination; filtered to none. A client-side count change is said once, politely, through the announcer.

## Parts and gaps

Parts used: native \`search\`, \`Field\`, \`TextInput\`, \`Button\`, \`CheckboxGroup\`, \`TagGroup\`, \`Heading\`, \`Link\`, \`List\`, \`Pagination\`, \`kv-empty-state\`, native \`mark\`. No gap.
`

const meta = {
  title: 'Patterns/Search and forms/Search results',
  globals: { locale: 'en' },
  parameters: {
    a11yContract: contract,
    docs: { description: { component: description } },
    viewport: { options: chromeViewports },
  },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

function Results({
  query = 'preschool',
  count = 5,
  total,
  withPagination = false,
  initialKinds = [],
}: {
  query?: string
  count?: number
  total?: number
  withPagination?: boolean
  initialKinds?: string[]
}) {
  const format = useFormat()
  const { announce } = useAnnouncer()
  const [appliedKinds, setAppliedKinds] = useState(initialKinds)
  const base = kvirnbySearchResults.slice(0, count)
  const results = matchingResults(base, appliedKinds, [])
  const shown = total !== undefined && appliedKinds.length === 0 ? total : results.length
  const isEmpty = query === ''
  const isMisspelt = count === 0 && !isEmpty

  return (
    <ExampleProvider>
      <Container size="reading">
        <Stack className="kv-stack--gap-6">
          <search aria-label="Find a page">
            <form action="#search" method="get">
              <Stack className="kv-stack--gap-4">
                <Field.Root>
                  <Field.Label marker="none">Search for</Field.Label>
                  <TextInput type="search" name="q" defaultValue={query} autoComplete="off" />
                </Field.Root>
                <div>
                  <Button type="submit">Search</Button>
                </div>
              </Stack>
            </form>
          </search>
          {isEmpty ? (
            <p>Type a word to search all pages on the website, for example “preschool”.</p>
          ) : null}
          {isEmpty || isMisspelt ? null : (
            <>
              <form aria-labelledby="results-filter-heading">
                <input type="hidden" name="q" value={query} />
                <Stack className="kv-stack--gap-4">
                  <Heading as="h2" size="heading-3" id="results-filter-heading">
                    {filterText(en.filters.heading)}
                  </Heading>
                  <CheckboxGroup.Root
                    name="kind"
                    value={appliedKinds}
                    onValueChange={(next) => {
                      setAppliedKinds(next)
                      announce(
                        en.filters.resultCount(
                          { count: matchingResults(base, next, []).length },
                          format,
                        ),
                      )
                    }}
                  >
                    <CheckboxGroup.Legend>Type of page</CheckboxGroup.Legend>
                    {kinds.map((value) => (
                      <Field.Root key={value}>
                        <Checkbox value={value} />
                        <Field.Label>{kindLabels[value]}</Field.Label>
                      </Field.Root>
                    ))}
                  </CheckboxGroup.Root>
                  <div>
                    <Button type="submit">{filterText(en.filters.apply)}</Button>
                  </div>
                </Stack>
              </form>
              <TagGroup.Root announceRemoval={false}>
                <TagGroup.Label>{filterText(en.filters.applied)}</TagGroup.Label>
                <TagGroup.List>
                  {appliedKinds.map((value) => {
                    const label = en.filters.appliedValue({
                      group: 'Type',
                      value: kindLabels[value as keyof typeof kindLabels],
                    })
                    return (
                      <Tag.Root key={value}>
                        <Tag.Remove
                          label={label}
                          onRemove={() => {
                            const next = appliedKinds.filter((entry) => entry !== value)
                            setAppliedKinds(next)
                            announce(
                              en.filters.removedResultCount(
                                { label, count: matchingResults(base, next, []).length },
                                format,
                              ),
                            )
                          }}
                        >
                          {label}
                        </Tag.Remove>
                      </Tag.Root>
                    )
                  })}
                </TagGroup.List>
                <TagGroup.Empty>{filterText(en.filters.none)}</TagGroup.Empty>
                <TagGroup.ClearAll
                  onClear={() => {
                    setAppliedKinds([])
                    announce(en.filters.clearedResultCount({ count: base.length }, format))
                  }}
                />
              </TagGroup.Root>
            </>
          )}
          {isEmpty ? null : (
            <Heading as="h2" size="heading-3">
              {en.filters.resultCount({ count: shown }, format)}
            </Heading>
          )}
          {isMisspelt ? (
            <div className="kv-empty-state">
              <Heading as="h3" size="heading-4" className="kv-empty-state-title">
                Nothing matches “{query}”
              </Heading>
              <div className="kv-empty-state-body">
                <p>Check the spelling, or try a shorter or more general word.</p>
                <p>These pages are often visited:</p>
                <List.Root>
                  {kvirnbyPopularPages.map((page) => (
                    <List.Item key={page.href}>
                      <Link.Root href={page.href}>{page.title}</Link.Root>
                    </List.Item>
                  ))}
                </List.Root>
                <p>
                  Still can’t find it?{' '}
                  <Link.Root href="#contact">Contact the contact centre</Link.Root>.
                </p>
              </div>
            </div>
          ) : null}
          {!isEmpty && !isMisspelt && results.length === 0 ? (
            <div className="kv-empty-state">
              <Heading as="h3" size="heading-4" className="kv-empty-state-title">
                {filterText(en.filters.noResults)}
              </Heading>
              <p className="kv-empty-state-body">{filterText(en.filters.noResultsHint)}</p>
            </div>
          ) : null}
          {results.length > 0 ? <Hits results={results} /> : null}
          {withPagination && appliedKinds.length === 0 ? (
            <Pagination.Root>
              <Pagination.List>
                {[1, 2, 3].map((number) => (
                  <Pagination.Item key={number}>
                    <Pagination.Link
                      page={number}
                      href={`?page=${number}`}
                      current={number === 1}
                    />
                  </Pagination.Item>
                ))}
                <Pagination.Item>
                  <Pagination.Status page={1} total={3} />
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

/** Five hits with the searched word marked; the title is each hit's one link. */
export const ResultsFound: Story = {
  globals: { ...wideGlobals },
  render: () => <Results />,
  play: async ({ canvas, canvasElement }) => {
    await expect(canvasElement.querySelector('search[aria-label="Find a page"]')).not.toBeNull()
    await expect(canvas.getByRole('heading', { level: 2, name: '5 results' })).toBeVisible()
    await expect(canvasElement.querySelectorAll('ol > li')).toHaveLength(5)
    await expect(canvasElement.querySelectorAll('mark').length).toBeGreaterThan(4)
  },
}

/** One hit: "1 result". */
export const OneResult: Story = {
  globals: { ...wideGlobals },
  render: () => <Results count={1} />,
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('heading', { level: 2, name: '1 result' })).toBeVisible()
  },
}

/** A misspelt word: what to check, popular pages and a way to ask. */
export const NoResults: Story = {
  globals: { ...wideGlobals },
  render: () => <Results query="prescool" count={0} />,
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('heading', { level: 2, name: 'No results' })).toBeVisible()
    await expect(canvas.getByRole('link', { name: 'Contact the contact centre' })).toBeVisible()
  },
}

/** Nothing typed: a prompt, not an error, and nothing is announced on load. */
export const EmptyQuery: Story = {
  globals: { ...wideGlobals },
  render: () => <Results query="" count={0} />,
  play: async ({ canvas }) => {
    await expect(canvas.getByText(/Type a word to search/)).toBeVisible()
    await expect(canvas.queryByRole('list')).toBeNull()
  },
}

/** Ten of 27 hits, with Pagination after the list. */
export const ManyWithPagination: Story = {
  globals: { ...wideGlobals },
  render: () => <Results count={10} total={27} withPagination />,
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('heading', { level: 2, name: '27 results' })).toBeVisible()
    await expect(canvas.getByRole('navigation', { name: 'Pages' })).toBeVisible()
  },
}

/** A filter that leaves nothing: the applied tag and Clear all stay in view. */
export const FilteredToNone: Story = {
  globals: { ...wideGlobals },
  render: () => <Results count={3} initialKinds={['document']} />,
  play: async ({ canvas }) => {
    await expect(canvas.getByText('No results match these filters.')).toBeVisible()
    await expect(canvas.getByRole('button', { name: 'Clear all filters' })).toBeVisible()
  },
}

/** 320px: one column; titles wrap, nothing scrolls sideways. */
export const Narrow: Story = {
  globals: { ...narrowGlobals },
  render: () => <Results count={10} total={27} withPagination />,
  play: async ({ canvasElement }) => {
    await expectNoHorizontalOverflow(canvasElement)
  },
}

/** Tab goes from the field to Search, the filters, then the result links in order. */
export const Keyboard: Story = {
  globals: { ...wideGlobals },
  render: () => <Results />,
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('searchbox', { name: 'Search for' }))
    await userEvent.tab()
    await expect(canvas.getByRole('button', { name: 'Search' })).toHaveFocus()
    await userEvent.tab()
    await expect(canvas.getByRole('checkbox', { name: 'Services' })).toHaveFocus()
  },
}

/** Right to left: DOM order is unchanged. */
export const RTL: Story = {
  ...ResultsFound,
  globals: { dir: 'rtl', locale: 'en', ...wideGlobals },
}

/** Forced colours: the mark keeps a visible highlight and links keep their underline. */
export const ForcedColors: Story = {
  ...ResultsFound,
  globals: { forcedColors: 'active', ...wideGlobals },
}
