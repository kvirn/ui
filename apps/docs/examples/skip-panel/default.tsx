'use client'
import { SkipPanel } from '@kvirn-ui/react'
import { useSkipPanelTexts } from './texts.ts'

export function DefaultSkipPanel() {
  const { texts } = useSkipPanelTexts()
  return (
    <div className="docs-skip-panel-example">
      <p>
        <small>{texts.hint}</small>
      </p>
      <SkipPanel.Root>
        <SkipPanel.Group>
          <SkipPanel.Label />
          <SkipPanel.List>
            <SkipPanel.Item>
              <SkipPanel.Link href="#skip-panel-main" />
            </SkipPanel.Item>
            <SkipPanel.Item>
              <SkipPanel.Link href="#skip-panel-navigation">{texts.navigationLabel}</SkipPanel.Link>
            </SkipPanel.Item>
          </SkipPanel.List>
        </SkipPanel.Group>
        <SkipPanel.Hint />
      </SkipPanel.Root>
      <p>{texts.header}</p>
      <div id="skip-panel-navigation">
        <p>{texts.navigation}</p>
      </div>
      <div id="skip-panel-main">
        <p>{texts.main}</p>
      </div>
    </div>
  )
}
