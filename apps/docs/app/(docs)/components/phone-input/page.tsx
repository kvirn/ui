import type { Metadata } from 'next'
import { PhoneInputPage } from '../../../../components/phone-input-page.tsx'
import { readContract } from '../../../../lib/contract.ts'
import { readExampleSource } from '../../../../lib/example-source.ts'
import { messages } from '../../../../messages/en.ts'

export const metadata: Metadata = { title: messages.docs.meta.title({ page: 'PhoneInput' }) }

export default function Page() {
  return (
    <PhoneInputPage
      contract={readContract('phone-input')}
      sources={{
        default: readExampleSource('phone-input/default.tsx'),
        'check-after-sending': readExampleSource('phone-input/check-after-sending.tsx'),
        'with-country': readExampleSource('phone-input/with-country.tsx'),
        'someone-elses-number': readExampleSource('phone-input/someone-elses-number.tsx'),
        'only-phone-characters': readExampleSource('phone-input/only-phone-characters.tsx'),
      }}
    />
  )
}
