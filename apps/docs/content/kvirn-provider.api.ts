import type { ThemeOptions } from '@kvirn-ui/core'
import type {
  KvirnProviderProps,
  KvirnThemeScriptProps,
  KvirnToastOptions,
  UseDateSettingsResult,
  UseFormatResult,
  UseLocaleResult,
  UseThemeResult,
} from '@kvirn-ui/react'
import { propRows } from '../components/api-block.tsx'
import type { ApiHook, AttributeRow } from '../components/api-block.tsx'

export const providerRows = propRows<KvirnProviderProps>({
  children: { type: 'ReactNode', default: '–', description: 'What the provider wraps.' },
  locale: {
    type: 'string (BCP 47)',
    default: "'en', or the parent's",
    description:
      'Sets how numbers and dates are written, the lang value, and which texts are used. A tag such as sv-SE, fi-FI or nn-NO. A bare en is read as US English (10/14/26), so pass en-GB for 14/10/2026.',
  },
  dir: {
    type: "'ltr' | 'rtl'",
    default: "From locale, or the parent's",
    description: 'Overrides the text direction that the locale gives.',
  },
  country: {
    type: "'SE' | 'FI' | 'NO'",
    default: "The parent's, else from locale",
    description:
      'The country for masks that differ by country. The first of these that applies is used: this prop, the region of the locale (sv-FI is FI), then its language (sv is SE, fi is FI, and nb, nn and no are NO). For en there is none: a country mask then takes only digits and warns once in development.',
  },
  messages: {
    type: 'PartialMessages',
    default: 'Inherited, then English',
    description:
      'A catalog, such as sv from @kvirn-ui/i18n/sv, or a partial override of the texts. A non-English locale needs its catalog, or English texts show under a non-English lang.',
  },
  timeZone: {
    type: 'string (IANA)',
    default: "The parent's, or UTC",
    description:
      'The zone dates and times are shown in, such as Europe/Stockholm. Set it, the same on the server and in the browser, so both show the same date. Without one, times are shown in UTC and the first one warns in development. For a calendar date use the YYYY-MM-DD string: a date-only instant can show the neighbouring day.',
  },
  weekStart: {
    type: '1 to 7 (ISO weekday, 1 is Monday)',
    default: "The parent's, else the locale's when it names a region (en-US is 7), else 1",
    description:
      'The first day of the week in Calendar and DatePicker. The first of these that applies is used: the Calendar’s own value, this prop, the locale’s, then Monday. Week numbers are ISO 8601 and only show with a Monday start. Set it for server rendering.',
  },
  linkComponent: {
    type: 'RegisteredLinkComponent',
    default: "'a', or the parent's",
    description:
      'Your router’s link component. Every KvirnUI component that renders a link uses it. It must forward its ref and render an <a>. Register it for typed link props.',
  },
  icons: {
    type: 'IconRegistry',
    default: "The parent's",
    description:
      'The names for <Icon name>, from defineIcons: icons from @kvirn-ui/icons, or from Lucide or others. KvirnUI draws no icon by name until you register it, and a registered name also replaces that icon in KvirnUI’s own components. Merged by name. Register only the ones you need: the whole set from @kvirn-ui/icons/all adds every icon to your bundle.',
  },
  iconDefaults: {
    type: 'IconDefaults',
    default: "The parent's",
    description: 'Default size for every Icon below. Merged by field.',
  },
  theme: {
    type: 'ThemeOptions',
    default: '–',
    description:
      'Defaults and storage for the theme. Read by the outermost provider only. A theme on a nested provider is ignored with a development warning.',
  },
  toast: {
    type: 'KvirnToastOptions',
    default: '{ limit: 10, autoDismiss: false }',
    description:
      'Options for the toast region the provider renders. The first outermost provider that mounts owns them: a nested or later provider’s toast is ignored with a development warning.',
  },
  env: {
    type: 'Env',
    default: 'The page, after hydration',
    description: 'The window and document to use, for an iframe or a test.',
  },
})

export const providerAttributes: readonly AttributeRow[] = [
  {
    name: 'data-kv-color-scheme',
    values: 'light or dark',
    meaning:
      'Set on <html>: the colour scheme in use, after system is replaced by the device’s setting.',
  },
  {
    name: 'data-kv-contrast',
    values: 'standard or more',
    meaning: 'Set on <html>: the contrast in use.',
  },
  {
    name: 'data-kv-motion',
    values: 'full or reduce',
    meaning:
      'Set on <html>: the motion in use. reduce stops every transition and animation in the theme.',
  },
]

export const themeRows = propRows<ThemeOptions>({
  defaultColorScheme: {
    type: "'light' | 'dark' | 'system'",
    default: "'system'",
    description: 'The colour scheme until the user chooses.',
  },
  defaultContrast: {
    type: "'standard' | 'more' | 'system'",
    default: "'system'",
    description: 'The contrast until the user chooses.',
  },
  defaultMotion: {
    type: "'full' | 'reduce' | 'system'",
    default: "'system'",
    description:
      'The motion until the user chooses. reduce stops every transition and animation in the theme.',
  },
  storage: {
    type: "'local' | 'none' | { read, write }",
    default: "'local'",
    description:
      'Where a chosen preference is kept. local stores JSON under the localStorage key kvirn-ui:theme, and other tabs follow it. none keeps it in memory. A { read, write } adapter keeps it somewhere else: the store checks what read returns, and a read or write that throws is caught. If storage is off or full, the choice still applies for the visit.',
  },
})

export const toastOptionRows = propRows<KvirnToastOptions>({
  limit: {
    type: 'number',
    default: '10',
    description:
      'How many toasts show at once. Past it, the oldest toast that can time out is removed for the new one. If there is none, or the user is on a toast, the new toast is ignored with a development warning. It is not queued.',
  },
  autoDismiss: {
    type: 'false | number',
    default: 'false',
    description:
      'false: no toast times out. A number is how long a toast stays, in milliseconds. A toast with an action never times out, and neither does one that is still busy. There is no minimum, so a short time can remove a toast before it is read (2.2.1 Timing Adjustable): tie it to a setting the user can change. 0, a negative number and NaN count as false and warn in development.',
  },
})

export const scriptRows = propRows<KvirnThemeScriptProps>({
  nonce: { type: 'string', default: '–', description: 'The CSP nonce of the response.' },
  theme: {
    type: '{ defaultColorScheme, defaultContrast, defaultMotion }',
    default: "'system' for each",
    description:
      'The same object as the provider’s theme, so the defaults are written once. Only the three defaults are read: storage is ignored.',
  },
})

export const useLocaleHook: ApiHook = {
  name: 'useLocale',
  intro: 'Takes no options. It reads the nearest provider: en and ltr without one.',
  result: propRows<UseLocaleResult>({
    locale: { type: 'string', default: '–', description: 'The BCP 47 locale.' },
    dir: { type: "'ltr' | 'rtl'", default: '–', description: 'The text direction.' },
    country: {
      type: "'SE' | 'FI' | 'NO' | undefined",
      default: '–',
      description: 'The country for masks. Undefined when neither the prop nor the locale says.',
    },
    localeProps: {
      type: '{ lang, dir }',
      default: '–',
      description:
        'Spread on the element that starts a part in another language (3.1.2 Language of Parts).',
    },
  }),
}

export const useDateSettingsHook: ApiHook = {
  name: 'useDateSettings',
  intro: 'Takes no options. It reads the nearest provider.',
  result: propRows<UseDateSettingsResult>({
    timeZone: {
      type: 'string',
      default: '–',
      description: 'The provider’s time zone, or UTC. It is never the browser’s zone.',
    },
    weekStart: {
      type: '1 to 7',
      default: '–',
      description: 'The first day of the week, worked out as for the weekStart prop.',
    },
  }),
}

export const useFormatHook: ApiHook = {
  name: 'useFormat',
  intro:
    'Takes no options. It formats the way the nearest provider’s locale writes, and times in its time zone. It is en and UTC without a provider. The object stays the same until the locale or the time zone changes, so it is safe in a dependency list.',
  result: propRows<UseFormatResult>({
    number: {
      type: '(value, options?) => string',
      default: '–',
      description: 'Intl.NumberFormat options. A currency, a percentage or a plain number.',
    },
    date: {
      type: '(value, options?) => string',
      default: '–',
      description:
        'Intl.DateTimeFormat options. A Date or a number is a moment, shown in the time zone. A YYYY-MM-DD string is a calendar date, shown on its own day.',
    },
    list: {
      type: '(items, options?) => string',
      default: '–',
      description: 'Joins items the way the language does: “a, b and c”.',
    },
    plural: {
      type: '(count, forms) => string',
      default: '–',
      description: 'Picks the form for the count by the locale’s plural rules.',
    },
  }),
}

export const useThemeHook: ApiHook = {
  name: 'useTheme',
  intro:
    'Takes no options. It reads and changes the page’s one theme preference. It works without a provider, with the defaults and localStorage.',
  result: propRows<UseThemeResult>({
    colorScheme: {
      type: "'light' | 'dark' | 'system'",
      default: '–',
      description: 'The user’s choice, or your default until they choose.',
    },
    contrast: {
      type: "'standard' | 'more' | 'system'",
      default: '–',
      description: 'The user’s choice, or your default until they choose.',
    },
    motion: {
      type: "'full' | 'reduce' | 'system'",
      default: '–',
      description: 'The user’s choice, or your default until they choose. reduce is less motion.',
    },
    resolvedColorScheme: {
      type: "'light' | 'dark'",
      default: '–',
      description: 'The scheme in use, after system is replaced by the device’s setting.',
    },
    resolvedContrast: {
      type: "'standard' | 'more'",
      default: '–',
      description: 'The contrast in use.',
    },
    resolvedMotion: {
      type: "'full' | 'reduce'",
      default: '–',
      description: 'The motion in use.',
    },
    isForcedColors: {
      type: 'boolean',
      default: '–',
      description:
        'The device forces its own colours (for example Windows contrast themes). They go before any choice, so a switcher should say so.',
    },
    selectColorScheme: {
      type: '(colorScheme) => void',
      default: '–',
      description: 'Saves the choice. A choice equal to your default is not kept.',
    },
    selectContrast: {
      type: '(contrast) => void',
      default: '–',
      description: 'Saves the choice. A choice equal to your default is not kept.',
    },
    selectMotion: {
      type: '(motion) => void',
      default: '–',
      description: 'Saves the choice. A choice equal to your default is not kept.',
    },
  }),
}
