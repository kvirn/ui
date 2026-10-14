'use client'
import { Link, Navigation, TopBar } from '@kvirn-ui/react'
import { useTopBarTexts } from './texts.ts'

export function FilledTopBar() {
  const { texts } = useTopBarTexts()
  return (
    <TopBar variant="accent">
      <p>
        {texts.intro} <Link.Root href="#news">{texts.news}</Link.Root>
      </p>
      <Navigation.Root label={texts.toolsFilled} className="kv-navigation--horizontal">
        <Navigation.List>
          <Navigation.Item>
            <Link.Root href="#language" current>
              {texts.language}
            </Link.Root>
          </Navigation.Item>
          <Navigation.Item>
            <Link.Root href="#easy-read">{texts.easyRead}</Link.Root>
          </Navigation.Item>
          <Navigation.Item>
            <Link.Root href="#contact">{texts.contact}</Link.Root>
          </Navigation.Item>
        </Navigation.List>
      </Navigation.Root>
    </TopBar>
  )
}
