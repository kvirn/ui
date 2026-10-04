import { Button, Icon, Kbd, Popover, Toolbar, Tooltip } from '@kvirn-ui/react'
import type { TooltipRootProps } from '@kvirn-ui/react'
import type { CSSProperties } from 'react'

// Fixtures for Components/Tooltip. Each exported function is one example, written to be read: the
// stories show its source as "Show code" (`showSource`). The names are fixture text from the
// resident's language, so they are plain strings here, where an app would take them from its
// translations: the trigger's `aria-label` and the tooltip's `Tooltip.Name` come from the same key.

const texts = {
  sv: {
    before: 'Före',
    after: 'Efter',
    toolbar: 'Formatering',
    history: 'Historik',
    undo: 'Ångra',
    redo: 'Gör om',
    style: 'Textstil',
    bold: 'Fetstil',
    italic: 'Kursiv',
    link: 'Länk',
    addLink: 'Lägg till länk',
    webAddress: 'Webbadress',
  },
  en: {
    before: 'Before',
    after: 'After',
    toolbar: 'Formatting',
    history: 'History',
    undo: 'Undo',
    redo: 'Redo',
    style: 'Text style',
    bold: 'Bold',
    italic: 'Italic',
    link: 'Link',
    addLink: 'Add link',
    webAddress: 'Web address',
  },
}

/** What the default theme will draw for a popover: a raised surface, a 1px edge and a popup shadow. */
const popoverStyle: CSSProperties = {
  boxSizing: 'border-box',
  maxInlineSize: '20rem',
  padding: 'var(--kv-space-4)',
  color: 'var(--kv-color-text)',
  background: 'var(--kv-color-surface-raised)',
  border: 'var(--kv-border-width) solid var(--kv-color-border-control)',
  borderRadius: 'var(--kv-radius-xl)',
  boxShadow: 'var(--kv-shadow-popup)',
}

/**
 * The main example: an icon-only button with a tooltip that repeats its name. The button has its
 * own `aria-label`, and the tooltip starts with the same text in `Tooltip.Name`, which is hidden
 * from assistive technology so the name is heard once. Hover the button, or Tab to it.
 */
export function SearchButton(props: Omit<TooltipRootProps, 'children'>) {
  return (
    <Tooltip.Root {...props}>
      <Tooltip.Trigger render={<Button className="kv-button--icon-only" aria-label="Sök" />}>
        <Icon name="search" />
      </Tooltip.Trigger>
      <Tooltip.Popup>
        <Tooltip.Name>Sök</Tooltip.Name>
      </Tooltip.Popup>
    </Tooltip.Root>
  )
}

/**
 * A name and a shortcut. The name is hidden from assistive technology and the shortcut is the
 * button's description, so a screen reader says "Fetstil, växlingsknapp, inte nedtryckt, Ctrl+B".
 * The button keeps its own `aria-keyshortcuts`. Key names aren't translated, and `Kbd` draws them.
 */
export function BoldToggle(props: Omit<TooltipRootProps, 'children'>) {
  return (
    <Tooltip.Root {...props}>
      <Tooltip.Trigger
        render={
          <Toolbar.Toggle
            className="kv-button--icon-only"
            aria-label="Fetstil"
            aria-keyshortcuts="Control+B"
          />
        }
      >
        <strong aria-hidden="true">B</strong>
      </Tooltip.Trigger>
      <Tooltip.Popup>
        <Tooltip.Name>Fetstil</Tooltip.Name>
        <Tooltip.Shortcut>
          <Kbd>
            <Kbd lang="en">Ctrl</Kbd>+<Kbd lang="en">B</Kbd>
          </Kbd>
        </Tooltip.Shortcut>
      </Tooltip.Popup>
    </Tooltip.Root>
  )
}

/**
 * Plain text in the popup is the button's description as a whole, as in APG: it adds something
 * the button's name doesn't say. Never essential information: a touch user never sees it.
 */
export function PrintButton(props: Omit<TooltipRootProps, 'children'>) {
  return (
    <Tooltip.Root {...props}>
      <Tooltip.Trigger render={<Button className="kv-button--icon-only" aria-label="Skriv ut" />}>
        <Icon name="document" />
      </Tooltip.Trigger>
      <Tooltip.Popup>Öppnar en utskriftsvy i ett nytt fönster</Tooltip.Popup>
    </Tooltip.Root>
  )
}

/**
 * Controls in a `Toolbar` with a tooltip each, through `render`. A disabled button stays
 * focusable (`aria-disabled`), so its tooltip works too. Arrowing along the toolbar shows each
 * tooltip at once, and the next replaces the last.
 */
export function TextToolbar() {
  return (
    <Toolbar.Root aria-label="Formatering">
      <Toolbar.Group aria-label="Historik">
        <Tooltip.Root>
          <Tooltip.Trigger
            render={
              <Toolbar.Button
                className="kv-button--icon-only"
                aria-label="Ångra"
                aria-keyshortcuts="Control+Z"
              />
            }
          >
            <Icon name="arrow-back" />
          </Tooltip.Trigger>
          <Tooltip.Popup>
            <Tooltip.Name>Ångra</Tooltip.Name>
            <Tooltip.Shortcut>
              <Kbd>
                <Kbd lang="en">Ctrl</Kbd>+<Kbd lang="en">Z</Kbd>
              </Kbd>
            </Tooltip.Shortcut>
          </Tooltip.Popup>
        </Tooltip.Root>
        <Tooltip.Root>
          <Tooltip.Trigger
            render={
              <Toolbar.Button
                disabled
                className="kv-button--icon-only"
                aria-label="Gör om"
                aria-keyshortcuts="Control+Y"
              />
            }
          >
            <Icon name="arrow-forward" />
          </Tooltip.Trigger>
          <Tooltip.Popup>
            <Tooltip.Name>Gör om</Tooltip.Name>
            <Tooltip.Shortcut>
              <Kbd>
                <Kbd lang="en">Ctrl</Kbd>+<Kbd lang="en">Y</Kbd>
              </Kbd>
            </Tooltip.Shortcut>
          </Tooltip.Popup>
        </Tooltip.Root>
      </Toolbar.Group>
      <Toolbar.Group aria-label="Textstil">
        <Tooltip.Root>
          <Tooltip.Trigger
            render={
              <Toolbar.Toggle
                className="kv-button--icon-only"
                aria-label="Fetstil"
                aria-keyshortcuts="Control+B"
              />
            }
          >
            <strong aria-hidden="true">B</strong>
          </Tooltip.Trigger>
          <Tooltip.Popup>
            <Tooltip.Name>Fetstil</Tooltip.Name>
            <Tooltip.Shortcut>
              <Kbd>
                <Kbd lang="en">Ctrl</Kbd>+<Kbd lang="en">B</Kbd>
              </Kbd>
            </Tooltip.Shortcut>
          </Tooltip.Popup>
        </Tooltip.Root>
        <Tooltip.Root>
          <Tooltip.Trigger
            render={
              <Toolbar.Toggle
                className="kv-button--icon-only"
                aria-label="Kursiv"
                aria-keyshortcuts="Control+I"
              />
            }
          >
            <em aria-hidden="true">I</em>
          </Tooltip.Trigger>
          <Tooltip.Popup>
            <Tooltip.Name>Kursiv</Tooltip.Name>
            <Tooltip.Shortcut>
              <Kbd>
                <Kbd lang="en">Ctrl</Kbd>+<Kbd lang="en">I</Kbd>
              </Kbd>
            </Tooltip.Shortcut>
          </Tooltip.Popup>
        </Tooltip.Root>
      </Toolbar.Group>
    </Toolbar.Root>
  )
}

/**
 * The fixture the keyboard tests drive: a button before, a toolbar with a tooltip on every
 * control, a button after. The Link control opens a Popover: its tooltip closes while the popover
 * is open. Disabled Redo keeps its tooltip. Names and shortcuts are in the language chosen.
 */
export function FormattingToolbar({ locale }: { locale: 'sv' | 'en' }) {
  const text = texts[locale]
  return (
    <>
      <Button>{text.before}</Button>
      <Toolbar.Root aria-label={text.toolbar}>
        <Toolbar.Group aria-label={text.history}>
          <Tooltip.Root>
            <Tooltip.Trigger
              render={
                <Toolbar.Button
                  className="kv-button--icon-only"
                  aria-label={text.undo}
                  aria-keyshortcuts="Control+Z"
                />
              }
            >
              <Icon name="arrow-back" />
            </Tooltip.Trigger>
            <Tooltip.Popup>
              <Tooltip.Name>{text.undo}</Tooltip.Name>
              <Tooltip.Shortcut>
                <Kbd>
                  <Kbd lang="en">Ctrl</Kbd>+<Kbd lang="en">Z</Kbd>
                </Kbd>
              </Tooltip.Shortcut>
            </Tooltip.Popup>
          </Tooltip.Root>
          <Tooltip.Root>
            <Tooltip.Trigger
              render={
                <Toolbar.Button
                  disabled
                  className="kv-button--icon-only"
                  aria-label={text.redo}
                  aria-keyshortcuts="Control+Y"
                />
              }
            >
              <Icon name="arrow-forward" />
            </Tooltip.Trigger>
            <Tooltip.Popup>
              <Tooltip.Name>{text.redo}</Tooltip.Name>
              <Tooltip.Shortcut>
                <Kbd>
                  <Kbd lang="en">Ctrl</Kbd>+<Kbd lang="en">Y</Kbd>
                </Kbd>
              </Tooltip.Shortcut>
            </Tooltip.Popup>
          </Tooltip.Root>
        </Toolbar.Group>
        <Toolbar.Group aria-label={text.style}>
          <Tooltip.Root>
            <Tooltip.Trigger
              render={
                <Toolbar.Toggle
                  className="kv-button--icon-only"
                  aria-label={text.bold}
                  aria-keyshortcuts="Control+B"
                />
              }
            >
              <strong aria-hidden="true">B</strong>
            </Tooltip.Trigger>
            <Tooltip.Popup>
              <Tooltip.Name>{text.bold}</Tooltip.Name>
              <Tooltip.Shortcut>
                <Kbd>
                  <Kbd lang="en">Ctrl</Kbd>+<Kbd lang="en">B</Kbd>
                </Kbd>
              </Tooltip.Shortcut>
            </Tooltip.Popup>
          </Tooltip.Root>
          <Tooltip.Root>
            <Tooltip.Trigger
              render={
                <Toolbar.Toggle
                  className="kv-button--icon-only"
                  aria-label={text.italic}
                  aria-keyshortcuts="Control+I"
                />
              }
            >
              <em aria-hidden="true">I</em>
            </Tooltip.Trigger>
            <Tooltip.Popup>
              <Tooltip.Name>{text.italic}</Tooltip.Name>
              <Tooltip.Shortcut>
                <Kbd>
                  <Kbd lang="en">Ctrl</Kbd>+<Kbd lang="en">I</Kbd>
                </Kbd>
              </Tooltip.Shortcut>
            </Tooltip.Popup>
          </Tooltip.Root>
        </Toolbar.Group>
        <Popover.Root>
          <Tooltip.Root>
            <Tooltip.Trigger
              render={
                <Toolbar.Item
                  render={<Popover.Trigger className="kv-button" aria-keyshortcuts="Control+K" />}
                />
              }
            >
              {text.link}
            </Tooltip.Trigger>
            <Tooltip.Popup>
              <Tooltip.Name>{text.link}</Tooltip.Name>
              <Tooltip.Shortcut>
                <Kbd>
                  <Kbd lang="en">Ctrl</Kbd>+<Kbd lang="en">K</Kbd>
                </Kbd>
              </Tooltip.Shortcut>
            </Tooltip.Popup>
          </Tooltip.Root>
          <Popover.Popup aria-label={text.addLink} style={popoverStyle}>
            <p style={{ marginBlock: 0 }}>{text.webAddress}</p>
          </Popover.Popup>
        </Popover.Root>
      </Toolbar.Root>
      <Button>{text.after}</Button>
    </>
  )
}

/**
 * A tooltip on a control inside a Popover. Escape hides the tooltip only: the Popover stays open,
 * and the next Escape closes it. The tooltip is the innermost layer of the dismissable layer stack.
 */
export function TooltipInAPopover() {
  return (
    <Popover.Root>
      <Popover.Trigger className="kv-button">Fler åtgärder</Popover.Trigger>
      <Popover.Popup aria-label="Fler åtgärder" style={popoverStyle}>
        <Tooltip.Root>
          <Tooltip.Trigger
            render={<Button className="kv-button--icon-only" aria-label="Kopiera" />}
          >
            <Icon name="document" />
          </Tooltip.Trigger>
          <Tooltip.Popup>
            <Tooltip.Name>Kopiera</Tooltip.Name>
            <Tooltip.Shortcut>
              <Kbd>
                <Kbd lang="en">Ctrl</Kbd>+<Kbd lang="en">C</Kbd>
              </Kbd>
            </Tooltip.Shortcut>
          </Tooltip.Popup>
        </Tooltip.Root>
      </Popover.Popup>
    </Popover.Root>
  )
}

/**
 * Long text in Finnish: the tooltip is at most 20rem wide and the text wraps, never truncated or
 * clipped, so nothing is lost at 320px or with spacing overrides. In a viewport that is too short for it, it may overlap
 * its trigger: Escape hides it. A tooltip is still one short line in practice.
 */
export function LongTooltip(props: Omit<TooltipRootProps, 'children'>) {
  return (
    <Tooltip.Root {...props}>
      <Tooltip.Trigger render={<Button className="kv-button--icon-only" aria-label="Tulosta" />}>
        <Icon name="document" />
      </Tooltip.Trigger>
      <Tooltip.Popup>
        Avaa tulostusnäkymän uuteen ikkunaan, josta voit tulostaa tai tallentaa sivun PDF-tiedostona
        yhteystietojen kanssa
      </Tooltip.Popup>
    </Tooltip.Root>
  )
}

/**
 * Where there is no room above, the tooltip flips below, so it doesn't cover its trigger and the
 * trigger's focus ring stays visible.
 */
export function TooltipAtTheTop(props: Omit<TooltipRootProps, 'children'>) {
  return (
    <Tooltip.Root {...props}>
      <Tooltip.Trigger
        render={
          <Button
            className="kv-button--icon-only"
            aria-label="Sök"
            style={{ position: 'fixed', insetBlockStart: 8, insetInlineStart: 8 }}
          />
        }
      >
        <Icon name="search" />
      </Tooltip.Trigger>
      <Tooltip.Popup>
        <Tooltip.Name>Sök</Tooltip.Name>
      </Tooltip.Popup>
    </Tooltip.Root>
  )
}
