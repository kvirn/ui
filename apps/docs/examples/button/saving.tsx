'use client'
import { Button, ButtonGroup, Progress } from '@kvirn-ui/react'
import { useEffect, useState } from 'react'
import { useExampleTexts } from '../../components/example-texts.tsx'
import { useButtonTexts } from './texts.ts'

export function Saving() {
  const { texts } = useExampleTexts()
  const { texts: buttonTexts } = useButtonTexts()
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (!isSaving) {
      return
    }
    const timer = setTimeout(() => setIsSaving(false), 3000)
    return () => clearTimeout(timer)
  }, [isSaving])

  return (
    <ButtonGroup>
      <Button busy={isSaving} onClick={() => setIsSaving(true)}>
        {texts.button.saveDraft}
      </Button>
      {isSaving ? (
        <Progress.Root label={buttonTexts.saving}>
          <Progress.Label />
        </Progress.Root>
      ) : null}
    </ButtonGroup>
  )
}
