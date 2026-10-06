'use client'
import { Link, Navigation } from '@kvirn-ui/react'
import { useNavigationTexts } from './texts.ts'

export function GroupLabels() {
  const { texts, textLang } = useNavigationTexts()
  return (
    <Navigation.Root label={texts.labelGroups} lang={textLang}>
      <Navigation.List>
        <Navigation.Item>
          <Navigation.Label>{texts.groupPermits}</Navigation.Label>
          <Navigation.List>
            <Navigation.Item>
              <Link.Root href="#group-labels" current="page">
                {texts.resident}
              </Link.Root>
            </Navigation.Item>
            <Navigation.Item>
              <Link.Root href="#two-levels">{texts.visitor}</Link.Root>
            </Navigation.Item>
          </Navigation.List>
        </Navigation.Item>
        <Navigation.Item>
          <Navigation.Label>{texts.groupServices}</Navigation.Label>
          <Navigation.List>
            <Navigation.Item>
              <Link.Root href="#horizontal">{texts.waste}</Link.Root>
            </Navigation.Item>
            <Navigation.Item>
              <Link.Root href="#api">{texts.roads}</Link.Root>
            </Navigation.Item>
          </Navigation.List>
        </Navigation.Item>
      </Navigation.List>
    </Navigation.Root>
  )
}
