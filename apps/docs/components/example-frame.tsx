'use client'
import type { KvirnMessages } from '@kvirn-ui/i18n'
import { en } from '@kvirn-ui/i18n/en'
import { sv } from '@kvirn-ui/i18n/sv'
import { Card, Field, Heading, KvirnProvider, Listbox, useLocale } from '@kvirn-ui/react'
import { Component, useEffect, useId, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { SamiPendingNote } from './example-texts.tsx'
import { messages } from '../messages/en.ts'
import { CodeCopyButton, CodeScroll, CodeStatus, useCodeCopy, useCodeLines } from './code-block.tsx'
import { DocsDisclosure } from './docs-disclosure.tsx'
import type { CodeLanguage } from '../lib/highlight.ts'

const text = messages.docs.example
const codeText = messages.docs.code
const exampleLocales = ['sv', 'en'] as const
type ExampleLocale = (typeof exampleLocales)[number]
const catalogs: Record<ExampleLocale, KvirnMessages> = { sv, en }

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
 * provider, and a code bar with the code behind a disclosure (docs/design/docs-code.md). Changing the language changes only this
 * example, in place, so nothing is announced and focus stays on the select.
 */
export function ExampleFrame({
  caption,
  headingId,
  code,
  language = 'tsx',
  children,
}: {
  /** Names the figure with its own `h3`. */
  caption?: string
  /** Names the figure with a heading the page already has, so the title isn't said twice. */
  headingId?: string
  code: string
  language?: CodeLanguage
  children: ReactNode
}) {
  const [locale, setLocale] = useState<ExampleLocale>('sv')
  const [isCodeOpen, setIsCodeOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const codeRef = useRef<HTMLElement>(null)
  const panelId = useId()
  const codeLabelId = useId()
  const lines = useCodeLines(code, language)
  const { status, copy } = useCodeCopy({
    code,
    codeRef,
    onFailed: () => setIsCodeOpen(true),
  })
  const ownTitleId = useId()
  const titleId = headingId ?? ownTitleId

  // React only knows `hidden` as a boolean, so the server renders plain `hidden` (found by
  // nobody, shown without JavaScript) and this upgrades it to `until-found`.
  useEffect(() => {
    if (!isCodeOpen) {
      panelRef.current?.setAttribute('hidden', 'until-found')
    }
  }, [isCodeOpen])

  // Find in page opens a panel that is `hidden="until-found"`: keep the toggle's state in step.
  useEffect(() => {
    const panel = panelRef.current
    const open = () => setIsCodeOpen(true)
    panel?.addEventListener('beforematch', open)
    return () => panel?.removeEventListener('beforematch', open)
  }, [])

  return (
    <Card.Root render={<figure aria-labelledby={titleId} />} className="kv-card--dividers">
      <Card.Header className="docs-example-header">
        {headingId === undefined && (
          <Heading level={3} size="heading-5" id={titleId}>
            {caption}
          </Heading>
        )}
        <Field.Root>
          <Field.Label marker="none">{text.languageLabel}</Field.Label>
          <Listbox.Root
            native="always"
            items={exampleLocales}
            itemToString={(code) => text.languages[code]}
            itemToLang={(code) => code}
            value={locale}
            onValueChange={(value) => {
              const option = exampleLocales.find((candidate) => candidate === value)
              if (option !== undefined) {
                setLocale(option)
              }
            }}
          />
        </Field.Root>
      </Card.Header>
      <KvirnProvider locale={locale} messages={catalogs[locale]}>
        <Card.Body className="kv-card-body--padding-lg">
          <SamiPendingNote />
          <ExampleStage>{children}</ExampleStage>
        </Card.Body>
      </KvirnProvider>
      <Card.Footer className="docs-code-bar">
        <DocsDisclosure
          className="docs-disclosure"
          controls={panelId}
          isOpen={isCodeOpen}
          onToggle={() => setIsCodeOpen((isOpen) => !isOpen)}
        >
          {codeText.toggle({ count: lines.length })}
        </DocsDisclosure>
        <span className="docs-code-language">{codeText.languages[language]}</span>
        <CodeCopyButton onCopy={copy} />
        <CodeStatus status={status} />
      </Card.Footer>
      <div id={panelId} ref={panelRef} className="docs-code docs-code-panel" hidden={!isCodeOpen}>
        <span id={codeLabelId} hidden>
          {codeText.label}
        </span>
        <CodeScroll lines={lines} codeRef={codeRef} labelledBy={`${titleId} ${codeLabelId}`} />
      </div>
    </Card.Root>
  )
}
