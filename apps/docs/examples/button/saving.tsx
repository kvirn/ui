'use client'
import { Button } from '@kvirn-ui/react'
import { useEffect, useState } from 'react'
import { useExampleTexts } from '../../components/example-texts.tsx'
import { InEnglishWhenFallback } from '../../components/example-language.tsx'

export function Saving() {
  const { texts, isFallback } = useExampleTexts()
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (!isSaving) {
      return
    }
    const timer = setTimeout(() => setIsSaving(false), 1500)
    return () => clearTimeout(timer)
  }, [isSaving])

  return (
    <InEnglishWhenFallback isFallback={isFallback}>
      <Button busy={isSaving} onClick={() => setIsSaving(true)}>
        {texts.button.saveDraft}
      </Button>
    </InEnglishWhenFallback>
  )
}
