import {
  AccessibilityStatement,
  CaseDetail,
  Contact,
  ContentPage,
  ContentTypeShell,
  CookiesPage,
  DocumentationPage,
  EasyToReadPage,
  EventListPage,
  EventPage,
  FormPage,
  MyPages,
  NewsArticle,
  NewsList,
  PrivacyPage,
  SearchResults,
  SessionEnded,
  StartPage,
  StatusPages,
  Subpage,
  UnitPage,
} from '@kvirn-ui/patterns/content-types'
import type { ContentTypeShellProps } from '@kvirn-ui/patterns/content-types'
import { Link } from '@kvirn-ui/react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import type { ReactNode } from 'react'
import { contentTypePages } from '../../../../../components/site-sections.ts'
import { messages } from '../../../../../messages/en.ts'

const text = messages.docs.contentTypes.example

const examples: Record<string, { shell: ContentTypeShellProps; page: ReactNode }> = {
  'start-page': { shell: { header: 'kvirnby', current: 'page' }, page: <StartPage /> },
  subpage: { shell: { header: 'kvirnby' }, page: <Subpage /> },
  'content-page': { shell: { header: 'kvirnby' }, page: <ContentPage /> },
  'documentation-page': { shell: { header: 'docs' }, page: <DocumentationPage /> },
  'unit-page': { shell: { header: 'kvirnby' }, page: <UnitPage /> },
  contact: { shell: { header: 'kvirnby' }, page: <Contact /> },
  'news-article': { shell: { header: 'kvirnby' }, page: <NewsArticle /> },
  'news-list': { shell: { header: 'kvirnby' }, page: <NewsList /> },
  event: { shell: { header: 'kvirnby' }, page: <EventPage /> },
  'event-list': { shell: { header: 'kvirnby' }, page: <EventListPage /> },
  'form-page': { shell: { header: 'transaction' }, page: <FormPage /> },
  'my-pages': { shell: { header: 'kvirnby' }, page: <MyPages /> },
  'case-detail': { shell: { header: 'kvirnby' }, page: <CaseDetail /> },
  'session-ended': { shell: { header: 'kvirnby' }, page: <SessionEnded /> },
  'search-results': { shell: { header: 'kvirnby' }, page: <SearchResults /> },
  'accessibility-statement': { shell: { header: 'kvirnby' }, page: <AccessibilityStatement /> },
  'privacy-page': { shell: { header: 'kvirnby' }, page: <PrivacyPage /> },
  'cookies-page': { shell: { header: 'kvirnby' }, page: <CookiesPage /> },
  'easy-to-read-page': { shell: { header: 'kvirnby' }, page: <EasyToReadPage /> },
  'status-pages': { shell: { header: 'kvirnby' }, page: <StatusPages /> },
}

export const dynamicParams = false

export const generateStaticParams = () =>
  contentTypePages.map((page) => ({ type: page.href.split('/').at(-1) }))

const labelOf = (type: string) =>
  contentTypePages.find((page) => page.href.endsWith(`/${type}`))?.label

export async function generateMetadata({
  params,
}: {
  params: Promise<{ type: string }>
}): Promise<Metadata> {
  const { type } = await params
  const label = labelOf(type)
  return label === undefined ? {} : { title: label }
}

export default async function ContentTypeExamplePage({
  params,
}: {
  params: Promise<{ type: string }>
}) {
  const { type } = await params
  const example = examples[type]
  if (example === undefined) {
    notFound()
  }
  const notice = (
    <>
      <p>{text.notice}</p>
      <div>
        <Link href={`/content-types/${type}`}>{text.back}</Link>
      </div>
    </>
  )
  return (
    <ContentTypeShell {...example.shell} notice={notice}>
      {example.page}
    </ContentTypeShell>
  )
}
