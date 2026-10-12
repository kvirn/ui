'use client'
import { Card, SidebarLayout } from '@kvirn-ui/react'
import { useSidebarLayoutTexts } from './texts.ts'
import { InEnglishWhenFallback } from '../../components/example-language.tsx'

export function DefaultSidebarLayout() {
  const { texts, isFallback } = useSidebarLayoutTexts()
  return (
    <InEnglishWhenFallback isFallback={isFallback}>
      <SidebarLayout.Root>
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
    </InEnglishWhenFallback>
  )
}
