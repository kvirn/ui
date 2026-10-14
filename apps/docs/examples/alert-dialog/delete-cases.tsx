'use client'
import { AlertDialog, Button } from '@kvirn-ui/react'
import { useRef, useState } from 'react'
import { useAlertDialogTexts } from './texts.ts'

export function DeleteCases() {
  const { texts } = useAlertDialogTexts()
  const [open, setOpen] = useState(false)
  const [outcome, setOutcome] = useState<string | undefined>()
  const keepReference = useRef<HTMLButtonElement>(null)
  return (
    <>
      <AlertDialog.Root open={open} onOpenChange={setOpen} initialFocusRef={keepReference}>
        <AlertDialog.Trigger className="kv-button">{texts.deleteCases}</AlertDialog.Trigger>
        <AlertDialog.Popup>
          <AlertDialog.Title>{texts.casesTitle}</AlertDialog.Title>
          <AlertDialog.Description>{texts.casesDescription}</AlertDialog.Description>
          <AlertDialog.Body>
            <ul>
              {texts.caseNumbers.map((caseNumber) => (
                <li key={caseNumber}>{caseNumber}</li>
              ))}
            </ul>
          </AlertDialog.Body>
          <AlertDialog.Actions>
            <Button
              className="kv-button--danger"
              onClick={() => {
                setOutcome(texts.casesDeleted)
                setOpen(false)
              }}
            >
              {texts.casesConfirm}
            </Button>
            <AlertDialog.Close as={Button} ref={keepReference}>
              {texts.casesKeep}
            </AlertDialog.Close>
          </AlertDialog.Actions>
        </AlertDialog.Popup>
      </AlertDialog.Root>
      <output>{outcome}</output>
    </>
  )
}
