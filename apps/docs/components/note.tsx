import { AlertBody, AlertInfo, AlertTitle, AlertWarning } from '@kvirn-ui/react'
import type { ReactNode } from 'react'
import { messages } from '../messages/en.ts'

const text = messages.docs.note

export type NoteKind = 'tip' | 'recipe' | 'reminder'

/**
 * Advice about the reader's code, as the library's own Alert: a reminder is a warning, a tip and
 * a recipe are information. The kind word is the Alert's title, set as a paragraph so it stays out
 * of the heading list, and the Alert shows its status word and icon, never colour alone. It
 * doesn't announce itself: it is page content.
 */
export function Note({
  kind,
  children,
  more,
}: {
  kind: NoteKind
  children: ReactNode
  more?: ReactNode
}) {
  const Root = kind === 'reminder' ? AlertWarning : AlertInfo
  return (
    <Root>
      <AlertTitle as="p">{text[kind]}</AlertTitle>
      <AlertBody>
        <p>{children}</p>
        {more}
      </AlertBody>
    </Root>
  )
}
