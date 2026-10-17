import { permanentRedirect } from 'next/navigation'

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value)

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[]; category?: string | string[] }>
}) {
  const { q, category } = await searchParams
  const query = new URLSearchParams()
  const queryText = first(q)
  const categoryId = first(category)
  if (queryText !== undefined && queryText !== '') {
    query.set('q', queryText)
  }
  if (categoryId !== undefined && categoryId !== '') {
    query.set('category', categoryId)
  }
  const search = query.toString()
  permanentRedirect(search === '' ? '/icons' : `/icons?${search}`)
}
