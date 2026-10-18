import {
  AccordionHeading,
  AccordionItem,
  AccordionPanel,
  AccordionRoot,
  AccordionTrigger,
  CardRoot,
  DisplaySettingsPanel,
  Heading,
  Kbd,
  Link,
  TableBody,
  TableCaption,
  TableCell,
  TableColumnHeader,
  TableHead,
  TableRoot,
  TableRow,
  TableRowHeader,
  TableScrollRegion,
} from '@kvirn-ui/react'
import { Fragment } from 'react'
import { messages } from '../messages/en.ts'
import { PageWithContents } from './page-contents.tsx'
import { ShortcutsSettingCard } from './shortcuts-setting-card.tsx'

const text = messages.docs.accessibility

const githubIssues = 'https://github.com/kvirn/ui/issues'
const abilityNet = 'https://mcmw.abilitynet.org.uk/'

/** `**name**` is a menu or button name, shown in bold. */
function Emphasis({ children }: { children: string }) {
  return children
    .split('**')
    .map((part, index) =>
      index % 2 === 1 ? (
        <strong key={index}>{part}</strong>
      ) : (
        <Fragment key={index}>{part}</Fragment>
      ),
    )
}

const keyName = (key: string) => (key in text.keys ? text.keys[key as keyof typeof text.keys] : key)

function KeyCombination({ keys }: { keys: readonly string[] }) {
  const [only] = keys
  if (keys.length === 1 && only !== undefined) {
    return <Kbd>{keyName(only)}</Kbd>
  }
  return (
    <Kbd>
      {keys.map((key, index) => (
        <Fragment key={key}>
          {index === 0 ? null : ` ${text.keys.and} `}
          <Kbd>{keyName(key)}</Kbd>
        </Fragment>
      ))}
    </Kbd>
  )
}

function Keys({ alternatives }: { alternatives: readonly (readonly string[])[] }) {
  return alternatives.map((keys, index) => (
    <Fragment key={keys.join('+')}>
      {index === 0 ? null : ` ${text.keys.or} `}
      <KeyCombination keys={keys} />
    </Fragment>
  ))
}

const display = (
  <CardRoot>
    <p>{text.display.intro}</p>
    {/* Without JavaScript the choices can't work, so the note stands in for them (accessibility-settings.css). */}
    <noscript>
      <p className="kv-alert kv-alert--info">
        {text.display.noScript} <Link href="#zoom">{text.display.noScriptLink}</Link>.
      </p>
    </noscript>
    <DisplaySettingsPanel className="docs-display-panel">
      <p>
        <Emphasis>{text.display.system}</Emphasis> {text.display.systemWhere}{' '}
        <Link href="#device">{text.device.heading}</Link>.
      </p>
      <p>
        <Emphasis>{text.display.contrast}</Emphasis>
      </p>
      <p>
        <Emphasis>{text.display.motion}</Emphasis>
      </p>
      <p>{text.display.contrastThemes}</p>
      <p>{messages.docs.display.storageNote}</p>
    </DisplaySettingsPanel>
  </CardRoot>
)

const keyboard = (
  <>
    <p>{text.keyboard.intro}</p>
    <ShortcutsSettingCard
      open={
        <Keys
          alternatives={[
            ['alt', 'shift', 'K'],
            ['option', 'shift', 'K'],
          ]}
        />
      }
      search={
        <Keys
          alternatives={[
            ['ctrl', 'K'],
            ['command', 'K'],
          ]}
        />
      }
    />
    <TableScrollRegion aria-labelledby="keyboard-table-caption">
      <TableRoot className="kv-table--card kv-table--striped">
        <TableCaption id="keyboard-table-caption">{text.keyboard.tableLabel}</TableCaption>
        <TableHead>
          <TableRow>
            <TableColumnHeader>{text.keyboard.keyColumn}</TableColumnHeader>
            <TableColumnHeader>{text.keyboard.actionColumn}</TableColumnHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {text.keyboard.rows.map((row) => (
            <TableRow key={row.action}>
              <TableRowHeader>
                <Keys alternatives={row.keys} />
              </TableRowHeader>
              <TableCell>{row.action}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </TableRoot>
    </TableScrollRegion>
    <p>{text.keyboard.noShortcuts}</p>
    <p>
      {text.keyboard.componentsBefore}{' '}
      <Link href="/components">{text.keyboard.componentsLink}</Link>.
    </p>
  </>
)

const skipList = (
  <>
    <p>{text.skip.body}</p>
    <p>
      {text.skip.cardBefore} <Link href="#shortcuts">{text.skip.cardLink}</Link>.
    </p>
  </>
)

const zoom = (
  <>
    <p>{text.zoom.intro}</p>
    <Heading as="h3" id="zoom-page">
      {text.zoom.page}
    </Heading>
    <TableScrollRegion aria-labelledby="zoom-table-caption">
      <TableRoot className="kv-table--card kv-table--striped">
        <TableCaption id="zoom-table-caption">{text.zoom.tableLabel}</TableCaption>
        <TableHead>
          <TableRow>
            <TableColumnHeader>{text.zoom.actionColumn}</TableColumnHeader>
            <TableColumnHeader>{text.zoom.windowsColumn}</TableColumnHeader>
            <TableColumnHeader>{text.zoom.macColumn}</TableColumnHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {text.zoom.rows.map((row) => (
            <TableRow key={row.action}>
              <TableRowHeader>{row.action}</TableRowHeader>
              <TableCell>
                <KeyCombination keys={row.windows} />
              </TableCell>
              <TableCell>
                <KeyCombination keys={row.mac} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </TableRoot>
    </TableScrollRegion>
    <p>{text.zoom.usKeyboard}</p>
    <p>{text.zoom.wheel}</p>
    <Heading as="h3" id="zoom-text-only">
      {text.zoom.textOnly}
    </Heading>
    <p>
      <Emphasis>{text.zoom.firefox}</Emphasis>
    </p>
    <p>{text.zoom.safari}</p>
    <p>
      <Emphasis>{text.zoom.defaultSize}</Emphasis>
    </p>
    <Heading as="h3" id="zoom-touch">
      {text.zoom.touch}
    </Heading>
    <p>
      <Emphasis>{text.zoom.ios}</Emphasis>
    </p>
    <p>
      <Emphasis>{text.zoom.android}</Emphasis>
    </p>
  </>
)

const device = (
  <>
    <p>{text.device.intro}</p>
    {/* Before JavaScript the panels stay closed and can't be opened, so the stylesheet shows them. */}
    <AccordionRoot className="docs-device-accordion">
      {text.device.systems.map((system) => (
        <AccordionItem key={system.name}>
          <AccordionHeading level={3}>
            <AccordionTrigger>{system.name}</AccordionTrigger>
          </AccordionHeading>
          <AccordionPanel>
            <ul>
              {(['dark', 'contrast', 'motion', 'text'] as const).map((setting) => (
                <li key={setting}>
                  {text.device.labels[setting]}: <Emphasis>{system[setting]}</Emphasis>
                </li>
              ))}
            </ul>
            {'note' in system ? <p>{system.note}</p> : null}
          </AccordionPanel>
        </AccordionItem>
      ))}
    </AccordionRoot>
    <p>
      {text.device.moreBefore} <Link href={abilityNet}>{text.device.moreLink}</Link>.
    </p>
  </>
)

const report = (
  <>
    <p>
      {text.report.body} <Link href="/docs#status">{text.report.statusLink}</Link>.
    </p>
    <p>
      <Link href={githubIssues}>{text.report.action}</Link>. {text.report.privacy}
    </p>
    <p>
      {text.report.emailBefore}{' '}
      <Link href={`mailto:${text.report.email}`}>{text.report.email}</Link>.
    </p>
  </>
)

export function AccessibilitySettingsPage() {
  return (
    <PageWithContents
      title={messages.docs.header.accessibilitySettings}
      lead={text.lead}
      sections={[
        { id: 'display', label: text.display.heading, content: display },
        { id: 'keyboard', label: text.keyboard.heading, content: keyboard },
        { id: 'skip-list', label: text.skip.heading, content: skipList },
        { id: 'zoom', label: text.zoom.heading, content: zoom },
        { id: 'device', label: text.device.heading, content: device },
        { id: 'report', label: text.report.heading, content: report },
      ]}
    />
  )
}
