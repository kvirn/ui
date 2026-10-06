'use client'
import { Link, Navigation } from '@kvirn-ui/react'
import { useNavigationTexts } from './texts.ts'

export function PageNotListed() {
  const { texts, textLang } = useNavigationTexts()
  return (
    <Navigation.Root label={texts.labelNotListed} lang={textLang}>
      <Navigation.List>
        <Navigation.Item>
          <Link.Root href="#example">{texts.overview}</Link.Root>
        </Navigation.Item>
        <Navigation.Item>
          <Link.Root href="#page-not-listed">{texts.applications}</Link.Root>
          <Navigation.List>
            <Navigation.Item>
              <Link.Root href="#use-cases" current>
                {texts.applicationsOpen}
              </Link.Root>
            </Navigation.Item>
            <Navigation.Item>
              <Link.Root href="#api">{texts.applicationsDecided}</Link.Root>
            </Navigation.Item>
          </Navigation.List>
        </Navigation.Item>
      </Navigation.List>
    </Navigation.Root>
  )
}
