'use client'
import { DefinitionList, useFormat } from '@kvirn-ui/react'
import { useLocalesTexts } from './texts.ts'
import { InEnglishWhenFallback } from '../../components/example-language.tsx'

export function Formatting() {
  const { texts, isFallback } = useLocalesTexts()
  const format = useFormat()
  return (
    <InEnglishWhenFallback isFallback={isFallback}>
      <DefinitionList.Root>
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
    </InEnglishWhenFallback>
  )
}
