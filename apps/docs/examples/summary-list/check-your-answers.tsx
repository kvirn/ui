'use client'
import { Heading, SummaryList } from '@kvirn-ui/react'
import { useSummaryListTexts } from './texts.ts'

export function CheckYourAnswers() {
  const { texts, textLang } = useSummaryListTexts()
  return (
    <section aria-labelledby="check-your-answers-heading" lang={textLang}>
      <Heading as="h4" id="check-your-answers-heading">
        {texts.heading}
      </Heading>
      <SummaryList.Root>
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
        <SummaryList.Row>
          <SummaryList.Key>{texts.address}</SummaryList.Key>
          <SummaryList.Value>{texts.addressValue}</SummaryList.Value>
          <SummaryList.Actions>
            <SummaryList.Change href="#step-address" />
          </SummaryList.Actions>
        </SummaryList.Row>
      </SummaryList.Root>
    </section>
  )
}
