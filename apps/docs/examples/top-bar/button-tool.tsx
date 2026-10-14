'use client'
import { Button, Link, Navigation, TopBar } from '@kvirn-ui/react'
import { useTopBarTexts } from './texts.ts'

export function ButtonTool() {
  const { texts } = useTopBarTexts()
  return (
    <TopBar>
      <p>{texts.intro}</p>
      <Navigation.Root label={texts.toolsButton} className="kv-navigation--horizontal">
        <Navigation.List>
          <Navigation.Item>
            <Link.Root href="#easy-read">{texts.easyRead}</Link.Root>
          </Navigation.Item>
          <Navigation.Item>
            <Link.Root href="#contact">{texts.contact}</Link.Root>
          </Navigation.Item>
        </Navigation.List>
      </Navigation.Root>
      <Button className="kv-button--link" onClick={() => window.print()}>
        {texts.print}
      </Button>
    </TopBar>
  )
}
