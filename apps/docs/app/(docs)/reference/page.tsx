import { Heading, Link } from '@kvirn-ui/react'
import type { Metadata } from 'next'
import { DocsPage } from '../../../components/docs-page.tsx'
import { messages } from '../../../messages/en.ts'
import {
  referenceDocsMessages,
  referenceLocales,
  referencePages,
} from '../../../messages/reference.ts'

const text = referenceDocsMessages.index

export const metadata: Metadata = {
  title: messages.docs.meta.title({ page: referenceDocsMessages.meta.title }),
}

export default function ReferenceIndexPage() {
  return (
    <DocsPage title={text.heading} lead={text.lead}>
      <p>{text.notice}</p>
      <Heading as="h2">{text.pagesHeading}</Heading>
      <ul>
        {referencePages.map((page) => (
          <li key={page.slug}>
            {page.title}
            {page.path === undefined ? (
              <p>{text.planned}</p>
            ) : (
              <ul>
                {referenceLocales.map((locale) => (
                  <li key={locale}>
                    <Link href={`/reference/${locale}${page.path}`} lang={locale}>
                      {text.open({ page: page.title, language: text.languages[locale] })}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link href={`/reference/how/${page.slug}`}>
                    {text.howBuilt({ page: page.title })}
                  </Link>
                </li>
              </ul>
            )}
          </li>
        ))}
      </ul>
    </DocsPage>
  )
}
