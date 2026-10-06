'use client'
import { SummaryList } from '@kvirn-ui/react'
import { useSummaryListTexts } from './texts.ts'

export function SeveralAnswers() {
  const { texts, textLang } = useSummaryListTexts()
  return (
    <SummaryList.Root lang={textLang}>
      <SummaryList.Row>
        <SummaryList.Key>{texts.children}</SummaryList.Key>
        <SummaryList.Value>{texts.childOne}</SummaryList.Value>
        <SummaryList.Value>{texts.childTwo}</SummaryList.Value>
        <SummaryList.Actions>
          <SummaryList.Change href="#step-children" />
        </SummaryList.Actions>
      </SummaryList.Row>
    </SummaryList.Root>
  )
}
