// kv-lang-ok-file: per-locale story texts: the toolbar locale selects the sv, fi, nb, nn or en table
import { Button, Card, Link, Tabs } from '@kvirn-ui/react'
import type { TabsChangeReason } from '@kvirn-ui/react'
import { useId, useState } from 'react'

// Fixtures for Components/Tabs. Each exported function is one example, written to be read: the
// stories show its source as "Show code" (`showSource`). The names and the panel texts are fixture
// text from the resident's language, so they are plain strings here, where an app would take them
// from its translations.

const filingTexts = {
  sv: {
    before: 'Före',
    after: 'Efter',
    list: 'Ärendet',
    details: 'Uppgifter',
    documents: 'Handlingar',
    history: 'Historik',
    contact: 'Kontakt',
    detailsText: 'Ansökan om bygglov för Strandvägen 4. Ärendet väntar på granskning.',
    decision: 'Läs beslutet',
    documentsText: 'Ritningar, situationsplan och kontrollplan har kommit in.',
    historyText: 'Ansökan kom in den 2 september. Komplettering begärdes den 9 september.',
    contactText: 'Handläggare: Maria Lind, 08-123 45 67.',
  },
  en: {
    before: 'Before',
    after: 'After',
    list: 'Case',
    details: 'Details',
    documents: 'Documents',
    history: 'History',
    contact: 'Contact',
    detailsText: 'Building permit application for 4 Strand Road. The case awaits review.',
    decision: 'Read the decision',
    documentsText: 'Drawings, a site plan and a control plan have arrived.',
    historyText:
      'The application arrived on 2 September. More information was requested on 9 September.',
    contactText: 'Case officer: Maria Lind, 08-123 45 67.',
  },
}

/** The main example as a fixture: three tabs, one panel for each, and the first tab selected. */
export function CaseTabs() {
  return (
    <Tabs.Root defaultValue="details">
      <Tabs.List aria-label="Case">
        <Tabs.Tab value="details">Details</Tabs.Tab>
        <Tabs.Tab value="documents">Documents</Tabs.Tab>
        <Tabs.Tab value="history">History</Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel value="details">
        <p>Building permit application for 4 Strand Road. The case awaits review.</p>
      </Tabs.Panel>
      <Tabs.Panel value="documents">
        <p>Drawings, a site plan and a control plan have arrived.</p>
      </Tabs.Panel>
      <Tabs.Panel value="history">
        <p>
          The application arrived on 2 September. More information was requested on 9 September.
        </p>
      </Tabs.Panel>
    </Tabs.Root>
  )
}

/**
 * The fixture the keyboard tests drive: a button before, four tabs and a button after. History is
 * disabled: it stays focusable, and the arrows reach it but never select it. The panel of
 * Documents starts with a link, so it sets `tabIndex={-1}` and Tab goes straight to the link.
 */
export function FilingTabs({ locale }: { locale: 'sv' | 'en' }) {
  const text = filingTexts[locale]
  return (
    <>
      <Button>{text.before}</Button>
      <Tabs.Root defaultValue="details">
        <Tabs.List aria-label={text.list}>
          <Tabs.Tab value="details">{text.details}</Tabs.Tab>
          <Tabs.Tab value="documents">{text.documents}</Tabs.Tab>
          <Tabs.Tab value="history" disabled>
            {text.history}
          </Tabs.Tab>
          <Tabs.Tab value="contact">{text.contact}</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="details">
          <p>{text.detailsText}</p>
        </Tabs.Panel>
        <Tabs.Panel value="documents" tabIndex={-1}>
          <p>
            <Link.Root href="#decision">{text.decision}</Link.Root>
          </p>
          <p>{text.documentsText}</p>
        </Tabs.Panel>
        <Tabs.Panel value="history">
          <p>{text.historyText}</p>
        </Tabs.Panel>
        <Tabs.Panel value="contact">
          <p>{text.contactText}</p>
        </Tabs.Panel>
      </Tabs.Root>
      <Button>{text.after}</Button>
    </>
  )
}

/**
 * Manual activation: the arrows only move focus, and Enter or Space selects. Use it when showing
 * a panel is slow, so arrowing through the tabs doesn't load each one.
 */
export function ReviewTabs() {
  return (
    <Tabs.Root defaultValue="documents" activationMode="manual">
      <Tabs.List aria-label="Review">
        <Tabs.Tab value="oversikt">Overview</Tabs.Tab>
        <Tabs.Tab value="documents">Documents</Tabs.Tab>
        <Tabs.Tab value="beslut">Decision</Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel value="oversikt">
        <p>The property, the applicant and what the application is about.</p>
      </Tabs.Panel>
      <Tabs.Panel value="documents">
        <p>All the documents that have arrived, with dates.</p>
      </Tabs.Panel>
      <Tabs.Panel value="beslut">
        <p>The board’s decision and how you appeal it.</p>
      </Tabs.Panel>
    </Tabs.Root>
  )
}

/**
 * `orientation="vertical"`: the arrows are Down and Up, and the list says
 * `aria-orientation="vertical"`. The theme lays the list beside the panel, and stacks them below
 * 40rem.
 */
export function SettingsTabs() {
  return (
    <Tabs.Root defaultValue="konto" orientation="vertical">
      <Tabs.List aria-label="Settings">
        <Tabs.Tab value="konto">Account</Tabs.Tab>
        <Tabs.Tab value="behorigheter">Permissions</Tabs.Tab>
        <Tabs.Tab value="aviseringar">Notifications</Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel value="konto">
        <p>Name, email address and password.</p>
      </Tabs.Panel>
      <Tabs.Panel value="behorigheter">
        <p>Who can see and change your cases.</p>
      </Tabs.Panel>
      <Tabs.Panel value="aviseringar">
        <p>When and how we notify you about a case.</p>
      </Tabs.Panel>
    </Tabs.Root>
  )
}

/**
 * A disabled tab stays focusable, so users can find it, and says it is unavailable. Say why where
 * everyone can read it, and point the tab at the reason with `aria-describedby`.
 */
export function ApplicationTabs() {
  const reasonId = useId()
  return (
    <>
      <Tabs.Root defaultValue="details">
        <Tabs.List aria-label="Application">
          <Tabs.Tab value="details">Details</Tabs.Tab>
          <Tabs.Tab value="bilagor">Attachments</Tabs.Tab>
          <Tabs.Tab value="beslut" disabled aria-describedby={reasonId}>
            Decision
          </Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="details">
          <p>The applicant, the property and what you want to build.</p>
        </Tabs.Panel>
        <Tabs.Panel value="bilagor">
          <p>Drawings and other attachments to the application.</p>
        </Tabs.Panel>
        <Tabs.Panel value="beslut">
          <p>The board’s decision.</p>
        </Tabs.Panel>
      </Tabs.Root>
      <p id={reasonId}>The Decision tab opens when the board has made its decision.</p>
    </>
  )
}

/**
 * Controlled: `value` decides, and `onValueChange` reports the new value with why it changed
 * (`reason`) and the event. It reports and never changes the value itself.
 */
export function ControlledTabs() {
  const [value, setValue] = useState('details')
  const [reason, setReason] = useState<TabsChangeReason | null>(null)
  return (
    <>
      <Tabs.Root
        value={value}
        onValueChange={(next, details) => {
          setValue(next)
          setReason(details.reason)
        }}
      >
        <Tabs.List aria-label="Case">
          <Tabs.Tab value="details">Details</Tabs.Tab>
          <Tabs.Tab value="documents">Documents</Tabs.Tab>
          <Tabs.Tab value="history">History</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="details">
          <p>Building permit application for 4 Strand Road.</p>
        </Tabs.Panel>
        <Tabs.Panel value="documents">
          <p>Drawings, a site plan and a control plan.</p>
        </Tabs.Panel>
        <Tabs.Panel value="history">
          <p>The application arrived on 2 September.</p>
        </Tabs.Panel>
      </Tabs.Root>
      <p>
        Selected tab: {value}. Last reason: {reason ?? 'none yet'}.
      </p>
    </>
  )
}

/**
 * Long Finnish labels. The list wraps in a narrow column, row by row, and a long word wraps inside
 * its tab: nothing shrinks to nothing, truncates or scrolls sideways.
 */
export function FinnishTabs() {
  return (
    <Tabs.Root defaultValue="perustiedot">
      <Tabs.List aria-label="Rakennuslupa">
        <Tabs.Tab value="perustiedot">Hakemuksen perustiedot</Tabs.Tab>
        <Tabs.Tab value="liitteet">Rakennus- ja toimenpidelupahakemuksen liitteet</Tabs.Tab>
        <Tabs.Tab value="kuuleminen">Naapureiden kuuleminen</Tabs.Tab>
        <Tabs.Tab value="paatos">Päätös ja valitusosoitus</Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel value="perustiedot">
        <p>Hakija, kiinteistö ja se, mitä hakemus koskee.</p>
      </Tabs.Panel>
      <Tabs.Panel value="liitteet">
        <p>Piirustukset, asemapiirros ja valvontasuunnitelma.</p>
      </Tabs.Panel>
      <Tabs.Panel value="kuuleminen">
        <p>Naapureille on lähetetty tieto hakemuksesta.</p>
      </Tabs.Panel>
      <Tabs.Panel value="paatos">
        <p>Lautakunnan päätös ja ohjeet valituksen tekemiseen.</p>
      </Tabs.Panel>
    </Tabs.Root>
  )
}

/** Inside `kv-compact` the tabs are 32px high from 64rem, and every tab is still at least 24 × 24 (2.5.8). */
export function CompactCaseTabs() {
  return (
    <div className="kv-compact">
      <Tabs.Root defaultValue="details">
        <Tabs.List aria-label="Case">
          <Tabs.Tab value="details">Details</Tabs.Tab>
          <Tabs.Tab value="documents">Documents</Tabs.Tab>
          <Tabs.Tab value="history">History</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="details">
          <p>Building permit application for 4 Strand Road. The case awaits review.</p>
        </Tabs.Panel>
        <Tabs.Panel value="documents">
          <p>Drawings, a site plan and a control plan have arrived.</p>
        </Tabs.Panel>
        <Tabs.Panel value="history">
          <p>
            The application arrived on 2 September. More information was requested on 9 September.
          </p>
        </Tabs.Panel>
      </Tabs.Root>
    </div>
  )
}

/** Tabs in the body of a card: the hairline and the panel sit on the card's surface. */
export function CardTabs() {
  return (
    <Card.Root>
      <Card.Body>
        <Tabs.Root defaultValue="details">
          <Tabs.List aria-label="Case">
            <Tabs.Tab value="details">Details</Tabs.Tab>
            <Tabs.Tab value="documents">Documents</Tabs.Tab>
            <Tabs.Tab value="history">History</Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel value="details">
            <p>Building permit application for 4 Strand Road. The case awaits review.</p>
          </Tabs.Panel>
          <Tabs.Panel value="documents">
            <p>Drawings, a site plan and a control plan have arrived.</p>
          </Tabs.Panel>
          <Tabs.Panel value="history">
            <p>
              The application arrived on 2 September. More information was requested on 9 September.
            </p>
          </Tabs.Panel>
        </Tabs.Root>
      </Card.Body>
    </Card.Root>
  )
}
