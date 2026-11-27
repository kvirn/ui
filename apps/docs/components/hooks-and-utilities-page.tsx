import {
  Link,
  TableBody,
  TableCell,
  TableColumnHeader,
  TableHead,
  TableRoot,
  TableRow,
  TableRowHeader,
  TableScrollRegion,
} from '@kvirn/ui'
import type { ReactNode } from 'react'
import { AnchoredHeading } from './anchored-heading.tsx'
import { CodeBlock } from './code-block.tsx'
import { Note } from './note.tsx'
import { PageWithContents } from './page-contents.tsx'

interface LinkedRow {
  name: string
  href: string
  purpose: ReactNode
  signature: string
}

/** The names that have their own page: one line each and a link, never a second copy. */
function LinkedTable({
  sectionId,
  label,
  rows,
}: {
  sectionId: string
  /** A name for a second table under the same heading, so the two tables are not named alike. */
  label?: string
  rows: readonly LinkedRow[]
}) {
  const naming = label === undefined ? { 'aria-labelledby': sectionId } : { 'aria-label': label }
  return (
    <TableScrollRegion {...naming}>
      <TableRoot className="kv-table--card kv-table--striped" {...naming}>
        <TableHead>
          <TableRow>
            <TableColumnHeader>Name</TableColumnHeader>
            <TableColumnHeader>What it is for</TableColumnHeader>
            <TableColumnHeader>Signature</TableColumnHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.name}>
              <TableRowHeader>
                <Link href={row.href}>
                  <code>{row.name}</code>
                </Link>
              </TableRowHeader>
              <TableCell>{row.purpose}</TableCell>
              <TableCell>
                <code>{row.signature}</code>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </TableRoot>
    </TableScrollRegion>
  )
}

/** A name with no page of its own: what it is for, its import and signature, and an example. */
function Entry({
  id,
  name,
  purpose,
  signature,
  exampleIntro,
  example,
  isCode = true,
  children,
}: {
  id: string
  name: string
  /** `false` for a heading that is a phrase, not a name in the code. */
  isCode?: boolean
  purpose: ReactNode
  signature: string
  exampleIntro: ReactNode
  example: string
  /** Tables of options and results, between the signature and the example. */
  children?: ReactNode
}) {
  return (
    <>
      <AnchoredHeading as="h3" id={id} label={name}>
        {isCode ? <code>{name}</code> : name}
      </AnchoredHeading>
      <p>{purpose}</p>
      <CodeBlock code={signature} />
      {children}
      <p>{exampleIntro}</p>
      <CodeBlock code={example} />
    </>
  )
}

const providerImport = `import {
  useLocale,
  useDateSettings,
  useFormat,
  useTheme,
  useDisplaySettings,
} from '@kvirn/ui'`

const providerRows: readonly LinkedRow[] = [
  {
    name: 'useLocale',
    href: '/foundation/kvirn-provider#api-uselocale',
    purpose:
      'The page’s language, its text direction and its country, which the masks use. It also gives the lang and dir to put on a part in another language.',
    signature: 'useLocale(): { locale, dir, country, localeProps }',
  },
  {
    name: 'useDateSettings',
    href: '/foundation/kvirn-provider#api-usedatesettings',
    purpose: 'The time zone and the first day of the week that the provider uses.',
    signature: 'useDateSettings(): { timeZone, weekStart }',
  },
  {
    name: 'useFormat',
    href: '/foundation/kvirn-provider#api-useformat',
    purpose:
      'Writes numbers, dates, lists and plural forms the way the page’s language writes them.',
    signature: 'useFormat(): { number, date, list, plural }',
  },
  {
    name: 'useTheme',
    href: '/foundation/kvirn-provider#api-usetheme',
    purpose:
      'Reads and changes the visitor’s choice of colour scheme, contrast and motion. It also says whether the device uses its own colours.',
    signature: 'useTheme(): { colorScheme, contrast, motion, …, selectColorScheme, … }',
  },
  {
    name: 'useDisplaySettings',
    href: '/components/display-settings#api-usedisplaysettings',
    purpose:
      'The three display choices, colour scheme, contrast and motion, with their labels, for your own markup. It draws nothing.',
    signature:
      'useDisplaySettings(options?: { messages?, short? }): { text, groups, isForcedColors }',
  },
]

const focusImport = `import { useFocus, FocusScope, useRouteFocus, useAnnouncer, useToast } from '@kvirn/ui'`

const focusRows: readonly LinkedRow[] = [
  {
    name: 'useFocus',
    href: '/components/focus',
    purpose:
      'Moves focus into a part of the page when it opens, can keep it there, and gives it back when the part closes.',
    signature: 'useFocus(options?): { scopeProps, captureOpener, wasFocusSeen, … }',
  },
  {
    name: 'FocusScope',
    href: '/components/focus',
    purpose: 'A container that does what useFocus does, with the same options.',
    signature: '<FocusScope active contain onEscape as … />',
  },
  {
    name: 'useRouteFocus',
    href: '/components/route-focus',
    purpose:
      'After a client-side page change, moves focus to the new page’s title, so keyboard and screen reader users start there.',
    signature: 'useRouteFocus({ key, containerRef?, selector?, announce?, messages? }): void',
  },
  {
    name: 'useAnnouncer',
    href: '/components/announcer',
    purpose: 'Says a message to screen reader users, in the shared live region.',
    signature: 'useAnnouncer(): { announce(message, options?): boolean }',
  },
  {
    name: 'useToast',
    href: '/components/toast',
    purpose: 'Shows a short status message after something worked, without moving focus.',
    signature: 'useToast(): { show, dismiss, dismissAll, focus }',
  },
]

const formsImport = `import { useMask, masks, checks } from '@kvirn/ui'`

const formsRows: readonly LinkedRow[] = [
  {
    name: 'useMask',
    href: '/components/text-input#api-usemask',
    purpose:
      'The mask of the TextInput mask prop, for your own input. It leaves out characters that do not fit and adds separators as the person types.',
    signature:
      'useMask({ mask, onValueChange?, announceRejections?, messages? }): { inputProps, format, unmask }',
  },
]

const masksSignature = `import { masks } from '@kvirn/ui'

masks.digits({ length? })
masks.letters()
masks.lettersAndDigits()
masks.number({ decimals?, allowNegative?, grouping?, locale?, min?, max? })
masks.personalIdentityNumber({ country })
masks.postalCode({ country })
masks.organisationNumber({ country })
masks.date({ locale? })
masks.iban()
masks.email()
masks.telephone()
masks.pattern(pattern, options?)
masks.regexp(expression, options?)
masks.oneTimeCode({ pattern })
// country is 'SE', 'FI' or 'NO'. Each call returns a Mask.`

const masksExample = `import { TextInput, masks } from '@kvirn/ui'

// A postcode for a Finnish address: five digits, shaped as the person types.
<TextInput mask={masks.postalCode({ country: 'FI' })} />`

const checksSignature = `import { checks } from '@kvirn/ui'

checks.personalIdentityNumber(value, { country, allowSyntheticNumbers? })
// reason: 'format' | 'date' | 'checkDigit'
checks.organisationNumber(value, { country })
// reason: 'format' | 'checkDigit'
checks.iban(value)
// reason: 'format' | 'country' | 'checkDigit'
checks.date(isoValue, { min?, max? })
// reason: 'format' | 'date' | 'range'
// Each returns { isValid: true } or { isValid: false, reason }.`

const checksExample = `import { checks } from '@kvirn/ui'

// Run when the form is sent, not while the person is typing.
function personalNumberError(value: string) {
  const result = checks.personalIdentityNumber(value, { country: 'SE' })
  if (result.isValid) {
    return undefined
  }
  return result.reason === 'format'
    ? 'Write the number with 10 or 12 digits.'
    : 'Check the number. It does not look right.'
}`

const dataImport = `import { useProgress, useTagGroup, createLocaleSortFn } from '@kvirn/ui'`

const dataRows: readonly LinkedRow[] = [
  {
    name: 'useProgress',
    href: '/components/progress#api-useprogress',
    purpose:
      'The state of a wait: it can hold back a short wait, adds a sentence when the wait is long, and announces the label once.',
    signature:
      'useProgress({ label?, value?, max?, delayMilliseconds?, slowAfterMilliseconds?, announce?, messages? }): { isShown, isSlow, label, percent, … }',
  },
  {
    name: 'tableFeatures',
    href: '/components/table',
    purpose:
      'With createColumnHelper, the features (such as rowSortingFeature), the row models (such as createSortedRowModel) and the filterFn_* and sortFn_* functions, these are the building blocks of useTable, from TanStack Table. KvirnUI re-exports them, so you install nothing else.',
    signature: 'tableFeatures({ rowSortingFeature, sortedRowModel: createSortedRowModel(), … })',
  },
  {
    name: 'useTagGroup',
    href: '/components/tag#api-usetaggroup',
    purpose:
      'The focus rule and the announcement for a group of removable tags, such as applied filters, in your own markup.',
    signature:
      'useTagGroup(options?: { announceRemoval?, focusFallback?, messages? }): { labelId, labelRef, listRef, prepareRemoval, … }',
  },
]

const localeSortSignature = `import { createLocaleSortFn } from '@kvirn/ui'

function createLocaleSortFn(locale: string, collatorOptions?: Intl.CollatorOptions): SortFn`

const localeSortExample = `import {
  createColumnHelper,
  createLocaleSortFn,
  createSortedRowModel,
  rowSortingFeature,
  tableFeatures,
} from '@kvirn/ui'

type Applicant = { name: string }

// Made once, outside the component.
const features = tableFeatures({
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
  sortFns: { locale: createLocaleSortFn('sv') },
})
const column = createColumnHelper<typeof features, Applicant>()
const columns = column.columns([column.accessor('name', { header: 'Name', sortFn: 'locale' })])`

const datesSignature = `import {
  dateInputValueToIsoDate,
  isoDateToDateInputValue,
  maskedDateToIsoDate,
  isoDateToMaskedDate,
} from '@kvirn/ui'

dateInputValueToIsoDate(value: DateInputValue): string   // '' until the three boxes hold a real date
isoDateToDateInputValue(date: string): DateInputValue    // '2026-04-05' becomes { year: '2026', month: '4', day: '5' }
maskedDateToIsoDate(text: string, locale: string): string   // '' while the text is partial or not a real date
isoDateToMaskedDate(date: string, locale: string): string   // '2026-10-04' in locale 'fi' becomes '04.10.2026'`

const datesExample = `import { DatePicker, DateInput, dateInputValueToIsoDate, isoDateToDateInputValue } from '@kvirn/ui'
import type { DateInputValue } from '@kvirn/ui'
import { useState } from 'react'

function BookingDate() {
  const [boxes, setBoxes] = useState<DateInputValue>({ year: '', month: '', day: '' })
  return (
    <DatePicker.Root
      value={dateInputValueToIsoDate(boxes)}
      onValueChange={(isoDate) => setBoxes(isoDateToDateInputValue(isoDate))}
    >
      {/* DateInput.Root with its boxes, then DatePicker.Trigger, then DatePicker.Popup */}
    </DatePicker.Root>
  )
}`

const overlaysImport = `import { usePopup, useDismissableLayer, createTooltipGroup } from '@kvirn/ui'`

const overlayRows: readonly LinkedRow[] = [
  {
    name: 'usePopup',
    href: '/components/popover#api-usepopup',
    purpose:
      'Shows a floating element above the page and places it next to another element, inside the screen. Popover, Menu, Listbox, Combobox and Tooltip use it.',
    signature:
      'usePopup({ open, anchorRef, popupRef, placement?, offset?, padding?, matchAnchorWidth?, popover?, onNativeDismiss? }): { popupProps, placement, reposition }',
  },
  {
    name: 'useDismissableLayer',
    href: '/components/popover#api-usedismissablelayer',
    purpose:
      'Reports Escape and presses outside a floating layer. Open layers share one stack, so only the top one reacts.',
    signature:
      'useDismissableLayer({ open, onDismiss, ref, ignore?, dismissOnEscape?, dismissOnOutsidePress?, passOutsidePressThrough?, backdrop? }): void',
  },
]

const tooltipGroupSignature = `import { createTooltipGroup } from '@kvirn/ui'

function createTooltipGroup(options?: { skipDelay?: number }): TooltipGroup
// skipDelay: how long, in milliseconds, after one tooltip closes the next opens at once. Default 300.`

const tooltipGroupExample = `import { Tooltip, createTooltipGroup } from '@kvirn/ui'
import { useState } from 'react'

function CaseActions() {
  // Made once. These tooltips share a delay of their own, apart from the rest of the page.
  const [group] = useState(() => createTooltipGroup())
  return (
    <>
      <Tooltip.Root group={group}>…</Tooltip.Root>
      <Tooltip.Root group={group}>…</Tooltip.Root>
    </>
  )
}`

const serverImport = `import { createMessageFormat, getLocaleProps, getMessages, KvirnThemeScript } from '@kvirn/ui/server'`

const messageFormatSignature = `import { createMessageFormat } from '@kvirn/ui/server'

function createMessageFormat({ locale, timeZone }: {
  locale: string
  timeZone: string | undefined
}): { number, date, list, plural }`

const messageFormatExample = `import { createMessageFormat } from '@kvirn/ui/server'

const format = createMessageFormat({ locale: 'sv-SE', timeZone: 'Europe/Stockholm' })
const received = format.date('2026-10-04', { dateStyle: 'long' })`

const localePropsSignature = `import { getLocaleProps } from '@kvirn/ui/server'

function getLocaleProps(locale: string): { lang: string, dir: 'ltr' | 'rtl' }`

const localePropsExample = `import { getLocaleProps } from '@kvirn/ui/server'

const { lang, dir } = getLocaleProps('fi-FI')

<html lang={lang} dir={dir}>…</html>`

const getMessagesSignature = `import { getMessages } from '@kvirn/ui/server'

function getMessages(namespace: keyof KvirnMessages, options?: {
  locale?: string      // default 'en'
  messages?: PartialMessages
  timeZone?: string    // default 'UTC'
}): ResolvedMessages<KvirnMessages[Namespace]>
// A text is a string. A text with a value in it, such as a count, is a function of that value.`

const getMessagesExample = `import { getMessages } from '@kvirn/ui/server'
import { sv } from '@kvirn/i18n/sv'

// In a Server Component: the text of the Copy button, in Swedish.
const texts = getMessages('copyButton', { locale: 'sv-SE', messages: sv })
const label = texts.label`

const themeScriptSignature = `import { KvirnThemeScript } from '@kvirn/ui/server'

<KvirnThemeScript nonce?: string theme?: { defaultColorScheme?, defaultContrast?, defaultMotion? } />`

const themeScriptExample = `import { KvirnThemeScript } from '@kvirn/ui/server'

// In the <head> of the layout, so the theme is set before the first paint.
<head>
  <KvirnThemeScript nonce={nonce} />
</head>`

const mergePropsSignature = `import { mergeProps } from '@kvirn/ui'

function mergeProps(...propObjects: object[]): object`

const mergePropsExample = `import { mergeProps, useButton } from '@kvirn/ui'

function SendButton() {
  const button = useButton()
  // The class names are joined, so the button keeps kv-button and gains your class.
  return <button {...mergeProps(button.buttonProps, { className: 'my-send' })}>Send</button>
}`

const mapImport = `import { useMap, useMapState, useAddressSearch, createMemoryProvider, mapIcons } from '@kvirn/map'`

const mapRows: readonly LinkedRow[] = [
  {
    name: 'useMap',
    href: '/components/map#api-usemap',
    purpose:
      'The state behind Map.Root: the camera, the places in view, the open place and the layers. Map.Root calls it and shares the result with its parts, so most apps never call it.',
    signature:
      'useMap({ provider, label, initialView, places?, source?, layers?, cluster?, … }): UseMapResult',
  },
  {
    name: 'useMapState',
    href: '/components/map#api-usemapstate',
    purpose:
      'Reads that same state inside Map.Root, so you can build a part the library does not draw, such as your own list of places. It throws outside Map.Root.',
    signature: 'useMapState(): UseMapResult',
  },
  {
    name: 'useAddressSearch',
    href: '/components/address-search#api-useaddresssearch',
    purpose:
      'The state and props of an address search, for your own markup: the text box, the Search button and the list of suggestions. Nothing is sent before the person types, and the text goes only to the geocoder you pass. It needs a KvirnProvider.',
    signature:
      'useAddressSearch({ geocoder, onResult?, minLength?, debounce?, … }): { inputProps, submitProps, statusProps, results, status, … }',
  },
  {
    name: 'createMemoryProvider',
    href: '/components/map#api-creatememoryprovider',
    purpose:
      'A provider with no engine and no network. It keeps the camera and draws nothing, for tests and for pages with no picture.',
    signature: 'createMemoryProvider({ size?, baseMaps?, defaultBaseMap? }): MemoryProvider',
  },
]

const mapIconsSignature = `import { mapIcons } from '@kvirn/map'

// A frozen object. Each value is an icon from @kvirn/icons.
mapIcons: {
  marker                          // the pin on a place, and the pin of an address search result
  add                             // Zoom in
  remove                          // Zoom out
  'arrow-north' 'arrow-south' 'arrow-west' 'arrow-east'   // the pan buttons
  close                           // closes the details and the cluster popup
  'chevron-down'                  // the base map switch
  error info                      // the address search status
}`

const mapIconsExample = `// app/icons.ts
'use client'
import { defineIcons } from '@kvirn/ui'
import { mapIcons } from '@kvirn/map'
import { MunicipalityPin } from './municipality-pin'

// All of the Map's names, with your own pin in place of marker.
export const icons = defineIcons({ ...mapIcons, marker: MunicipalityPin })

// app/providers.tsx
<KvirnProvider icons={icons}>{children}</KvirnProvider>`

const richTextImport = `import {
  useRichTextEditor,
  useRichTextEditorContext,
  defaultExtensions,
  getRichTextFeatures,
  isDocumentEmpty,
  isAllowedLinkAddress,
  isAllowedImageSource,
  describeShortcut,
  ImagePasteGuard,
  KvirnKeymap,
} from '@kvirn/rich-text'`

const richTextRows: readonly LinkedRow[] = [
  {
    name: 'useRichTextEditor',
    href: '/components/rich-text-editor#api-userichtexteditor',
    purpose:
      'The state and props of the editor, for your own markup. It makes the Tiptap editor after the first render, so it is safe to render on the server, and it joins the nearest Field.',
    signature:
      'useRichTextEditor({ extensions?, format?, value?, defaultValue?, onValueChange?, name?, … }): { editor, rootProps, contentProps, hiddenInputProps, text, isEmpty, … }',
  },
  {
    name: 'useRichTextEditorContext',
    href: '/components/rich-text-editor#api-helper-functions-userichtexteditorcontext',
    purpose:
      'The Tiptap editor and the editor’s state, for a part of your own inside RichTextEditor.Root, such as a button or a word count. It throws outside Root.',
    signature: 'useRichTextEditorContext(): { editor, state, features, announce, focusText, … }',
  },
  {
    name: 'defaultExtensions',
    href: '/components/rich-text-editor#api-defaultextensions',
    purpose:
      'The Tiptap extensions an editor starts with: headings 2 to 6, safe links, tables, images from your own site and the Kvirn keymap. Spread it into your own list.',
    signature:
      'defaultExtensions({ heading?, link?, table?, image?, imageSources?, inputRules?, starterKit?, keymap? }): Extensions',
  },
  {
    name: 'getRichTextFeatures',
    href: '/components/rich-text-editor#api-helper-functions-getrichtextfeatures',
    purpose:
      'Says what a list of extensions lets the text contain, such as lists, tables, links, images and heading levels, without making an editor.',
    signature: 'getRichTextFeatures(extensions): RichTextFeatures',
  },
  {
    name: 'isDocumentEmpty',
    href: '/components/rich-text-editor#api-helper-functions-isdocumentempty',
    purpose:
      'Says whether a Tiptap document has nothing to read: no text, and no image or table. An empty paragraph, heading or list item counts as empty.',
    signature: 'isDocumentEmpty(document): boolean',
  },
  {
    name: 'isAllowedLinkAddress',
    href: '/components/rich-text-editor#api-helper-functions-isallowedlinkaddress',
    purpose:
      'Says whether a link address is relative or uses https, http, mailto or tel (or the schemes you pass). It never allows javascript:, data: or ftp:.',
    signature: 'isAllowedLinkAddress(address, protocols?): boolean',
  },
  {
    name: 'isAllowedImageSource',
    href: '/components/rich-text-editor#api-helper-functions-isallowedimagesource',
    purpose:
      'Says whether an image address may be used: a relative one, or one from the page’s own site or a site you list. It refuses javascript:, blob: and file:, and data: unless you allow it.',
    signature: 'isAllowedImageSource(source, { sources?, allowBase64?, baseUrl? }?): boolean',
  },
  {
    name: 'describeShortcut',
    href: '/components/rich-text-editor#api-helper-functions-describeshortcut',
    purpose:
      'Turns a Tiptap shortcut such as Mod-b into what aria-keyshortcuts and a tooltip need. Mod is Command on Apple devices and Control elsewhere.',
    signature: 'describeShortcut(chords, isMac): { ariaKeyShortcuts, keys, text }',
  },
  {
    name: 'ImagePasteGuard',
    href: '/components/rich-text-editor#api-helper-functions-imagepasteguard',
    purpose:
      'A Tiptap extension that tells the writer when a pasted or dropped image is refused. defaultExtensions already includes it.',
    signature: 'ImagePasteGuard.configure({ sources?, allowBase64?, baseUrl? })',
  },
  {
    name: 'KvirnKeymap',
    href: '/components/rich-text-editor#api-helper-functions-kvirnkeymap',
    purpose:
      'A Tiptap extension that decides what Tab, Escape, Alt+F10 and Control+K do in the text, and makes sure the AltGr key still types characters such as @. defaultExtensions already includes it.',
    signature: 'KvirnKeymap.configure({ inputRules })',
  },
]

const richTextIconNamesSignature = `import { richTextIconNames, RichTextEditor } from '@kvirn/rich-text'
import type { RichTextIconName } from '@kvirn/rich-text'

richTextIconNames: readonly RichTextIconName[]   // frozen
// 'undo' 'redo' 'bold' 'italic' 'underline' 'strike' 'code' 'bullet-list' 'numbered-list'
// 'indent' 'outdent' 'link' 'image' 'table' 'clear-formatting' 'heading-2' … 'heading-6'

<RichTextEditor.Icon name={name} />                // a built-in icon
<RichTextEditor.Icon paths={paths} mirrorInRtl? /> // your own drawing`

const richTextIconNamesExample = `import { RichTextEditor } from '@kvirn/rich-text'

// A hash sign, drawn on a 24 by 24 grid: four lines.
const hashPaths = ['M5 9h14', 'M5 15h14', 'M10 4 8 20', 'M16 4l-2 16']

<RichTextEditor.CommandButton
  label="Insert case reference"
  icon={<RichTextEditor.Icon paths={hashPaths} />}
  onPress={insertCaseReference} // (editor) => void, your own command
/>`

const listItemSignature = `import {
  indentListItem,
  outdentListItem,
  canIndentListItem,
  canOutdentListItem,
} from '@kvirn/rich-text'

indentListItem(editor: Editor): number | undefined    // the new level, from 1
outdentListItem(editor: Editor): number | undefined   // the new level, from 1
canIndentListItem(editor: Editor): boolean
canOutdentListItem(editor: Editor): boolean`

const listItemExample = `import { RichTextEditor, canIndentListItem, indentListItem } from '@kvirn/rich-text'
import { useAnnouncer } from '@kvirn/ui'

function IndentButton() {
  const { announce } = useAnnouncer()
  return (
    <RichTextEditor.CommandButton
      label="Indent list item"
      icon={<RichTextEditor.Icon name="indent" />}
      isAvailable={canIndentListItem}
      onPress={(editor) => {
        const level = indentListItem(editor)
        if (level !== undefined) {
          announce(\`Level \${level}\`) // say it in your page's language
        }
      }}
    />
  )
}`

export function HooksAndUtilitiesPage() {
  return (
    <PageWithContents
      title="Hooks and utilities"
      lead="Every hook and helper of @kvirn/ui, @kvirn/map and @kvirn/rich-text that is not a component: what it is for, how to import it, its signature and an example."
      intro={
        <p>
          Everything from <code>@kvirn/ui</code>, <code>@kvirn/map</code> and{' '}
          <code>@kvirn/rich-text</code> runs in a client file, one that starts with{' '}
          <code>&apos;use client&apos;</code>. Only the helpers under{' '}
          <Link href="#server">Server rendering</Link> also work in a Server Component. A name that
          has its own page is listed here with one line and a link. The page it links to is the one
          to read.
        </p>
      }
      sections={[
        {
          id: 'provider',
          label: 'Provider, locale and theme',
          content: (
            <>
              <p>
                These read what <Link href="/foundation/kvirn-provider">KvirnProvider</Link> knows.
                Call them below the provider. Without a provider, the language is English, the text
                runs left to right and times are in UTC.
              </p>
              <CodeBlock code={providerImport} />
              <LinkedTable sectionId="provider" rows={providerRows} />
            </>
          ),
        },
        {
          id: 'focus',
          label: 'Focus, announcements and overlays',
          content: (
            <>
              <p>
                <em>Focus</em> is the part of the page that the keyboard acts on. A screen reader
                reads out a message sent to the shared live region. Each name in the first table is
                explained on its own page.
              </p>
              <CodeBlock code={focusImport} />
              <LinkedTable sectionId="focus" rows={focusRows} />
              <p>
                An overlay is a layer above the page, such as a popup or a tooltip. These are the
                shared parts that the overlay components are built on.
              </p>
              <CodeBlock code={overlaysImport} />
              <LinkedTable sectionId="focus" label="Overlays" rows={overlayRows} />
              <Entry
                id="create-tooltip-group"
                name="createTooltipGroup"
                purpose="Makes a group of tooltips that share a delay of their own. Once one tooltip has opened, the next opens at once, and only one tooltip of a group is open. By default every tooltip of the page shares one group."
                signature={tooltipGroupSignature}
                exampleIntro={
                  <>
                    The actions above a case list keep their own delay, apart from the help tooltips
                    lower on the page. See also{' '}
                    <Link href="/components/tooltip#icon-toolbar">the icon toolbar</Link>.
                  </>
                }
                example={tooltipGroupExample}
              />
            </>
          ),
        },
        {
          id: 'forms',
          label: 'Forms, masks and dates',
          content: (
            <>
              <p>
                A <em>mask</em> shapes what a person types into a text box, such as a postcode. A{' '}
                <em>check</em> tests a finished value when the form is sent. A mask never says a
                value is wrong, because the person may still be typing.
              </p>
              <CodeBlock code={formsImport} />
              <LinkedTable sectionId="forms" rows={formsRows} />
              <Entry
                id="masks"
                name="masks"
                purpose={
                  <>
                    Ready-made masks for a text box. Most of the time you pass a name to the{' '}
                    <code>mask</code> prop, such as <code>mask=&quot;postal-code&quot;</code>, and
                    need no import. Use <code>masks</code> when you want the explicit, typed form of
                    a mask.
                  </>
                }
                signature={masksSignature}
                exampleIntro="A postcode field in an address form."
                example={masksExample}
              />
              <Entry
                id="checks"
                name="checks"
                purpose="Tests a finished value: a personal identity number, an organisation number, an IBAN or a date. It gives the reason a value fails, so you can write an error that says how to fix it. A check never says that the person or the organisation exists."
                signature={checksSignature}
                exampleIntro="Checking a personal identity number when an application form is sent."
                example={checksExample}
              />
              <Note kind="reminder">
                Write the format and an example in a visible help text under every masked field. The
                mask shapes the value but does not say what the format is (3.3.2 Labels or
                Instructions).
              </Note>
              <p>
                A date can be written in three boxes (a day, a month and a year), in one masked text
                field, or chosen in a calendar. The calendar takes and gives an ISO date: text
                written <code>YYYY-MM-DD</code>. These four functions convert between the forms, so
                one value can drive the field and the calendar. They return an empty string while
                the date is partial or does not exist, such as 31 February.
              </p>
              <Entry
                id="date-helpers"
                name="Date helpers"
                isCode={false}
                purpose="Convert between the three boxes of DateInput, the text of a masked field and the ISO date that DatePicker uses."
                signature={datesSignature}
                exampleIntro={
                  <>
                    Booking a time: the person types the date or picks it. The full example is{' '}
                    <Link href="/components/date-input#with-picker">on the DateInput page</Link>,
                    and the one-field version is{' '}
                    <Link href="/components/date-picker#masked-field">on the DatePicker page</Link>.
                  </>
                }
                example={datesExample}
              />
            </>
          ),
        },
        {
          id: 'data',
          label: 'Lists, tables and waiting',
          content: (
            <>
              <CodeBlock code={dataImport} />
              <LinkedTable sectionId="data" rows={dataRows} />
              <Entry
                id="create-locale-sort-fn"
                name="createLocaleSortFn"
                purpose={
                  <>
                    A sort function for a table that orders text the way people in a language
                    expect. In Swedish, Finnish and Norwegian, some letters come after z, and the
                    default sort functions get that wrong. Case is ignored, and numbers inside text
                    sort by value, so “Case 2” comes before “Case 10”. A missing value sorts first.
                  </>
                }
                signature={localeSortSignature}
                exampleIntro={
                  <>
                    A list of applicants sorted by name in Swedish. See also{' '}
                    <Link href="/components/table#sortable">the sortable table</Link>.
                  </>
                }
                example={localeSortExample}
              />
            </>
          ),
        },
        {
          id: 'icons',
          label: 'Icons',
          content: (
            <>
              <p>
                The icon helpers are explained with the icons themselves, on{' '}
                <Link href="/foundation/icons">the Icons page</Link>.
              </p>
              <ul>
                <li>
                  <code>defineIcons</code> registers the icons you use once, in the provider.
                </li>
                <li>
                  <code>useIconLabel</code> gives the translated label of an icon that stands alone.
                </li>
                <li>
                  <code>useIcon</code> is the hook of the <Link href="/components/icon">Icon</Link>{' '}
                  component.
                </li>
              </ul>
            </>
          ),
        },
        {
          id: 'server',
          label: 'Server rendering',
          content: (
            <>
              <p>
                <code>@kvirn/ui/server</code> is a separate import path with no client JavaScript.
                Use it in a Server Component, where a hook cannot run. How the server and the
                browser work together is on the <Link href="/foundation/rendering">Rendering</Link>{' '}
                page.
              </p>
              <CodeBlock code={serverImport} />
              <Entry
                id="create-message-format"
                name="createMessageFormat"
                purpose={
                  <>
                    The formatter behind <code>useFormat</code>, for a place where no hook can run.
                    It writes numbers, dates, lists and plural forms the way a language writes them.
                    A text such as <code>2026-10-04</code> is a calendar date and is shown on its
                    own day. A <code>Date</code> is a moment, shown in the time zone you give.
                  </>
                }
                signature={messageFormatSignature}
                exampleIntro="The date a case was received, written for a Swedish page."
                example={messageFormatExample}
              />
              <Entry
                id="get-locale-props"
                name="getLocaleProps"
                purpose={
                  <>
                    The <code>lang</code> and <code>dir</code> for the <code>&lt;html&gt;</code>{' '}
                    element, the same pair the provider works out for the locale (3.1.1 Language of
                    Page). If you set the provider’s <code>dir</code> yourself, write{' '}
                    <code>dir</code> on <code>&lt;html&gt;</code> yourself as well.
                  </>
                }
                signature={localePropsSignature}
                exampleIntro="The root layout of a Finnish public service."
                example={localePropsExample}
              />
              <Entry
                id="get-messages"
                name="getMessages"
                purpose="Gives the texts of one part, such as the Copy button, in a Server Component. It works like the texts a hook reads: your catalog first, then built-in English."
                signature={getMessagesSignature}
                exampleIntro="A Swedish label in a Server Component."
                example={getMessagesExample}
              />
              <Entry
                id="server-theme-script"
                name="KvirnThemeScript"
                purpose={
                  <>
                    A small script for the <code>&lt;head&gt;</code> that sets the colour scheme,
                    the contrast and the motion on <code>&lt;html&gt;</code> before the first paint,
                    so there is no flash of the wrong theme. This server version has no hook and
                    sends no client JavaScript. Put <code>suppressHydrationWarning</code> on{' '}
                    <code>&lt;html&gt;</code>. More on{' '}
                    <Link href="/foundation/rendering#first-paint">the Rendering page</Link>.
                  </>
                }
                signature={themeScriptSignature}
                exampleIntro="The head of the root layout."
                example={themeScriptExample}
              />
            </>
          ),
        },
        {
          id: 'own-markup',
          label: 'Building your own markup',
          content: (
            <>
              <p>
                Every component also has a hook with the matching name, such as{' '}
                <code>useButton</code> or <code>useTabs</code>. It returns props objects that you
                spread on your own elements. Each hook is under API on the page of its{' '}
                <Link href="/components">component</Link>.
              </p>
              <Entry
                id="merge-props"
                name="mergeProps"
                purpose={
                  <>
                    Merges prop objects for one element, from left to right. Event handlers run one
                    after the other, class names are joined, styles are merged and refs all get the
                    element. For any other prop the later value wins, and <code>undefined</code>{' '}
                    never replaces a value. Two different <code>id</code>s give a warning in
                    development, because a label that points at the first one would point at
                    nothing.
                  </>
                }
                signature={mergePropsSignature}
                exampleIntro="Adding your own class to a button without losing the library’s."
                example={mergePropsExample}
              />
            </>
          ),
        },
        {
          id: 'map',
          label: 'Map',
          content: (
            <>
              <p>
                <code>@kvirn/map</code> is a separate package. It draws no map by itself: you give
                the Map a provider (the engine) and your places. The{' '}
                <Link href="/components/map">Map</Link> and{' '}
                <Link href="/components/address-search">AddressSearch</Link> pages explain the
                hooks. <code>mapIcons</code> has no page of its own, so it is explained here.
              </p>
              <CodeBlock code={mapImport} />
              <LinkedTable sectionId="map" rows={mapRows} />
              <Entry
                id="map-icons"
                name="mapIcons"
                purpose={
                  <>
                    The names and drawings of the icons the Map uses, for the <code>icons</code> of{' '}
                    <code>KvirnProvider</code>. The Map looks each icon up by its name, so when you
                    register a name, every Map in the app draws your icon instead.{' '}
                    <code>mapIcons</code> lists every icon the Map and AddressSearch draw. The{' '}
                    <Link href="/components/icon#package-sets">Icon page</Link> shows how to
                    register icons with <code>defineIcons</code> and draw them by name.
                  </>
                }
                signature={mapIconsSignature}
                exampleIntro="A municipality gives its map its own pin. Registering marker replaces the default pin on every place and the pin of an address search result. A Map.Markers with children of its own draws those instead."
                example={mapIconsExample}
              >
                <Note kind="reminder">
                  A pin you draw is a shape on the map. Give it at least 3:1 contrast against the
                  map (1.4.11 Non-text Contrast) and use system colours in forced colours. The icon
                  is decoration, so the marker is still named from its place.
                </Note>
              </Entry>
            </>
          ),
        },
        {
          id: 'rich-text',
          label: 'Rich text',
          content: (
            <>
              <p>
                <code>@kvirn/rich-text</code> builds on Tiptap, which you install yourself. The{' '}
                <Link href="/components/rich-text-editor">RichTextEditor</Link> page lists the
                packages and explains most of these names. The two entries below have no page of
                their own.
              </p>
              <CodeBlock code={richTextImport} />
              <LinkedTable sectionId="rich-text" rows={richTextRows} />
              <Entry
                id="rich-text-icon-names"
                name="richTextIconNames"
                purpose={
                  <>
                    The names of the icons the editor’s toolbar can draw, for{' '}
                    <code>RichTextEditor.Icon</code> (also exported as <code>ToolbarIcon</code>).
                    Register one of these names in <code>KvirnProvider</code> (<code>bold</code>,
                    say) and the toolbar draws your icon in its place. To use another icon on one
                    control, give the control your own <code>icon</code>.{' '}
                    <code>RichTextEditor.Icon</code> draws path data of your own too. The icon is
                    decoration: the control’s <code>label</code> names it.
                  </>
                }
                signature={richTextIconNamesSignature}
                exampleIntro="A button of your own in the toolbar, with a drawing of its own."
                example={richTextIconNamesExample}
              />
              <Entry
                id="list-item-commands"
                name="List item commands"
                isCode={false}
                purpose={
                  <>
                    Four functions that take the Tiptap editor. <code>indentListItem</code> moves
                    the list item at the caret in under the item above it, as Tab does, and returns
                    its new level, counted from 1. <code>outdentListItem</code> moves a nested item
                    out one level, as Shift+Tab does, and never takes a top-level item out of its
                    list. Both return <code>undefined</code> when they cannot act. The two{' '}
                    <code>can…</code> functions say whether that is possible now, so a button can be
                    unavailable instead of doing nothing. <code>KvirnKeymap</code> uses them for Tab
                    and the toolbar uses them for its indent buttons.
                  </>
                }
                signature={listItemSignature}
                exampleIntro="An indent button of your own, in a toolbar of your own."
                example={listItemExample}
              >
                <Note kind="reminder">
                  A button of your own that changes the list level should say the new level, as the
                  toolbar’s buttons do. Without it, a screen reader user hears nothing when they
                  press it (4.1.3 Status Messages).
                </Note>
              </Entry>
            </>
          ),
        },
      ]}
    />
  )
}
