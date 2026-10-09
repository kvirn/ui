import { Accordion } from '@kvirn-ui/react'

// Fixtures for Components/Accordion. Each exported function is one example, written to be read: the
// stories show its source as "Show code" (`showSource`). The texts are fixture text from the
// resident's language, so they are plain strings here, where an app would take them from its
// translations.

/** The main example as a fixture: three questions under an `h2`, so the headings are level 3. */
export function Questions() {
  return (
    <Accordion.Root>
      <Accordion.Item>
        <Accordion.Heading level={3}>
          <Accordion.Trigger>Hur ansöker jag om bygglov?</Accordion.Trigger>
        </Accordion.Heading>
        <Accordion.Panel>
          <p>
            Du ansöker på <a href="/mina-sidor">Mina sidor</a>. Ha ritningar och en situationsplan
            till hands.
          </p>
        </Accordion.Panel>
      </Accordion.Item>
      <Accordion.Item>
        <Accordion.Heading level={3}>
          <Accordion.Trigger>Vad kostar det?</Accordion.Trigger>
        </Accordion.Heading>
        <Accordion.Panel>
          <p>Avgiften beror på byggnadens storlek. Vi räknar ut den när ansökan har kommit in.</p>
        </Accordion.Panel>
      </Accordion.Item>
      <Accordion.Item>
        <Accordion.Heading level={3}>
          <Accordion.Trigger>Hur länge tar handläggningen?</Accordion.Trigger>
        </Accordion.Heading>
        <Accordion.Panel>
          <p>Du får besked inom tio veckor från att ansökan är komplett.</p>
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
        Före
      </button>
      <Accordion.Root>
        <Accordion.Item defaultOpen>
          <Accordion.Heading level={3}>
            <Accordion.Trigger>Hur ansöker jag?</Accordion.Trigger>
          </Accordion.Heading>
          <Accordion.Panel>
            <p>
              <a href="/mina-sidor">Logga in på Mina sidor</a> och välj Ansök.
            </p>
          </Accordion.Panel>
        </Accordion.Item>
        <Accordion.Item>
          <Accordion.Heading level={3}>
            <Accordion.Trigger>Vad kostar det?</Accordion.Trigger>
          </Accordion.Heading>
          <Accordion.Panel>
            <p>Det är gratis.</p>
          </Accordion.Panel>
        </Accordion.Item>
        <Accordion.Item>
          <Accordion.Heading level={3}>
            <Accordion.Trigger>Hur länge tar det?</Accordion.Trigger>
          </Accordion.Heading>
          <Accordion.Panel>
            <p>Två veckor.</p>
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion.Root>
      <button type="button" className="kv-button">
        Efter
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
          <Accordion.Trigger>Öppettider</Accordion.Trigger>
        </Accordion.Heading>
        <Accordion.Panel>
          <p>Måndag till fredag 10–19.</p>
        </Accordion.Panel>
      </Accordion.Item>
      <Accordion.Item defaultOpen>
        <Accordion.Heading level={3}>
          <Accordion.Trigger>Adress</Accordion.Trigger>
        </Accordion.Heading>
        <Accordion.Panel>
          <p>Storgatan 1, Kvirnby.</p>
        </Accordion.Panel>
      </Accordion.Item>
      <Accordion.Item>
        <Accordion.Heading level={3}>
          <Accordion.Trigger>Telefon</Accordion.Trigger>
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
          <Accordion.Trigger>Sophämtning</Accordion.Trigger>
        </Accordion.Heading>
        <Accordion.Panel region>
          <p>Hushållsavfall hämtas varannan vecka.</p>
        </Accordion.Panel>
      </Accordion.Item>
      <Accordion.Item>
        <Accordion.Heading level={3}>
          <Accordion.Trigger>Grovsopor</Accordion.Trigger>
        </Accordion.Heading>
        <Accordion.Panel region>
          <p>Lämnas på återvinningscentralen.</p>
        </Accordion.Panel>
      </Accordion.Item>
    </Accordion.Root>
  )
}

/** `hiddenUntilFound` on the root: search the page for "återvinningscentralen" and a closed answer opens. */
export function FindableAccordion() {
  return (
    <Accordion.Root hiddenUntilFound>
      <Accordion.Item>
        <Accordion.Heading level={3}>
          <Accordion.Trigger>Var lämnar jag grovsopor?</Accordion.Trigger>
        </Accordion.Heading>
        <Accordion.Panel>
          <p>Grovsopor lämnas på återvinningscentralen vid Industrivägen.</p>
        </Accordion.Panel>
      </Accordion.Item>
      <Accordion.Item>
        <Accordion.Heading level={3}>
          <Accordion.Trigger>Hur sorterar jag glas?</Accordion.Trigger>
        </Accordion.Heading>
        <Accordion.Panel>
          <p>Glasförpackningar sorteras i färgat och ofärgat glas.</p>
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
          <Accordion.Trigger>Ansökan</Accordion.Trigger>
        </Accordion.Heading>
        <Accordion.Panel>
          <p>Du ansöker på Mina sidor.</p>
        </Accordion.Panel>
      </Accordion.Item>
      <Accordion.Item as="li" disabled focusableWhenDisabled>
        <Accordion.Heading level={3}>
          <Accordion.Trigger>Beslut</Accordion.Trigger>
        </Accordion.Heading>
        <Accordion.Panel>
          <p>Beslutet visas när det är fattat.</p>
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
