'use client'
import { Button, FocusScope } from '@kvirn-ui/react'
import { useState } from 'react'
import { useFocusTexts } from './texts.ts'

export function HelpPanel() {
  const { texts } = useFocusTexts()
  const [open, setOpen] = useState(false)
  return (
    <div>
      <Button onClick={() => setOpen(true)}>{texts.openHelp}</Button>
      {/*
        The only control is the Close button, after the text. The default start, the first Tab
        stop, would skip the text. "container" starts at the panel itself, and Tab then goes on
        to the first control.
      */}
      <FocusScope
        as="aside"
        active={open}
        initialFocus="container"
        hidden={!open}
        aria-label={texts.helpLabel}
      >
        <p>{texts.helpFirst}</p>
        <p>{texts.helpSecond}</p>
        <p>{texts.helpThird}</p>
        <Button onClick={() => setOpen(false)}>{texts.closeHelp}</Button>
      </FocusScope>
    </div>
  )
}
