import { en } from '@kvirn-ui/i18n/en'
import { kvirnbySearchResults } from '@kvirn-ui/patterns/fixtures'
import {
  Alert,
  Button,
  Checkbox,
  CheckboxGroup,
  Combobox,
  Container,
  Disclosure,
  Field,
  Heading,
  Listbox,
  Stack,
  Tag,
  TagGroup,
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
  years,
} from './search-support.tsx'
import contract from '../../../../../packages/patterns/src/search-and-forms/filter/filter.a11y.md?raw'

// Patterns/Search and forms/Filter (docs/design/storybook-patterns-t5.md S10).
// Story-only: a recipe from a form, CheckboxGroup, Combobox, a native Listbox, TagGroup and the announcer.

const description = `Narrow a long list, see what is applied and undo it. Reading order is Tab order: a \`form aria-labelledby\` the heading, the type as a [CheckboxGroup](?path=/docs/components-forms-checkboxgroup--docs), the year as a multiple [Combobox](?path=/docs/components-forms-combobox--docs) (for a long facet), the sort as a native \`Listbox.Root native="always"\` in its Field, then the applied filters as a [TagGroup](?path=/docs/components-content-tag--docs), the result count and the results. The fixed words are the \`filters.*\` keys.

**Behaviour.** With JavaScript the results change in place and focus stays where it was; the "Show results" submit is for the no-JS case: a GET that carries the query (a hidden \`q\`), the type, the year and the sort, which the page reads back into the initial state (here the story's \`initial*\` props). Each change is said once, politely, through the provider's announcer, after the results have arrived: the count for a tick, the removal and the count for a tag, "All filters cleared" and the count for Clear all (the tag group's own removal message is off, since the live region keeps only the last). No results keeps the applied row and Clear all in view. Loading over a second shows a visible "Updating results" and \`aria-busy\` on the list; a failed update is an inline Danger alert with Try again, the old results stay, and \`filters.loadFailed\` is announced instead of the count. The year chosen shows once, as an applied tag (the Combobox has no chip list of its own). Below 64rem the form sits in a Disclosure (it has no open-from-64rem option yet, so the narrow stories wrap it always).

## Parts and gaps

Parts used: \`CheckboxGroup\`, \`Combobox\`, \`Listbox\` (native), \`Tag\` and \`TagGroup\`, \`Disclosure\`, \`Alert.Danger\`, \`Button\`, \`useAnnouncer\`. Gap: Disclosure cannot be open from 64rem and closed below.
`

const meta = {
  title: 'Patterns/Search and forms/Filter',
  globals: { locale: 'en' },
  parameters: {
    a11yContract: contract,
    docs: { description: { component: description } },
    viewport: { options: chromeViewports },
  },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

type SortKey = 'relevance' | 'newest' | 'oldest' | 'name'

const sortItems: readonly { key: SortKey; label: string }[] = [
  { key: 'relevance', label: filterText(en.filters.sortRelevance) },
  { key: 'newest', label: filterText(en.filters.sortNewest) },
  { key: 'oldest', label: filterText(en.filters.sortOldest) },
  { key: 'name', label: filterText(en.filters.sortNameAscending) },
]

function sorted(results: typeof kvirnbySearchResults, sort: SortKey) {
  const copy = [...results]
  if (sort === 'newest') return copy.sort((a, b) => b.publishedOn.localeCompare(a.publishedOn))
  if (sort === 'oldest') return copy.sort((a, b) => a.publishedOn.localeCompare(b.publishedOn))
  if (sort === 'name') return copy.sort((a, b) => a.title.localeCompare(b.title, 'en'))
  return copy
}

function FilterRecipe({
  initialKinds = [],
  initialYears = [],
  initialSort = 'relevance',
  status = 'idle',
  collapsible = false,
  open = false,
}: {
  initialKinds?: string[]
  initialYears?: string[]
  initialSort?: SortKey
  status?: 'idle' | 'loading' | 'failed'
  collapsible?: boolean
  open?: boolean
}) {
  const format = useFormat()
  const { announce } = useAnnouncer()
  const [appliedKinds, setAppliedKinds] = useState(initialKinds)
  const [appliedYears, setAppliedYears] = useState(initialYears)
  const [sort, setSort] = useState<SortKey>(initialSort)
  const [failed, setFailed] = useState(status === 'failed')
  const [settledKinds, setSettledKinds] = useState(status === 'failed' ? [] : initialKinds)
  const [settledYears, setSettledYears] = useState(status === 'failed' ? [] : initialYears)

  const results = sorted(matchingResults(kvirnbySearchResults, settledKinds, settledYears), sort)
  const countFor = (nextKinds: string[], nextYears: string[]) =>
    matchingResults(kvirnbySearchResults, nextKinds, nextYears).length
  const appliedCount = appliedKinds.length + appliedYears.length

  const applied = [
    ...appliedKinds.map((value) => ({
      kind: 'kind' as const,
      value,
      label: en.filters.appliedValue({
        group: 'Type',
        value: kindLabels[value as keyof typeof kindLabels],
      }),
    })),
    ...appliedYears.map((value) => ({
      kind: 'year' as const,
      value,
      label: en.filters.appliedValue({ group: 'Year', value }),
    })),
  ]

  // The count is said once the results have arrived; a failed update says that instead, so nobody
  // hears a new count for a list that did not change.
  const change = (
    nextKinds: string[],
    nextYears: string[],
    countMessage: (count: number) => string,
  ) => {
    setAppliedKinds(nextKinds)
    setAppliedYears(nextYears)
    if (failed) {
      announce(filterText(en.filters.loadFailed))
      return
    }
    setSettledKinds(nextKinds)
    setSettledYears(nextYears)
    announce(countMessage(countFor(nextKinds, nextYears)))
  }

  const removeFilter = (kind: 'kind' | 'year', value: string, label: string) => {
    const nextKinds =
      kind === 'kind' ? appliedKinds.filter((entry) => entry !== value) : appliedKinds
    const nextYears =
      kind === 'year' ? appliedYears.filter((entry) => entry !== value) : appliedYears
    change(nextKinds, nextYears, (count) => en.filters.removedResultCount({ label, count }, format))
  }

  const form = (
    <form aria-labelledby="filter-heading">
      <input type="hidden" name="q" value="preschool" />
      <Stack className="kv-stack--gap-4">
        {collapsible ? null : (
          <Heading as="h2" size="heading-3" id="filter-heading">
            {filterText(en.filters.heading)}
          </Heading>
        )}
        <CheckboxGroup.Root
          name="kind"
          value={appliedKinds}
          onValueChange={(next) => {
            change(next, appliedYears, (count) => en.filters.resultCount({ count }, format))
          }}
        >
          <CheckboxGroup.Legend>Type of page</CheckboxGroup.Legend>
          {kinds.map((value) => (
            <CheckboxGroup.Option key={value}>
              <Checkbox value={value} />
              <Field.Label>{kindLabels[value]}</Field.Label>
            </CheckboxGroup.Option>
          ))}
        </CheckboxGroup.Root>
        <Field.Root>
          <Field.Label>Year</Field.Label>
          <Combobox.Root
            multiple
            items={years}
            itemToString={(year) => year}
            itemToKey={(year) => year}
            value={appliedYears}
            onValueChange={(next) => {
              change(appliedKinds, next, (count) => en.filters.resultCount({ count }, format))
            }}
            name="year"
          >
            <Combobox.Input />
            <Combobox.Popup>
              <Combobox.List>{(year: string) => <Combobox.Option item={year} />}</Combobox.List>
              <Combobox.Empty />
            </Combobox.Popup>
          </Combobox.Root>
        </Field.Root>
        <Field.Root>
          <Field.Label>{filterText(en.filters.sortLabel)}</Field.Label>
          <Listbox.Root
            native="always"
            items={sortItems}
            itemToString={(item) => item.label}
            itemToKey={(item) => item.key}
            value={sort}
            onValueChange={(next) => setSort((next as SortKey | null) ?? 'relevance')}
            name="sort"
          />
        </Field.Root>
        <div>
          <Button type="submit">{filterText(en.filters.apply)}</Button>
        </div>
      </Stack>
    </form>
  )

  return (
    <ExampleProvider>
      <Container size="reading">
        <Stack className="kv-stack--gap-6">
          {collapsible ? (
            <Disclosure.Root defaultOpen={open}>
              <Heading as="h2" size="heading-3" id="filter-heading">
                <Disclosure.Trigger>
                  {en.filters.disclosure({ count: appliedCount }, format)}
                </Disclosure.Trigger>
              </Heading>
              <Disclosure.Panel>{form}</Disclosure.Panel>
            </Disclosure.Root>
          ) : (
            form
          )}
          <TagGroup.Root announceRemoval={false}>
            <TagGroup.Label>{filterText(en.filters.applied)}</TagGroup.Label>
            <TagGroup.List>
              {applied.map(({ kind, value, label }) => (
                <Tag.Root key={`${kind}-${value}`}>
                  <Tag.Remove label={label} onRemove={() => removeFilter(kind, value, label)}>
                    {label}
                  </Tag.Remove>
                </Tag.Root>
              ))}
            </TagGroup.List>
            <TagGroup.Empty>{filterText(en.filters.none)}</TagGroup.Empty>
            <TagGroup.ClearAll
              onClear={() => {
                change([], [], (count) => en.filters.clearedResultCount({ count }, format))
              }}
            />
          </TagGroup.Root>
          <Heading as="h2" size="heading-3">
            {en.filters.resultCount({ count: results.length }, format)}
          </Heading>
          {status === 'loading' ? <p>{filterText(en.filters.loading)}</p> : null}
          {failed ? (
            <Alert.Danger>
              <Alert.Title as="p">{filterText(en.filters.loadFailed)}</Alert.Title>
              <Alert.Actions>
                <Button
                  type="button"
                  onClick={() => {
                    setFailed(false)
                    setSettledKinds(appliedKinds)
                    setSettledYears(appliedYears)
                    announce(
                      en.filters.resultCount(
                        { count: countFor(appliedKinds, appliedYears) },
                        format,
                      ),
                    )
                  }}
                >
                  {filterText(en.filters.retry)}
                </Button>
              </Alert.Actions>
            </Alert.Danger>
          ) : null}
          {results.length === 0 ? (
            <div className="kv-empty-state">
              <Heading as="h3" size="heading-4" className="kv-empty-state-title">
                {filterText(en.filters.noResults)}
              </Heading>
              <p className="kv-empty-state-body">{filterText(en.filters.noResultsHint)}</p>
            </div>
          ) : (
            <Hits results={results} busy={status === 'loading'} />
          )}
        </Stack>
      </Container>
    </ExampleProvider>
  )
}

/** No filter applied: the row says so, and every hit shows. */
export const NoneApplied: Story = {
  globals: { ...wideGlobals },
  render: () => <FilterRecipe />,
  play: async ({ canvas }) => {
    await expect(canvas.getByText('No filters applied')).toBeVisible()
    await expect(canvas.getByRole('heading', { level: 2, name: '10 results' })).toBeVisible()
    await expect(canvas.getByRole('combobox', { name: /Sort by/ }).tagName).toBe('SELECT')
  },
}

/** Two applied: each is a tag with a remove button, and Clear all is beside them. */
export const TwoApplied: Story = {
  globals: { ...wideGlobals },
  render: () => <FilterRecipe initialKinds={['service']} initialYears={['2026']} />,
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('button', { name: 'Remove Type: Services' })).toBeVisible()
    await expect(canvas.getByRole('button', { name: 'Remove Year: 2026' })).toBeVisible()
    await expect(canvas.getByRole('heading', { level: 2, name: '2 results' })).toBeVisible()
  },
}

/** Nothing matches: say so and what to try, with the applied row and Clear all still in view. */
export const NoResults: Story = {
  globals: { ...wideGlobals },
  render: () => <FilterRecipe initialKinds={['document']} initialYears={['2024']} />,
  play: async ({ canvas }) => {
    await expect(canvas.getByText('No results match these filters.')).toBeVisible()
    await expect(canvas.getByRole('button', { name: 'Clear all filters' })).toBeVisible()
    await expect(canvas.queryByRole('heading', { level: 3 })).toHaveTextContent(
      'No results match these filters.',
    )
  },
}

/** Over a second: a visible "Updating results" (plain text, not a live region: the count is announced after) and `aria-busy` on the list. */
export const Loading: Story = {
  globals: { ...wideGlobals },
  render: () => <FilterRecipe status="loading" />,
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.getByText('Updating results')).toBeVisible()
    await expect(canvasElement.querySelector('ol[aria-busy="true"]')).not.toBeNull()
  },
}

/** The update failed: an inline alert with Try again; the filters and the old results stay. */
export const UpdateFailed: Story = {
  globals: { ...wideGlobals },
  render: () => <FilterRecipe status="failed" initialKinds={['news']} />,
  play: async ({ canvas }) => {
    await expect(canvas.getByText('The results couldn’t be updated.')).toBeVisible()
    await expect(canvas.getByRole('button', { name: 'Try again' })).toBeVisible()
    await expect(canvas.getAllByRole('listitem').length).toBeGreaterThan(0)
  },
}

/** 320px, closed: the trigger says how many filters are applied. */
export const NarrowClosed: Story = {
  globals: { ...narrowGlobals },
  render: () => <FilterRecipe collapsible initialKinds={['service']} />,
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.getByRole('button', { name: 'Filters, 1 applied' })).toHaveAttribute(
      'aria-expanded',
      'false',
    )
    await expectNoHorizontalOverflow(canvasElement)
  },
}

/** 320px, open: the filters are in the panel straight after the trigger. */
export const NarrowOpen: Story = {
  globals: { ...narrowGlobals },
  render: () => <FilterRecipe collapsible open initialKinds={['service']} />,
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.getByRole('button', { name: 'Filters, 1 applied' })).toHaveAttribute(
      'aria-expanded',
      'true',
    )
    await expectNoHorizontalOverflow(canvasElement)
  },
}

/** Tab goes filters, applied tags, Clear all, then the result links; a tag's Enter removes it and focus moves on. */
export const Keyboard: Story = {
  globals: { ...wideGlobals },
  render: () => <FilterRecipe initialKinds={['service']} initialYears={['2026']} />,
  play: async ({ canvas }) => {
    const first = canvas.getByRole('button', { name: 'Remove Type: Services' })
    const second = canvas.getByRole('button', { name: 'Remove Year: 2026' })
    first.focus()
    await userEvent.keyboard('{Enter}')
    await expect(second).toHaveFocus()
    await expect(canvas.getByRole('heading', { level: 2, name: /results?$/ })).toBeVisible()
  },
}

/** Right to left: the form and the tags follow the inline direction; DOM order is unchanged. */
export const RTL: Story = {
  ...TwoApplied,
  globals: { dir: 'rtl', locale: 'en', ...wideGlobals },
}

/** Forced colours: tags keep their edge and the remove cross. */
export const ForcedColors: Story = {
  ...TwoApplied,
  globals: { forcedColors: 'active', ...wideGlobals },
}
