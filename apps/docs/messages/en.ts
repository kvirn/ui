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
      packages: {
        label: 'Packages',
        intro:
          'Most of KvirnUI is two packages you install above. Some parts ship on their own, so you add them only when you need them.',
        caption: 'KvirnUI packages',
        package: 'Package',
        purpose: 'What it is for',
        install: 'Install',
        withTheOthers: 'With the others',
        comesWithReact: 'Comes with @kvirn-ui/react',
        separate: 'Separate',
        andTiptap: 'and the Tiptap packages the page lists',
        andMapEngine: 'and a map engine',
        react: 'Hooks and components.',
        i18n: 'Messages in five languages.',
        theme: 'The default look, as one CSS file.',
        core: 'The behaviour and keyboard logic under the components.',
        map: 'A map and an address search.',
        richText: 'A text box with formatting, on Tiptap.',
        mapLink: 'Read about Map',
        richTextLink: 'Read about the rich text editor',
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
    patternsIndex: {
      title: 'Patterns',
      lead: 'Parts of a public-sector site built from the components: the site chrome, navigation and promotion. They are composed in Storybook and tested with axe in every theme.',
    },
    patterns: {
      builtFrom: 'Built from',
      builtFromLead: 'The native elements the pattern renders. You own the markup around it.',
      whatItLooksLike: 'What it looks like',
      elements: {
        'application-logo': ['A link', 'A decorative image', 'The name as text'],
        'site-header': [
          'A header landmark',
          'A navigation landmark with the main menu',
          'A Menu button on narrow screens',
          'A search form',
        ],
        'main-menu': [
          'A navigation landmark',
          'Buttons that open lists of links',
          'Links to pages, never a menu role',
        ],
        'site-search': ['A search landmark and form', 'A labelled search field', 'A submit button'],
        'language-links': ['A navigation landmark', 'A list of links, each with its language'],
        'site-alert': ['A named region', 'A title, text and links', 'An optional close button'],
        'cookie-consent': [
          'A named region in the page flow, not a dialog',
          'Buttons to accept and to choose',
          'A link to the policy',
        ],
        'page-frame': ['A skip link', 'A header, a main and a footer landmark'],
        'site-footer': [
          'A footer landmark',
          'An address',
          'Navigation landmarks with lists of links',
        ],
        'page-header': [
          'The page’s h1 and a lead',
          'A breadcrumb you pass in',
          'A definition list',
        ],
        'page-tools': ['Buttons to read aloud and to copy', 'A time element for the last update'],
        hero: ['A band with the page’s h1', 'A lead', 'A link', 'A decorative image'],
        'nav-tiles': ['A list of tiles', 'A heading and a link in each', 'A short text'],
        'section-nav': [
          'A button that opens and closes the list',
          'A navigation landmark with a list of links',
        ],
        'service-link': ['A link in the service look', 'A closed state as inset text'],
      },
    },
    contentTypes: {
      whatIsOnIt: 'What is on it',
      whereItSits: 'Where it sits',
      example: {
        siteName: 'Content type example – Kvirnby (fictional municipality) – KvirnUI',
        title: ({ page }: { page: string }) =>
          `${page} example – Kvirnby (fictional municipality) – KvirnUI`,
        notice: 'Kvirnby is a fictional municipality. This page is a KvirnUI example.',
        back: 'Back to the documentation',
        open: 'See a full-page example',
      },
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
        'unit-page': [
          'The unit’s h1 and a short description',
          'Opening hours and the address, with the building’s access facts',
          'A notice when the unit is temporarily closed',
          'A contact card',
        ],
        contact: [
          'The page’s h1 and a preamble',
          'Contact cards for phone, email and visits',
          'Opening hours, with a holiday notice when it applies',
          'A closed phone line explained, with another way to get help',
        ],
        'news-article': [
          'The article’s h1, the date published and, if changed, updated',
          'An image with a description, when there is one',
          'The text',
          'A link to all news',
        ],
        'news-list': [
          'The page’s h1 and the number of items',
          'Teasers with a heading, a date and an introduction',
          'Pagination between the pages',
          'A message when there is no news',
        ],
        event: [
          'The event’s h1, date, time and place',
          'A notice for a cancelled, ended or fully booked event',
          'How to sign up',
          'Address and access facts, and a contact card',
        ],
        'event-list': [
          'The page’s h1 and the number of events',
          'Filters, with the applied ones as removable tags',
          'Teasers with a heading, a date and a place',
          'A message when no event matches',
        ],
        'form-page': [
          'The page’s h1 and what happens next',
          'An error summary first in the page, when there are errors',
          'Fields with labels, help and errors',
          'A submit button, and a message when sending failed or worked',
        ],
        'my-pages': [
          'The page’s h1',
          'Cases that need an action, first',
          'The other cases, with their status in words',
          'A message when there are no cases',
        ],
        'case-detail': [
          'The case’s h1 and its status in words',
          'What is needed from the person, first',
          'The steps so far, as a list',
          'Documents and a contact card',
        ],
        'session-ended': [
          'The page’s h1 and what happened',
          'Whether the answers were saved',
          'A button to sign in again',
          'Where to get help',
        ],
        'search-results': [
          'The page’s h1 with the search words and the count',
          'Filters, with the applied ones shown',
          'Results with a heading, a type and an excerpt',
          'Pagination, and tips when there are no results',
        ],
        'accessibility-statement': [
          'The page’s h1 and the compliance status',
          'What is not accessible, and why',
          'How to report a problem',
          'The enforcement body, by country',
        ],
        'privacy-page': [
          'The page’s h1 and a contents list',
          'What is collected, and the legal basis',
          'Retention and sharing',
          'Rights and who to contact',
        ],
        'cookies-page': [
          'The page’s h1',
          'The cookies in use, as a table',
          'How to change or withdraw the choice',
          'A contact card',
        ],
        'easy-to-read-page': [
          'The page’s h1',
          'Short sentences, one idea each',
          'Headings that say what comes next',
          'A contact card',
        ],
        'status-pages': [
          'The page’s h1 saying what happened',
          'What the person can do now',
          'Links to the start page and to search',
          'A contact card',
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
    backToTop: 'Back to top',
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
      ownPackage: 'Separate package',
      ownPackageNote: 'Add it only if you need it, with its own install step.',
      ownPackageReadMore: 'Read more',
      ownPackageReadMoreHidden: 'about separate packages',
      sidebarButton: ({ section }: { section: string }) => `Pages in ${section}`,
      sections: {
        docs: 'Get started',
        components: 'Components',
        patterns: 'Patterns',
        contentTypes: 'Content types',
        theming: 'Theming',
        icons: 'Icons',
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
        newsAndEvents: 'News and events',
        servicesAndAccounts: 'Services and accounts',
        policiesAndStatus: 'Policies and status',
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
        // kv-lang-ok: a language is named in its own language
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
    },
    /** The sections built from a component's accessibility contract (docs-component-page.md §2, §4). */
    contract: {
      sections: {
        accessibility: 'Accessibility',
        keyboard: 'Keyboard',
        knownIssues: 'Known issues',
        announcements: 'Announcements',
      },
      accessibility: {
        whatItDoes: 'What it does for you',
        whatYouNeedToDo: 'What you need to do',
        focus: 'Focus management',
        visual: 'Visual and modes',
        testing: 'Testing',
        testingIntro:
          'The automated tests prove the keyboard behaviour, the names and states, and that axe finds no violations in every story and theme. A row passes only when an automated agent check and a person on the real assistive technology have both checked it. "agent-verified" means automated tests in the repository (with a virtual screen reader for the screen reader rows), not the real assistive technology.',
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
        readAloudHeading: 'What a screen reader reads',
        readAloudState: 'State or action',
        readAloudPhrases: 'Read aloud',
        readAloudTest: 'Test',
        overrideHeading: 'Change the text',
        overrideWholeApp: 'For your whole app, pass',
        overrideTo: 'to',
        overrideOne: ({ component }: { component: string }) => `For one ${component}, pass its`,
        overrideProp: 'prop.',
      },
    },
    footer: {
      licence:
        'KvirnUI is free for personal use. Any other production use needs a commercial licence.',
      claim:
        'KvirnUI is designed to meet WCAG 2.2 AA, and tested automatically and by keyboard. Testing with assistive technology is pending.',
      claimLink: 'What this means',
      noTracking:
        'This site uses no cookies or analytics. A message sent from the contact form goes through an email service.',
      sectionsHeading: 'Sections',
      projectHeading: 'Project',
      status: ({ status }: { status: string }) => `Status: ${status}`,
      privacy: 'Privacy',
      contact: 'Contact',
    },
    privacyPage: {
      title: 'Privacy',
      lead: 'What this site does with your data, in plain words. Short version: almost nothing.',
      // TODO(legal-verify): postal address and organisation number for the controller (Art. 13(1)(a)).
      controller: {
        label: 'Who is responsible',
        body: 'Magnus Vike, a sole trader in Sweden, is responsible for this site.',
        emailPrefix: 'Email:',
      },
      doesNot: {
        label: 'What this site does not do',
        body: 'It sets no cookies. It has no analytics. Your browser makes no requests to other companies, except when you press the button on the Map page that loads map pictures (see Map pictures). The fonts are served from this site.',
      },
      device: {
        label: 'What is stored on your device',
        // Verified against packages/core/src/theme (theme-constants.ts, theme-store.ts): key `kvirn-ui:theme`, JSON of the axes that differ from the defaults, removed when all are default.
        // The reference service demo keeps its demo answers in sessionStorage (apply-answers.tsx).
        body: 'When you choose a colour scheme, contrast or motion setting, this site saves it in your browser in localStorage, under the name kvirn-ui:theme. Nothing is saved until you choose. Choosing the default again removes it. The setting is never sent to us.',
        reference:
          'The example service in the reference section keeps the answers you type in your browser for the current tab only. They are not sent anywhere and are gone when you close the tab.',
      },
      logs: {
        label: 'Server logs',
        // TODO(legal-verify): retention period of the host's logs, and the data processing agreement with Vercel.
        body: 'The site is hosted by Vercel, who act as our processor. Vercel logs your IP address, the time, the address you asked for and your browser. This is used for security and to run the site. Our legal basis is legitimate interest (GDPR Article 6(1)(f)). Vercel keeps the logs for a short period that it sets.',
      },
      // TODO(legal-verify): Resend data processing agreement, the sending region and Resend's retention of message content and delivery logs.
      mail: {
        label: 'Email sending',
        body: 'We use Resend (resend.com) to send the email that the contact form creates. When you send the form, our server passes your name, email address, the topic and your message to Resend, which delivers it to our inbox. Resend acts as our processor. Your browser makes no request to Resend, and we do not use Resend for anything else, such as newsletters or tracking.',
        legalBasis: 'Our legal basis is legitimate interest (GDPR Article 6(1)(f)): answering you.',
        link: 'Resend privacy policy',
        linkHref: 'https://resend.com/legal/privacy-policy',
      },
      maps: {
        label: 'Map pictures',
        body: 'The examples on the Map page show a plain background and make no request. When you press “Load map pictures”, your browser asks the OpenStreetMap tile servers (tile.openstreetmap.org, run by the OpenStreetMap Foundation) for the map pictures. They receive your IP address, your browser details and the area you view. If you then choose the Satellite map type, the same goes to Esri (server.arcgisonline.com), and for Terrain to OpenTopoMap (tile.opentopomap.org). Nothing is requested before you press the button, and we receive nothing from it.',
      },
      email: {
        label: 'When you email us or use the contact form',
        // TODO(legal-verify): confirm the retention wording and whether any longer limit applies.
        body: 'We use your address and your message to answer you. We keep them for as long as the conversation needs, then delete them. Our legal basis is legitimate interest (GDPR Article 6(1)(f)).',
        form: 'The contact form sends your name, email address, the topic and your message to us as an email. How that email is sent is described under Email sending.',
      },
      rights: {
        label: 'Your rights',
        body: 'You can ask us for access to your data, and for it to be corrected, erased or restricted. You can object to how we use it. You can also complain to the Swedish supervisory authority, Integritetsskyddsmyndigheten (IMY).',
        imy: 'imy.se',
        imyHref: 'https://www.imy.se/',
      },
      updated: { label: 'Last updated', date: '2026-10-14' },
    },
    contactPage: {
      title: 'Contact',
      lead: 'Write to us in the form, or by email. One person reads it and answers it.',
      // TODO(legal-verify): maintainer to add a reply time if one can be promised. None is stated now.
      form: {
        label: 'Send us a message',
        nameLabel: 'Your name',
        emailLabel: 'Your email address',
        emailHelp: 'We use it only to answer you.',
        reasonLegend: 'What is it about',
        messageLabel: 'Your message',
        send: 'Send message',
        sending: 'Sending your message',
        honeypotLabel: 'Leave this field empty',
        nameError: 'Write your name',
        nameTooLong: ({ max }: { max: number }) => `Write a name of at most ${max} characters`,
        emailError: 'Write your email address, for example name@example.com',
        reasonError: 'Choose what it is about',
        messageError: 'Write your message',
        messageTooLong: ({ max }: { max: number }) =>
          `Shorten the message to at most ${max} characters`,
        sentHeading: 'Your message is sent',
        sentBody: 'We have sent it. Your address is only used to answer you.',
        failedEmail: ({ email }: { email: string }) =>
          `We could not send your message. Email us at ${email} instead.`,
        tooMany: 'You have sent several messages in a short time. Try again later, or email us.',
      },
      address: {
        label: 'Our email address',
        prefix: 'You can also write to',
        link: 'Email magnus@vike.se',
      },
      handling: {
        label: 'What happens to your message',
        // TODO(legal-verify): the same wording as privacyPage.email once the Resend DPA, region and retention are confirmed.
        body: 'The form sends your name, address and message from our server to an email service, Resend, which delivers it to our inbox. Nothing is sent from your browser to anyone else, and we store nothing but the email we receive.',
        privacyLink: 'How we handle your message',
      },
    },
    pager: {
      label: 'Previous and next page',
      previous: 'Previous page',
      next: 'Next page',
    },
    facts: {
      package: 'Package',
      pattern: 'Pattern',
    },
    icons: {
      seeAll: ({ count }: { count: number }) => `See all ${count} icons`,
      allLead: ({ count }: { count: number }) =>
        `Search ${count} icons by name or by what they mean, and copy the import line.`,
      howToUse: 'How to use icons',
      notDone: 'The icons are not fully reviewed yet.',
      notDoneLink: 'What is not done yet',
      searchRegion: 'Icons',
      searchLabel: 'Search the icons',
      searchHelp: 'Search by name, other names or meaning, such as “bus”, “payment” or “warning”.',
      categoryLabel: 'Category',
      allCategories: 'All categories',
      submit: 'Show icons',
      clear: 'Clear the search',
      count: ({
        count,
        query,
        category,
      }: {
        count: number
        query: string
        category: string | undefined
      }) => {
        const icons = count === 1 ? '1 icon' : `${count} icons`
        const inCategory = category === undefined ? '' : ` in ${category}`
        if (query === '') {
          return `${icons}${inCategory}`
        }
        return `${icons}${inCategory} ${count === 1 ? 'matches' : 'match'} “${query}”`
      },
      noMatch: ({ query, category }: { query: string; category: string | undefined }) =>
        category === undefined
          ? `No icons match “${query}”`
          : `No icons in ${category} match “${query}”`,
      noMatchHelp: 'Check the spelling, or try a word for what the icon is for.',
      allCategoriesLink: 'Search all categories',
      request: 'Missing an icon? Tell us which one you need.',
      importLabel: 'Import:',
      copy: 'Copy',
      copyHidden: ({ importName }: { importName: string }) => ` import ${importName}`,
      aliases: ({ list }: { list: string }) => `Also called: ${list}`,
      flips: 'Flips in right-to-left text.',
      label: ({ label }: { label: string }) => `Translated label: “${label}”`,
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
