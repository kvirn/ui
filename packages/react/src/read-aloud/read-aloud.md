# ReadAloud

> **In planning. Blocked: waiting for an npm package update and a re-test.** No highlight style is shipped while the component is blocked: the sentence is still registered as `::highlight(kv-read-aloud)`, but nothing paints it until you style it. (Plan 0088.) The accessibility contract is [read-aloud.a11y.md](read-aloud.a11y.md).

A text-to-speech player on the browser's own `speechSynthesis`: no dependency, no server. Play reads the selection the user made in the content, else the whole content, one sentence at a time. It never starts by itself.

- Parts: `ReadAloud.Root` (a `role="group"`), `Play`, `Previous`, `Next`, `Stop`, `Rate`, `Voice`, `Status` (`as`: `span`, `p` or `div`). Each is also reachable as a prop object of `useReadAloud`.
- Play is named `Listen`, `Listen to selected text` while a selection is captured, and `Pause` while reading. Pressing it while paused restarts the sentence (native pause is unreliable, so pause cancels and remembers it).
- Reading a selection collapses it, so the browser's selection paint doesn't hide the sentence highlight.
- The sentence is highlighted with the CSS Custom Highlight API (`::highlight(kv-read-aloud)`) where supported, and the Status shows `Sentence 3 of 12` everywhere. No markup is changed.
- Nothing is announced while reading: the speech is the feedback. Only a failure (`noVoice`, `speechError`) is announced, once, politely.
- Voices are local only by default, so the text never leaves the device. `allowRemoteVoices` opts in to browser voices that may send it to a remote service.
- Without speech support the group shows only the Status (`unsupported`). `Voice` renders only when the language has two or more voices.
- `ReadAloud.SelectionTrigger` is a pointer convenience: a button in the top layer (`popover="manual"`) placed below the end of a selection made with a pointer. It is named `Listen to selected text`, never takes focus, is not a Tab stop and goes away on collapse, Escape, scroll, resize, Stop or use. A keyboard selection never shows it: select with Shift+Arrows and press Play.
- `engine` is advanced and unstable: it exists for tests and a later self-hosted engine.

## Component

```tsx
import { ReadAloud } from '@kvirn-ui/react'

const articleRef = useRef<HTMLElement>(null)

<ReadAloud.Root contentRef={articleRef}>
  <ReadAloud.Play />
  <ReadAloud.Previous />
  <ReadAloud.Next />
  <ReadAloud.Stop />
  <ReadAloud.Rate />
  <ReadAloud.Voice />
  <ReadAloud.Status />
  <ReadAloud.SelectionTrigger />
</ReadAloud.Root>
<article ref={articleRef} lang="sv">…</article>
```

Languages: the `lang` option, else the closest `[lang]` of the content (or above it), else the provider's locale, is the default for text that no `lang` attribute names. A `lang` attribute on an element inside the content wins for that stretch, and the option beats the content element's own `lang`. Each sentence is spoken with a voice for its own language, never a voice of another one. When a sentence has no voice, reading stops there, the Status names the language and it is announced once. A selection follows the same rule, looking up through its ancestors to the content element. The Voice select lists the voices for the default language.

## Hook

```tsx
const reader = useReadAloud({ contentRef })
<div {...reader.rootProps}>
  <button {...reader.playProps}>{reader.playLabel}</button>
  {reader.isSelectionTriggerShown ? (
    <button {...reader.selectionTriggerProps}>{reader.selectionLabel}</button>
  ) : null}
</div>
```

Options: `contentRef`, `lang`, `engine`, `allowRemoteVoices`, `highlight` (default `true`), `scroll` (default `true`, off under `prefers-reduced-motion`), `messages`, `onStatusChange`. Mark content that must not be read with `data-kv-read-aloud-skip`.

## Voices

Only local voices are used by default, so the text never leaves the device. Chrome and Edge network voices (Google, Microsoft) are filtered out unless `allowRemoteVoices` is set; then the text is sent to that provider.

A browser may have no local voice for a language, or none at all. The player then shows the "no voice" text and stays silent, and a dev build warns in the console with the voice counts. KvirnUI doesn't promise that any language is available.

- **Linux:** the browser needs `speech-dispatcher` and a synthesizer such as `espeak-ng`: `sudo apt install speech-dispatcher espeak-ng libspeechd2`, then restart the browser. Snap and Flatpak browsers may not reach it. Brave removes the network voices.
- **macOS and Windows:** local voices ship with the system. Add more in the system's speech settings; each language needs its own.

## Accessibility

See the contract: [read-aloud.a11y.md](read-aloud.a11y.md).
