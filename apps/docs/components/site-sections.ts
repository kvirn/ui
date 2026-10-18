import { messages } from '../messages/en.ts'

const text = messages.docs.nav
const groupText = text.componentGroups
const patternGroupText = text.patternGroups
const contentTypeGroupText = text.contentTypeGroups

export interface SitePage {
  href: string
  label: string
  /** The npm name of the separate package the component lives in, when it isn't `@kvirn-ui/react`. */
  ownPackage?: string
}

/** A page that a gallery card can show: the one-line job, written once and also the page's lead. */
export interface SummarisedPage extends SitePage {
  summary: string
}

export interface SiteGroup {
  /** The anchor of the group on the Components index, and the slug of its own page. */
  id: string
  label: string
  /** The group's own page. The sidebar links to it instead of listing the group's pages. */
  href?: string | undefined
  pages: readonly SitePage[]
}

export interface SummarisedGroup extends SiteGroup {
  pages: readonly SummarisedPage[]
}

export interface SiteSection {
  id: string
  label: string
  /** The section's index route, the first of `pages`. */
  href: string
  /** Every page of the section, its index first. A section without pages is not rendered. */
  pages: readonly SitePage[]
  /** Sidebar groups (docs-landing-and-header.md §3.1); the index page is listed outside them. */
  groups?: readonly SiteGroup[]
  /** The label of the index link in a topic's panel, when "All …" reads better than the section's name. */
  overviewLabel?: string | undefined
  /** The id of the topic whose panel lists this section as its last groups, instead of a menu item of its own. */
  menuParent?: string | undefined
  /** Whether the section's pages share a sidebar. Only Get started does (docs-shell-mega-menu.md §5.1). */
  sidebar?: boolean | undefined
  /** Work in progress: routable, but left out of every menu, the pager from other sections, search and the gallery. */
  hidden?: boolean | undefined
}

export interface SiteTool {
  id: string
  label: string
  href: string
  opensInNewTab?: boolean
}

const component = (
  label: string,
  slug: string,
  summary: string,
  ownPackage?: string,
): SummarisedPage => ({
  href: `/components/${slug}`,
  label,
  summary,
  ...(ownPackage === undefined ? {} : { ownPackage }),
})

/**
 * By purpose, docs-site.md §3. Labels are the page titles. A group's id is its slug under
 * `/components`, so none may equal a component's slug (`navigation` is the component).
 */
const componentGroupList: readonly SummarisedGroup[] = [
  {
    id: 'actions',
    label: groupText.actions,
    pages: [
      component(
        'Button',
        'button',
        'A button that does something, such as sending a form or saving a draft.',
      ),
      component(
        'ButtonGroup',
        'button-group',
        'A row of related buttons, such as the actions of a form or a card.',
      ),
      component(
        'CopyButton',
        'copy-button',
        'A button that copies a text to the clipboard, such as a case number.',
      ),
      component('Link', 'link', 'A link that goes to another page or place.'),
      component(
        'QuickExit',
        'quick-exit',
        'A link that takes a person off a sensitive page in one action and on to a neutral site you choose.',
      ),
      component(
        'Toolbar',
        'toolbar',
        'A row of related controls with one Tab stop and the arrow keys between them, so a keyboard user passes a long row of formatting buttons with a single Tab.',
      ),
    ],
  },
  {
    id: 'content',
    label: groupText.content,
    pages: [
      component(
        'Accordion',
        'accordion',
        'A list of questions or sections, each with a heading and a button that opens its answer.',
      ),
      component(
        'Address',
        'address',
        'Contact details for the page or the article around it, as the native address element.',
      ),
      component(
        'Alert',
        'alert',
        'A status message in the content: something people need to know now, or the result of what they just did.',
      ),
      component(
        'Badge',
        'badge',
        'A short status or category in words, such as “Granted” or “Draft”, drawn as a pill.',
      ),
      component(
        'Card',
        'card',
        'A container for one thing on the page, such as a service, a news item or a case.',
      ),
      component(
        'CodeBlock',
        'code-block',
        'A code sample or a command with a label and a copy button.',
      ),
      component(
        'Disclosure',
        'disclosure',
        'A button that shows and hides one panel of content, such as the opening hours or a longer explanation.',
      ),
      component(
        'Divider',
        'divider',
        'A line between two blocks, with its margin, width and colour set from CSS variables.',
      ),
      component(
        'Heading',
        'heading',
        'A heading with its element as a required prop and its look as an optional one.',
      ),
      component('Icon', 'icon', 'A small drawing that supports the text next to it.'),
      component('Kbd', 'kbd', 'A key name in running text, drawn as a key.'),
      component(
        'List',
        'list',
        'A short list of links or items, with or without bullets or numbers, as the native list.',
      ),
      component(
        'Progress',
        'progress',
        'Says that something is working and, when it is known, how far along.',
      ),
      component(
        'Prose',
        'prose',
        "Styles for text you don't control, with inset text, steps and figures.",
      ),
      component(
        'VisuallyHidden',
        'visually-hidden',
        'Text that screen reader users get and nobody sees.',
      ),
    ],
  },
  {
    id: 'layout',
    label: groupText.layout,
    pages: [
      component(
        'Container',
        'container',
        'A block that centres the page’s content and limits how wide it gets.',
      ),
      component(
        'Grid',
        'grid',
        'Columns and rows from one to twelve, or as many as fit, each changing at a breakpoint.',
      ),
      component(
        'ScrollArea',
        'scroll-area',
        'Holds content that may be wider or taller than its box, such as a wide table or a long code sample, and scrolls it with the browser’s own scrollbars.',
      ),
      component(
        'Section',
        'section',
        'A container for a region of the page, such as a sidebar or a band of content.',
      ),
      component(
        'Stack',
        'stack',
        'Its children one below the other, with an even space between them.',
      ),
    ],
  },
  {
    id: 'wayfinding',
    label: groupText.wayfinding,
    pages: [
      component(
        'Breadcrumb',
        'breadcrumb',
        'A named landmark with the trail from the start page down to the page you are on, so a resident sees where they are and can go up a level.',
      ),
      component(
        'Navigation',
        'navigation',
        'A named landmark around a list of links to pages, with the current page marked and an optional second level.',
      ),
      component(
        'Pagination',
        'pagination',
        'A named landmark with a list of links for moving through a long list page by page.',
      ),
      component(
        'SkipLink',
        'skip-link',
        'A link that is the first stop when you press Tab, so keyboard and screen reader users can jump past the header to the main content.',
      ),
      component(
        'SkipPanel',
        'skip-panel',
        'A list at the top of the page, shown when someone first presses Tab, with links that skip to the main content, the menu or the search, and the keyboard shortcuts the site offers.',
      ),
      component(
        'Stepper',
        'stepper',
        'Says where the user is in a multi-page form, as one line of text: “Step 2 of 5: Your vehicle”.',
      ),
      component(
        'TableOfContents',
        'table-of-contents',
        'The headings of a long page as a list of links, with the one the reader is in marked.',
      ),
      component(
        'Tabs',
        'tabs',
        'Tabs show one panel of content at a time, with a list of tabs to switch between them.',
      ),
      component(
        'TopBar',
        'top-bar',
        'A slim bar above the site header with a line of text at the start and a navigation of tools at the end, such as the language or contact.',
      ),
    ],
  },
  {
    id: 'forms',
    label: groupText.forms,
    pages: [
      component(
        'AddressInput',
        'address-input',
        'A postal address in separate boxes (street, line 2, postal code and city), each with its autofill purpose set.',
      ),
      component('Autocomplete', 'autocomplete', 'A text field that suggests as the user types.'),
      component(
        'Checkbox',
        'checkbox',
        'One yes-or-no answer, such as a declaration or a consent.',
      ),
      component(
        'CheckboxGroup',
        'checkbox-group',
        'One question with several answers that can all be true, such as how a resident wants to be contacted.',
      ),
      component(
        'Combobox',
        'combobox',
        'A text field with a list of options that shrinks as the user types, for choosing one option or several from a long list.',
      ),
      component(
        'DateInput',
        'date-input',
        'A date answered with three text boxes: day, month and year, in the order the region writes dates in.',
      ),
      component(
        'DatePicker',
        'date-picker',
        'A button after a typed date that opens a modal dialog with a Calendar.',
      ),
      component(
        'DateRangePicker',
        'date-range-picker',
        'One button after a From and a To date that opens a modal dialog with a range Calendar.',
      ),
      component(
        'ErrorSummary',
        'error-summary',
        'All the problems of a failed submit in one place at the top of the form, each a link to its field.',
      ),
      component(
        'Field',
        'field',
        'One form question: it joins a control to its visible label, an optional description, a help text and an error, so people hear them when the control gets focus.',
      ),
      component(
        'Fieldset',
        'fieldset',
        'A native fieldset that groups related questions, or the controls of one question, under a legend that names the group.',
      ),
      component('FileUpload', 'file-upload', 'Attach files to a form.'),
      component(
        'InputGroup',
        'input-group',
        'The box around an input and what sits inside it: a unit, an icon or a button such as clear.',
      ),
      component(
        'Listbox',
        'listbox',
        'A list of options that opens from a box, for choosing one option or several.',
      ),
      component('NumberInput', 'number-input', 'A box for a quantity or an amount.'),
      component(
        'OneTimeCode',
        'one-time-code',
        'A field for a code sent to the user by text message, email or an authenticator app.',
      ),
      component(
        'PhoneInput',
        'phone-input',
        'A box for a phone number, with an optional select for the country calling code.',
      ),
      component(
        'RadioGroup',
        'radio-group',
        'One question with exactly one answer, such as how long a permit should last.',
      ),
      component(
        'RichTextEditor',
        'rich-text-editor',
        'A formatted text box with a toolbar, for text that will be published or sent, such as a news item or a case description in a staff tool.',
        '@kvirn-ui/rich-text',
      ),
      component(
        'Slider',
        'slider',
        'One approximate number in a range, such as a search distance or a volume.',
      ),
      component(
        'Switch',
        'switch',
        'One setting that is on or off and takes effect at once, such as text message reminders on My pages.',
      ),
      component(
        'Textarea',
        'textarea',
        'A box for a longer answer, such as describing a situation or giving a reason.',
      ),
      component(
        'TextInput',
        'text-input',
        'A native text box for a short answer such as a name, an email address or a case number.',
      ),
    ],
  },
  {
    id: 'choice-and-overlays',
    label: groupText.choiceAndOverlays,
    pages: [
      component(
        'AlertDialog',
        'alert-dialog',
        'A dialog for a message that needs an answer: a confirmation before deleting, a warning that the session is about to end.',
      ),
      component(
        'Dialog',
        'dialog',
        'A window on top of the page that asks for the user’s attention: a form, a short read, a decision.',
      ),
      component('Menu', 'menu', 'A button that opens a short list of actions.'),
      component(
        'Popover',
        'popover',
        'A small panel that a button opens: a hint, a short form or a few controls.',
      ),
      component('Toast', 'toast', 'A short status message in the corner after something worked.'),
      component('Toggle', 'toggle', 'A button that is on or off, and says which.'),
      component(
        'Tooltip',
        'tooltip',
        'A short text next to a control that shows its name or a shortcut when the pointer rests on it or it has keyboard focus.',
      ),
    ],
  },
  {
    id: 'data-and-behaviour',
    label: groupText.dataAndBehaviour,
    pages: [
      component(
        'Announcer',
        'announcer',
        'The shared live regions that tell screen reader users something changed without moving focus.',
      ),
      component(
        'Calendar',
        'calendar',
        'A month as a grid of days, for choosing one date near today or, in range mode, a start and an end.',
      ),
      component(
        'DefinitionList',
        'definition-list',
        'Terms with their descriptions, and optionally a link to change each, as one native description list.',
      ),
      component(
        'Focus',
        'focus',
        'FocusScope and useFocus move focus into your own drawer or wizard step, can hold it there, and return it when the scope ends.',
      ),
      component(
        'Map',
        'map',
        'Places on a map and the same places as a list, with the keyboard and a button for every gesture.',
        '@kvirn-ui/map',
      ),
      component(
        'ReadAloud',
        'read-aloud',
        'A player that reads a region of the page aloud, one sentence at a time, with the browser’s own speech.',
      ),
      component(
        'Route focus',
        'route-focus',
        'A hook that moves focus to the page title after a client-side navigation, so keyboard and screen reader users start at the top of the new page instead of on a link that may be gone.',
      ),
      component('Table', 'table', 'A data table built on the native table elements.'),
    ],
  },
]

export const componentGroups: readonly SummarisedGroup[] = componentGroupList.map((group) => ({
  ...group,
  href: `/components/${group.id}`,
}))

export const componentPages = componentGroups.flatMap((group) => group.pages)

/** The pages that are a group's own page, between the index and the components. */
const componentGroupPages: readonly SitePage[] = componentGroups.map((group) => ({
  href: `/components/${group.id}`,
  label: group.label,
}))

const pattern = (label: string, slug: string, summary: string): SummarisedPage => ({
  href: `/patterns/${slug}`,
  label,
  summary,
})

/** The gallery groups of Patterns (component-gallery.md §3.2); a group without a page yet is hidden from the gallery. */
export const patternGroups: readonly SummarisedGroup[] = [
  {
    id: 'siteChrome',
    label: patternGroupText.siteChrome,
    pages: [
      pattern(
        'Application logo',
        'application-logo',
        'The link to the start page: the mark, the name as text and an optional slogan.',
      ),
      pattern(
        'Site header',
        'site-header',
        'The top of every page: the logo, the main menu, a search field and the language links.',
      ),
      pattern(
        'Main menu',
        'main-menu',
        'The main navigation: links, or topics that open lists of links.',
      ),
      pattern(
        'Site search',
        'site-search',
        'A search form with a labelled field and a button, in a search landmark.',
      ),
      pattern(
        'Language links',
        'language-links',
        'Links to the same page in other languages, each marked with its language.',
      ),
      pattern(
        'Site alert',
        'site-alert',
        'A notice on every page, such as a disruption, with an optional close button.',
      ),
      pattern(
        'Cookie consent',
        'cookie-consent',
        'A notice in the page flow where the visitor accepts or chooses cookies. It is not a dialog.',
      ),
      pattern(
        'Page frame',
        'page-frame',
        'The landmarks of a page: a skip link, the header, the main area and the footer.',
      ),
      pattern(
        'Site footer',
        'site-footer',
        'The bottom of every page: contact details and lists of links.',
      ),
      pattern(
        'Page header',
        'page-header',
        'The top of the main area: the breadcrumb, the page’s h1, a lead and a few facts.',
      ),
      pattern(
        'Page tools',
        'page-tools',
        'Buttons for reading the page aloud and copying its link, with the date it was last updated.',
      ),
    ],
  },
  {
    id: 'navigationAndPromotion',
    label: patternGroupText.navigationAndPromotion,
    pages: [
      pattern(
        'Hero',
        'hero',
        'A band at the top of the start page with the h1, a short lead and a link.',
      ),
      pattern(
        'Nav tiles',
        'nav-tiles',
        'A grid of tiles, each a heading and a link to one part of the site.',
      ),
      pattern(
        'Section nav',
        'section-nav',
        'The pages of one section as a list of links, folded into a button on narrow screens.',
      ),
      pattern(
        'Service link',
        'service-link',
        'A link to a digital service, with a note when the service is closed.',
      ),
    ],
  },
  { id: 'contentAndMedia', label: patternGroupText.contentAndMedia, pages: [] },
  {
    id: 'newsEventsAndNotices',
    label: patternGroupText.newsEventsAndNotices,
    pages: [],
  },
  { id: 'searchAndForms', label: patternGroupText.searchAndForms, pages: [] },
  { id: 'placesAndContacts', label: patternGroupText.placesAndContacts, pages: [] },
]

export const patternPages = patternGroups.flatMap((group) => group.pages)

const contentType = (label: string, slug: string, summary: string): SummarisedPage => ({
  href: `/content-types/${slug}`,
  label,
  summary,
})

/** The gallery of Content types (component-gallery.md §3.2): every page is a type, between the header and the footer. */
export const contentTypeGroups: readonly SummarisedGroup[] = [
  {
    id: 'page-types',
    label: contentTypeGroupText.pageTypes,
    pages: [
      contentType(
        'Start page',
        'start-page',
        'The front door of a site: a hero, the most common tasks, navigation tiles, news and a way to make contact.',
      ),
      contentType(
        'Subpage',
        'subpage',
        'A landing page for one area of the site: a preamble and tiles to the pages below it.',
      ),
      contentType(
        'Content page',
        'content-page',
        'A page that explains one thing, such as how to apply, with a contents list, steps, questions and a contact card.',
      ),
      contentType(
        'Documentation page',
        'documentation-page',
        'An article of the documentation, with the section’s pages beside it and its headings as a contents list.',
      ),
      contentType(
        'Unit page',
        'unit-page',
        'A page for one place, such as a library or a preschool: opening hours, address, how to get there and who to contact.',
      ),
      contentType(
        'Contact',
        'contact',
        'The ways to reach the municipality: phone, email and visiting hours, with the exceptions in words.',
      ),
    ],
  },
  {
    id: 'news-and-events',
    label: contentTypeGroupText.newsAndEvents,
    pages: [
      contentType(
        'News article',
        'news-article',
        'One news item with its date, an optional image and the text, and a link back to the list.',
      ),
      contentType(
        'News list',
        'news-list',
        'All news, newest first, as teasers in pages, with a link to each article.',
      ),
      contentType(
        'Event',
        'event',
        'One event: when and where, how to take part and how to get there, and a notice when it is cancelled or full.',
      ),
      contentType(
        'Event list',
        'event-list',
        'The upcoming events as teasers, with the applied filters shown and a message when nothing matches.',
      ),
    ],
  },
  {
    id: 'services-and-accounts',
    label: contentTypeGroupText.servicesAndAccounts,
    pages: [
      contentType(
        'Form page',
        'form-page',
        'A form for one task, under a header with no search and no menu, with an error summary first when answers are wrong.',
      ),
      contentType(
        'My pages',
        'my-pages',
        'A signed-in overview of a person’s cases, with the ones that need an answer first.',
      ),
      contentType(
        'Case detail',
        'case-detail',
        'One case: its status, what happens next and the documents, with a clear action when something is needed from the person.',
      ),
      contentType(
        'Session ended',
        'session-ended',
        'The page after signing out because of inactivity: what happened, whether the answers were kept and how to continue.',
      ),
      contentType(
        'Search results',
        'search-results',
        'The results of a search: the count, the filters, the hits and what to do when there are none.',
      ),
    ],
  },
  {
    id: 'policies-and-status',
    label: contentTypeGroupText.policiesAndStatus,
    pages: [
      contentType(
        'Accessibility statement',
        'accessibility-statement',
        'The statement the law requires: what does not work, how to report a problem and who enforces it.',
      ),
      contentType(
        'Privacy page',
        'privacy-page',
        'How personal data is handled: what is collected, why, for how long and what rights people have.',
      ),
      contentType(
        'Cookies page',
        'cookies-page',
        'What cookies the site uses and how to change the choice.',
      ),
      contentType(
        'Easy-to-read page',
        'easy-to-read-page',
        'A page in short sentences and plain words, for people who find ordinary text hard to read.',
      ),
      contentType(
        'Status pages',
        'status-pages',
        'Not found, server error and unavailable: what happened, what to do and where to go instead.',
      ),
    ],
  },
]

export const contentTypePages = contentTypeGroups.flatMap((group) => group.pages)

export const siteSections: readonly SiteSection[] = [
  {
    id: 'docs',
    label: text.sections.docs,
    href: '/docs',
    sidebar: true,
    pages: [
      { href: '/docs', label: text.getStarted },
      { href: '/foundation/kvirn-provider', label: text.kvirnProvider },
      { href: '/foundation/locales', label: text.locales },
      { href: '/foundation/rendering', label: text.rendering },
      { href: '/foundation/theming', label: text.sections.theming },
      { href: '/foundation/icons', label: text.sections.icons },
    ],
  },
  {
    id: 'components',
    label: text.sections.components,
    href: '/components',
    overviewLabel: text.allComponents,
    pages: [
      { href: '/components', label: text.allComponents },
      ...componentGroupPages,
      ...componentPages,
    ],
    groups: componentGroups,
  },
  {
    id: 'patterns',
    label: text.sections.patterns,
    href: '/patterns',
    menuParent: 'components',
    hidden: true,
    pages: [{ href: '/patterns', label: text.sections.patterns }, ...patternPages],
    groups: patternGroups,
  },
  {
    id: 'content-types',
    label: text.sections.contentTypes,
    href: '/content-types',
    menuParent: 'components',
    hidden: true,
    pages: [{ href: '/content-types', label: text.sections.contentTypes }, ...contentTypePages],
    groups: contentTypeGroups,
  },
  {
    id: 'icons',
    label: text.sections.icons,
    href: '/icons',
    pages: [{ href: '/icons', label: text.sections.icons }],
  },
]

export const accessibilitySettingsHref = '/accessibility-settings'

/**
 * The header's Tools navigation. No Storybook entry until a deployed URL exists (Plan 0099, Q3);
 * "Documentation" is the home page, never a second "Docs" (Q2).
 */
export const siteTools: readonly SiteTool[] = [
  {
    id: 'github',
    label: messages.docs.header.tools.github,
    href: 'https://github.com/kvirn/ui',
    opensInNewTab: true,
  },
  {
    id: 'accessibility-settings',
    label: messages.docs.header.accessibilitySettings,
    href: accessibilitySettingsHref,
  },
]

/** A section with no pages is not rendered, so the header never links to an empty section. */
export const renderedSections = (sections: readonly SiteSection[]) =>
  sections.filter((section) => section.pages.length > 0)

/** The sections the menus, the footer and the search list: a hidden one is reachable by URL only. */
export const listedSections = (sections: readonly SiteSection[]) =>
  renderedSections(sections).filter((section) => section.hidden !== true)

const withoutTrailingSlash = (pathname: string) =>
  pathname.length > 1 && pathname.endsWith('/') ? pathname.slice(0, -1) : pathname

/** The section that lists the page, or undefined on a page in none (the 404). */
export function findActiveSection(sections: readonly SiteSection[], pathname: string) {
  const path = withoutTrailingSlash(pathname)
  return sections.find((section) => section.pages.some((page) => page.href === path))
}

/** The Site nav's `aria-current`: `page` on the section's own index, `true` on any other page in it. */
export function sectionCurrent(
  section: SiteSection,
  activeSection: SiteSection | undefined,
  pathname: string,
) {
  if (section !== activeSection) {
    return undefined
  }
  return withoutTrailingSlash(pathname) === section.href ? 'page' : true
}

/** Only Get started keeps a sidebar: every other section is reached from the menu and the pager. */
export const hasSidebar = (section: SiteSection | undefined): section is SiteSection =>
  section?.sidebar === true && section.pages.length >= 2

/** `page` on the page's own link, for the links inside a topic's panel. */
export const pageCurrent = (pathname: string, href: string) =>
  withoutTrailingSlash(pathname) === href ? 'page' : undefined

/** What the pager can reach from a page: the section's leaf pages in menu order (docs-shell-mega-menu.md §5). */
const leafPages = (section: SiteSection): readonly SitePage[] =>
  section.groups === undefined ? section.pages : section.groups.flatMap((group) => group.pages)

/**
 * The previous and next page within the section's leaf pages. A section index, a group page and a
 * page in no section are not in the chain, so they get neither. It never crosses sections.
 */
export function pagerPages(sections: readonly SiteSection[], pathname: string) {
  const path = withoutTrailingSlash(pathname)
  const section = findActiveSection(sections, path)
  if (section === undefined) {
    return { previous: undefined, next: undefined }
  }
  const leaves = leafPages(section)
  const index = leaves.findIndex((page) => page.href === path)
  if (index === -1 || leaves.length < 2) {
    return { previous: undefined, next: undefined }
  }
  return { previous: leaves[index - 1], next: leaves[index + 1] }
}

/** Section index, then the group's own page if it has one, then the current page. */
export function breadcrumbTrail(sections: readonly SiteSection[], pathname: string): SitePage[] {
  const path = withoutTrailingSlash(pathname)
  const section = findActiveSection(sections, path)
  const current = section?.pages.find((page) => page.href === path)
  if (section === undefined || current === undefined) {
    return []
  }
  if (current.href === section.href) {
    return [{ href: section.href, label: section.label }]
  }
  const group = section.groups?.find(
    (candidate) =>
      candidate.href !== undefined && candidate.pages.some((page) => page.href === path),
  )
  return [
    { href: section.href, label: section.label },
    ...(group?.href === undefined ? [] : [{ href: group.href, label: group.label }]),
    current,
  ]
}
