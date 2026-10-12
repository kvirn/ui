'use client'
import { Link, Navigation } from '@kvirn-ui/react'
import { useNavigationTexts } from './texts.ts'
import { InEnglishWhenFallback } from '../../components/example-language.tsx'

export function DefaultNavigation() {
  const { texts, isFallback } = useNavigationTexts()
  return (
    <InEnglishWhenFallback isFallback={isFallback}>
      <Navigation.Root label={texts.labelMain}>
        <Navigation.List>
          <Navigation.Item>
            <Link.Root href="#example" current="page">
              {texts.overview}
            </Link.Root>
          </Navigation.Item>
          <Navigation.Item>
            <Link.Root href="#use-cases">{texts.apply}</Link.Root>
          </Navigation.Item>
          <Navigation.Item>
            <Link.Root href="#api">{texts.contact}</Link.Root>
          </Navigation.Item>
        </Navigation.List>
      </Navigation.Root>
    </InEnglishWhenFallback>
  )
}
