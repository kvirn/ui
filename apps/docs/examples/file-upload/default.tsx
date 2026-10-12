'use client'
import { Field, FileUpload } from '@kvirn-ui/react'
import { useFileUploadTexts } from './texts.ts'
import { InEnglishWhenFallback } from '../../components/example-language.tsx'

export function DefaultFileUpload() {
  const { texts, isFallback } = useFileUploadTexts()
  return (
    <InEnglishWhenFallback isFallback={isFallback}>
      <Field.Root>
        <Field.Label>{texts.label}</Field.Label>
        <Field.Prose>
          <p>{texts.description}</p>
        </Field.Prose>
        <FileUpload.Root accept=".pdf,.jpg,.png" maxFiles={5} maxFileSize={10_000_000}>
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
                <FileUpload.Type />
                <FileUpload.Size />
                <FileUpload.Status />
                <FileUpload.Actions>
                  <FileUpload.RemoveButton />
                </FileUpload.Actions>
              </FileUpload.Item>
            )}
          </FileUpload.List>
        </FileUpload.Root>
      </Field.Root>
    </InEnglishWhenFallback>
  )
}
