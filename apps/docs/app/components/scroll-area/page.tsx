import type { Metadata } from 'next'
import { ScrollAreaPage } from '../../../components/scroll-area-page.tsx'
import { readContract } from '../../../lib/contract.ts'
import { readExampleSource } from '../../../lib/example-source.ts'
import { messages } from '../../../messages/en.ts'

export const metadata: Metadata = { title: messages.docs.meta.title({ page: 'ScrollArea' }) }

export default function Page() {
  return (
    <ScrollAreaPage
      contract={readContract('scroll-area')}
      sources={{
        default: readExampleSource('scroll-area/default.tsx'),
        fits: readExampleSource('scroll-area/fits.tsx'),
        'always-region': readExampleSource('scroll-area/always-region.tsx'),
        tall: readExampleSource('scroll-area/tall.tsx'),
        'own-markup': readExampleSource('scroll-area/own-markup.tsx'),
      }}
    />
  )
}
