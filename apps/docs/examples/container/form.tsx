'use client'
import { Button, Container, Field, Heading, TextInput } from '@kvirn-ui/react'
import { useContainerTexts } from './texts.ts'

export function FormColumn() {
  const { texts } = useContainerTexts()
  return (
    <Container size="form">
      <Heading as="h2">{texts.form.title}</Heading>
      <form onSubmit={(event) => event.preventDefault()}>
        <Field.Root required>
          <Field.Label>{texts.form.label}</Field.Label>
          <TextInput name="address" autoComplete="street-address" />
        </Field.Root>
        <Button type="submit" className="kv-button--primary">
          {texts.form.send}
        </Button>
      </form>
    </Container>
  )
}
