'use client'
import { useDefinitionList } from '@kvirn-ui/react'
import { useId } from 'react'
import { useDefinitionListTexts } from './texts.ts'
import { InEnglishWhenFallback } from '../../components/example-language.tsx'

export function OwnMarkup() {
  const { texts, isFallback } = useDefinitionListTexts()
  const definitionList = useDefinitionList()
  const termId = useId()
  const changeId = useId()
  return (
    <InEnglishWhenFallback isFallback={isFallback}>
      <dl {...definitionList.rootProps}>
        <div {...definitionList.rowProps}>
          <dt {...definitionList.termProps} id={termId}>
            {texts.name}
          </dt>
          <dd {...definitionList.descriptionProps}>{texts.nameValue}</dd>
          <dd {...definitionList.actionsProps}>
            <a {...definitionList.getChangeProps({ id: changeId, termId })} href="#step-name">
              {definitionList.changeLabel}
            </a>
          </dd>
        </div>
      </dl>
    </InEnglishWhenFallback>
  )
}
