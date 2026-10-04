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

- [x] Failing component tests: names (Trigger, Input, Progress, buttons), describedby wiring, Announcer calls (one per batch), focus after removal and after Cancel disappears, `data-*`, drag-over, drop outside the zone ignored (an e2e test: it needs a real page), native input synced through `DataTransfer` in form mode, preview and revoke, axe in every state. Completed in the review of 2026-10-04: the describedby order per state, the item buttons' description, the announcement rows in `sv` and `en`, dragging, the preview URL revoked, the dev warnings and the public API.
- [x] `useFileUpload`, parts, compound, barrel exports, `warnOnce` for parts outside Root.
- [x] Dev warning when `DataTransfer` sync fails.

**Phase 4: theme, stories, e2e**

- [x] Default-theme styles for every state in the design spec (theme.css section 14).
- [x] Stories: Default, SingleFile, WithFiles, Dragging, Disabled, Invalid, Required, Rejected, Uploading (known: `Uploading`, unknown: `UploadingUnknownSize`), Complete, Failed, Cancelled, ManyFiles, LongNames, LimitReached, WithPreview, RTL, ForcedColors, Keyboard. `parameters.a11yContract`. **Decision (2026-10-04):** no separate `Multiple` story. `Default` is multiple and `WithFiles` shows several files, so a third would repeat them (storybook-docs: no story that repeats another). `Dragging` was missing and is added: its play dispatches the drag and leaves it, so axe runs on the dragging state in all four themes.
- [x] e2e (Playwright file chooser and drop): every contract row, rejected file, progress, cancel, retry, remove, plus forced-colors, reduced-motion, RTL and 320px projects.

**Phase 5: docs and contract**

- [x] `file-upload.a11y.md` matching the tests. `file-upload.md` with the `XMLHttpRequest` progress recipe, a "client checks aren't security" section, and the EXIF/location warning.
- [x] Roadmap row to `alpha`. Changeset (`react`, `core`, `i18n`, `theme` minor). Plans index rows for 0020 and 0021. Decision record updated for any changes from the spec.
- [x] accessibility-reviewer returns APPROVE (re-review, 2026-10-04, after the fixes in the review section). Manual AT matrix marked `pending`.
- [x] Scoped gates, 2026-10-04: `vp check` 0 errors (2 pre-existing warnings); `vp test` 316 then 201 after the last fix (component, core, stories in four themes, keyboard-docs); e2e chromium 29/29

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

## Review 2026-10-04

accessibility-reviewer found no code defect. It found tests that did not prove the contract, plus rule 13 duplicates. Fixed:

- **Describedby.** The test that claimed to prove the Trigger's description only checked that ids exist. Four tests now assert the ids and their order per state: empty (hint, limits), after a refusal (+ rejections), full (+ summary, after the rejections) and invalid (the error comes after the Field's descriptions and before the rejections and summary). The contract row said "hints and error, Limits, Rejections, Summary", which did not match: it now states the real order. A test also asserts `toHaveAccessibleDescription` on Cancel, Retry and Remove (the Status, and the ItemError while failed).
- **Announcements.** One test per contract row, in `sv` and `en`, with fake timers reading the polite region: a dialog add (refused files as a count only), a drop (full sentences), a removal, the list filling up, `uploadsStarted` (through the hook, since no part exposes `uploadAll`), results reported from the store (one finished, one finished and one failed), a result dropped by `forget`, and percentages never announced.
- **Dragging and previews.** A `Dragging` story (plan lines 133 and 140 were ticked but it did not exist). Tests: `data-dragging` set, kept when moving onto a child, cleared on leave; `dropEffect` `copy`, and `none` on a disabled zone (which also adds nothing); the DropHint text while dragging; the preview object URL revoked on removal.
- **The contract's "tested in" claims.** One test per development warning (outside a Root, limits not said, no warning when `Limits` is there, no Announcer, the Trigger's text span dropped, `DataTransfer` unsupported) and one public-API test (`render`, class, handlers, refs and part classes on every part).
- **Focus race (3.2.1), a real defect of the code, non-blocking.** The layout effect moved focus back to an item when the user had clicked away from a button that was still there, if a progress tick rendered before the blur handler's `setTimeout(0)` cleared the record. The effect now decides by whether the last focused element is still in the page (`isConnected`), not by a timer. Test: `clicking away from a button that is still there is not undone by the next progress tick (3.2.1)`.
- **Contract drift.** The List has `role="list"` and `aria-labelledby` the Field label. Cancel and Retry move focus to the same item (Remove goes to the next or previous item, else the Trigger). The item buttons' `aria-describedby` is in the Roles table. The limits are said by `FileUpload.Limits` or a `Field.Hint` (Plan 0029: a hint is the short instruction under the control, a Prose is the description. The warning already said `Field.Hint`).
- **D9.** A test: a click on the Field label opens the dialog, and does nothing once the list is full.
- **Rule 13 duplicates deleted.** e2e `a refused file is named under the button and never enters the list` (kept: component test `a file of the wrong type never enters the list: it is named in Rejections, with how to fix it` and the `Rejected` story), `the progress bar is native and named, and goes away when the upload ends` (kept: `a native progress bar named for the file shows only while uploading, and the item completes` and the `Uploading` story), `right to left mirrors the list` (kept: the `RTL` story), `the Trigger is at least 24×24 (2.5.8)` (kept: `expectMinimumTargetSize` in the `Default` story). Story plays that repeated component tests: `Default` (aria-required, aria-hidden, tabindex, describedby: kept `the Trigger never carries aria-required, even in a required Field`, `the native input is out of the accessibility tree, never required, and named for nobody` and the describedby tests), `Required` (the same), `LimitReached` (kept `at maxFiles the Trigger stays focusable but is aria-disabled with data-disabled`) and `Complete` (kept the uploading test). The e2e 1.4.10 test moved to the `LongNames` story, which now uses `expectNoHorizontalOverflow` in a 320px column like the other stories.
- **e2e `the Trigger does nothing at the limit`** no longer waits 150 ms: it counts `filechooser` events and flushes with a round trip to the page.

Open follow-ups:

- [ ] AT matrix row: a dialog add announces the refused files as a count only (the Trigger's description carries the detail). Check with VoiceOver with hints off that the detail is still reachable. Consider announcing the first rejection line.
- [ ] 1.4.12 text spacing and the forced-colours boundary (the dragging edge, the failed item's bar) are covered by the sweep only (`E2E_BROWSERS=sweep`).
- [ ] Focus falls to `body` if the Field becomes disabled while the Trigger has focus (the native `disabled` drops it). Decide: move focus to the Field's label or leave it.
- [x] **Ruled 2026-10-04: keep it** (testing skill, standing exception). Was: the e2e axe loop is repeated in about 23 specs (rule 13: it re-runs what the story axe projects check). It was left in place here.
- [ ] **Maintainer approval to record:** the DESIGN.md:506 rule for the dashed zone edge. The design spec §9 Q6 still says "pending".
- [ ] Maintainer to confirm: no `Multiple` story (Phase 4 says why).
