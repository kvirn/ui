'use client'
import { QuickExit } from '@kvirn-ui/react'
import { useDemoLeave } from './demo-leave.tsx'
import { useQuickExitTexts } from './texts.ts'

export function NoShortcut() {
  const { texts } = useQuickExitTexts()
  const { navigate, report } = useDemoLeave()
  return (
    <div>
      <QuickExit.Root navigate={navigate} shortcut={false}>
        <QuickExit.Link href={texts.destination} />
      </QuickExit.Root>
      <h4>{texts.healthHeading}</h4>
      <p>{texts.healthText}</p>
      {report}
    </div>
  )
}
