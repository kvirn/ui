'use client'
import { CodeBlock } from '@kvirn-ui/react'
import { useCodeBlockTexts } from './texts.ts'

export function NamedCopy() {
  const { texts, textLang } = useCodeBlockTexts()
  return (
    <CodeBlock.Root>
      <CodeBlock.Label lang={textLang}>{texts.installLabel}</CodeBlock.Label>
      <CodeBlock.Code>pnpm add @kvirn-ui/react @kvirn-ui/theme</CodeBlock.Code>
      <CodeBlock.Copy lang={textLang}>{texts.copyCommand}</CodeBlock.Copy>
    </CodeBlock.Root>
  )
}
