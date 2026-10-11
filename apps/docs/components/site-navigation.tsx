'use client'
import { Link, Navigation, Section } from '@kvirn-ui/react'
import type { SiteGroup, SitePage, SiteSection } from './site-sections.ts'

function PageItem({ page, pathname }: { page: SitePage; pathname: string }) {
  return (
    <Navigation.Item>
      <Link href={page.href} current={page.href === pathname ? 'page' : undefined}>
        {page.label}
      </Link>
    </Navigation.Item>
  )
}

/**
 * A group with its own page is one link to it: the page is the group's list of cards, so the
 * sidebar stays short. A page inside the group is not listed, so the group is the deepest item
 * shown and takes `aria-current="true"` (navigation.md). A group without a page of its own is a
 * label (plain text) naming the list of its pages. No link goes to a `#`.
 */
function PageGroup({ group, pathname }: { group: SiteGroup; pathname: string }) {
  if (group.href !== undefined) {
    const isCurrentPage = group.href === pathname
    const holdsCurrentPage = group.pages.some((page) => page.href === pathname)
    return (
      <Navigation.Item>
        <Link
          href={group.href}
          current={isCurrentPage ? 'page' : holdsCurrentPage ? true : undefined}
        >
          {group.label}
        </Link>
      </Navigation.Item>
    )
  }
  return (
    <Navigation.Item>
      <Navigation.Label>{group.label}</Navigation.Label>
      <Navigation.List>
        {group.pages.map((page) => (
          <PageItem key={page.href} page={page} pathname={pathname} />
        ))}
      </Navigation.List>
    </Navigation.Item>
  )
}

/**
 * The sidebar of the active section: a list of links, not a menu (APG Disclosure Navigation),
 * named by the section. Components list their groups, each a link to its page of cards. The
 * Section is the surface, and the Menu button shows and hides it below 64rem.
 */
export function SiteNavigation({
  id,
  section,
  pathname,
  isOpen,
}: {
  id: string
  section: SiteSection
  pathname: string
  isOpen: boolean
}) {
  const [indexPage, ...otherPages] = section.pages
  return (
    <Section id={id} className="docs-sidebar kv-section--padding-sm" data-open={isOpen}>
      <Navigation.Root label={section.label}>
        <Navigation.List>
          {indexPage === undefined || section.indexInSidebar === false ? null : (
            <PageItem page={indexPage} pathname={pathname} />
          )}
          {section.groups === undefined
            ? otherPages.map((page) => <PageItem key={page.href} page={page} pathname={pathname} />)
            : section.groups.map((group) => (
                <PageGroup key={group.label} group={group} pathname={pathname} />
              ))}
        </Navigation.List>
      </Navigation.Root>
    </Section>
  )
}
