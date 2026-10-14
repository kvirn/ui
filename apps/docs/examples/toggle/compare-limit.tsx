'use client'
import { Toggle, VisuallyHidden, useAnnouncer } from '@kvirn-ui/react'
import { useState } from 'react'
import { useToggleTexts } from './texts.ts'

export function CompareLimit() {
  const { texts } = useToggleTexts()
  const { announce } = useAnnouncer()
  const [chosenIds, setChosenIds] = useState<string[]>([])
  const [limitMessage, setLimitMessage] = useState('')

  function change(id: string, isOn: boolean) {
    if (isOn && chosenIds.length >= texts.compareLimit) {
      // pressed is yours, so the toggle stays off until you change it. Say why nothing happened:
      // as text for everyone, and announced for people who can't see the page change.
      const message = texts.limitReached(texts.compareLimit)
      setLimitMessage(message)
      announce(message)
      return
    }
    setLimitMessage('')
    setChosenIds(isOn ? [...chosenIds, id] : chosenIds.filter((chosenId) => chosenId !== id))
  }

  return (
    <div>
      <ul>
        {texts.preschools.map((preschool) => (
          <li key={preschool.id}>
            {preschool.name}{' '}
            <Toggle
              pressed={chosenIds.includes(preschool.id)}
              onPressedChange={(isOn) => change(preschool.id, isOn)}
            >
              {texts.compare}
              <VisuallyHidden> {preschool.name}</VisuallyHidden>
            </Toggle>
          </li>
        ))}
      </ul>
      <p>{limitMessage || texts.comparing(chosenIds.length, texts.compareLimit)}</p>
    </div>
  )
}
