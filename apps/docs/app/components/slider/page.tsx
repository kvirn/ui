import type { Metadata } from 'next'
import { SliderPage } from '../../../components/slider-page.tsx'
import { readContract } from '../../../lib/contract.ts'
import { readExampleSource } from '../../../lib/example-source.ts'
import { messages } from '../../../messages/en.ts'

export const metadata: Metadata = { title: messages.docs.meta.title({ page: 'Slider' }) }

export default function Page() {
  return (
    <SliderPage
      contract={readContract('slider')}
      sources={{
        default: readExampleSource('slider/default.tsx'),
        'plain-form': readExampleSource('slider/plain-form.tsx'),
        'with-number-input': readExampleSource('slider/with-number-input.tsx'),
      }}
    />
  )
}
