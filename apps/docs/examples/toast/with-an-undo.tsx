'use client'
import { Button, ButtonGroup, useToast } from '@kvirn-ui/react'
import { useState } from 'react'
import { useToastTexts } from './texts.ts'

export function WithAnUndo() {
  const { texts } = useToastTexts()
  const toast = useToast()
  const [deleted, setDeleted] = useState(false)
  return (
    <>
      <p>
        {texts.draftLabel} {deleted ? texts.draftRemoved : texts.draftKept}
      </p>
      <ButtonGroup aria-label={texts.draftActions}>
        <Button
          disabled={deleted}
          focusableWhenDisabled
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
        <Button disabled={!deleted} focusableWhenDisabled onClick={() => setDeleted(false)}>
          {texts.restoreDraft}
        </Button>
      </ButtonGroup>
    </>
  )
}
