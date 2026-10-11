// Docs site shell and template strings (docs/design/docs-site.md §4). The site copy is English
// for now, keyed so it can be translated later. Library strings live in @kvirn-ui/i18n.

export const messages = {
  docs: {
    meta: {
      title: ({ page }: { page: string }) => `${page} – KvirnUI`,
      homeTitle: 'KvirnUI – accessible React components for public services',
      description:
        'Headless, accessible React components for public services in the Nordics and the EU.',
    },
    contents: {
      heading: 'On this page',
      anchor: ({ label }: { label: string }) => `Link to ${label}`,
    },
    getStartedPage: {
      lead: 'Accessible React components for public services in the Nordics and the EU. You write the markup and styles. KvirnUI gives you the behaviour, keyboard support and screen reader support, designed and tested to meet WCAG 2.2 AA.',
      status:
        'This is a pre-alpha version. The API will change. Don’t use KvirnUI in a live service yet.',
      whatYouGet: {
        label: 'What you get',
        body: 'Behaviour, keyboard support and screen reader support in five languages. You keep the markup and the styles.',
      },
      components: { label: 'Components', readAboutButton: 'Read about Button' },
      startHere: {
        label: 'Start here',
        installation: 'Installation',
        themeBefore: 'For the default look, also add',
        themeMiddle: 'and import',
        themeAfter:
          'once, for example in your root layout. Every component is then styled. Remove the import, and it’s unstyled again: KvirnUI never loads CSS for you.',
        themingLink: 'Theming',
        themingAfter: 'shows how to change it.',
        importHint: 'Each component page shows the import it needs.',
      },
      whatWcagMeans: {
        label: 'What “designed and tested to meet WCAG 2.2 AA” means',
        body: 'Every component is tested automatically and reviewed for accessibility. Whether your service meets WCAG 2.2 AA depends on how you build and test the whole service.',
      },
    },
    componentsIndex: {
      title: 'Components',
      lead: ({ count }: { count: number }) =>
        `${count} components and hooks, grouped by what they do. Each page shows an example, the keyboard contract and the API.`,
    },
    contentTypesIndex: {
      title: 'Content types',
      lead: 'Every page has the same shell: the skip link, the site header, the site alert and the footer. A content type is everything in between, and nothing else.',
    },
    contentTypes: {
      whatIsOnIt: 'What is on it',
      whereItSits: 'Where it sits',
      shell: ({ name }: { name: string }) =>
        `The ${name} is only the part between the header and the footer. The skip link, the site header, the site alert and the footer belong to the shell and are the same on every page.`,
      blocks: {
        'start-page': [
          'A hero with the page’s h1 and a short lead',
          'The most common tasks as a list of links',
          'Navigation tiles to the main services',
          'News and events as teasers, with a link to all of them',
          'A contact card',
        ],
        subpage: [
          'The page’s h1 and a preamble',
          'Navigation tiles to the pages below it',
          'A list of shortcut links',
          'One teaser for what is new',
          'A contact card',
        ],
        'content-page': [
          'The page’s h1 and a preamble',
          'A contents list of the page’s headings',
          'Rich text with headings, steps and a link to the service',
          'Frequently asked questions as an accordion',
          'A contact card and related pages',
        ],
        'documentation-page': [
          'The page’s h1 and a lead',
          'A side column with the pages of the section',
          'An article with an example, use cases and the accessibility contract',
          'The headings of the article as a contents list',
          'Links to the previous and the next page',
        ],
      },
    },
    header: {
      home: 'KvirnUI',
      status: 'Pre-alpha',
      navLabel: 'Site',
      toolsLabel: 'Tools',
      latest: ({ status }: { status: string }) => `Latest: ${status}`,
      tools: { github: 'GitHub' },
      searchLabel: 'Search the documentation',
      searchButton: 'Search',
    },
    nav: {
      menuButton: 'Menu',
      sidebarButton: ({ section }: { section: string }) => `Pages in ${section}`,
      sections: {
        home: 'Home',
        docs: 'Docs',
        components: 'Components',
        patterns: 'Patterns',
        contentTypes: 'Content types',
        theming: 'Theming',
      },
      getStarted: 'Get started',
      allComponents: 'All components',
      overview: 'Overview',
      kvirnProvider: 'KvirnProvider',
      locales: 'Locales and strings',
      rendering: 'Rendering: server and client',
      componentGroups: {
        actions: 'Actions',
        content: 'Content',
        layout: 'Layout',
        navigation: 'Wayfinding',
        forms: 'Forms',
        choiceAndOverlays: 'Choice and overlays',
        dataAndBehaviour: 'Data and behaviour',
      },
      contentTypeGroups: {
        pageTypes: 'Page types',
      },
      patternGroups: {
        siteChrome: 'Site chrome',
        navigationAndPromotion: 'Navigation and promotion',
        contentAndMedia: 'Content and media',
        newsEventsAndNotices: 'News, events and notices',
        searchAndForms: 'Search and forms',
        placesAndContacts: 'Places and contacts',
      },
    },
    /** The note the docs pass to Display settings as a child: the component has none of its own. */
    display: {
      storageNote:
        "We save your choice in this browser only. We don't use cookies or send it anywhere.",
    },
    status: {
      label: 'Status',
      planned: 'Planned',
      inPlanning: 'In planning',
      inProgress: 'In progress',
      alphaCandidate: 'Alpha candidate',
      alpha: 'Alpha',
      beta: 'Beta',
      stable: 'Stable',
      plannedText: 'Not built yet.',
      inPlanningText:
        "Being planned, or paused. Its API and behaviour can still change, and it is not ready for review. Don't use it in a live service.",
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
    },
    example: {
      languages: {
        sv: 'Svenska',
        fi: 'Suomi',
        nb: 'Norsk bokmål',
        nn: 'Norsk nynorsk',
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
        allLanguages: 'The text in all five languages',
        overrideHeading: 'Change the text',
        overrideWholeApp: 'For your whole app, pass',
        overrideTo: 'to',
        overrideOne: ({ component }: { component: string }) => `For one ${component}, pass its`,
        overrideProp: 'prop.',
      },
    },
    footer: {
      licence: 'KvirnUI is free for personal use. Any other use needs a commercial licence.',
      claim:
        'KvirnUI is designed and tested to meet WCAG 2.2 AA. Whether your service meets it depends on how you build and test the whole service.',
      noTracking: 'This site uses no cookies, analytics or third-party services.',
    },
    search: {
      title: 'Search',
      heading: 'Search the documentation',
      hint: 'Write a word in the search field to find a page by its title or what it is for.',
      resultsFor: ({ query, count }: { query: string; count: number }) =>
        count === 1 ? `1 page for “${query}”` : `${count} pages for “${query}”`,
      noResults: 'No page matches. Try a shorter word, or look through the Components.',
    },
    notFound: {
      title: 'Page not found',
      heading: 'Page not found',
      body: 'Check the web address. If you followed a link on this site, the page may have moved.',
      homeLink: 'Go to the home page',
    },
  },
} as const

export type DocsMessages = typeof messages.docs
