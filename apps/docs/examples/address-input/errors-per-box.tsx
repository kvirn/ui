'use client'
import { AddressInput, Button, ErrorSummary, Field, Fieldset, Stack } from '@kvirn-ui/react'
import { useId, useState } from 'react'
import { useAddressInputTexts } from './texts.ts'

type Part = 'street' | 'postalCode' | 'city'
type Errors = Record<Part, boolean>

const noErrors: Errors = { street: false, postalCode: false, city: false }

// Your own rules: here the street and the city must be filled in, and a Swedish postal code has
// five digits. A real service checks again on the server.
function check(data: FormData): Errors {
  const text = (name: string) => {
    const value = data.get(name)
    return typeof value === 'string' ? value.trim() : ''
  }
  return {
    street: text('line1') === '',
    postalCode: text('postalCode').replaceAll(/\D/g, '').length !== 5,
    city: text('city') === '',
  }
}

export function ErrorsPerBox() {
  const { texts } = useAddressInputTexts()
  const idPrefix = useId()
  const ids: Record<Part, string> = {
    street: `${idPrefix}-street`,
    postalCode: `${idPrefix}-postal-code`,
    city: `${idPrefix}-city`,
  }
  const [errors, setErrors] = useState<Errors>(noErrors)
  const [submitCount, setSubmitCount] = useState(0)
  const [isSent, setIsSent] = useState(false)
  const hasErrors = errors.street || errors.postalCode || errors.city

  return (
    <Stack className="kv-stack--gap-8">
      {hasErrors ? (
        <ErrorSummary.Root focusKey={submitCount}>
          <ErrorSummary.Title />
          <ErrorSummary.List>
            {errors.street ? (
              <ErrorSummary.Item>
                <ErrorSummary.Link controlId={ids.street}>{texts.errorStreet}</ErrorSummary.Link>
              </ErrorSummary.Item>
            ) : null}
            {errors.postalCode ? (
              <ErrorSummary.Item>
                <ErrorSummary.Link controlId={ids.postalCode}>
                  {texts.errorPostalCode}
                </ErrorSummary.Link>
              </ErrorSummary.Item>
            ) : null}
            {errors.city ? (
              <ErrorSummary.Item>
                <ErrorSummary.Link controlId={ids.city}>{texts.errorCity}</ErrorSummary.Link>
              </ErrorSummary.Item>
            ) : null}
          </ErrorSummary.List>
        </ErrorSummary.Root>
      ) : null}
      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault()
          const next = check(new FormData(event.currentTarget))
          setErrors(next)
          setSubmitCount((count) => count + 1)
          setIsSent(!next.street && !next.postalCode && !next.city)
        }}
      >
        <Fieldset.Root>
          <Fieldset.Legend>{texts.legend}</Fieldset.Legend>
          <AddressInput.Root country="SE">
            <Field.Root controlId={ids.street} required invalid={errors.street}>
              <Field.Label>{texts.street}</Field.Label>
              <AddressInput.Line1 name="line1" />
              <Field.ErrorMessage>{texts.errorStreet}</Field.ErrorMessage>
            </Field.Root>
            <Field.Root>
              <Field.Label>{texts.line2}</Field.Label>
              <AddressInput.Line2 name="line2" />
              <Field.HelpText>{texts.line2Help}</Field.HelpText>
            </Field.Root>
            <Field.Root controlId={ids.postalCode} required invalid={errors.postalCode}>
              <Field.Label>{texts.postalCode}</Field.Label>
              <AddressInput.PostalCode
                name="postalCode"
                defaultValue={texts.incompletePostalCode}
              />
              <Field.HelpText>{texts.postalCodeHelp}</Field.HelpText>
              <Field.ErrorMessage>{texts.errorPostalCode}</Field.ErrorMessage>
            </Field.Root>
            <Field.Root controlId={ids.city} required invalid={errors.city}>
              <Field.Label>{texts.city}</Field.Label>
              <AddressInput.City name="city" />
              <Field.ErrorMessage>{texts.errorCity}</Field.ErrorMessage>
            </Field.Root>
          </AddressInput.Root>
        </Fieldset.Root>
        <Button type="submit" className="kv-button--primary">
          {texts.send}
        </Button>
      </form>
      <output>{isSent ? texts.sent : null}</output>
    </Stack>
  )
}
