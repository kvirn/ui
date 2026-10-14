'use client'
import { Button, ButtonGroup, Field, Switch, useToast } from '@kvirn-ui/react'
import { useEffect } from 'react'
import { useDocsAutoDismiss } from '../../app/(docs)/providers.tsx'
import { useToastTexts } from './texts.ts'

export function AutoClose() {
  const { texts } = useToastTexts()
  const toast = useToast()
  // Only the outermost KvirnProvider takes `toast`, so the setting lives in this site's provider.
  // In your app it is `<KvirnProvider toast={{ autoDismiss }}>`, driven by your own state or user preference.
  const [autoDismiss, setAutoDismiss] = useDocsAutoDismiss()

  // Leave the site as it was when the reader goes to another page.
  useEffect(() => () => setAutoDismiss(false), [setAutoDismiss])

  return (
    <>
      <Field.Root>
        <Switch
          name="auto-close"
          checked={autoDismiss !== false}
          onCheckedChange={(checked) => setAutoDismiss(checked ? 6000 : false)}
        />
        <Field.Label marker="none">{texts.closeAfterSixSeconds}</Field.Label>
      </Field.Root>
      <ButtonGroup aria-label={texts.autoCloseActions}>
        <Button
          onClick={() => toast.show({ variant: 'success', title: texts.autoCloseConfirmation })}
        >
          {texts.showConfirmation}
        </Button>
        <Button
          onClick={() =>
            toast.show({
              variant: 'success',
              title: texts.autoCloseWithUndo,
              action: { label: texts.undo, onPress: () => {} },
            })
          }
        >
          {texts.showWithUndo}
        </Button>
      </ButtonGroup>
      <p>{texts.autoCloseExplanation}</p>
    </>
  )
}
