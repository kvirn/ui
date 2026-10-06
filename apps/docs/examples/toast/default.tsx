'use client'
import { Button, useToast } from '@kvirn-ui/react'
import { useToastTexts } from './texts.ts'

export function DefaultToast() {
  const { texts, textLang } = useToastTexts()
  const toast = useToast()
  return (
    <Button
      lang={textLang}
      onClick={() => toast.show({ variant: 'success', title: texts.settingsSaved })}
    >
      {texts.saveSettings}
    </Button>
  )
}
