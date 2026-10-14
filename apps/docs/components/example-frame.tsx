'use client'
import { en } from '@kvirn-ui/i18n/en'
import { Card, KvirnProvider, useLocale } from '@kvirn-ui/react'
import { Component, useEffect, useId, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { messages } from '../messages/en.ts'
import {
  CodeFileName,
  CodeScroll,
  CodeTools,
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
  headingId,
  code: source,
  language = 'tsx',
  children,
}: {
  /** The heading the page already has right above the example: it names the figure. */
  headingId: string
  code: string
  language?: CodeLanguage
  children: ReactNode
}) {
  const [isCodeOpen, setIsCodeOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const codeRef = useRef<HTMLElement>(null)
  const panelId = useId()
  const codeLabelId = useId()
  // A first line `// button/default.tsx` is the file the code is in: the code bar shows it,
  // and a copy holds only the code.
  const { fileName, note, code } = splitFileName(source, undefined)
  const lines = useCodeLines(code, language)
  const { status, copy } = useCodeCopy({ code, codeRef })

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
    <Card.Root as="figure" aria-labelledby={headingId} className="kv-card--dividers">
      <KvirnProvider locale="en" messages={en}>
        <Card.Body className="kv-card-body--padding-lg">
          <ExampleStage>{children}</ExampleStage>
        </Card.Body>
      </KvirnProvider>
      <Card.Footer className="docs-code-bar">
        <span className="docs-code-meta">
          {fileName !== undefined && <CodeFileName fileName={fileName} note={note} />}
        </span>
        <DocsDisclosure
          className="docs-disclosure kv-button--link"
          controls={panelId}
          isOpen={isCodeOpen}
          onToggle={() => setIsCodeOpen((isOpen) => !isOpen)}
        >
          {codeText.toggle({ count: lines.length })}
        </DocsDisclosure>
      </Card.Footer>
      <div id={panelId} ref={panelRef} className="docs-code docs-code-panel" hidden={!isCodeOpen}>
        <span id={codeLabelId} hidden>
          {codeText.label}
        </span>
        <CodeTools status={status} onCopy={copy} />
        <CodeScroll lines={lines} codeRef={codeRef} labelledBy={`${headingId} ${codeLabelId}`} />
      </div>
    </Card.Root>
  )
}
