import { Button, Field } from '@kvirn-ui/react'
import { defaultExtensions, RichTextEditor } from '@kvirn-ui/rich-text'
import { Mark } from '@tiptap/core'
import type { JSONContent } from '@tiptap/core'
import { useState } from 'react'
import { textsFor } from '../form/form.fixture.tsx'
import type { FormLocale } from '../form/form.fixture.tsx'

// Fixtures for Components/Form/Rich text editor. Each exported function is one example, written to
// be read: the stories show its source as "Show code" (`showSource`). The texts are fixture text
// in the resident's or case worker's language, so they are plain strings here, where an app would
// take them from its translations. The library's own strings (the toolbar's names, the instruction
// under the box) follow the locale toolbar through the provider. KvirnUI holds no form state and
// the editor's output is never sanitized: a real app sanitizes it on the server.

export interface EditorTexts {
  label: string
  description: string
  hint: string
  error: string
  intro: string
  itemOne: string
  itemTwo: string
  closing: string
  /** The four cells of a two by two table. */
  cells: [string, string, string, string]
  before: string
  after: string
  /** A long Finnish-style compound for the 320px check. */
  long: string
  highlight: string
  highlightGroup: string
  clearHighlight: string
  reset: string
}

const textsEn: EditorTexts = {
  label: 'News text',
  description: 'The text is published on the municipality’s website.',
  hint: 'Write about something that is happening in the municipality.',
  error: 'Write the news text',
  intro: 'The library opens late on Thursdays.',
  itemOne: 'Opening hours',
  itemTwo: 'Borrowing',
  closing: 'Welcome in.',
  cells: ['Day', 'Opens', 'Thursday', '10:00'],
  before: 'Before',
  after: 'After',
  long: 'Housing adaptation grant application for a household with a disabled member',
  highlight: 'Highlight',
  highlightGroup: 'Highlighting',
  clearHighlight: 'Remove highlight',
  reset: 'Reset',
}

const textsSv: EditorTexts = {
  label: 'Nyhetstext',
  description: 'Texten publiceras på kommunens webbplats.',
  hint: 'Skriv om något som händer i kommunen.',
  error: 'Skriv nyhetstexten',
  intro: 'Biblioteket har öppet längre på torsdagar.',
  itemOne: 'Öppettider',
  itemTwo: 'Lån',
  closing: 'Välkommen in.',
  cells: ['Dag', 'Öppnar', 'Torsdag', '10:00'],
  before: 'Före',
  after: 'Efter',
  long: 'Ansökan om bostadsanpassningsbidrag för hushåll med funktionsnedsatt familjemedlem',
  highlight: 'Markera',
  highlightGroup: 'Markering',
  clearHighlight: 'Ta bort markering',
  reset: 'Återställ',
}

/** Designer drafts for length checks, to be reviewed by a native speaker. */
const textsFi: EditorTexts = {
  label: 'Uutisteksti',
  description: 'Teksti julkaistaan kunnan verkkosivuilla.',
  hint: 'Kirjoita jostakin, mitä kunnassa tapahtuu.',
  error: 'Kirjoita uutisteksti',
  intro: 'Kirjasto on torstaisin auki pidempään.',
  itemOne: 'Aukioloajat',
  itemTwo: 'Lainaus',
  closing: 'Tervetuloa.',
  cells: ['Päivä', 'Avautuu', 'Torstai', '10:00'],
  before: 'Ennen',
  after: 'Jälkeen',
  long: 'Asunnonmuutostyöavustushakemus vammaisen perheenjäsenen kotitaloudelle ja asumisoikeusasuntoon',
  highlight: 'Korosta',
  highlightGroup: 'Korostus',
  clearHighlight: 'Poista korostus',
  reset: 'Tyhjennä',
}

const textsNb: EditorTexts = {
  label: 'Nyhetstekst',
  description: 'Teksten publiseres på kommunens nettsted.',
  hint: 'Skriv om noe som skjer i kommunen.',
  error: 'Skriv nyhetsteksten',
  intro: 'Biblioteket har åpent lenger på torsdager.',
  itemOne: 'Åpningstider',
  itemTwo: 'Utlån',
  closing: 'Velkommen inn.',
  cells: ['Dag', 'Åpner', 'Torsdag', '10:00'],
  before: 'Før',
  after: 'Etter',
  long: 'Søknad om tilskudd til tilpasning av bolig for husholdning med funksjonshemmet familiemedlem',
  highlight: 'Marker',
  highlightGroup: 'Markering',
  clearHighlight: 'Fjern markering',
  reset: 'Tilbakestill',
}

const textsNn: EditorTexts = {
  label: 'Nyheitstekst',
  description: 'Teksten blir publisert på nettstaden til kommunen.',
  hint: 'Skriv om noko som skjer i kommunen.',
  error: 'Skriv nyheitsteksten',
  intro: 'Biblioteket har ope lenger på torsdagar.',
  itemOne: 'Opningstider',
  itemTwo: 'Utlån',
  closing: 'Velkomen inn.',
  cells: ['Dag', 'Opnar', 'Torsdag', '10:00'],
  before: 'Før',
  after: 'Etter',
  long: 'Søknad om tilskot til tilpassing av bustad for husstand med funksjonshemma familiemedlem',
  highlight: 'Marker',
  highlightGroup: 'Markering',
  clearHighlight: 'Fjern markering',
  reset: 'Tilbakestill',
}

const editorTexts: Record<FormLocale, EditorTexts | undefined> = {
  sv: textsSv,
  fi: textsFi,
  nb: textsNb,
  nn: textsNn,
  se: undefined,
  en: textsEn,
}

/** The fixture text in a locale, or the English text with `lang="en"` for se (3.1.2). */
export function editorTextsFor(locale: FormLocale): { text: EditorTexts; lang: 'en' | undefined } {
  const text = editorTexts[locale]
  return { text: text ?? textsEn, lang: text === undefined ? 'en' : undefined }
}

/** Arabic, to show a right-to-left paragraph inside a left-to-right page and back. */
export const arabicParagraph = 'تفتح المكتبة لوقت أطول أيام الخميس.'

/** A document with a paragraph, a list, a table and a closing paragraph: what the keys act on. */
export function contentFor(text: EditorTexts): string {
  const [first, second, third, fourth] = text.cells
  return (
    `<p>${text.intro}</p>` +
    `<ul><li><p>${text.itemOne}</p></li><li><p>${text.itemTwo}</p></li></ul>` +
    `<table><tbody><tr><th><p>${first}</p></th><th><p>${second}</p></th></tr>` +
    `<tr><td><p>${third}</p></td><td><p>${fourth}</p></td></tr></tbody></table>` +
    `<p>${text.closing}</p>`
  )
}

// Extensions are read when Tiptap creates the editor: keep them in a constant.
const withoutTablesAndImages = defaultExtensions({ table: false, image: false })

/** A mark of your own, added with the ordinary Tiptap API: the toolbar needs no fork to show it. */
const Highlight = Mark.create({
  name: 'highlight',
  parseHTML: () => [{ tag: 'mark' }],
  renderHTML: () => ['mark', 0],
  addCommands() {
    return {
      toggleHighlight:
        () =>
        ({ commands }) =>
          commands.toggleMark('highlight'),
    }
  },
})

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    highlight: {
      toggleHighlight: () => ReturnType
    }
  }
}

const extensionsWithHighlight = [...defaultExtensions(), Highlight]

const highlightPaths = ['M4 19.5h16', 'M7 15.5 15.5 7l3 3L10 18.5H7Z', 'M14 8.5l3 3']

/**
 * A button before the editor, the editor with a paragraph, a list and a table, a button after it,
 * and a counter: the fixture the keyboard tests drive. The editor is in a plain `<form>`.
 */
export function KeyboardEditor({ locale }: { locale: FormLocale }) {
  const { text, lang } = editorTextsFor(locale)
  return (
    <form
      className="kv-story-form"
      lang={lang}
      noValidate
      onSubmit={(event) => event.preventDefault()}
    >
      <button type="button" className="kv-button">
        {text.before}
      </button>
      <Field.Root required>
        <Field.Label>{text.label}</Field.Label>
        <RichTextEditor.Root name="news" defaultValue={contentFor(text)}>
          <RichTextEditor.Toolbar />
          <RichTextEditor.Content />
        </RichTextEditor.Root>
      </Field.Root>
      <button type="button" className="kv-button">
        {text.after}
      </button>
    </form>
  )
}

/**
 * An editor in a plain `<form>`: the hidden input posts the HTML under `name`, and the form's reset
 * button goes back to the default value. The text shown under the form is what the form posts. It
 * is not sanitized: sanitize it on the server.
 */
export function PostedEditor({ locale }: { locale: FormLocale }) {
  const { text, lang } = editorTextsFor(locale)
  const formText = textsFor(locale).text
  const [posted, setPosted] = useState<string | undefined>()
  return (
    <form
      className="kv-story-form"
      lang={lang}
      noValidate
      onSubmit={(event) => {
        event.preventDefault()
        const news = new FormData(event.currentTarget).get('news')
        setPosted(typeof news === 'string' ? news : '')
      }}
      onReset={() => setPosted(undefined)}
    >
      <Field.Root required>
        <Field.Label>{text.label}</Field.Label>
        <RichTextEditor.Root name="news" defaultValue={`<p>${text.intro}</p>`}>
          <RichTextEditor.Toolbar />
          <RichTextEditor.Content />
        </RichTextEditor.Root>
      </Field.Root>
      <div className="kv-button-group">
        <Button type="submit" className="kv-button--primary">
          {formText.send}
        </Button>
        <Button type="reset">{text.reset}</Button>
      </div>
      {posted === undefined ? null : (
        <pre className="kv-story-form-output" data-testid="posted">
          {posted}
        </pre>
      )}
    </form>
  )
}

/** After a submit with nothing written: the Field is invalid, and its message says what to do. */
export function InvalidEditor({ locale }: { locale: FormLocale }) {
  const { text, lang } = editorTextsFor(locale)
  return (
    <Field.Root required invalid lang={lang}>
      <Field.Label>{text.label}</Field.Label>
      <Field.Prose>
        <p>{text.description}</p>
      </Field.Prose>
      <RichTextEditor.Root name="news">
        <RichTextEditor.Toolbar />
        <RichTextEditor.Content />
      </RichTextEditor.Root>
      <Field.HelpText>{text.hint}</Field.HelpText>
      <Field.ErrorMessage>{text.error}</Field.ErrorMessage>
    </Field.Root>
  )
}

/** Disabled: the box is dashed, every control is natively disabled and out of the Tab order, and nothing is posted. */
export function DisabledEditor({ locale }: { locale: FormLocale }) {
  const { text, lang } = editorTextsFor(locale)
  return (
    <Field.Root disabled lang={lang}>
      <Field.Label>{text.label}</Field.Label>
      <RichTextEditor.Root name="news" defaultValue={`<p>${text.intro}</p>`}>
        <RichTextEditor.Toolbar />
        <RichTextEditor.Content />
      </RichTextEditor.Root>
    </Field.Root>
  )
}

/**
 * Read-only: no toolbar and no instruction, because there is nothing to format and Tab works as
 * everywhere else. The text is focusable, selectable and copyable. To show saved text on a page
 * (not in a form), render it as `Prose` instead.
 */
export function ReadOnlyEditor({ locale }: { locale: FormLocale }) {
  const { text, lang } = editorTextsFor(locale)
  return (
    <Field.Root lang={lang}>
      <Field.Label>{text.label}</Field.Label>
      <RichTextEditor.Root readOnly defaultValue={contentFor(text)}>
        <RichTextEditor.Toolbar />
        <RichTextEditor.Content />
      </RichTextEditor.Root>
    </Field.Root>
  )
}

/**
 * Controlled, as Tiptap's JSON: the value lives in this `useState`, where your form library's state
 * would live. The editor reports each change through `onValueChange` and takes a new `value` when
 * you set one. An empty editor is `null`.
 */
export function ControlledJsonEditor({ locale }: { locale: FormLocale }) {
  const { text, lang } = editorTextsFor(locale)
  const [value, setValue] = useState<JSONContent | null>(null)
  return (
    <div className="kv-story-form" lang={lang}>
      <Field.Root required>
        <Field.Label>{text.label}</Field.Label>
        <RichTextEditor.Root format="json" value={value} onValueChange={setValue}>
          <RichTextEditor.Toolbar />
          <RichTextEditor.Content />
        </RichTextEditor.Root>
      </Field.Root>
      <pre className="kv-story-form-output" data-testid="json">
        {JSON.stringify(value)}
      </pre>
    </div>
  )
}

/**
 * A feature of your own with the ordinary Tiptap API: an extension (`Highlight`, a mark) next to
 * `defaultExtensions()`, and a `CommandToggle` in your own group of the toolbar. `isPressed` and
 * `onPress` get the Tiptap editor.
 */
export function HighlightEditor({ locale }: { locale: FormLocale }) {
  const { text, lang } = editorTextsFor(locale)
  return (
    <Field.Root lang={lang}>
      <Field.Label>{text.label}</Field.Label>
      <RichTextEditor.Root
        extensions={extensionsWithHighlight}
        defaultValue={`<p>${text.intro}</p>`}
      >
        <RichTextEditor.Toolbar>
          <RichTextEditor.DefaultControls exclude={['table', 'image']} />
          <RichTextEditor.Group aria-label={text.highlightGroup}>
            <RichTextEditor.CommandToggle
              label={text.highlight}
              icon={<RichTextEditor.Icon paths={highlightPaths} />}
              isPressed={(editor) => editor.isActive('highlight')}
              onPress={(editor) => {
                editor.chain().toggleHighlight().run()
              }}
            />
            <RichTextEditor.CommandButton
              label={text.clearHighlight}
              onPress={(editor) => {
                editor.chain().unsetMark('highlight').run()
              }}
            />
          </RichTextEditor.Group>
        </RichTextEditor.Toolbar>
        <RichTextEditor.Content />
      </RichTextEditor.Root>
    </Field.Root>
  )
}

/** No tables and no images: their buttons, the Table group and the table half of the instruction are gone. */
export function PlainEditor({ locale }: { locale: FormLocale }) {
  const { text, lang } = editorTextsFor(locale)
  return (
    <Field.Root lang={lang}>
      <Field.Label>{text.label}</Field.Label>
      <RichTextEditor.Root
        extensions={withoutTablesAndImages}
        defaultValue={`<p>${text.intro}</p>`}
      >
        <RichTextEditor.Toolbar />
        <RichTextEditor.Content />
      </RichTextEditor.Root>
    </Field.Root>
  )
}

/**
 * A small toolbar for a resident-facing editor, with the names visible (`labels="icon-and-text"`):
 * touch screens have no tooltips, and nobody has to guess an icon.
 */
export function ResidentEditor({ locale }: { locale: FormLocale }) {
  const { text, lang } = editorTextsFor(locale)
  return (
    <Field.Root lang={lang}>
      <Field.Label>{text.label}</Field.Label>
      <RichTextEditor.Root labels="icon-and-text" defaultValue={`<p>${text.intro}</p>`}>
        <RichTextEditor.Toolbar>
          <RichTextEditor.DefaultControls
            include={['bold', 'italic', 'bulletList', 'orderedList', 'indent', 'outdent', 'link']}
          />
        </RichTextEditor.Toolbar>
        <RichTextEditor.Content />
      </RichTextEditor.Root>
    </Field.Root>
  )
}

/** Long names in a narrow column: the toolbar wraps group by group, and the text wraps. */
export function LongContentEditor({ locale }: { locale: FormLocale }) {
  const { text, lang } = editorTextsFor(locale)
  return (
    <Field.Root required lang={lang}>
      <Field.Label>{text.label}</Field.Label>
      <RichTextEditor.Root
        labels="icon-and-text"
        defaultValue={`<h2>${text.long}</h2>${contentFor(text)}`}
      >
        <RichTextEditor.Toolbar />
        <RichTextEditor.Content />
      </RichTextEditor.Root>
    </Field.Root>
  )
}

/** A right-to-left paragraph in a left-to-right page: each block takes its own direction. */
export function BidirectionalEditor({ locale }: { locale: FormLocale }) {
  const { text, lang } = editorTextsFor(locale)
  return (
    <Field.Root lang={lang}>
      <Field.Label>{text.label}</Field.Label>
      <RichTextEditor.Root defaultValue={`<p>${text.intro}</p><p>${arabicParagraph}</p>`}>
        <RichTextEditor.Toolbar />
        <RichTextEditor.Content />
      </RichTextEditor.Root>
    </Field.Root>
  )
}

/** A count of the characters left, with `characterCount` and `maxLength`: it never blocks typing. */
export function CountedEditor({ locale }: { locale: FormLocale }) {
  const { text, lang } = editorTextsFor(locale)
  return (
    <Field.Root required lang={lang}>
      <Field.Label>{text.label}</Field.Label>
      <RichTextEditor.Root name="news" maxLength={200} characterCount>
        <RichTextEditor.Toolbar />
        <RichTextEditor.Content />
      </RichTextEditor.Root>
      <Field.HelpText>{text.hint}</Field.HelpText>
    </Field.Root>
  )
}
