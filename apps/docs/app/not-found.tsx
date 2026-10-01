import { Link } from '@kvirn-ui/react'
import type { Metadata } from 'next'
import { PageHeading } from '../components/page-heading.tsx'
import { messages } from '../messages/en.ts'

const text = messages.docs.notFound

export const metadata: Metadata = { title: messages.docs.meta.title({ page: text.title }) }

export default function NotFound() {
  return (
    <>
      <PageHeading>{text.heading}</PageHeading>
      <p>{text.body}</p>
      <p>
        <Link href="/">{text.homeLink}</Link>
      </p>
    </>
  )
}
