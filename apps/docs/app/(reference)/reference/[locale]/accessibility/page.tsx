import { PageFrameMain, PageToolsRoot } from '@kvirn-ui/patterns'
import { Heading, Link, ListItem, ListRoot, Prose, Stack } from '@kvirn-ui/react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { referenceStatementMessages } from '../../../../../messages/reference-statement.ts'
import { isReferenceLocale } from '../../../../../messages/reference.ts'
import { PageBreadcrumb } from '../contact-parts.tsx'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  return isReferenceLocale(locale)
    ? { title: referenceStatementMessages[locale].statement.title }
    : {}
}

export default async function ReferenceAccessibilityPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!isReferenceLocale(locale)) {
    notFound()
  }
  const text = referenceStatementMessages[locale].statement
  return (
    <>
      <PageBreadcrumb locale={locale} current={text.title} />
      <PageFrameMain size="reading">
        <Stack className="kv-stack--gap-8">
          <Heading as="h1">{text.heading}</Heading>
          <p className="kv-lead">{text.lead}</p>
          <Prose>
            <h2>{text.howHeading}</h2>
            <div className="kv-inset">
              <p>
                <strong>{text.fillIn}</strong> {text.fillInBody}
              </p>
            </div>
            <h2>{text.notHeading}</h2>
            <p>{text.notLead}</p>
            <ListRoot>
              {text.problems.map((problem: string) => (
                <ListItem key={problem}>{problem}</ListItem>
              ))}
            </ListRoot>
            <h2>{text.testedHeading}</h2>
            <p>{text.testedBody}</p>
          </Prose>
          <Prose>
            <h2>{text.reportHeading}</h2>
            <p>{text.reportBody}</p>
            <ListRoot>
              <ListItem>
                <Link href={`/reference/${locale}/accessibility/report`}>{text.reportLink}</Link>
              </ListItem>
              <ListItem>
                {text.contactBefore}
                <Link href={`/reference/${locale}/contact`}>{text.contactLink}</Link>.
              </ListItem>
            </ListRoot>
            <h2>{text.supervisorHeading}</h2>
            <p>{text.supervisorBody}</p>
          </Prose>
          <PageToolsRoot>
            <p className="kv-page-tools-updated">
              {text.published} {text.publishedDate}. {text.reviewed} {text.reviewedDate}.
            </p>
          </PageToolsRoot>
        </Stack>
      </PageFrameMain>
    </>
  )
}
