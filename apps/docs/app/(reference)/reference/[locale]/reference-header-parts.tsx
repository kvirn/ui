'use client'
import { ApplicationLogo, LanguageLinks } from '@kvirn-ui/patterns'
import { kvirnbyMark } from '@kvirn-ui/patterns/fixtures'
import { referenceLocales, referenceMessages } from '../../../../messages/reference.ts'
import type { ReferenceLocale } from '../../../../messages/reference.ts'

/** The same page in the other language: the slugs are the same in sv and en, so only the locale segment changes. */
export const pathInLocale = (pathname: string, from: ReferenceLocale, to: ReferenceLocale) =>
  pathname.replace(`/reference/${from}`, `/reference/${to}`)

export function ReferenceLogo({
  locale,
  current,
}: {
  locale: ReferenceLocale
  current?: 'page' | undefined
}) {
  const text = referenceMessages[locale].chrome
  return (
    <ApplicationLogo.Root href={`/reference/${locale}`} current={current}>
      <ApplicationLogo.Logo src={kvirnbyMark} />
      <ApplicationLogo.Name>{text.logoName}</ApplicationLogo.Name>
    </ApplicationLogo.Root>
  )
}

export function ReferenceLanguageLinks({
  locale,
  pathname,
}: {
  locale: ReferenceLocale
  pathname: string
}) {
  const text = referenceMessages[locale].chrome
  return (
    <LanguageLinks.Root label={text.language}>
      {referenceLocales.map((target) => (
        <LanguageLinks.Link
          key={target}
          href={pathInLocale(pathname, locale, target)}
          lang={target}
          hrefLang={target}
          current={target === locale}
        >
          {text.languageNames[target]}
        </LanguageLinks.Link>
      ))}
    </LanguageLinks.Root>
  )
}
