'use client'
import { CodeBlock } from '@kvirn-ui/react'
import { useCodeBlockTexts } from './texts.ts'
import { InEnglishWhenFallback } from '../../components/example-language.tsx'

export function NamedCopy() {
  const { texts, isFallback } = useCodeBlockTexts()
  return (
    <InEnglishWhenFallback isFallback={isFallback}>
      <CodeBlock.Root>
        <CodeBlock.Label>{texts.installLabel}</CodeBlock.Label>
        <CodeBlock.Code>pnpm add @kvirn-ui/react @kvirn-ui/theme</CodeBlock.Code>
        <CodeBlock.Copy>{texts.copyCommand}</CodeBlock.Copy>
      </CodeBlock.Root>
    </InEnglishWhenFallback>
  )
}
