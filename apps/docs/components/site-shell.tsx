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
import { useRef, useState, useSyncExternalStore } from 'react'
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
  siteTools,
} from './site-sections.ts'
import type { SiteSection } from './site-sections.ts'

const text = messages.docs

const siteNavigationId = 'docs-site-nav'
const sidebarId = 'docs-sidebar'

// From 40rem the Site navigation is always shown, so the Menu only opens the sidebar.
const wideQuery = '(width >= 40rem)'

function useIsWide() {
  return useSyncExternalStore(
    (notify) => {
      const list = window.matchMedia(wideQuery)
      list.addEventListener('change', notify)
      return () => list.removeEventListener('change', notify)
    },
    () => window.matchMedia(wideQuery).matches,
    () => false,
  )
}

/**
 * The docs site shell (docs-header-bands.md §5): skip link, header in three bands (Latest and
 * Tools, brand and Display settings, Site navigation), the Menu, the active section's sidebar,
 * main and footer. Nothing is sticky (2.4.11). `pathname` comes from the router, so the shell itself
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
  const isWide = useIsWide()
  const menuControls =
    [isWide ? undefined : siteNavigationId, sidebarSection && sidebarId]
      .filter((id) => id !== undefined)
      .join(' ') || siteNavigationId
  const mainRef = useRef<HTMLElement>(null)
  useRouteFocus({ key: pathname, containerRef: mainRef })

  return (
    <>
      <SkipLink href="#main" />
      <Section
        as="header"
        className="docs-header kv-section--canvas kv-section--padding-none kv-compact"
      >
        <div className="docs-band docs-band--top">
          <div className="docs-band-inner">
            <Link href="/docs#status" className="docs-latest">
              {text.header.latest({ status: text.header.status })}
            </Link>
            <Navigation.Root
              label={text.header.toolsLabel}
              className="docs-band-nav kv-navigation--horizontal"
            >
              <Navigation.List>
                {siteTools.map((tool) => (
                  <Navigation.Item key={tool.id}>
                    <Link
                      href={tool.href}
                      current={tool.href === '/' ? true : undefined}
                      target={tool.opensInNewTab === true ? '_blank' : undefined}
                    >
                      {tool.label}
                      {tool.opensInNewTab === true ? (
                        <>
                          {' '}
                          <Link.NewTabNotice />
                        </>
                      ) : null}
                    </Link>
                  </Navigation.Item>
                ))}
              </Navigation.List>
            </Navigation.Root>
          </div>
        </div>
        <div className="docs-band docs-band--middle">
          <Disclosure.Root>
            <div className="docs-band-inner">
              <div className="docs-brand">
                <Link href="/" className="docs-brand-link">
                  {text.header.home}
                </Link>
                <Badge>{text.header.status}</Badge>
              </div>
              {/* The Menu holds the site navigation below 40rem and the sidebar below 64rem. With
                  no sidebar it has nothing to open from 40rem, so docs.css hides it there. */}
              <div className="docs-header-actions">
                <DocsDisclosure
                  className={
                    sidebarSection === undefined
                      ? 'docs-disclosure docs-band-button docs-menu-toggle docs-menu-toggle--nav-only'
                      : 'docs-disclosure docs-band-button docs-menu-toggle'
                  }
                  controls={menuControls}
                  isOpen={isMenuOpen}
                  onToggle={() => setMenuOpenOn(isMenuOpen ? null : pathname)}
                >
                  {text.nav.menuButton}
                </DocsDisclosure>
                <Disclosure.Trigger className="docs-disclosure docs-band-button">
                  {text.display.button}
                </Disclosure.Trigger>
              </div>
              <DisplaySettingsPanel />
            </div>
          </Disclosure.Root>
        </div>
        <div id={siteNavigationId} className="docs-band docs-band--bottom" data-open={isMenuOpen}>
          <div className="docs-band-inner">
            <Navigation.Root
              label={text.header.navLabel}
              className="docs-band-nav kv-navigation--horizontal"
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
