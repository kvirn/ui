'use client'
import { SiteHeader } from '@kvirn-ui/patterns'
import type { ReactNode } from 'react'
import { referenceMessages } from '../../../../messages/reference.ts'
import type { ReferenceLocale } from '../../../../messages/reference.ts'
import { ReferenceLanguageLinks, ReferenceLogo } from './reference-header-parts.tsx'
import { ReferenceFooter } from './site-layout.tsx'

/**
 * T4, the transaction layout, as the FormPage content type has it: the banner holds the notice row,
 * the brand, the service's name, language links and one shortcut, with no search and no main menu,
 * so a form has nothing to leave by accident. The footer is the site's.
 */
export function TransactionLayout({
  locale,
  pathname,
  notice,
  serviceName,
  children,
}: {
  locale: ReferenceLocale
  pathname: string
  notice: ReactNode
  serviceName: string
  children: ReactNode
}) {
  const text = referenceMessages[locale].chrome
  return (
    <>
      <SiteHeader.Root>
        {notice}
        <SiteHeader.Masthead>
          <ReferenceLogo locale={locale} />
          <span>{serviceName}</span>
          <ReferenceLanguageLinks locale={locale} pathname={pathname} />
          <SiteHeader.Utility label={text.shortcuts}>
            <SiteHeader.UtilityLink href={`/reference/${locale}/contact`}>
              {text.contact}
            </SiteHeader.UtilityLink>
          </SiteHeader.Utility>
        </SiteHeader.Masthead>
      </SiteHeader.Root>
      {children}
      <ReferenceFooter locale={locale} />
    </>
  )
}
