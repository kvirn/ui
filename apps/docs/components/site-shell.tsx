'use client'
import {
  Badge,
  Disclosure,
  Link,
  Navigation,
  Prose,
  Section,
  SkipLink,
  useRouteFocus,
} from '@kvirn-ui/react'
import { useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { messages } from '../messages/en.ts'
import { DisplaySettingsPanel } from './display-settings.tsx'
import { DocsDisclosure } from './docs-disclosure.tsx'
import { SiteNavigation } from './site-navigation.tsx'
import {
  findActiveSection,
  hasSidebar,
  renderedSections,
  sectionCurrent,
  siteSections,
} from './site-sections.ts'
import type { SiteSection } from './site-sections.ts'

const text = messages.docs

const siteNavigationId = 'docs-site-nav'
const menuPanelId = 'docs-menu-panel'
const sidebarId = 'docs-sidebar'

/**
 * The docs site shell (docs-landing-and-header.md §5): skip link, header with the Site
 * navigation, the Menu and Display settings disclosures, the active section's sidebar, main
 * and footer. Nothing is sticky (2.4.11). `pathname` comes from the router, so the shell itself
 * doesn't depend on Next.js. The `landing` layout has no sidebar and no Prose article: its page
 * brings its own bands inside `main`.
 */
export function SiteShell({
  pathname,
  children,
  sections = siteSections,
  layout = pathname === '/' ? 'landing' : 'article',
}: {
  pathname: string
  children: ReactNode
  sections?: readonly SiteSection[]
  layout?: 'article' | 'landing'
}) {
  const visibleSections = renderedSections(sections)
  const activeSection = findActiveSection(visibleSections, pathname)
  const sidebarSection =
    layout === 'article' && hasSidebar(activeSection) ? activeSection : undefined
  // The menu belongs to the page it was opened on, so navigating closes it.
  const [menuOpenOn, setMenuOpenOn] = useState<string | null>(null)
  const isMenuOpen = menuOpenOn === pathname
  const mainRef = useRef<HTMLElement>(null)
  useRouteFocus({ key: pathname, containerRef: mainRef })

  return (
    <>
      <SkipLink href="#main" />
      <Section
        as="header"
        className="docs-header kv-section--canvas kv-section--padding-sm kv-compact"
      >
        <div className="docs-header-inner">
          <div className="docs-brand">
            <Link href="/">{text.header.home}</Link>
            <Badge>{text.header.status}</Badge>
          </div>
          {/* Below 64rem the Menu holds the site navigation and Display settings (and opens the
              sidebar); from 64rem everything is in the header row and the Menu is gone. */}
          <DocsDisclosure
            className="docs-disclosure docs-menu-toggle"
            controls={sidebarSection === undefined ? menuPanelId : `${menuPanelId} ${sidebarId}`}
            isOpen={isMenuOpen}
            onToggle={() => setMenuOpenOn(isMenuOpen ? null : pathname)}
          >
            {text.nav.menuButton}
          </DocsDisclosure>
          <div id={menuPanelId} className="docs-menu-panel" data-open={isMenuOpen}>
            <Navigation.Root
              id={siteNavigationId}
              label={text.header.navLabel}
              className="docs-site-nav kv-navigation--horizontal"
            >
              <Navigation.List>
                {visibleSections.map((section) => (
                  <Navigation.Item key={section.id}>
                    <Link
                      href={section.href}
                      current={sectionCurrent(section, activeSection, pathname)}
                    >
                      {section.label}
                    </Link>
                  </Navigation.Item>
                ))}
              </Navigation.List>
            </Navigation.Root>
            <Disclosure.Root>
              <div className="docs-header-actions">
                <Disclosure.Trigger className="docs-disclosure">
                  {text.display.button}
                </Disclosure.Trigger>
              </div>
              <DisplaySettingsPanel />
            </Disclosure.Root>
          </div>
        </div>
      </Section>
      <div className={layout === 'landing' ? 'docs-layout docs-layout--landing' : 'docs-layout'}>
        {sidebarSection === undefined ? null : (
          <SiteNavigation
            id={sidebarId}
            section={sidebarSection}
            pathname={pathname}
            isOpen={isMenuOpen}
          />
        )}
        {layout === 'landing' ? (
          <main id="main" ref={mainRef}>
            {children}
          </main>
        ) : (
          <main id="main" ref={mainRef} className="docs-main">
            <Prose as="article" className="docs-article">
              {children}
            </Prose>
          </main>
        )}
      </div>
      <Section as="footer" className="docs-footer kv-section--canvas">
        <div className="docs-footer-inner">
          <p>{text.footer.licence}</p>
          <p>{text.footer.claim}</p>
          <p>{text.footer.noTracking}</p>
        </div>
      </Section>
    </>
  )
}
