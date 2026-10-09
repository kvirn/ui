'use client'
import { Button, Progress } from '@kvirn-ui/react'
import { useState } from 'react'
import { useProgressTexts } from './texts.ts'

export function DefaultProgress() {
  const { texts, textLang } = useProgressTexts()
  const [isWaiting, setIsWaiting] = useState(false)
  return (
    <div lang={textLang}>
      <Button onClick={() => setIsWaiting(!isWaiting)}>
        {isWaiting ? texts.stop : texts.start}
      </Button>
      {isWaiting ? (
        <Progress.Root label={texts.sending}>
          <Progress.Indicator />
          <Progress.Label />
        </Progress.Root>
      ) : null}
    </div>
  )
}
