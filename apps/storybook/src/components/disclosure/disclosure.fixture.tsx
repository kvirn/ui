// kv-lang-ok-file: FinnishDisclosure is the long Finnish compound hard case
import { Disclosure } from '@kvirn-ui/react'
import type { DisclosureChangeReason } from '@kvirn-ui/react'
import { useState } from 'react'

// Fixtures for Components/Disclosure. Each exported function is one example, written to be read:
// the stories show its source as "Show code" (`showSource`). The texts are plain strings here, where
// an app would take them from its translations.

/** The fixture the keyboard tests drive: a button before, the disclosure with a link in its panel, and a button after. */
export function KeyboardDisclosure() {
  return (
    <>
      <button type="button" className="kv-button">
        Before
      </button>
      <Disclosure.Root>
        <Disclosure.Trigger>Contact us</Disclosure.Trigger>
        <Disclosure.Panel>
          <p>
            Call <a href="tel:0812345678">08-123 45 67</a> or write to the municipality.
          </p>
        </Disclosure.Panel>
      </Disclosure.Root>
      <button type="button" className="kv-button">
        After
      </button>
    </>
  )
}

/** `defaultOpen`: the panel is shown from the start, and the chevron already points up. */
export function OpenFromTheStart() {
  return (
    <Disclosure.Root defaultOpen>
      <Disclosure.Trigger>Opening hours</Disclosure.Trigger>
      <Disclosure.Panel>
        <p>Monday to Friday 10–19. Saturday 10–15. Closed on Sundays.</p>
      </Disclosure.Panel>
    </Disclosure.Root>
  )
}

/** `disabled` leaves the Tab order. `focusableWhenDisabled` keeps a Tab stop, with `aria-disabled`. */
export function DisabledDisclosures() {
  return (
    <>
      <Disclosure.Root disabled>
        <Disclosure.Trigger>Decision</Disclosure.Trigger>
        <Disclosure.Panel>
          <p>The decision appears here once the board has decided.</p>
        </Disclosure.Panel>
      </Disclosure.Root>
      <Disclosure.Root disabled focusableWhenDisabled>
        <Disclosure.Trigger aria-describedby="decision-reason">Appeal</Disclosure.Trigger>
        <Disclosure.Panel>
          <p>You can appeal within three weeks.</p>
        </Disclosure.Panel>
      </Disclosure.Root>
      <p id="decision-reason">The appeal can be opened once the decision is made.</p>
    </>
  )
}

/** Controlled: `open` decides, and `onOpenChange` reports the reason. The last one is shown below. */
export function ControlledDisclosure() {
  const [isOpen, setIsOpen] = useState(false)
  const [reason, setReason] = useState<DisclosureChangeReason | null>(null)
  return (
    <>
      <Disclosure.Root
        open={isOpen}
        onOpenChange={(nextOpen, details) => {
          setIsOpen(nextOpen)
          setReason(details.reason)
        }}
      >
        <Disclosure.Trigger>Terms</Disclosure.Trigger>
        <Disclosure.Panel>
          <p>The fee is 250 kronor and is paid when you apply.</p>
        </Disclosure.Panel>
      </Disclosure.Root>
      <p>
        Open: {isOpen ? 'yes' : 'no'}. Last reason: {reason ?? 'none'}.
      </p>
    </>
  )
}

/**
 * `hiddenUntilFound`: the closed panel is `hidden="until-found"`. Search the page for "third
 * floor" (Ctrl+F, or Cmd+F): in a browser that supports it, the panel opens on the match.
 */
export function FindableDisclosure() {
  return (
    <Disclosure.Root hiddenUntilFound>
      <Disclosure.Trigger>Find this</Disclosure.Trigger>
      <Disclosure.Panel>
        <p>The reception is on the third floor, to the right of the lift.</p>
      </Disclosure.Panel>
    </Disclosure.Root>
  )
}

/** Long Finnish compounds wrap inside the trigger in a narrow column, and the chevron stays at the inline end. */
export function FinnishDisclosure() {
  return (
    <Disclosure.Root defaultOpen>
      <Disclosure.Trigger>Rakennuslupahakemuksen liitteet ja vastuuhenkilöt</Disclosure.Trigger>
      <Disclosure.Panel>
        <p>Pääpiirustukset, asemapiirros ja rakennesuunnitelmat liitetään hakemukseen.</p>
      </Disclosure.Panel>
    </Disclosure.Root>
  )
}

/** The same disclosure in English, for right to left. */
export function EnglishDisclosure() {
  return (
    <Disclosure.Root>
      <Disclosure.Trigger>Opening hours</Disclosure.Trigger>
      <Disclosure.Panel>
        <p>Monday to Friday 10 to 7. Saturday 10 to 3. Closed on Sundays.</p>
      </Disclosure.Panel>
    </Disclosure.Root>
  )
}
