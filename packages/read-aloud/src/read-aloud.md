# ReadAloud

> **Private, in planning for 1.2.** This is the package `@kvirn-ui/read-aloud`; it is not published yet.

> **In planning.** Plan 0153: ReadAloud speaks on Kvirn's own voice service only — no browser speech, no third-party voice. The accessibility contract is [read-aloud.a11y.md](read-aloud.a11y.md).

A text-to-speech player on the Kvirn voice service: one sentence per request, a natural Nordic voice in every browser and OS, from an EU host that stores no text and sets no cookies unless you opt in. Play reads the selection the user made in the content, else the whole content, one sentence at a time. It never starts by itself.

- Parts: `ReadAloud.Root` (a `role="group"`), `Play`, `Previous`, `Next`, `Stop`, `Rate`, `Voice`, `Status` (`as`: `span`, `p` or `div`), `Note`. Each is also reachable as a prop object of `useReadAloud`.
- Play is named `Listen`, `Listen to selected text` while a selection is captured, and `Pause` while reading. Pause is real: `Listen` resumes mid-sentence, never restarting it.
- Reading a selection collapses it, so the browser's selection paint doesn't hide the sentence highlight.
- The sentence is highlighted with the CSS Custom Highlight API (`::highlight(kv-read-aloud)`) where supported, and Status shows `Sentence 3 of 12` everywhere: the highlight is a bonus, never the only position cue.
- Nothing is announced while reading: the speech is the feedback. A wait past 300 ms shows a spinner and, past 1 second, is announced once per press (never once per sentence, and never for a later chunk buffering mid-read). A skipped part is shown in Status but never announced. Only a failure is announced, once, politely.
- `Voice` renders only when the content's language has two or more voices; the default composition leaves it out (there is seldom a real choice to make) and the voice list arrives only after the first press.
- `Note` is the privacy affordance: who receives the text and that nothing is stored, with an optional link to your own "how it works" page. Renders nothing without a `name`.
- `ReadAloud.SelectionTrigger` is a pointer convenience: a button in the top layer (`popover="manual"`) placed below the end of a selection made with a pointer. It is named `Listen to selected text`, never takes focus, is not a Tab stop and goes away on collapse, Escape, scroll, resize, Stop or use. A keyboard selection never shows it: select with Shift+Arrows and press Play.

## Component

```tsx
import { ReadAloud } from '@kvirn-ui/react'

const articleRef = useRef<HTMLElement>(null)

<ReadAloud.Root contentRef={articleRef} url="https://voice.kvirn.com" name="Kvirn's voice service">
  <ReadAloud.Play />
  <ReadAloud.Previous />
  <ReadAloud.Next />
  <ReadAloud.Stop />
  <ReadAloud.Rate />
  <ReadAloud.Status />
  <ReadAloud.Note howItWorksHref="/privacy#read-aloud" />
  <ReadAloud.SelectionTrigger />
</ReadAloud.Root>
<article ref={articleRef} lang="sv">…</article>
```

### The engine: provider, standalone, or your own

The speech engine reaches a player in this order, the first that applies winning:

1. `engine` on `ReadAloud.Root` / `useReadAloud` — an already-built `ReadAloudEngine`, used as-is. For a fake in tests and stories, or your own engine.
2. `url` (with `name`, `store`, `timeout`, `voices`) on `ReadAloud.Root` / `useReadAloud` — builds and memoises `kvirnSpeechEngine({ url, ... })` for that player alone.
3. `<KvirnProvider readAloud={{ url, name, store, timeout, voices }}>` — builds **one** engine, shared by every player under it. Do this once, high in the tree: the single `<audio>` element that Play's user gesture unlocks for iOS must be shared, or each player relocks (and may fail silently) on its own first press.

With none of the three, `ReadAloud.Root` renders nothing and a development warning names them.

```tsx
<KvirnProvider readAloud={{ url: 'https://voice.kvirn.com' }}>
  <ReadAloud.Root contentRef={articleRef}>…</ReadAloud.Root>
  {/* a second player elsewhere in the tree shares the same engine */}
</KvirnProvider>
```

**The voice language is the content's, never the UI's.** `KvirnProvider`'s `locale` is what the buttons say ("Listen" vs "Lyssna"); the voice is picked for the _content's_ declared language, read from the closest `[lang]` on or above it. A Finnish municipality with a Finnish-language UI around Swedish-language content still reads it in Swedish, and the mirror case (an English UI over Swedish content) never reads Swedish aloud with an English voice (3.1.2 Language of Parts). Only content with no `lang` at all falls back to the provider's `locale`, then to `en`.

## Hook

```tsx
const reader = useReadAloud({ contentRef, url: 'https://voice.kvirn.com' })
<div {...reader.rootProps}>
  <button {...reader.playProps}>{reader.playLabel}</button>
  {reader.isSelectionTriggerShown ? (
    <button {...reader.selectionTriggerProps}>{reader.selectionLabel}</button>
  ) : null}
</div>
```

Options: `contentRef`, `engine`, `url`, `store`, `timeout`, `voices`, `name`, `highlight` (default `true`), `scroll` (default `true`, off under `prefers-reduced-motion`), `messages`, `onStatusChange`. Mark content that must not be read with `data-kv-read-aloud-skip`. The package needs no `KvirnProvider` at all: pass `engine` or `url` directly, as Storybook's fake engine and any non-KvirnUI consumer do.

## Voices

Each chunk's declared language picks a voice of that language; `en` matches `en-GB` and `en-US`. `voices` (on the provider, the component or the hook) is the language-to-voice map: your entry for a language resolves over the service's own, and any language you don't name keeps the service's voice, or its absence.

The service currently has no voice for `fi` or `nn`. `hasVoice` answers synchronously, from the first render, whether the resolved content language has one at all: `ReadAloud.Root` renders nothing once it is `false`, so a page in a language with none gets no player rather than a Listen button that always fails. The service's own default voice per language is looked up without a network call; the full voice list (for a Voice picker) still arrives asynchronously, only after the first press or `loadVoices()`.

When a chunk the service refuses (too long) or an inline differently-languaged chunk with no voice is met mid-reading, it is skipped and the reading goes on: Status shows "One part of the text was skipped", once, but it is never announced — a resident who is listening does not need every skip narrated.

## Accessibility

See the contract: [read-aloud.a11y.md](read-aloud.a11y.md).
