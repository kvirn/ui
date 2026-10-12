'use client'
import { ApplicationLogo, SiteHeader, SiteSearch } from '@kvirn-ui/patterns'
import { Badge, Link, Navigation, SkipLink, TopBar, useRouteFocus } from '@kvirn-ui/react'
import { useEffect, useRef, useState } from 'react'
import type { ReactNode, RefObject } from 'react'
import { messages } from '../messages/en.ts'
import { DocsDisclosure } from './docs-disclosure.tsx'
import { DocsShellContext } from './docs-page.tsx'
import { KvirnMark } from './kvirn-mark.tsx'
import { SiteFooter } from './site-footer.tsx'
import { SiteMenu } from './site-menu.tsx'
import { SiteNavigation } from './site-navigation.tsx'
import { SitePager } from './site-pager.tsx'
import {
  breadcrumbTrail,
  findActiveSection,
  hasSidebar,
  pagerPages,
  renderedSections,
  siteSections,
  siteTools,
} from './site-sections.ts'
import type { SiteSection } from './site-sections.ts'
import { SiteToolLink } from './site-tool-link.tsx'

const text = messages.docs

const nonTextInputTypes = new Set([
  'button',
  'checkbox',
  'color',
  'file',
  'image',
  'radio',
  'range',
  'reset',
  'submit',
])

const takesText = (element: Element) =>
  element instanceof HTMLTextAreaElement ||
  element instanceof HTMLSelectElement ||
  (element instanceof HTMLElement && element.isContentEditable) ||
  (element instanceof HTMLInputElement && !nonTextInputTypes.has(element.type))

/**
 * Ctrl+K (Cmd+K on Apple) goes to the search box (maintainer's decision 2026-10-12, keyboard skill
 * rule 7). Ctrl+K is "delete to end of line" in a Mac text field, so Apple platforms take Cmd only.
 * It stays out of the way of text entry, where Mod+K is "insert link".
 */
function useSearchShortcut(searchRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const input = searchRef.current?.querySelector('input')
    if (input === null || input === undefined) {
      return
    }
    const isApple = /Mac|iPhone|iPad|iPod/.test(navigator.platform)
    input.setAttribute('aria-keyshortcuts', isApple ? 'Meta+K' : 'Control+K')
    const onKeyDown = (event: KeyboardEvent) => {
      const isK = event.key.toLowerCase() === 'k' || event.code === 'KeyK'
      const hasModifier = isApple
        ? event.metaKey && !event.ctrlKey
        : event.ctrlKey && !event.metaKey
      if (event.defaultPrevented || !isK || !hasModifier || event.shiftKey || event.altKey) {
        return
      }
      const target = document.activeElement
      if (target !== null && target !== input && takesText(target)) {
        return
      }
      event.preventDefault()
      input.focus()
      input.select()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      input.removeAttribute('aria-keyshortcuts')
    }
  }, [searchRef])
}

const sidebarId = 'docs-sidebar'
const siteNavigationId = 'site-navigation'
// GitHub stays in the footer's Project list only.
const topBarTools = siteTools.filter((tool) => tool.id !== 'github')

/**
 * The docs site shell (docs-shell-mega-menu.md §5): two skip links, the primary Site header from
 * `@kvirn-ui/patterns` (a TopBar with Latest and Tools, and a masthead with the mark and name, the
 * Site menu with its mega panels, and the search), main and the footer. Nothing is sticky (2.4.11).
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
  const activeSection = findActiveSection(visibleSections, pathname)
  const sidebarSection =
    layout === 'article' && hasSidebar(activeSection) ? activeSection : undefined
  // The sidebar belongs to the page it was opened on, so navigating closes it.
  const [sidebarOpenOn, setSidebarOpenOn] = useState<string | null>(null)
  const isSidebarOpen = sidebarOpenOn === pathname
  const mainRef = useRef<HTMLElement>(null)
  useRouteFocus({ key: pathname, containerRef: mainRef })
  const searchRef = useRef<HTMLElement>(null)
  useSearchShortcut(searchRef)

  const { previous, next } = pagerPages(visibleSections, pathname)
  const shellParts = {
    trail: breadcrumbTrail(visibleSections, pathname),
    sidebar:
      sidebarSection === undefined ? null : (
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
      ),
    pager: <SitePager previous={previous} next={next} />,
  }

  return (
    <>
      <SkipLink href="#main" />
      <SkipLink href={`#${siteNavigationId}`}>{text.skipLinks.navigation}</SkipLink>
      <SiteHeader.Root variant="primary">
        <TopBar.Root>
          <Link href="/docs#status">{text.header.latest({ status: text.header.status })}</Link>
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
        </TopBar.Root>
        <SiteHeader.Masthead>
          <div className="docs-brand">
            <ApplicationLogo.Root href="/">
              <KvirnMark />
              <ApplicationLogo.Name>{text.header.home}</ApplicationLogo.Name>
            </ApplicationLogo.Root>
            <Badge>{text.header.status}</Badge>
          </div>
          <SiteHeader.Menu id={siteNavigationId}>
            <SiteHeader.MenuButton>{text.nav.menuButton}</SiteHeader.MenuButton>
            <SiteHeader.MenuPanel>
              <SiteMenu
                sections={visibleSections}
                activeSection={activeSection}
                pathname={pathname}
              />
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
      <SiteFooter sections={visibleSections} activeSection={activeSection} pathname={pathname} />
    </>
  )
}
