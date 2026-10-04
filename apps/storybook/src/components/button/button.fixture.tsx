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
