'use client'
import { Button, useToast } from '@kvirn-ui/react'
import { useToastTexts } from './texts.ts'
import { InEnglishWhenFallback } from '../../components/example-language.tsx'

export function DefaultToast() {
  const { texts, isFallback } = useToastTexts()
  const toast = useToast()
  return (
    <InEnglishWhenFallback isFallback={isFallback}>
      <Button onClick={() => toast.show({ variant: 'success', title: texts.settingsSaved })}>
        {texts.saveSettings}
      </Button>
    </InEnglishWhenFallback>
  )
}
