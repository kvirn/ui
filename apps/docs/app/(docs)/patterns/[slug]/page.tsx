import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { PatternPage } from '../../../../components/pattern-page.tsx'
import type { PatternSlug } from '../../../../components/pattern-page.tsx'
import { patternPages } from '../../../../components/site-sections.ts'
import { messages } from '../../../../messages/en.ts'

export const dynamicParams = false

const slugOf = (href: string) => href.split('/').at(-1) ?? href

export function generateStaticParams() {
  return patternPages.map((page) => ({ slug: slugOf(page.href) }))
}

const pageOf = async (params: Promise<{ slug: string }>) => {
  const { slug } = await params
  const page = patternPages.find((pattern) => slugOf(pattern.href) === slug)
  if (page === undefined) {
    notFound()
  }
  return { slug: slug as PatternSlug, label: page.label }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { label } = await pageOf(params)
  return { title: messages.docs.meta.title({ page: label }) }
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await pageOf(params)
  return <PatternPage slug={slug} />
}
