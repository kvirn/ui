import { Calendar, KvirnProvider } from '@kvirn-ui/react'
import type { CalendarRootProps } from '@kvirn-ui/react'
import type { Decorator } from '@storybook/react-vite'
import { localeOf, messagesFor, providerLocaleOf } from '../form/form.fixture.tsx'
import type { FormLocale } from '../form/form.fixture.tsx'

// Fixtures for Components/Calendar. The Calendar holds no date of its own beyond the visible month
// and the focused day: `value` and `onValueChange` are yours. Every story fixes `today` so the
// grid and the plays are the same on any day. se is English, marked lang="en" (3.1.2).

/** The days the recycling centre is closed in October 2026. */
export const closedDays = new Set(['2026-10-16', '2026-10-17', '2026-10-24'])

const closedTexts: Record<FormLocale, string> = {
  sv: 'Stängt',
  fi: 'Suljettu',
  nb: 'Stengt',
  nn: 'Stengt',
  se: 'Closed',
  en: 'Closed',
}

export const describeClosedDay = (locale: FormLocale) => (date: string) =>
  closedDays.has(date) ? closedTexts[locale] : undefined

/** Library strings follow the locale toolbar and the direction toolbar, like an app's provider. */
export const withCalendarProvider: Decorator = (Story, { globals }) => {
  const locale = localeOf(globals)
  const dir = globals['dir'] === 'rtl' ? 'rtl' : 'ltr'
  return (
    <KvirnProvider locale={providerLocaleOf(locale)} dir={dir} messages={messagesFor(locale)}>
      <Story />
    </KvirnProvider>
  )
}

export function MonthCalendar(props: Partial<CalendarRootProps>) {
  return (
    <Calendar.Root today="2026-10-14" {...props}>
      <Calendar.PreviousMonth />
      <Calendar.Heading />
      <Calendar.NextMonth />
      <Calendar.RangeHint />
      <Calendar.Grid />
    </Calendar.Root>
  )
}

export function YearButtonsCalendar(props: Partial<CalendarRootProps>) {
  return (
    <Calendar.Root today="2026-10-14" {...props}>
      <Calendar.PreviousYear />
      <Calendar.PreviousMonth />
      <Calendar.Heading />
      <Calendar.NextMonth />
      <Calendar.NextYear />
      <Calendar.Grid />
    </Calendar.Root>
  )
}

/** Every locale the library ships, each in its own provider: month and weekday names from `Intl`. */
export function LocaleCalendars() {
  const locales: { locale: string; messages: FormLocale }[] = [
    { locale: 'sv', messages: 'sv' },
    { locale: 'sv-FI', messages: 'sv' },
    { locale: 'fi', messages: 'fi' },
    { locale: 'nb', messages: 'nb' },
    { locale: 'nn', messages: 'nn' },
    { locale: 'se', messages: 'se' },
    { locale: 'en-GB', messages: 'en' },
  ]
  return (
    <div className="kv-story-form">
      {locales.map(({ locale, messages }) => (
        <KvirnProvider key={locale} locale={locale} messages={messagesFor(messages)}>
          <MonthCalendar />
        </KvirnProvider>
      ))}
    </div>
  )
}
