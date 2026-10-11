'use client'
import { ApplicationLogo, MainMenu, SiteHeader, SiteSearch, TopBar } from '@kvirn-ui/patterns'
import {
  Badge,
  DisplaySettings,
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

const sidebarId = 'docs-sidebar'

/**
 * The docs site shell (docs-header-bands.md §5): skip link, the primary Site header from
 * `@kvirn-ui/patterns` (a TopBar with Latest and Tools, the masthead with the name and Display
 * settings, the Menu with the Site navigation), the active section's sidebar with its own button
 * below 64rem, main and footer. Nothing is sticky (2.4.11). `pathname` comes from the router, so
 * the shell itself doesn't depend on Next.js. The `landing` layout has no sidebar and no Prose
 * article: its page brings its own bands inside `main`.
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
  // The sidebar belongs to the page it was opened on, so navigating closes it.
  const [sidebarOpenOn, setSidebarOpenOn] = useState<string | null>(null)
  const isSidebarOpen = sidebarOpenOn === pathname
  const mainRef = useRef<HTMLElement>(null)
  useRouteFocus({ key: pathname, containerRef: mainRef })

  return (
    <>
      <SkipLink href="#main" />
      <SiteHeader.Root variant="primary">
        <TopBar.Root>
          <p>
            <Link href="/docs#status">{text.header.latest({ status: text.header.status })}</Link>
          </p>
          <div className="docs-top-end">
            <Navigation.Root label={text.header.toolsLabel} className="kv-navigation--horizontal">
              <Navigation.List>
                {siteTools.map((tool) => (
                  <Navigation.Item key={tool.id}>
                    <Link
                      href={tool.href}
                      target={tool.opensInNewTab === true ? '_blank' : undefined}
                    >
                      {/* One inline box: in the flex item a bare space before the notice would collapse. */}
                      <span>
                        {tool.label}
                        {tool.opensInNewTab === true ? (
                          <>
                            {' '}
                            <Link.NewTabNotice />
                          </>
                        ) : null}
                      </span>
                    </Link>
                  </Navigation.Item>
                ))}
              </Navigation.List>
            </Navigation.Root>
            <DisplaySettings.Compact>
              <p>{text.display.storageNote}</p>
            </DisplaySettings.Compact>
          </div>
        </TopBar.Root>
        <SiteHeader.Masthead>
          <div className="docs-brand">
            <ApplicationLogo.Root href="/">
              <ApplicationLogo.Name>{text.header.home}</ApplicationLogo.Name>
            </ApplicationLogo.Root>
            <Badge>{text.header.status}</Badge>
          </div>
          <SiteSearch action="/search" label={text.header.searchLabel}>
            {text.header.searchButton}
          </SiteSearch>
        </SiteHeader.Masthead>
        <SiteHeader.Menu>
          <SiteHeader.MenuButton>{text.nav.menuButton}</SiteHeader.MenuButton>
          <SiteHeader.MenuPanel>
            <MainMenu.Root label={text.header.navLabel}>
              {visibleSections.map((section) => (
                <MainMenu.Link
                  key={section.id}
                  href={section.href}
                  current={sectionCurrent(section, activeSection, pathname)}
                >
                  {section.label}
                </MainMenu.Link>
              ))}
            </MainMenu.Root>
          </SiteHeader.MenuPanel>
        </SiteHeader.Menu>
      </SiteHeader.Root>
      <div className={layout === 'landing' ? 'docs-layout docs-layout--landing' : 'docs-layout'}>
        {sidebarSection === undefined ? null : (
          <>
            {/* Below 64rem the sidebar opens from its own button, named by the section. */}
            <DocsDisclosure
              className="docs-disclosure docs-sidebar-toggle"
              controls={sidebarId}
              isOpen={isSidebarOpen}
              onToggle={() => setSidebarOpenOn(isSidebarOpen ? null : pathname)}
            >
              {text.nav.sidebarButton({ section: sidebarSection.label })}
            </DocsDisclosure>
            <SiteNavigation
              id={sidebarId}
              section={sidebarSection}
              pathname={pathname}
              isOpen={isSidebarOpen}
            />
          </>
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
