---
'@kvirn-ui/core': minor
'@kvirn-ui/react': minor
'@kvirn-ui/i18n': minor
'@kvirn-ui/theme': minor
---

FileUpload (Plan 0021, ADR-0038, ADR-0049). Attach files to a form with one native button that opens the system dialog, an optional drop zone, a list of accepted files, and an upload queue your own function drives. The library makes no network calls.

- `@kvirn-ui/core`: `createFileUpload(options, env)`, a state machine for the file list: it checks every file (type by MIME type and extension, largest and smallest size, how many, empty, duplicate, folder and your `validate`), keeps refused files out of the list and reports them as typed reasons, appends (or replaces with `multiple: false`), and runs the queue (`concurrency`, `autoUpload`, `uploadAll`, cancel through `AbortSignal`, retry, whole-percent progress). Object URLs for previews are made through an injected env and revoked on removal. Types: `FileUploadItem`, `FileUploadOptions`, `FileRejection`, `FileUploadFailure` and more.
- `@kvirn-ui/react`: `FileUpload.Root`, `.Trigger`, `.Input`, `.DropZone`, `.DropHint`, `.Limits`, `.Rejections`, `.Summary`, `.List`, `.Item`, `.Preview`, `.Name`, `.Type`, `.Size`, `.Status`, `.Progress`, `.Actions`, `.CancelButton`, `.RetryButton`, `.RemoveButton` (each also a named export) and the hook `useFileUpload`. The Trigger is a native button that carries the Field's control id and never `aria-required`; the native input is out of the accessibility tree. A file dropped outside the zone is ignored. Focus moves to the next item when a focused button goes away, never to the page. Announcements are one polite sentence per batch from a buffer shared by every FileUpload on the same Announcer, with no percentages. `Field` now exposes the label's id (`labelProps.id`, `useField().labelId`, and `labelId` on the context), and `Field.Label` no longer accepts an `id`.
- `@kvirn-ui/i18n`: the `fileUpload` namespace in all six locales (Northern Sámi starts as English placeholders) and `formatFileSize(format, bytes)`, which writes a size in the locale's unit and separator (`2,4 MB`).
- `@kvirn-ui/theme`: styles for every FileUpload part and state, with a dashed drop-zone edge (ADR-0049) that holds in forced colours, a status bar on each item, a native progress bar with a static hatch for an unknown size, and larger targets on coarse pointers. No new token.
