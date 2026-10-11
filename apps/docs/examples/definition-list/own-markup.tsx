'use client'
import { useDefinitionList } from '@kvirn-ui/react'
import { useId } from 'react'
import { useDefinitionListTexts } from './texts.ts'

export function OwnMarkup() {
  const { texts, textLang } = useDefinitionListTexts()
  const definitionList = useDefinitionList()
  const termId = useId()
  const changeId = useId()
  return (
    <dl {...definitionList.rootProps} lang={textLang}>
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
  )
}
