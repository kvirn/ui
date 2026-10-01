// Docs site shell and template strings (docs/design/docs-site.md §4). The site copy is English
// for now, keyed so it can be translated later. Library strings live in @kvirn-ui/i18n.

const colorSchemeNames = { light: 'Light', dark: 'Dark', system: 'Same as my device' } as const
const contrastNames = { standard: 'Standard', more: 'High', system: 'Same as my device' } as const

export const messages = {
  docs: {
    meta: {
      title: ({ page }: { page: string }) => `${page} – KvirnUI`,
      homeTitle: 'KvirnUI – accessible React components for public services',
      description:
        'Headless, accessible React components for public services in the Nordics and the EU.',
    },
    skipLink: 'Skip to main content',
    header: { home: 'KvirnUI', status: 'Pre-alpha' },
    nav: {
      label: 'Documentation',
      menuButton: 'Menu',
      introduction: 'Introduction',
      foundation: 'Foundation',
      components: 'Components',
    },
    display: {
      button: 'Display settings',
      colorScheme: { legend: 'Colour scheme', ...colorSchemeNames },
      contrast: { legend: 'Contrast', ...contrastNames },
      /** The resolved theme in words, with lower-cased option names. Not a live region. */
      inUse: ({
        colorScheme,
        contrast,
      }: {
        colorScheme: 'light' | 'dark'
        contrast: 'standard' | 'high'
      }) => `In use now: ${colorScheme}, ${contrast} contrast`,
      forcedColors:
        'Your device is using its own colours, for example a Windows contrast theme. They replace the settings here. Your choice is kept for when you turn them off.',
      storageNote:
        "We save your choice in this browser only. We don't use cookies or send it anywhere.",
    },
    status: {
      label: 'Status',
      planned: 'Planned',
      alpha: 'Alpha',
      beta: 'Beta',
      stable: 'Stable',
      plannedText: 'Not built yet.',
      alphaText:
        "Automated tests and an independent accessibility review pass. Manual testing with assistive technology is pending. Don't use it in a live service yet.",
      betaText: 'Tested with the core set of assistive technologies. The API can still change.',
      stableText: 'The API is stable and follows semantic versioning.',
    },
    template: {
      example: 'Example',
      whenToUse: 'When to use it',
      whenNotToUse: 'When not to use it',
      installation: 'Installation',
      styling: 'Styling',
      usage: 'Usage',
    },
    example: {
      languageLabel: 'Example language',
      languages: {
        sv: 'Svenska',
        fi: 'Suomi',
        nb: 'Norsk bokmål',
        nn: 'Norsk nynorsk',
        se: 'Davvisámegiella',
        en: 'English',
      },
      codeHeading: 'Code',
      error:
        'This example could not be shown. The rest of the page still works. Reload the page to try again.',
    },
    footer: {
      licence: 'KvirnUI is open source under the MIT licence.',
      claim:
        'KvirnUI is designed and tested to meet WCAG 2.2 AA. Whether your service meets it depends on how you build and test the whole service.',
      noTracking: 'This site uses no cookies, analytics or third-party services.',
    },
    notFound: {
      title: 'Page not found',
      heading: 'Page not found',
      body: 'Check the web address. If you followed a link on this site, the page may have moved.',
      homeLink: 'Go to the introduction',
    },
  },
} as const

export type DocsMessages = typeof messages.docs
