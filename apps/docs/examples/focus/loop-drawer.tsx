'use client'
import { Button, FocusScope } from '@kvirn-ui/react'
import { useState } from 'react'
import { useFocusTexts } from './texts.ts'

export function LoopDrawer() {
  const { texts, textLang } = useFocusTexts()
  const [open, setOpen] = useState(false)
  return (
    <div lang={textLang}>
      <Button onClick={() => setOpen(true)}>{texts.open}</Button>
      <FocusScope
        as="aside"
        active={open}
        contain="loop"
        onEscape={() => setOpen(false)}
        hidden={!open}
        aria-label={texts.filterLabel}
      >
        <label>
          {texts.search} <input type="text" />
        </label>{' '}
        <Button>{texts.apply}</Button> <Button onClick={() => setOpen(false)}>{texts.close}</Button>
      </FocusScope>
    </div>
  )
}
