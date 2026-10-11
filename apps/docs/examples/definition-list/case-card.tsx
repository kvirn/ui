'use client'
import { Card, Heading, Link, DefinitionList } from '@kvirn-ui/react'
import { useDefinitionListTexts } from './texts.ts'

export function CaseCard() {
  const { texts, textLang } = useDefinitionListTexts()
  return (
    <Card.Root lang={textLang}>
      <Card.Header>
        <Heading as="h4">{texts.caseHeading}</Heading>
      </Card.Header>
      <Card.Body>
        <DefinitionList.Root>
          <DefinitionList.Row>
            <DefinitionList.Term>{texts.caseNumber}</DefinitionList.Term>
            <DefinitionList.Description>{texts.caseNumberValue}</DefinitionList.Description>
          </DefinitionList.Row>
          <DefinitionList.Row>
            <DefinitionList.Term>{texts.status}</DefinitionList.Term>
            <DefinitionList.Description>{texts.statusValue}</DefinitionList.Description>
          </DefinitionList.Row>
          <DefinitionList.Row>
            <DefinitionList.Term>{texts.caseWorker}</DefinitionList.Term>
            <DefinitionList.Description>{texts.caseWorkerValue}</DefinitionList.Description>
          </DefinitionList.Row>
          <DefinitionList.Row>
            <DefinitionList.Term>{texts.decision}</DefinitionList.Term>
            <DefinitionList.Description>
              <Link href="#decision">{texts.decisionLink}</Link>
            </DefinitionList.Description>
          </DefinitionList.Row>
        </DefinitionList.Root>
      </Card.Body>
    </Card.Root>
  )
}
