# Accessibility contract: FileUpload (Root, Trigger, Input, DropZone, DropHint, Limits, Rejections, Summary, List, Item, Preview, Name, Type, Size, Status, Progress, Actions, CancelButton, RetryButton, RemoveButton)

- **APG pattern:** none. There is no APG pattern for a file upload. The way in is a native `<button>` that opens the system file dialog, backed by a hidden native `<input type="file">`. A drop zone is an enhancement for devices that drag, never the only way in (2.1.1, 2.5.7). Prior art: GOV.UK file upload and multiple file upload.
- **Deviations:** none from APG. Decisions: ADR-0038 (one native button and a hidden input, rejected files kept out of the list, announcements batched into one sentence, focus on the item after a removal), ADR-0040 (the Announcer), ADR-0039 (keys), ADR-0029 (a scoped exception: the component checks the files it is given), design spec `docs/design/file-upload.md`.
- **Native elements used:** `<button>` (Trigger, Cancel, Retry, Remove), `<input type="file">` (Input), `<progress>` (Progress), `<ul>` and `<li>` (List, Item, and the lines of Rejections), `<div>` (Root, DropZone, Actions), `<p>` (DropHint, Summary, Status).
- **Status:** alpha candidate (Plan 0021). Gates pass once accessibility-reviewer returns APPROVE. Manual AT is `pending`.
- **Tests:** `file-upload.test.tsx` and `file-upload-announcements.test.ts` next to this file. `file-upload.stories.tsx` and `file-upload.e2e.ts` in `apps/storybook/src/components/file-upload/`.

A FileUpload lets someone attach files to a form. One button opens the system dialog. Files can also be dropped on a zone around it. Each file is checked against the limits, and a refused file never enters the list: it is named under the button, with how to fix it. Accepted files show in a list with their name, type, size and status, and can be uploaded through the consumer's own `upload` function, with a native progress bar. The library sends nothing anywhere.

## Roles, states, properties

| Part                  | Element / role                             | ARIA / state                                                                                                                                                                                                          | Notes                                                                                                                                                                                                                            |
| --------------------- | ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FileUpload.Root       | `<div>`, no role                           | none. `data-drag-active`, `data-full`, `data-invalid`, `data-disabled`                                                                                                                                                | Class `kv-file-upload`. Takes the options (`accept`, `multiple`, `maxFiles`, `maxFileSize`, `minFileSize`, `allowDuplicates`, `validate`, `upload`, `concurrency`, `autoUpload`, `disabled`, `messages`) and callbacks           |
| FileUpload.Trigger    | `<button>`                                 | `aria-labelledby` (the id of the text span inside the button, `triggerTextId`, then the Field label), `aria-describedby` (the Field description and error, Limits, Rejections, and Summary when full), `aria-invalid` | Class `kv-button kv-file-upload-trigger`. Carries the Field's control id, so the label and an error-summary link reach it. **Never `aria-required`**. At `maxFiles`: `aria-disabled="true"` and `data-disabled`, still focusable |
| FileUpload.Input      | `<input type="file">`                      | `aria-hidden="true"`, `tabindex="-1"`, native `disabled`. Never `required`                                                                                                                                            | Visually hidden by inline style, never `display: none`. The Root adds one if you render none. `name`, `capture` and `form` pass through. `accept` and `multiple` come from the Root                                              |
| FileUpload.DropZone   | `<div>`, no role                           | none. `data-droppable`, `data-dragging`, `data-invalid`, `data-disabled`                                                                                                                                              | Class `kv-file-upload-drop-zone`. Not focusable, not clickable. The keyboard path is the Trigger inside it. The drop handlers are always attached                                                                                |
| FileUpload.DropHint   | `<p>`                                      | none                                                                                                                                                                                                                  | "or drop files here". Part of the zone. Not in the Trigger's name                                                                                                                                                                |
| FileUpload.Limits     | `<p>` (a Field description)                | referenced by the Trigger's `aria-describedby`                                                                                                                                                                        | Built from the props, so it can't disagree with `maxFiles`, `maxFileSize` and `accept`                                                                                                                                           |
| FileUpload.Rejections | `<div>` with a `<ul>`                      | referenced by the Trigger's `aria-describedby`                                                                                                                                                                        | The latest add's refused files, one line each: the file's name and how to fix it. Cleared by the next add, a removal and `reset()`. A cancelled dialog does not clear it                                                         |
| FileUpload.Summary    | `<p>`                                      | referenced by the Trigger's `aria-describedby` when the list is full                                                                                                                                                  | "2 of 5 files added". At the limit it says what to do next                                                                                                                                                                       |
| FileUpload.List       | `<ul>`                                     | none                                                                                                                                                                                                                  | Class `kv-file-upload-list`. Holds accepted files only                                                                                                                                                                           |
| FileUpload.Item       | `<li>`                                     | `data-status` (`pending`, `uploading`, `complete`, `failed`, `cancelled`), `tabindex="-1"`                                                                                                                            | Class `kv-file-upload-item`. Focusable by script only: it takes focus when a button in it goes away                                                                                                                              |
| FileUpload.Name       | `<bdi>`                                    | none                                                                                                                                                                                                                  | The file name. Wraps anywhere. A second file with the same name reads `name (2)`                                                                                                                                                 |
| FileUpload.Type, Size | `<span>`                                   | none                                                                                                                                                                                                                  | A short label from the extension (`PDF`), never the MIME type. The size in decimal units with the locale's separator (`2,4 MB`)                                                                                                  |
| FileUpload.Status     | `<p>`                                      | none                                                                                                                                                                                                                  | The state in text (ready, uploading 40 %, uploaded, failed, cancelled), so colour and icons never carry it alone (1.4.1)                                                                                                         |
| FileUpload.Progress   | `<progress>`                               | named "Uploading report.pdf", `value` and `max` as whole percent. Indeterminate when the size is unknown                                                                                                              | Rendered only while the file is uploading, never focusable, never live. A static hatch when indeterminate (2.2.2)                                                                                                                |
| Item buttons          | `<button>`                                 | Cancel: "Cancel upload of report.pdf". Retry: "Try again with report.pdf". Remove: "Remove report.pdf". Each name starts with its visible text (2.5.3)                                                                | One action per state. Uploading: Cancel. Failed (retryable) or cancelled: Retry and Remove. Otherwise: Remove                                                                                                                    |
| `useFileUpload`       | the same attributes, for your own elements | `rootProps`, `triggerProps`, `inputProps`, `dropZoneProps`, `getItemProps`, `getProgressProps`, `getRemoveButtonProps`, `getCancelButtonProps`, `getRetryButtonProps`, state                                          | Options as the Root. Spread each on its element                                                                                                                                                                                  |

Rules, tested in `file-upload.test.tsx`:

- **One control.** The Trigger is the only control that adds files and the only Tab stop for it. The native input is out of the accessibility tree and out of the Tab order, so browse mode and voice control see one control, and an error-summary link to the Field's id lands on a visible button (2.4.7).
- **The Trigger's name** points at a `<span id="…-text">` that holds its visible text, then at the Field label (never at the button itself, which a native `<label for>` would outrank). With the hook, wrap your text in `<span id={triggerTextId}>`. A `render` that writes its own children must keep that span, or the name is only the label (a development warning says so). The name starts with its visible text, then the Field label ("Choose files Attachments (optional)"), so a voice user can say "click Choose files" (2.5.3) and two uploads on a page tell apart. A click on the label opens the dialog too.
- **No `aria-required` on the Trigger,** and no `required` on the input. A button doesn't allow `aria-required`. A required Field shows through the missing "(optional)" marker, and the consumer's error says "required".
- **Every limit is checked here,** because a drop and "All files" skip the browser's checks: type (by MIME type and extension), largest and smallest size, how many files, empty, duplicate (same name, size and last modified), folder, and the consumer's `validate`. A refused file **never enters the list**, never counts toward `maxFiles`, and never uploads. The Field is not marked invalid by it.
- **Adding appends,** except with `multiple` off, where a new file replaces the old. A refused new file leaves the old one in place. With an `upload` function the input is reset after each add, so the same file can be chosen again. Without one, the input holds the list (through `DataTransfer`), so a plain form posts it.
- **Statuses** are exposed as `data-status` and in text. A failure shows neutral words and never the raw error of the network. Only an error object that opts in (`retryable`, `message`) supplies text of its own.
- **Retry reuses the stored `File`,** so nobody has to find it in a phone's picker again.
- **The limits are said before anyone chooses** (3.3.2): `FileUpload.Limits` or a Field description. A development warning fires if `accept`, `maxFiles` or `maxFileSize` is set and neither exists.
- **`render` on every part,** with class and handlers merged, and refs merged.
- **Dev warnings:** a part outside a Root, the limits not said (3.3.2), and a missing Announcer when a message has to be announced. The types leave out `aria-required` and `required` on the Trigger and the input.

## Keyboard

<!-- Format and rules: the `keyboard` skill (ADR-0039). Shown on the Storybook Docs page. -->

- **Focus strategy:** native
- **Selection follows focus:** n/a
- **Arrows wrap:** n/a
- **Shortcuts:** none

| Key         | Context                   | Action                                                                                                                             | Test                                                              |
| ----------- | ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| Tab         | before the field          | Moves focus to the Trigger. It is one stop. The hidden input and the drop zone are never stops                                     | `file-upload.e2e.ts › Tab focuses the Trigger once`               |
| Tab         | on the Trigger            | Moves to the first button of the first item, or to the next element when the list is empty. Items are not stops, their buttons are | `file-upload.e2e.ts › Tab goes on to the item buttons`            |
| Shift+Tab   | on a button of an item    | Moves back, to the Trigger after the first item                                                                                    | `file-upload.e2e.ts › Shift+Tab goes back to the Trigger`         |
| Enter       | on the Trigger            | Opens the system file dialog. Chosen files are added, and focus stays on the Trigger                                               | `file-upload.e2e.ts › Enter opens the file dialog`                |
| Space       | on the Trigger            | Opens the system file dialog, as Enter                                                                                             | `file-upload.e2e.ts › Space opens the file dialog`                |
| Enter/Space | on the Trigger, list full | Does nothing: the Trigger is `aria-disabled`. It stays focusable and its description says why                                      | `file-upload.e2e.ts › the Trigger does nothing at the limit`      |
| Enter/Space | on Remove                 | Removes the file. Focus moves to the next item, else the previous one, else the Trigger. The removal is announced                  | `file-upload.e2e.ts › Remove moves focus to the next item`        |
| Enter/Space | on Cancel                 | Cancels the upload. The file stays, with Retry and Remove. Focus moves to the item                                                 | `file-upload.e2e.ts › Cancel keeps the file and focuses the item` |
| Enter/Space | on Retry                  | Starts the upload again with the same file. Focus moves to the item, since Retry goes away                                         | `file-upload.e2e.ts › Retry restarts the upload`                  |
| Escape      | anywhere in the field     | Nothing. The system dialog owns Escape, and a running upload is never ended by a key                                               | `file-upload.e2e.ts › Escape does nothing`                        |
| Characters  | anywhere in the field     | Nothing. There is no type-ahead and no shortcut                                                                                    | `file-upload.e2e.ts › Escape does nothing`                        |

## Focus management

- The Trigger keeps focus after the dialog closes and after files are added. Nothing else moves focus on an add.
- **Whenever a focused button goes away** (Remove, Cancel when the upload finishes, Retry when it restarts), focus moves to the next item's `<li tabindex="-1">`, else the previous item's, else the Trigger. It never falls to `body`, and it never lands on a destructive button: a held or repeated Enter would delete a file the user didn't choose.
- Items are not Tab stops. A script focuses them only to keep focus in place.
- A rejected file moves no focus. Its line is in the Trigger's description.
- The drop moves no focus.

## Announcements

- Through the shared Announcer, politely (ADR-0040). One sentence per batch, built by FileUpload's buffer, so a second call never replaces the first. The buffer is shared by every FileUpload on the same Announcer, merges calls less than about 150 ms apart, drops held sentences for a file that was removed, retried or cancelled, and names the Field label when several FileUploads are mounted.
- **Now:** files added and refused (counts and the file's name for one), a removal, the list becoming full, and a start of uploads when not automatic. After a dialog add it announces counts only, because the Trigger's description already carries the detail and screen readers re-read it when focus returns. After a drop it announces the full text.
- **After about one second of quiet (at most three):** uploads finished, failed or all done.
- **Never:** percentages. Progress is only a native `<progress>` that a screen reader can query.
- No Announcer `key` is used: its throttle drops messages instead of delaying them.

## Consumer responsibilities

- **Say the limits** with `FileUpload.Limits` or a Field description, and give the Field a label that says what to attach.
- **Check on the server.** A client check is not security: type, size and content are checked again where the file lands. Photos can carry location data, which the server should strip.
- **Decide whether refused files block the form.** `onFilesReject` reports them as data. The Field's `invalid` and its message are yours.
- **Write `upload`.** The library sends nothing. Report progress as a fraction from 0 to 1, honour the `signal`, and reject with an error object that has `retryable` and `message` to say more than the neutral text.
- **Translate your own text** (the label and the description) and set `lang` where a locale isn't translated yet (3.1.2).
- **Provide the Announcer** (`KvirnProvider`). Without one, nothing is announced and a warning says so.

## Visual / modes

- The default theme draws the zone with a dashed edge where a precise pointer exists or a file is dragged over the page, and a solid heavier edge with a tint while a file is over it. That also holds in forced colours (an edge, not only a colour).
- Each item has a status bar at its start edge, plus the status in text. In forced colours the bar is shown only on failed items.
- Targets are at least 24 px, and 44 px on coarse pointers (2.5.8). Long names wrap anywhere, so a 120-character name doesn't scroll sideways at 320 px (1.4.10). RTL mirrors through logical properties.
- Reduced motion removes every transition. An indeterminate bar is a static hatch (2.2.2).
- On devices without a precise pointer there is no zone and no hint: only the button.

## WCAG SCs covered

| SC     | Name                   | How                                                                                |
| ------ | ---------------------- | ---------------------------------------------------------------------------------- |
| 1.3.1  | Info and Relationships | A real `<button>`, `<ul>`, `<progress>`, labels and descriptions through ids       |
| 1.4.1  | Use of Color           | Status, errors and limits in text, with an icon, never colour alone                |
| 1.4.10 | Reflow                 | Names wrap anywhere, the list is one column at 320 px                              |
| 1.4.11 | Non-text Contrast      | Zone edge, status bar and focus ring pass `theme:check`                            |
| 2.1.1  | Keyboard               | The Trigger opens the native dialog                                                |
| 2.2.1  | Timing Adjustable      | No timers end an upload                                                            |
| 2.2.2  | Pause, Stop, Hide      | No moving indicator: the indeterminate bar is static                               |
| 2.4.3  | Focus Order            | Focus never falls to `body` after a removal, and stays on a non-destructive target |
| 2.4.7  | Focus Visible          | The Trigger carries the Field's id, so an error link lands on a visible control    |
| 2.5.3  | Label in Name          | Every button's name starts with its visible text                                   |
| 2.5.7  | Dragging Movements     | Dragging is never the only way: the Trigger                                        |
| 2.5.8  | Target Size (Minimum)  | 24 px, 44 px on coarse pointers                                                    |
| 3.2.2  | On Input               | Adding a file submits nothing and moves no focus                                   |
| 3.3.1  | Error Identification   | Each refused file is named in text                                                 |
| 3.3.2  | Labels or Instructions | The limits are said before the choice                                              |
| 3.3.3  | Error Suggestion       | Each message says how to fix it                                                    |
| 3.3.7  | Redundant Entry        | Retry reuses the stored file                                                       |
| 4.1.2  | Name, Role, Value      | Native elements, the Trigger without `aria-required`                               |
| 4.1.3  | Status Messages        | Batched, polite announcements that never replace one another                       |

## AT test record

`pending`. Agents never claim this (AGENTS.md). To run before `beta`: NVDA, JAWS, VoiceOver (macOS and iOS), TalkBack and Dragon add several files, hear a refused file, follow an upload, cancel, retry and remove. Include how VoiceOver on macOS reads a polite message that arrives with a focus change, and what focusing an `<li>` reads on iOS and TalkBack.

## Known issues

- The Northern Sámi strings are English placeholders and block `beta`. The Finnish, Norwegian Bokmål and Nynorsk strings are drafts for a translator.
- HEIC photos: whether Safari converts to JPEG for `accept=".jpg"` in every path needs a device check before `beta`.
- Client-side limits can be bypassed. The server must check again.
- Under React's `<Activity mode="hidden">` the effect cleanup resets the list and aborts running uploads. Keep a FileUpload mounted while a form is hidden.
- The Trigger's name is read from the text span and the Field label. Chrome's accessibility tree is checked in e2e. Firefox and WebKit have not been run yet.
