import { messages } from '../messages/en.ts'

const text = messages.docs.nav
const groupText = text.componentGroups
const patternGroupText = text.patternGroups

export interface SitePage {
  href: string
  label: string
}

/** A page that a gallery card can show: the one-line job, written once and also the page's lead. */
export interface SummarisedPage extends SitePage {
  summary: string
}

export interface SiteGroup {
  /** The anchor of the group on the Components index. */
  id: string
  label: string
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
}

export interface SiteTool {
  id: string
  label: string
  href: string
  opensInNewTab?: boolean
}

const component = (label: string, slug: string, summary: string): SummarisedPage => ({
  href: `/components/${slug}`,
  label,
  summary,
})

/** By purpose, docs-site.md §3. Labels are the page titles. */
export const componentGroups: readonly SummarisedGroup[] = [
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
        'Heading',
        'heading',
        'A heading with its element as a required prop and its look as an optional one.',
      ),
      component('Icon', 'icon', 'A small drawing that supports the text next to it.'),
      component('Kbd', 'kbd', 'A key name in running text, drawn as a key.'),
      component(
        'Progress',
        'progress',
        'Says that something is working and, when it is known, how far along.',
      ),
      component(
        'Prose',
        'prose',
        'A container that sets headings, paragraphs, lists, links and tables for reading.',
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
        'Columns',
        'columns',
        'As many columns as fit, none narrower than you choose, and one column on a small screen.',
      ),
      component(
        'Container',
        'container',
        'A block that centres the page’s content and limits how wide it gets.',
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
        'SidebarLayout',
        'sidebar-layout',
        'A side column and a content column: stacked on a small screen, side by side on a wide one.',
      ),
      component(
        'Stack',
        'stack',
        'Its children one below the other, with an even space between them.',
      ),
    ],
  },
  {
    id: 'navigation',
    label: groupText.navigation,
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
    ],
  },
  {
    id: 'forms',
    label: groupText.forms,
    pages: [
      component(
        'Calendar',
        'calendar',
        'A month as a grid of days, for choosing one date near today or, in range mode, a start and an end.',
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
      component('NumberInput', 'number-input', 'A box for a quantity or an amount.'),
      component(
        'OneTimeCode',
        'one-time-code',
        'A field for a code sent to the user by text message, email or an authenticator app.',
      ),
      component(
        'Slider',
        'slider',
        'One approximate number in a range, such as a search distance or a volume.',
      ),
      component(
        'SummaryList',
        'summary-list',
        'Rows of a label, an answer and a link to change it, as one native description list.',
      ),
      component(
        'TextInput',
        'text-input',
        'A native text box for a short answer such as a name, an email address or a case number.',
      ),
      component(
        'Textarea',
        'textarea',
        'A box for a longer answer, such as describing a situation or giving a reason.',
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
        'Dialog',
        'dialog',
        'A window on top of the page that asks for the user’s attention: a form, a short read, a decision.',
      ),
      component(
        'Listbox',
        'listbox',
        'A list of options that opens from a box, for choosing one option or several.',
      ),
      component('Menu', 'menu', 'A button that opens a short list of actions.'),
      component(
        'Popover',
        'popover',
        'A small panel that a button opens: a hint, a short form or a few controls.',
      ),
      component(
        'RadioGroup',
        'radio-group',
        'One question with exactly one answer, such as how long a permit should last.',
      ),
      component(
        'Switch',
        'switch',
        'One setting that is on or off and takes effect at once, such as text message reminders on My pages.',
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
        'Focus',
        'focus',
        'FocusScope and useFocus move focus into your own drawer or wizard step, can hold it there, and return it when the scope ends.',
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

export const componentPages = componentGroups.flatMap((group) => group.pages)

/** The gallery groups of Patterns (component-gallery.md §3.2); items arrive with their pages (G5). */
export const patternGroups: readonly SiteGroup[] = [
  { id: 'siteChrome', label: patternGroupText.siteChrome, pages: [] },
  {
    id: 'navigationAndPromotion',
    label: patternGroupText.navigationAndPromotion,
    pages: [],
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

export const siteSections: readonly SiteSection[] = [
  {
    id: 'home',
    label: text.sections.home,
    href: '/',
    pages: [{ href: '/', label: text.sections.home }],
  },
  {
    id: 'docs',
    label: text.sections.docs,
    href: '/docs',
    pages: [
      { href: '/docs', label: text.getStarted },
      { href: '/foundation/kvirn-provider', label: text.kvirnProvider },
      { href: '/foundation/locales', label: text.locales },
      { href: '/foundation/rendering', label: text.rendering },
    ],
  },
  {
    id: 'components',
    label: text.sections.components,
    href: '/components',
    pages: [{ href: '/components', label: text.allComponents }, ...componentPages],
    groups: componentGroups,
  },
  {
    id: 'patterns',
    label: text.sections.patterns,
    href: '/patterns',
    pages: [{ href: '/patterns', label: text.sections.patterns }],
  },
  {
    id: 'content-types',
    label: text.sections.contentTypes,
    href: '/content-types',
    pages: [{ href: '/content-types', label: text.sections.contentTypes }],
  },
  {
    id: 'theming',
    label: text.sections.theming,
    href: '/foundation/theming',
    pages: [{ href: '/foundation/theming', label: text.sections.theming }],
  },
]

/**
 * The header's Tools navigation. No Storybook entry until a deployed URL exists (Plan 0099, Q3);
 * "Documentation" is the home page, never a second "Docs" (Q2).
 */
export const siteTools: readonly SiteTool[] = [
  { id: 'documentation', label: messages.docs.header.tools.docs, href: '/' },
  {
    id: 'github',
    label: messages.docs.header.tools.github,
    href: 'https://github.com/kvirn/ui',
    opensInNewTab: true,
  },
]

/** A section with no pages is not rendered, so the header never links to an empty section. */
export const renderedSections = (sections: readonly SiteSection[]) =>
  sections.filter((section) => section.pages.length > 0)

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

/** A sidebar is only worth its place with two or more pages to choose between. */
export const hasSidebar = (section: SiteSection | undefined): section is SiteSection =>
  section !== undefined && section.pages.length >= 2
