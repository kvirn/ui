import { Field, FileUpload } from '@kvirn-ui/react'
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

export interface FileUploadFieldProps extends Partial<FileUploadRootProps> {
  locale: FormLocale
  required?: boolean
  invalid?: boolean
  /** Show a preview thumbnail beside each name. */
  previews?: boolean
  /** The accepted types and limits are said by `FileUpload.Limits`, built from the props. */
  withLimits?: boolean
  inputName?: string
  /** A Continue button after the field, for the Keyboard story. */
  withSubmit?: boolean
}

/** A Field with a drop zone, the limits, the rejections, the summary and the list. */
export function FileUploadField({
  locale,
  required,
  invalid,
  previews,
  withLimits = true,
  inputName,
  withSubmit,
  ...options
}: FileUploadFieldProps) {
  const { texts, lang } = fileUploadTextsFor(locale)
  return (
    <Field.Root required={required} invalid={invalid} lang={lang}>
      <Field.Label>{texts.label}</Field.Label>
      <Field.Prose>
        <p>{texts.description}</p>
      </Field.Prose>
      <FileUpload.Root {...options}>
        <FileUpload.DropZone>
          <FileUpload.Trigger />
          <FileUpload.DropHint />
        </FileUpload.DropZone>
        {withLimits ? <FileUpload.Limits /> : null}
        <FileUpload.Rejections />
        <FileUpload.Summary />
        {inputName === undefined ? null : <FileUpload.Input name={inputName} />}
        <FileUpload.List>
          {(item) => (
            <FileUpload.Item key={item.id} item={item}>
              {previews ? <FileUpload.Preview /> : null}
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
      {invalid ? <Field.ErrorMessage>{texts.errorMissing}</Field.ErrorMessage> : null}
      {withSubmit ? (
        <button type="button" className="kv-button">
          {texts.submit}
        </button>
      ) : null}
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
