'use client'
import { Button, useFocus } from '@kvirn-ui/react'
import { useState } from 'react'
import { useFocusTexts } from './texts.ts'
import { InEnglishWhenFallback } from '../../components/example-language.tsx'

export function RestoreDrawer() {
  const { texts, isFallback } = useFocusTexts()
  const [open, setOpen] = useState(false)
  const { scopeProps } = useFocus({ active: open })
  return (
    <InEnglishWhenFallback isFallback={isFallback}>
      <div>
        <Button onClick={() => setOpen(true)}>{texts.open}</Button>
        <aside {...scopeProps} aria-label={texts.filterLabel} hidden={!open}>
          <label>
            {texts.search} <input type="text" />
          </label>{' '}
          <Button onClick={() => setOpen(false)}>{texts.close}</Button>
        </aside>
      </div>
    </InEnglishWhenFallback>
  )
}
