'use client'
import { Button, Container, Heading } from '@kvirn-ui/react'
import { useId } from 'react'
import { useContainerTexts } from './texts.ts'
import { InEnglishWhenFallback } from '../../components/example-language.tsx'

export function FormColumn() {
  const { texts, isFallback } = useContainerTexts()
  const inputId = useId()
  return (
    <InEnglishWhenFallback isFallback={isFallback}>
      <Container size="form">
        <Heading as="h2">{texts.form.title}</Heading>
        <form onSubmit={(event) => event.preventDefault()}>
          <label htmlFor={inputId}>{texts.form.label}</label>
          <input id={inputId} autoComplete="street-address" />
          <Button type="submit">{texts.form.send}</Button>
        </form>
      </Container>
    </InEnglishWhenFallback>
  )
}
