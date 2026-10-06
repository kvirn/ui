'use client'
import { Button } from '@kvirn-ui/react'
import { useEffect, useState } from 'react'
import { useExampleTexts } from '../../components/example-texts.tsx'

export function Saving() {
  const { texts, textLang } = useExampleTexts()
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (!isSaving) {
      return
    }
    const timer = setTimeout(() => setIsSaving(false), 1500)
    return () => clearTimeout(timer)
  }, [isSaving])

  return (
    <Button lang={textLang} busy={isSaving} onClick={() => setIsSaving(true)}>
      {texts.button.saveDraft}
    </Button>
  )
}
