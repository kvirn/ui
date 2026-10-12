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
    noScript:
      'JavaScript is off. The page works, but dark mode, more contrast and the interactive examples need JavaScript.',
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
      groupLead: ({ count }: { count: number }) =>
        `${count} components and hooks. Each page shows an example, the keyboard contract and the API.`,
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
      accessibilitySettings: 'Accessibility settings',
      searchLabel: 'Search the documentation',
      searchButton: 'Search',
    },
    skipLinks: { navigation: 'Skip to site navigation' },
    /** Text in `**double asterisks**` is a menu or button name, shown in bold. */
    accessibility: {
      lead: 'Choose how this site looks, and find the keys and browser settings that make it easier to read and use.',
      display: {
        heading: 'Display',
        intro: 'Your choice changes this page straight away, so you can see it before you go on.',
        system:
          '**Same as my device** follows the setting on your phone or computer, and changes when it does.',
        systemWhere: 'Where to find it:',
        contrast: '**High** contrast makes text, borders and focus rings stronger.',
        motion: '**Less motion** turns off animations and moving transitions on this site.',
        contrastThemes:
          "If you use a contrast theme in Windows, your device's colours replace the choices here.",
        noScript:
          "These choices need JavaScript, which is off in your browser. The site is shown light, with standard contrast. You can still zoom, and a Windows contrast theme replaces the site's colours: see",
        noScriptLink: 'Zoom and text size',
      },
      keyboard: {
        heading: 'Keyboard',
        intro: 'You can use the whole site with a keyboard. These keys work on every page.',
        tableLabel: 'Keys that work on every page',
        keyColumn: 'Key',
        actionColumn: 'What it does',
        rows: [
          {
            keys: [['tab'], ['shift', 'tab']],
            action: 'Go to the next or the previous link, button or field.',
          },
          { keys: [['enter']], action: 'Follow a link or press a button.' },
          {
            keys: [['space']],
            action: 'Press a button or choose an option. Elsewhere, scroll down.',
          },
          {
            keys: [['arrows']],
            action: 'Move and choose in a group of options, such as Display. Elsewhere, scroll.',
          },
          {
            keys: [['enter'], ['space']],
            action:
              'On Menu and on the buttons that open the pages of a section: open and close. They open in the page.',
          },
          { keys: [['escape']], action: 'Close an open menu topic and go back to its button.' },
          {
            keys: [
              ['ctrl', 'F'],
              ['command', 'F'],
            ],
            action: 'Find on this page.',
          },
          {
            keys: [
              ['ctrl', 'L'],
              ['command', 'L'],
            ],
            action: 'Go to the address bar.',
          },
          {
            keys: [['ctrl', 'K']],
            action: 'Go to the search box. On a Mac, press Command and K instead.',
          },
        ],
        noShortcuts:
          'This site has no single-key shortcuts, so typing, speech input and screen reader keys never set anything off by accident. The search shortcut always needs a modifier key.',
        componentsBefore:
          'Each component page has a Keyboard section with every key that component uses. Start at',
        componentsLink: 'Components',
      },
      keys: {
        and: 'and',
        or: 'or',
        tab: 'Tab',
        shift: 'Shift',
        enter: 'Enter',
        space: 'Space',
        escape: 'Escape',
        ctrl: 'Ctrl',
        command: 'Command',
        option: 'Option',
        arrows: 'Arrow keys',
      },
      skip: {
        heading: 'Skip links',
        body: 'Press Tab once when a page opens. A link appears at the top: Skip to main content. Press Tab again for Skip to site navigation. Press Enter to jump.',
      },
      zoom: {
        heading: 'Zoom and text size',
        intro:
          'Your browser can make every page bigger. The content moves into fewer columns as you zoom in. If you have to scroll sideways to read a sentence, or something is cut off, please tell us.',
        page: 'Zoom the whole page',
        textOnly: 'Make only the text bigger',
        touch: 'On a phone or tablet',
        tableLabel: 'Keys for zooming the page',
        actionColumn: 'Action',
        windowsColumn: 'Windows, Linux and ChromeOS',
        macColumn: 'Mac',
        rows: [
          { action: 'Zoom in', windows: ['ctrl', '+'], mac: ['command', '+'] },
          { action: 'Zoom out', windows: ['ctrl', '−'], mac: ['command', '−'] },
          { action: 'Back to 100%', windows: ['ctrl', '0'], mac: ['command', '0'] },
        ],
        usKeyboard: 'On a US keyboard, use the = key for +.',
        wheel:
          'You can also hold Ctrl (Command on a Mac) and turn the mouse wheel, or pinch on a trackpad.',
        firefox:
          'Firefox: open **View**, then **Zoom**, then turn on **Zoom Text Only**. Press Alt to show the menu on Windows.',
        defaultSize:
          'Every browser: change the default font size in its settings, under **Appearance** or **Fonts**. This site follows it.',
        safari: 'Safari on a Mac: Option, Command and + makes only the text bigger.',
        ios: 'iPhone and iPad: in Safari, tap the page menu (**aA**) beside the address, then the bigger A. For every app: **Settings**, then **Accessibility**, then **Display & Text Size**.',
        android:
          'Android: pinch with two fingers, or open **Settings**, then **Accessibility**, then **Display size and text**, then **Font size**. Names differ between phone makers.',
      },
      device: {
        heading: 'Settings on your device',
        intro:
          'Change these once and every site that follows your device changes too. Menu names change between versions: if you can’t find one, search your settings for “dark”, “contrast” or “animation”.',
        labels: {
          dark: 'Dark mode',
          contrast: 'More contrast',
          motion: 'Less motion',
          text: 'Text size',
        },
        systems: [
          {
            name: 'Windows',
            dark: 'Open **Settings**, then **Personalization**, then **Colors**, then **Choose your mode**.',
            contrast: 'Open **Settings**, then **Accessibility**, then **Contrast themes**.',
            motion:
              'Open **Settings**, then **Accessibility**, then **Visual effects**, then turn off **Animation effects**.',
            text: 'Open **Settings**, then **Accessibility**, then **Text size**.',
          },
          {
            name: 'Mac',
            dark: 'Open **System Settings**, then **Appearance**.',
            contrast:
              'Open **System Settings**, then **Accessibility**, then **Display**, then turn on **Increase contrast**.',
            motion:
              'Open **System Settings**, then **Accessibility**, then **Display**, then turn on **Reduce motion**.',
            text: 'Open **System Settings**, then **Accessibility**, then **Display**, then **Text size**.',
          },
          {
            name: 'iPhone and iPad',
            dark: 'Open **Settings**, then **Display & Brightness**.',
            contrast:
              'Open **Settings**, then **Accessibility**, then **Display & Text Size**, then turn on **Increase Contrast**.',
            motion:
              'Open **Settings**, then **Accessibility**, then **Motion**, then turn on **Reduce Motion**.',
            text: 'Open **Settings**, then **Accessibility**, then **Display & Text Size**, then **Larger Text**.',
          },
          {
            name: 'Android',
            note: 'Names differ between phone makers.',
            dark: 'Open **Settings**, then **Display**, then **Dark theme**.',
            contrast:
              'Open **Settings**, then **Accessibility**, then **Display size and text**, then **High contrast text**.',
            motion:
              'Open **Settings**, then **Accessibility**, then **Color and motion**, then turn on **Remove animations**.',
            text: 'Open **Settings**, then **Accessibility**, then **Display size and text**, then **Font size**.',
          },
        ],
        moreBefore: 'More ways to set up a computer or a phone:',
        moreLink: 'My Computer My Way, from AbilityNet',
      },
      report: {
        heading: 'Report a problem',
        body: 'KvirnUI is designed and tested to meet WCAG 2.2 AA. Testing by people with assistive technology is still pending, so you may find problems.',
        statusLink: 'See the project status',
        action: 'Report a problem on GitHub',
        privacy: 'GitHub issues are public, so don’t include personal information.',
        emailBefore: 'No GitHub account, or want to write privately? Email',
        email: 'support@kvirn.com',
      },
    },
    nav: {
      menuButton: 'Menu',
      sidebarButton: ({ section }: { section: string }) => `Pages in ${section}`,
      sections: {
        docs: 'Get started',
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
        wayfinding: 'Wayfinding',
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
      sectionsHeading: 'Sections',
      projectHeading: 'Project',
      status: ({ status }: { status: string }) => `Status: ${status}`,
    },
    pager: {
      label: 'Previous and next page',
      previous: 'Previous page',
      next: 'Next page',
    },
    facts: {
      package: 'Package',
      pattern: 'Pattern',
      atTesting: 'Testing with assistive technology',
      pending: 'Pending',
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
