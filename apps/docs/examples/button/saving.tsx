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
    <Button
      lang={textLang}
      disabled={isSaving}
      focusableWhenDisabled
      onClick={() => setIsSaving(true)}
    >
      {isSaving ? texts.button.saving : texts.button.saveDraft}
    </Button>
  )
}
