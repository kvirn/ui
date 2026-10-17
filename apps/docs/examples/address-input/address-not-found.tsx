'use client'
import { AddressInput, Button, ErrorSummary, Field, Fieldset, Stack } from '@kvirn-ui/react'
import { useId, useState } from 'react'
import { useAddressInputTexts } from './texts.ts'

export function AddressNotFound() {
  const { texts } = useAddressInputTexts()
  const streetId = `${useId()}-street`
  const [isNotFound, setIsNotFound] = useState(false)
  const [submitCount, setSubmitCount] = useState(0)

  return (
    <Stack className="kv-stack--gap-8">
      {isNotFound ? (
        <ErrorSummary.Root focusKey={submitCount}>
          <ErrorSummary.Title />
          <ErrorSummary.List>
            <ErrorSummary.Item>
              {/* The error is about the whole address, so the link goes to the first box. */}
              <ErrorSummary.Link controlId={streetId}>{texts.errorNotFound}</ErrorSummary.Link>
            </ErrorSummary.Item>
          </ErrorSummary.List>
        </ErrorSummary.Root>
      ) : null}
      <form
        noValidate
        onChange={() => setIsNotFound(false)}
        onSubmit={(event) => {
          event.preventDefault()
          // A real service asks its own back end here. This one never finds the address.
          setIsNotFound(true)
          setSubmitCount((count) => count + 1)
        }}
      >
        <Fieldset.Root invalid={isNotFound}>
          <Fieldset.Legend>{texts.legend}</Fieldset.Legend>
          <AddressInput.Root country="SE">
            <Field.Root controlId={streetId} required>
              <Field.Label>{texts.street}</Field.Label>
              <AddressInput.Line1 name="line1" defaultValue={texts.streetValue} />
            </Field.Root>
            <Field.Root>
              <Field.Label>{texts.line2}</Field.Label>
              <AddressInput.Line2 name="line2" />
              <Field.HelpText>{texts.line2Help}</Field.HelpText>
            </Field.Root>
            <Field.Root required>
              <Field.Label>{texts.postalCode}</Field.Label>
              <AddressInput.PostalCode name="postalCode" defaultValue={texts.postalCodeValue} />
              <Field.HelpText>{texts.postalCodeHelp}</Field.HelpText>
            </Field.Root>
            <Field.Root required>
              <Field.Label>{texts.city}</Field.Label>
              <AddressInput.City name="city" defaultValue={texts.cityValue} />
            </Field.Root>
          </AddressInput.Root>
          <Fieldset.ErrorMessage>{texts.errorNotFound}</Fieldset.ErrorMessage>
        </Fieldset.Root>
        <Button type="submit" className="kv-button--primary">
          {texts.check}
        </Button>
      </form>
    </Stack>
  )
}
