import { Heading, Link } from '@kvirn-ui/react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { DocsPage } from '../../../../../components/docs-page.tsx'
import { messages } from '../../../../../messages/en.ts'
import {
  referenceDocsMessages,
  referenceLocales,
  referencePages,
} from '../../../../../messages/reference.ts'

const text = referenceDocsMessages

export const dynamicParams = false

export const generateStaticParams = () => referencePages.map(({ slug }) => ({ page: slug }))

export async function generateMetadata({
  params,
}: {
  params: Promise<{ page: string }>
}): Promise<Metadata> {
  const { page: slug } = await params
  const page = referencePages.find((candidate) => candidate.slug === slug)
  return page === undefined
    ? {}
    : { title: messages.docs.meta.title({ page: text.how.heading({ page: page.title }) }) }
}

export default async function HowItsBuiltPage({ params }: { params: Promise<{ page: string }> }) {
  const { page: slug } = await params
  const page = referencePages.find((candidate) => candidate.slug === slug)
  if (page === undefined) {
    notFound()
  }
  return (
    <DocsPage title={text.how.heading({ page: page.title })} lead={text.how.lead}>
      <Heading as="h2">{text.how.partsHeading}</Heading>
      <ul>
        {page.parts.map((part) => (
          <li key={part.href}>
            <Link href={part.href}>{part.label}</Link>
          </li>
        ))}
      </ul>
      {page.path === undefined ? null : (
        <>
          <Heading as="h2">{text.how.openHeading}</Heading>
          <ul>
            {referenceLocales.map((locale) => (
              <li key={locale}>
                <Link href={`/reference/${locale}${page.path}`} lang={locale}>
                  {text.index.open({
                    page: page.title,
                    language: text.index.languages[locale],
                  })}
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
      <p>
        <Link href="/reference">{text.how.back}</Link>
      </p>
    </DocsPage>
  )
}
