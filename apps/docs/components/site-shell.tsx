'use client'
import { Badge, Disclosure, Link, Prose, Section, SkipLink, useRouteFocus } from '@kvirn-ui/react'
import { useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { messages } from '../messages/en.ts'
import { DisplaySettingsPanel } from './display-settings.tsx'
import { DocsDisclosure } from './docs-disclosure.tsx'
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
  const mainRef = useRef<HTMLElement>(null)
  useRouteFocus({ key: pathname, containerRef: mainRef })

  return (
    <>
      <SkipLink href="#main" />
      <Section
        render={<header />}
        className="docs-header kv-section--canvas kv-section--padding-sm kv-compact"
      >
        <div className="docs-header-inner">
          <div className="docs-brand">
            <Link href="/">{text.header.home}</Link>
            <Badge>{text.header.status}</Badge>
          </div>
          <Disclosure.Root>
            <div className="docs-header-actions">
              <DocsDisclosure
                className="docs-disclosure docs-menu-toggle"
                controls="docs-sidebar"
                isOpen={isMenuOpen}
                onToggle={() => setMenuOpenOn(isMenuOpen ? null : pathname)}
              >
                {text.nav.menuButton}
              </DocsDisclosure>
              <Disclosure.Trigger className="docs-disclosure">
                {text.display.button}
              </Disclosure.Trigger>
            </div>
            <DisplaySettingsPanel />
          </Disclosure.Root>
        </div>
      </Section>
      <div className="docs-layout">
        <SiteNavigation id="docs-sidebar" pathname={pathname} isOpen={isMenuOpen} />
        <main id="main" ref={mainRef} className="docs-main">
          <Prose render={<article />} className="docs-article">
            {children}
          </Prose>
        </main>
      </div>
      <Section render={<footer />} className="docs-footer kv-section--canvas">
        <div className="docs-footer-inner">
          <p>{text.footer.licence}</p>
          <p>{text.footer.claim}</p>
          <p>{text.footer.noTracking}</p>
        </div>
      </Section>
    </>
  )
}
