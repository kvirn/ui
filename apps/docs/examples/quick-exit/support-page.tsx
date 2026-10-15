'use client'
import { QuickExit, SkipLink } from '@kvirn-ui/react'
import { useDemoLeave } from './demo-leave.tsx'
import { useQuickExitTexts } from './texts.ts'

export function SupportPage() {
  const { texts } = useQuickExitTexts()
  const { navigate, report } = useDemoLeave()
  return (
    <div>
      <p>
        <small>{texts.tabOrder}</small>
      </p>
      <SkipLink href="#quick-exit-support-main">{texts.skipLabel}</SkipLink>
      <QuickExit.Root navigate={navigate} shortcut={false}>
        <QuickExit.Link href={texts.destination} />
        <QuickExit.Hint />
      </QuickExit.Root>
      <p>{texts.header}</p>
      <div id="quick-exit-support-main">
        <h4>{texts.supportHeading}</h4>
        <p>{texts.supportText}</p>
      </div>
      {report}
    </div>
  )
}
