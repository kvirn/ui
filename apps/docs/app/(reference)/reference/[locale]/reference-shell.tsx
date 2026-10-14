'use client'
import { sv } from '@kvirn-ui/i18n/sv'
import { PageFrame } from '@kvirn-ui/patterns'
import { KvirnProvider, Link, TopBar, useRouteFocus } from '@kvirn-ui/react'
import type { ThemeOptions } from '@kvirn-ui/react'
import NextLink from 'next/link'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'
import { referenceMessages } from '../../../../messages/reference.ts'
import type { ReferenceLocale } from '../../../../messages/reference.ts'
import { SessionTimeout } from './session-timeout.tsx'
import { SiteLayout } from './site-layout.tsx'
import { TransactionLayout } from './transaction-layout.tsx'

// The T4 routes of the build order (spec §5): the sign-in and apply steps of the parking permit and the accessibility feedback form.
const transactionService = (pathname: string, locale: ReferenceLocale) => {
  const text = referenceMessages[locale].chrome.transaction
  if (/\/accessibility\/report(\/|$)/.test(pathname)) {
    return text.accessibilityReport
  }
  if (/\/disabled-parking-permit\/(sign-in|apply)(\/|$)/.test(pathname)) {
    return text.disabledParkingPermit
  }
  return undefined
}

function ReferenceFrame({ locale, children }: { locale: ReferenceLocale; children: ReactNode }) {
  const text = referenceMessages[locale]
  const pathname = usePathname()
  useRouteFocus({ key: pathname })
  const howBuiltSlug = pathname.endsWith('/service-unavailable')
    ? 'service-unavailable'
    : 'not-found'
  const timeoutSteps = /\/disabled-parking-permit\/apply(\/(vehicle|contact|check))?$/.test(
    pathname,
  )
  const notice = (
    <TopBar variant="accent">
      <p>{text.notice}</p>
      <div>
        <Link href={`/reference/how/${howBuiltSlug}`}>{text.howBuilt}</Link>{' '}
        <Link href="/">{text.docs}</Link>
        {timeoutSteps ? <SessionTimeout locale={locale} /> : null}
      </div>
    </TopBar>
  )
  const serviceName = transactionService(pathname, locale)
  return (
    <PageFrame.Root>
      {serviceName === undefined ? (
        <SiteLayout locale={locale} pathname={pathname} notice={notice}>
          {children}
        </SiteLayout>
      ) : (
        <TransactionLayout
          locale={locale}
          pathname={pathname}
          notice={notice}
          serviceName={serviceName}
        >
          {children}
        </TransactionLayout>
      )}
    </PageFrame.Root>
  )
}

/** The reference site's own provider and bare shell: the layout (T1, or T4 on a transaction route) holds the notice row first inside `banner`, then the page, which owns `main`. The frame puts the skip link first. */
export function ReferenceShell({
  locale,
  theme,
  children,
}: {
  locale: ReferenceLocale
  theme: ThemeOptions
  children: ReactNode
}) {
  return (
    <KvirnProvider
      locale={locale}
      messages={locale === 'sv' ? sv : undefined}
      timeZone="UTC"
      theme={theme}
      linkComponent={NextLink}
    >
      <ReferenceFrame locale={locale}>{children}</ReferenceFrame>
    </KvirnProvider>
  )
}
