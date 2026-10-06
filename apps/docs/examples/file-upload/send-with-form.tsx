'use client'
import { Button, Field, FileUpload } from '@kvirn-ui/react'
import { useState } from 'react'
import { useFileUploadTexts } from './texts.ts'

export function SendWithForm() {
  const { texts, textLang } = useFileUploadTexts()
  const [sent, setSent] = useState<string[] | undefined>(undefined)
  return (
    <form
      lang={textLang}
      onSubmit={(event) => {
        event.preventDefault()
        const files = new FormData(event.currentTarget).getAll('attachments')
        setSent(
          files.flatMap((file) => (file instanceof File && file.name !== '' ? [file.name] : [])),
        )
      }}
    >
      <Field.Root>
        <Field.Label>{texts.label}</Field.Label>
        <Field.Prose>
          <p>{texts.description}</p>
        </Field.Prose>
        <FileUpload.Root accept=".pdf,.jpg,.png" maxFiles={3}>
          <FileUpload.Input name="attachments" />
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
                <FileUpload.Actions>
                  <FileUpload.RemoveButton />
                </FileUpload.Actions>
              </FileUpload.Item>
            )}
          </FileUpload.List>
        </FileUpload.Root>
      </Field.Root>
      <Button type="submit" className="kv-button--primary">
        {texts.send}
      </Button>
      {sent === undefined ? null : (
        <p>
          {texts.sent}: {sent.length === 0 ? texts.noFiles : sent.join(', ')}
        </p>
      )}
    </form>
  )
}
