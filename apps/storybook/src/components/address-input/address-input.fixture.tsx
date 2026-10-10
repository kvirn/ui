import { AddressInput, Button, Field, Fieldset } from '@kvirn-ui/react'
import { useState } from 'react'

// Story fixture for Components/Forms/AddressInput (docs/design/phone-and-address-inputs.md §4,
// §8.1). The component holds no text: the labels, help texts and errors below are the consumer's,
// in English here. The Swedish, Finnish and Norwegian fixtures are literal JSX in the stories.
// Nothing here validates: an invalid part sets `invalid` and writes its message itself.

/**
 * The keys of the contract: a button before the address, the four parts and a submit button in a
 * form. Tab goes part to part, a full postal code keeps focus, and Enter submits.
 */
export function KeyboardAddress() {
  const [submits, setSubmits] = useState(0)
  return (
    <form
      className="kv-story-form"
      lang="en"
      noValidate
      onSubmit={(event) => {
        event.preventDefault()
        setSubmits((count) => count + 1)
      }}
    >
      <div className="kv-button-group">
        <Button type="button">Back</Button>
      </div>
      <Fieldset.Root>
        <Fieldset.Legend>Your address</Fieldset.Legend>
        <AddressInput.Root country="SE">
          <Field.Root required>
            <Field.Label>Street address</Field.Label>
            <AddressInput.Line1 name="line1" />
          </Field.Root>
          <Field.Root>
            <Field.Label>Address line 2</Field.Label>
            <AddressInput.Line2 name="line2" />
            <Field.HelpText>For example c/o and a name</Field.HelpText>
          </Field.Root>
          <Field.Root required>
            <Field.Label>Postal code</Field.Label>
            <AddressInput.PostalCode name="postalCode" />
            <Field.HelpText>For example 123 45</Field.HelpText>
          </Field.Root>
          <Field.Root required>
            <Field.Label>Town or city</Field.Label>
            <AddressInput.City name="city" />
          </Field.Root>
        </AddressInput.Root>
      </Fieldset.Root>
      <div className="kv-button-group">
        <Button type="submit" className="kv-button--primary">
          Send
        </Button>
      </div>
      <p className="kv-story-form-output" data-testid="submits">
        Sent: {submits}
      </p>
    </form>
  )
}

/**
 * Filled, optional, wrong and group-wrong in one column: a filled street, an empty optional line 2,
 * a wrong postal code with its own message, and the whole address marked under the parts. The RTL
 * and ForcedColors stories render it.
 */
export function AddressStates() {
  return (
    <div className="kv-story-form" lang="en">
      <Fieldset.Root invalid>
        <Fieldset.Legend>Your address</Fieldset.Legend>
        <AddressInput.Root country="SE">
          <Field.Root required>
            <Field.Label>Street address</Field.Label>
            <AddressInput.Line1 name="line1" defaultValue="Storgatan 12" />
          </Field.Root>
          <Field.Root>
            <Field.Label>Address line 2</Field.Label>
            <AddressInput.Line2 name="line2" />
            <Field.HelpText>For example c/o and a name</Field.HelpText>
          </Field.Root>
          <Field.Root required invalid>
            <Field.Label>Postal code</Field.Label>
            <AddressInput.PostalCode name="postalCode" defaultValue="123 4" />
            <Field.HelpText>For example 123 45</Field.HelpText>
            <Field.ErrorMessage>Enter a postal code with 5 digits, like 123 45</Field.ErrorMessage>
          </Field.Root>
          <Field.Root required>
            <Field.Label>Town or city</Field.Label>
            <AddressInput.City name="city" defaultValue="Kvirnby" />
          </Field.Root>
        </AddressInput.Root>
        <Fieldset.ErrorMessage>
          We couldn’t find this address. Check the street address and postal code.
        </Fieldset.ErrorMessage>
      </Fieldset.Root>
    </div>
  )
}
