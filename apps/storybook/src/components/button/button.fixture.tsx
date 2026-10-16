import { Button, ButtonGroup } from '@kvirn-ui/react'
import { useState } from 'react'

// Fixture for Components/Button. The story's "Show code" prints this function (`showSource`), so
// it reads the way an adopter writes it: the real Button with its `type`, in a real <form>.

/**
 * `type="submit"` submits the form, and the default `type="button"` never does. The form's state
 * stands in for your form library: KvirnUI holds none. The `<output>` is in the DOM before its
 * message, so the message is announced.
 */
export function ApplicationForm() {
  const [name, setName] = useState('')
  const [submittedName, setSubmittedName] = useState<string>()
  return (
    <>
      <form
        aria-label="Application"
        onSubmit={(event) => {
          event.preventDefault()
          setSubmittedName(name)
        }}
      >
        <p>
          <label>
            Name{' '}
            <input
              name="name"
              autoComplete="name"
              value={name}
              onChange={(event) => setName(event.currentTarget.value)}
            />
          </label>
        </p>
        <ButtonGroup>
          <Button type="submit" className="kv-button--primary">
            Send application
          </Button>
          <Button
            onClick={() => {
              setName('')
              setSubmittedName(undefined)
            }}
          >
            Start over
          </Button>
        </ButtonGroup>
      </form>
      <output>
        {submittedName === undefined
          ? ''
          : `Application sent for ${submittedName || 'unknown name'}`}
      </output>
    </>
  )
}

/**
 * `type="reset"` puts the form's fields back to their starting values. A disabled button never
 * calls its `onClick` and never submits, even when `focusableWhenDisabled` keeps it in the Tab
 * order, so the reason beside it stays reachable. The `<output>` is in the DOM before its message.
 */
export function ChangeAddressForm() {
  const [sentCount, setSentCount] = useState(0)
  return (
    <>
      <form aria-label="Change address" onSubmit={(event) => event.preventDefault()}>
        <p>
          <label>
            Street address{' '}
            <input
              name="street-address"
              autoComplete="street-address"
              defaultValue="1 High Street"
            />
          </label>
        </p>
        <p id="address-reason">The address can’t be changed until you have filled in a date.</p>
        <ButtonGroup>
          <Button
            type="submit"
            className="kv-button--primary"
            disabled
            focusableWhenDisabled
            aria-describedby="address-reason"
            onClick={() => setSentCount((count) => count + 1)}
          >
            Save address
          </Button>
          <Button type="reset">Reset</Button>
        </ButtonGroup>
      </form>
      <output>{sentCount === 0 ? '' : `The address was saved ${sentCount} times`}</output>
    </>
  )
}
