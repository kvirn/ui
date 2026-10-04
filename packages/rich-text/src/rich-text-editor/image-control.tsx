'use client'
import { Button, ButtonGroup, Checkbox, Field, Popover, TextInput } from '@kvirn-ui/react'
import { useMessages } from '@kvirn-ui/react/internal'
import type { Editor } from '@tiptap/core'
import { useEffect, useRef, useState } from 'react'
import type { ReactElement } from 'react'
import { FormPopover } from './form-popover.tsx'
import { ToolbarIcon } from './icons.tsx'
import { useRichTextEditorContext } from './rich-text-editor-context.ts'
import { useEditorSelector } from './use-editor-selector.ts'

/** What is wrong with an image address typed into the image form. */
export type ImageAddressProblem = 'missing' | 'invalid' | 'not-allowed'

/**
 * Checks an image address from the form: it must be there and be a full `http` or `https` address,
 * or a path on this site. Whether its origin is allowed (`imageSources`) is the editor's answer:
 * `editor.can().setImage` is `false` for an address the extension refuses.
 */
export function getImageAddressProblem(
  editor: Editor,
  value: string,
): ImageAddressProblem | undefined {
  const address = value.trim()
  if (address === '') {
    return 'missing'
  }
  if (!/^(https?:\/\/\S+|\/\S*)$/i.test(address)) {
    return 'invalid'
  }
  return editor.can().setImage({ src: address, alt: 'x' }) ? undefined : 'not-allowed'
}

interface ImageState {
  /** An image is selected: the form edits it. */
  isEditing: boolean
  src: string
  alt: string
  isDecorative: boolean
}

function readImageState(editor: Editor): ImageState {
  const isEditing = editor.isActive('image')
  const attributes = editor.getAttributes('image')
  const src: unknown = attributes['src']
  const alt: unknown = attributes['alt']
  return {
    isEditing,
    src: isEditing && typeof src === 'string' ? src : '',
    alt: isEditing && typeof alt === 'string' ? alt : '',
    // An empty alt on a stored image is the decorative choice.
    isDecorative: isEditing && alt === '',
  }
}

interface ImageFormProps {
  editor: Editor
  onClose: () => void
}

function ImageForm({ editor, onClose }: ImageFormProps): ReactElement {
  const { messageOverrides, announce } = useRichTextEditorContext('RichTextEditor.ImageControl')
  const messages = useMessages('richText', messageOverrides)
  const [image] = useState(() => readImageState(editor))
  const [address, setAddress] = useState(image.src)
  const [alt, setAlt] = useState(image.alt)
  const [isDecorative, setIsDecorative] = useState(image.isDecorative)
  const [problems, setProblems] = useState<{ address?: ImageAddressProblem; alt?: true }>({})
  const addressInput = useRef<HTMLInputElement | null>(null)
  const altInput = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    const frame = requestAnimationFrame(() => addressInput.current?.focus())
    return () => cancelAnimationFrame(frame)
  }, [])

  const addressMessages = {
    missing: messages.imageUrlMissing,
    invalid: messages.imageUrlInvalid,
    'not-allowed': messages.imageUrlNotAllowed,
  }

  const submit = () => {
    const addressProblem = getImageAddressProblem(editor, address)
    // The description is required unless the image is only decoration, which saves `alt=""`.
    const altProblem = !isDecorative && alt.trim() === '' ? true : undefined
    if (addressProblem !== undefined || altProblem !== undefined) {
      setProblems({
        ...(addressProblem === undefined ? {} : { address: addressProblem }),
        ...(altProblem === undefined ? {} : { alt: altProblem }),
      })
      ;(addressProblem === undefined ? altInput : addressInput).current?.focus()
      return
    }
    const attributes = { src: address.trim(), alt: isDecorative ? '' : alt.trim() }
    if (image.isEditing) {
      editor.chain().updateAttributes('image', attributes).run()
    } else {
      editor.chain().setImage(attributes).run()
    }
    announce(image.isEditing ? messages.imageUpdated : messages.imageAdded)
    onClose()
  }

  return (
    <form
      noValidate
      className="kv-rich-text-popover-form"
      onSubmit={(event) => {
        event.preventDefault()
        submit()
      }}
    >
      <Field.Root required invalid={problems.address !== undefined}>
        <Field.Label marker="none">{messages.imageUrl}</Field.Label>
        <TextInput
          ref={addressInput}
          type="url"
          inputMode="url"
          autoComplete="off"
          value={address}
          onValueChange={setAddress}
        />
        <Field.HelpText>{messages.imageUrlHint}</Field.HelpText>
        <Field.ErrorMessage>
          {problems.address === undefined ? undefined : addressMessages[problems.address]}
        </Field.ErrorMessage>
      </Field.Root>
      <Field.Root
        required={!isDecorative}
        disabled={isDecorative}
        invalid={problems.alt !== undefined}
      >
        <Field.Label marker="none">{messages.imageAlt}</Field.Label>
        <TextInput ref={altInput} value={alt} onValueChange={setAlt} />
        <Field.HelpText>{messages.imageAltHint}</Field.HelpText>
        <Field.ErrorMessage>{messages.imageAltMissing}</Field.ErrorMessage>
      </Field.Root>
      <Field.Root>
        <Checkbox
          checked={isDecorative}
          onCheckedChange={(checked) => {
            setIsDecorative(checked)
            if (checked) {
              setProblems(({ alt: _cleared, ...rest }) => rest)
            }
          }}
        />
        <Field.Label marker="none">{messages.imageDecorative}</Field.Label>
        <Field.HelpText>{messages.imageDecorativeHint}</Field.HelpText>
      </Field.Root>
      <ButtonGroup>
        <Button type="submit" className="kv-button--primary">
          {image.isEditing ? messages.save : messages.imageAdd}
        </Button>
        {image.isEditing ? (
          <Button
            type="button"
            onClick={() => {
              editor.chain().deleteSelection().run()
              announce(messages.imageRemoved)
              onClose()
            }}
          >
            {messages.imageRemove}
          </Button>
        ) : null}
        <Popover.Close render={<Button />}>{messages.cancel}</Popover.Close>
      </ButtonGroup>
    </form>
  )
}

/**
 * The Image control: a toolbar button that opens a small form in a popover, to add an image from
 * an address, or to change or remove the selected one. The description ("Vad visar bilden?") is
 * required unless the image is ticked as only decoration, which saves an empty `alt`: an image can't
 * be added without one of the two (WCAG 1.1.1). The address is limited to the allowed image
 * sources (`imageSources`, this site's own by default). There is no upload.
 */
export function ImageControl(): ReactElement {
  const { editor, focusText, messageOverrides } = useRichTextEditorContext(
    'RichTextEditor.ImageControl',
  )
  const messages = useMessages('richText', messageOverrides)
  const [isOpen, setIsOpen] = useState(false)
  const isOnImage = useEditorSelector(editor, (current) => current.isActive('image'), false)
  return (
    <FormPopover
      label={messages.image}
      icon={<ToolbarIcon name="image" />}
      title={isOnImage ? messages.imageEditTitle : messages.imageAddTitle}
      isOpen={isOpen && editor !== null}
      onOpenChange={(open, details) => {
        setIsOpen(open)
        if (!open && (details.reason === 'escape' || details.reason === 'close-press')) {
          focusText()
        }
      }}
    >
      {editor === null ? null : (
        <ImageForm
          editor={editor}
          onClose={() => {
            setIsOpen(false)
            focusText()
          }}
        />
      )}
    </FormPopover>
  )
}
ImageControl.displayName = 'RichTextEditor.ImageControl'
