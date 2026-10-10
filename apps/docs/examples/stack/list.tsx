'use client'
import { Link, Stack } from '@kvirn-ui/react'
import { useStackTexts } from './texts.ts'

export function StackAsList() {
  const { texts, textLang } = useStackTexts()
  return (
    <Stack className="kv-stack--gap-4" as="ul" aria-label={texts.list.label} lang={textLang}>
      {texts.list.items.map((item) => (
        <li key={item}>
          <Link href="#">{item}</Link>
        </li>
      ))}
    </Stack>
  )
}
