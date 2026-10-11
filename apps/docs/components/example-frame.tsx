'use client'
import { en } from '@kvirn-ui/i18n/en'
import { Card, Heading, KvirnProvider, useLocale } from '@kvirn-ui/react'
import { Component, useEffect, useId, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { messages } from '../messages/en.ts'
import {
  CodeCopyButton,
  CodeFileName,
  CodeScroll,
  CodeStatus,
  splitFileName,
  useCodeCopy,
  useCodeLines,
} from './code-block.tsx'
import { DocsDisclosure } from './docs-disclosure.tsx'
import type { CodeLanguage } from '../lib/highlight.ts'

const text = messages.docs.example
const codeText = messages.docs.code

/** An example that throws shows a message in its frame. The rest of the page keeps working. */
export class ExampleErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
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
 * A live example in a `<figure>`: a comfortable stage in a nested provider in the example
 * language chosen in Display settings, and a code bar with the code behind a disclosure
 * (docs/design/docs-code.md).
 */
export function ExampleFrame({
  caption,
  headingId,
  code: source,
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
  const [isCodeOpen, setIsCodeOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const codeRef = useRef<HTMLElement>(null)
  const panelId = useId()
  const codeLabelId = useId()
  // A first line `// button/default.tsx` is the file the code is in: the panel's header shows it,
  // and a copy holds only the code.
  const { fileName, note, code } = splitFileName(source, undefined)
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
    <Card.Root as="figure" aria-labelledby={titleId} className="kv-card--dividers">
      <Card.Header className="docs-example-header">
        {headingId === undefined && (
          <Heading as="h3" size="heading-5" id={titleId}>
            {caption}
          </Heading>
        )}
      </Card.Header>
      <KvirnProvider locale="en" messages={en}>
        <Card.Body className="kv-card-body--padding-lg">
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
        {fileName !== undefined && (
          <div className="docs-code-header">
            <CodeFileName fileName={fileName} note={note} />
          </div>
        )}
        <span id={codeLabelId} hidden>
          {codeText.label}
        </span>
        <CodeScroll lines={lines} codeRef={codeRef} labelledBy={`${titleId} ${codeLabelId}`} />
      </div>
    </Card.Root>
  )
}
