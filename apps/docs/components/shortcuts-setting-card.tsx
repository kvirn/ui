'use client'
import { CardRoot, Field, Heading, Prose, Switch } from '@kvirn-ui/react'
import { messages } from '../messages/en.ts'
import { useShortcutsSetting } from '../lib/shortcuts-setting.ts'

const text = messages.docs.accessibility.keyboard.shortcuts

export function ShortcutsSettingCard() {
  const [enabled, setEnabled] = useShortcutsSetting()
  return (
    <CardRoot id="shortcuts">
      <Heading as="h3">{text.heading}</Heading>
      <Prose>
        <p>{text.intro}</p>
        <p>{text.why}</p>
      </Prose>
      <Field.Root>
        <Switch name="shortcuts" checked={enabled} onCheckedChange={setEnabled} />
        <Field.Label marker="none">{text.switchLabel}</Field.Label>
      </Field.Root>
    </CardRoot>
  )
}
