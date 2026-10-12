'use client'
import { Heading, Link, SidebarLayout } from '@kvirn-ui/react'
import { useSidebarLayoutTexts } from './texts.ts'
import { InEnglishWhenFallback } from '../../components/example-language.tsx'

export function ServicePage() {
  const { texts, isFallback } = useSidebarLayoutTexts()
  const { service } = texts
  return (
    <InEnglishWhenFallback isFallback={isFallback}>
      <SidebarLayout.Root className="kv-sidebar-layout--sidebar-sm">
        <SidebarLayout.Sidebar as="nav" aria-label={service.navigationLabel}>
          <ul className="kv-stack kv-stack--gap-2">
            {service.links.map((label) => (
              <li key={label}>
                <Link href="#" aria-current={label === service.current ? 'page' : undefined}>
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </SidebarLayout.Sidebar>
        <SidebarLayout.Content className="kv-prose">
          <Heading as="h3">{service.heading}</Heading>
          <p>{service.text}</p>
        </SidebarLayout.Content>
      </SidebarLayout.Root>
    </InEnglishWhenFallback>
  )
}
