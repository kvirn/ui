import type { Metadata } from 'next'
import { MenuPage } from '../../../../components/menu-page.tsx'
import { readContract } from '../../../../lib/contract.ts'
import { readExampleSource } from '../../../../lib/example-source.ts'
import { messages } from '../../../../messages/en.ts'

export const metadata: Metadata = { title: messages.docs.meta.title({ page: 'Menu' }) }

export default function Page() {
  return (
    <MenuPage
      contract={readContract('menu')}
      sources={{
        default: readExampleSource('menu/default.tsx'),
        'row-actions': readExampleSource('menu/row-actions.tsx'),
        'ask-first': readExampleSource('menu/ask-first.tsx'),
        unavailable: readExampleSource('menu/unavailable.tsx'),
        'checkbox-and-radio': readExampleSource('menu/checkbox-and-radio.tsx'),
        controlled: readExampleSource('menu/controlled.tsx'),
      }}
    />
  )
}
