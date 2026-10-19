'use client'
import { fi } from '@kvirn-ui/i18n/fi'
import { KvirnProvider, Link, useLocale } from '@kvirn-ui/react'
import type { ReactNode } from 'react'
import { useKvirnProviderTexts } from './texts.ts'

export function AnotherLanguage() {
  const { texts } = useKvirnProviderTexts()
  return (
    <div>
      <p>{texts.pageIntro}</p>
      <KvirnProvider locale="fi-FI" messages={fi}>
        <FinnishPart>
          <p>{texts.finnishNotice}</p>
          <p>
            <Link.Root href="https://www.suomi.fi/" target="_blank">
              {texts.finnishLink} <Link.NewTabNotice />
            </Link.Root>
          </p>
        </FinnishPart>
      </KvirnProvider>
    </div>
  )
}

// The provider renders no element, so the element that starts the part carries the language.
function FinnishPart({ children }: { children: ReactNode }) {
  const { localeProps } = useLocale()
  return <section {...localeProps}>{children}</section>
}
