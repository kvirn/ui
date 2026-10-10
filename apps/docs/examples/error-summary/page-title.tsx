'use client'
import { Button, ErrorSummary, Field, Stack, TextInput } from '@kvirn-ui/react'
import { useId, useState, useSyncExternalStore } from 'react'
import { useErrorSummaryTexts } from './texts.ts'

function subscribeToTitle(onChange: () => void) {
  const observer = new MutationObserver(onChange)
  observer.observe(document.head, { childList: true, subtree: true, characterData: true })
  return () => observer.disconnect()
}

export function PageTitle() {
  const { texts, textLang } = useErrorSummaryTexts()
  const emailId = `${useId()}-email`
  const [isShown, setIsShown] = useState(false)
  const tabTitle = useSyncExternalStore(
    subscribeToTitle,
    () => document.title,
    () => '',
  )

  return (
    <Stack className="kv-stack--gap-8" lang={textLang}>
      <Button onClick={() => setIsShown((shown) => !shown)}>
        {isShown ? texts.hideSummary : texts.showSummary}
      </Button>
      {isShown ? (
        <ErrorSummary.Root prefixDocumentTitle>
          <ErrorSummary.Title />
          <ErrorSummary.List>
            <ErrorSummary.Item>
              <ErrorSummary.Link controlId={emailId}>{texts.emailError}</ErrorSummary.Link>
            </ErrorSummary.Item>
          </ErrorSummary.List>
        </ErrorSummary.Root>
      ) : null}
      <Field.Root controlId={emailId}>
        <Field.Label>{texts.email}</Field.Label>
        <TextInput type="email" autoComplete="email" />
      </Field.Root>
      <p>
        {texts.tabTitle} <q>{tabTitle}</q>
      </p>
    </Stack>
  )
}
