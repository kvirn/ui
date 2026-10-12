'use client'
import { Kbd } from '@kvirn-ui/react'
import { useId } from 'react'
import { useKbdTexts } from './texts.ts'

export function ShortcutList() {
  const { texts } = useKbdTexts()
  const titleId = useId()
  return (
    <div>
      <p id={titleId}>{texts.shortcuts}</p>
      <ul aria-labelledby={titleId}>
        <li>
          <Kbd>
            <Kbd>Ctrl</Kbd>+<Kbd>S</Kbd>
          </Kbd>
          : {texts.save}
        </li>
        <li>
          <Kbd>
            <Kbd>Ctrl</Kbd>+<Kbd>Z</Kbd>
          </Kbd>
          : {texts.undo}
        </li>
        <li>
          <Kbd>Esc</Kbd>: {texts.closeDialog}
        </li>
      </ul>
    </div>
  )
}
