import type { Metadata } from 'next'
import { Gallery } from '../../components/gallery/gallery.tsx'
import { contentTypePreviews } from '../../components/gallery/previews/content-types.tsx'
import { PageHeading } from '../../components/page-heading.tsx'
import { contentTypeGroups } from '../../components/site-sections.ts'
import { messages } from '../../messages/en.ts'

const text = messages.docs.contentTypesIndex

export const metadata: Metadata = {
  title: messages.docs.meta.title({ page: text.title }),
}

const slugOf = (href: string) => href.split('/').at(-1) ?? href

const groups = contentTypeGroups.map((group) => ({
  id: group.id,
  label: group.label,
  items: group.pages.map((page) => ({
    ...page,
    preview: contentTypePreviews[slugOf(page.href)],
  })),
}))

export default function ContentTypesIndexPage() {
  return (
    <>
      <PageHeading>{text.title}</PageHeading>
      <p className="kv-lead">{text.lead}</p>
      <Gallery groups={groups} />
    </>
  )
}
