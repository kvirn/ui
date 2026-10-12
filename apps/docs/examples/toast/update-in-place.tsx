'use client'
import { Button, useToast } from '@kvirn-ui/react'
import { useToastTexts } from './texts.ts'
import { InEnglishWhenFallback } from '../../components/example-language.tsx'

export function UpdateInPlace() {
  const { texts, isFallback } = useToastTexts()
  const toast = useToast()
  return (
    <InEnglishWhenFallback isFallback={isFallback}>
      <Button
        onClick={() =>
          toast.show({ id: 'draft-saved', variant: 'success', title: texts.draftSaved })
        }
      >
        {texts.saveDraft}
      </Button>
    </InEnglishWhenFallback>
  )
}
