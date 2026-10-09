'use client'
import { Button, useProgress } from '@kvirn-ui/react'
import { useState } from 'react'
import { useProgressTexts } from './texts.ts'

function Waiting({ label }: { label: string }) {
  const progress = useProgress({ label })
  if (!progress.isShown) {
    return null
  }
  return (
    <div {...progress.rootProps}>
      <p {...progress.labelProps}>
        <span id={progress.labelId}>{progress.label}</span>
        {progress.isSlow ? <span> {progress.slowText}</span> : null}
      </p>
    </div>
  )
}

export function OwnMarkup() {
  const { texts, textLang } = useProgressTexts()
  const [isWaiting, setIsWaiting] = useState(false)
  return (
    <div lang={textLang}>
      <Button onClick={() => setIsWaiting(!isWaiting)}>
        {isWaiting ? texts.stop : texts.start}
      </Button>
      {isWaiting ? <Waiting label={texts.sending} /> : null}
    </div>
  )
}
