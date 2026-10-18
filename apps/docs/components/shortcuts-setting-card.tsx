'use client'
import { CardRoot, Field, Heading, Prose, Switch } from '@kvirn-ui/react'
import type { ReactNode } from 'react'
import { messages } from '../messages/en.ts'
import { useShortcutsSetting } from '../lib/shortcuts-setting.ts'

const text = messages.docs.accessibility.keyboard.shortcuts

/** `open` and `search` are the key caps, drawn by the page like the rows of its keyboard table. */
export function ShortcutsSettingCard({ open, search }: { open: ReactNode; search: ReactNode }) {
  const [enabled, setEnabled] = useShortcutsSetting()
  return (
    <CardRoot id="shortcuts">
      <Heading as="h3">{text.heading}</Heading>
      <Prose>
        <p>{text.intro}</p>
        <p>
          {text.openBefore} {open} {text.openAfter}
        </p>
        <p>
          {text.searchBefore} {search} {text.searchAfter}
        </p>
        <p>{text.why}</p>
      </Prose>
      <Field.Root>
        <Switch name="shortcuts" checked={enabled} onCheckedChange={setEnabled} />
        <Field.Label marker="none">{text.switchLabel}</Field.Label>
      </Field.Root>
    </CardRoot>
  )
}
