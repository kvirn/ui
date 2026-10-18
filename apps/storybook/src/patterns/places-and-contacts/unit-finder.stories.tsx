import { en } from '@kvirn-ui/i18n/en'
import { kvirnbyUnitAreas, kvirnbyUnitLanguages, kvirnbyUnits } from '@kvirn-ui/patterns/fixtures'
import type { KvirnbyUnit, KvirnbyUnitArea, KvirnbyUnitLanguage } from '@kvirn-ui/patterns/fixtures'
import {
  Address,
  Button,
  Checkbox,
  CheckboxGroup,
  Container,
  Disclosure,
  Field,
  Heading,
  Link,
  List,
  Listbox,
  Pagination,
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
import { ExampleProvider, filterText } from '../search-and-forms/search-support.tsx'
import { chromeViewports, narrowGlobals, wideGlobals } from '../patterns-story-support.tsx'
import contract from '../../../../../packages/patterns/src/places-and-contacts/unit-finder/unit-finder.a11y.md?raw'

// Patterns/Places and contacts/Unit finder (docs/design/storybook-patterns-t5.md S11).
// Story-only: a recipe from the Filter recipe's parts, a List and Pagination. No map and no "near me" (rule 7).

const description = `Choose a unit, here a preschool, in my area. Built like the [Filter recipe](?path=/docs/patterns-search-and-forms-filter--docs): the area is a native \`Listbox.Root native="always"\` in its Field (a long list of areas stays a plain select, with no popup to build), the language and the opening hours are CheckboxGroups, the applied filters are a TagGroup with Clear all, then the count heading and the results. Each result is an \`h3\` with one link, the address in an [Address](?path=/docs/components-content-address--docs) and the opening hours as one sentence. Pagination links are real URLs.

**Behaviour.** With JavaScript the list changes in place and focus stays where it was; "Show results" is for the no-JS case. Each change is said once, politely, through the provider's announcer: the count for a tick or a choice, the removal and the count for a tag, "All filters cleared" and the count for Clear all. No results keeps the applied row and Clear all in view. There is no map, no "near me" and no location request: the area is the user's choice. Below 64rem the form sits in a Disclosure (it has no open-from-64rem option yet, so the narrow stories wrap it always).

## Parts and gaps

Parts used: \`Listbox\` (native), \`CheckboxGroup\`, \`TagGroup\` and \`Tag\`, \`Disclosure\`, \`List\`, \`Heading\`, \`Link\`, \`Address\`, \`Pagination\`, \`Button\`, \`useAnnouncer\`. Gap: Disclosure cannot be open from 64rem and closed below.
`

const meta = {
  title: 'Patterns/Places and contacts/Unit finder',
  globals: { locale: 'en' },
  parameters: {
    a11yContract: contract,
    docs: { description: { component: description } },
    viewport: { options: chromeViewports },
  },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

type AreaKey = KvirnbyUnitArea | 'all'
type HoursKey = 'early' | 'late'

const areaItems: readonly { key: AreaKey; label: string }[] = [
  { key: 'all', label: 'All areas' },
  ...(Object.keys(kvirnbyUnitAreas) as KvirnbyUnitArea[]).map((key) => ({
    key,
    label: kvirnbyUnitAreas[key],
  })),
]
const hoursLabels: Record<HoursKey, string> = {
  early: 'Opens before 7.00',
  late: 'Open until 18.00 or later',
}
const languages = Object.keys(kvirnbyUnitLanguages) as KvirnbyUnitLanguage[]
const hours = Object.keys(hoursLabels) as HoursKey[]
const pageSize = 5

function matching(area: AreaKey, languageKeys: readonly string[], hourKeys: readonly string[]) {
  return kvirnbyUnits.filter(
    (unit: KvirnbyUnit) =>
      (area === 'all' || unit.area === area) &&
      (languageKeys.length === 0 ||
        languageKeys.some((language) =>
          unit.languages.includes(language as KvirnbyUnitLanguage),
        )) &&
      (!hourKeys.includes('early') || unit.opensEarly) &&
      (!hourKeys.includes('late') || unit.closesLate),
  )
}

function UnitFinder({
  initialArea = 'all',
  initialLanguages = [],
  initialHours = [],
  collapsible = false,
  open = false,
}: {
  initialArea?: AreaKey
  initialLanguages?: string[]
  initialHours?: string[]
  collapsible?: boolean
  open?: boolean
}) {
  const format = useFormat()
  const { announce } = useAnnouncer()
  const [area, setArea] = useState<AreaKey>(initialArea)
  const [languageKeys, setLanguageKeys] = useState(initialLanguages)
  const [hourKeys, setHourKeys] = useState(initialHours)

  const units = matching(area, languageKeys, hourKeys)
  const countFor = (nextArea: AreaKey, nextLanguages: string[], nextHours: string[]) =>
    matching(nextArea, nextLanguages, nextHours).length
  const announceCount = (nextArea: AreaKey, nextLanguages: string[], nextHours: string[]) =>
    announce(
      en.filters.resultCount({ count: countFor(nextArea, nextLanguages, nextHours) }, format),
    )

  const applied = [
    ...(area === 'all'
      ? []
      : [
          {
            kind: 'area' as const,
            value: area,
            label: en.filters.appliedValue({ group: 'Area', value: kvirnbyUnitAreas[area] }),
          },
        ]),
    ...languageKeys.map((value) => ({
      kind: 'language' as const,
      value,
      label: en.filters.appliedValue({
        group: 'Language',
        value: kvirnbyUnitLanguages[value as KvirnbyUnitLanguage],
      }),
    })),
    ...hourKeys.map((value) => ({
      kind: 'hours' as const,
      value,
      label: en.filters.appliedValue({
        group: 'Opening hours',
        value: hoursLabels[value as HoursKey],
      }),
    })),
  ]

  const removeFilter = (kind: 'area' | 'language' | 'hours', value: string, label: string) => {
    const nextArea = kind === 'area' ? 'all' : area
    const nextLanguages =
      kind === 'language' ? languageKeys.filter((entry) => entry !== value) : languageKeys
    const nextHours = kind === 'hours' ? hourKeys.filter((entry) => entry !== value) : hourKeys
    setArea(nextArea)
    setLanguageKeys(nextLanguages)
    setHourKeys(nextHours)
    announce(
      en.filters.removedResultCount(
        { label, count: countFor(nextArea, nextLanguages, nextHours) },
        format,
      ),
    )
  }

  const form = (
    <form aria-labelledby="unit-filter-heading">
      <Stack className="kv-stack--gap-4">
        {collapsible ? null : (
          <Heading as="h2" size="heading-3" id="unit-filter-heading">
            {filterText(en.filters.heading)}
          </Heading>
        )}
        <Field.Root>
          <Field.Label marker="none">Area</Field.Label>
          <Listbox.Root
            native="always"
            items={areaItems}
            itemToString={(item) => item.label}
            itemToKey={(item) => item.key}
            value={area}
            onValueChange={(next) => {
              const nextArea = (next as AreaKey | null) ?? 'all'
              setArea(nextArea)
              announceCount(nextArea, languageKeys, hourKeys)
            }}
            name="area"
          />
        </Field.Root>
        <CheckboxGroup.Root
          name="language"
          value={languageKeys}
          onValueChange={(next) => {
            setLanguageKeys(next)
            announceCount(area, next, hourKeys)
          }}
        >
          <CheckboxGroup.Legend>Language</CheckboxGroup.Legend>
          {languages.map((value) => (
            <CheckboxGroup.Option key={value}>
              <Checkbox value={value} />
              <Field.Label>{kvirnbyUnitLanguages[value]}</Field.Label>
            </CheckboxGroup.Option>
          ))}
        </CheckboxGroup.Root>
        <CheckboxGroup.Root
          name="hours"
          value={hourKeys}
          onValueChange={(next) => {
            setHourKeys(next)
            announceCount(area, languageKeys, next)
          }}
        >
          <CheckboxGroup.Legend>Opening hours</CheckboxGroup.Legend>
          {hours.map((value) => (
            <CheckboxGroup.Option key={value}>
              <Checkbox value={value} />
              <Field.Label>{hoursLabels[value]}</Field.Label>
            </CheckboxGroup.Option>
          ))}
        </CheckboxGroup.Root>
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
              <Heading as="h2" size="heading-3" id="unit-filter-heading">
                <Disclosure.Trigger>
                  {en.filters.disclosure({ count: applied.length }, format)}
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
                setArea('all')
                setLanguageKeys([])
                setHourKeys([])
                announce(en.filters.clearedResultCount({ count: kvirnbyUnits.length }, format))
              }}
            />
          </TagGroup.Root>
          <Heading as="h2" size="heading-3">
            {en.filters.resultCount({ count: units.length }, format)}
          </Heading>
          {units.length === 0 ? (
            <div className="kv-empty-state">
              <Heading as="h3" size="heading-4" className="kv-empty-state-title">
                {filterText(en.filters.noResults)}
              </Heading>
              <p className="kv-empty-state-body">{filterText(en.filters.noResultsHint)}</p>
            </div>
          ) : (
            <List.Root className="kv-list--gap-8">
              {units.slice(0, pageSize).map((unit) => (
                <List.Item key={unit.href}>
                  <Stack className="kv-stack--gap-2">
                    <Heading as="h3" size="heading-4">
                      <Link.Root href={unit.href}>{unit.name}</Link.Root>
                    </Heading>
                    <Address>
                      {unit.street}
                      <br />
                      {unit.town}
                    </Address>
                    <p>{unit.hoursSummary}</p>
                  </Stack>
                </List.Item>
              ))}
            </List.Root>
          )}
          {units.length > pageSize ? (
            <Pagination.Root>
              <Pagination.List>
                {[1, 2].map((number) => (
                  <Pagination.Item key={number}>
                    <Pagination.Link
                      page={number}
                      href={`?page=${number}`}
                      current={number === 1}
                    />
                  </Pagination.Item>
                ))}
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

/** Nothing applied: eight preschools, five on this page, with Pagination after. */
export const All: Story = {
  globals: { ...wideGlobals },
  render: () => <UnitFinder />,
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('heading', { level: 2, name: '8 results' })).toBeVisible()
    await expect(canvas.getByRole('combobox', { name: 'Area' }).tagName).toBe('SELECT')
    await expect(canvas.getAllByRole('heading', { level: 3 })).toHaveLength(5)
  },
}

/** An area chosen: it is an applied tag, and the count follows. */
export const Filtered: Story = {
  globals: { ...wideGlobals },
  render: () => <UnitFinder initialArea="north" />,
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('button', { name: 'Remove Area: North' })).toBeVisible()
    await expect(canvas.getByRole('heading', { level: 2, name: '3 results' })).toBeVisible()
  },
}

/** Nothing matches: say so and what to try, with the applied row and Clear all still in view. */
export const None: Story = {
  globals: { ...wideGlobals },
  render: () => (
    <UnitFinder initialArea="south" initialLanguages={['fi']} initialHours={['early']} />
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByText('No results match these filters.')).toBeVisible()
    await expect(canvas.getByRole('button', { name: 'Clear all filters' })).toBeVisible()
    await expect(canvas.queryByRole('link', { name: /preschool/ })).toBeNull()
  },
}

/** One unit: the count says "1 result". */
export const One: Story = {
  globals: { ...wideGlobals },
  render: () => <UnitFinder initialArea="north" initialLanguages={['fi']} />,
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('heading', { level: 2, name: '1 result' })).toBeVisible()
    await expect(canvas.getByRole('link', { name: 'Lakeview preschool' })).toBeVisible()
  },
}

/** 320px, closed: the trigger says how many filters are applied. */
export const NarrowClosed: Story = {
  globals: { ...narrowGlobals },
  render: () => <UnitFinder collapsible initialArea="north" />,
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
  render: () => <UnitFinder collapsible open initialArea="north" />,
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.getByRole('button', { name: 'Filters, 1 applied' })).toHaveAttribute(
      'aria-expanded',
      'true',
    )
    await expectNoHorizontalOverflow(canvasElement)
  },
}

/** Tab goes the area select, the checkboxes, Show results, the tags, then the unit links; a tick keeps focus and changes the list. */
export const Keyboard: Story = {
  globals: { ...wideGlobals },
  render: () => <UnitFinder />,
  play: async ({ canvas }) => {
    const area = canvas.getByRole('combobox', { name: 'Area' })
    area.focus()
    await userEvent.tab()
    const swedish = canvas.getByRole('checkbox', { name: 'Swedish' })
    await expect(canvas.getByRole('checkbox', { name: 'Swedish' })).toHaveFocus()
    await userEvent.keyboard(' ')
    await expect(swedish).toHaveFocus()
    await expect(canvas.getByRole('button', { name: 'Remove Language: Swedish' })).toBeVisible()
  },
}

/** Right to left: the form and the tags follow the inline direction; DOM order is unchanged. */
export const RTL: Story = {
  ...Filtered,
  globals: { dir: 'rtl', locale: 'en', ...wideGlobals },
}

/** Forced colours: tags keep their edge and the remove cross. */
export const ForcedColors: Story = {
  ...Filtered,
  globals: { forcedColors: 'active', ...wideGlobals },
}
