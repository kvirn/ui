'use client'
import { CodeBlock } from '@kvirn-ui/react'
import { useCodeBlockTexts } from './texts.ts'

export function LongLine() {
  const { texts, textLang } = useCodeBlockTexts()
  return (
    <CodeBlock.Root>
      <CodeBlock.Label lang={textLang}>{texts.requestLabel}</CodeBlock.Label>
      <CodeBlock.Code>
        <code>
          curl --request POST https://api.example.org/e-services/parking-permits/applications
          --header &quot;Content-Type: application/json&quot; --data @application.json
        </code>
      </CodeBlock.Code>
      <CodeBlock.Copy />
    </CodeBlock.Root>
  )
}
