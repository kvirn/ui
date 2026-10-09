'use client'
import { Alert, Button, Progress } from '@kvirn-ui/react'
import { useEffect, useState } from 'react'
import { useProgressTexts } from './texts.ts'

export function BusyButton() {
  const { texts, textLang } = useProgressTexts()
  const [state, setState] = useState<'idle' | 'sending' | 'failed'>('idle')

  useEffect(() => {
    if (state !== 'sending') {
      return
    }
    const timer = setTimeout(() => setState('failed'), 4000)
    return () => clearTimeout(timer)
  }, [state])

  return (
    <div lang={textLang}>
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
  )
}
