'use client'
import { Field, SkipPanel, TextInput } from '@kvirn-ui/react'
import { useRef } from 'react'
import { useSkipPanelTexts } from './texts.ts'

export function Shortcuts() {
  const { texts } = useSkipPanelTexts()
  const searchRef = useRef<HTMLInputElement>(null)
  return (
    <div className="docs-skip-panel-example">
      <p>
        <small>{texts.hintShortcuts}</small>
      </p>
      <SkipPanel.Root>
        <SkipPanel.Group>
          <SkipPanel.Label />
          <SkipPanel.List>
            <SkipPanel.Item>
              <SkipPanel.Link href="#skip-panel-shortcuts-main" />
            </SkipPanel.Item>
          </SkipPanel.List>
        </SkipPanel.Group>
        <SkipPanel.Group>
          <SkipPanel.Label kind="shortcuts" />
          <SkipPanel.List>
            <SkipPanel.Item>
              <SkipPanel.Shortcut
                shortcut={{ key: 's', alt: true, shift: true }}
                onClick={() => searchRef.current?.focus()}
              >
                {texts.searchLabel}
              </SkipPanel.Shortcut>
            </SkipPanel.Item>
            <SkipPanel.Item>
              <SkipPanel.Shortcut
                as="a"
                href="#skip-panel-shortcuts-cases"
                shortcut={{ key: 'm', alt: true, shift: true }}
              >
                {texts.myCasesLabel}
              </SkipPanel.Shortcut>
            </SkipPanel.Item>
            <SkipPanel.Item>
              <SkipPanel.HelpLink href="#skip-panel-shortcuts-keyboard-help" />
            </SkipPanel.Item>
          </SkipPanel.List>
        </SkipPanel.Group>
        <SkipPanel.Hint />
      </SkipPanel.Root>
      <Field.Root>
        <Field.Label>{texts.searchFieldLabel}</Field.Label>
        <TextInput ref={searchRef} name="search" type="search" />
      </Field.Root>
      <div id="skip-panel-shortcuts-main">
        <p>{texts.main}</p>
      </div>
      <div id="skip-panel-shortcuts-cases">
        <p>{texts.myCases}</p>
      </div>
      <div id="skip-panel-shortcuts-keyboard-help">
        <p>{texts.keyboardHelp}</p>
      </div>
    </div>
  )
}
