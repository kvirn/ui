'use client'
import { Field, FileUpload } from '@kvirn-ui/react'
import { useFileUploadTexts } from './texts.ts'

export function SingleFile() {
  const { texts, textLang } = useFileUploadTexts()
  return (
    <Field.Root lang={textLang}>
      <Field.Label>{texts.photoLabel}</Field.Label>
      <Field.Prose>
        <p>{texts.photoDescription}</p>
      </Field.Prose>
      <FileUpload.Root multiple={false} accept=".jpg,.png" maxFileSize={5_000_000}>
        <FileUpload.DropZone>
          <FileUpload.Trigger />
          <FileUpload.DropHint />
        </FileUpload.DropZone>
        <FileUpload.Limits />
        <FileUpload.Rejections />
        <FileUpload.List>
          {(item) => (
            <FileUpload.Item key={item.id} item={item}>
              <FileUpload.Preview />
              <FileUpload.Name />
              <FileUpload.Size />
              <FileUpload.Actions>
                <FileUpload.RemoveButton />
              </FileUpload.Actions>
            </FileUpload.Item>
          )}
        </FileUpload.List>
      </FileUpload.Root>
    </Field.Root>
  )
}
