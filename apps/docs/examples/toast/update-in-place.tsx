'use client'
import { Button, useToast } from '@kvirn-ui/react'
import { useState } from 'react'
import { useToastTexts } from './texts.ts'

export function UpdateInPlace() {
  const { texts } = useToastTexts()
  const toast = useToast()
  const [isSaved, setIsSaved] = useState(false)
  return (
    <>
      <p>{isSaved ? texts.draftIsSaved : texts.draftNotSavedYet}</p>
      <Button
        onClick={() => {
          setIsSaved(true)
          toast.show({ id: 'draft-saved', variant: 'success', title: texts.draftSaved })
        }}
      >
        {texts.saveDraft}
      </Button>
    </>
  )
}
