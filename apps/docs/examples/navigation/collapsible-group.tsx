'use client'
import { Button, Link, Navigation } from '@kvirn-ui/react'
import { useId, useState } from 'react'
import { useNavigationTexts } from './texts.ts'

export function CollapsibleGroup() {
  const { texts, textLang } = useNavigationTexts()
  const [isOpen, setIsOpen] = useState(false)
  const groupId = useId()
  return (
    <Navigation.Root label={texts.labelCollapsible} lang={textLang}>
      <Navigation.List>
        <Navigation.Item>
          <Link.Root href="#collapsible-group" current="page">
            {texts.overview}
          </Link.Root>
        </Navigation.Item>
        <Navigation.Item>
          <Button aria-expanded={isOpen} aria-controls={groupId} onClick={() => setIsOpen(!isOpen)}>
            {texts.permitTypes}
          </Button>
          <Navigation.List id={groupId} hidden={!isOpen}>
            <Navigation.Item>
              <Link.Root href="#two-levels">{texts.resident}</Link.Root>
            </Navigation.Item>
            <Navigation.Item>
              <Link.Root href="#horizontal">{texts.visitor}</Link.Root>
            </Navigation.Item>
          </Navigation.List>
        </Navigation.Item>
      </Navigation.List>
    </Navigation.Root>
  )
}
