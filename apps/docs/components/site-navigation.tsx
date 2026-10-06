'use client'
import { Disclosure, Link, Navigation, Section } from '@kvirn-ui/react'
import { useState } from 'react'
import { messages } from '../messages/en.ts'

const text = messages.docs.nav

interface NavigationPage {
  href: string
  label: string
}

interface NavigationGroup {
  label: string
  pages: readonly NavigationPage[]
}

/** docs-site.md §3. Group names are list-item text, not headings. */
const introduction: NavigationPage = { href: '/', label: text.introduction }
const groups: readonly NavigationGroup[] = [
  {
    label: text.foundation,
    pages: [
      { href: '/foundation/kvirn-provider', label: text.kvirnProvider },
      { href: '/foundation/locales', label: text.locales },
      { href: '/foundation/theming', label: 'Theming' },
    ],
  },
]

const groupText = text.componentGroups
const page = (name: string, slug: string): NavigationPage => ({
  href: `/components/${slug}`,
  label: name,
})

/** By purpose, docs-site.md §3. Labels are the page titles; a page that doesn't exist is left out. */
const componentGroups: readonly NavigationGroup[] = [
  {
    label: groupText.actions,
    pages: [
      page('Button', 'button'),
      page('ButtonGroup', 'button-group'),
      page('CopyButton', 'copy-button'),
      page('Link', 'link'),
      page('Toolbar', 'toolbar'),
    ],
  },
  {
    label: groupText.content,
    pages: [
      page('Accordion', 'accordion'),
      page('Alert', 'alert'),
      page('Badge', 'badge'),
      page('Card', 'card'),
      page('CodeBlock', 'code-block'),
      page('Disclosure', 'disclosure'),
      page('Heading', 'heading'),
      page('Icon', 'icon'),
      page('Kbd', 'kbd'),
      page('Prose', 'prose'),
      page('VisuallyHidden', 'visually-hidden'),
    ],
  },
  {
    label: groupText.layout,
    pages: [
      page('Columns', 'columns'),
      page('Container', 'container'),
      page('Section', 'section'),
      page('SidebarLayout', 'sidebar-layout'),
      page('Stack', 'stack'),
    ],
  },
  {
    label: groupText.navigation,
    pages: [
      page('Breadcrumb', 'breadcrumb'),
      page('Navigation', 'navigation'),
      page('Pagination', 'pagination'),
      page('SkipLink', 'skip-link'),
      page('TableOfContents', 'table-of-contents'),
      page('Tabs', 'tabs'),
    ],
  },
  {
    label: groupText.forms,
    pages: [
      page('DateInput', 'date-input'),
      page('ErrorSummary', 'error-summary'),
      page('Field', 'field'),
      page('Fieldset', 'fieldset'),
      page('FileUpload', 'file-upload'),
      page('InputGroup', 'input-group'),
      page('NumberInput', 'number-input'),
      page('OneTimeCode', 'one-time-code'),
      page('SummaryList', 'summary-list'),
      page('TextInput', 'text-input'),
      page('Textarea', 'textarea'),
    ],
  },
  {
    label: groupText.choiceAndOverlays,
    pages: [
      page('AlertDialog', 'alert-dialog'),
      page('Autocomplete', 'autocomplete'),
      page('Checkbox', 'checkbox'),
      page('CheckboxGroup', 'checkbox-group'),
      page('Combobox', 'combobox'),
      page('Dialog', 'dialog'),
      page('Listbox', 'listbox'),
      page('Menu', 'menu'),
      page('Popover', 'popover'),
      page('RadioGroup', 'radio-group'),
      page('Switch', 'switch'),
      page('Toggle', 'toggle'),
      page('Tooltip', 'tooltip'),
    ],
  },
  {
    label: groupText.dataAndBehaviour,
    pages: [
      page('Announcer', 'announcer'),
      page('Route focus', 'route-focus'),
      page('Table', 'table'),
    ],
  },
]

function PageItem({ page, pathname }: { page: NavigationPage; pathname: string }) {
  return (
    <Navigation.Item>
      <Link href={page.href} current={page.href === pathname ? 'page' : undefined}>
        {page.label}
      </Link>
    </Navigation.Item>
  )
}

/**
 * A Disclosure inside the item (navigation.md): the group holding the current page is open
 * until the reader toggles it. Without JavaScript the panels show (docs.css).
 */
function ComponentGroup({
  group,
  pathname,
  isOpen,
  onOpenChange,
}: {
  group: NavigationGroup
  pathname: string
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
}) {
  return (
    <Navigation.Item>
      <Disclosure.Root open={isOpen} onOpenChange={onOpenChange}>
        <Disclosure.Trigger className="docs-disclosure">{group.label}</Disclosure.Trigger>
        <Disclosure.Panel className="docs-nav-group">
          <span className="docs-nav-group-name">{group.label}</span>
          <Navigation.List>
            {group.pages.map((page) => (
              <PageItem key={page.href} page={page} pathname={pathname} />
            ))}
          </Navigation.List>
        </Disclosure.Panel>
      </Disclosure.Root>
    </Navigation.Item>
  )
}

/**
 * The documentation navigation: a list of links, not a menu (APG Disclosure Navigation).
 * The Section is the surface, and the Menu button shows and hides it below 64rem.
 */
export function SiteNavigation({
  id,
  pathname,
  isOpen,
}: {
  id: string
  pathname: string
  isOpen: boolean
}) {
  const [toggled, setToggled] = useState<Readonly<Record<string, boolean>>>({})
  return (
    <Section id={id} className="docs-sidebar kv-section--padding-sm kv-compact" data-open={isOpen}>
      <Navigation.Root label={text.label}>
        <Navigation.List>
          <PageItem page={introduction} pathname={pathname} />
          {groups.map((group) => (
            <Navigation.Item key={group.label}>
              <Navigation.Label>{group.label}</Navigation.Label>
              <Navigation.List>
                {group.pages.map((page) => (
                  <PageItem key={page.href} page={page} pathname={pathname} />
                ))}
              </Navigation.List>
            </Navigation.Item>
          ))}
          <Navigation.Item>
            <Navigation.Label>{text.components}</Navigation.Label>
            <Navigation.List>
              {componentGroups.map((group) => (
                <ComponentGroup
                  key={group.label}
                  group={group}
                  pathname={pathname}
                  isOpen={
                    toggled[group.label] ?? group.pages.some((page) => page.href === pathname)
                  }
                  onOpenChange={(open) => setToggled({ ...toggled, [group.label]: open })}
                />
              ))}
            </Navigation.List>
          </Navigation.Item>
        </Navigation.List>
      </Navigation.Root>
    </Section>
  )
}
