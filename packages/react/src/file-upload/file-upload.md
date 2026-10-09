# FileUpload

> **Draft** (Plan 0021). This page moves to the docs site once `apps/docs` has a content system. The accessibility contract is [file-upload.a11y.md](file-upload.a11y.md), the design spec is [docs/design/file-upload.md](../../../../docs/design/file-upload.md), and the decisions are in the forms skill (FileUpload).

**KvirnUI sends nothing anywhere.** FileUpload checks the files it is given, shows them, and calls _your_ `upload` function. It makes no network calls, sets no cookies and reads no file content except to show an image preview on the device.

A FileUpload attaches files to a form. **One native button opens the system file dialog**: that is the way in for the keyboard, voice, switch and touch. A drop zone around it is an extra for devices that drag. Behind the button is a hidden native `<input type="file">`.

- Parts: `FileUpload.Root`, `.Trigger`, `.Input`, `.DropZone`, `.DropHint`, `.Limits`, `.Rejections`, `.Summary`, `.List`, `.Item`, `.Preview`, `.Name`, `.Type`, `.Size`, `.Status`, `.Progress`, `.ItemError`, `.Actions`, `.CancelButton`, `.RetryButton` and `.RemoveButton`. Each is also exported on its own (`FileUploadRoot`, …), and the hook is `useFileUpload`. The state machine is `createFileUpload` in `@kvirn-ui/core`.
- **Every limit is checked here,** because a drop and "All files" skip the browser's checks: type (MIME type and extension), largest and smallest size, how many files, empty files, duplicates, folders, and your own `validate(file)`.
- **A refused file never enters the list.** It is named under the button with how to fix it ("stor.pdf är 2 MB. Välj en fil som är högst 1 MB."). The Field is not marked invalid by it: you decide whether it blocks the form, from `onFilesReject`.
- **Adding appends,** except with `multiple` off, where a new file replaces the old one.
- **Progress is a native `<progress>`,** shown only while a file uploads, with the percentage as text. A file of unknown size gets no `<progress>` but a decorative `<span class="kv-progress-track" aria-hidden="true">` (a moving bar that loops while the upload runs and rests under reduced motion; for WCAG 2.2.2 see [Moving indicators and WCAG 2.2.2](/foundation/theming#moving-indicators)). Progress is never announced: only starts, finishes and failures are, in one polite sentence per batch.
- **Focus never falls to the page.** Removing a file, or a button going away when an upload ends, moves focus to the next item (then the previous, then the button), never to a destructive button.
- Headless: no CSS. The parts render `kv-file-upload` and one class per part, and your `className` joins them. With `@kvirn-ui/theme/theme.css` imported they are styled.

> **Client checks aren't security.** Check type, size and content again on the server. Photos can carry location data (EXIF), which your server should strip.

## API

| Part                                                       | Renders                                                 | What it is                                                                                                                             |
| ---------------------------------------------------------- | ------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `FileUpload.Root`                                          | `<div class="kv-file-upload">`                          | Takes the options below and every `<div>` prop. Holds the list, the upload queue and the announcements                                 |
| `FileUpload.Trigger`                                       | `<button class="kv-button kv-file-upload-trigger">`     | The one control that adds files. Opens the system dialog. `aria-disabled` at `maxFiles`, never `aria-required`                         |
| `FileUpload.Input`                                         | `<input type="file">`, visually hidden                  | Out of the accessibility tree. Give it a `name` to post the files with a plain form. The Root adds one if you render none              |
| `FileUpload.DropZone`                                      | `<div class="kv-file-upload-drop-zone">`                | The extra for devices that drag. Not focusable, no role                                                                                |
| `FileUpload.DropHint`                                      | `<p class="kv-file-upload-drop-hint">`                  | "eller släpp filer här", and "Släpp filerna för att lägga till dem" while a file is over the zone                                      |
| `FileUpload.Limits`                                        | `<p class="kv-file-upload-limits">`                     | The limits that are set, built from the options. A description of the Field                                                            |
| `FileUpload.Rejections`                                    | `<div class="kv-file-upload-rejections">` with a `<ul>` | The files the latest add refused, one line each. Not in the list                                                                       |
| `FileUpload.Summary`                                       | `<p class="kv-file-upload-summary">`                    | "2 av 5 filer tillagda", and what to do next when the list is full                                                                     |
| `FileUpload.List`                                          | `<ul role="list" class="kv-file-upload-list">`          | Accepted files only. Its children are a function `(item) => …` that renders one `FileUpload.Item` per file                             |
| `FileUpload.Item`                                          | `<li class="kv-file-upload-item" tabindex="-1">`        | One file. Takes `item`. Focusable by script only, to keep focus in place                                                               |
| `FileUpload.Preview`                                       | `<span>` with an `<img alt="">` or the document icon    | An opt-in thumbnail for images. Decorative                                                                                             |
| `FileUpload.Name`, `.Type`, `.Size`                        | `<bdi>`, `<span>`, `<span>`                             | The file name (`name (2)` when two files share one), the extension in capitals (`PDF`) and the size in the locale's decimal units      |
| `FileUpload.Status`                                        | `<p class="kv-file-upload-status">`                     | The state in text: ready, uploading with a percentage, uploaded, failed, cancelled                                                     |
| `FileUpload.ItemError`                                     | `<p class="kv-file-upload-item-error">`                 | Why a failed file failed and what to do. Renders only while the item is `failed`, with the error icon and the hidden prefix            |
| `FileUpload.Progress`                                      | `<progress class="kv-file-upload-progress">`            | Renders only while uploading. Whole percent; when the size is unknown, a `<span class="kv-progress-track" aria-hidden="true">` instead |
| `FileUpload.Actions`                                       | `<div>`                                                 | A layout wrapper for an item's buttons                                                                                                 |
| `FileUpload.CancelButton`, `.RetryButton`, `.RemoveButton` | `<button class="kv-button kv-file-upload-cancel" …>`    | One action per state: Cancel while uploading, Retry and Remove after a failure or a cancel, otherwise Remove. Their names add the file |

- **`FileUpload.ItemError`** is the place for the reason an upload failed. Without `children` it shows the consumer's own `message` from the rejection of `upload`, else a neutral sentence ("Det gick inte att ladda upp läkarintyg.pdf. Om det fortsätter att misslyckas, kontakta oss.") that never says why. Put it in the item next to `Status`: while the item is failed, the item's buttons are described by it, so a screen-reader user hears the reason on Retry and Remove. Without it, the failure shows only in the `Status` text.
- **Refusal reasons** (`onFilesReject` gets them as data, and `Rejections` writes each as a sentence): `type`, `tooLarge`, `tooSmall`, `tooMany`, `empty`, `duplicate`, `folder` and `custom` (your `validate` returned a string). The file itself is checked first (folder, type, empty, size, duplicate, then `validate`) and the list's room last, so a wrong file is never told "too many". A dropped folder is refused as `folder`.
- **`FileUploadFailure`:** reject `upload` with `{ retryable?: boolean, message?: string }` (an `Error` that sets `retryable` works too). `retryable: false` removes Retry. `message` is shown by `ItemError` for a plain object, or for an `Error` that sets a boolean `retryable` (a bare `Error` is never shown), and must name the file and say what to do.
- **`FileUploadContext`:** the second argument of `upload`, `{ signal, onProgress }`.

| State attribute                 | Where and when                                                                          |
| ------------------------------- | --------------------------------------------------------------------------------------- |
| `data-drag-active`              | Root: a file is dragged over the page                                                   |
| `data-droppable`                | DropZone: the zone is drawn (a precise pointer is attached, or a file is over the page) |
| `data-dragging`                 | DropZone: a file is over the zone itself. Never on a disabled zone                      |
| `data-full`                     | Root and Trigger: `maxFiles` files are in the list                                      |
| `data-invalid`, `data-disabled` | Root, DropZone and Trigger: from the Field or the `disabled` option                     |
| `data-status`                   | Item and Status: `pending`, `uploading`, `complete`, `failed` or `cancelled`            |

- **Message keys** (`messages`, namespace `fileUpload`, all six languages): the Trigger's text (`chooseFiles`, `chooseFile`, `replaceFile`), the hints (`dropHint`, `dropHintActive`), the limits (`limitsMaxFiles`, `limitsTypes`, `limitsMaxSize`), the summary (`summary`, `summaryOfMax`, `summaryFull`), the rejections (`rejectedHeading`, `errorType`, `errorTooLarge`, `errorTooSmall`, `errorEmpty`, `errorTooMany`, `errorDuplicate`, `errorFolder`, `rejectedFilePosition`), the statuses (`statusReady`, `statusQueued`, `statusUploading`, `statusUploadingPercent`, `statusComplete`, `statusFailed`, `statusCancelled`, `uploadFailedMessage`), the file (`typeUnknown`, `duplicateName`), the buttons and their names (`remove`, `cancel`, `retry`, `removeFile`, `cancelFile`, `retryFile`, `uploadingFile`) and the announcements (`fileAdded`, `filesAdded`, `filesRejected`, `uploadsStarted`, `uploadComplete`, `uploadsComplete`, `allUploadsComplete`, `uploadFailed`, `uploadsFailed`, `fileRemoved`, `announcementForField`). A visible text and its button name change together: override `remove` and `removeFile` as a pair, or the name no longer starts with its visible text (2.5.3).
- **Dev warnings (once):** a part outside a Root or an Item; limits set but not said; no Announcer; a browser that can't set the files of the input.

## Component

```tsx
import { Field, FileUpload } from '@kvirn-ui/react'

;<Field.Root>
  <Field.Label>Bilagor</Field.Label>
  <Field.Prose>
    <p>Bifoga ditt läkarintyg och dina kvitton.</p>
  </Field.Prose>
  <FileUpload.Root
    multiple
    maxFiles={5}
    maxFileSize={10_000_000}
    accept=".pdf,.jpg,.png"
    upload={(file, { signal, onProgress }) => send(file, signal, onProgress)}
    onFilesChange={(items) => setAttachmentIds(items.map((item) => item.result))}
    onFilesReject={(rejections) => log(rejections)}
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
          <FileUpload.Preview />
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
```

Put it in a Field. The Trigger takes the Field's id, so the label and an error-summary link reach it, and its name is its own text then the label ("Välj filer Bilagor"). It never carries `aria-required`: a button doesn't allow it, and a required Field shows through the missing "(valfritt)".

Options (also the options of the hook):

| Option                                       | Default     | What it does                                                                                               |
| -------------------------------------------- | ----------- | ---------------------------------------------------------------------------------------------------------- |
| `accept`                                     | –           | Accepted types: extensions (`.pdf`), MIME types and wildcards (`image/*`), comma separated                 |
| `multiple`                                   | `true`      | Off: a new file replaces the current one and the Trigger says "Byt fil"                                    |
| `maxFiles`                                   | –           | How many files the list holds. At the limit the Trigger is `aria-disabled` and says why                    |
| `maxFileSize`, `minFileSize`                 | –           | In bytes. Messages show the sizes in the same unit as the limit                                            |
| `allowDuplicates`                            | `false`     | Off: the same name, size and last-modified time is refused                                                 |
| `validate`                                   | –           | `(file) => string \| void`. A string refuses the file and is shown as its message                          |
| `upload`                                     | –           | `(file, { signal, onProgress }) => Promise<result>`. Without it, files stay `pending` and go with the form |
| `concurrency`, `autoUpload`                  | `3`, `true` | How many upload at once, and whether they start when added. `uploadAll()` starts them otherwise            |
| `previews`                                   | `false`     | Gives image files a `previewUrl` (an object URL, revoked when the item goes away)                          |
| `disabled`                                   | `false`     | Native `disabled` on the Trigger and the input                                                             |
| `onFilesChange`, `onFilesReject`, `messages` | –           | The list changed, files were refused (data, not text), and per-instance string overrides                   |

## Uploading

KvirnUI doesn't upload. Your `upload` function does, to your server, and reports progress as a fraction from 0 to 1 and honours the `signal`. Use `XMLHttpRequest` where you need upload progress, since `fetch` doesn't report it everywhere:

```ts
const upload = (file: File, { signal, onProgress }: FileUploadContext) =>
  new Promise<string>((resolve, reject) => {
    const request = new XMLHttpRequest()
    request.open('POST', '/attachments')
    request.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress(event.loaded / event.total)
    }
    request.onload = () =>
      request.status < 300 ? resolve(JSON.parse(request.responseText).id) : reject(fail(request))
    request.onerror = () => reject(fail(request))
    signal.addEventListener('abort', () => {
      request.abort()
      reject(new DOMException('Aborted', 'AbortError'))
    })
    request.send(file)
  })
```

A failed upload shows neutral words and a Retry button, which restarts the same file. To say more, reject with an error that opts in, a plain object or an `Error` that sets a boolean `retryable` (`true` or `false`): `{ retryable: false, message: 'Filen kunde inte skickas…' }`. A bare `Error('Failed to fetch')` is never shown to people. Render `FileUpload.ItemError` in the item to show the reason; `retryable: false` leaves only Remove. What `upload` resolves with is stored on the item as `result`, so you can put server ids in your form state from `onFilesChange`.

Without `upload`, files stay `pending` and the component keeps the native input's `files` equal to the list (through `DataTransfer`), so a plain `<form>` posts them, dropped files included. Give the input a name: `<FileUpload.Input name="attachments" />`.

## Announcements

Through the shared Announcer (`KvirnProvider`), politely: files added and refused, a removal, the list becoming full, and uploads finished or failed. One sentence per batch, so a message never replaces another. No percentages. Without a provider nothing is announced and a development warning says so.

## Strings

The component's strings (buttons, status, errors, announcements) are in the `fileUpload` namespace of all six locales, and can be overridden per provider and per instance (`messages`). **The label and the description are yours,** because they say what to attach and why. Northern Sámi starts as English.

## Hook

`useFileUpload(options)` returns `rootProps`, `triggerProps`, `inputProps`, `dropZoneProps`, `getItemProps(item)`, `getProgressProps(item)`, `getRemoveButtonProps(item)`, `getCancelButtonProps(item)`, `getRetryButtonProps(item)`, and the state: `items`, `rejections`, `isFull`, `isDragging`, `isDroppable` and more. Spread each on your own element. See `file-upload.a11y.md` for what each must carry.

## Your own element

Every part renders one fixed element, and takes your `className`, `ref` and handlers, merged with its own. To change an element, build it with `useFileUpload` and spread the prop objects on it. For the Trigger, put the visible text in `<span id={triggerTextId}>`: the button's name points at that span, so it starts with its visible text (2.5.3). The state is on `data-*` attributes (`data-status`, `data-dragging`, `data-full`), which are also what your styles read.
