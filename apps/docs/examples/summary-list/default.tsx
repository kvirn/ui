'use client'
import { SummaryList } from '@kvirn-ui/react'
import { useSummaryListTexts } from './texts.ts'

export function DefaultSummaryList() {
  const { texts, textLang } = useSummaryListTexts()
  return (
    <SummaryList.Root lang={textLang}>
      <SummaryList.Row>
        <SummaryList.Key>{texts.name}</SummaryList.Key>
        <SummaryList.Value>{texts.nameValue}</SummaryList.Value>
        <SummaryList.Actions>
          <SummaryList.Change href="#step-name" />
        </SummaryList.Actions>
      </SummaryList.Row>
      <SummaryList.Row>
        <SummaryList.Key>{texts.email}</SummaryList.Key>
        <SummaryList.Value>{texts.emailValue}</SummaryList.Value>
        <SummaryList.Actions>
          <SummaryList.Change href="#step-email" />
        </SummaryList.Actions>
      </SummaryList.Row>
    </SummaryList.Root>
  )
}
