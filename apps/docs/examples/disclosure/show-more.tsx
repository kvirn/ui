'use client'
import { Disclosure } from '@kvirn-ui/react'
import { useDisclosureTexts } from './texts.ts'
import { InEnglishWhenFallback } from '../../components/example-language.tsx'

export function ShowMore() {
  const { texts, isFallback } = useDisclosureTexts()
  return (
    <InEnglishWhenFallback isFallback={isFallback}>
      <div>
        <p>
          <strong>{texts.news}.</strong> {texts.newsIntro}
        </p>
        <Disclosure.Root>
          <Disclosure.Trigger>{texts.showMore}</Disclosure.Trigger>
          <Disclosure.Panel>
            <p>{texts.newsMore}</p>
          </Disclosure.Panel>
        </Disclosure.Root>
      </div>
    </InEnglishWhenFallback>
  )
}
