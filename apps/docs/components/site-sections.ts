import { messages } from '../messages/en.ts'

const text = messages.docs.nav
const groupText = text.componentGroups

export interface SitePage {
  href: string
  label: string
}

export interface SiteGroup {
  /** The anchor of the group on the Components index. */
  id: string
  label: string
  pages: readonly SitePage[]
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

const component = (label: string, slug: string): SitePage => ({
  href: `/components/${slug}`,
  label,
})

/** By purpose, docs-site.md §3. Labels are the page titles. */
export const componentGroups: readonly SiteGroup[] = [
  {
    id: 'actions',
    label: groupText.actions,
    pages: [
      component('Button', 'button'),
      component('ButtonGroup', 'button-group'),
      component('CopyButton', 'copy-button'),
      component('Link', 'link'),
      component('Toolbar', 'toolbar'),
    ],
  },
  {
    id: 'content',
    label: groupText.content,
    pages: [
      component('Accordion', 'accordion'),
      component('Alert', 'alert'),
      component('Badge', 'badge'),
      component('Card', 'card'),
      component('CodeBlock', 'code-block'),
      component('Disclosure', 'disclosure'),
      component('Heading', 'heading'),
      component('Icon', 'icon'),
      component('Kbd', 'kbd'),
      component('Progress', 'progress'),
      component('Prose', 'prose'),
      component('VisuallyHidden', 'visually-hidden'),
    ],
  },
  {
    id: 'layout',
    label: groupText.layout,
    pages: [
      component('Columns', 'columns'),
      component('Container', 'container'),
      component('ScrollArea', 'scroll-area'),
      component('Section', 'section'),
      component('SidebarLayout', 'sidebar-layout'),
      component('Stack', 'stack'),
    ],
  },
  {
    id: 'navigation',
    label: groupText.navigation,
    pages: [
      component('Breadcrumb', 'breadcrumb'),
      component('Navigation', 'navigation'),
      component('Pagination', 'pagination'),
      component('SkipLink', 'skip-link'),
      component('Stepper', 'stepper'),
      component('TableOfContents', 'table-of-contents'),
      component('Tabs', 'tabs'),
    ],
  },
  {
    id: 'forms',
    label: groupText.forms,
    pages: [
      component('Calendar', 'calendar'),
      component('DateInput', 'date-input'),
      component('DatePicker', 'date-picker'),
      component('DateRangePicker', 'date-range-picker'),
      component('ErrorSummary', 'error-summary'),
      component('Field', 'field'),
      component('Fieldset', 'fieldset'),
      component('FileUpload', 'file-upload'),
      component('InputGroup', 'input-group'),
      component('NumberInput', 'number-input'),
      component('OneTimeCode', 'one-time-code'),
      component('Slider', 'slider'),
      component('SummaryList', 'summary-list'),
      component('TextInput', 'text-input'),
      component('Textarea', 'textarea'),
    ],
  },
  {
    id: 'choice-and-overlays',
    label: groupText.choiceAndOverlays,
    pages: [
      component('AlertDialog', 'alert-dialog'),
      component('Autocomplete', 'autocomplete'),
      component('Checkbox', 'checkbox'),
      component('CheckboxGroup', 'checkbox-group'),
      component('Combobox', 'combobox'),
      component('Dialog', 'dialog'),
      component('Listbox', 'listbox'),
      component('Menu', 'menu'),
      component('Popover', 'popover'),
      component('RadioGroup', 'radio-group'),
      component('Switch', 'switch'),
      component('Toast', 'toast'),
      component('Toggle', 'toggle'),
      component('Tooltip', 'tooltip'),
    ],
  },
  {
    id: 'data-and-behaviour',
    label: groupText.dataAndBehaviour,
    pages: [
      component('Announcer', 'announcer'),
      component('Focus', 'focus'),
      component('ReadAloud', 'read-aloud'),
      component('Route focus', 'route-focus'),
      component('Table', 'table'),
    ],
  },
]

const componentPages = componentGroups.flatMap((group) => group.pages)

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
