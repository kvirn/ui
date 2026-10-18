'use client'
import { ApplicationLogo, SiteHeader, SiteSearch } from '@kvirn-ui/patterns'
import { Navigation, SkipPanel, TopBar, useRouteFocus } from '@kvirn-ui/react'
import { useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { useShortcutsSetting } from '../lib/shortcuts-setting.ts'
import { messages } from '../messages/en.ts'
import { BackToTop } from './back-to-top.tsx'
import { DocsDisclosure } from './docs-disclosure.tsx'
import { DocsShellContext } from './docs-page.tsx'
import { SiteFooter } from './site-footer.tsx'
import { SiteMenu } from './site-menu.tsx'
import { SiteNavigation } from './site-navigation.tsx'
import { SitePager } from './site-pager.tsx'
import {
  breadcrumbTrail,
  findActiveSection,
  hasSidebar,
  pagerPages,
  listedSections,
  renderedSections,
  siteSections,
  siteTools,
} from './site-sections.ts'
import type { SiteSection } from './site-sections.ts'
import { SiteToolLink } from './site-tool-link.tsx'

const text = messages.docs

const sidebarId = 'docs-sidebar'
const siteNavigationId = 'site-navigation'
// GitHub stays in the footer's Project list only.
const topBarTools = siteTools.filter((tool) => tool.id !== 'github')

/**
 * The docs site shell (docs-shell-mega-menu.md §5): the skip panel, the primary Site header from
 * `@kvirn-ui/patterns` (a TopBar with Tools, and a masthead with the mark and name, the
 * Site menu with its mega panels, and the search), main and the footer. The header is not sticky;
 * the contents list (from 64rem) and the Back to top button are. The root's `scroll-padding` keeps
 * focus clear of the button, and the contents list ends above it (2.4.11).
 * `pathname` comes from the router, so the shell itself doesn't depend on Next.js. The `landing`
 * layout has no article: its page brings its own bands inside `main`. In the `article` layout a
 * page renders `DocsPage`, which lays out the intro band, the Get started sidebar and the pager
 * the shell passes down.
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
  const menuSections = listedSections(sections)
  const activeSection = findActiveSection(visibleSections, pathname)
  const sidebarSection =
    layout === 'article' && hasSidebar(activeSection) ? activeSection : undefined
  // The sidebar belongs to the page it was opened on, so navigating closes it.
  const [sidebarOpenOn, setSidebarOpenOn] = useState<string | null>(null)
  const isSidebarOpen = sidebarOpenOn === pathname
  const mainRef = useRef<HTMLElement>(null)
  useRouteFocus({ key: pathname, containerRef: mainRef })
  const searchRef = useRef<HTMLElement>(null)
  const [shortcutsEnabled] = useShortcutsSetting()
  const focusSearch = () => {
    const input = searchRef.current?.querySelector('input')
    input?.focus()
    input?.select()
  }

  const { previous, next } = pagerPages(visibleSections, pathname)
  const shellParts = {
    trail: breadcrumbTrail(visibleSections, pathname),
    sidebar:
      sidebarSection === undefined ? null : (
        <>
          {/* Below the grid's 48rem the sidebar opens from its own button, named by the section. */}
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
      ),
    pager: <SitePager previous={previous} next={next} />,
  }

  return (
    <>
      <SkipPanel.Root
        reopenShortcut={{ key: 'k', alt: true, shift: true }}
        shortcutsEnabled={shortcutsEnabled}
      >
        <SkipPanel.Group>
          <SkipPanel.Label />
          <SkipPanel.List>
            <SkipPanel.Item>
              <SkipPanel.Link href="#main" />
            </SkipPanel.Item>
            <SkipPanel.Item>
              <SkipPanel.Link href={`#${siteNavigationId}`}>
                {text.skipPanel.navigation}
              </SkipPanel.Link>
            </SkipPanel.Item>
          </SkipPanel.List>
        </SkipPanel.Group>
        <SkipPanel.Group>
          <SkipPanel.Label kind="shortcuts" />
          <SkipPanel.List>
            <SkipPanel.Item>
              <SkipPanel.Shortcut shortcut={{ key: 'k', mod: true }} onClick={focusSearch}>
                {text.skipPanel.search}
              </SkipPanel.Shortcut>
            </SkipPanel.Item>
            <SkipPanel.Item>
              <SkipPanel.HelpLink href="/accessibility-settings#shortcuts" />
            </SkipPanel.Item>
          </SkipPanel.List>
        </SkipPanel.Group>
        <SkipPanel.Hint />
      </SkipPanel.Root>
      <SiteHeader.Root variant="primary">
        <TopBar>
          <p>{text.header.status}</p>
          <div className="docs-top-end">
            <Navigation.Root label={text.header.toolsLabel} className="kv-navigation--horizontal">
              <Navigation.List>
                {topBarTools.map((tool) => (
                  <Navigation.Item key={tool.id}>
                    <SiteToolLink tool={tool} pathname={pathname} />
                  </Navigation.Item>
                ))}
              </Navigation.List>
            </Navigation.Root>
          </div>
        </TopBar>
        <SiteHeader.Masthead>
          <div className="docs-brand">
            <ApplicationLogo.Root href="/">
              <ApplicationLogo.Name>{text.header.home}</ApplicationLogo.Name>
            </ApplicationLogo.Root>
          </div>
          <SiteHeader.Menu id={siteNavigationId}>
            <SiteHeader.MenuButton>{text.nav.menuButton}</SiteHeader.MenuButton>
            <SiteHeader.MenuPanel>
              <SiteMenu sections={menuSections} activeSection={activeSection} pathname={pathname} />
            </SiteHeader.MenuPanel>
          </SiteHeader.Menu>
          <SiteSearch ref={searchRef} action="/search" label={text.header.searchLabel}>
            {text.header.searchButton}
          </SiteSearch>
        </SiteHeader.Masthead>
      </SiteHeader.Root>
      {layout === 'landing' ? (
        <main id="main" ref={mainRef}>
          {children}
        </main>
      ) : (
        <main id="main" ref={mainRef} className="docs-main">
          <DocsShellContext.Provider value={shellParts}>{children}</DocsShellContext.Provider>
        </main>
      )}
      {layout === 'article' ? <BackToTop mainRef={mainRef} /> : null}
      <SiteFooter sections={menuSections} activeSection={activeSection} pathname={pathname} />
    </>
  )
}
