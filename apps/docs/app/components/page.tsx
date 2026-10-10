import type { Metadata } from 'next'
import { Gallery } from '../../components/gallery/gallery.tsx'
import { galleryPreviews } from '../../components/gallery/previews/index.ts'
import { PageContents } from '../../components/page-contents.tsx'
import { PageHeading } from '../../components/page-heading.tsx'
import { componentGroups, componentPages } from '../../components/site-sections.ts'
import { messages } from '../../messages/en.ts'

const text = messages.docs.componentsIndex

export const metadata: Metadata = {
  title: messages.docs.meta.title({ page: text.title }),
}

const slugOf = (href: string) => href.split('/').at(-1) ?? href

const groups = componentGroups.map((group) => ({
  id: group.id,
  label: group.label,
  items: group.pages.map((page) => ({
    ...page,
    preview: galleryPreviews[slugOf(page.href)],
  })),
}))

export default function ComponentsIndexPage() {
  return (
    <>
      <PageHeading>{text.title}</PageHeading>
      <p className="kv-lead">{text.lead({ count: componentPages.length })}</p>
      <PageContents sections={groups} />
      <Gallery groups={groups} />
    </>
  )
}
