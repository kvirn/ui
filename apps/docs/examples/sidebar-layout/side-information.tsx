'use client'
import { Card, Heading, SidebarLayout } from '@kvirn-ui/react'
import { useId } from 'react'
import { useSidebarLayoutTexts } from './texts.ts'

export function SideInformation() {
  const { texts, textLang } = useSidebarLayoutTexts()
  const headingId = useId()
  return (
    <SidebarLayout.Root lang={textLang}>
      <SidebarLayout.Content className="kv-prose">
        <Heading level={3}>{texts.contact.article}</Heading>
        <p>{texts.contact.articleText}</p>
      </SidebarLayout.Content>
      <SidebarLayout.Sidebar render={<aside aria-labelledby={headingId} />}>
        <Card.Root className="kv-prose">
          <Heading level={4} id={headingId}>
            {texts.contact.heading}
          </Heading>
          <p>{texts.contact.text}</p>
        </Card.Root>
      </SidebarLayout.Sidebar>
    </SidebarLayout.Root>
  )
}
