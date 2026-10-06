'use client'
import { Link, Navigation } from '@kvirn-ui/react'
import { useNavigationTexts } from './texts.ts'

export function HorizontalNavigation() {
  const { texts, textLang } = useNavigationTexts()
  return (
    <Navigation.Root
      label={texts.labelHorizontal}
      className="kv-navigation--horizontal"
      lang={textLang}
    >
      <Navigation.List>
        <Navigation.Item>
          <Link.Root href="#horizontal" current="page">
            {texts.parking}
          </Link.Root>
        </Navigation.Item>
        <Navigation.Item>
          <Link.Root href="#use-cases">{texts.waste}</Link.Root>
        </Navigation.Item>
        <Navigation.Item>
          <Link.Root href="#api">{texts.roads}</Link.Root>
        </Navigation.Item>
      </Navigation.List>
    </Navigation.Root>
  )
}
