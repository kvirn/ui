'use client'
import { Button, Link } from '@kvirn-ui/react'
import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { messages } from '../messages/en.ts'
import { ChevronIcon } from './chevron-icon.tsx'
import { DisplaySettingsPanel } from './display-settings.tsx'
import { SiteNavigation } from './site-navigation.tsx'

const text = messages.docs

/**
 * The docs site shell (docs-site.md §5): skip link, header with the Menu and Display
 * settings disclosures, the navigation, main and footer. Nothing is sticky (2.4.11).
 * `pathname` comes from the router, so the shell itself doesn't depend on Next.js.
 */
export function SiteShell({ pathname, children }: { pathname: string; children: ReactNode }) {
  // The menu belongs to the page it was opened on, so navigating closes it.
  const [menuOpenOn, setMenuOpenOn] = useState<string | null>(null)
  const isMenuOpen = menuOpenOn === pathname
  const [isDisplayOpen, setIsDisplayOpen] = useState(false)
  const mainRef = useRef<HTMLElement>(null)
  const renderedPathname = useRef(pathname)

  // After client-side navigation, focus moves to the new page's h1 (docs-site.md §7). The
  // first render keeps the browser's own focus. Next.js's route announcer reads the title.
  useEffect(() => {
    if (renderedPathname.current === pathname) {
      return
    }
    renderedPathname.current = pathname
    mainRef.current?.querySelector<HTMLElement>('h1')?.focus()
  }, [pathname])

  return (
    <>
      {/* A plain <a>, not the router's link: the browser moves focus to #main. */}
      <Link render={<a href="#main">{text.skipLink}</a>} href="#main" className="docs-skip-link" />
      <header className="docs-header" data-kv-density="compact">
        <div className="docs-header-inner">
          <div className="docs-brand">
            <Link href="/" className="docs-wordmark">
              {text.header.home}
            </Link>
            <span className="docs-badge">{text.header.status}</span>
          </div>
          <div className="docs-header-actions">
            <Button
              className="docs-toggle docs-menu-toggle"
              aria-expanded={isMenuOpen}
              aria-controls="docs-nav-list"
              onClick={() => setMenuOpenOn(isMenuOpen ? null : pathname)}
            >
              {text.nav.menuButton}
              <ChevronIcon />
            </Button>
            <Button
              className="docs-toggle"
              aria-expanded={isDisplayOpen}
              aria-controls="display-panel"
              onClick={() => setIsDisplayOpen((isOpen) => !isOpen)}
            >
              {text.display.button}
              <ChevronIcon />
            </Button>
          </div>
          <DisplaySettingsPanel id="display-panel" isOpen={isDisplayOpen} />
        </div>
      </header>
      <div className="docs-layout">
        <SiteNavigation pathname={pathname} isOpen={isMenuOpen} />
        <main id="main" tabIndex={-1} ref={mainRef} className="docs-main">
          {/* The article is prose: the default theme styles its headings, lists and code
              (ADR-0018). Examples opt out with data-kv-not-prose. */}
          <div data-kv-prose className="docs-article">
            {children}
          </div>
        </main>
      </div>
      <footer className="docs-footer">
        <div className="docs-footer-inner">
          <p>{text.footer.licence}</p>
          <p>{text.footer.claim}</p>
          <p>{text.footer.noTracking}</p>
        </div>
      </footer>
    </>
  )
}
