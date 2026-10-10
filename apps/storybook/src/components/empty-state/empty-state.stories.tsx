import { Button, Heading } from '@kvirn-ui/react'
import contract from '../../../../../packages/react/src/empty-state/empty-state.a11y.md?raw'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'
import { localeOf } from '../form/form.fixture.tsx'
import type { FormLocale } from '../form/form.fixture.tsx'

// Components/EmptyState: classes only (kv-empty-state, kv-empty-state-title, kv-empty-state-body)
// on your own markup, styled by @kvirn-ui/theme/theme.css (design spec
// docs/design/status-patterns.md). It has no role, no strings, no live region and no focus: a
// page that is empty on arrival is read in reading order, and a filter that empties a list
// announces through the component that filtered. It is never centred and has no illustration.

interface EmptyTexts {
  title: string
  body: string
  action: string
  searchTitle: string
  searchBody: string
}

const texts: Record<FormLocale, EmptyTexts | undefined> = {
  sv: {
    title: 'Du har inga ärenden än',
    body: 'När du ansöker om något visas det här.',
    action: 'Starta en ansökan',
    searchTitle: 'Inga träffar på "parkering"',
    searchBody: 'Kontrollera stavningen eller använd färre ord.',
  },
  fi: {
    title: 'Sinulla ei ole vielä asioita',
    body: 'Kun haet jotakin, se näkyy täällä.',
    action: 'Aloita hakemus',
    searchTitle: 'Ei tuloksia haulle "pysäköinti"',
    searchBody: 'Tarkista oikeinkirjoitus tai käytä vähemmän sanoja.',
  },
  nb: {
    title: 'Du har ingen saker ennå',
    body: 'Når du søker om noe, vises det her.',
    action: 'Start en søknad',
    searchTitle: 'Ingen treff på "parkering"',
    searchBody: 'Kontroller stavemåten eller bruk færre ord.',
  },
  nn: {
    title: 'Du har ingen saker enno',
    body: 'Når du søkjer om noko, vert det vist her.',
    action: 'Start ei søknad',
    searchTitle: 'Ingen treff på "parkering"',
    searchBody: 'Kontroller stavemåten eller bruk færre ord.',
  },
  en: {
    title: 'You have no cases yet',
    body: 'When you apply for something, it shows up here.',
    action: 'Start an application',
    searchTitle: 'No results for "parkering"',
    searchBody: 'Check the spelling or use fewer words.',
  },
}

const textsFor = (locale: FormLocale) => ({
  text: texts[locale] ?? texts.en!,
  lang: texts[locale] === undefined ? ('en' as const) : undefined,
})

const meta = {
  title: 'Components/Content/EmptyState',
  globals: { locale: 'sv' },
  parameters: {
    a11yContract: contract,
    docs: {
      description: {
        component:
          'Classes only: `kv-empty-state`, `kv-empty-state-title` (on your own `Heading`, at the level the page needs) and `kv-empty-state-body`, with an ordinary `kv-button-group` for the one action. No role, no strings, no live region and no focus. Say what is not there and what to do next, in that order. Never "No data".',
      },
    },
  },
  render: (_args, { globals }) => {
    const { text, lang } = textsFor(localeOf(globals))
    return (
      <div className="kv-empty-state" lang={lang}>
        <Heading as="h2" className="kv-empty-state-title">
          {text.title}
        </Heading>
        <p className="kv-empty-state-body">{text.body}</p>
        <div className="kv-button-group">
          <Button className="kv-button--primary">{text.action}</Button>
        </div>
      </div>
    )
  },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

/** Nothing yet: what will appear, and one action to start. */
export const Default: Story = {
  play: async ({ canvas, globals }) => {
    const { text } = textsFor(localeOf(globals))
    await expect(canvas.getByRole('heading', { level: 2, name: text.title })).toBeVisible()
    await expect(canvas.getByText(text.body)).toBeVisible()
  },
}

/** No results: what was searched, and how to widen it. No action needed. */
export const NoResults: Story = {
  render: (_args, { globals }) => {
    const { text, lang } = textsFor(localeOf(globals))
    return (
      <div className="kv-empty-state" lang={lang}>
        <Heading as="h2" className="kv-empty-state-title">
          {text.searchTitle}
        </Heading>
        <p className="kv-empty-state-body">{text.searchBody}</p>
      </div>
    )
  },
}

/** Right to left, in English: still start-aligned, never centred. */
export const RTL: Story = {
  globals: { dir: 'rtl', locale: 'en' },
}

/** Text and heading only: nothing to map. */
export const ForcedColors: Story = {
  globals: { forcedColors: 'active' },
}
