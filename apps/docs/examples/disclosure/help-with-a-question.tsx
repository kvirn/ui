'use client'
import { Disclosure, Field, Stack, TextInput } from '@kvirn-ui/react'
import { useDisclosureTexts } from './texts.ts'

export function HelpWithAQuestion() {
  const { texts } = useDisclosureTexts()
  return (
    <Stack className="kv-stack--gap-8">
      <Field.Root>
        <Field.Label>{texts.phone}</Field.Label>
        <TextInput name="phone" type="tel" autoComplete="tel" />
      </Field.Root>
      <Disclosure.Root>
        <Disclosure.Trigger>{texts.whyPhone}</Disclosure.Trigger>
        <Disclosure.Panel>
          <p>{texts.whyPhoneText}</p>
        </Disclosure.Panel>
      </Disclosure.Root>
    </Stack>
  )
}
