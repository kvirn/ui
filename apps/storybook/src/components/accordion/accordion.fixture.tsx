// kv-lang-ok-file: FinnishAccordion is the long Finnish compound hard case
import { Accordion } from '@kvirn-ui/react'

// Fixtures for Components/Accordion. Each exported function is one example, written to be read: the
// stories show its source as "Show code" (`showSource`). The texts are plain strings here, where
// an app would take them from its translations.

/** The main example as a fixture: three questions under an `h2`, so the headings are level 3. */
export function Questions() {
  return (
    <Accordion.Root>
      <Accordion.Item>
        <Accordion.Heading level={3}>
          <Accordion.Trigger>How do I apply for a building permit?</Accordion.Trigger>
        </Accordion.Heading>
        <Accordion.Panel>
          <p>
            Apply on <a href="/my-pages">My pages</a>. Have your drawings and a site plan ready.
          </p>
        </Accordion.Panel>
      </Accordion.Item>
      <Accordion.Item>
        <Accordion.Heading level={3}>
          <Accordion.Trigger>What does it cost?</Accordion.Trigger>
        </Accordion.Heading>
        <Accordion.Panel>
          <p>
            The fee depends on the size of the building. We calculate it when your application
            arrives.
          </p>
        </Accordion.Panel>
      </Accordion.Item>
      <Accordion.Item>
        <Accordion.Heading level={3}>
          <Accordion.Trigger>How long does processing take?</Accordion.Trigger>
        </Accordion.Heading>
        <Accordion.Panel>
          <p>You get a decision within ten weeks of your application being complete.</p>
        </Accordion.Panel>
      </Accordion.Item>
    </Accordion.Root>
  )
}

/** The fixture the keyboard tests drive: a button before, three triggers (one open, with a link) and a button after. */
export function KeyboardAccordion() {
  return (
    <>
      <button type="button" className="kv-button">
        Before
      </button>
      <Accordion.Root>
        <Accordion.Item defaultOpen>
          <Accordion.Heading level={3}>
            <Accordion.Trigger>How do I apply?</Accordion.Trigger>
          </Accordion.Heading>
          <Accordion.Panel>
            <p>
              <a href="/my-pages">Sign in to My pages</a> and choose Apply.
            </p>
          </Accordion.Panel>
        </Accordion.Item>
        <Accordion.Item>
          <Accordion.Heading level={3}>
            <Accordion.Trigger>What does it cost?</Accordion.Trigger>
          </Accordion.Heading>
          <Accordion.Panel>
            <p>It is free.</p>
          </Accordion.Panel>
        </Accordion.Item>
        <Accordion.Item>
          <Accordion.Heading level={3}>
            <Accordion.Trigger>How long does it take?</Accordion.Trigger>
          </Accordion.Heading>
          <Accordion.Panel>
            <p>Two weeks.</p>
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion.Root>
      <button type="button" className="kv-button">
        After
      </button>
    </>
  )
}

/** Independent items: two start open, and opening a third closes neither. */
export function SeveralOpen() {
  return (
    <Accordion.Root>
      <Accordion.Item defaultOpen>
        <Accordion.Heading level={3}>
          <Accordion.Trigger>Opening hours</Accordion.Trigger>
        </Accordion.Heading>
        <Accordion.Panel>
          <p>Monday to Friday 10–19.</p>
        </Accordion.Panel>
      </Accordion.Item>
      <Accordion.Item defaultOpen>
        <Accordion.Heading level={3}>
          <Accordion.Trigger>Address</Accordion.Trigger>
        </Accordion.Heading>
        <Accordion.Panel>
          <p>1 High Street, Kvirnby.</p>
        </Accordion.Panel>
      </Accordion.Item>
      <Accordion.Item>
        <Accordion.Heading level={3}>
          <Accordion.Trigger>Phone</Accordion.Trigger>
        </Accordion.Heading>
        <Accordion.Panel>
          <p>08-123 45 67.</p>
        </Accordion.Panel>
      </Accordion.Item>
    </Accordion.Root>
  )
}

/** `region` on a panel makes it a landmark named by its trigger. Use it for a few sections only. */
export function RegionPanels() {
  return (
    <Accordion.Root>
      <Accordion.Item defaultOpen>
        <Accordion.Heading level={3}>
          <Accordion.Trigger>Waste collection</Accordion.Trigger>
        </Accordion.Heading>
        <Accordion.Panel region>
          <p>Household waste is collected every second week.</p>
        </Accordion.Panel>
      </Accordion.Item>
      <Accordion.Item>
        <Accordion.Heading level={3}>
          <Accordion.Trigger>Bulky waste</Accordion.Trigger>
        </Accordion.Heading>
        <Accordion.Panel region>
          <p>Take it to the recycling centre.</p>
        </Accordion.Panel>
      </Accordion.Item>
    </Accordion.Root>
  )
}

/** `hiddenUntilFound` on the root: search the page for "recycling centre" and a closed answer opens. */
export function FindableAccordion() {
  return (
    <Accordion.Root hiddenUntilFound>
      <Accordion.Item>
        <Accordion.Heading level={3}>
          <Accordion.Trigger>Where do I leave bulky waste?</Accordion.Trigger>
        </Accordion.Heading>
        <Accordion.Panel>
          <p>Bulky waste goes to the recycling centre on Industry Road.</p>
        </Accordion.Panel>
      </Accordion.Item>
      <Accordion.Item>
        <Accordion.Heading level={3}>
          <Accordion.Trigger>How do I sort glass?</Accordion.Trigger>
        </Accordion.Heading>
        <Accordion.Panel>
          <p>Glass packaging is sorted into coloured and clear glass.</p>
        </Accordion.Panel>
      </Accordion.Item>
    </Accordion.Root>
  )
}

/** A disabled item, kept in the Tab order with `aria-disabled`, and a list built through `as`. */
export function ListAccordion() {
  return (
    <Accordion.Root as="ul">
      <Accordion.Item as="li">
        <Accordion.Heading level={3}>
          <Accordion.Trigger>Application</Accordion.Trigger>
        </Accordion.Heading>
        <Accordion.Panel>
          <p>You apply on My pages.</p>
        </Accordion.Panel>
      </Accordion.Item>
      <Accordion.Item as="li" disabled focusableWhenDisabled>
        <Accordion.Heading level={3}>
          <Accordion.Trigger>Decision</Accordion.Trigger>
        </Accordion.Heading>
        <Accordion.Panel>
          <p>The decision appears here once it is made.</p>
        </Accordion.Panel>
      </Accordion.Item>
    </Accordion.Root>
  )
}

/** Long Finnish compounds wrap inside the trigger in a narrow column, and the chevron stays at the inline end. */
export function FinnishAccordion() {
  return (
    <Accordion.Root>
      <Accordion.Item defaultOpen>
        <Accordion.Heading level={3}>
          <Accordion.Trigger>Rakennuslupahakemuksen liitteet ja vastuuhenkilöt</Accordion.Trigger>
        </Accordion.Heading>
        <Accordion.Panel>
          <p>Pääpiirustukset, asemapiirros ja rakennesuunnitelmat liitetään hakemukseen.</p>
        </Accordion.Panel>
      </Accordion.Item>
      <Accordion.Item>
        <Accordion.Heading level={3}>
          <Accordion.Trigger>Jätehuoltomääräykset</Accordion.Trigger>
        </Accordion.Heading>
        <Accordion.Panel>
          <p>Määräykset koskevat kaikkia kiinteistöjä.</p>
        </Accordion.Panel>
      </Accordion.Item>
    </Accordion.Root>
  )
}

/** The same questions in English, for right to left. */
export function EnglishAccordion() {
  return (
    <Accordion.Root>
      <Accordion.Item defaultOpen>
        <Accordion.Heading level={3}>
          <Accordion.Trigger>How do I apply?</Accordion.Trigger>
        </Accordion.Heading>
        <Accordion.Panel>
          <p>Apply on My pages. Have your drawings ready.</p>
        </Accordion.Panel>
      </Accordion.Item>
      <Accordion.Item>
        <Accordion.Heading level={3}>
          <Accordion.Trigger>What does it cost?</Accordion.Trigger>
        </Accordion.Heading>
        <Accordion.Panel>
          <p>The fee depends on the size of the building.</p>
        </Accordion.Panel>
      </Accordion.Item>
    </Accordion.Root>
  )
}

/** Inside `kv-compact` the rows are 32px high from 64rem. */
export function CompactAccordion() {
  return (
    <div className="kv-compact">
      <Questions />
    </div>
  )
}
