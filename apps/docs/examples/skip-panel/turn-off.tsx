'use client'
import { Field, SkipPanel, Switch } from '@kvirn-ui/react'
import { useState } from 'react'
import { useSkipPanelTexts } from './texts.ts'

export function TurnOff() {
  const { texts } = useSkipPanelTexts()
  const [shortcutsOn, setShortcutsOn] = useState(true)
  return (
    <div className="docs-skip-panel-example">
      <p>
        <small>{texts.hintTurnOff}</small>
      </p>
      <div id="skip-panel-turn-off-settings">
        <Field.Root>
          <Switch name="shortcuts" checked={shortcutsOn} onCheckedChange={setShortcutsOn} />
          <Field.Label marker="none">{texts.useShortcuts}</Field.Label>
          <Field.HelpText>{texts.switchHelp}</Field.HelpText>
        </Field.Root>
      </div>
      <SkipPanel.Root shortcutsEnabled={shortcutsOn}>
        <SkipPanel.Group>
          <SkipPanel.Label />
          <SkipPanel.List>
            <SkipPanel.Item>
              <SkipPanel.Link href="#skip-panel-turn-off-main" />
            </SkipPanel.Item>
          </SkipPanel.List>
        </SkipPanel.Group>
        <SkipPanel.Group>
          <SkipPanel.Label kind="shortcuts" />
          <SkipPanel.List>
            <SkipPanel.Item>
              <SkipPanel.Shortcut
                as="a"
                href="#skip-panel-turn-off-book"
                shortcut={{ key: 'b', alt: true, shift: true }}
              >
                {texts.bookLabel}
              </SkipPanel.Shortcut>
            </SkipPanel.Item>
            <SkipPanel.Item>
              <SkipPanel.HelpLink href="#skip-panel-turn-off-settings" />
            </SkipPanel.Item>
          </SkipPanel.List>
        </SkipPanel.Group>
        <SkipPanel.Hint />
      </SkipPanel.Root>
      <div id="skip-panel-turn-off-main">
        <p>{texts.main}</p>
      </div>
      <div id="skip-panel-turn-off-book">
        <p>{texts.bookDone}</p>
      </div>
    </div>
  )
}
