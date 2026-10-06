import { Button, Listbox, Popover, Toolbar } from '@kvirn-ui/react'
import type { ToolbarRootProps } from '@kvirn-ui/react'
import { useId, useState } from 'react'
import type { CSSProperties } from 'react'

// Fixtures for Components/Toolbar. Each exported function is one example, written to be read: the
// stories show its source as "Show code" (`showSource`). The names are fixture text from the
// resident's language, so they are plain strings here, where an app would take them from its
// translations.

interface BlockType {
  key: string
  label: string
}

const texts = {
  sv: {
    before: 'Före',
    after: 'Efter',
    toolbar: 'Formatering',
    history: 'Historik',
    undo: 'Ångra',
    redo: 'Gör om',
    style: 'Textstil',
    bold: 'Fet',
    italic: 'Kursiv',
    blockType: 'Texttyp',
    link: 'Länk',
    addLink: 'Lägg till länk',
    webAddress: 'Webbadress',
    cancel: 'Avbryt',
    actions: 'Antal åtgärder',
    blockTypes: [
      { key: 'normal', label: 'Vanlig text' },
      { key: 'heading-2', label: 'Rubrik 2' },
    ] satisfies BlockType[],
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
    blockType: 'Text type',
    link: 'Link',
    addLink: 'Add link',
    webAddress: 'Web address',
    cancel: 'Cancel',
    actions: 'Actions',
    blockTypes: [
      { key: 'normal', label: 'Normal text' },
      { key: 'heading-2', label: 'Heading 2' },
    ] satisfies BlockType[],
  },
}

/** What the default theme will draw for a popover: a raised surface, a 1px edge and a popup shadow. */
const popupStyle: CSSProperties = {
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
 * The main example: three named groups of text buttons and toggles. Fet is on to start with. Tab
 * enters the toolbar once, and the arrow keys move between the controls.
 */
export function TextToolbar(props: ToolbarRootProps) {
  return (
    <Toolbar.Root aria-label="Formatering" {...props}>
      <Toolbar.Group aria-label="Historik">
        <Toolbar.Button>Ångra</Toolbar.Button>
        <Toolbar.Button>Gör om</Toolbar.Button>
      </Toolbar.Group>
      <Toolbar.Group aria-label="Textstil">
        <Toolbar.Toggle defaultPressed>Fet</Toolbar.Toggle>
        <Toolbar.Toggle>Kursiv</Toolbar.Toggle>
        <Toolbar.Toggle>Understruken</Toolbar.Toggle>
      </Toolbar.Group>
      <Toolbar.Group aria-label="Infoga">
        <Toolbar.Button>Länk</Toolbar.Button>
        <Toolbar.Button>Bild</Toolbar.Button>
      </Toolbar.Group>
    </Toolbar.Root>
  )
}

/** `layout="spaced"` on a group opts out of the joined strip: the buttons keep a gap, as in a plain ButtonGroup. */
export function SpacedGroupsToolbar() {
  return (
    <Toolbar.Root aria-label="Formatering">
      <Toolbar.Group aria-label="Historik" layout="spaced">
        <Toolbar.Button>Ångra</Toolbar.Button>
        <Toolbar.Button>Gör om</Toolbar.Button>
      </Toolbar.Group>
      <Toolbar.Group aria-label="Textstil" layout="spaced">
        <Toolbar.Toggle defaultPressed>Fet</Toolbar.Toggle>
        <Toolbar.Toggle>Kursiv</Toolbar.Toggle>
      </Toolbar.Group>
      <Toolbar.Group aria-label="Infoga" layout="spaced">
        <Toolbar.Button>Länk</Toolbar.Button>
      </Toolbar.Group>
    </Toolbar.Root>
  )
}

/**
 * Controls that open something go in with `Toolbar.Item` and `render`: a Listbox trigger and a
 * Popover trigger, here next to groups, a disabled button and a button of your own before and after.
 * A disabled button stays reachable. The Listbox keeps its own keys, and Left and Right still move on.
 */
export function FormattingToolbar({ locale }: { locale: 'sv' | 'en' }) {
  const text = texts[locale]
  const [actions, setActions] = useState(0)
  const urlId = useId()
  const countAction = () => setActions((count) => count + 1)
  return (
    <>
      <Button>{text.before}</Button>
      <Toolbar.Root aria-label={text.toolbar}>
        <Toolbar.Group aria-label={text.history}>
          <Toolbar.Button onClick={countAction}>{text.undo}</Toolbar.Button>
          <Toolbar.Button disabled onClick={countAction}>
            {text.redo}
          </Toolbar.Button>
        </Toolbar.Group>
        <Toolbar.Group aria-label={text.style}>
          <Toolbar.Toggle>{text.bold}</Toolbar.Toggle>
          <Toolbar.Toggle>{text.italic}</Toolbar.Toggle>
        </Toolbar.Group>
        <Listbox.Root
          items={text.blockTypes}
          itemToString={(type) => type.label}
          itemToKey={(type) => type.key}
          defaultValue="normal"
          native="never"
        >
          <Toolbar.Item
            render={<Listbox.Trigger aria-label={text.blockType} style={{ inlineSize: '10rem' }} />}
          />
          <Listbox.Popup>
            <Listbox.List>{(type: BlockType) => <Listbox.Option item={type} />}</Listbox.List>
          </Listbox.Popup>
        </Listbox.Root>
        <Popover.Root>
          <Toolbar.Item render={<Popover.Trigger />}>{text.link}</Toolbar.Item>
          <Popover.Popup aria-label={text.addLink} style={popupStyle}>
            <form onSubmit={(event) => event.preventDefault()}>
              <p style={{ marginBlock: 0 }}>
                <label htmlFor={urlId}>{text.webAddress}</label>
              </p>
              <input id={urlId} type="url" autoComplete="url" className="kv-input" />
              <p style={{ marginBlockEnd: 0 }}>
                <Popover.Close className="kv-button">{text.cancel}</Popover.Close>
              </p>
            </form>
          </Popover.Popup>
        </Popover.Root>
      </Toolbar.Root>
      <Button>{text.after}</Button>
      <p>
        {text.actions}: {actions}
      </p>
    </>
  )
}

/** A vertical toolbar: Down and Up move between the controls, and `aria-orientation="vertical"` says so. The layout is your own CSS: the default theme draws horizontal toolbars. */
export function RowActionsToolbar() {
  return (
    <Toolbar.Root
      aria-label="Åtgärder för raden"
      orientation="vertical"
      style={{ flexDirection: 'column', alignItems: 'flex-start' }}
    >
      <Toolbar.Button>Flytta upp</Toolbar.Button>
      <Toolbar.Button>Flytta ned</Toolbar.Button>
      <Toolbar.Button>Duplicera</Toolbar.Button>
      <Toolbar.Button>Ta bort</Toolbar.Button>
    </Toolbar.Root>
  )
}

/** The same groups with long Finnish names: the toolbar wraps group by group, and a name wraps inside its button. */
export function FinnishToolbar() {
  return (
    <Toolbar.Root aria-label="Muotoilu">
      <Toolbar.Group aria-label="Kumoa ja tee uudelleen">
        <Toolbar.Button>Kumoa</Toolbar.Button>
        <Toolbar.Button>Tee uudelleen</Toolbar.Button>
      </Toolbar.Group>
      <Toolbar.Group aria-label="Tekstin tyyli">
        <Toolbar.Toggle defaultPressed>Lihavointi</Toolbar.Toggle>
        <Toolbar.Toggle>Kursiivi</Toolbar.Toggle>
        <Toolbar.Toggle>Alleviivaus</Toolbar.Toggle>
      </Toolbar.Group>
      <Toolbar.Group aria-label="Lisää">
        <Toolbar.Button>Suurenna sisennystä</Toolbar.Button>
        <Toolbar.Button>Pienennä sisennystä</Toolbar.Button>
      </Toolbar.Group>
    </Toolbar.Root>
  )
}
