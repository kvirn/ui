'use client'
import { Link, Stack } from '@kvirn-ui/react'
import { useStackTexts } from './texts.ts'
import { InEnglishWhenFallback } from '../../components/example-language.tsx'

export function StackAsList() {
  const { texts, isFallback } = useStackTexts()
  return (
    <InEnglishWhenFallback isFallback={isFallback}>
      <Stack className="kv-stack--gap-4" as="ul" aria-label={texts.list.label}>
        {texts.list.items.map((item) => (
          <li key={item}>
            <Link href="#">{item}</Link>
          </li>
        ))}
      </Stack>
    </InEnglishWhenFallback>
  )
}
