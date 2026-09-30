import { getLanguage } from '@kvirn-ui/core'
import type { ColorSchemePreference, ContrastPreference } from '@kvirn-ui/core'
import { useId } from 'react'
import type { CSSProperties } from 'react'
import { useDateSettings } from './use-date-settings.ts'
import { useLocale } from './use-locale.ts'
import { useMessages } from './use-messages.ts'
import { useTheme } from './use-theme.ts'

// Test and story fixture. Its own labels are fixture text, per language, so `lang` always
// matches the content (3.1.2). Library strings come from the provider (`newTabNotice`).
const fixtureTexts = {
  sv: {
    settings: 'Inställningar',
    locale: 'Språk',
    direction: 'Riktning',
    timeZone: 'Tidszon',
    runtimeTimeZone: 'Enhetens tidszon',
    weekStart: 'Veckan börjar på dag',
    date: 'Datum',
    newTabNotice: 'Text för ny flik',
    theme: 'Tema',
    colorScheme: 'Färgschema',
    contrast: 'Kontrast',
    light: 'Ljust',
    dark: 'Mörkt',
    system: 'Följ systemet',
    standard: 'Normal kontrast',
    more: 'Hög kontrast',
    resolved: 'Används nu',
    forcedColors: 'Systemets tvingade färger används och går före ditt val.',
  },
  fi: {
    settings: 'Asetukset',
    locale: 'Kieli',
    direction: 'Kirjoitussuunta',
    timeZone: 'Aikavyöhyke',
    runtimeTimeZone: 'Laitteen aikavyöhyke',
    weekStart: 'Viikon ensimmäinen päivä',
    date: 'Päivämäärä',
    newTabNotice: 'Uuden välilehden ilmoitus',
    theme: 'Teema',
    colorScheme: 'Väriteema',
    contrast: 'Kontrasti',
    light: 'Vaalea',
    dark: 'Tumma',
    system: 'Järjestelmän mukaan',
    standard: 'Tavallinen kontrasti',
    more: 'Korkea kontrasti',
    resolved: 'Käytössä nyt',
    forcedColors: 'Järjestelmän pakotetut värit ovat käytössä ja ohittavat valintasi.',
  },
  en: {
    settings: 'Settings',
    locale: 'Language',
    direction: 'Direction',
    timeZone: 'Time zone',
    runtimeTimeZone: 'Device time zone',
    weekStart: 'Week starts on day',
    date: 'Date',
    newTabNotice: 'New tab notice',
    theme: 'Theme',
    colorScheme: 'Colour scheme',
    contrast: 'Contrast',
    light: 'Light',
    dark: 'Dark',
    system: 'Follow system',
    standard: 'Standard contrast',
    more: 'High contrast',
    resolved: 'In use',
    forcedColors: 'Your system’s forced colours are in use and override your choice.',
  },
}

type FixtureText = (typeof fixtureTexts)['en']

function useFixtureText(): FixtureText {
  const { locale } = useLocale()
  const language = getLanguage(locale)
  return language === 'sv' || language === 'fi' ? fixtureTexts[language] : fixtureTexts.en
}

/** A fixed instant, so stories and tests are deterministic: 2026-10-01 06:30 UTC. */
export const fixtureDate = new Date(Date.UTC(2026, 9, 1, 6, 30))

/** Shows everything the provider gives components: locale, dir, dates and messages. */
export function ProviderFixture() {
  const locale = useLocale()
  const dateSettings = useDateSettings()
  const linkMessages = useMessages('link')
  const text = useFixtureText()
  const headingId = useId()
  const formattedDate = new Intl.DateTimeFormat(locale.locale, {
    dateStyle: 'long',
    timeStyle: 'short',
    ...(dateSettings.timeZone === undefined ? {} : { timeZone: dateSettings.timeZone }),
  }).format(fixtureDate)

  return (
    <section aria-labelledby={headingId} {...locale.localeProps}>
      <h2 id={headingId}>{text.settings}</h2>
      <dl>
        <dt>{text.locale}</dt>
        <dd>{locale.locale}</dd>
        <dt>{text.direction}</dt>
        <dd>{locale.dir}</dd>
        <dt>{text.timeZone}</dt>
        <dd>{dateSettings.timeZone ?? text.runtimeTimeZone}</dd>
        <dt>{text.weekStart}</dt>
        <dd>{dateSettings.weekStart}</dd>
        <dt>{text.date}</dt>
        <dd>
          <time dateTime={fixtureDate.toISOString()}>{formattedDate}</time>
        </dd>
        <dt>{text.newTabNotice}</dt>
        <dd>{linkMessages.newTabNotice}</dd>
      </dl>
    </section>
  )
}

const colorSchemeOptions: readonly ColorSchemePreference[] = ['light', 'dark', 'system']
const contrastOptions: readonly ContrastPreference[] = ['standard', 'more', 'system']

// 2.5.8: each radio is at least 24 × 24 CSS px.
const optionStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  minBlockSize: '1.75rem',
}
const radioStyle: CSSProperties = { inlineSize: '1.5rem', blockSize: '1.5rem', margin: 0 }

/**
 * A theme switcher built from native radio groups (`<fieldset>`/`<legend>`), as a
 * consumer would build it on `useTheme()`. The checked radio is the only feedback: a
 * theme change moves no focus and announces nothing.
 */
export function ThemeSwitcherFixture() {
  const locale = useLocale()
  const theme = useTheme()
  const text = useFixtureText()
  const id = useId()

  return (
    <section aria-labelledby={`${id}-heading`} {...locale.localeProps}>
      <h2 id={`${id}-heading`}>{text.theme}</h2>
      <fieldset>
        <legend>{text.colorScheme}</legend>
        {colorSchemeOptions.map((option) => (
          <label key={option} style={optionStyle}>
            <input
              type="radio"
              name={`${id}-color-scheme`}
              value={option}
              checked={theme.colorScheme === option}
              onChange={() => theme.selectColorScheme(option)}
              style={radioStyle}
            />
            {text[option]}
          </label>
        ))}
      </fieldset>
      <fieldset>
        <legend>{text.contrast}</legend>
        {contrastOptions.map((option) => (
          <label key={option} style={optionStyle}>
            <input
              type="radio"
              name={`${id}-contrast`}
              value={option}
              checked={theme.contrast === option}
              onChange={() => theme.selectContrast(option)}
              style={radioStyle}
            />
            {text[option]}
          </label>
        ))}
      </fieldset>
      <p>
        {theme.isForcedColors
          ? text.forcedColors
          : `${text.resolved}: ${text[theme.resolvedColorScheme]}, ${text[theme.resolvedContrast]}`}
      </p>
    </section>
  )
}
