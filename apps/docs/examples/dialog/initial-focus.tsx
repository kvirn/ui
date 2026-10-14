'use client'
import { Dialog, Field, RadioGroup } from '@kvirn-ui/react'
import { useRef, useState } from 'react'
import { useDialogTexts } from './texts.ts'

export function InitialFocus() {
  const { texts } = useDialogTexts()
  const [open, setOpen] = useState(false)
  const [delivery, setDelivery] = useState<'digital' | 'paper'>('paper')
  const titleRef = useRef<HTMLHeadingElement>(null)
  return (
    <>
      {/*
        Without initialFocusRef, focus starts on the first radio button, below the text, and the
        notice is skipped. The title takes focus here instead, so reading starts at the top.
      */}
      <Dialog.Root open={open} onOpenChange={setOpen} initialFocusRef={titleRef}>
        <Dialog.Trigger className="kv-button">{texts.readNotice}</Dialog.Trigger>
        <Dialog.Popup>
          <Dialog.Title ref={titleRef}>{texts.noticeTitle}</Dialog.Title>
          <Dialog.Close />
          <form
            onSubmit={(event) => {
              event.preventDefault()
              const choice = new FormData(event.currentTarget).get('delivery')
              setDelivery(choice === 'digital' ? 'digital' : 'paper')
              setOpen(false)
            }}
          >
            <Dialog.Body>
              <p>{texts.noticeFirst}</p>
              <p>{texts.noticeSecond}</p>
              <RadioGroup.Root name="delivery" defaultValue="paper">
                <RadioGroup.Legend>{texts.deliveryLegend}</RadioGroup.Legend>
                <Field.Root>
                  <RadioGroup.Radio value="digital" />
                  <Field.Label>{texts.deliveryDigital}</Field.Label>
                </Field.Root>
                <Field.Root>
                  <RadioGroup.Radio value="paper" />
                  <Field.Label>{texts.deliveryPaper}</Field.Label>
                </Field.Root>
              </RadioGroup.Root>
            </Dialog.Body>
            <Dialog.Actions>
              <button type="submit" className="kv-button kv-button--primary">
                {texts.saveChoice}
              </button>
              <Dialog.Close className="kv-button">{texts.decideLater}</Dialog.Close>
            </Dialog.Actions>
          </form>
        </Dialog.Popup>
      </Dialog.Root>
      <output>
        {texts.lettersCome}: {delivery === 'digital' ? texts.deliveryDigital : texts.deliveryPaper}.
      </output>
    </>
  )
}
