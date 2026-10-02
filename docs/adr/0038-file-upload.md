# ADR-0038: FileUpload is a native file input with an optional drop zone, a file list, and an upload queue the consumer drives

- **Status:** Proposed
- **Date:** 2026-10-02
- **Deciders:** Maintainer asked for a file upload with preview, metadata, multiple files, file type restriction, a limit on files at once and upload progress. The details below are proposed and open to change.
- **Tags:** architecture, api, a11y, i18n, compliance

## Context

E-services ask for attachments: certificates, receipts, photos, ID documents. The roadmap has FileUpload in M4, and the APG map says "a native `<input type=file>` button is always present; the drop zone is an enhancement". There's no APG pattern.

The common failures:

- A drop zone as the only way in, so keyboard, switch, voice and many touch users can't add a file (2.1.1, 2.5.7).
- A hidden file input with a `<div>` styled as a button.
- `accept` treated as validation, although dropped files skip it and the OS dialog lets users pick "All files".
- Errors that say "Invalid file" without saying which file or what is allowed.
- Progress that's only a coloured bar, or a live region that announces every percent.
- Focus on `body` after a file is removed.
- Selecting files a second time replacing the first selection, which is the native behaviour.

"Max files at once" can mean two things, and both are covered: a limit on how many files the list holds (`maxFiles`), and how many upload at the same time (`concurrency`).

## Decision drivers

- A native `<input type="file">` is always there and always works (hard rule 2).
- Every limit is checked by the component, because the browser doesn't enforce them on drop. Each error names the file and says what is allowed (3.3.1, 3.3.3).
- No network code in the library (hard rule 7). The consumer's code uploads, to the consumer's server.
- Files never leave the device except through the consumer's upload function. No file content is read except for an image preview (GDPR: data minimisation).
- No form state beyond what the file list needs (ADR-0029).

## Options considered

### Option A: native input, optional drop zone, file list, consumer-driven queue (chosen)

- ✅ Works with keyboard, voice, switch and touch through the native dialog. Drop is an extra.
- ✅ Works without JavaScript uploads: files can go with the form, or upload one by one with progress.
- ❌ The most parts of any component so far.

### Option B: a built-in uploader (`fetch` or `XMLHttpRequest` to a URL prop)

- ✅ Least code for the adopter.
- ❌ The library would own network calls, authentication headers, retries and error parsing. Against hard rule 7 and the headless premise. Rejected. Docs give an `XMLHttpRequest` recipe, since `fetch` doesn't report upload progress in every browser.

### Option C: drop zone only, styled as a button

- ❌ Fails keyboard and single-pointer users. Rejected.

## Decision

We will use Option A:

1. **Parts.** `FileUpload.Root` (`<div>`, `kv-file-upload`, inside a Field), `FileUpload.Trigger` (`<button>` that opens the native dialog), `FileUpload.Input` (the native `<input type="file">`, visually hidden but present and labelled), `FileUpload.DropZone` (an optional `<div>` around the trigger and hint), `FileUpload.List` (`<ul>`), `FileUpload.Item` (`<li>`), `FileUpload.Preview`, `FileUpload.Name`, `FileUpload.Size`, `FileUpload.Type`, `FileUpload.Progress` (native `<progress>`), `FileUpload.ItemError`, `FileUpload.RemoveButton`, `FileUpload.CancelButton` and `FileUpload.RetryButton`. Each part is also a named export. The hook is `useFileUpload()`, and the store is `createFileUpload` in `core`. Exact names are settled in the plan.
2. **Trigger and input.** There's one Tab stop, the trigger:
   - The trigger's visible text is `fileUpload.chooseFiles` or `fileUpload.chooseFile` ("Choose files"). Its name is that text followed by the Field label, through `aria-labelledby` ("Choose files, Attachments"), so the name starts with the visible text (2.5.3). It's described by the Field's description and error, which say what to upload and the limits. Activating it calls `showPicker()` on the input, or `click()` where that's missing.
   - The input is visually hidden, `tabIndex={-1}`, and still labelled by the Field label (`<label for>`), so clicking the label also opens the dialog. It's never `display: none`, so the form, the label and `DataTransfer` keep working.
   - `accept`, `multiple`, `capture` and `name` pass through to the input.
3. **Drop zone.** It's an enhancement on pointer devices with drag-and-drop:
   - It isn't focusable and has no role. The keyboard path is the trigger inside it.
   - The hint `fileUpload.dropHint` ("or drop files here") is shown only when drag-and-drop is supported (`pointer: fine`).
   - While a file is dragged over it, it gets `data-dragging`. The theme shows that state with a border change that also works in forced colours, not only a colour.
   - While FileUpload is mounted, a file dropped just outside the zone is ignored instead of opening in the tab and leaving the form.
4. **Adding appends.** Each selection or drop adds to the list instead of replacing it, and the native input is reset so the same file can be chosen again. The trigger keeps focus after the dialog closes. Nothing else moves focus.
5. **Limits and validation.** Each added file is checked against `accept` (both MIME type and extension), `maxFileSize`, `minFileSize` and `maxFiles`, and then against the consumer's optional `validate(file)`. This is the one place where a component validates, because drop and "All files" skip the browser's checks. It's a scoped exception to ADR-0029:
   - A rejected file still appears in the list, with its name and a text error: `fileUpload.errorType` ("report.docx isn't allowed. Choose a PDF, JPG or PNG file"), `fileUpload.errorTooLarge` ("…is larger than 10 MB"), `fileUpload.errorTooSmall`, and `fileUpload.errorTooMany` ("You can add up to 5 files"). It's never uploaded, and it has a remove button.
   - Rejected files are reported in `onFilesReject`. The Field's own `invalid` and error message stay with the consumer, who decides whether rejected files block submit.
   - Docs say client checks aren't security: the server must check type, size and content again.
6. **Upload.** Two modes:
   - **With the form** (no `upload` prop): files stay `pending`. The component keeps the native input's `files` in sync with the list (through `DataTransfer`), so a plain `<form>` posts them, dropped files included.
   - **On add** (`upload(file, { signal, onProgress })` returns a promise): the queue uploads as files are added, at most `concurrency` at a time (default 3), or when the consumer calls `uploadAll()` with `autoUpload={false}`. `signal` cancels. The promise's result (for example a server id) is stored on the item and reported in `onFilesChange`, so the consumer puts the ids in its form state.
   - Statuses: `pending`, `rejected`, `uploading`, `complete`, `failed`, `cancelled`, exposed as `data-status` on Item.
7. **Progress.** `FileUpload.Progress` is a native `<progress>` named `fileUpload.uploadingFile` ("Uploading report.pdf") with its value, so screen-reader users can query it. Without a known size, it's indeterminate. Progress isn't announced continuously. The Announcer says when uploads start, finish and fail, batched and polite: `fileUpload.filesAdded` ("3 files added"), `fileUpload.filesRejected`, `fileUpload.uploadComplete` ("report.pdf uploaded"), `fileUpload.uploadFailed`, `fileUpload.allUploadsComplete`. The status is also in visible text per item, not only in colour or an icon.
8. **Metadata.** Each item shows:
   - The name, in `<bdi>`, wrapped with `overflow-wrap: anywhere` so long names reflow at 320px.
   - The size, formatted with `Intl.NumberFormat` and the provider's locale, in decimal units ("2,4 MB" in sv). Limit messages use the same formatter, so the limit and the file size compare clearly.
   - The type as a short label from the extension ("PDF"), never the raw MIME type.
   - Optionally the last-modified date (`Intl.DateTimeFormat`) and, for images, the pixel size once the preview has loaded.
9. **Preview.** Opt-in with `FileUpload.Preview`:
   - Images the browser can decode get a thumbnail from `URL.createObjectURL`, revoked when the item is removed or the component unmounts. SVG is shown only through `<img>`, where scripts don't run.
   - The thumbnail has `alt=""`, because the file name is next to it. Other types show the type icon from the Icon registry (ADR-0024), also hidden from assistive technology.
   - No other file content is read: no EXIF, no hashing, no PDF rendering. Docs say photos can carry location data, which the consumer's server should strip.
   - A larger preview (in a Dialog) is out of scope.
10. **Remove, cancel, retry.** Each button's visible text is short ("Remove") and its name adds the file name ("Remove report.pdf"), so the name starts with the visible text (2.5.3). Removing an uploading file cancels it first. After a removal, focus goes to the next item's remove button, else the previous item's, else the trigger, never `body`.
11. **Out of scope:** folder upload, pasting files from the clipboard, chunked or resumable uploads (the consumer's `upload` can do these), image editing or cropping, and a timeout. The component never ends an upload on a timer (2.2.1).
12. **Styling hooks.** Classes `kv-file-upload`, `kv-file-upload-trigger`, `kv-file-upload-drop-zone`, `kv-file-upload-list`, `kv-file-upload-item`, `kv-file-upload-preview`, `kv-file-upload-progress`, `kv-file-upload-item-error`. State as `data-dragging`, `data-status`, `data-disabled`, `data-invalid`.

## Accessibility impact

- 2.1.1 and 2.5.7: the trigger and native dialog always work. Drag-and-drop is never the only way.
- 4.1.2 and 2.5.3: native button, input and progress, and every remove, cancel and retry button names its file.
- 3.3.1 and 3.3.3: each rejected file is named, with what's allowed, in text.
- 4.1.3: added, rejected, finished and failed uploads are announced, batched, without a stream of percentages.
- 1.4.1: status is in text, not only colour or an icon. 1.4.10: long file names wrap at 320px.
- 2.4.3: focus never falls to `body` after a removal.
- 2.2.1: no time limits.
- No APG deviation: there's no pattern. The native input does the work.

## Compliance impact

- No network calls, cookies or telemetry from the library (hard rule 7). Uploads go only where the consumer's `upload` sends them.
- No file content is read except to show an image preview locally. Object URLs are revoked.
- No new dependency.

## Consequences

- Positive: a file upload that works for everyone through the native dialog, with drop, previews and progress as extras, and works with or without JavaScript uploads.
- Negative / trade-offs:
  - The validation exception to ADR-0029 needs to be clear in the docs.
  - Syncing the native input through `DataTransfer` depends on browser support, which is now broad. If it fails, the "with the form" mode falls back to listing files without dropped ones and logs a development warning.
  - i18n keys in all six locales, with plurals and file names as values (ADR-0009): the keys named above, plus `fileUpload.statusPending`, `fileUpload.statusUploading`, `fileUpload.statusComplete`, `fileUpload.statusFailed`, `fileUpload.statusCancelled`, `fileUpload.remove`, `fileUpload.cancel` and `fileUpload.retry`.
- Follow-ups: a plan and `file-upload.a11y.md`, and a design spec for the drop zone, the list, the item states and the preview. It's an M4 component, but because e-service forms need it, the maintainer may move it earlier.

## Validation

- Unit tests on `createFileUpload`: every limit and its message, appending, the queue with `concurrency`, cancel, retry, and object URLs revoked.
- Component tests: names of the trigger, input, progress and item buttons, announcements, focus after removal, `data-status`, and axe in every state.
- e2e: adding files with the keyboard (Playwright's file chooser), dropping files, a rejected file, progress, cancel, retry and remove, with the forced-colors, reduced-motion, RTL and 320px projects.
- Manual AT (pending): NVDA, JAWS, VoiceOver (macOS and iOS), TalkBack and Dragon add, remove and follow the progress of several files.

## References

- WAI-ARIA APG map (`.claude/skills/accessibility/references/apg-patterns.md`): FileUpload
- GOV.UK Design System: File upload (and the multiple-file upload work)
- WCAG 2.2: Understanding 2.5.7 Dragging Movements, 3.3.1, 3.3.3, 4.1.3
- HTML: `<input type="file">`, `accept`, `capture`; `DataTransfer`; `URL.createObjectURL`
- ADR-0007, ADR-0009, ADR-0024, ADR-0029
