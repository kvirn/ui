'use client'
import { Card, Heading, SidebarLayout } from '@kvirn-ui/react'
import { useId } from 'react'
import { useSidebarLayoutTexts } from './texts.ts'
import { InEnglishWhenFallback } from '../../components/example-language.tsx'

export function SideInformation() {
  const { texts, isFallback } = useSidebarLayoutTexts()
  const headingId = useId()
  return (
    <InEnglishWhenFallback isFallback={isFallback}>
      <SidebarLayout.Root>
        <SidebarLayout.Content className="kv-prose">
          <Heading as="h3">{texts.contact.article}</Heading>
          <p>{texts.contact.articleText}</p>
        </SidebarLayout.Content>
        <SidebarLayout.Sidebar as="aside" aria-labelledby={headingId}>
          <Card.Root className="kv-prose">
            <Heading as="h4" id={headingId}>
              {texts.contact.heading}
            </Heading>
            <p>{texts.contact.text}</p>
          </Card.Root>
        </SidebarLayout.Sidebar>
      </SidebarLayout.Root>
    </InEnglishWhenFallback>
  )
}
