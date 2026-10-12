'use client'
import { DefinitionList } from '@kvirn-ui/react'
import { useDefinitionListTexts } from './texts.ts'
import { InEnglishWhenFallback } from '../../components/example-language.tsx'

export function SeveralAnswers() {
  const { texts, isFallback } = useDefinitionListTexts()
  return (
    <InEnglishWhenFallback isFallback={isFallback}>
      <DefinitionList.Root>
        <DefinitionList.Row>
          <DefinitionList.Term>{texts.children}</DefinitionList.Term>
          <DefinitionList.Description>{texts.childOne}</DefinitionList.Description>
          <DefinitionList.Description>{texts.childTwo}</DefinitionList.Description>
          <DefinitionList.Actions>
            <DefinitionList.Change href="#step-children" />
          </DefinitionList.Actions>
        </DefinitionList.Row>
      </DefinitionList.Root>
    </InEnglishWhenFallback>
  )
}
