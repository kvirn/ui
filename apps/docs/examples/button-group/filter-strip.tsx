'use client'
import { ButtonGroup, Toggle } from '@kvirn-ui/react'
import { useState } from 'react'
import { useButtonGroupTexts } from './texts.ts'

export function FilterStrip() {
  const { texts } = useButtonGroupTexts()
  const [isMine, setIsMine] = useState(false)
  const [isOverdue, setIsOverdue] = useState(false)
  const [needsReply, setNeedsReply] = useState(false)
  const shown = texts.cases.filter(
    (item) =>
      (!isMine || item.isMine) &&
      (!isOverdue || item.isOverdue) &&
      (!needsReply || item.needsReply),
  )
  return (
    <div>
      <ButtonGroup className="kv-button-group--attached" aria-label={texts.filterName}>
        <Toggle pressed={isMine} onPressedChange={setIsMine}>
          {texts.assignedToMe}
        </Toggle>
        <Toggle pressed={isOverdue} onPressedChange={setIsOverdue}>
          {texts.overdue}
        </Toggle>
        <Toggle pressed={needsReply} onPressedChange={setNeedsReply}>
          {texts.needsReply}
        </Toggle>
      </ButtonGroup>
      <output>{texts.showing(shown.length, texts.cases.length)}</output>
      <ul>
        {shown.map((item) => (
          <li key={item.id}>{item.text}</li>
        ))}
      </ul>
    </div>
  )
}
