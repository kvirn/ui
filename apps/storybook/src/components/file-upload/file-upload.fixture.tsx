import { Button, Field, FileUpload, useFileUpload } from '@kvirn-ui/react'
import type { FileUploadRootProps } from '@kvirn-ui/react'
import type { FormLocale } from '../form/form.fixture.tsx'

// Story and e2e fixture for Components/Form/FileUpload (Plan 0021, design spec
// docs/design/file-upload.md). The component's own strings (the buttons, the status, the errors,
// the announcements) come from the library catalogs through the provider decorator. What the
// consumer writes is the label and the description: they name what to attach and why, so they
// belong to the form, not to the library. sv, fi, nb, nn and en are written here. se: English,
// marked lang="en" (3.1.2).
//
// KvirnUI sends nothing anywhere (hard rule 7). `controlledUpload` stands in for the consumer's own
// `upload`: it reports progress, then waits until the story or the test settles it.

export interface FileUploadTexts {
  label: string
  description: string
  errorMissing: string
  submit: string
  /** The message of your own `validate`: a file name with spaces is refused. */
  nameWithSpaces: string
  /** The message of an upload that failed for good (`retryable: false`): names the file. */
  notAccepted: (name: string) => string
  /** The Trigger's text and the Remove button's text, in your own words (`messages`). */
  ownChooseFiles: string
  ownRemove: string
}

const textsEn: FileUploadTexts = {
  label: 'Attachments',
  description: 'Attach your doctor’s certificate and your receipts.',
  errorMissing: 'Attach at least one file before you send the application.',
  submit: 'Send',
  nameWithSpaces: 'The file name can’t contain spaces. Rename the file and try again.',
  notAccepted: (name) =>
    `${name} was stopped by the security check. Remove the file and choose another.`,
  ownChooseFiles: 'Attach documents',
  ownRemove: 'Delete',
}

const textsSv: FileUploadTexts = {
  label: 'Bilagor',
  description: 'Bifoga ditt läkarintyg och dina kvitton.',
  errorMissing: 'Bifoga minst en fil innan du skickar in ansökan.',
  submit: 'Skicka in',
  nameWithSpaces: 'Filnamnet får inte innehålla mellanslag. Byt namn på filen och försök igen.',
  notAccepted: (name) =>
    `${name} stoppades av säkerhetskontrollen. Ta bort filen och välj en annan.`,
  ownChooseFiles: 'Bifoga underlag',
  ownRemove: 'Radera',
}

const textsFi: FileUploadTexts = {
  label: 'Liitteet',
  description: 'Liitä mukaan lääkärintodistuksesi ja kuittisi.',
  errorMissing: 'Liitä vähintään yksi tiedosto ennen hakemuksen lähettämistä.',
  submit: 'Lähetä',
  nameWithSpaces:
    'Tiedostonimessä ei saa olla välilyöntejä. Nimeä tiedosto uudelleen ja yritä uudelleen.',
  notAccepted: (name) =>
    `${name} pysäytettiin turvatarkistuksessa. Poista tiedosto ja valitse toinen.`,
  ownChooseFiles: 'Liitä asiakirjat',
  ownRemove: 'Poista liite',
}

const textsNb: FileUploadTexts = {
  label: 'Vedlegg',
  description: 'Legg ved legeerklæringen og kvitteringene dine.',
  errorMissing: 'Legg ved minst én fil før du sender inn søknaden.',
  submit: 'Send inn',
  nameWithSpaces: 'Filnavnet kan ikke inneholde mellomrom. Gi filen nytt navn og prøv igjen.',
  notAccepted: (name) =>
    `${name} ble stoppet av sikkerhetskontrollen. Fjern filen og velg en annen.`,
  ownChooseFiles: 'Legg ved dokumenter',
  ownRemove: 'Slett',
}

const textsNn: FileUploadTexts = {
  label: 'Vedlegg',
  description: 'Legg ved legeerklæringa og kvitteringane dine.',
  errorMissing: 'Legg ved minst éi fil før du sender inn søknaden.',
  submit: 'Send inn',
  nameWithSpaces: 'Filnamnet kan ikkje innehalde mellomrom. Gje fila nytt namn og prøv igjen.',
  notAccepted: (name) => `${name} vart stoppa av tryggleikskontrollen. Fjern fila og vel ei anna.`,
  ownChooseFiles: 'Legg ved dokument',
  ownRemove: 'Slett',
}

/** se has no texts: it shows the English ones, marked lang="en". */
const fileUploadTexts: Record<FormLocale, FileUploadTexts | undefined> = {
  sv: textsSv,
  fi: textsFi,
  nb: textsNb,
  nn: textsNn,
  se: undefined,
  en: textsEn,
}

export function fileUploadTextsFor(locale: FormLocale): { texts: FileUploadTexts; lang?: 'en' } {
  const texts = fileUploadTexts[locale]
  return texts === undefined ? { texts: textsEn, lang: 'en' } : { texts }
}

/** Every `FileUpload.Root` option, plus the story's locale (the label and description are yours). */
export interface AttachmentsProps extends FileUploadRootProps {
  locale: FormLocale
}

// Each function below is one example, and the story's "Show code" prints it (`showSource`), so it
// reads the way an adopter writes it: a Field around the real FileUpload parts, with the localised
// text taken at the top. `options` stands for the props you pass to `FileUpload.Root` (`accept`,
// `maxFiles`, `upload`, ...): the controls drive them.

/** A Field with a drop zone, the limits, the rejections, the summary and the list. */
export function AttachmentsField({ locale, ...options }: AttachmentsProps) {
  const { texts, lang } = fileUploadTextsFor(locale)
  return (
    <Field.Root lang={lang}>
      <Field.Label>{texts.label}</Field.Label>
      <Field.Prose>
        <p>{texts.description}</p>
      </Field.Prose>
      <FileUpload.Root {...options}>
        <FileUpload.DropZone>
          <FileUpload.Trigger />
          <FileUpload.DropHint />
        </FileUpload.DropZone>
        <FileUpload.Limits />
        <FileUpload.Rejections />
        <FileUpload.Summary />
        <FileUpload.List>
          {(item) => (
            <FileUpload.Item key={item.id} item={item}>
              <FileUpload.Name />
              <FileUpload.Type />
              <FileUpload.Size />
              <FileUpload.Status />
              <FileUpload.ItemError />
              <FileUpload.Progress />
              <FileUpload.Actions>
                <FileUpload.CancelButton />
                <FileUpload.RetryButton />
                <FileUpload.RemoveButton />
              </FileUpload.Actions>
            </FileUpload.Item>
          )}
        </FileUpload.List>
      </FileUpload.Root>
    </Field.Root>
  )
}

/** A thumbnail beside each name: opt in by rendering `FileUpload.Preview` in the item. */
export function AttachmentsWithPreviews({ locale, ...options }: AttachmentsProps) {
  const { texts, lang } = fileUploadTextsFor(locale)
  return (
    <Field.Root lang={lang}>
      <Field.Label>{texts.label}</Field.Label>
      <Field.Prose>
        <p>{texts.description}</p>
      </Field.Prose>
      <FileUpload.Root {...options}>
        <FileUpload.DropZone>
          <FileUpload.Trigger />
          <FileUpload.DropHint />
        </FileUpload.DropZone>
        <FileUpload.Limits />
        <FileUpload.Rejections />
        <FileUpload.Summary />
        <FileUpload.List>
          {(item) => (
            <FileUpload.Item key={item.id} item={item}>
              <FileUpload.Preview />
              <FileUpload.Name />
              <FileUpload.Type />
              <FileUpload.Size />
              <FileUpload.Status />
              <FileUpload.Progress />
              <FileUpload.Actions>
                <FileUpload.CancelButton />
                <FileUpload.RetryButton />
                <FileUpload.RemoveButton />
              </FileUpload.Actions>
            </FileUpload.Item>
          )}
        </FileUpload.List>
      </FileUpload.Root>
    </Field.Root>
  )
}

/**
 * No `upload`: the files stay `pending` and go with the form. Give the hidden input a `name`
 * (`FileUpload.Input`) and a plain `<form>` posts them.
 */
export function AttachmentsPostedWithTheForm({ locale, ...options }: AttachmentsProps) {
  const { texts, lang } = fileUploadTextsFor(locale)
  return (
    <Field.Root lang={lang}>
      <Field.Label>{texts.label}</Field.Label>
      <Field.Prose>
        <p>{texts.description}</p>
      </Field.Prose>
      <FileUpload.Root {...options}>
        <FileUpload.DropZone>
          <FileUpload.Trigger />
          <FileUpload.DropHint />
        </FileUpload.DropZone>
        <FileUpload.Limits />
        <FileUpload.Rejections />
        <FileUpload.Summary />
        <FileUpload.Input name="attachments" />
        <FileUpload.List>
          {(item) => (
            <FileUpload.Item key={item.id} item={item}>
              <FileUpload.Name />
              <FileUpload.Type />
              <FileUpload.Size />
              <FileUpload.Status />
              <FileUpload.Progress />
              <FileUpload.Actions>
                <FileUpload.CancelButton />
                <FileUpload.RetryButton />
                <FileUpload.RemoveButton />
              </FileUpload.Actions>
            </FileUpload.Item>
          )}
        </FileUpload.List>
      </FileUpload.Root>
    </Field.Root>
  )
}

/** The field, then the button that sends the application. Tab goes on from the field to it. */
export function AttachmentsWithSendButton({ locale, ...options }: AttachmentsProps) {
  const { texts, lang } = fileUploadTextsFor(locale)
  return (
    <>
      <Field.Root lang={lang}>
        <Field.Label>{texts.label}</Field.Label>
        <Field.Prose>
          <p>{texts.description}</p>
        </Field.Prose>
        <FileUpload.Root {...options}>
          <FileUpload.DropZone>
            <FileUpload.Trigger />
            <FileUpload.DropHint />
          </FileUpload.DropZone>
          <FileUpload.Limits />
          <FileUpload.Rejections />
          <FileUpload.Summary />
          <FileUpload.List>
            {(item) => (
              <FileUpload.Item key={item.id} item={item}>
                <FileUpload.Name />
                <FileUpload.Type />
                <FileUpload.Size />
                <FileUpload.Status />
                <FileUpload.Progress />
                <FileUpload.Actions>
                  <FileUpload.CancelButton />
                  <FileUpload.RetryButton />
                  <FileUpload.RemoveButton />
                </FileUpload.Actions>
              </FileUpload.Item>
            )}
          </FileUpload.List>
        </FileUpload.Root>
      </Field.Root>
      <div className="kv-button-group">
        <Button type="button" className="kv-button--primary">
          {texts.submit}
        </Button>
      </div>
    </>
  )
}

/**
 * You decide whether a missing file blocks the form: mark the Field `invalid` and write the
 * message. The Trigger is described by it.
 */
export function InvalidAttachments({ locale, ...options }: AttachmentsProps) {
  const { texts, lang } = fileUploadTextsFor(locale)
  return (
    <Field.Root invalid lang={lang}>
      <Field.Label>{texts.label}</Field.Label>
      <Field.Prose>
        <p>{texts.description}</p>
      </Field.Prose>
      <FileUpload.Root {...options}>
        <FileUpload.DropZone>
          <FileUpload.Trigger />
          <FileUpload.DropHint />
        </FileUpload.DropZone>
        <FileUpload.Limits />
        <FileUpload.Rejections />
        <FileUpload.Summary />
        <FileUpload.List>
          {(item) => (
            <FileUpload.Item key={item.id} item={item}>
              <FileUpload.Name />
              <FileUpload.Type />
              <FileUpload.Size />
              <FileUpload.Status />
              <FileUpload.Progress />
              <FileUpload.Actions>
                <FileUpload.CancelButton />
                <FileUpload.RetryButton />
                <FileUpload.RemoveButton />
              </FileUpload.Actions>
            </FileUpload.Item>
          )}
        </FileUpload.List>
      </FileUpload.Root>
      <Field.ErrorMessage>{texts.errorMissing}</Field.ErrorMessage>
    </Field.Root>
  )
}

/** A required Field: the Trigger never carries `aria-required` (a button doesn't allow it). */
export function RequiredAttachments({ locale, ...options }: AttachmentsProps) {
  const { texts, lang } = fileUploadTextsFor(locale)
  return (
    <Field.Root required lang={lang}>
      <Field.Label>{texts.label}</Field.Label>
      <Field.Prose>
        <p>{texts.description}</p>
      </Field.Prose>
      <FileUpload.Root {...options}>
        <FileUpload.DropZone>
          <FileUpload.Trigger />
          <FileUpload.DropHint />
        </FileUpload.DropZone>
        <FileUpload.Limits />
        <FileUpload.Rejections />
        <FileUpload.Summary />
        <FileUpload.List>
          {(item) => (
            <FileUpload.Item key={item.id} item={item}>
              <FileUpload.Name />
              <FileUpload.Type />
              <FileUpload.Size />
              <FileUpload.Status />
              <FileUpload.Progress />
              <FileUpload.Actions>
                <FileUpload.CancelButton />
                <FileUpload.RetryButton />
                <FileUpload.RemoveButton />
              </FileUpload.Actions>
            </FileUpload.Item>
          )}
        </FileUpload.List>
      </FileUpload.Root>
    </Field.Root>
  )
}

/**
 * Your own checks: `minFileSize`, `maxFiles` and `validate`, next to the ones the Root makes for
 * you. A file the list can't take is refused with its own sentence (`tooSmall`, `tooMany`,
 * `duplicate`, `folder`, and `custom` for the message your `validate` returns), and none of them
 * enters the list.
 */
export function AttachmentsWithOwnChecks({ locale, ...options }: AttachmentsProps) {
  const { texts, lang } = fileUploadTextsFor(locale)
  return (
    <Field.Root lang={lang}>
      <Field.Label>{texts.label}</Field.Label>
      <Field.Prose>
        <p>{texts.description}</p>
      </Field.Prose>
      <FileUpload.Root
        {...options}
        validate={(file) => (file.name.includes(' ') ? texts.nameWithSpaces : undefined)}
      >
        <FileUpload.DropZone>
          <FileUpload.Trigger />
          <FileUpload.DropHint />
        </FileUpload.DropZone>
        <FileUpload.Limits />
        <FileUpload.Rejections />
        <FileUpload.Summary />
        <FileUpload.List>
          {(item) => (
            <FileUpload.Item key={item.id} item={item}>
              <FileUpload.Name />
              <FileUpload.Type />
              <FileUpload.Size />
              <FileUpload.Status />
              <FileUpload.Actions>
                <FileUpload.RemoveButton />
              </FileUpload.Actions>
            </FileUpload.Item>
          )}
        </FileUpload.List>
      </FileUpload.Root>
    </Field.Root>
  )
}

/**
 * Why an upload failed. `FileUpload.ItemError` shows the reason in the item. Reject `upload` with
 * an error that has `retryable` (and its own `message`) to say more: a failure for good
 * (`retryable: false`) shows your message and only Remove, while any other rejection shows a
 * neutral sentence and Retry. A bare `Error` is never shown to people.
 */
export function AttachmentsWithFailureReasons({ locale, ...options }: AttachmentsProps) {
  const { texts, lang } = fileUploadTextsFor(locale)
  return (
    <Field.Root lang={lang}>
      <Field.Label>{texts.label}</Field.Label>
      <Field.Prose>
        <p>{texts.description}</p>
      </Field.Prose>
      <FileUpload.Root
        {...options}
        upload={(file) =>
          file.type === 'image/jpeg'
            ? Promise.reject(
                Object.assign(new Error(texts.notAccepted(file.name)), { retryable: false }),
              )
            : Promise.reject(new Error('The server did not answer.'))
        }
      >
        <FileUpload.DropZone>
          <FileUpload.Trigger />
          <FileUpload.DropHint />
        </FileUpload.DropZone>
        <FileUpload.Limits />
        <FileUpload.Rejections />
        <FileUpload.Summary />
        <FileUpload.List>
          {(item) => (
            <FileUpload.Item key={item.id} item={item}>
              <FileUpload.Name />
              <FileUpload.Type />
              <FileUpload.Size />
              <FileUpload.Status />
              <FileUpload.ItemError />
              <FileUpload.Progress />
              <FileUpload.Actions>
                <FileUpload.CancelButton />
                <FileUpload.RetryButton />
                <FileUpload.RemoveButton />
              </FileUpload.Actions>
            </FileUpload.Item>
          )}
        </FileUpload.List>
      </FileUpload.Root>
    </Field.Root>
  )
}

/**
 * Your own words: `messages` replaces the Trigger's text and the Remove button's text for this
 * one upload. A button's name starts with its visible text (2.5.3), so `remove` and `removeFile`
 * change together. Every other string keeps the provider's wording.
 */
export function AttachmentsWithOwnWords({ locale, ...options }: AttachmentsProps) {
  const { texts, lang } = fileUploadTextsFor(locale)
  return (
    <Field.Root lang={lang}>
      <Field.Label>{texts.label}</Field.Label>
      <Field.Prose>
        <p>{texts.description}</p>
      </Field.Prose>
      <FileUpload.Root
        {...options}
        messages={{
          chooseFiles: texts.ownChooseFiles,
          remove: texts.ownRemove,
          removeFile: ({ name }) => `${texts.ownRemove} ${name}`,
        }}
      >
        <FileUpload.DropZone>
          <FileUpload.Trigger />
          <FileUpload.DropHint />
        </FileUpload.DropZone>
        <FileUpload.Limits />
        <FileUpload.Rejections />
        <FileUpload.Summary />
        <FileUpload.List>
          {(item) => (
            <FileUpload.Item key={item.id} item={item}>
              <FileUpload.Name />
              <FileUpload.Type />
              <FileUpload.Size />
              <FileUpload.Status />
              <FileUpload.Actions>
                <FileUpload.RemoveButton />
              </FileUpload.Actions>
            </FileUpload.Item>
          )}
        </FileUpload.List>
      </FileUpload.Root>
    </Field.Root>
  )
}

/**
 * Uploads that start when you say so: `autoUpload` off keeps every file `pending`, and the hook's
 * `uploadAll()` starts them, at most `concurrency` at a time. No part exposes `uploadAll()`, so
 * this example builds the elements from `useFileUpload`, inside the Field so the hook reads it.
 */
export function AttachmentsSentByHand({ locale }: { locale: FormLocale }) {
  const { texts, lang } = fileUploadTextsFor(locale)
  return (
    <Field.Root lang={lang}>
      <Field.Label>{texts.label}</Field.Label>
      <Field.Prose>
        <p>{texts.description}</p>
      </Field.Prose>
      <QueuedAttachments locale={locale} />
    </Field.Root>
  )
}

/** The elements of `AttachmentsSentByHand`: the hook's props on your own markup. */
export function QueuedAttachments({ locale }: { locale: FormLocale }) {
  const { texts } = fileUploadTextsFor(locale)
  const fileUpload = useFileUpload({
    autoUpload: false,
    concurrency: 1,
    upload: controlledUpload('known'),
  })
  return (
    <div {...fileUpload.rootProps}>
      <input {...fileUpload.inputProps} />
      <button {...fileUpload.triggerProps}>
        <span id={fileUpload.triggerTextId}>{fileUpload.triggerText}</span>
      </button>
      <ul>
        {fileUpload.items.map((item) => (
          <li key={item.id} {...fileUpload.getItemProps(item)}>
            <bdi>{fileUpload.getItemName(item)}</bdi>{' '}
            <span>{fileUpload.getItemStatusText(item)}</span>
          </li>
        ))}
      </ul>
      <Button
        type="button"
        className="kv-button--primary"
        onClick={() => {
          fileUpload.uploadAll()
        }}
      >
        {texts.submit}
      </Button>
    </div>
  )
}

/** A file of `size` bytes with the given name and type. The content is zeros. */
export function makeFile(name: string, size = 20_000, type = 'application/pdf'): File {
  return new File([new Uint8Array(size)], name, { type })
}

/** A 1×1 PNG, which the browser can decode: a preview shows it as an `<img>`. */
export function makeImage(name = 'photo.png'): File {
  const bytes = Uint8Array.from(
    atob(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
    ),
    (character) => character.charCodeAt(0),
  )
  return new File([bytes], name, { type: 'image/png' })
}

export type UploadMode = 'known' | 'unknown' | 'fail' | 'succeed'

/**
 * A stand-in for the consumer's `upload`. `known` reports 40% and waits, `unknown` waits without
 * a size, `fail` rejects at once, `succeed` resolves at once. The signal cancels it.
 */
export function controlledUpload(mode: UploadMode) {
  return (
    _file: File,
    { signal, onProgress }: { signal: AbortSignal; onProgress: (n: number) => void },
  ) =>
    new Promise<string>((resolve, reject) => {
      if (mode === 'succeed') {
        resolve('server-id')
        return
      }
      if (mode === 'fail') {
        reject(new Error('The server did not answer.'))
        return
      }
      if (mode === 'known') {
        onProgress(0.4)
      }
      signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')))
    })
}
