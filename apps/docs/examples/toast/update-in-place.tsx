'use client'
import { Button, useToast } from '@kvirn-ui/react'
import { useToastTexts } from './texts.ts'

export function UpdateInPlace() {
  const { texts } = useToastTexts()
  const toast = useToast()
  return (
    <Button
      onClick={() => toast.show({ id: 'draft-saved', variant: 'success', title: texts.draftSaved })}
    >
      {texts.saveDraft}
    </Button>
  )
}
