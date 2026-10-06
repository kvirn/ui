'use client'
import { Stack } from '@kvirn-ui/react'
import { useStackTexts } from './texts.ts'

export function Gaps() {
  const { texts, textLang } = useStackTexts()
  return (
    <Stack gap="8" lang={textLang}>
      {(['2', '4', '8'] as const).map((gap) => (
        <Stack key={gap} gap={gap}>
          {texts.gaps.related.map((line) => (
            <span key={line}>{line}</span>
          ))}
          <strong>
            {texts.gaps.label} {gap}
          </strong>
        </Stack>
      ))}
    </Stack>
  )
}
