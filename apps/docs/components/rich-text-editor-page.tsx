import { Link } from '@kvirn-ui/react'
import { ApiBlock } from './api-block.tsx'
import type { ApiPart } from './api-block.tsx'
import { CodeBlock } from './code-block.tsx'
import { ComponentPage } from './component-page.tsx'
import { ContractSectionsView, contractSectionList } from './contract-sections-view.tsx'
import { ExampleFrame } from './example-frame.tsx'
import { Note } from './note.tsx'
import { StringsBlock } from './strings-block.tsx'
import { UseCase } from './use-case.tsx'
import {
  commandButtonRows,
  commandToggleRows,
  contentAttributes,
  contentRows,
  defaultControlsRows,
  defaultExtensionsRows,
  groupRows,
  iconAttributes,
  iconRows,
  rootAttributes,
  rootRows,
  toolbarAttributes,
  toolbarRows,
  useRichTextEditorHook,
} from '../content/rich-text-editor.api.ts'
import { CountedSummary } from '../examples/rich-text-editor/character-count.tsx'
import { ControlledCaseNote } from '../examples/rich-text-editor/controlled.tsx'
import { DefaultRichTextEditor } from '../examples/rich-text-editor/default.tsx'
import { InAForm } from '../examples/rich-text-editor/in-a-form.tsx'
import { OwnToolbar } from '../examples/rich-text-editor/own-toolbar.tsx'
import { SmallToolbar } from '../examples/rich-text-editor/small-toolbar.tsx'
import { WithoutTablesAndImages } from '../examples/rich-text-editor/without-tables-and-images.tsx'
import type { Contract } from '../lib/contract-parser.ts'

export type RichTextEditorExampleSources = Record<
  | 'default'
  | 'in-a-form'
  | 'controlled'
  | 'small-toolbar'
  | 'character-count'
  | 'without-tables-and-images'
  | 'own-toolbar',
  string
>

const installLines = `pnpm add @kvirn-ui/rich-text
pnpm add @tiptap/core @tiptap/pm @tiptap/react @tiptap/starter-kit @tiptap/extension-table @tiptap/extension-image @tiptap/extensions`

const helperRows = {
  isAllowedLinkAddress: {
    type: '(address: string, protocols?) => boolean',
    default: '–',
    description:
      'Whether a link address is relative or uses an allowed scheme: https, http, mailto and tel, or the protocols you pass. Never javascript:, data: or ftp:.',
  },
  isAllowedImageSource: {
    type: '(source, { sources, allowBase64, baseUrl }?) => boolean',
    default: '–',
    description:
      'Whether an image address may be used: relative, or https or http from the page’s own origin or an origin you list. It reads the page’s address when it is called, never when it is imported.',
  },
  isDocumentEmpty: {
    type: '(document: Node) => boolean',
    default: '–',
    description:
      'Whether a Tiptap document has nothing to read: no text, and no image or table. An empty paragraph, heading or list item is empty.',
  },
  describeShortcut: {
    type: '(chords: readonly string[], isMac: boolean) => DescribedShortcut',
    default: '–',
    description:
      'A shortcut written as Tiptap writes it (Mod-b), ready for aria-keyshortcuts and for a tooltip: ariaKeyShortcuts, keys and text. Key names are not translated.',
  },
  getRichTextFeatures: {
    type: '(extensions: Extensions) => RichTextFeatures',
    default: '–',
    description:
      'What an array of extensions lets the text contain, read without making an editor.',
  },
  useRichTextEditorContext: {
    type: '() => RichTextEditorContextValue',
    default: '–',
    description:
      'The editor’s state and Tiptap’s editor, for a part of your own inside a RichTextEditor.Root. It throws outside one.',
  },
  KvirnKeymap: {
    type: 'Extension',
    default: '–',
    description:
      'The extension that decides Tab, Escape, Alt+F10, Control+K and the AltGr guard. It is part of defaultExtensions(). canIndentListItem, canOutdentListItem, indentListItem and outdentListItem are exported with it.',
  },
} as const

const parts: ApiPart[] = [
  {
    name: 'RichTextEditor.Root',
    renders: (
      <>
        <code>&lt;div class=&quot;kv-rich-text&quot;&gt;</code>, the box around the toolbar and the
        text, then the character count and a hidden <code>&lt;input&gt;</code> that sends the value
        under <code>name</code>. It creates the Tiptap editor and wires it to its Field. It takes
        every attribute of a <code>&lt;div&gt;</code>. Also exported as{' '}
        <code>RichTextEditorRoot</code>. The default theme is described on{' '}
        <Link href="/foundation/theming">Theming</Link>.
      </>
    ),
    props: rootRows,
    attributes: rootAttributes,
  },
  {
    name: 'RichTextEditor.Toolbar',
    renders: (
      <>
        A <code>toolbar</code> (the <Link href="/components/toolbar">Toolbar</Link>) attached to the
        top of the box, with one Tab stop and the arrow keys between its controls. It wraps group by
        group on a narrow screen. It is not rendered while the editor is read-only. It also takes
        the props of <code>Toolbar.Root</code>. Also exported as <code>RichTextEditorToolbar</code>.
      </>
    ),
    props: toolbarRows,
    attributes: toolbarAttributes,
  },
  {
    name: 'RichTextEditor.DefaultControls',
    renders: (
      <>
        The default groups, in this order: undo and redo, the text type, text style, lists, link,
        image and table, clear formatting, and the table group while the text has a table. A control
        the extensions don’t provide is left out.
      </>
    ),
    props: defaultControlsRows,
  },
  {
    name: 'RichTextEditor.Group',
    renders: (
      <>
        A <code>role=&quot;group&quot;</code> of controls (a <code>ButtonGroup</code>). Also
        exported as <code>RichTextEditorGroup</code>.
      </>
    ),
    props: groupRows,
  },
  {
    name: 'RichTextEditor.CommandButton',
    renders: (
      <>
        A <code>&lt;button&gt;</code> that runs a command with Tiptap’s editor. It has a tooltip
        when it shows only an icon. It also takes the props of <code>Toolbar.Button</code>.
      </>
    ),
    props: commandButtonRows,
  },
  {
    name: 'RichTextEditor.CommandToggle',
    renders: (
      <>
        A <code>&lt;button&gt;</code> with <code>aria-pressed</code> that turns a format on or off.
        It also takes the props of <code>Toolbar.Toggle</code>, except the ones that hold its state.
      </>
    ),
    props: commandToggleRows,
  },
  {
    name: 'RichTextEditor.BlockFormat, LinkControl, ImageControl, TableControls',
    renders: (
      <>
        The default controls on their own, for a toolbar you build: the text type picker, the Link
        button and its form, the Image button and its form, and the table group. They take no props.
      </>
    ),
  },
  {
    name: 'RichTextEditor.Icon',
    renders: (
      <>
        An <code>&lt;svg&gt;</code> with <code>aria-hidden</code> that takes the control’s text
        colour. Also exported as <code>ToolbarIcon</code>.
      </>
    ),
    props: iconRows,
    attributes: iconAttributes,
  },
  {
    name: 'RichTextEditor.Content',
    renders: (
      <>
        Tiptap’s <code>EditorContent</code>, around the editable text. The editable text is a{' '}
        <code>textbox</code> with <code>aria-multiline</code>. It is created after the first render,
        so the server renders only the box. Also exported as <code>RichTextEditorContent</code>.
      </>
    ),
    props: contentRows,
    attributes: contentAttributes,
  },
  {
    name: 'defaultExtensions',
    renders: (
      <>
        nothing: it is a function, <code>defaultExtensions(options)</code>, that returns the
        extensions a KvirnUI editor starts with. Spread it into your own list. Keep the array in a
        constant or <code>useMemo</code>. These are its options.
      </>
    ),
    props: defaultExtensionsRows,
  },
  {
    name: 'Helper functions',
    renders: 'nothing: these are functions you import.',
    props: helperRows,
  },
]

export function RichTextEditorPage({
  contract,
  sources,
}: {
  contract: Contract
  sources: RichTextEditorExampleSources
}) {
  return (
    <ComponentPage
      title="RichTextEditor"
      lead="Its output is not sanitized: clean it on your server before you store or publish it."
      status="alpha-candidate"
      packageName="@kvirn-ui/rich-text"
      pattern="APG Toolbar (above a multi-line text)"
      whenToUse={
        <ul>
          <li>
            Use it for text that will be published or sent and needs headings, lists or links: a
            news item, a case description in a staff tool, an association’s event text.
          </li>
          <li>
            Put it in a <Link href="/components/field">Field</Link> with a visible label. The
            Field’s label names the editable text, and its description, help text and error describe
            it.
          </li>
          <li>
            Not for a plain answer in a resident’s own words: use a{' '}
            <Link href="/components/textarea">Textarea</Link>. Residents rarely need formatting, and
            an editor is heavier to use with a keyboard and a screen reader. Not for showing saved
            text: render it as <Link href="/components/prose">Prose</Link>.
          </li>
          <li>
            It is its own package, <code>@kvirn-ui/rich-text</code>, built on Tiptap. Tiptap is a
            peer: you install it yourself, once, so your app has one copy. The install lines are in
            the <Link href="#api">API reference</Link>.
          </li>
        </ul>
      }
      example={
        <ExampleFrame headingId="example" code={sources['default']}>
          <DefaultRichTextEditor />
        </ExampleFrame>
      }
      useCases={
        <>
          <UseCase
            id="news-item"
            title="A news item sent with a form"
            why={
              <>
                An editor writes a news item for the municipality’s website. The form sends the text
                under <code>name</code>, and a form reset goes back to <code>defaultValue</code>. An
                empty editor sends an empty string, never an empty paragraph, so a required field
                works. Your form checks the text and sets <code>invalid</code>, and the{' '}
                <Link href="/components/error-summary">ErrorSummary</Link> links to the editor.
              </>
            }
            code={sources['in-a-form']}
            propsUsed={[
              { part: 'RichTextEditor.Root', prop: 'name' },
              { part: 'RichTextEditor.Root', prop: 'defaultValue' },
            ]}
            note={
              <Note kind="tip">
                The form sends the HTML as it is. The editor never sanitizes it: clean it on your
                server before you store or publish it, and take any <code>target</code> off links.
              </Note>
            }
          >
            <InAForm />
          </UseCase>
          <UseCase
            id="case-note"
            title="A case note that your own state holds"
            why={
              <>
                A caseworker writes a note, and your code keeps the value, for example in your form
                library or as a draft. Use the JSON format, pass <code>value</code> and{' '}
                <code>onValueChange</code>, and set a new value when your code needs to change the
                text. An empty note is <code>null</code>.
              </>
            }
            code={sources['controlled']}
            propsUsed={[
              { part: 'RichTextEditor.Root', prop: 'format' },
              { part: 'RichTextEditor.Root', prop: 'value' },
              { part: 'RichTextEditor.Root', prop: 'onValueChange' },
            ]}
            note={
              <Note kind="tip">
                The editor says nothing aloud when your code sets the text. Say what happened in
                words, as the line under the buttons does. In a staff tool, save drafts and warn
                before a session ends (2.2.1 Timing Adjustable).
              </Note>
            }
          >
            <ControlledCaseNote />
          </UseCase>
          <UseCase
            id="event-text"
            title="A short toolbar for people who write once"
            why={
              <>
                An association describes its event for the municipality’s calendar. A smaller
                toolbar, with the name of each control beside its icon, is quicker to take in. Pick
                the controls with <code>include</code> and show the names with <code>labels</code>.
              </>
            }
            code={sources['small-toolbar']}
            propsUsed={[
              { part: 'RichTextEditor.Root', prop: 'labels' },
              { part: 'RichTextEditor.DefaultControls', prop: 'include' },
            ]}
            note={
              <Note kind="tip">
                Touch screens have no tooltips, so show the names. A full toolbar that wraps is
                about 200 pixels tall at a width of 320 pixels, and a short one leaves more room for
                the text.
              </Note>
            }
          >
            <SmallToolbar />
          </UseCase>
          <UseCase
            id="character-limit"
            title="A text with a limit"
            why="A short description is shown in a list, and your form accepts at most 200 characters. The count says so before the user gets there, then how many are left, then how many are over. It counts the text a reader sees, not the HTML."
            code={sources['character-count']}
            propsUsed={[
              { part: 'RichTextEditor.Root', prop: 'characterCount' },
              { part: 'RichTextEditor.Root', prop: 'maxLength' },
            ]}
            note={
              <Note kind="tip">
                Going over the limit is a warning, not an error: the count never blocks typing, so
                your form decides on submit. The count is announced politely from 80% of the limit
                and when it is crossed, and only while the text has focus.
              </Note>
            }
          >
            <CountedSummary />
          </UseCase>
          <UseCase
            id="text-only"
            title="Text and lists only"
            why={
              <>
                A service notice has room for text, not for a table or a picture. Turn tables and
                images off in <code>defaultExtensions</code>, and their buttons and the table group
                go with them. Keep the array in a constant, because Tiptap reads it once.
              </>
            }
            code={sources['without-tables-and-images']}
            propsUsed={[
              { part: 'RichTextEditor.Root', prop: 'extensions' },
              { part: 'defaultExtensions', prop: 'table' },
              { part: 'defaultExtensions', prop: 'image' },
            ]}
          >
            <WithoutTablesAndImages />
          </UseCase>
          <UseCase
            id="own-button"
            title="A button of your own"
            why={
              <>
                An editor writes the contact details for a service page, with the address on
                separate lines. A touch screen usually has no Shift+Enter, so add a group of your
                own to the toolbar, with a button that runs a Tiptap command.{' '}
                <code>isAvailable</code> says when it can run, and <code>onPress</code> gets
                Tiptap’s editor.
              </>
            }
            code={sources['own-toolbar']}
            propsUsed={[
              { part: 'RichTextEditor.Group', prop: 'aria-label' },
              { part: 'RichTextEditor.CommandButton', prop: 'label' },
              { part: 'RichTextEditor.CommandButton', prop: 'isAvailable' },
              { part: 'RichTextEditor.CommandButton', prop: 'onPress' },
            ]}
            note={
              <Note kind="reminder">
                Give every control a name, and every group in a toolbar a name too (4.1.2 Name,
                Role, Value). Without them a screen reader user hears only “button” or “group”.
              </Note>
            }
          >
            <OwnToolbar />
          </UseCase>
        </>
      }
      contract={
        <ContractSectionsView
          contract={contract}
          messageNamespace="richText"
          linkToStrings
          notes={{
            'what-you-need-to-do': (
              <Note kind="reminder">
                Put the editor in a Field with a label, or give <code>RichTextEditor.Content</code>{' '}
                an <code>aria-label</code>. Without a name a screen reader user hears only that
                there is a text box (4.1.2 Name, Role, Value).
              </Note>
            ),
            testing: (
              <Note kind="tip">
                A row passes only with both an agent check and a human check. Screen reader support
                for an editable text varies, so test with the assistive technology your staff use
                before you roll the editor out.
              </Note>
            ),
            keyboard: (
              <Note kind="tip">
                You don’t need to teach a way out of the editor. Tab and Shift+Tab leave it after
                nesting or moving between table cells where they can, and Alt+F10 goes from the text
                to the toolbar (2.1.2 No Keyboard Trap).
              </Note>
            ),
            'known-issues': (
              <Note kind="tip">
                If an issue here affects your service, list it in your accessibility statement with
                its workaround.
              </Note>
            ),
          }}
        />
      }
      contractSections={contractSectionList(contract)}
      api={
        <>
          <p>
            The package needs Tiptap, which it is built on. Install both, once, so your app has one
            copy of ProseMirror (the library under Tiptap).
          </p>
          <CodeBlock language="bash" code={installLines} />
          <ApiBlock
            importLine="import { RichTextEditor, defaultExtensions, useRichTextEditor } from '@kvirn-ui/rich-text'"
            parts={parts}
            hook={useRichTextEditorHook}
            strings={
              <StringsBlock
                namespace="richText"
                component="RichTextEditor"
                keys={[
                  {
                    key: 'toolbar',
                    meaning:
                      'The first part of the toolbar’s name, then the Field’s label. It is visually hidden.',
                  },
                  {
                    key: 'blockType',
                    meaning: 'The name of the picker that sets the type of the text.',
                  },
                  {
                    key: 'bold',
                    meaning:
                      'The name of the Bold control and the first line of its tooltip. Every control has a key like it.',
                  },
                  {
                    key: 'link',
                    meaning: 'The name of the Link button, which opens the link form.',
                  },
                  {
                    key: 'linkUrlInvalid',
                    meaning: 'The error in the link form when the web address can’t be used.',
                  },
                  {
                    key: 'imageAlt',
                    meaning: 'The label of the description field in the image form.',
                  },
                  {
                    key: 'imageAltMissing',
                    meaning:
                      'The error when an image has no description and is not marked as decoration.',
                  },
                  {
                    key: 'imageUrlNotAllowed',
                    meaning: 'The error when the image’s address is outside the allowed sources.',
                  },
                  { key: 'linkAdded', meaning: 'Announced when a link is added.' },
                  {
                    key: 'tableInserted',
                    meaning: 'Announced when a table is inserted.',
                    values: { columns: 3, rows: 3 },
                  },
                  {
                    key: 'tableDeleted',
                    meaning: 'Announced when a table is deleted, with how to undo it.',
                    values: { shortcut: 'Ctrl+Z' },
                  },
                  {
                    key: 'listLevel',
                    meaning:
                      'Announced when a list item is nested or outdented, with its new level.',
                    values: { level: 2 },
                  },
                  {
                    key: 'formatOn',
                    meaning:
                      'Announced when a keyboard shortcut turns bold, italic or underline on. formatOff says it is off.',
                    values: { name: 'Bold' },
                  },
                ]}
              />
            }
          />
        </>
      }
    />
  )
}
