import { Heading, Link } from '@kvirn-ui/react'
import type { ReactNode } from 'react'
import { messages } from '../messages/en.ts'
import { apiRowId } from './api-ids.ts'
import { ExampleFrame } from './example-frame.tsx'

const text = messages.docs.useCase

export interface PropUsed {
  /** The API part the row is under: `Tabs.Tab`, or `apiHookPart('useTabs', 'options')` for a hook. */
  part: string
  /** What the reader sees after "on", when it differs from `part`: `useTabs (options)`. */
  label?: string
  prop: string
}

/**
 * One use case under "Use cases" (docs-component-page.md §4.4): the user's situation as an
 * `h3`, why, the live example and its code, then the props it uses as links to the API rows.
 */
export function UseCase({
  id,
  title,
  why,
  code,
  propsUsed = [],
  note,
  children,
}: {
  id: string
  title: string
  why: ReactNode
  /** The example file's own text, from `readExampleSource`. */
  code: string
  propsUsed?: readonly PropUsed[]
  note?: ReactNode
  children: ReactNode
}) {
  return (
    <>
      <Heading as="h3" id={id}>
        {title}
      </Heading>
      <p>{why}</p>
      <ExampleFrame headingId={id} code={code}>
        {children}
      </ExampleFrame>
      {propsUsed.length > 0 && (
        <>
          <p>{text.propsUsed}</p>
          <ul>
            {propsUsed.map(({ part, prop, label }) => (
              <li key={`${part}.${prop}`}>
                <Link href={`#${apiRowId(part, prop)}`}>
                  <code>{prop}</code>
                </Link>{' '}
                {text.propOn} {label ?? part}
              </li>
            ))}
          </ul>
        </>
      )}
      {note}
    </>
  )
}
