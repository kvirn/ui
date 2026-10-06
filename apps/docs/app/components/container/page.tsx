import type { Metadata } from 'next'
import { ContainerPage } from '../../../components/container-page.tsx'
import { readContract } from '../../../lib/contract.ts'
import { readExampleSource } from '../../../lib/example-source.ts'
import { messages } from '../../../messages/en.ts'

export const metadata: Metadata = { title: messages.docs.meta.title({ page: 'Container' }) }

export default function Page() {
  return (
    <ContainerPage
      contract={readContract('container')}
      sources={{
        default: readExampleSource('container/default.tsx'),
        reading: readExampleSource('container/reading.tsx'),
        form: readExampleSource('container/form.tsx'),
        nested: readExampleSource('container/nested.tsx'),
        region: readExampleSource('container/region.tsx'),
      }}
    />
  )
}
