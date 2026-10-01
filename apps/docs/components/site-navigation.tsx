'use client'
import { Link } from '@kvirn-ui/react'
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

function NavigationItem({ page, pathname }: { page: NavigationPage; pathname: string }) {
  return (
    <li>
      <Link href={page.href} current={page.href === pathname ? 'page' : undefined}>
        {page.label}
      </Link>
    </li>
  )
}

/**
 * The documentation navigation: a list of links, not a menu (APG Disclosure Navigation).
 * `data-kv-nav` makes the theme style its links as navigation items.
 * Below 64rem the Menu button shows and hides the list.
 */
export function SiteNavigation({ pathname, isOpen }: { pathname: string; isOpen: boolean }) {
  return (
    <nav aria-label={text.label} className="docs-sidebar" data-kv-density="compact">
      <ul id="docs-nav-list" className="docs-nav-list" data-kv-nav="" data-open={isOpen}>
        <NavigationItem page={introduction} pathname={pathname} />
        {groups.map((group) => (
          <li key={group.label} className="docs-nav-group">
            <span className="docs-nav-group-label">{group.label}</span>
            <ul data-kv-nav="">
              {group.pages.map((page) => (
                <NavigationItem key={page.href} page={page} pathname={pathname} />
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </nav>
  )
}
