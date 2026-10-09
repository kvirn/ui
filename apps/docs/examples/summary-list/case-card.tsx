'use client'
import { Card, Heading, Link, SummaryList } from '@kvirn-ui/react'
import { useSummaryListTexts } from './texts.ts'

export function CaseCard() {
  const { texts, textLang } = useSummaryListTexts()
  return (
    <Card.Root lang={textLang}>
      <Card.Header>
        <Heading as="h4">{texts.caseHeading}</Heading>
      </Card.Header>
      <Card.Body>
        <SummaryList.Root>
          <SummaryList.Row>
            <SummaryList.Key>{texts.caseNumber}</SummaryList.Key>
            <SummaryList.Value>{texts.caseNumberValue}</SummaryList.Value>
          </SummaryList.Row>
          <SummaryList.Row>
            <SummaryList.Key>{texts.status}</SummaryList.Key>
            <SummaryList.Value>{texts.statusValue}</SummaryList.Value>
          </SummaryList.Row>
          <SummaryList.Row>
            <SummaryList.Key>{texts.caseWorker}</SummaryList.Key>
            <SummaryList.Value>{texts.caseWorkerValue}</SummaryList.Value>
          </SummaryList.Row>
          <SummaryList.Row>
            <SummaryList.Key>{texts.decision}</SummaryList.Key>
            <SummaryList.Value>
              <Link href="#decision">{texts.decisionLink}</Link>
            </SummaryList.Value>
          </SummaryList.Row>
        </SummaryList.Root>
      </Card.Body>
    </Card.Root>
  )
}
