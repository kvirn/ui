import { Button, Popover } from '@kvirn-ui/react'
import { useState } from 'react'

// Fixtures for Components/Popover: each function is one example, and the story's "Show code"
// prints it (`showSource`), so it reads the way an adopter writes it.

/**
 * Controlled by your state: the popup shows the `open` it is given and reports every request
 * through `onOpenChange`. Escape, a press outside and Close all ask to close; you decide.
 */
export function ControlledPopover() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button onClick={() => setOpen((current) => !current)}>Visa från sidan</Button>
      <Popover.Root open={open} onOpenChange={setOpen}>
        <Popover.Trigger className="kv-button">Om tjänsten</Popover.Trigger>
        <Popover.Popup aria-label="Om tjänsten">
          <p>Tjänsten drivs av kommunen och är öppen dygnet runt.</p>
          <p>
            <Popover.Close className="kv-button">Stäng</Popover.Close>
          </p>
        </Popover.Popup>
      </Popover.Root>
      <output data-testid="state">{open ? 'öppen' : 'stängd'}</output>
    </>
  )
}
