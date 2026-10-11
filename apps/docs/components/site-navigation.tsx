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
 * A group is a link to its place on the section's index, and the pages of the group that holds
 * the current page are its second level (navigation.md): the theme draws that group as the trail
 * and the page as the solid fill. The other groups show no pages, so the list stays short; their
 * pages are on the index, one link away.
 */
function PageGroup({
  group,
  sectionHref,
  pathname,
}: {
  group: SiteGroup
  sectionHref: string
  pathname: string
}) {
  const isActive = group.pages.some((page) => page.href === pathname)
  return (
    <Navigation.Item>
      <Link href={`${sectionHref}#${group.id}`}>{group.label}</Link>
      {isActive ? (
        <Navigation.List>
          {group.pages.map((page) => (
            <PageItem key={page.href} page={page} pathname={pathname} />
          ))}
        </Navigation.List>
      ) : null}
    </Navigation.Item>
  )
}

/**
 * The sidebar of the active section: a list of links, not a menu (APG Disclosure Navigation),
 * named by the section. Components list their groups as links with the current group's pages
 * under it. The Section is the surface,
 * and the Menu button shows and hides it below 64rem.
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
          {indexPage === undefined ? null : <PageItem page={indexPage} pathname={pathname} />}
          {section.groups === undefined
            ? otherPages.map((page) => <PageItem key={page.href} page={page} pathname={pathname} />)
            : section.groups.map((group) => (
                <PageGroup
                  key={group.label}
                  group={group}
                  sectionHref={section.href}
                  pathname={pathname}
                />
              ))}
        </Navigation.List>
      </Navigation.Root>
    </Section>
  )
}
