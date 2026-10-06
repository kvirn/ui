'use client'
import { Link, Stack } from '@kvirn-ui/react'
import { useStackTexts } from './texts.ts'

export function StackAsList() {
  const { texts, textLang } = useStackTexts()
  return (
    <Stack gap="4" render={<ul role="list" aria-label={texts.list.label} />} lang={textLang}>
      {texts.list.items.map((item) => (
        <li key={item}>
          <Link href="#">{item}</Link>
        </li>
      ))}
    </Stack>
  )
}
