'use client'
import { Disclosure } from '@kvirn-ui/react'
import { useDisclosureTexts } from './texts.ts'

export function ShowMore() {
  const { texts, textLang } = useDisclosureTexts()
  return (
    <div lang={textLang}>
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
  )
}
