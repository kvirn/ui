'use client'
import { QuickExit } from '@kvirn-ui/react'
import { useDemoLeave } from './demo-leave.tsx'
import { useQuickExitTexts } from './texts.ts'

export function EndSession() {
  const { texts } = useQuickExitTexts()
  const { navigate, report } = useDemoLeave()
  return (
    <div>
      <QuickExit.Root navigate={navigate} shortcut={false}>
        {/* Your own endpoint: it ends the session, then sends the visitor on. */}
        <QuickExit.Link href={texts.endpoint} />
        <QuickExit.Hint />
      </QuickExit.Root>
      <p>{texts.signedIn}</p>
      <h4>{texts.reportHeading}</h4>
      <p>{texts.reportText}</p>
      {report}
    </div>
  )
}
