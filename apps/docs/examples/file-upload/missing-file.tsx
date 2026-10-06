'use client'
import { Button, Field, FileUpload } from '@kvirn-ui/react'
import { useEffect, useRef, useState } from 'react'
import { useFileUploadTexts } from './texts.ts'

export function MissingFile() {
  const { texts, textLang } = useFileUploadTexts()
  const [fileCount, setFileCount] = useState(0)
  const [attempts, setAttempts] = useState(0)
  const formRef = useRef<HTMLFormElement>(null)
  const isInvalid = attempts > 0 && fileCount === 0

  // After a failed submit, move focus to the Trigger, the one control of the Field.
  useEffect(() => {
    if (attempts > 0) {
      formRef.current?.querySelector('button')?.focus()
    }
  }, [attempts])

  return (
    <form
      ref={formRef}
      lang={textLang}
      noValidate
      onSubmit={(event) => {
        event.preventDefault()
        if (fileCount === 0) {
          setAttempts((count) => count + 1)
        }
      }}
    >
      <Field.Root required invalid={isInvalid}>
        <Field.Label>{texts.label}</Field.Label>
        <Field.Prose>
          <p>{texts.description}</p>
        </Field.Prose>
        <FileUpload.Root
          accept=".pdf,.jpg,.png"
          maxFiles={5}
          onFilesChange={(items) => {
            setFileCount(items.length)
          }}
        >
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
                <FileUpload.Actions>
                  <FileUpload.RemoveButton />
                </FileUpload.Actions>
              </FileUpload.Item>
            )}
          </FileUpload.List>
        </FileUpload.Root>
        <Field.ErrorMessage>{texts.errorMissing}</Field.ErrorMessage>
      </Field.Root>
      <Button type="submit" className="kv-button--primary">
        {texts.send}
      </Button>
    </form>
  )
}
