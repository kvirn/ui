'use client'
import { ScrollArea } from '@kvirn-ui/react'
import { useScrollAreaTexts } from './texts.ts'

export function CodeSample() {
  const { texts } = useScrollAreaTexts()
  return (
    <ScrollArea aria-label={texts.codeLabel}>
      <pre>
        <code>{texts.code}</code>
      </pre>
    </ScrollArea>
  )
}
