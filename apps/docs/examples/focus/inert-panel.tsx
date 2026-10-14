'use client'
import { Button, FocusScope } from '@kvirn-ui/react'
import { useState } from 'react'
import { useFocusTexts } from './texts.ts'

export function InertPanel() {
  const { texts } = useFocusTexts()
  const [open, setOpen] = useState(false)
  return (
    <div>
      <Button onClick={() => setOpen(true)}>{texts.openNotes}</Button>
      {/*
        contain="inert" makes the rest of the page inert while the panel is open, and removes it
        again when it closes. A way out is still needed: onEscape closes the panel.
      */}
      <FocusScope
        as="aside"
        active={open}
        contain="inert"
        onEscape={() => setOpen(false)}
        hidden={!open}
        aria-label={texts.notesLabel}
      >
        <label>
          {texts.note} <textarea />
        </label>{' '}
        <Button onClick={() => setOpen(false)}>{texts.saveNote}</Button>{' '}
        <Button onClick={() => setOpen(false)}>{texts.closeNotes}</Button>
      </FocusScope>
    </div>
  )
}
