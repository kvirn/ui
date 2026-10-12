'use client'
import { Alert, Button, Progress } from '@kvirn-ui/react'
import { useEffect, useState } from 'react'
import { useProgressTexts } from './texts.ts'
import { InEnglishWhenFallback } from '../../components/example-language.tsx'

export function BusyButton() {
  const { texts, isFallback } = useProgressTexts()
  const [state, setState] = useState<'idle' | 'sending' | 'failed'>('idle')

  useEffect(() => {
    if (state !== 'sending') {
      return
    }
    const timer = setTimeout(() => setState('failed'), 4000)
    return () => clearTimeout(timer)
  }, [state])

  return (
    <InEnglishWhenFallback isFallback={isFallback}>
      <div>
        <div className="kv-button-group">
          <Button
            className="kv-button--primary"
            busy={state === 'sending'}
            onClick={() => setState('sending')}
          >
            {state === 'failed' ? texts.retry : texts.send}
          </Button>
          {state === 'sending' ? (
            <Progress.Root label={texts.sending}>
              <Progress.Label />
            </Progress.Root>
          ) : null}
        </div>
        {state === 'failed' ? (
          <Alert.Danger announce="polite">
            <Alert.Title>{texts.failed}</Alert.Title>
          </Alert.Danger>
        ) : null}
      </div>
    </InEnglishWhenFallback>
  )
}
