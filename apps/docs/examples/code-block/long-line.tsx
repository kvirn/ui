'use client'
import { CodeBlock } from '@kvirn-ui/react'
import { useCodeBlockTexts } from './texts.ts'
import { InEnglishWhenFallback } from '../../components/example-language.tsx'

export function LongLine() {
  const { texts, isFallback } = useCodeBlockTexts()
  return (
    <InEnglishWhenFallback isFallback={isFallback}>
      <CodeBlock.Root>
        <CodeBlock.Label>{texts.requestLabel}</CodeBlock.Label>
        <CodeBlock.Code>
          <code>
            curl --request POST https://api.example.org/e-services/parking-permits/applications
            --header &quot;Content-Type: application/json&quot; --data @application.json
          </code>
        </CodeBlock.Code>
        <CodeBlock.Copy />
      </CodeBlock.Root>
    </InEnglishWhenFallback>
  )
}
