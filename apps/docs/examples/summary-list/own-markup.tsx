'use client'
import { useSummaryList } from '@kvirn-ui/react'
import { useId } from 'react'
import { useSummaryListTexts } from './texts.ts'

export function OwnMarkup() {
  const { texts, textLang } = useSummaryListTexts()
  const summaryList = useSummaryList()
  const keyId = useId()
  const changeId = useId()
  return (
    <dl {...summaryList.rootProps} lang={textLang}>
      <div {...summaryList.rowProps}>
        <dt {...summaryList.keyProps} id={keyId}>
          {texts.name}
        </dt>
        <dd {...summaryList.valueProps}>{texts.nameValue}</dd>
        <dd {...summaryList.actionsProps}>
          <a {...summaryList.getChangeProps({ id: changeId, keyId })} href="#step-name">
            {summaryList.changeLabel}
          </a>
        </dd>
      </div>
    </dl>
  )
}
