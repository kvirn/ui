import { Heading, Link } from '@kvirn-ui/react'
import type { Metadata } from 'next'
import { Fragment } from 'react'
import { PageHeading } from '../../components/page-heading.tsx'
import { componentGroups } from '../../components/site-sections.ts'
import { messages } from '../../messages/en.ts'

const text = messages.docs.componentsIndex

export const metadata: Metadata = {
  title: messages.docs.meta.title({ page: text.title }),
}

export default function ComponentsIndexPage() {
  return (
    <>
      <PageHeading>{text.title}</PageHeading>
      <p className="kv-lead">{text.lead}</p>
      {componentGroups.map((group) => (
        <Fragment key={group.id}>
          <Heading as="h2" id={group.id}>
            {group.label}
          </Heading>
          <ul>
            {group.pages.map((page) => (
              <li key={page.href}>
                <Link href={page.href}>{page.label}</Link>
              </li>
            ))}
          </ul>
        </Fragment>
      ))}
    </>
  )
}
