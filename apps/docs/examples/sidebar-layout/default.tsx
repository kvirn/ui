'use client'
import { Card, SidebarLayout } from '@kvirn-ui/react'
import { useSidebarLayoutTexts } from './texts.ts'

export function DefaultSidebarLayout() {
  const { texts, textLang } = useSidebarLayoutTexts()
  return (
    <SidebarLayout.Root lang={textLang}>
      <SidebarLayout.Sidebar>
        <Card.Root className="kv-prose">
          <p>{texts.side}</p>
        </Card.Root>
      </SidebarLayout.Sidebar>
      <SidebarLayout.Content>
        <Card.Root className="kv-prose">
          <p>{texts.content}</p>
        </Card.Root>
      </SidebarLayout.Content>
    </SidebarLayout.Root>
  )
}
