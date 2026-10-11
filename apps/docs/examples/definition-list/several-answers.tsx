'use client'
import { DefinitionList } from '@kvirn-ui/react'
import { useDefinitionListTexts } from './texts.ts'

export function SeveralAnswers() {
  const { texts, textLang } = useDefinitionListTexts()
  return (
    <DefinitionList.Root lang={textLang}>
      <DefinitionList.Row>
        <DefinitionList.Term>{texts.children}</DefinitionList.Term>
        <DefinitionList.Description>{texts.childOne}</DefinitionList.Description>
        <DefinitionList.Description>{texts.childTwo}</DefinitionList.Description>
        <DefinitionList.Actions>
          <DefinitionList.Change href="#step-children" />
        </DefinitionList.Actions>
      </DefinitionList.Row>
    </DefinitionList.Root>
  )
}
