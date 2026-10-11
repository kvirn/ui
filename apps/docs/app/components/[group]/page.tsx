import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { GalleryCards } from '../../../components/gallery/gallery.tsx'
import { galleryPreviews } from '../../../components/gallery/previews/index.ts'
import { PageHeading } from '../../../components/page-heading.tsx'
import { componentGroups } from '../../../components/site-sections.ts'
import { messages } from '../../../messages/en.ts'

const text = messages.docs.componentsIndex

const slugOf = (href: string) => href.split('/').at(-1) ?? href

const findGroup = (id: string) => componentGroups.find((group) => group.id === id)

export const dynamicParams = false

export function generateStaticParams() {
  return componentGroups.map((group) => ({ group: group.id }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ group: string }>
}): Promise<Metadata> {
  const group = findGroup((await params).group)
  return { title: messages.docs.meta.title({ page: group?.label ?? text.title }) }
}

export default async function ComponentGroupPage({
  params,
}: {
  params: Promise<{ group: string }>
}) {
  const group = findGroup((await params).group)
  if (group === undefined) {
    notFound()
  }
  return (
    <>
      <PageHeading>{group.label}</PageHeading>
      <p className="kv-lead">{text.groupLead({ count: group.pages.length })}</p>
      <GalleryCards
        items={group.pages.map((page) => ({
          ...page,
          preview: galleryPreviews[slugOf(page.href)],
        }))}
      />
    </>
  )
}
