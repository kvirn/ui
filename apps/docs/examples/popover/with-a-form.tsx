'use client'
import { Popover } from '@kvirn-ui/react'
import { usePopoverTexts } from './texts.ts'

export function WithAForm() {
  const { texts, textLang } = usePopoverTexts()
  return (
    <Popover.Root>
      <Popover.Trigger className="kv-button" lang={textLang}>
        {texts.changePhone}
      </Popover.Trigger>
      <Popover.Popup aria-label={texts.changePhone} lang={textLang}>
        <form onSubmit={(event) => event.preventDefault()}>
          <label>
            {texts.phoneNumber}
            <br />
            <input name="phone" type="tel" autoComplete="tel" className="kv-input" />
          </label>
          <p>
            <button type="submit" className="kv-button kv-button--primary">
              {texts.save}
            </button>{' '}
            <Popover.Close className="kv-button">{texts.cancel}</Popover.Close>
          </p>
        </form>
      </Popover.Popup>
    </Popover.Root>
  )
}
