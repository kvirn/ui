import type { Metadata } from 'next'
import { IconLibraryPage } from '../../../components/icon-library-page.tsx'
import { messages } from '../../../messages/en.ts'

export const metadata: Metadata = {
  title: messages.docs.meta.title({ page: messages.docs.nav.sections.icons }),
}

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value)

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string | string[]
    category?: string | string[]
    variant?: string | string[]
    size?: string | string[]
    stroke?: string | string[]
  }>
}) {
  const { q, category, variant, size, stroke } = await searchParams
  return (
    <IconLibraryPage
      query={first(q)?.trim() ?? ''}
      category={first(category)}
      variant={first(variant)}
      size={first(size)}
      stroke={first(stroke)}
    />
  )
}
