import { Button, Field, FileUpload } from '@kvirn-ui/react'
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
}

const textsEn: FileUploadTexts = {
  label: 'Attachments',
  description: 'Attach your doctor’s certificate and your receipts.',
  errorMissing: 'Attach at least one file before you send the application.',
  submit: 'Send',
}

const textsSv: FileUploadTexts = {
  label: 'Bilagor',
  description: 'Bifoga ditt läkarintyg och dina kvitton.',
  errorMissing: 'Bifoga minst en fil innan du skickar in ansökan.',
  submit: 'Skicka in',
}

const textsFi: FileUploadTexts = {
  label: 'Liitteet',
  description: 'Liitä mukaan lääkärintodistuksesi ja kuittisi.',
  errorMissing: 'Liitä vähintään yksi tiedosto ennen hakemuksen lähettämistä.',
  submit: 'Lähetä',
}

const textsNb: FileUploadTexts = {
  label: 'Vedlegg',
  description: 'Legg ved legeerklæringen og kvitteringene dine.',
  errorMissing: 'Legg ved minst én fil før du sender inn søknaden.',
  submit: 'Send inn',
}

const textsNn: FileUploadTexts = {
  label: 'Vedlegg',
  description: 'Legg ved legeerklæringa og kvitteringane dine.',
  errorMissing: 'Legg ved minst éi fil før du sender inn søknaden.',
  submit: 'Send inn',
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
