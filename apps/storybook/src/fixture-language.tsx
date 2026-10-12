import type { KvirnMessages } from '@kvirn-ui/i18n'
import { en } from '@kvirn-ui/i18n/en'
import { KvirnProvider, useLocale } from '@kvirn-ui/react'
import type { ReactNode } from 'react'

/** Fixture text that falls back to English renders in a nested English provider (3.1.2). */
export function InEnglishWhenFallback({
  isFallback,
  children,
}: {
  isFallback: boolean
  children: ReactNode
}) {
  const { dir } = useLocale()
  if (!isFallback) {
    return children
  }
  return (
    <KvirnProvider locale="en" dir={dir} messages={en}>
      <LocaleScope hasOwnDir={false}>{children}</LocaleScope>
    </KvirnProvider>
  )
}

// Without its own `dir`, the scope leaves `dir` to `<html>`: the story decorator sets the toolbar's
// direction there, not in a provider, so the context's `dir` would say `ltr` under an RTL toolbar.
function LocaleScope({ hasOwnDir, children }: { hasOwnDir: boolean; children: ReactNode }) {
  const { localeProps } = useLocale()
  return (
    <div
      className="kv-story-language-scope"
      lang={localeProps.lang}
      dir={hasOwnDir ? localeProps.dir : undefined}
    >
      {children}
    </div>
  )
}

/** A passage in another language: a nested provider with its catalog; the scope element carries `lang` and `dir`. */
export function InLanguage({
  locale,
  messages,
  dir,
  children,
}: {
  locale: string
  messages: KvirnMessages
  dir?: 'ltr' | 'rtl'
  children: ReactNode
}) {
  return (
    <KvirnProvider locale={locale} messages={messages} dir={dir}>
      <LocaleScope hasOwnDir={dir !== undefined}>{children}</LocaleScope>
    </KvirnProvider>
  )
}
