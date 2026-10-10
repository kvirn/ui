'use client'
import { Heading, Link, SidebarLayout } from '@kvirn-ui/react'
import { useSidebarLayoutTexts } from './texts.ts'

export function ServicePage() {
  const { texts, textLang } = useSidebarLayoutTexts()
  const { service } = texts
  return (
    <SidebarLayout.Root className="kv-sidebar-layout--sidebar-sm" lang={textLang}>
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
  )
}
