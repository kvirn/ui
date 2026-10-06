'use client'
import { Field, FileUpload } from '@kvirn-ui/react'
import type { FileUploadContext } from '@kvirn-ui/react'
import { useFileUploadTexts } from './texts.ts'

// Stands in for your own request to your own server: KvirnUI sends nothing anywhere.
function pretendToUpload(file: File, { signal, onProgress }: FileUploadContext) {
  return new Promise<string>((resolve, reject) => {
    let fraction = 0
    const timer = setInterval(() => {
      fraction += 0.1
      onProgress(fraction)
      if (fraction >= 1) {
        clearInterval(timer)
        resolve(`stored-${file.name}`)
      }
    }, 400)
    signal.addEventListener('abort', () => {
      clearInterval(timer)
      reject(new DOMException('Aborted', 'AbortError'))
    })
  })
}

export function UploadYourself() {
  const { texts, textLang } = useFileUploadTexts()
  return (
    <Field.Root lang={textLang}>
      <Field.Label>{texts.label}</Field.Label>
      <Field.Prose>
        <p>{texts.description}</p>
      </Field.Prose>
      <FileUpload.Root accept=".pdf,.jpg,.png" maxFiles={5} upload={pretendToUpload}>
        <FileUpload.DropZone>
          <FileUpload.Trigger />
          <FileUpload.DropHint />
        </FileUpload.DropZone>
        <FileUpload.Limits />
        <FileUpload.Rejections />
        <FileUpload.Summary />
        <FileUpload.List>
          {(item) => (
            <FileUpload.Item key={item.id} item={item}>
              <FileUpload.Name />
              <FileUpload.Size />
              <FileUpload.Status />
              <FileUpload.Progress />
              <FileUpload.Actions>
                <FileUpload.CancelButton />
                <FileUpload.RetryButton />
                <FileUpload.RemoveButton />
              </FileUpload.Actions>
            </FileUpload.Item>
          )}
        </FileUpload.List>
      </FileUpload.Root>
    </Field.Root>
  )
}
