'use client'
import { DefinitionList } from '@kvirn-ui/react'
import { useAddressInputTexts } from './texts.ts'

export function KnownAddress() {
  const { texts } = useAddressInputTexts()
  return (
    <DefinitionList.Root>
      <DefinitionList.Row>
        <DefinitionList.Term>{texts.addressTerm}</DefinitionList.Term>
        <DefinitionList.Description>{texts.addressValue}</DefinitionList.Description>
        <DefinitionList.Actions>
          <DefinitionList.Change href="#change-address" />
        </DefinitionList.Actions>
      </DefinitionList.Row>
    </DefinitionList.Root>
  )
}
