'use client'
import { Button, CopyButton } from '@kvirn-ui/react'
import { useId, useRef, useState } from 'react'
import { useCopyButtonTexts } from './texts.ts'

export function NotReady() {
  const { texts } = useCopyButtonTexts()
  const numberRef = useRef<HTMLElement>(null)
  const reasonId = useId()
  const [isSent, setIsSent] = useState(false)
  return (
    <div>
      <Button className="kv-button--primary" onClick={() => setIsSent(true)}>
        {texts.sendApplication}
      </Button>
      <output>{isSent ? texts.sent : null}</output>
      {isSent ? (
        <p>
          {texts.yourNumber} <strong ref={numberRef}>{texts.referenceNumber}</strong>
        </p>
      ) : (
        <p id={reasonId}>{texts.notYet}</p>
      )}
      <CopyButton
        text={texts.referenceNumber}
        textRef={numberRef}
        disabled={!isSent}
        focusableWhenDisabled
        aria-describedby={isSent ? undefined : reasonId}
      >
        {texts.copyNumber}
      </CopyButton>
    </div>
  )
}
