'use client'
import { Checkbox, Field, QuickExit } from '@kvirn-ui/react'
import { useState } from 'react'
import { useDemoLeave } from './demo-leave.tsx'
import { useQuickExitTexts } from './texts.ts'

export function DefaultQuickExit() {
  const { texts } = useQuickExitTexts()
  const { navigate, report } = useDemoLeave()
  // The demo only: the shortcut starts off so this page stays quiet for screen reader users.
  const [shortcut, setShortcut] = useState(false)
  return (
    <div>
      <QuickExit.Root navigate={navigate} shortcut={shortcut}>
        <QuickExit.Link href={texts.destination} />
        <QuickExit.Hint />
      </QuickExit.Root>
      <Field.Root>
        <Checkbox checked={shortcut} onCheckedChange={setShortcut} />
        <Field.Label>{texts.tryShortcut}</Field.Label>
        <Field.HelpText>{texts.tryShortcutHelp}</Field.HelpText>
      </Field.Root>
      {report}
    </div>
  )
}
