'use client'
import { Button } from '@kvirn-ui/react'
import { useId } from 'react'
import { useExampleTexts } from './example-texts.tsx'

// Live examples for the Button page, in all six languages. Styled by theme.css: the variant
// is a `kv-button--*` class, and `kv-button-group` lays the buttons out.

/** Primary first: the one main next step. Danger sits next to it here only to compare. */
export function ButtonVariants() {
  const { texts, textLang } = useExampleTexts()
  return (
    <>
      <div className="kv-button-group">
        <Button className="kv-button--primary" lang={textLang}>
          {texts.button.sendApplication}
        </Button>
        <Button lang={textLang}>{texts.button.saveDraft}</Button>
        <Button className="kv-button--danger" lang={textLang}>
          {texts.button.deleteDraft}
        </Button>
      </div>
      <p lang={textLang}>{texts.button.dangerNote}</p>
    </>
  )
}

/** Disabled, but still reachable by keyboard, with the reason next to it. */
export function DisabledWithReason() {
  const { texts, textLang } = useExampleTexts()
  const reasonId = useId()
  return (
    <>
      <p id={reasonId} lang={textLang}>
        {texts.button.disabledReason}
      </p>
      <Button
        className="kv-button--primary"
        lang={textLang}
        disabled
        focusableWhenDisabled
        aria-describedby={reasonId}
      >
        {texts.button.sendApplication}
      </Button>
    </>
  )
}
