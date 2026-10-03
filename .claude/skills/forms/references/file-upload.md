# FileUpload: parts, statuses and checks

Source: `packages/core/src/file-upload/` (store, checks, queue) and `packages/react/src/file-upload/`.

## Parts

`FileUpload.Root`, `Trigger`, `Input`, `DropZone`, `DropHint`, `Limits`, `Rejections`, `Summary`, `List`, `Item`, `Preview`, `Name`, `Type`, `Size`, `Status`, `Progress`, `ItemError`, `Actions`, `CancelButton`, `RetryButton`, `RemoveButton`. `useFileUpload()` serves your own elements. `Limits` is a Prose-style description that registers with the Field.

## Options

`accept`, `maxFileSize`, `minFileSize`, `maxFiles`, `multiple` (default true), `allowDuplicates` (default false), `validate(file)`, `upload(file, { signal, onProgress })`, `concurrency` (default 3), `autoUpload` (default true), `previews` (default false), `disabled`, `onFilesChange`, `onFilesReject`, `messages`.

## Adding files

- Adding appends. With `multiple` off, adding replaces the file (cancelling it first) and `maxFiles` is 1.
- The native input is reset after each add, and the Trigger keeps focus.
- Without `upload`, files stay `pending` and the native input's `files` follow the list through `DataTransfer`, so a plain `<form>` posts them. If the browser cannot do that, a warning says to use `upload`.
- At the file limit the Trigger is `aria-disabled` and stays focusable, with `data-full`.
- With `multiple` off and a file chosen, the Trigger text is `fileUpload.replaceFile`.
- A dropped folder is marked `isDirectory` by the adapter. A file dropped just outside the zone is ignored.

## Rejection reasons

Checked in this order; the first that fails wins. Reasons are data, and the React layer turns each into a sentence from i18n that names the file and what is allowed (3.3.1, 3.3.3).

| Order | `kind`      | Meaning                                                                                 |
| ----- | ----------- | --------------------------------------------------------------------------------------- |
| 1     | `folder`    | A directory was dropped                                                                 |
| 2     | `type`      | Not in `accept` (MIME, extension or wildcard, any case). `allowed` lists the entries    |
| 3     | `empty`     | Size 0                                                                                  |
| 4     | `tooLarge`  | Over `maxFileSize` (`limit` in bytes)                                                   |
| 5     | `tooSmall`  | Under `minFileSize`                                                                     |
| 6     | `duplicate` | Same name, size and last-modified time as a file in the list (unless `allowDuplicates`) |
| 7     | `custom`    | `validate(file)` returned a message                                                     |
| 8     | `tooMany`   | The list is full (`maxFiles`; 1 in single-file mode)                                    |

A wrong file is never told "too many".

## Upload queue

- Statuses: `pending`, `uploading`, `complete`, `failed`, `cancelled`. They show as `data-status` on the item.
- At most `concurrency` uploads run at once. With `autoUpload={false}`, `uploadAll()` starts them.
- `upload` resolves with a result stored on the item, or rejects. Reject with `{ retryable?: boolean, message?: string }` to say more: `retryable: false` removes Retry, and `message` is the consumer's own translated text. Any other rejection is retryable with no message of its own.
- Retry reuses the stored `File`. Removing an uploading file cancels it first (the `AbortSignal` aborts).
- `progress` is whole percent, 0 to 100, or `undefined` while the size is unknown.

## Announcements

- One sentence per batch, from a buffer shared by every FileUpload on the same Announcer.
- User actions (add, remove, rejections) are announced at once, merged within 100 ms. Upload results are announced after about 1 s of quiet, held at most 3 s.
- Progress is never announced.

## Item display

- The name is in `<bdi>` with `overflow-wrap: anywhere`. Size uses `format.number` in decimal units. The type is a short label (`fileUpload.typeUnknown` when unknown).
- Preview is opt-in (`previews`): an `<img alt="">` from an object URL, revoked when the item goes away. SVG shows only through `<img>`. There is no EXIF reading and no hashing.
- Remove, Cancel and Retry names include the file name. Each state shows one action.
- Out of scope: folder upload, clipboard paste, chunked uploads, cropping and "remove all".
- The drop zone has a dashed edge in the default theme, the one that does not mean disabled.
