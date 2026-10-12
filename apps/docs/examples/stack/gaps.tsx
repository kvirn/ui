'use client'
import { Stack } from '@kvirn-ui/react'
import { useStackTexts } from './texts.ts'
import { InEnglishWhenFallback } from '../../components/example-language.tsx'

export function Gaps() {
  const { texts, isFallback } = useStackTexts()
  return (
    <InEnglishWhenFallback isFallback={isFallback}>
      <Stack className="kv-stack--gap-8">
        {(['2', '4', '8'] as const).map((gap) => (
          <Stack key={gap} className={`kv-stack--gap-${gap}`}>
            {texts.gaps.related.map((line) => (
              <span key={line}>{line}</span>
            ))}
            <strong>
              {texts.gaps.label} {gap}
            </strong>
          </Stack>
        ))}
      </Stack>
    </InEnglishWhenFallback>
  )
}
