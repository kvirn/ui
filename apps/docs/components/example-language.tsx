'use client'
import { en } from '@kvirn-ui/i18n/en'
import { KvirnProvider, useLocale } from '@kvirn-ui/react'
import type { ReactNode } from 'react'

/**
 * Example text that fell back to English renders in a nested English provider, so the text and
 * the component strings share a language and the DOM gets `lang` from the provider (3.1.2).
 */
export function InEnglishWhenFallback({
  isFallback,
  children,
}: {
  isFallback: boolean
  children: ReactNode
}) {
  if (!isFallback) return children
  return (
    <KvirnProvider locale="en" messages={en}>
      <EnglishScope>{children}</EnglishScope>
    </KvirnProvider>
  )
}

function EnglishScope({ children }: { children: ReactNode }) {
  const { localeProps } = useLocale()
  return (
    <div className="docs-language-scope" {...localeProps}>
      {children}
    </div>
  )
}
