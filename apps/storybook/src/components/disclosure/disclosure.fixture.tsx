import { Disclosure } from '@kvirn-ui/react'
import type { DisclosureChangeReason } from '@kvirn-ui/react'
import { useState } from 'react'

// Fixtures for Components/Disclosure. Each exported function is one example, written to be read:
// the stories show its source as "Show code" (`showSource`). The texts are fixture text from the
// resident's language, so they are plain strings here, where an app would take them from its
// translations.

/** The fixture the keyboard tests drive: a button before, the disclosure with a link in its panel, and a button after. */
export function KeyboardDisclosure() {
  return (
    <>
      <button type="button" className="kv-button">
        Före
      </button>
      <Disclosure.Root>
        <Disclosure.Trigger>Kontakta oss</Disclosure.Trigger>
        <Disclosure.Panel>
          <p>
            Ring <a href="tel:0812345678">08-123 45 67</a> eller skriv till kommunen.
          </p>
        </Disclosure.Panel>
      </Disclosure.Root>
      <button type="button" className="kv-button">
        Efter
      </button>
    </>
  )
}

/** `defaultOpen`: the panel is shown from the start, and the chevron already points up. */
export function OpenFromTheStart() {
  return (
    <Disclosure.Root defaultOpen>
      <Disclosure.Trigger>Öppettider</Disclosure.Trigger>
      <Disclosure.Panel>
        <p>Måndag till fredag 10–19. Lördag 10–15. Stängt på söndagar.</p>
      </Disclosure.Panel>
    </Disclosure.Root>
  )
}

/** `disabled` leaves the Tab order. `focusableWhenDisabled` keeps a Tab stop, with `aria-disabled`. */
export function DisabledDisclosures() {
  return (
    <>
      <Disclosure.Root disabled>
        <Disclosure.Trigger>Beslut</Disclosure.Trigger>
        <Disclosure.Panel>
          <p>Beslutet visas när nämnden har beslutat.</p>
        </Disclosure.Panel>
      </Disclosure.Root>
      <Disclosure.Root disabled focusableWhenDisabled>
        <Disclosure.Trigger aria-describedby="decision-reason">Överklagande</Disclosure.Trigger>
        <Disclosure.Panel>
          <p>Du kan överklaga inom tre veckor.</p>
        </Disclosure.Panel>
      </Disclosure.Root>
      <p id="decision-reason">Överklagande går att öppna när beslutet är fattat.</p>
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
        <Disclosure.Trigger>Villkor</Disclosure.Trigger>
        <Disclosure.Panel>
          <p>Avgiften är 250 kronor och betalas vid ansökan.</p>
        </Disclosure.Panel>
      </Disclosure.Root>
      <p>
        Öppen: {isOpen ? 'ja' : 'nej'}. Senaste orsak: {reason ?? 'ingen'}.
      </p>
    </>
  )
}

/**
 * `hiddenUntilFound`: the closed panel is `hidden="until-found"`. Search the page for "tredje
 * våningen" (Ctrl+F, or Cmd+F): in a browser that supports it, the panel opens on the match.
 */
export function FindableDisclosure() {
  return (
    <Disclosure.Root hiddenUntilFound>
      <Disclosure.Trigger>Hitta hit</Disclosure.Trigger>
      <Disclosure.Panel>
        <p>Receptionen finns på tredje våningen, till höger om hissen.</p>
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
