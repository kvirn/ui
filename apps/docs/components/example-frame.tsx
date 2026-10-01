'use client'
import type { KvirnMessages, LocaleCode } from '@kvirn-ui/i18n'
import { localeCodes } from '@kvirn-ui/i18n'
import { en } from '@kvirn-ui/i18n/en'
import { fi } from '@kvirn-ui/i18n/fi'
import { nb } from '@kvirn-ui/i18n/nb'
import { nn } from '@kvirn-ui/i18n/nn'
import { se } from '@kvirn-ui/i18n/se'
import { sv } from '@kvirn-ui/i18n/sv'
import { KvirnProvider, useLocale } from '@kvirn-ui/react'
import { Component, useId, useState } from 'react'
import type { ReactNode } from 'react'
import { SamiPendingNote } from './example-texts.tsx'
import { messages } from '../messages/en.ts'
import { CodeBlock } from './code-block.tsx'

const text = messages.docs.example
const catalogs: Record<LocaleCode, KvirnMessages> = { sv, fi, nb, nn, se, en }
const isLocaleCode = (value: string): value is LocaleCode =>
  (localeCodes as readonly string[]).includes(value)

/** An example that throws shows a message in its frame. The rest of the page keeps working. */
class ExampleErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  override state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  override render() {
    return this.state.hasError ? <p lang="en">{text.error}</p> : this.props.children
  }
}

/** The stage takes `lang` and `dir` from the example's own provider (3.1.2). */
function ExampleStage({ children }: { children: ReactNode }) {
  const { localeProps } = useLocale()
  return (
    <div className="docs-example-stage" {...localeProps}>
      <ExampleErrorBoundary>{children}</ExampleErrorBoundary>
    </div>
  )
}

/**
 * A live example in a `<figure>`: its own language select, a comfortable stage in a nested
 * provider, and the code below (docs-site.md §6). Changing the language changes only this
 * example, in place, so nothing is announced and focus stays on the select.
 */
export function ExampleFrame({
  caption,
  code,
  children,
}: {
  caption: string
  code: string
  children: ReactNode
}) {
  const [locale, setLocale] = useState<LocaleCode>('sv')
  const selectId = useId()
  return (
    <>
      {/* The frame is page chrome around a live example, not article content. */}
      <figure className="docs-example" data-kv-not-prose>
        <figcaption>{caption}</figcaption>
        <div className="docs-example-frame">
          <div className="docs-example-toolbar" data-kv-density="compact">
            <label htmlFor={selectId}>{text.languageLabel}</label>
            <select
              id={selectId}
              className="docs-select"
              value={locale}
              onChange={(event) => {
                const { value } = event.currentTarget
                if (isLocaleCode(value)) {
                  setLocale(value)
                }
              }}
            >
              {localeCodes.map((code) => (
                <option key={code} value={code} lang={code}>
                  {text.languages[code]}
                </option>
              ))}
            </select>
          </div>
          <KvirnProvider locale={locale} messages={catalogs[locale]}>
            <SamiPendingNote className="docs-example-note" />
            <ExampleStage>{children}</ExampleStage>
          </KvirnProvider>
        </div>
      </figure>
      <p className="docs-code-label">{text.codeHeading}</p>
      <CodeBlock code={code} />
    </>
  )
}
