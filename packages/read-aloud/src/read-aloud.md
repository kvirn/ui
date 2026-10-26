# ReadAloud

> **Private, in planning for 1.2.** This is the package `@kvirn-ui/read-aloud`; it is not published yet.

> **In planning.** Plan 0153: ReadAloud speaks on Kvirn's own voice service only — no browser speech, no third-party voice. The accessibility contract is [read-aloud.a11y.md](read-aloud.a11y.md).

A text-to-speech player on the Kvirn voice service: one sentence per request, a natural Nordic voice in every browser and OS, from an EU host that stores no text and sets no cookies unless you opt in. Play reads the selection the user made in the content, else the whole content, one sentence at a time. It never starts by itself.

- Parts: `ReadAloud.Root` (a `role="group"`), `Progress`, `Play`, `Transport` (groups `Previous` and `Next`), `Previous`, `Next`, `Stop`, `Rate`, `Voice`, `Status` (`as`: `span`, `p` or `div`), `Note`, `Bar`, `Settings`, `Hide`, `WhenStarted` (renders `children` once reading has started, reading the Root it is mounted in). Each is also reachable as a prop object of `useReadAloud`.
- Play, Previous, Next and Stop each draw an icon before the word (`play`/`pause`, `skip-previous`, `skip-next`, `stop`); the icons are decorative, so the word stays the whole accessible name.
- Play is named `Listen`, `Listen to selected text` while a selection is captured, and `Pause` while reading. Pause is real: `Listen` resumes mid-sentence, never restarting it. Past the 300 ms busy threshold a spinner takes the icon's place, so nothing moves.
- Reading a selection collapses it, so the browser's selection paint doesn't hide the sentence highlight.
- `Progress` is the sentence meter: a plain bar, `aria-hidden`, that fills as reading moves through the content. It is informative only — no `progressbar` or `slider` role, no handle, nothing to drag — because `Status` already carries the position in words, which is the one accessible cue (1.4.1, 4.1.2). It renders nothing while idle.
- `Transport` is a plain grouping element around `Previous` and `Next`: it creates the tight cluster and the separation from `Stop`, and keeps the two together on narrow screens. It adds no Tab stop and no role.
- `Play` is the secondary look, the same as `Previous`, `Next` and `Stop`, so the player never competes with a page's own primary action.
- The sentence is highlighted with the CSS Custom Highlight API (`::highlight(kv-read-aloud)`) where supported, and Status shows `Sentence 3 of 12` everywhere: the highlight is a bonus, never the only position cue.
- Nothing is announced while reading: the speech is the feedback. A wait past 300 ms shows a spinner and, past 1 second, is announced once per press (never once per sentence, and never for a later chunk buffering mid-read). A skipped part is shown in Status but never announced. Only a failure is announced, once, politely.
- `Voice` renders only when the content's language has two or more voices; the default composition leaves it out (there is seldom a real choice to make) and the voice list arrives only after the first press.
- `Note` is the privacy affordance: who receives the text and that nothing is stored, with an optional link to your own "how it works" page. Renders nothing without a `name`.
- `ReadAloud.SelectionTrigger` is a pointer convenience: a button in the top layer (`popover="manual"`) placed below the end of a selection made with a pointer. It is named `Listen to selected text`, never takes focus, is not a Tab stop and goes away on collapse, Escape, scroll, resize, Stop or use. A keyboard selection never shows it: select with Shift+Arrows and press Play.

## Component

The recommended composition is a bare row of buttons, never a card (Plan 0154 D44): idle is one
`Listen` button; once reading has started the same button reads `Pause`, next to `Stop` and
`Settings` — three buttons, side by side, and nothing else. `Status` renders only when it has
something to say (a wait, or an error); `Note` sits below it, set apart by its own hairline since
there is no card to separate it from the buttons otherwise.

```tsx
import { ReadAloud } from '@kvirn-ui/react'

const articleRef = useRef<HTMLElement>(null)

<ReadAloud.Root contentRef={articleRef} url="https://voice.kvirn.com" name="Kvirn's voice service">
  <ReadAloud.Play />
  <ReadAloud.Stop />
  <ReadAloud.Settings howItWorksHref="/privacy#read-aloud" />
  <ReadAloud.Status />
  <ReadAloud.Note />
  <ReadAloud.SelectionTrigger />
</ReadAloud.Root>
<article ref={articleRef} lang="sv">…</article>
```

## The player bar

`ReadAloud.Bar` (Plan 0154, "concept J") is a site-wide transport: one include in the layout, after the skip link and before the site's own navigation, instead of a player placed per article. Its transport is a `Toolbar`, so Previous, Play, Next, Stop and `ReadAloud.Settings` are **one** Tab stop with arrow-key navigation — a worded five-button row there would not be acceptable at that position (2.4.3).

```tsx
<ReadAloud.Root url="https://voice.kvirn.com" name="Kvirn's voice service" scope="#article">
  <ReadAloud.Bar />
</ReadAloud.Root>
```

- **What it reads**, resolved in order: `contentRef` → `scope` (a CSS selector) → the page's `<main>` landmark — a site-wide bar has no article of its own, and `main` is the one default that needs no per-route wiring. A page with neither a match for `scope` nor a `<main>` reads nothing and warns once in development.
- **`<!-- KV:READ-ALOUD:START -->` / `<!-- KV:READ-ALOUD:STOP -->`** HTML comment pairs, inside whichever root wins, narrow it further to the marked ranges — several pairs are allowed, and a `scope` selector still respects markers inside it. This is for server-rendered and CMS markup (SiteVision, Optimizely, Drupal, WordPress): **React/JSX cannot emit an HTML comment**, so a React page uses `contentRef` or `data-kv-read-aloud-skip` instead. **An HTML minifier that strips comments removes the markers with it** — keep comments on in production, or the Bar silently reads the whole resolved root. Full detail: `docs/design/read-aloud.md` §5a.
- **Hybrid labels, the default:** the word stays on Play/Pause; Previous, Next, Stop and `Settings` are icon-only, each still named from i18n (visually hidden text, not `aria-hidden`). `kv-read-aloud--words` on `ReadAloud.Root` reveals every word, matching the panel's own look; `kv-read-aloud--icons` additionally hides Play's word for the densest bar. Classes, never props (rule 14) — this is the one component-level exception DESIGN.md's icon-only list now names.
- **No lede, no meter.** The word "Listen" on the filled Play identifies the Bar; the reused `ReadAloud.Status` is empty while idle and reads `Sentence 3 of 12` while playing, same text as the panel.
- **One group, not two.** `ReadAloud.Bar` itself is a plain `<div>`, no role, no name: `ReadAloud.Root`'s own `role="group"` is the Bar's group too, and while a Bar is mounted inside it, Root's name switches from `readAloud.label` to `readAloud.barLabel` automatically — nothing for you to wire.
- **Static by default; sticky only while playing, never idle,** and it un-sticks at `(max-height: 30rem)` instead of disappearing, so a magnifier user keeps the controls. The sticky positioning is on `ReadAloud.Root` itself, not the Bar (0154 D39) — the Bar's own containing block was Root, exactly one bar tall, so `position: sticky` on the Bar had a zero-height range and did nothing; Root's containing block is the page frame, so the range there is real. **This means `ReadAloud.Root` must contain only the Bar, and sit as a direct child of a page-tall element:** nested inside something shorter (a page's `<main>`), the sticky range collapses to nothing; wrapped around the whole page instead, the whole page becomes the sticky box. Both look like "sticky is broken" rather than "Root is in the wrong place." `scroll-padding-block-start` is set for you (`read-aloud.css`, `html:has(...)`, matching the same three `data-status` values and the same breakpoint), so a Shift+Tab target or an in-page anchor never lands under the sticky band (2.4.11) — nothing to add yourself.
- **`ReadAloud.Hide`** collapses the Bar to one Play button for the rest of the page view (no storage) and moves focus there. It renders nothing once reading has started: hiding the only Pause would break 2.2.2, and there would be no way back.
- **`ReadAloud.Settings`** (Speed, Voice, then the recipient sentence and your optional "how it works" link) is the one shared menu, a `Popover` — the same part works standalone in the panel:

```tsx
<ReadAloud.Root contentRef={articleRef} url="…" name="Kvirn's voice service">
  <ReadAloud.Play />
  <ReadAloud.Settings howItWorksHref="/privacy#read-aloud" />
  <ReadAloud.Status />
</ReadAloud.Root>
```

**The disclosure is yours to finish.** Once `name` is known, `ReadAloud.Settings` always shows the recipient sentence (`readAloud.note`) — the library already knows who the text goes to, so there is nothing to gate. The "How listening works" link only appears when you pass `howItWorksHref`; with none, there is no link, and no dev warning either — the destination page is your duty, never the library's to invent (rule 7). **If your site sends text to a third-party voice service, link your own explanation of that somewhere a resident will see it before pressing Listen** (`regulations`): in `ReadAloud.Note` in the panel, and in `ReadAloud.Settings.howItWorksHref` when you use the Bar, since a site-wide Bar composes no standalone `Note`.

### The inline row: never a panel

Pressing Listen must not open a different layout (0154 D44, superseding D13's idle panel that
stayed open once used). Idle is one `Listen` button; once reading has started the same button
reads `Pause`, next to `Stop` and `Settings` — three buttons, side by side, and nothing else: no
card, no meter, no transport cluster, no position line. `ReadAloud.Status` is kept but shows
nothing until it has something to say (a wait past 1 second, or an error); `ReadAloud.Note` sits
below it, set apart by a hairline since there is no card to separate it from the row otherwise.
Because Pause takes Play's own place, nothing needs to render conditionally on whether reading has
started — see the "Component" composition above.

`ReadAloud.Progress`, `Transport`, `Previous`, `Next` and `WhenStarted` stay exported (removing a
public part is the maintainer's call, asked separately): a consumer building a different layout on
top of the hook can still use them, but none of them is in the recommended composition.

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

Options: `contentRef` (optional; see the Bar's "What it reads", above), `scope` (a CSS selector, read only while `contentRef` is not given), `engine`, `url`, `store`, `timeout`, `voices`, `name`, `highlight` (default `true`), `scroll` (default `true`, off under `prefers-reduced-motion`), `messages`, `onStatusChange`. Mark content that must not be read with `data-kv-read-aloud-skip`. The package needs no `KvirnProvider` at all: pass `engine` or `url` directly, as Storybook's fake engine and any non-KvirnUI consumer do. The result also carries `hasEverPlayed`: `true` once reading has started, and never resets — `ReadAloud.WhenStarted` reads it for you inside `ReadAloud.Root`; call `useReadAloud` yourself only when you are not also rendering `ReadAloud.Root` (building your own markup on the hook directly), since the two each build their own machine.

## Voices

Each chunk's declared language picks a voice of that language; `en` matches `en-GB` and `en-US`. `voices` (on the provider, the component or the hook) is the language-to-voice map: your entry for a language resolves over the service's own, and any language you don't name keeps the service's voice, or its absence.

The service currently has no voice for `fi` or `nn`. `hasVoice` answers synchronously, from the first render, whether the resolved content language has one at all: `ReadAloud.Root` renders nothing once it is `false`, so a page in a language with none gets no player rather than a Listen button that always fails. The service's own default voice per language is looked up without a network call; the full voice list (for a Voice picker) still arrives asynchronously, only after the first press or `loadVoices()`.

When a chunk the service refuses (too long) or an inline differently-languaged chunk with no voice is met mid-reading, it is skipped and the reading goes on: Status shows "One part of the text was skipped", once, but it is never announced — a resident who is listening does not need every skip narrated.

## Accessibility

See the contract: [read-aloud.a11y.md](read-aloud.a11y.md).
