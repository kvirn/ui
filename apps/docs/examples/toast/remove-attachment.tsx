'use client'
import { Button, Heading, Stack, useToast } from '@kvirn-ui/react'
import { useRef, useState } from 'react'
import { useToastTexts } from './texts.ts'

export function RemoveAttachment() {
  const { texts } = useToastTexts()
  const toast = useToast()
  const [files, setFiles] = useState(texts.attachments)
  const headingReference = useRef<HTMLHeadingElement>(null)

  const restore = (file: string) =>
    setFiles((current) =>
      texts.attachments.filter((name) => name === file || current.includes(name)),
    )

  const remove = (file: string) => {
    // The button that was pressed leaves with its row. Focus a heading that stays first, so focus
    // has a place to return to when the toast closes.
    headingReference.current?.focus()
    setFiles((current) => current.filter((name) => name !== file))
    toast.show({
      variant: 'success',
      title: texts.fileRemoved(file),
      focus: true,
      action: { label: texts.undo, onPress: () => restore(file) },
    })
  }

  return (
    <>
      <Heading as="h4" ref={headingReference} tabIndex={-1}>
        {texts.attachmentsTitle}
      </Heading>
      {files.length === 0 ? (
        <p>{texts.noAttachments}</p>
      ) : (
        <Stack as="ul" className="kv-stack--gap-4">
          {files.map((file) => (
            <Stack as="li" key={file} className="kv-stack--gap-2">
              <span>{file}</span>
              <Button aria-label={texts.removeFile(file)} onClick={() => remove(file)}>
                {texts.remove}
              </Button>
            </Stack>
          ))}
        </Stack>
      )}
      {/* The same way back on the page: the toast is a shortcut, never the only way. */}
      {files.length < texts.attachments.length ? (
        <Button onClick={() => setFiles(texts.attachments)}>{texts.restoreFiles}</Button>
      ) : null}
    </>
  )
}
