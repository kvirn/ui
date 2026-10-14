'use client'
import { Button, useToast } from '@kvirn-ui/react'
import { useState } from 'react'
import { useToastTexts } from './texts.ts'

export function DefaultToast() {
  const { texts } = useToastTexts()
  const toast = useToast()
  const [isSaved, setIsSaved] = useState(false)
  return (
    <>
      {/* The result is shown in place as well: the toast is the second channel, never the only one. */}
      <p>{isSaved ? texts.settingsAreSaved : texts.settingsNotSavedYet}</p>
      <Button
        onClick={() => {
          setIsSaved(true)
          toast.show({ variant: 'success', title: texts.settingsSaved })
        }}
      >
        {texts.saveSettings}
      </Button>
    </>
  )
}
