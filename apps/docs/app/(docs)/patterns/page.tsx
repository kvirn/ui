import type { Metadata } from 'next'
import { DocsPage } from '../../../components/docs-page.tsx'
import { Gallery } from '../../../components/gallery/gallery.tsx'
import { patternPreviews } from '../../../components/gallery/previews/patterns.tsx'
import { patternGroups } from '../../../components/site-sections.ts'
import { messages } from '../../../messages/en.ts'

const text = messages.docs.patternsIndex

export const metadata: Metadata = {
  title: messages.docs.meta.title({ page: text.title }),
}

const slugOf = (href: string) => href.split('/').at(-1) ?? href

const groups = patternGroups.map((group) => ({
  id: group.id,
  label: group.label,
  items: group.pages.map((page) => ({
    ...page,
    preview: patternPreviews[slugOf(page.href)],
  })),
}))

export default function PatternsIndexPage() {
  return (
    <DocsPage title={text.title} lead={text.lead}>
      <Gallery groups={groups} />
    </DocsPage>
  )
}
