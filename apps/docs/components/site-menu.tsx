import { MainMenu } from '@kvirn-ui/patterns'
import { Divider, Navigation } from '@kvirn-ui/react'
import { messages } from '../messages/en.ts'
import { OwnPackageMark, OwnPackageNote } from './own-package-badge.tsx'
import { pageCurrent, sectionCurrent } from './site-sections.ts'
import type { SiteGroup, SiteSection } from './site-sections.ts'

function MenuGroup({ group, pathname }: { group: SiteGroup; pathname: string }) {
  return (
    <MainMenu.Group>
      {group.href === undefined ? (
        <Navigation.Label>{group.label}</Navigation.Label>
      ) : (
        <MainMenu.GroupLink href={group.href} current={pageCurrent(pathname, group.href)}>
          {group.label}
        </MainMenu.GroupLink>
      )}
      <Navigation.List>
        {group.pages.map((page) => (
          <MainMenu.Link
            key={page.href}
            href={page.href}
            current={pageCurrent(pathname, page.href)}
          >
            {page.label}
            <OwnPackageMark page={page} />
          </MainMenu.Link>
        ))}
      </Navigation.List>
    </MainMenu.Group>
  )
}

/** A section listed in another topic's panel: its index as a group link, over its pages, if it has any. */
function SectionGroup({ section, pathname }: { section: SiteSection; pathname: string }) {
  const pages = section.groups?.flatMap((group) => group.pages) ?? []
  return (
    <MainMenu.Group>
      <MainMenu.GroupLink href={section.href} current={pageCurrent(pathname, section.href)}>
        {section.label}
      </MainMenu.GroupLink>
      {pages.length === 0 ? null : (
        <Navigation.List>
          {pages.map((page) => (
            <MainMenu.Link
              key={page.href}
              href={page.href}
              current={pageCurrent(pathname, page.href)}
            >
              {page.label}
              <OwnPackageMark page={page} />
            </MainMenu.Link>
          ))}
        </Navigation.List>
      )}
    </MainMenu.Group>
  )
}

/**
 * The Site navigation, from the section data: a section with groups is a topic whose panel lists
 * them, followed by the sections that name it as `menuParent`; any other section is a link.
 * `current` follows the MainMenu rules: `page` on the page's own link, `true` on the section's link
 * for a page the menu doesn't list.
 */
export function SiteMenu({
  sections,
  activeSection,
  pathname,
}: {
  sections: readonly SiteSection[]
  activeSection: SiteSection | undefined
  pathname: string
}) {
  return (
    <MainMenu.Root label={messages.docs.header.navLabel}>
      {sections
        .filter((section) => section.menuParent === undefined)
        .map((section) =>
          section.groups === undefined ? (
            <MainMenu.Link
              key={section.id}
              href={section.href}
              current={sectionCurrent(section, activeSection, pathname)}
            >
              {section.label}
            </MainMenu.Link>
          ) : (
            <MainMenu.Topic key={section.id}>
              <MainMenu.TopicButton>{section.label}</MainMenu.TopicButton>
              <MainMenu.TopicPanel className="docs-menu-columns">
                <MainMenu.Overview
                  href={section.href}
                  current={pageCurrent(pathname, section.href)}
                >
                  {section.overviewLabel ?? section.label}
                </MainMenu.Overview>
                {section.groups.map((group) => (
                  <MenuGroup key={group.id} group={group} pathname={pathname} />
                ))}
                {sections
                  .filter((child) => child.menuParent === section.id)
                  .map((child) => (
                    <SectionGroup key={child.id} section={child} pathname={pathname} />
                  ))}
                  <OwnPackageNote inList pages={section.groups.flatMap((group) => group.pages)} />
              </MainMenu.TopicPanel>
            </MainMenu.Topic>
          ),
        )}
    </MainMenu.Root>
  )
}
