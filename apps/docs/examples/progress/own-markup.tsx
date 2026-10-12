'use client'
import { Button, useProgress } from '@kvirn-ui/react'
import { useState } from 'react'
import { useProgressTexts } from './texts.ts'
import { InEnglishWhenFallback } from '../../components/example-language.tsx'

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
  const { texts, isFallback } = useProgressTexts()
  const [isWaiting, setIsWaiting] = useState(false)
  return (
    <InEnglishWhenFallback isFallback={isFallback}>
      <div>
        <Button onClick={() => setIsWaiting(!isWaiting)}>
          {isWaiting ? texts.stop : texts.start}
        </Button>
        {isWaiting ? <Waiting label={texts.sending} /> : null}
      </div>
    </InEnglishWhenFallback>
  )
}
