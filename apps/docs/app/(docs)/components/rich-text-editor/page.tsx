import '@kvirn-ui/theme/rich-text.css'
import type { Metadata } from 'next'
import { RichTextEditorPage } from '../../../../components/rich-text-editor-page.tsx'
import { readContract } from '../../../../lib/contract.ts'
import { readExampleSource } from '../../../../lib/example-source.ts'
import { messages } from '../../../../messages/en.ts'

export const metadata: Metadata = { title: messages.docs.meta.title({ page: 'RichTextEditor' }) }

export default function Page() {
  return (
    <RichTextEditorPage
      contract={readContract('rich-text-editor')}
      sources={{
        default: readExampleSource('rich-text-editor/default.tsx'),
        'in-a-form': readExampleSource('rich-text-editor/in-a-form.tsx'),
        controlled: readExampleSource('rich-text-editor/controlled.tsx'),
        'small-toolbar': readExampleSource('rich-text-editor/small-toolbar.tsx'),
        'character-count': readExampleSource('rich-text-editor/character-count.tsx'),
        'without-tables-and-images': readExampleSource(
          'rich-text-editor/without-tables-and-images.tsx',
        ),
        'own-toolbar': readExampleSource('rich-text-editor/own-toolbar.tsx'),
      }}
    />
  )
}
