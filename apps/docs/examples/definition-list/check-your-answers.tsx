'use client'
import { Heading, DefinitionList } from '@kvirn-ui/react'
import { useDefinitionListTexts } from './texts.ts'

export function CheckYourAnswers() {
  const { texts, textLang } = useDefinitionListTexts()
  return (
    <section aria-labelledby="check-your-answers-heading" lang={textLang}>
      <Heading as="h4" id="check-your-answers-heading">
        {texts.heading}
      </Heading>
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
        <DefinitionList.Row>
          <DefinitionList.Term>{texts.address}</DefinitionList.Term>
          <DefinitionList.Description>{texts.addressValue}</DefinitionList.Description>
          <DefinitionList.Actions>
            <DefinitionList.Change href="#step-address" />
          </DefinitionList.Actions>
        </DefinitionList.Row>
      </DefinitionList.Root>
    </section>
  )
}
