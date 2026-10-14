'use client'
import { Dialog, VisuallyHidden } from '@kvirn-ui/react'
import { useId, useState } from 'react'
import { useDialogTexts } from './texts.ts'

export function ManyRows() {
  const { texts } = useDialogTexts()
  const headingId = useId()
  const applications = [
    { number: '2024-118', received: texts.firstReceived, status: texts.waiting },
    { number: '2024-131', received: texts.secondReceived, status: texts.decided },
  ]
  const [open, setOpen] = useState(false)
  const [selectedNumber, setSelectedNumber] = useState('')
  const selected = applications.find((application) => application.number === selectedNumber)
  return (
    <>
      <p id={headingId}>{texts.applications}</p>
      <ul aria-labelledby={headingId}>
        {applications.map((application) => (
          <li key={application.number}>
            {application.number}{' '}
            <button
              type="button"
              className="kv-button"
              onClick={() => {
                setSelectedNumber(application.number)
                setOpen(true)
              }}
            >
              {texts.showDetails}
              <VisuallyHidden>
                {' '}
                {texts.forApplication} {application.number}
              </VisuallyHidden>
            </button>
          </li>
        ))}
      </ul>
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Popup>
          <Dialog.Title>
            {selected === undefined
              ? texts.detailsTitle
              : `${texts.detailsTitle} ${selected.number}`}
          </Dialog.Title>
          <Dialog.Close />
          <Dialog.Body>
            <p>
              {texts.receivedOn} {selected?.received}.
            </p>
            <p>
              {texts.status}: {selected?.status}.
            </p>
          </Dialog.Body>
          <Dialog.Actions>
            <Dialog.Close className="kv-button">{texts.close}</Dialog.Close>
          </Dialog.Actions>
        </Dialog.Popup>
      </Dialog.Root>
    </>
  )
}
