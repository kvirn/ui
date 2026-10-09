import { Button, Menu, Toolbar, Tooltip, useMenu } from '@kvirn-ui/react'
import type { ComponentProps } from 'react'
import { useState } from 'react'
import type { FormLocale } from '../form/form.fixture.tsx'

// Fixtures for Components/Menu: each function is one example, and the story's "Show code" prints
// it (`showSource`), so it reads the way an adopter writes it. Menu has no strings of its own: the
// trigger, the items and the group labels are the app's, so they are plain text here, where an app
// would take them from its translations. Northern Sámi has no fixture text: it shows English,
// marked `lang="en"` (3.1.2).

type MenuRootProps = Omit<ComponentProps<typeof Menu.Root>, 'children'>

interface MenuTexts {
  trigger: string
  assign: string
  transfer: string
  print: string
  delete: string
  unavailable: string
  viewTrigger: string
  sortLabel: string
  sortNewest: string
  sortOldest: string
  showClosed: string
  stateOpen: string
  stateClosed: string
  lastAction: string
  none: string
  before: string
  after: string
  outside: string
  toolbar: string
}

const texts: Record<Exclude<FormLocale, 'se'>, MenuTexts> = {
  sv: {
    trigger: 'Åtgärder',
    assign: 'Tilldela handläggare',
    transfer: 'Flytta ärendet till en annan enhet',
    print: 'Skriv ut beslutet',
    delete: 'Ta bort utkastet',
    unavailable: 'Bara handläggaren kan göra detta',
    viewTrigger: 'Visningsval',
    sortLabel: 'Sortera efter',
    sortNewest: 'Senaste först',
    sortOldest: 'Äldsta först',
    showClosed: 'Visa avslutade ärenden',
    stateOpen: 'öppen',
    stateClosed: 'stängd',
    lastAction: 'Senaste åtgärd',
    none: 'ingen',
    before: 'Före',
    after: 'Efter',
    outside: 'Text utanför',
    toolbar: 'Ärendets verktyg',
  },
  en: {
    trigger: 'Actions',
    assign: 'Assign a case officer',
    transfer: 'Move the case to another unit',
    print: 'Print the decision',
    delete: 'Delete the draft',
    unavailable: 'Only the case officer can do this',
    viewTrigger: 'View options',
    sortLabel: 'Sort by',
    sortNewest: 'Newest first',
    sortOldest: 'Oldest first',
    showClosed: 'Show closed cases',
    stateOpen: 'open',
    stateClosed: 'closed',
    lastAction: 'Last action',
    none: 'none',
    before: 'Before',
    after: 'After',
    outside: 'Text outside',
    toolbar: 'Case tools',
  },
  fi: {
    trigger: 'Toiminnot',
    assign: 'Määritä käsittelijä',
    transfer: 'Siirrä asia toiselle yksikölle',
    print: 'Tulosta päätös',
    delete: 'Poista luonnos',
    unavailable: 'Vain käsittelijä voi tehdä tämän',
    viewTrigger: 'Näkymän asetukset',
    sortLabel: 'Lajitteluperuste',
    sortNewest: 'Uusin ensin',
    sortOldest: 'Vanhin ensin',
    showClosed: 'Näytä päättyneet asiat',
    stateOpen: 'auki',
    stateClosed: 'kiinni',
    lastAction: 'Viimeisin toiminto',
    none: 'ei mitään',
    before: 'Ennen',
    after: 'Jälkeen',
    outside: 'Teksti valikon ulkopuolella',
    toolbar: 'Asian työkalut',
  },
  nb: {
    trigger: 'Handlinger',
    assign: 'Tildel saksbehandler',
    transfer: 'Flytt saken til en annen enhet',
    print: 'Skriv ut vedtaket',
    delete: 'Slett utkastet',
    unavailable: 'Bare saksbehandleren kan gjøre dette',
    viewTrigger: 'Visningsvalg',
    sortLabel: 'Sorter etter',
    sortNewest: 'Nyeste først',
    sortOldest: 'Eldste først',
    showClosed: 'Vis avsluttede saker',
    stateOpen: 'åpen',
    stateClosed: 'lukket',
    lastAction: 'Siste handling',
    none: 'ingen',
    before: 'Før',
    after: 'Etter',
    outside: 'Tekst utenfor',
    toolbar: 'Verktøy for saken',
  },
  nn: {
    trigger: 'Handlingar',
    assign: 'Tildel saksbehandlar',
    transfer: 'Flytt saka til ei anna eining',
    print: 'Skriv ut vedtaket',
    delete: 'Slett utkastet',
    unavailable: 'Berre saksbehandlaren kan gjere dette',
    viewTrigger: 'Visingsval',
    sortLabel: 'Sorter etter',
    sortNewest: 'Nyaste først',
    sortOldest: 'Eldste først',
    showClosed: 'Vis avslutta saker',
    stateOpen: 'open',
    stateClosed: 'lukka',
    lastAction: 'Siste handling',
    none: 'ingen',
    before: 'Før',
    after: 'Etter',
    outside: 'Tekst utanfor',
    toolbar: 'Verktøy for saka',
  },
}

function textsFor(locale: FormLocale) {
  return {
    text: texts[locale === 'se' ? 'en' : locale],
    lang: locale === 'se' ? ('en' as const) : undefined,
  }
}

/** A button that opens four actions. The third is unavailable, and keeps its place in the arrows. */
export function ActionsMenu({ locale, ...rootProps }: MenuRootProps & { locale: FormLocale }) {
  const { text, lang } = textsFor(locale)
  return (
    <div lang={lang}>
      <Menu.Root {...rootProps}>
        <Menu.Trigger className="kv-button">{text.trigger}</Menu.Trigger>
        <Menu.Popup>
          <Menu.Item>{text.assign}</Menu.Item>
          <Menu.Item>{text.print}</Menu.Item>
          <Menu.Item>{text.transfer}</Menu.Item>
          <Menu.Item>{text.delete}</Menu.Item>
        </Menu.Popup>
      </Menu.Root>
    </div>
  )
}

/** Groups and separators: the actions, a line, then a named group. The destructive item is last. */
export function GroupedMenu({ locale, ...rootProps }: MenuRootProps & { locale: FormLocale }) {
  const { text, lang } = textsFor(locale)
  return (
    <div lang={lang}>
      <Menu.Root {...rootProps}>
        <Menu.Trigger className="kv-button">{text.trigger}</Menu.Trigger>
        <Menu.Popup>
          <Menu.Item>{text.assign}</Menu.Item>
          <Menu.Item>{text.print}</Menu.Item>
          <Menu.Separator />
          <Menu.Group>
            <Menu.GroupLabel>{text.sortLabel}</Menu.GroupLabel>
            <Menu.Item>{text.sortNewest}</Menu.Item>
            <Menu.Item>{text.sortOldest}</Menu.Item>
          </Menu.Group>
          <Menu.Separator />
          <Menu.Item>{text.delete}</Menu.Item>
        </Menu.Popup>
      </Menu.Root>
    </div>
  )
}

/**
 * A checkbox item and a radio group, both uncontrolled. A checkbox item names the option and
 * shows a tick when it is checked, a radio item a dot. Choosing one closes the menu by default.
 */
export function ViewOptionsMenu({ locale, ...rootProps }: MenuRootProps & { locale: FormLocale }) {
  const { text, lang } = textsFor(locale)
  return (
    <div lang={lang}>
      <Menu.Root {...rootProps}>
        <Menu.Trigger className="kv-button">{text.viewTrigger}</Menu.Trigger>
        <Menu.Popup>
          <Menu.CheckboxItem defaultChecked closeOnSelect={false}>
            {text.showClosed}
          </Menu.CheckboxItem>
          <Menu.Separator />
          <Menu.RadioGroup defaultValue="newest" aria-label={text.sortLabel}>
            <Menu.RadioItem value="newest" closeOnSelect={false}>
              {text.sortNewest}
            </Menu.RadioItem>
            <Menu.RadioItem value="oldest" closeOnSelect={false}>
              {text.sortOldest}
            </Menu.RadioItem>
          </Menu.RadioGroup>
        </Menu.Popup>
      </Menu.Root>
    </div>
  )
}

/**
 * A disabled item is dimmed and says `aria-disabled`, but it stays in the arrow keys and in
 * typeahead, so a screen reader user hears it and why it is unavailable. Activating it does
 * nothing and the menu stays open.
 */
export function DisabledItemsMenu({
  locale,
  ...rootProps
}: MenuRootProps & { locale: FormLocale }) {
  const { text, lang } = textsFor(locale)
  return (
    <div lang={lang}>
      <Menu.Root {...rootProps}>
        <Menu.Trigger className="kv-button">{text.trigger}</Menu.Trigger>
        <Menu.Popup>
          <Menu.Item>{text.print}</Menu.Item>
          <Menu.Item disabled>{text.assign}</Menu.Item>
          <Menu.Item disabled>{text.transfer}</Menu.Item>
          <Menu.Item>{text.delete}</Menu.Item>
        </Menu.Popup>
      </Menu.Root>
      <p>{text.unavailable}</p>
    </div>
  )
}

/**
 * Controlled by your state: the menu shows the `open` it is given and reports every request
 * through `onOpenChange(open, { reason })`. The outputs are always in the page, so a screen
 * reader hears them change. The reason is the last one: `trigger-press`, `key`, `item-press`,
 * `escape`, `outside-press`, `light-dismiss` or `tab`.
 */
export function ControlledMenu({ locale }: { locale: FormLocale }) {
  const { text, lang } = textsFor(locale)
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState('–')
  const [action, setAction] = useState(text.none)
  return (
    <div lang={lang}>
      <output data-testid="state">{open ? text.stateOpen : text.stateClosed}</output>
      <output data-testid="reason">{reason}</output>
      <output data-testid="action">
        {text.lastAction}: {action}
      </output>
      <Button onClick={() => setOpen((current) => !current)}>{text.before}</Button>
      <Menu.Root
        open={open}
        onOpenChange={(nextOpen, details) => {
          setOpen(nextOpen)
          setReason(details.reason)
        }}
      >
        <Menu.Trigger className="kv-button">{text.trigger}</Menu.Trigger>
        <Menu.Popup>
          <Menu.Item onSelect={() => setAction(text.assign)}>{text.assign}</Menu.Item>
          <Menu.Item onSelect={() => setAction(text.print)}>{text.print}</Menu.Item>
          <Menu.Item onSelect={() => setAction(text.delete)}>{text.delete}</Menu.Item>
        </Menu.Popup>
      </Menu.Root>
    </div>
  )
}

/** Forty actions: more than fit, so the popup scrolls inside, and the labels wrap. */
export function LongMenu({ locale, ...rootProps }: MenuRootProps & { locale: FormLocale }) {
  const { text, lang } = textsFor(locale)
  return (
    <div lang={lang}>
      <Menu.Root {...rootProps}>
        <Menu.Trigger className="kv-button">{text.trigger}</Menu.Trigger>
        <Menu.Popup>
          {Array.from({ length: 40 }, (_, index) => (
            <Menu.Item key={index}>
              {text.transfer} {index + 1}
            </Menu.Item>
          ))}
        </Menu.Popup>
      </Menu.Root>
    </div>
  )
}

/**
 * Inside a vertical toolbar the trigger is one of its items, put in with `Toolbar.Item` and
 * `as`. ArrowDown on the trigger opens the menu; the toolbar does not also move focus.
 */
export function ToolbarMenu({ locale }: { locale: FormLocale }) {
  const { text, lang } = textsFor(locale)
  return (
    <div lang={lang}>
      <Toolbar.Root aria-label={text.toolbar} orientation="vertical">
        <Toolbar.Button>{text.before}</Toolbar.Button>
        <Menu.Root>
          <Toolbar.Item as={Menu.Trigger} className="kv-button">
            {text.trigger}
          </Toolbar.Item>
          <Menu.Popup>
            <Menu.Item>{text.assign}</Menu.Item>
            <Menu.Item>{text.print}</Menu.Item>
            <Menu.Item>{text.delete}</Menu.Item>
          </Menu.Popup>
        </Menu.Root>
        <Toolbar.Button>{text.after}</Toolbar.Button>
      </Toolbar.Root>
    </div>
  )
}

/**
 * A tooltip on the trigger. The tooltip closes while the menu is open, so it never covers an
 * item (1.4.13).
 */
export function TooltipMenu({ locale }: { locale: FormLocale }) {
  const { text, lang } = textsFor(locale)
  return (
    <div lang={lang}>
      <Menu.Root>
        <Tooltip.Root>
          <Tooltip.Trigger as={Menu.Trigger} className="kv-button">
            {text.trigger}
          </Tooltip.Trigger>
          <Tooltip.Popup>{text.toolbar}</Tooltip.Popup>
        </Tooltip.Root>
        <Menu.Popup>
          <Menu.Item>{text.assign}</Menu.Item>
          <Menu.Item>{text.print}</Menu.Item>
          <Menu.Item>{text.delete}</Menu.Item>
        </Menu.Popup>
      </Menu.Root>
    </div>
  )
}

/**
 * The fixture the keyboard tests drive: a button before, the menu, a button after and a line of
 * text to press on. Try the keys in the Keyboard section above: Enter, Space and the arrows on the
 * trigger, arrows, Home, End and letters in the menu, Tab out of it, and Escape.
 */
export function KeyboardMenu({ locale }: { locale: FormLocale }) {
  const { text, lang } = textsFor(locale)
  return (
    <div lang={lang}>
      {/* Above the row, so the popup (placed under the trigger) never covers it. */}
      <p data-testid="outside">{text.outside}</p>
      <div className="kv-button-group">
        <Button>{text.before}</Button>
        <Menu.Root>
          <Menu.Trigger className="kv-button">{text.trigger}</Menu.Trigger>
          <Menu.Popup>
            <Menu.Item>{text.assign}</Menu.Item>
            <Menu.Item disabled>{text.transfer}</Menu.Item>
            <Menu.Item>{text.print}</Menu.Item>
            <Menu.Separator />
            <Menu.Item>{text.delete}</Menu.Item>
          </Menu.Popup>
        </Menu.Root>
        <Button>{text.after}</Button>
      </div>
    </div>
  )
}

/**
 * Your own elements with `useMenu`: the props carry the roles, the keys and the state attributes
 * (`data-highlighted` on the focused item), so the default theme styles them through the same
 * classes.
 */
export function HookMenu({ locale }: { locale: FormLocale }) {
  const { text, lang } = textsFor(locale)
  const menu = useMenu()
  const [current, setCurrent] = useState<string>()
  const focusProps = (name: string) => ({
    onFocus: () => setCurrent(name),
    onBlur: () => setCurrent(undefined),
  })
  return (
    <div lang={lang}>
      <button {...menu.triggerProps} className="kv-button">
        {text.trigger}
      </button>
      <div {...menu.popupProps}>
        {menu.isOpen ? (
          <>
            <button
              {...menu.getItemProps('item', { isCurrent: current === 'print' })}
              {...focusProps('print')}
            >
              {text.print}
            </button>
            <button
              {...menu.getItemProps('item', { disabled: true, isCurrent: current === 'assign' })}
              {...focusProps('assign')}
            >
              {text.assign}
            </button>
            <button
              {...menu.getItemProps('checkbox', { checked: true, isCurrent: current === 'closed' })}
              {...focusProps('closed')}
            >
              {text.showClosed}
            </button>
          </>
        ) : null}
      </div>
    </div>
  )
}
