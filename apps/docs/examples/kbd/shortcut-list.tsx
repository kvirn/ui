'use client'
import { Kbd } from '@kvirn-ui/react'
import { useId } from 'react'
import { useKbdTexts } from './texts.ts'

export function ShortcutList() {
  const { texts, textLang } = useKbdTexts()
  const titleId = useId()
  return (
    <div lang={textLang}>
      <p id={titleId}>{texts.shortcuts}</p>
      <ul aria-labelledby={titleId}>
        <li>
          <Kbd>
            <Kbd lang="en">Ctrl</Kbd>+<Kbd lang="en">S</Kbd>
          </Kbd>
          : {texts.save}
        </li>
        <li>
          <Kbd>
            <Kbd lang="en">Ctrl</Kbd>+<Kbd lang="en">Z</Kbd>
          </Kbd>
          : {texts.undo}
        </li>
        <li>
          <Kbd lang="en">Esc</Kbd>: {texts.closeDialog}
        </li>
      </ul>
    </div>
  )
}
