'use client'
import { DefinitionList } from '@kvirn-ui/react'
import { useDefinitionListTexts } from './texts.ts'
import { InEnglishWhenFallback } from '../../components/example-language.tsx'

export function DefaultDefinitionList() {
  const { texts, isFallback } = useDefinitionListTexts()
  return (
    <InEnglishWhenFallback isFallback={isFallback}>
      <DefinitionList.Root>
        <DefinitionList.Row>
          <DefinitionList.Term>{texts.name}</DefinitionList.Term>
          <DefinitionList.Description>{texts.nameValue}</DefinitionList.Description>
          <DefinitionList.Actions>
            <DefinitionList.Change href="#step-name" />
          </DefinitionList.Actions>
        </DefinitionList.Row>
        <DefinitionList.Row>
          <DefinitionList.Term>{texts.email}</DefinitionList.Term>
          <DefinitionList.Description>{texts.emailValue}</DefinitionList.Description>
          <DefinitionList.Actions>
            <DefinitionList.Change href="#step-email" />
          </DefinitionList.Actions>
        </DefinitionList.Row>
      </DefinitionList.Root>
    </InEnglishWhenFallback>
  )
}
