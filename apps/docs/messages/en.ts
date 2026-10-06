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
    contents: { heading: 'On this page' },
    header: { home: 'KvirnUI', status: 'Pre-alpha' },
    nav: {
      label: 'Documentation',
      menuButton: 'Menu',
      introduction: 'Introduction',
      foundation: 'Foundation',
      kvirnProvider: 'KvirnProvider',
      locales: 'Locales and strings',
      components: 'Components',
      componentGroups: {
        actions: 'Actions',
        content: 'Content',
        layout: 'Layout',
        navigation: 'Navigation',
        forms: 'Forms',
        choiceAndOverlays: 'Choice and overlays',
        dataAndBehaviour: 'Data and behaviour',
      },
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
      inProgress: 'In progress',
      alphaCandidate: 'Alpha candidate',
      alpha: 'Alpha',
      beta: 'Beta',
      stable: 'Stable',
      plannedText: 'Not built yet.',
      inProgressText:
        "Being built. Its API and behaviour can still change, and it is not ready for review. Don't use it in a live service.",
      alphaCandidateText:
        "Built, and the automated tests pass. The independent accessibility review and manual testing with assistive technology are still pending. Don't use it in a live service yet.",
      alphaText:
        "Automated tests and an independent accessibility review pass. Manual testing with assistive technology is pending. Don't use it in a live service yet.",
      betaText: 'Tested with the core set of assistive technologies. The API can still change.',
      stableText: 'The API is stable and follows semantic versioning.',
    },
    template: {
      example: 'Example',
      whenToUse: 'When to use it',
      useCases: 'Use cases',
      api: 'API reference',
    },
    note: {
      tip: 'Did you know?',
      recipe: 'Implement like this',
      reminder: "Don't forget",
      announcerProvider:
        'Announcements need a KvirnProvider around your app, outside any <form>, or an Announcer of your own. Without one nothing is announced, and a development warning says so.',
    },
    useCase: { propsUsed: 'Props in this example:', propOn: 'on' },
    api: {
      import: 'Import',
      prop: 'Prop',
      type: 'Type',
      default: 'Default',
      description: 'Description',
      required: 'Required',
      none: '–',
      rendersLabel: 'Renders',
      attribute: 'Class or attribute',
      values: 'Values',
      meaning: 'Meaning',
      options: 'Options',
      result: 'Result',
      strings: 'Strings',
      stringsIntro: 'These are the default texts in @kvirn-ui/i18n.',
      language: 'Language',
      defaultText: 'Default text',
      messageKey: 'Message key',
      parameters: 'Parameters',
      englishText: 'Default text in English',
      usedFor: 'Used for',
      stringPendingSami: 'Not in Northern Sámi yet',
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
      error:
        'This example could not be shown. The rest of the page still works. Reload the page to try again.',
    },
    code: {
      label: 'Code',
      toggle: ({ count }: { count: number }) =>
        count === 1 ? 'Code, 1 line' : `Code, ${count} lines`,
      copy: 'Copy code',
      copied: 'Code copied',
      copyFailed: "Couldn't copy. The code is selected, so press Ctrl+C, or Cmd+C on a Mac.",
      empty: 'No code to show.',
      languages: {
        tsx: 'TSX',
        ts: 'TypeScript',
        json: 'JSON',
        css: 'CSS',
        bash: 'Bash',
        html: 'HTML',
      },
    },
    /** The sections built from a component's accessibility contract (docs-component-page.md §2, §4). */
    contract: {
      sections: {
        accessibility: 'Accessibility',
        keyboard: 'Keyboard',
        announcements: 'Announcements',
      },
      accessibility: {
        whatItDoes: 'What it does for you',
        whatYouNeedToDo: 'What you need to do',
        focus: 'Focus',
        visual: 'Visual and modes',
        testing: 'Testing with assistive technology',
        knownIssues: 'Known issues',
        wcag: 'WCAG success criteria',
        announcesNothing: 'It announces nothing.',
      },
      keyboard: {
        noKeys: ({ component }: { component: string }) =>
          `${component} has no keys of its own. What you put in it keeps its own keys.`,
        focusStrategy: 'Focus',
        selectionFollowsFocus: 'Selection follows focus',
        arrowsWrap: 'Arrows wrap',
        shortcuts: 'Shortcuts',
        key: 'Key',
        where: 'Where',
        whatHappens: 'What happens',
        test: 'Test:',
        noKey: 'No key',
      },
      announcements: {
        intro: ({ component }: { component: string }) =>
          `${component} tells screen reader users about these changes without moving focus. Each message waits until the screen reader is quiet (polite) or interrupts it (assertive).`,
        when: 'When',
        whatItSays: 'What it says',
        messageKey: 'Message key',
        politeness: 'Politeness',
        polite: 'Polite',
        assertive: 'Assertive',
        politeOrAssertive: 'Polite or assertive, as you choose',
        allLanguages: 'The text in all six languages',
        overrideHeading: 'Change the text',
        overrideWholeApp: 'For your whole app, pass',
        overrideTo: 'to',
        overrideOne: ({ component }: { component: string }) => `For one ${component}, pass its`,
        overrideProp: 'prop.',
      },
    },
    footer: {
      licence:
        'KvirnUI is licensed under the AGPL-3.0. Personal, hobby, research and open-source use also has a free permission.',
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
