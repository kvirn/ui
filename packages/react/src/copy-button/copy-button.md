# CopyButton

> **Draft** (Plan 0060). This page moves to the docs site once `apps/docs` has a content system. The accessibility contract is [copy-button.a11y.md](copy-button.a11y.md).

A [Button](../button/button.md) that writes a text to the clipboard: a case or payment reference number, a code sample. It is one `<button type="button">`.

- The name is `copyButton.label` ("Copy") and never changes to "Copied". The result is announced through the `KvirnProvider`'s live region: `copyButton.copied` (polite) or `copyButton.failed` (assertive).
- On failure (no permission, an insecure context, no Clipboard API) the contents of `textRef` are selected, so the user can copy by hand. Pass the element that shows the text.
- `children` replace the label. With more than one CopyButton on a page, name what each copies ("Copy reference number") and keep the visible words in the name (2.5.3).
- The result is also drawn after the button in `span.kv-copy-status`: a decorative `check` or `warning` icon and the words `copyButton.copied` or `copyButton.failed`. It is not a live region (the announcement already speaks it). `copied` clears after five seconds or on the next press; `failed` stays until the next press. `status={false}` renders none, so you can draw your own.
- `data-status` is `idle`, `copied` or `failed`, for your own cue.
- `disabled`, `focusableWhenDisabled` and `ref` work as on Button. `onCopied(text)` and `onCopyError(text)` report the result.
- Headless: no CSS. With `@kvirn-ui/theme/theme.css` it is a `kv-button`.
- Copying needs a secure context and a user activation. A server render shows the label and does nothing else.

## Component

```tsx
import { CopyButton } from '@kvirn-ui/react'

const numberRef = useRef<HTMLSpanElement>(null)

<p>
  Ditt ärendenummer är <span ref={numberRef}>PK-2026-004217</span>.
</p>
<CopyButton text="PK-2026-004217" textRef={numberRef}>
  Kopiera ärendenumret
</CopyButton>
```

## Hook

```tsx
import { useCopyButton } from '@kvirn-ui/react'

const copy = useCopyButton({ text: 'PK-2026-004217', textRef })
<button {...copy.buttonProps}>{copy.label}</button>
```

## Accessibility

See the contract: [copy-button.a11y.md](copy-button.a11y.md).
