'use client'
import { Dialog, Field, Heading, TextInput, VisuallyHidden } from '@kvirn-ui/react'
import { useRef, useState } from 'react'
import { useDialogTexts } from './texts.ts'

export function CloseFromList() {
  const { texts } = useDialogTexts()
  const [openCases, setOpenCases] = useState(texts.cases)
  const [closingNumber, setClosingNumber] = useState('')
  const [open, setOpen] = useState(false)
  const [wasCaseClosed, setWasCaseClosed] = useState(false)
  const listHeadingRef = useRef<HTMLHeadingElement>(null)
  return (
    <>
      {/*
        The button that opened the dialog is removed with its row only when the case is closed, so
        finalFocusRef names the list's heading only then. Keep open, Escape and the X leave it
        undefined and focus returns to the button. The heading stays on the page, and tabIndex={-1}
        lets it take focus without becoming a Tab stop.
      */}
      <Heading as="h4" ref={listHeadingRef} tabIndex={-1}>
        {texts.openCases(openCases.length)}
      </Heading>
      {openCases.length === 0 ? (
        <p>{texts.noOpenCases}</p>
      ) : (
        <ul>
          {openCases.map((openCase) => (
            <li key={openCase.number}>
              {openCase.number}: {openCase.subject}{' '}
              <button
                type="button"
                className="kv-button"
                onClick={() => {
                  setClosingNumber(openCase.number)
                  setWasCaseClosed(false)
                  setOpen(true)
                }}
              >
                {texts.closeCase}
                <VisuallyHidden>
                  {' '}
                  {texts.forCase} {openCase.number}
                </VisuallyHidden>
              </button>
            </li>
          ))}
        </ul>
      )}
      <p>
        <button type="button" className="kv-button" onClick={() => setOpenCases(texts.cases)}>
          {texts.showCasesAgain}
        </button>
      </p>
      <Dialog.Root
        open={open}
        onOpenChange={setOpen}
        finalFocusRef={wasCaseClosed ? listHeadingRef : undefined}
      >
        <Dialog.Popup>
          <Dialog.Title>{texts.closeCaseTitle(closingNumber)}</Dialog.Title>
          <Dialog.Close />
          <Dialog.Description>{texts.closeCaseText}</Dialog.Description>
          <form
            // A new key per case, so the note of one case is not still there for the next.
            key={closingNumber}
            onSubmit={(event) => {
              event.preventDefault()
              setOpenCases((cases) =>
                cases.filter((candidate) => candidate.number !== closingNumber),
              )
              setWasCaseClosed(true)
              setOpen(false)
            }}
          >
            <Dialog.Body>
              <Field.Root>
                <Field.Label>{texts.noteForResident}</Field.Label>
                <TextInput name="note" />
              </Field.Root>
            </Dialog.Body>
            <Dialog.Actions>
              <button type="submit" className="kv-button kv-button--primary">
                {texts.closeCase}
              </button>
              <Dialog.Close className="kv-button">{texts.keepOpen}</Dialog.Close>
            </Dialog.Actions>
          </form>
        </Dialog.Popup>
      </Dialog.Root>
    </>
  )
}
