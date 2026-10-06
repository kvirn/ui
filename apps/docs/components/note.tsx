import { CardRoot, Icon } from '@kvirn-ui/react'
import type { ReactNode } from 'react'
import { messages } from '../messages/en.ts'

const text = messages.docs.note

export type NoteKind = 'tip' | 'recipe' | 'reminder'

// Kind is told by the word and the icon's shape, never by colour (docs-component-page.md §3).
const icons = { tip: 'info', recipe: 'check', reminder: 'warning' } as const

/**
 * Advice about the reader's code, on a neutral Card. The kind word opens the text: it is not a
 * heading, so it stays out of the heading list. A message about the page or the library is an
 * Alert, not a note.
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
  return (
    <CardRoot className="kv-card--padding-sm kv-prose">
      <p>
        <Icon name={icons[kind]} /> <strong>{text[kind]}</strong> {children}
      </p>
      {more}
    </CardRoot>
  )
}
