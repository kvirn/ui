'use client'
import { Checkbox, Field, useQuickExit } from '@kvirn-ui/react'
import { useId, useState } from 'react'
import { useDemoLeave } from './demo-leave.tsx'
import { useQuickExitTexts } from './texts.ts'

export function OwnMarkup() {
  const { texts } = useQuickExitTexts()
  const { navigate, report } = useDemoLeave()
  const hintId = useId()
  // The demo only: the shortcut starts off so this page stays quiet for screen reader users.
  const [shortcut, setShortcut] = useState(false)
  const quickExit = useQuickExit({ href: texts.destination, navigate, shortcut })
  return (
    <div>
      <div {...quickExit.rootProps}>
        <a {...quickExit.linkProps} aria-describedby={shortcut ? hintId : undefined}>
          {quickExit.label}
        </a>
        {shortcut ? (
          <p {...quickExit.hintProps} id={hintId}>
            {quickExit.hint}
          </p>
        ) : null}
      </div>
      <Field.Root>
        <Checkbox checked={shortcut} onCheckedChange={setShortcut} />
        <Field.Label>{texts.tryShortcut}</Field.Label>
      </Field.Root>
      <p>
        <small>{texts.ownMarkup}</small>
      </p>
      {report}
    </div>
  )
}
