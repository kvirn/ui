'use client'
import { ScrollArea } from '@kvirn-ui/react'
import { FeesRows } from './fees-rows.tsx'
import { useScrollAreaTexts } from './texts.ts'

export function DefaultScrollArea() {
  const { texts, textLang } = useScrollAreaTexts()
  return (
    <ScrollArea aria-label={texts.feesLabel} lang={textLang} style={{ maxInlineSize: '24rem' }}>
      <FeesRows headers={texts.headers} rows={texts.rows} />
    </ScrollArea>
  )
}
