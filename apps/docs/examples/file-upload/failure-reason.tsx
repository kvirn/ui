'use client'
import { Field, FileUpload } from '@kvirn-ui/react'
import { useFileUploadTexts } from './texts.ts'

export function FailureReason() {
  const { texts, textLang } = useFileUploadTexts()
  return (
    <Field.Root lang={textLang}>
      <Field.Label>{texts.label}</Field.Label>
      <Field.Prose>
        <p>{texts.description}</p>
      </Field.Prose>
      <FileUpload.Root
        accept=".pdf,.jpg,.png"
        // An error that sets `retryable` opts in: its message is shown, and Retry is left out.
        upload={(file) =>
          Promise.reject(
            Object.assign(new Error(texts.notAccepted(file.name)), {
              retryable: false,
              message: texts.notAccepted(file.name),
            }),
          )
        }
      >
        <FileUpload.DropZone>
          <FileUpload.Trigger />
          <FileUpload.DropHint />
        </FileUpload.DropZone>
        <FileUpload.Limits />
        <FileUpload.List>
          {(item) => (
            <FileUpload.Item key={item.id} item={item}>
              <FileUpload.Name />
              <FileUpload.Status />
              <FileUpload.ItemError />
              <FileUpload.Actions>
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
