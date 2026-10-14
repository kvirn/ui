'use client'
import { CodeBlock, Stack } from '@kvirn-ui/react'
import { useCodeBlockTexts } from './texts.ts'

export function SeveralBlocks() {
  const { texts } = useCodeBlockTexts()
  return (
    <Stack className="kv-stack--gap-4">
      <CodeBlock.Root>
        <CodeBlock.Label>{texts.installLabel}</CodeBlock.Label>
        <CodeBlock.Code>pnpm add @kvirn-ui/react @kvirn-ui/theme</CodeBlock.Code>
        <CodeBlock.Copy
          messages={{
            label: texts.copyCommand,
            copied: texts.installCopied,
            failed: texts.installFailed,
          }}
        />
      </CodeBlock.Root>
      <CodeBlock.Root>
        <CodeBlock.Label>{texts.requestLabel}</CodeBlock.Label>
        <CodeBlock.Code>
          curl --request POST https://api.example.org/e-services/parking-permits/applications
        </CodeBlock.Code>
        <CodeBlock.Copy
          messages={{
            label: texts.copyRequest,
            copied: texts.requestCopied,
            failed: texts.requestFailed,
          }}
        />
      </CodeBlock.Root>
    </Stack>
  )
}
