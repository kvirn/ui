'use client'
import { useFormat } from '@kvirn-ui/react'
import { useLocalesTexts } from './texts.ts'

export function Formatting() {
  const { texts, textLang } = useLocalesTexts()
  const format = useFormat()
  return (
    <dl lang={textLang}>
      <dt>{texts.amount}</dt>
      <dd>{format.number(1250.5, { style: 'currency', currency: 'SEK' })}</dd>
      <dt>{texts.date}</dt>
      <dd>{format.date('2026-10-14', { dateStyle: 'long' })}</dd>
      <dt>{texts.list}</dt>
      <dd>{format.list(texts.documents)}</dd>
    </dl>
  )
}
