'use client'
import { Button, Progress } from '@kvirn-ui/react'
import { useState } from 'react'
import { useProgressTexts } from './texts.ts'
import { InEnglishWhenFallback } from '../../components/example-language.tsx'

export function SlowWait() {
  const { texts, isFallback } = useProgressTexts()
  const [isWaiting, setIsWaiting] = useState(false)
  return (
    <InEnglishWhenFallback isFallback={isFallback}>
      <div>
        <Button onClick={() => setIsWaiting(!isWaiting)}>
          {isWaiting ? texts.stop : texts.start}
        </Button>
        {isWaiting ? (
          <Progress.Root
            label={texts.slowSending}
            delayMilliseconds={500}
            slowAfterMilliseconds={4000}
          >
            <Progress.Indicator />
            <Progress.Label />
          </Progress.Root>
        ) : null}
      </div>
    </InEnglishWhenFallback>
  )
}
