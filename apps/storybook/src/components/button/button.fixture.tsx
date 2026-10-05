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
        aria-label="Ansökan"
        onSubmit={(event) => {
          event.preventDefault()
          setSubmittedName(name)
        }}
      >
        <p>
          <label>
            Namn{' '}
            <input
              name="namn"
              autoComplete="name"
              value={name}
              onChange={(event) => setName(event.currentTarget.value)}
            />
          </label>
        </p>
        <ButtonGroup>
          <Button type="submit" className="kv-button--primary">
            Skicka ansökan
          </Button>
          <Button
            onClick={() => {
              setName('')
              setSubmittedName(undefined)
            }}
          >
            Börja om
          </Button>
        </ButtonGroup>
      </form>
      <output>
        {submittedName === undefined ? '' : `Ansökan skickad för ${submittedName || 'okänt namn'}`}
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
      <form aria-label="Ändra adress" onSubmit={(event) => event.preventDefault()}>
        <p>
          <label>
            Gatuadress{' '}
            <input name="gatuadress" autoComplete="street-address" defaultValue="Storgatan 1" />
          </label>
        </p>
        <p id="address-reason">Adressen kan inte ändras förrän du har fyllt i ett datum.</p>
        <ButtonGroup>
          <Button
            type="submit"
            className="kv-button--primary"
            disabled
            focusableWhenDisabled
            aria-describedby="address-reason"
            onClick={() => setSentCount((count) => count + 1)}
          >
            Spara adress
          </Button>
          <Button type="reset">Återställ</Button>
        </ButtonGroup>
      </form>
      <output>{sentCount === 0 ? '' : `Adressen sparades ${sentCount} gånger`}</output>
    </>
  )
}
