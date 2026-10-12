'use client'
import { CodeBlock } from '@kvirn-ui/react'
import { useCodeBlockTexts } from './texts.ts'

export function NamedCopy() {
  const { texts } = useCodeBlockTexts()
  return (
    <CodeBlock.Root>
      <CodeBlock.Label>{texts.installLabel}</CodeBlock.Label>
      <CodeBlock.Code>pnpm add @kvirn-ui/react @kvirn-ui/theme</CodeBlock.Code>
      <CodeBlock.Copy>{texts.copyCommand}</CodeBlock.Copy>
    </CodeBlock.Root>
  )
}
