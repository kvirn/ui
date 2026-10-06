import type { Metadata } from 'next'
import { FileUploadPage } from '../../../components/file-upload-page.tsx'
import { readContract } from '../../../lib/contract.ts'
import { readExampleSource } from '../../../lib/example-source.ts'
import { messages } from '../../../messages/en.ts'

export const metadata: Metadata = { title: messages.docs.meta.title({ page: 'FileUpload' }) }

export default function Page() {
  return (
    <FileUploadPage
      contract={readContract('file-upload')}
      sources={{
        default: readExampleSource('file-upload/default.tsx'),
        'send-with-form': readExampleSource('file-upload/send-with-form.tsx'),
        'upload-yourself': readExampleSource('file-upload/upload-yourself.tsx'),
        'failure-reason': readExampleSource('file-upload/failure-reason.tsx'),
        'own-checks': readExampleSource('file-upload/own-checks.tsx'),
        'single-file': readExampleSource('file-upload/single-file.tsx'),
        'missing-file': readExampleSource('file-upload/missing-file.tsx'),
      }}
    />
  )
}
