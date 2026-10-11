'use client'
import { Badge, DefinitionList } from '@kvirn-ui/react'
import { useBadgeTexts } from './texts.ts'

export function WithContext() {
  const { texts, textLang } = useBadgeTexts()
  return (
    <DefinitionList.Root lang={textLang}>
      <DefinitionList.Row>
        <DefinitionList.Term>{texts.summary.case}</DefinitionList.Term>
        <DefinitionList.Description>{texts.summary.caseValue}</DefinitionList.Description>
      </DefinitionList.Row>
      <DefinitionList.Row>
        <DefinitionList.Term>{texts.summary.status}</DefinitionList.Term>
        <DefinitionList.Description>
          <Badge variant="success">{texts.summary.statusValue}</Badge>
        </DefinitionList.Description>
      </DefinitionList.Row>
    </DefinitionList.Root>
  )
}
