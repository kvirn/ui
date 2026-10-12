'use client'
import { Toggle } from '@kvirn-ui/react'
import { useState } from 'react'
import { useToggleTexts } from './texts.ts'
import { InEnglishWhenFallback } from '../../components/example-language.tsx'

export function FilterList() {
  const { texts, isFallback } = useToggleTexts()
  const [isUnreadOnly, setIsUnreadOnly] = useState(false)
  const shown = texts.messages.filter((message) => !isUnreadOnly || message.isUnread)
  return (
    <InEnglishWhenFallback isFallback={isFallback}>
      <div>
        <Toggle pressed={isUnreadOnly} onPressedChange={setIsUnreadOnly}>
          {texts.unreadOnly}
        </Toggle>
        <ul>
          {shown.map((message) => (
            <li key={message.id}>{message.text}</li>
          ))}
        </ul>
      </div>
    </InEnglishWhenFallback>
  )
}
