'use client'
import { Button, ButtonGroup, useToast } from '@kvirn-ui/react'
import { useState } from 'react'
import { useToastTexts } from './texts.ts'

export function WithAnUndo() {
  const { texts, textLang } = useToastTexts()
  const toast = useToast()
  const [deleted, setDeleted] = useState(false)
  return (
    <>
      <p lang={textLang}>
        {texts.draftLabel} <output>{deleted ? texts.draftRemoved : texts.draftKept}</output>
      </p>
      <ButtonGroup lang={textLang} aria-label={texts.deleteDraft}>
        <Button
          disabled={deleted}
          onClick={() => {
            setDeleted(true)
            toast.show({
              variant: 'success',
              title: texts.draftDeleted,
              action: { label: texts.undo, onPress: () => setDeleted(false) },
            })
          }}
        >
          {texts.deleteDraft}
        </Button>
        {/* The same undo on the page: the toast is a shortcut, never the only way back. */}
        <Button disabled={!deleted} onClick={() => setDeleted(false)}>
          {texts.restoreDraft}
        </Button>
      </ButtonGroup>
    </>
  )
}
