'use client'
import { Button, Field, Popover, TextInput } from '@kvirn-ui/react'
import { ButtonGroup } from '@kvirn-ui/react'
import { useMessages } from '@kvirn-ui/react/internal'
import type { Editor } from '@tiptap/core'
import { useEffect, useRef, useState } from 'react'
import type { ReactElement } from 'react'
import { isAllowedLinkAddress } from '../extensions/default-extensions.ts'
import { FormPopover } from './form-popover.tsx'
import { ToolbarIcon } from './icons.tsx'
import { useRichTextEditorContext } from './rich-text-editor-context.ts'
import { useEditorSelector } from './use-editor-selector.ts'

/** What is wrong with an address typed into the link form: nothing, missing, or not an allowed address. */
export type AddressProblem = 'missing' | 'invalid'

/**
 * Checks a link address from the form: it must be there, and be a full `https`, `http`, `mailto`
 * or `tel` address, or a path or fragment on this site (`/hjalp`, `#kontakt`). A scheme-less
 * `www.example.se` is refused with the format, because guessing a scheme would link somewhere the
 * author didn't see. Never `javascript:` and the like.
 */
export function getLinkAddressProblem(value: string): AddressProblem | undefined {
  const address = value.trim()
  if (address === '') {
    return 'missing'
  }
  const isFull = /^(https?:\/\/\S+|mailto:\S+|tel:\S+)$/i.test(address)
  const isLocal = /^[/#]\S*$/.test(address)
  return (isFull || isLocal) && isAllowedLinkAddress(address) ? undefined : 'invalid'
}

interface LinkState {
  /** The caret is in a link, or a link is selected: the form edits it. */
  isEditing: boolean
  /** Something is selected, so the link's text is already there. */
  hasSelection: boolean
  href: string
}

function readLinkState(editor: Editor): LinkState {
  const isEditing = editor.isActive('link')
  const href: unknown = editor.getAttributes('link')['href']
  return {
    isEditing,
    hasSelection: !editor.state.selection.empty,
    href: isEditing && typeof href === 'string' ? href : '',
  }
}

interface LinkFormProps {
  editor: Editor
  onClose: (reason: 'apply' | 'remove') => void
}

function LinkForm({ editor, onClose }: LinkFormProps): ReactElement {
  const { messageOverrides, announce } = useRichTextEditorContext('RichTextEditor.LinkControl')
  const messages = useMessages('richText', messageOverrides)
  // Read once, when the form opens: the selection is the text the link will be made from.
  const [link] = useState(() => readLinkState(editor))
  const [address, setAddress] = useState(link.href)
  const [text, setText] = useState('')
  const [problems, setProblems] = useState<{ address?: AddressProblem; text?: true }>({})
  const addressInput = useRef<HTMLInputElement | null>(null)
  const textInput = useRef<HTMLInputElement | null>(null)
  const needsText = !link.isEditing && !link.hasSelection

  // A popover that opens with a form moves focus to its first field itself (the Popover contract's
  // allowed case). The popup is shown after this effect, so wait a frame.
  useEffect(() => {
    const frame = requestAnimationFrame(() => addressInput.current?.focus())
    return () => cancelAnimationFrame(frame)
  }, [])

  const addressMessage =
    problems.address === 'missing'
      ? messages.linkUrlMissing
      : problems.address === 'invalid'
        ? messages.linkUrlInvalid
        : undefined

  const submit = () => {
    const addressProblem = getLinkAddressProblem(address)
    const textProblem = needsText && text.trim() === '' ? true : undefined
    if (addressProblem !== undefined || textProblem !== undefined) {
      setProblems({
        ...(addressProblem === undefined ? {} : { address: addressProblem }),
        ...(textProblem === undefined ? {} : { text: textProblem }),
      })
      // The popover stays open, with focus on the first field that needs fixing.
      ;(addressProblem === undefined ? textInput : addressInput).current?.focus()
      return
    }
    const href = address.trim()
    const chain = editor.chain()
    if (link.isEditing) {
      chain.extendMarkRange('link').setLink({ href })
    } else if (link.hasSelection) {
      chain.setLink({ href })
    } else {
      chain.insertContent({
        type: 'text',
        text: text.trim(),
        marks: [{ type: 'link', attrs: { href } }],
      })
    }
    chain.run()
    announce(link.isEditing ? messages.linkUpdated : messages.linkAdded)
    onClose('apply')
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
        <Field.Label marker="none">{messages.linkUrl}</Field.Label>
        <TextInput
          ref={addressInput}
          type="url"
          inputMode="url"
          autoComplete="url"
          value={address}
          onValueChange={setAddress}
        />
        <Field.HelpText>{messages.linkUrlHint}</Field.HelpText>
        <Field.ErrorMessage>{addressMessage}</Field.ErrorMessage>
      </Field.Root>
      {needsText ? (
        <Field.Root required invalid={problems.text !== undefined}>
          <Field.Label marker="none">{messages.linkText}</Field.Label>
          <TextInput ref={textInput} value={text} onValueChange={setText} />
          <Field.HelpText>{messages.linkTextHint}</Field.HelpText>
          <Field.ErrorMessage>{messages.linkTextMissing}</Field.ErrorMessage>
        </Field.Root>
      ) : null}
      <ButtonGroup>
        <Button type="submit" className="kv-button--primary">
          {link.isEditing ? messages.save : messages.linkAdd}
        </Button>
        {link.isEditing ? (
          <Button
            type="button"
            onClick={() => {
              editor.chain().extendMarkRange('link').unsetLink().run()
              announce(messages.linkRemoved)
              onClose('remove')
            }}
          >
            {messages.linkRemove}
          </Button>
        ) : null}
        <Popover.Close as={Button}>{messages.cancel}</Popover.Close>
      </ButtonGroup>
    </form>
  )
}

/**
 * The Link control: a toolbar button that opens a small form in a popover, to add a link or, on a
 * link, to change or remove it. The form asks for the web address (checked against the allowed
 * schemes, with an inline error that keeps focus in the form), and for the link's text when nothing
 * is selected, so a link never becomes its bare address (WCAG 2.4.4). Mod-k opens it. Escape,
 * Cancel and Apply return focus to the text, with the selection where it was, and the result is
 * announced.
 */
export function LinkControl(): ReactElement | null {
  const context = useRichTextEditorContext('RichTextEditor.LinkControl')
  const { editor, focusText, registerLinkForm, messageOverrides } = context
  const messages = useMessages('richText', messageOverrides)
  const [isOpen, setIsOpen] = useState(false)
  const isOnLink = useEditorSelector(editor, (current) => current.isActive('link'), false)

  useEffect(() => registerLinkForm(() => setIsOpen(true)), [registerLinkForm])

  if (editor === null) {
    return (
      <FormPopover
        label={messages.link}
        icon={<ToolbarIcon name="link" />}
        shortcut={['Mod-k']}
        title={messages.linkAddTitle}
        isOpen={false}
        onOpenChange={() => {}}
      >
        {null}
      </FormPopover>
    )
  }
  return (
    <FormPopover
      label={messages.link}
      icon={<ToolbarIcon name="link" />}
      shortcut={['Mod-k']}
      title={isOnLink ? messages.linkEditTitle : messages.linkAddTitle}
      isOpen={isOpen}
      onOpenChange={(open, details) => {
        setIsOpen(open)
        // Escape and Cancel put the user back in the text. A press elsewhere leaves focus there.
        if (!open && (details.reason === 'escape' || details.reason === 'close-press')) {
          focusText()
        }
      }}
    >
      <LinkForm
        editor={editor}
        onClose={() => {
          setIsOpen(false)
          focusText()
        }}
      />
    </FormPopover>
  )
}
LinkControl.displayName = 'RichTextEditor.LinkControl'
