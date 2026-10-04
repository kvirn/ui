'use client'
import { Link, Navigation } from '@kvirn-ui/react'
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
    pages: [{ href: '/foundation/kvirn-provider', label: 'KvirnProvider' }],
  },
  {
    label: text.components,
    pages: [
      { href: '/components/button', label: 'Button' },
      { href: '/components/link', label: 'Link' },
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
 * The documentation navigation: a list of links, not a menu (APG Disclosure Navigation).
 * `Navigation` renders the labelled `<nav>`, and the theme styles its links as navigation items.
 * Below 64rem the Menu button shows and hides the list.
 */
export function SiteNavigation({ pathname, isOpen }: { pathname: string; isOpen: boolean }) {
  return (
    <Navigation.Root label={text.label} className="docs-sidebar kv-compact">
      <Navigation.List id="docs-nav-list" className="docs-nav-list" data-open={isOpen}>
        <PageItem page={introduction} pathname={pathname} />
        {groups.map((group) => (
          <Navigation.Item key={group.label} className="docs-nav-group">
            <span className="docs-nav-group-label">{group.label}</span>
            <Navigation.List>
              {group.pages.map((page) => (
                <PageItem key={page.href} page={page} pathname={pathname} />
              ))}
            </Navigation.List>
          </Navigation.Item>
        ))}
      </Navigation.List>
    </Navigation.Root>
  )
}
