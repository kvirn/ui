# FileUpload

> **Draft** (Plan 0021). This page moves to the docs site once `apps/docs` has a content system. The accessibility contract is [file-upload.a11y.md](file-upload.a11y.md), the design spec is [docs/design/file-upload.md](../../../../docs/design/file-upload.md), and the decisions are in ADR-0038 and ADR-0049 (the dashed drop zone).

**KvirnUI sends nothing anywhere.** FileUpload checks the files it is given, shows them, and calls _your_ `upload` function. It makes no network calls, sets no cookies and reads no file content except to show an image preview on the device.

A FileUpload attaches files to a form. **One native button opens the system file dialog**: that is the way in for the keyboard, voice, switch and touch. A drop zone around it is an extra for devices that drag. Behind the button is a hidden native `<input type="file">`.

- Parts: `FileUpload.Root`, `.Trigger`, `.Input`, `.DropZone`, `.DropHint`, `.Limits`, `.Rejections`, `.Summary`, `.List`, `.Item`, `.Preview`, `.Name`, `.Type`, `.Size`, `.Status`, `.Progress`, `.Actions`, `.CancelButton`, `.RetryButton` and `.RemoveButton`. Each is also exported on its own (`FileUploadRoot`, …), and the hook is `useFileUpload`. The state machine is `createFileUpload` in `@kvirn-ui/core`.
- **Every limit is checked here,** because a drop and "All files" skip the browser's checks: type (MIME type and extension), largest and smallest size, how many files, empty files, duplicates, folders, and your own `validate(file)`.
- **A refused file never enters the list.** It is named under the button with how to fix it ("stor.pdf är 2 MB. Välj en fil som är högst 1 MB."). The Field is not marked invalid by it: you decide whether it blocks the form, from `onFilesReject`.
- **Adding appends,** except with `multiple` off, where a new file replaces the old one.
- **Progress is a native `<progress>`,** shown only while a file uploads, with the percentage as text. A file of unknown size gets a static hatched bar. Progress is never announced: only starts, finishes and failures are, in one polite sentence per batch.
- **Focus never falls to the page.** Removing a file, or a button going away when an upload ends, moves focus to the next item (then the previous, then the button), never to a destructive button.
- Headless: no CSS. The parts render `kv-file-upload` and one class per part, and your `className` joins them. With `@kvirn-ui/theme/theme.css` imported they are styled.

> **Client checks aren't security.** Check type, size and content again on the server. Photos can carry location data (EXIF), which your server should strip.

## Component

```tsx
import { Field, FileUpload } from '@kvirn-ui/react'

;<Field.Root>
  <Field.Label>Bilagor</Field.Label>
  <Field.Description>Bifoga ditt läkarintyg och dina kvitton.</Field.Description>
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
| `disabled`                                   | `false`     | Native `disabled` on the Trigger and the input                                                             |
| `onFilesChange`, `onFilesReject`, `messages` | –           | The list changed, files were refused (data, not text), and per-instance string overrides (ADR-0007)        |

## Uploading

KvirnUI doesn't upload. Your `upload` function does, to your server, and reports progress as a fraction from 0 to 1 and honours the `signal`. Use `XMLHttpRequest` where you need upload progress, since `fetch` doesn't report it everywhere:

```ts
const upload = (file: File, { signal, onProgress }: UploadContext) =>
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

A failed upload shows neutral words and a Retry button, which restarts the same file. To say more, reject with an error that opts in: `{ retryable: false, message: 'Filen kunde inte skickas…' }`. A bare `Error('Failed to fetch')` is never shown to people. What `upload` resolves with is stored on the item as `result`, so you can put server ids in your form state from `onFilesChange`.

Without `upload`, files stay `pending` and the component keeps the native input's `files` equal to the list (through `DataTransfer`), so a plain `<form>` posts them, dropped files included. Give the input a name: `<FileUpload.Input name="attachments" />`.

## Announcements

Through the shared Announcer (`KvirnProvider`), politely: files added and refused, a removal, the list becoming full, and uploads finished or failed. One sentence per batch, so a message never replaces another. No percentages. Without a provider nothing is announced and a development warning says so.

## Strings

The component's strings (buttons, status, errors, announcements) are in the `fileUpload` namespace of all six locales, and can be overridden per provider and per instance (`messages`). **The label and the description are yours,** because they say what to attach and why. Northern Sámi starts as English placeholders and blocks `beta`.

## Hook

`useFileUpload(options)` returns `rootProps`, `triggerProps`, `inputProps`, `dropZoneProps`, `getItemProps(item)`, `getProgressProps(item)`, `getRemoveButtonProps(item)`, `getCancelButtonProps(item)`, `getRetryButtonProps(item)`, and the state: `items`, `rejections`, `isFull`, `isDragging`, `isDroppable` and more. Spread each on your own element. See `file-upload.a11y.md` for what each must carry.

## `render`

Every part takes `render` (an element or a function) to change the element it renders. Class names and handlers merge, and refs are merged. A `render` for the Trigger must render a `<button>` and keep its children: the text sits in a `<span id={triggerTextId}>` that the button's name points at. If your `render` writes its own children, wrap your text in that span (a development warning tells you when it is missing).
