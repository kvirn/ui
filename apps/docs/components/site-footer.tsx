import { ApplicationLogo } from '@kvirn-ui/patterns'
import { Badge, Heading, Link, Section } from '@kvirn-ui/react'
import { messages } from '../messages/en.ts'
import { sectionCurrent, siteTools } from './site-sections.ts'
import type { SiteSection } from './site-sections.ts'
import { SiteToolLink } from './site-tool-link.tsx'

const text = messages.docs

/** Brand with the licence, claim and no-tracking note, then Sections and Project (docs-shell-mega-menu.md §5). */
export function SiteFooter({
  sections,
  activeSection,
  pathname,
}: {
  sections: readonly SiteSection[]
  activeSection: SiteSection | undefined
  pathname: string
}) {
  return (
    <Section as="footer" className="docs-footer kv-section--surface">
      <div className="docs-footer-inner">
        <div className="docs-footer-grid">
          <div>
            <div className="docs-brand">
              <ApplicationLogo.Root href="/">
                <ApplicationLogo.Name>{text.header.home}</ApplicationLogo.Name>
              </ApplicationLogo.Root>
              <Badge>{text.header.status}</Badge>
            </div>
            <p>{text.footer.licence}</p>
            <p>
              {text.footer.claim} <Link href="/docs#what-wcag-means">{text.footer.claimLink}</Link>
            </p>
            <p>{text.footer.noTracking}</p>
          </div>
          <nav aria-labelledby="docs-footer-sections">
            <Heading as="h2" id="docs-footer-sections" className="docs-footer-heading">
              {text.footer.sectionsHeading}
            </Heading>
            <ul role="list">
              {sections.map((section) => (
                <li key={section.id}>
                  <Link
                    href={section.href}
                    current={sectionCurrent(section, activeSection, pathname)}
                  >
                    {section.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <nav aria-labelledby="docs-footer-project">
            <Heading as="h2" id="docs-footer-project" className="docs-footer-heading">
              {text.footer.projectHeading}
            </Heading>
            <ul role="list">
              <li>
                <Link href="/docs#status">
                  {text.footer.status({ status: text.header.status })}
                </Link>
              </li>
              {siteTools.map((tool) => (
                <li key={tool.id}>
                  <SiteToolLink tool={tool} pathname={pathname} />
                </li>
              ))}
              <li>
                <Link href="/privacy" current={pathname === '/privacy' ? 'page' : undefined}>
                  {text.footer.privacy}
                </Link>
              </li>
              <li>
                <Link href="/contact" current={pathname === '/contact' ? 'page' : undefined}>
                  {text.footer.contact}
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </Section>
  )
}
