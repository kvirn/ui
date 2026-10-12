'use client'
import { Link, Navigation } from '@kvirn-ui/react'
import { useNavigationTexts } from './texts.ts'
import { InEnglishWhenFallback } from '../../components/example-language.tsx'

export function TwoLevels() {
  const { texts, isFallback } = useNavigationTexts()
  return (
    <InEnglishWhenFallback isFallback={isFallback}>
      <Navigation.Root label={texts.labelNested}>
        <Navigation.List>
          <Navigation.Item>
            <Link.Root href="#example">{texts.overview}</Link.Root>
          </Navigation.Item>
          <Navigation.Item>
            <Link.Root href="#use-cases">{texts.apply}</Link.Root>
            <Navigation.List>
              <Navigation.Item>
                <Link.Root href="#two-levels" current="page">
                  {texts.resident}
                </Link.Root>
              </Navigation.Item>
              <Navigation.Item>
                <Link.Root href="#horizontal">{texts.visitor}</Link.Root>
              </Navigation.Item>
            </Navigation.List>
          </Navigation.Item>
          <Navigation.Item>
            <Link.Root href="#api">{texts.contact}</Link.Root>
          </Navigation.Item>
        </Navigation.List>
      </Navigation.Root>
    </InEnglishWhenFallback>
  )
}
