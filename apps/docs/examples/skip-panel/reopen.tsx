'use client'
import { Button, SkipPanel } from '@kvirn-ui/react'
import { useSkipPanelTexts } from './texts.ts'

export function Reopen() {
  const { texts } = useSkipPanelTexts()
  const cases = [texts.case1, texts.case2, texts.case3, texts.case4]
  return (
    <div className="docs-skip-panel-example">
      <p>
        <small>{texts.hintReopen}</small>
      </p>
      <SkipPanel.Root reopenShortcut={{ key: 'k', alt: true, shift: true }}>
        <SkipPanel.Group>
          <SkipPanel.Label />
          <SkipPanel.List>
            <SkipPanel.Item>
              <SkipPanel.Link href="#skip-panel-reopen-main" />
            </SkipPanel.Item>
            <SkipPanel.Item>
              <SkipPanel.HelpLink href="#skip-panel-reopen-keyboard-help" />
            </SkipPanel.Item>
          </SkipPanel.List>
        </SkipPanel.Group>
        <SkipPanel.Hint />
      </SkipPanel.Root>
      <div id="skip-panel-reopen-main">
        <p>{texts.casesHeading}</p>
        <ul>
          {cases.map((caseText) => (
            <li key={caseText}>
              <Button>{caseText}</Button>
            </li>
          ))}
        </ul>
      </div>
      <div id="skip-panel-reopen-keyboard-help">
        <p>{texts.keyboardHelp}</p>
      </div>
    </div>
  )
}
