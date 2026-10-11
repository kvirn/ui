'use client'
import { DefinitionList, useFormat } from '@kvirn-ui/react'
import { useLocalesTexts } from './texts.ts'

export function Formatting() {
  const { texts, textLang } = useLocalesTexts()
  const format = useFormat()
  return (
    <DefinitionList.Root lang={textLang}>
      <DefinitionList.Row>
        <DefinitionList.Term>{texts.amount}</DefinitionList.Term>
        <DefinitionList.Description>
          {format.number(1250.5, { style: 'currency', currency: 'SEK' })}
        </DefinitionList.Description>
      </DefinitionList.Row>
      <DefinitionList.Row>
        <DefinitionList.Term>{texts.date}</DefinitionList.Term>
        <DefinitionList.Description>
          {format.date('2026-10-14', { dateStyle: 'long' })}
        </DefinitionList.Description>
      </DefinitionList.Row>
      <DefinitionList.Row>
        <DefinitionList.Term>{texts.list}</DefinitionList.Term>
        <DefinitionList.Description>{format.list(texts.documents)}</DefinitionList.Description>
      </DefinitionList.Row>
    </DefinitionList.Root>
  )
}
