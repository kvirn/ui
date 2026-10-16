import { Button, Popover } from '@kvirn-ui/react'
import { useState } from 'react'

// Fixtures for Components/Popover: each function is one example, and the story's "Show code"
// prints it (`showSource`), so it reads the way an adopter writes it.

/**
 * Controlled by your state: the popup shows the `open` it is given and reports every request
 * through `onOpenChange(open, { reason })`. Escape, a press outside and Close all ask to close;
 * you decide. The printed `reason` is the last one: `trigger-press`, `close-press`, `escape` or
 * `outside-press`.
 */
export function ControlledPopover() {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState('–')
  return (
    <>
      {/* Above the popover, so the popup (placed under the trigger) never covers them. */}
      <output data-testid="state">{open ? 'open' : 'closed'}</output>
      <output data-testid="reason">{reason}</output>
      <Button onClick={() => setOpen((current) => !current)}>Show from the page</Button>
      <Popover.Root
        open={open}
        onOpenChange={(nextOpen, details) => {
          setOpen(nextOpen)
          setReason(details.reason)
        }}
      >
        <Popover.Trigger className="kv-button">About the service</Popover.Trigger>
        <Popover.Popup aria-label="About the service">
          <p>The service is run by the municipality and is open around the clock.</p>
          <p>
            <Popover.Close className="kv-button">Close</Popover.Close>
          </p>
        </Popover.Popup>
      </Popover.Root>
    </>
  )
}
