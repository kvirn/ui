'use client'

import { Container } from '@kvirn-ui/react'
import type { ReactNode } from 'react'
import { PageFrame } from '../../page-frame/page-frame.tsx'
import { SiteAlert } from '../../site-chrome/site-alert/site-alert.tsx'
import {
  KvirnbyFooter,
  KvirnbyHeader,
  KvirnbyTransactionHeader,
  KvirnUIDocsHeader,
} from './kvirnby-chrome.tsx'

export interface ContentTypeShellProps {
  /** `kvirnby`: the municipality header and footer. `transaction`: the same footer under a header with no search and no menu, for a form. `docs`: the KvirnUI documentation header. Default `kvirnby`. */
  header?: 'kvirnby' | 'transaction' | 'docs' | undefined
  /** Marks the header's logo link as the current page (the start page). */
  current?: 'page' | undefined
  /** Shows the water shut-off site alert between the header and the content type. */
  siteAlert?: boolean | undefined
  /** A short notice first inside the header (the `banner`), after the skip link: for an example page that says it is fictional. */
  notice?: ReactNode
  /** The content type, which is what sits between the header and the footer. */
  children?: ReactNode
}

/**
 * The frame every content type sits in: skip link first, the header, an optional site alert and the
 * footer. A content type renders only the slot between, so it never repeats them. Render it inside
 * a `KvirnProvider`. Example text is English and fictional.
 */
export function ContentTypeShell({
  header = 'kvirnby',
  current,
  siteAlert = false,
  notice,
  children,
}: ContentTypeShellProps) {
  return (
    <PageFrame.Root>
      {header === 'docs' ? (
        <KvirnUIDocsHeader notice={notice} />
      ) : header === 'transaction' ? (
        <KvirnbyTransactionHeader notice={notice} />
      ) : (
        <KvirnbyHeader current={current} notice={notice} />
      )}
      {siteAlert ? (
        <SiteAlert.Root>
          <SiteAlert.Title>Water shut off in North Kvirnby on Wednesday 14 October</SiteAlert.Title>
          <SiteAlert.Body>
            The water is off from 9 to 15 because of work on the water main. Fill containers in
            advance if you can.
          </SiteAlert.Body>
          <SiteAlert.Link href="#water-shut-off">Read more about the water shut-off</SiteAlert.Link>
        </SiteAlert.Root>
      ) : null}
      {children}
      {header === 'docs' ? (
        <footer className="kv-section kv-section--surface kv-section--padding-md">
          <Container>KvirnUI documentation</Container>
        </footer>
      ) : (
        <KvirnbyFooter />
      )}
    </PageFrame.Root>
  )
}
