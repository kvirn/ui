---
'@kvirn-ui/react': minor
'@kvirn-ui/i18n': minor
'@kvirn-ui/theme': minor
---

`CopyButton` and `CodeBlock` (Plan 0060). `CopyButton` is a Button that writes a text to the clipboard. Its name is "Copy" (message `copyButton.label`) and never changes to "Copied": the result is announced through the `KvirnProvider`'s live region, `copyButton.copied` (polite) or `copyButton.failed` (assertive). When the browser refuses (no permission, an insecure context, no Clipboard API) it announces the failure and selects the contents of `textRef`, so the user can copy by hand. `data-status` is `idle`, `copied` (back to `idle` after five seconds or on the next press) or `failed` (until the next press). The result is also drawn: `CopyButton` renders `span.kv-copy-status` after the button, a decorative `check` or `warning` icon and the same words, not a live region. `CodeBlock.Copy` inherits it, and `status={false}` renders none. `CodeBlock` is a namespace: `Root` (a `group` named by the Label while one is mounted), `Label`, `Code` (a `pre` that wraps, with no 2D scroll and no highlighting) and `Copy`.

- React: `CopyButton`, `useCopyButton`, `CodeBlock` (and `CodeBlockRoot`, `CodeBlockLabel`, `CodeBlockCode`, `CodeBlockCopy`), `useCodeBlock` and their types. `CopyButton` calls `onCopied(text)` and `onCopyError(text)`; it takes `onCopied` rather than `onCopy`, which is the native clipboard event.
- i18n: the new namespace `copyButton` (`label`, `copied`, `failed`) in `KvirnMessages` and all six catalogs. A custom catalog must add it. `fi`, `nb` and `nn` are drafts and `se` is an English placeholder, all for native review.
- Theme: `kv-copy-status`, `kv-code-block`, `kv-code-block-label`, `kv-code-block-code` and `kv-code-block-copy`. `.kv-code-block` is a wrapping row, so Copy and its status share the last line. The Root is in prose's not-prose list.
