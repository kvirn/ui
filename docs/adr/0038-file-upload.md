# ADR-0038: FileUpload is a native file input with an optional drop zone, a file list, and an upload queue the consumer drives

- **Status:** Proposed
- **Date:** 2026-10-02
- **Deciders:** Maintainer asked for a file upload with preview, metadata, multiple files, file type restriction, a limit on files at once and upload progress. Revised on the same day after the design spec (`docs/design/file-upload.md`) and an independent WCAG review. The details below are proposed and open to change.
- **Tags:** architecture, api, a11y, i18n, compliance

## Context

E-services ask for attachments: certificates, receipts, photos, ID documents. The roadmap has FileUpload in M4, and the APG map says "a native `<input type=file>` button is always present; the drop zone is an enhancement". There's no APG pattern.

The common failures:

- A drop zone as the only way in, so keyboard, switch, voice and many touch users can't add a file (2.1.1, 2.5.7).
- A hidden file input with a `<div>` styled as a button.
- `accept` treated as validation, although dropped files skip it and the OS dialog lets users pick "All files".
- Errors that say "Invalid file" without saying which file or what is allowed.
- Progress that's only a coloured bar, or a live region that announces every percent.
- Focus on `body` after a file is removed, or a focused button that disappears and hands focus to a destructive one.
- Selecting files a second time replacing the first selection, which is the native behaviour.
- A rejected file shown in the list as if it were attached.

"Max files at once" can mean two things, and both are covered: a limit on how many files the list holds (`maxFiles`), and how many upload at the same time (`concurrency`).

## Decision drivers

- A native `<input type="file">` is always there and always works (hard rule 2).
- Every limit is checked by the component, because the browser doesn't enforce them on drop. Each error names the file and says what is allowed (3.3.1, 3.3.3).
- No network code in the library (hard rule 7). The consumer's code uploads, to the consumer's server.
- Files never leave the device except through the consumer's upload function. No file content is read except for an image preview (GDPR: data minimisation).
- No form state beyond what the file list needs (ADR-0029).
- A screen reader user must never lose an announcement to the shared Announcer, and a repeated key press must never delete a file the user didn't choose.

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

1. **Parts.** `FileUpload.Root` (`<div>`, `kv-file-upload`, inside a Field), `FileUpload.Trigger`, `FileUpload.Input`, `FileUpload.DropZone`, `FileUpload.DropHint`, `FileUpload.Limits` (a Field description built from the props), `FileUpload.Rejections`, `FileUpload.Summary`, `FileUpload.List` (`<ul>`), `FileUpload.Item` (`<li>`), `FileUpload.Preview`, `FileUpload.Name`, `FileUpload.Size`, `FileUpload.Type`, `FileUpload.Status`, `FileUpload.Progress` (native `<progress>`), `FileUpload.Actions`, `FileUpload.RemoveButton`, `FileUpload.CancelButton` and `FileUpload.RetryButton`. Each part is also a named export. The hook is `useFileUpload()`, and the store is `createFileUpload` in `core`. The design spec is the source for the final parts and names.
2. **Trigger and input.** There's one Tab stop, the trigger:
   - The Field's control id and `<label for>` go on the **Trigger**, a native `<button>`. The native input is taken out of the accessibility tree (`aria-hidden="true"`, `tabIndex={-1}`, visually hidden, never `display: none`), so browse mode and voice control see one control, and an error-summary link to the Field's id lands on a visible element (2.4.7). The input carries no `required`.
   - The Trigger's visible text is `fileUpload.chooseFiles` or `fileUpload.chooseFile` ("Choose files"). Its name is that text followed by the Field label, through `aria-labelledby` ("Choose files Attachments (optional)"), so the name starts with the visible text (2.5.3). It's described by the Field's description and error, the limits, and the rejections. It never carries `aria-required`, which a button doesn't allow: a required Field shows through the missing "(optional)" marker.
   - Activating it calls `showPicker()` on the input, or `click()` where that's missing. A click on the label does the same, and is blocked when the limit is reached.
   - `accept`, `multiple`, `capture` and `name` pass through to the input.
   - With `multiple` off and a file chosen, the text is `fileUpload.replaceFile` ("Replace file"). At the limit, the Trigger is `aria-disabled="true"` with `data-disabled`, stays focusable, and is described by the Summary.
3. **Drop zone.** It's an enhancement for drag-and-drop:
   - It isn't focusable and has no role. The keyboard path is the trigger inside it.
   - The drop handlers are always attached. The zone's box and the hint `fileUpload.dropHint` ("or drop files here") are shown when `(any-pointer: fine)` matches (`pointer` reports only the primary pointer, so a touchscreen laptop would lose it), and on any device while a file is dragged over the page (`data-drag-active`).
   - While a file is dragged over it, it gets `data-dragging`. The theme shows that state with a border change that also works in forced colours, not only a colour.
   - While FileUpload is mounted, a file dropped just outside the zone is ignored instead of opening in the tab and leaving the form. `preventDefault` is called only when the drag carries files and isn't over another drop target.
4. **Adding appends,** except with `multiple` off, where a new file replaces the current one. The native input is reset so the same file can be chosen again. The trigger keeps focus after the dialog closes. Nothing else moves focus. Exact duplicates (same name, size and last modified) and empty files are rejected by default (`allowDuplicates` turns the first off).
5. **Limits and validation.** Each added file is checked against `accept` (both MIME type and extension), `maxFileSize`, `minFileSize`, `maxFiles`, emptiness, duplicates, folders, and then the consumer's optional `validate(file)`. This is the one place where a component validates, because drop and "All files" skip the browser's checks. It's a scoped exception to ADR-0029:
   - **A rejected file never enters the list.** It was never added, so listing it would suggest it is attached, count it against `maxFiles`, and add one error row per file when someone drops 20 over a limit of 15. Rejections are shown in `FileUpload.Rejections` for the latest add only, one line per file naming it and saying how to fix it, with its position in the selection when names repeat. They're reported in `onFilesReject` and in `rejections` in the state. The next add, a removal and `reset()` clear them. A cancelled dialog does not. In single-file mode a rejected file leaves the current file in place.
   - Reasons: `type`, `tooLarge`, `tooSmall`, `tooMany`, `empty`, `duplicate`, `folder` and `custom`. Messages say what is allowed and how to get there.
   - The Field's own `invalid` and error message stay with the consumer, who decides whether rejected files block submit.
   - Docs say client checks aren't security: the server must check type, size and content again.
6. **Upload.** Two modes:
   - **With the form** (no `upload` prop): files stay `pending`. The component keeps the native input's `files` in sync with the list (through `DataTransfer`), so a plain `<form>` posts them, dropped files included.
   - **On add** (`upload(file, { signal, onProgress })` returns a promise): the queue uploads as files are added, at most `concurrency`at a time (default 3), or when the consumer calls`uploadAll()`with`autoUpload={false}`. `signal`cancels. The promise's result (for example a server id) is stored on the item and reported in`onFilesChange`.
   - Statuses: `pending`, `uploading`, `complete`, `failed`, `cancelled`, exposed as `data-status` on Item. A failure carries `retryable` (default true) and an optional consumer message. Only an error object that opts in supplies user-facing text, so a bare "Failed to fetch" never reaches a resident.
   - **Retry reuses the stored `File`**, so nobody has to find it again in a phone's picker. Retry shows on `failed` (when retryable) and on `cancelled`.
7. **Progress and announcements.**
   - `FileUpload.Progress` is a native `<progress>` named `fileUpload.uploadingFile` ("Uploading report.pdf"), rendered only while the file is uploading. Its value is whole percent, so a screen reader that reports changes sees at most 100 of them. The percentage is also visible text in the status. Without a known size it's a static indeterminate bar (2.2.2).
   - Announcements are one sentence per batch, built by FileUpload's buffer. The buffer is shared by every FileUpload on the same Announcer, merges with a call made less than about 150 ms earlier, drops held sentences for a file that was removed, retried or cancelled, and names the Field label when several FileUploads are mounted. User actions are announced at once, upload results after about one second of quiet (at most three seconds). No Announcer `key` is used, since its throttle drops messages. A dialog add announces counts only, since the Trigger's description already carries the detail. Progress is never announced.
   - The status is also in visible text per item, not only in colour or an icon.
8. **Metadata.** Each item shows:
   - The name, in `<bdi>`, wrapped with `overflow-wrap: anywhere` so long names reflow at 320px. Duplicate names get a visible "(2)".
   - The size, formatted with `format.number` and the provider's locale, in decimal units ("2,4 MB" in sv). Limit messages use the same formatter, so the limit and the file size compare clearly.
   - The type as a short label from the extension ("PDF"), never the raw MIME type.
   - Optionally the last-modified date (`Intl.DateTimeFormat`) and, for images, the pixel size once the preview has loaded.
9. **Preview.** Opt-in with `FileUpload.Preview`:
   - Images the browser can decode get a thumbnail from `URL.createObjectURL`, revoked when the item is removed or the component unmounts. SVG is shown only through `<img>`, where scripts don't run.
   - The thumbnail has `alt=""`, because the file name is next to it. Other types show the type icon from the Icon registry (ADR-0024), also hidden from assistive technology.
   - No other file content is read: no EXIF, no hashing, no PDF rendering. Docs say photos can carry location data, which the consumer's server should strip.
   - A larger preview (in a Dialog) is out of scope.
10. **Remove, cancel, retry.**
    - Each button's visible text is short ("Remove") and its name adds the file name ("Remove report.pdf"), so the name starts with the visible text (2.5.3).
    - One action per state: an uploading file shows only Cancel, a cancelled or failed one shows Retry and Remove, so a mistaken Cancel costs one press to undo.
    - Removing an uploading file cancels it first.
    - **Whenever a focused button goes away** (after Remove, when Cancel disappears on completion, when Retry or Cancel swap), focus moves to the next item's `<li tabIndex={-1}>`, else the previous item's, else the Trigger, never `body` and never a destructive button. Landing on a button would let one held or repeated Enter delete a file the user never chose. The removal is announced.
11. **Out of scope:** folder upload, pasting files from the clipboard, chunked or resumable uploads (the consumer's `upload` can do these), image editing or cropping, "remove all", and a timeout. The component never ends an upload on a timer (2.2.1).
12. **Styling hooks.** Classes `kv-file-upload` and one per part (`-trigger`, `-drop-zone`, `-drop-hint`, `-limits`, `-rejections`, `-summary`, `-list`, `-item`, `-preview`, `-name`, `-type`, `-size`, `-status`, `-progress`, `-actions`, `-cancel`, `-retry`, `-remove`). State as `data-dragging`, `data-drag-active`, `data-droppable`, `data-status`, `data-disabled`, `data-invalid` and `data-full`.

## Accessibility impact

- 2.1.1 and 2.5.7: the trigger and native dialog always work. Drag-and-drop is never the only way.
- 4.1.2 and 2.5.3: native button, input and progress, and every remove, cancel and retry button names its file. The Trigger has no `aria-required`.
- 3.3.1 and 3.3.3: each rejected file is named, with what is allowed and how to fix it, in text.
- 4.1.3: added, rejected, finished and failed uploads are announced, batched, without a stream of percentages and without losing messages to the shared Announcer.
- 1.4.1: status is in text, not only colour or an icon. 1.4.10: long file names wrap at 320px.
- 2.4.3 and 3.2.1: focus never falls to `body`, and never moves to a destructive button.
- 2.2.1 and 2.2.2: no time limits, and no moving indeterminate bar.
- No APG deviation: there's no pattern. The native input does the work.

## Compliance impact

- No network calls, cookies or telemetry from the library (hard rule 7). Uploads go only where the consumer's `upload` sends them.
- No file content is read except to show an image preview locally. Object URLs are revoked.
- No new dependency.

## Consequences

- Positive: a file upload that works for everyone through the native dialog, with drop, previews and progress as extras, and works with or without JavaScript uploads.
- Negative / trade-offs:
  - The validation exception to ADR-0029 needs to be clear in the docs.
  - Rejected files are reported outside the list, which the consumer must render (the ready-made `Rejections` part does it).
  - Syncing the native input through `DataTransfer` depends on browser support, which is now broad. If it fails, the "with the form" mode falls back to listing files without dropped ones and logs a development warning.
  - i18n keys in all six locales, with plurals and file names as values (ADR-0009). The key list is in the design spec. Northern Sámi starts as English placeholders and blocks `beta`.
  - The default theme adds a dashed drop-zone edge, a new DESIGN.md rule (separate ADR and `theme:check`).
- Follow-ups: plan 0021, `file-upload.a11y.md`, and the design spec `docs/design/file-upload.md`. It's an M4 component, but because e-service forms need it, the maintainer may move it earlier.

## Validation

- Unit tests on `createFileUpload`: every limit and its reason, appending and replacing, the queue with `concurrency`, cancel, retry, `retryable`, rejections lifecycle, and object URLs revoked.
- Component tests: names of the trigger, input, progress and item buttons, one Announcer call per batch (merging, purging, several instances), focus after removal and after a focused button disappears, `data-status`, no `aria-required` on the Trigger, and axe in every state.
- e2e: adding files with the keyboard (Playwright's file chooser), dropping files, a rejected file, progress, cancel, retry and remove, with the forced-colors, reduced-motion, RTL and 320px projects.
- Manual AT (pending): NVDA, JAWS, VoiceOver (macOS and iOS) and TalkBack and Dragon add, remove and follow the progress of several files. Includes how a polite message that arrives with a focus change is read, and what focusing an `<li>` reads.

## References

- WAI-ARIA APG map (`.claude/skills/accessibility/references/apg-patterns.md`): FileUpload
- GOV.UK Design System: File upload (and the multiple-file upload work)
- WCAG 2.2: Understanding 2.5.7 Dragging Movements, 3.3.1, 3.3.3, 4.1.3
- HTML: `<input type="file">`, `accept`, `capture`; `DataTransfer`; `URL.createObjectURL`
- ADR-0007, ADR-0009, ADR-0024, ADR-0029, ADR-0040
- Design spec: `docs/design/file-upload.md`. Plan: `docs/plans/0021-file-upload.md`
