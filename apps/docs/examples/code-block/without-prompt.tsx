'use client'
import { CodeBlock } from '@kvirn-ui/react'
import { useCodeBlockTexts } from './texts.ts'

const command = 'curl https://api.example.org/e-services/status'

export function WithoutPrompt() {
  const { texts } = useCodeBlockTexts()
  return (
    <CodeBlock.Root>
      <CodeBlock.Label>{texts.statusLabel}</CodeBlock.Label>
      <CodeBlock.Code>{`$ ${command}`}</CodeBlock.Code>
      {/* The reader sees the prompt. Copy writes only the command. */}
      <CodeBlock.Copy text={command} />
    </CodeBlock.Root>
  )
}
