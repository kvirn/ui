'use client'
import { Button, useToast } from '@kvirn-ui/react'
import { useToastTexts } from './texts.ts'

export function DefaultToast() {
  const { texts } = useToastTexts()
  const toast = useToast()
  return (
    <Button onClick={() => toast.show({ variant: 'success', title: texts.settingsSaved })}>
      {texts.saveSettings}
    </Button>
  )
}
