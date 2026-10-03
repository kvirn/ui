# Plan 0021: FileUpload

- **Status:** In progress
- **Owner:** Magnus Vike / Claude
- **Created:** 2026-10-02 · **Target:** M4 (maintainer may pull it earlier)
- **Related:** design spec `docs/design/file-upload.md` (ux-designer, in progress)

## Goal

A resident can attach one or more files to an e-service form with the keyboard, voice, switch, touch or a screen reader, as easily as with a mouse. They always know which files were added, which were refused and why, and how far each upload has got.

## Non-goals

Out of scope: folder upload, clipboard paste, chunked or resumable uploads, image editing, timeouts, a larger preview in a Dialog. No network code in the library (hard rule 7).

## Background

No APG pattern. A native `<input type="file">` is always present. Prior art: GOV.UK file upload and multiple-file upload. Decisions are in the design spec and the forms skill. Findings from the codebase survey that shape this plan:

- Field exposes no label `id`. The trigger name ("Choose files, Attachments") needs one. **Phase 0** adds `labelId` to Field (additive, minor).
- Field context has no `descriptionId`. Read `controlProps['aria-describedby']` and put it on the **Trigger**, not on the hidden Input.
- The Announcer does not batch: a second message within 100 ms replaces the first. FileUpload builds one sentence per batch ("3 files added, 1 rejected") and calls `announce` once, with a `key`.
- `createFileUpload` is the first stateful core machine owned by a component. Model it on `createAnnouncer`: injectable env (object URLs, timers, `DataTransfer`), no DOM at import time.
- First component to add an i18n namespace (`fileUpload`). Use `format.plural` and `format.number`, which no catalog uses yet.

## Design

### API sketch

```tsx
<Field.Root>
  <Field.Label>Attachments</Field.Label>
  <Field.Description>Up to 5 files. PDF, JPG or PNG, 10 MB each.</Field.Description>
  <FileUpload.Root
    accept=".pdf,image/jpeg,image/png"
    multiple
    maxFiles={5}
    maxFileSize={10_000_000}
    upload={(file, { signal, onProgress }) => send(file, signal, onProgress)}
    onFilesChange={setFiles}
    onFilesReject={log}
  >
    <FileUpload.DropZone>
      <FileUpload.Trigger />
      <FileUpload.DropHint />
    </FileUpload.DropZone>
    <FileUpload.List>
      {(item) => (
        <FileUpload.Item item={item}>
          <FileUpload.Preview />
          <FileUpload.Name /> <FileUpload.Size /> <FileUpload.Type />
          <FileUpload.Status />
          <FileUpload.Progress />
          <FileUpload.ItemError />
          <FileUpload.CancelButton /> <FileUpload.RetryButton /> <FileUpload.RemoveButton />
        </FileUpload.Item>
      )}
    </FileUpload.List>
    <FileUpload.Input />
  </FileUpload.Root>
</Field.Root>
```

- Core: `createFileUpload(options, env)` returns a `ComponentStore` with state `{ items, isDragging }` and actions `add`, `remove`, `cancel`, `retry`, `uploadAll`, `reset`. Pure checks (`accept`, size, count, `validate`) live in `core/src/file-upload/checks/` and return typed reasons, not strings.
- React: `useFileUpload()` returns `rootProps`, `triggerProps`, `inputProps`, `dropZoneProps`, `getItemProps`, `getProgressProps`, `getRemoveButtonProps` and so on, plus `items`. Types `UseFileUploadOptions`, `UseFileUploadResult` and `FileUploadPartProps` are exported.
- `FileUpload.DropHint` and `FileUpload.Status` are new parts over the earlier list (hint text only with drag support, and per-item status text for 1.4.1). Confirm in the spec.
- Item status: `pending | rejected | uploading | complete | failed | cancelled` as `data-status`.

### Accessibility contract (draft)

One Tab stop for the add control (the Trigger). The hidden Input is `tabIndex={-1}`. The drop zone has no role and isn't focusable. No composite widget, so no arrow keys (the `keyboard` skill: nothing to roam).

| Key         | Action                                                                                              |
| ----------- | --------------------------------------------------------------------------------------------------- |
| Tab         | Moves to the next focusable part: Trigger, then each item's Cancel/Retry/Remove button in DOM order |
| Shift+Tab   | Moves back through the same order                                                                   |
| Enter/Space | On Trigger: opens the native file dialog. On Remove/Cancel/Retry: activates it                      |
| Escape      | Nothing in the component (the native dialog owns it). Does not cancel uploads                       |

- Roles / ARIA:
  - Trigger is a native `<button>`, `aria-labelledby="<trigger id>-text <label id>"` (the id of a span around the Trigger's text, never the button itself), `aria-describedby` from the Field (what to upload, limits, error).
  - Input is a native file input, visually hidden, never `display: none`, labelled by the Field `<label for>`.
  - List is `<ul>`, Item is `<li>`. Progress is a native `<progress>` named "Uploading report.pdf", with `value` and `max`, and indeterminate when the size is unknown.
  - Every Remove, Cancel and Retry button's name starts with its visible text and adds the file name (2.5.3).
  - Item error text is linked to the Item's buttons by `aria-describedby`.
- Focus management:
  - After the dialog closes, focus stays on the Trigger. Adding files moves nothing.
  - After a removal, focus goes to the next item's Remove button, else the previous item's, else the Trigger. Never `body`.
  - When a file's status changes and its button disappears (Cancel on completion), focus moves to the same item's next button, else the Remove button.
- Announcements (polite, through the Announcer, one call per batch): files added and rejected, each upload complete or failed, all uploads complete. No percentages. Progress is only queryable through `<progress>`.
- WCAG SCs: 1.4.1, 1.4.10, 1.4.11, 2.1.1, 2.2.1, 2.4.3, 2.5.3, 2.5.7, 2.5.8, 3.3.1, 3.3.3, 4.1.2, 4.1.3.

### i18n strings

Namespace `fileUpload`, all six locales (`en sv fi nb nn se`). Final wording and plurals come from the design spec.

| Key                                                                                       | en                                                       | sv                                                             |
| ----------------------------------------------------------------------------------------- | -------------------------------------------------------- | -------------------------------------------------------------- |
| `chooseFile` / `chooseFiles`                                                              | Choose file / Choose files                               | Välj fil / Välj filer                                          |
| `dropHint`                                                                                | or drop files here                                       | eller släpp filer här                                          |
| `remove` / `cancel` / `retry`                                                             | Remove / Cancel / Try again                              | Ta bort / Avbryt / Försök igen                                 |
| `removeFile` / `cancelFile` / `retryFile` (`{ name }`)                                    | Remove report.pdf                                        | Ta bort report.pdf                                             |
| `uploadingFile` (`{ name }`)                                                              | Uploading report.pdf                                     | Laddar upp report.pdf                                          |
| `statusPending` / `Uploading` / `Complete` / `Failed` / `Cancelled`                       | Ready / Uploading / Uploaded / Failed / Cancelled        | Redo / Laddar upp / Uppladdad / Misslyckades / Avbruten        |
| `errorType` (`{ name, allowed }`)                                                         | report.docx isn't allowed. Choose a PDF, JPG or PNG file | report.docx är inte tillåten. Välj en PDF-, JPG- eller PNG-fil |
| `errorTooLarge` / `errorTooSmall` (`{ name, limit }`)                                     | … is larger than 10 MB                                   | … är större än 10 MB                                           |
| `errorTooMany` (`{ maxFiles }`)                                                           | You can add up to 5 files                                | Du kan lägga till högst 5 filer                                |
| `filesAdded` / `filesRejected` / `uploadComplete` / `uploadFailed` / `allUploadsComplete` | 3 files added …                                          | 3 filer har lagts till …                                       |

### Theming surface

Classes and state attributes as in the forms skill, plus `kv-file-upload-status` and `kv-file-upload-drop-hint`. The theme section is added to `packages/theme/theme.css` and to the class list in `theme-css.test.ts`. `data-dragging` is shown with a border change that survives forced colours. Reduced motion removes the progress transition. Tokens come from DESIGN.md. A new token needs a recorded decision and `theme:check`.

## Tasks

**Phase 0: Field**

- [x] Expose `labelId` from Field (`labelProps.id`, and on the context). Tests for the id and for no regression of `htmlFor`.

**Phase 1: core**

- [x] Failing tests: every limit and its typed reason (`accept` by MIME and extension, wildcard `image/*`, case, size min and max, `maxFiles` counting existing items, `validate`), appending, duplicate selection, `concurrency`, cancel via `AbortSignal`, retry, remove while uploading, object URLs revoked, unmount reset.
- [x] `createFileUpload` with an injectable env (object URLs, `DataTransfer`). No DOM at import time.
- [x] Export from `core/src/index.ts`.
- [x] Core reworked to design spec (rejections out of the list, empty/duplicate/folder reasons, single-file replace, retryable failures, whole-percent progress).

**Phase 2: i18n**

- [x] `fileUpload` namespace in `types.ts` and all six locales, using `format.plural` and `format.number`. `i18n:check` passes.

**Phase 3: react**

- [x] Failing component tests: names (Trigger, Input, Progress, buttons), describedby wiring, Announcer calls (one per batch), focus after removal and after Cancel disappears, `data-*`, drag-over, drop outside the zone ignored, native input synced through `DataTransfer` in form mode, preview and revoke, axe in every state.
- [x] `useFileUpload`, parts, compound, barrel exports, `warnOnce` for parts outside Root.
- [x] Dev warning when `DataTransfer` sync fails.

**Phase 4: theme, stories, e2e**

- [x] Default-theme styles for every state in the design spec (theme.css section 14).
- [x] Stories: Default, Single, Multiple, Dragging, Disabled, Invalid, Rejected, Uploading (known, unknown), Complete, Failed, Cancelled, ManyFiles, LimitReached, WithPreview, RTL, ForcedColors, Keyboard. `parameters.a11yContract`.
- [x] e2e (Playwright file chooser and drop): every contract row, rejected file, progress, cancel, retry, remove, plus forced-colors, reduced-motion, RTL and 320px projects.

**Phase 5: docs and contract**

- [x] `file-upload.a11y.md` matching the tests. `file-upload.md` with the `XMLHttpRequest` progress recipe, a "client checks aren't security" section, and the EXIF/location warning.
- [x] Roadmap row to `alpha`. Changeset (`react`, `core`, `i18n`, `theme` minor). Plans index rows for 0020 and 0021. Decision record updated for any changes from the spec.
- [ ] accessibility-reviewer returns APPROVE. Manual AT matrix marked `pending`.

## Risks & open questions

- `DataTransfer` sync in form mode depends on browser support. Fallback and dev warning are in the forms skill.
- Whether rejected files stay in the list (the decision says yes). The design review may argue for an error summary instead.
- `pointer: fine` as the drag-and-drop heuristic misses hybrid devices. The spec may propose a better test.
- Announcer throttle (default 3 s per `key`) could swallow a "finished" message that follows an "added" one. Use distinct keys.
- Field `labelId` is a change to a shipped component. It's additive.

## Testing strategy

Core: Node unit tests with a fake env. React: Vitest browser-mode component tests with axe in every story state (`wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa`). e2e: Chromium baseline with the forced-colors, reduced-motion and 320px projects. Manual AT: NVDA, JAWS, VoiceOver (macOS, iOS), TalkBack, Dragon. Marked `pending`, never claimed by an agent.

## Rollout

Ships as `alpha` in the next minor of `core`, `react`, `i18n` and `theme`. Moves to `beta` after the manual AT matrix passes.

## Done when

All quality gates in AGENTS.md pass, the contract matches the tests, the Docs page shows the Keyboard section, accessibility-reviewer returns APPROVE, and the AT matrix is recorded as `pending`.
