'use client'
import { Disclosure, Link, Navigation, Section } from '@kvirn-ui/react'
import { useState } from 'react'
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
 * A Disclosure inside the item (navigation.md): the group holding the current page is open
 * until the reader toggles it. Without JavaScript the panels show (docs.css).
 */
function ComponentGroup({
  group,
  pathname,
  isOpen,
  onOpenChange,
}: {
  group: SiteGroup
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
 * The sidebar of the active section: a list of links, not a menu (APG Disclosure Navigation),
 * named by the section. Components list their groups as disclosures. The Section is the surface,
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
  const [toggled, setToggled] = useState<Readonly<Record<string, boolean>>>({})
  const [indexPage, ...otherPages] = section.pages
  return (
    <Section id={id} className="docs-sidebar kv-section--padding-sm kv-compact" data-open={isOpen}>
      <Navigation.Root label={section.label}>
        <Navigation.List>
          {indexPage === undefined ? null : <PageItem page={indexPage} pathname={pathname} />}
          {section.groups === undefined
            ? otherPages.map((page) => <PageItem key={page.href} page={page} pathname={pathname} />)
            : section.groups.map((group) => (
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
      </Navigation.Root>
    </Section>
  )
}
