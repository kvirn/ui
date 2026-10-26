# ReadAloud player: alternative concepts (B–H)

> **The Bar's visual treatment is defined by `read-aloud-concepts.html`, not by this file.**
> Where the two differ, the prototype wins: it is what the maintainer approved (plan 0154 D24).
> This file's mentions of reusing `kv-button` / `kv-button--icon-only` describe structure and
> accessible behaviour, **not** the Bar's round, borderless transport look.

- **Status:** Options for the maintainer to choose from · **Designer:** ux-designer agent · **Date:** 2026-10-25
- **Baseline:** [read-aloud.md](read-aloud.md) revision 3 = **Concept A** (bordered panel, filled Listen, Previous/Next cluster, Stop set apart, sentence meter, full transport always visible). It is being built now, so it is not re-pitched here.
- **What this file is for:** B, C and D are three different *approaches*, not restyles. Each varies at least three of: chrome, where the position cue lives, density/disclosure, who defers to whom, and where it sits.
- **True of A–D:** in the content flow (never floating, sticky or in a mobile menu); words on every control with the icon beside the word; no auto-start, playback always from a press; `preparing` announced once past 1 s, never per sentence, one polite region; the highlight is a reading aid, never a status; 44px targets; no new i18n key unless named.
- **Mockup legend:** `[>]` play · `[||]` pause · `[|<]` `[>|]` skip · `[#]` stop · `(o)` headphones · `»…«` the highlighted sentence · dashed box = `aria-disabled` · `░` = tinted strip · `┃` = filled rail. Wide mockups are the 45rem reading column, narrow ones are 320px (288px of content).

---

## Concept B — "Grows on press"

**Optimises for the idle moment:** before anyone has pressed anything, the page offers one large, obvious invitation and no machinery. The transport exists only once there is something to transport.

### Wide — idle, then playing

```
Building permit for a deck
Updated 3 October 2026
┌────────────────────────┐
│ [>] Listen to this text│           no panel, no meter, no greyed-out buttons
└────────────────────────┘
Listening sends this text to Kvirn to make the audio. The text and the
audio are not saved.  How listening works

You need a permit if the deck is more than 1.2 metres above the ground …
```

```
Updated 3 October 2026
┌────────────────────────┐ ┌───────────────────────┐┌──────────────────┐  ┌────────┐
│ [||] Pause             │ │ [|<] Previous sentence││ Next sentence[>|]│  │[#] Stop│
└────────────────────────┘ └───────────────────────┘└──────────────────┘  └────────┘
 ^ same grid cell as Listen: the button under the finger never moves or resizes
Speed [ 1x v ]
Sentence 3 of 12
Listening sends this text to Kvirn … How listening works

»You need a permit if the deck is more than 1.2 metres above the ground.«
The fee is 2 400 kr.
```

### 320px — idle, then playing

```
┌──────────────────────────────────┐   ┌──────────────────────────────────┐
│ [>] Listen to this text          │   │ [||] Pause                       │
└──────────────────────────────────┘   └──────────────────────────────────┘
Listening sends this text to Kvirn     ┌───────────────┐┌─────────────────┐
to make the audio. The text and        │ [|<] Previous ││ Next sentence   │
the audio are not saved.               │      sentence ││            [>|] │
How listening works                    └───────────────┘└─────────────────┘
                                       ┌────────┐
                                       │[#] Stop│
                                       └────────┘
                                       Speed [ 1x v ]
                                       Sentence 3 of 12
```

- **Best at:** discoverability and calm. One target, full width on a phone, with the privacy line already visible. Nothing is dimmed, so nothing looks broken. It is also the only concept **cheaper** than A.
- **Worst at:** the article below shifts down ~1 row (wide) or ~3 rows (320px) at the press, and shifts back up **at the end of the text, unattended**, when the machine returns to `idle`. A first-time user cannot see that Previous/Next exist before committing. Speed can only be set after starting (it applies live, so this is survivable, not free).
- **Accessibility:** targets 44px, two equal columns ≥136px at 320px. Focus never moves: Listen *is* Pause, same element, same cell, so a double press cannot land on Previous (2.5.3, 2.5.8). Tab stops go 2 → 7 on the press; the new stops are all **after** the focused button in DOM order. Nothing about the expansion is announced (it is not a disclosure; do not fake `aria-expanded`). 2.2.2: Pause is in place from the press, before anything else renders. No height or slide animation, so reduced motion needs no rule. 400%: everything wraps, nothing is clipped.
- **Build cost beyond A:** *less*. `Progress` is not in the recommended composition. One choice class, `kv-read-aloud--staged`, hides Transport/Stop/Rate on `[data-status='idle']` with `display: none` (so they leave the Tab order honestly), and the idle `aria-disabled` look is unused. One real addition: to avoid the collapse at the end of the text, the Root needs a `data-started` attribute (a `hasStarted` flag that only Stop clears) — otherwise accept the shift.

---

## Concept C — "The text carries the position"

**Optimises for answering "where am I?" where the user is looking:** the position cue leaves the player and goes into the article as a rail in the gutter, so it is still visible after you have scrolled the player off the screen. The chrome is a tinted strip when idle and a quiet rule-separated band once playing, so the player steps back while the article is being read.

### Wide — idle, then playing

```
Building permit for a deck
Updated 3 October 2026
░ (o) Listen to this text
░ ┌───────────┐ ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┐┌ ─ ─ ─ ─ ─ ─ ─ ─ ─┐ ┌ ─ ─ ─ ┐
░ │[>] Listen │ ╎[|<] Previous sentence╎╎Next sentence [>|] ╎ ╎[#] Stop╎  Speed[1x v]
░ └───────────┘ └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┘└ ─ ─ ─ ─ ─ ─ ─ ─ ─┘ └ ─ ─ ─ ┘
░ Listening sends this text to Kvirn … How listening works
```

```
──────────────────────────────────────────────────────────────────────────
 [||] Pause   [|<] Previous sentence   Next sentence [>|]   [#] Stop   Speed[1x v]
 Sentence 3 of 12
──────────────────────────────────────────────────────────────────────────
┃ »You need a permit if the deck is more than 1.2 metres above the ground.«
┃ The fee is 2 400 kr and is paid when the decision is sent.
╎ Apply at least four weeks before you start building.        ┃ heard  ╎ not yet
```

### 320px — idle, then playing

```
░ (o) Listen to this text               ──────────────────────────────────
░ ┌──────────────────────────────────┐   [||] Pause
░ │ [>] Listen                       │   ┌───────────────┐┌─────────────────┐
░ └──────────────────────────────────┘   │ [|<] Previous ││ Next sentence   │
░ ┌ ─ ─ ─ ─ ─ ─ ─┐┌ ─ ─ ─ ─ ─ ─ ─ ─ ┐    │      sentence ││            [>|] │
░ ╎[|<] Previous ╎╎ Next sentence   ╎    └───────────────┘└─────────────────┘
░ ╎      sentence╎╎            [>|] ╎    [#] Stop      Speed [ 1x v ]
░ └ ─ ─ ─ ─ ─ ─ ─┘└ ─ ─ ─ ─ ─ ─ ─ ─ ┘    Sentence 3 of 12
░ ┌ ─ ─ ─ ┐   Speed [ 1x v ]             ──────────────────────────────────
░ ╎[#] Stop╎                            ┃ »You need a permit if the deck is
░ └ ─ ─ ─ ┘                             ┃ more than 1.2 metres above the
░ Listening sends this text to Kvirn …  ╎ ground.« The fee is 2 400 kr.
```

- **Best at:** long pages. The rail and the highlight answer "where am I" next to the words, so scrolling past the player costs nothing — the problem A's open question 5 parks. The idle strip reads as an offer rather than as a machine, and the playing band is the quietest chrome of the four.
- **Worst at:** the idle moment. Three dashed, dead buttons sit inside an inviting tint — the noisiest idle of the four. The rail changes the **article's** layout (it needs a gutter the consumer must reserve), it eats ~8px of a 288px column at 320px, and it can collide with `kv-inset`'s own 4px inline-start bar. The chrome changing identity at the press is also a trick that buys nothing functional.
- **Accessibility:** the rail is `aria-hidden`, not focusable, no handle, no cursor change — like A's meter, it is informative only. 1.4.1: once the player is off-screen the rail is the only position cue on screen, so it must never be the only *status* cue — the words stay in Status, and the highlight travels with it. Forced colours: the tint vanishes, so idle and playing look identical; the rail is `Highlight` with a `CanvasText` edge. Tab order is constant (7 stops, same at every status), which is its one structural advantage over B. 400%: the rail stays 2px and the strip stacks.
- **Build cost beyond A:** the most. The `Progress` part is re-cut as a vertical `ReadAloud.Rail` alongside the content, which means **the Root must wrap `contentRef`** (or a new `ReadAloud.Content` part must), with the player's own parts carrying `data-kv-read-aloud-skip`. Plus `kv-read-aloud--strip` chrome (a `primary-subtle` tint on `[data-status='idle']`, hairline rules otherwise) and a gutter requirement documented for consumers. No new token and no new colour pair (`primary-subtle` background and `primary` as a 3:1 marker are measured); it makes `label` a visible string.

---

## Concept D — "Listen where you are"

**Optimises for never losing the control on a long page, without anything sticky:** the player is a page utility like "Print this page", and while it is playing the consumer can place a compact repeat beside each `h2`, all driven by the one Root.

### Wide — idle, then playing

```
Building permit for a deck
Updated 3 October 2026 · (o) Listen to this text · Print this page
──────────────────────────────────────────────────────────────────────────
You need a permit if the deck is more than 1.2 metres above the ground …
```

```
Updated 3 October 2026 · Print this page
──────────────────────────────────────────────────────────────────────────
 [||] Pause  [|<] Previous sentence  Next sentence [>|]  [#] Stop  Speed[1x v]
 Sentence 3 of 12 · Listening sends this text to Kvirn … How listening works
──────────────────────────────────────────────────────────────────────────
»You need a permit if the deck is more than 1.2 metres above the ground.«

Fees                                                                   (h2)
 [||] Pause    Next sentence [>|]    [#] Stop      ← repeat, only while playing
The fee is 2 400 kr and is paid when the decision is sent …
```

### 320px — idle, then playing

```
Updated 3 October 2026                 Updated 3 October 2026
(o) Listen to this text                ──────────────────────────────────
Print this page                        ┌──────────────────────────────────┐
──────────────────────────────────     │ [||] Pause                       │
You need a permit if the deck is       └──────────────────────────────────┘
more than 1.2 metres above the         ┌───────────────┐┌─────────────────┐
ground …                               │ [|<] Previous ││ Next sentence   │
                                       │      sentence ││            [>|] │
                                       └───────────────┘└─────────────────┘
                                       [#] Stop    Speed [ 1x v ]
                                       Sentence 3 of 12
                                       ──────────────────────────────────
                                       »You need a permit if the deck …«
```

- **Best at:** reach. A pause or a skip is always within a screen of what you are hearing, with nothing fixed, nothing covering text and nothing that breaks at 400%. It adds no object to the page when idle: the page looks like a page.
- **Worst at:** discoverability and repetition. A link-look "Listen" in a metadata row is the quietest possible treatment of the one control the hardest-case user needs most — a gentler version of the Mora failure our own prior art rejected. The repeats **insert rows into the article while someone is reading it** (every `h2` grows by one control row at the press), and they multiply Tab stops and duplicate accessible names: four "Pause" buttons on one page.
- **Accessibility:** the idle trigger at the link look is ~24px tall — it passes 2.5.8 and fails the 44px resident-facing floor in DESIGN.md Density, so it would have to be a `kv-button--compact`-height button at least, and on a phone 44px anyway. Duplicate names need distinguishing (`Pause, Fees`), which is a new i18n key with a section name in it — the only concept here that adds a string. Focus stays put when a repeat appears, but content below it moves. 2.2.2 is well served: a Pause is always near. Forced colours and reduced motion: nothing special; the rules are hairlines.
- **Build cost beyond A:** low API cost, high composition cost. Multiple `Transport`s under one Root already work through context; the Root must wrap the content (as in C) and every player part must be skipped by `collectRangeText`. New: `kv-read-aloud--utility` (the inline link-look idle trigger), `kv-read-aloud-transport--compact`, a `[data-status='idle']` rule that hides the repeats, and one new message key for the per-section button names.

---

## Comparison

| | **A — panel (baseline)** | **B — grows on press** | **C — text carries position** | **D — listen where you are** |
| --- | --- | --- | --- | --- |
| Chrome | Bordered panel | None, in the flow | Tinted strip → hairline band | None → hairline band |
| Position cue | Meter + words | Words + highlight | Rail in the article + words | Words + highlight |
| Idle density | 4 buttons, select, empty meter | 1 button | 4 buttons, 3 of them dead | 1 text action |
| Defers to the article | No (always a block) | While idle | While playing | Always |
| Layout shift | None | On press and at the end | None | On press, at every `h2` |
| Tab stops idle → playing | 6 → 6 | 2 → 7 | 7 → 7 | 2 → 7 (+3 per section) |
| New parts / keys | Progress, Transport / none | none / none | Rail (+ Root wraps content) / none | none / 1 key |
| Build cost vs A | – | **lower** | highest | medium |
| Biggest risk | Looks like a machine before use | Shift at the press | Dead buttons inside an invitation | Too quiet to be found |

## Recommendation

**Concept B, with A's panel as a fallback if the shift tests badly.** Idle and playing really are different moments, and B is the only option that treats them that way without inventing new machinery: it is the clearest invitation, the biggest target on a phone, the cheapest to build (one choice class, and `Progress` never rendered), and it removes the three dashed dead buttons that make A's idle state read as broken. Its one real cost — the article moving at the press — happens *before* the user has started reading, and the button under their finger does not move. Measure it in task 1 and 6 of the §8 test plan before committing to the `data-started` flag.

**A stays the right default to ship if the maintainer wants certainty:** everything is visible, nothing moves, and it is already being built. B is the better product if the shift proves harmless.

**The trap is D's automatic per-section repeats.** It looks like the answer to long pages, but it inserts controls into prose while someone is reading that prose, gives one page four identically named Pause buttons, and makes the primary affordance the smallest thing in a metadata row. Salvage the good half at zero cost: the headless API already lets a consumer place **one** extra `ReadAloud.Transport` deliberately, far down a long article, under any of the concepts. **C's second trap** is quieter: the rail makes the library responsible for the article's layout, and in forced colours its whole idle/playing distinction disappears.

## Open questions

1. Is the layout shift at the press (B) acceptable, or does the Root need `data-started` so the transport never collapses by itself?
2. Does Listen stay quiet/secondary by default (the maintainer's decision)? **B argues against it:** when Listen is the only control on the page, "one primary per view" is a question about the page, not the player, so the filled look should be the default with `kv-read-aloud--quiet` as the escape hatch — exactly as A proposes.
3. If C is chosen, who owns the gutter — the library (Root wraps the content) or the consumer's template?
4. None of B, C or D is tested with residents. Everything above is a designer's judgement against the §8 plan, which stays `pending`.

---

# Second pass: four concepts taken from shipping products (E, F, G, H)

- **Why:** A–D are our own invention. E–H each start from a product that has shipped a listen control to a large audience, and each says **what we steal and what we leave behind**. §2 of [read-aloud.md](read-aloud.md) still holds; this is that research as things you can build.
- **Still binding:** headless (a choice is a `kv-<part>--<option>` class, never a prop), words on every control, no auto-start, `preparing` announced once past 1 s with one polite region, 2.5.8, 1.4.1, 1.4.2, 2.2.2, forced colours, reduced motion, 320px, no new token.
- **Challenged once:** "never floating, never sticky" — in **F** only, openly, and it **needs the maintainer's approval**. E, G and H do not depend on it.
- Same mockup legend as above.

## What the market actually ships (observed 2026-10-25)

| Product | Where the control is | Idle → playing | Exposes | Reported problem |
| --- | --- | --- | --- | --- |
| [Medium Listen](https://help.medium.com/hc/en-us/articles/4635049283351) ([launch](https://blog.medium.com/sound-on-now-you-can-listen-to-medium-stories-41741987d6c9)) | A "Listen" button under the story title, in the flow | Button stays; a **pop-up player docks bottom-right** | Play/pause, rewind, voice, speed | Members only; English only, so the button silently disappears |
| [Edge / Word Read Aloud](https://www.microsoft.com/en-us/edge/learning-center/customize-read-aloud-settings), [Immersive Reader](https://support.microsoft.com/en-us/accessibility/word/use-immersive-reader-in-word) | Menu item → **a ribbon docked at the top** | A bar appears, the page stays | Play/pause, previous/next paragraph, Voice options (voice + speed slider), **X to close** | Reading mode re-flows the page: the user leaves the page they knew |
| [ReadSpeaker webReader](https://www.readspeaker.com/solutions/text-to-speech-online/readspeaker-webreader/) ([user guide](https://www.csulb.edu/sites/default/files/2022/documents/ats-readspeaker-user-guide.v10.26.pdf)) | "Listen" at the top of the content, with an **expand chevron on the button** | Button becomes a player; the chevron opens a **second toolbar** | Play, stop, progress, volume, speed, settings, voice, click-and-listen, enlarge text, translate | Two layers to learn; settings are where the position cue should be |
| [Android Select to Speak](https://support.google.com/accessibility/android/answer/7349565) | A compact floating toolbar | Play/pause + stop only; **a left-arrow expands** skip-paragraph and speed | Progressive: 2 controls, then 5 | Buried behind an accessibility setting |
| [iOS Speech Controller](https://mcmw.abilitynet.org.uk/how-to-enable-your-device-to-read-aloud-the-text-that-is-on-the-screen-in-ios-26-on-your-iphone-or-ipad) | Floats over everything, auto-minimises to a dot | Already playing when it appears | Play/pause, skip, turtle/rabbit speed | Users ask [how to remove it](https://discussions.apple.com/thread/255982332); in iOS 26 it [stops collapsing and blocks the screen](https://discussions.apple.com/thread/256137942) |
| [Pocket Listen](https://www.macrumors.com/2018/10/11/pocket-text-to-speech-listen/), [continuous playback](https://getpocket.com/blog/2017/10/introducing-continuous-playback-for-listen-and-highlighting-on-android) | A headphone button in the app chrome | **Full-screen podcast-style overlay** | Transport, 0.8–4x speed, queue, background play, highlight | It is a mode: you stop browsing to listen |
| [ElevenReader](https://elevenreader.io/text-reader-app) ([review](https://www.applevis.com/podcasts/transforming-text-speech-inside-elevenlabs-reader-ios)) | A reading view that replaces the document | Mini player at the block end, frosted | Prev/play/next/stop, 0.5–3x, word + sentence highlight, tap a word to start there | Needs its own import step; nothing of the original page survives |
| [Speechify extension](https://chromewebstore.google.com/detail/speechify-%E2%80%94-text-to-speec/ljflmlehinmoeknoonhibbjpldiijjmm) | A **draggable floating pill** over any page | Expands in place | Play, speed to 4.5x, voice; can be docked or hidden | Reading order breaks on tables and multi-column pages |
| [NYT Listen](https://wan-ifra.org/2025/06/read-play-swipe-the-strategy-behind-the-new-york-times-app-revamp/), [narrated articles](https://niemanreports.org/audio-articles-are-helping-news-outlets-gain-loyal-audiences/) | Play on the article, plus a Listen tab that **resumes** | Article player → persistent mini player | Transport, speed, queue, position memory | Completion is high (78–90% at Noa/Zetland) *once started*; the hard part is starting |
| [ReachDeck toolbar](https://business.scope.org.uk/why-accessibility-overlays-and-widgets-do-not-improve-your-website-accessibility/) | Floating toolbar over the page | — | Everything at once | An overlay: [72% of disabled experts rate overlays "not at all" or "not very" effective](https://business.scope.org.uk/why-accessibility-overlays-and-widgets-do-not-improve-your-website-accessibility/) |

**What transfers from podcast and video transports, and what does not.** Transfers: one play/pause toggle that never changes position; a short speed menu; a visible position readout; and **"back a little" as the most-used control** — [Spotify's move away from the 15-second back button drew safety complaints](https://community.spotify.com/t5/Android/quot-Your-Episodes-quot-broken-15s-skip-on-Android-Auto/td-p/6334369), which is the clearest evidence that *back* must never be hidden. Does not transfer: ±15s itself, a scrubber, elapsed/remaining time, chapters and background audio — all need a timeline, and we have a sentence index (0151 returns no word alignments). **Previous sentence is our "back 15", so it belongs next to Pause in every concept.**

---

## Concept E — "Listen, and more controls"

**From** ReadSpeaker webReader's expand chevron and **Android Select to Speak's** two-then-five toolbar. **Optimises for** the smallest honest idle object: two live controls, no dead buttons, no empty meter — and, unlike B, nothing changes by itself when audio starts. The user decides how much machine is on screen.

```
div.kv-read-aloud.kv-read-aloud--toolbar  role=group "Listen to this text"  data-status data-error
  div.kv-read-aloud-bar                          ← flex row, column-gap space-3, row-gap space-2, no fill, no border
    button.kv-button.kv-read-aloud-play            [play|pause|spinner] Listen to this text / Pause
    button.kv-button.kv-disclosure-trigger.kv-read-aloud-more  aria-expanded aria-controls="ra-more"
                                                   More controls  span.kv-disclosure-icon [chevron-down|chevron-up]
  div#ra-more.kv-disclosure-panel.kv-read-aloud-more-panel     ← absent from the DOM while closed
    div.kv-read-aloud-transport   [skip-previous] Previous sentence · [skip-next] Next sentence
    button.kv-read-aloud-stop     [stop] Stop
    div.kv-field  label Speed  select.kv-listbox-native
  p.kv-read-aloud-status   Sentence 3 of 12            ← always visible, both states
  p.kv-read-aloud-note     Listening sends … How listening works
```

- **No Root chrome at all**: no fill, no border, no radius. The buttons are the object (A's panel is what made idle read as a machine). Root is a `flex` column, `row-gap --kv-space-3`; the panel adds `margin-block-start: --kv-space-3`, `padding-inline-start: 0`.
- **States:** the bar is identical in all five (`idle`, `preparing`, `playing`, `paused`, error) except Play's icon and word; the panel's contents follow A's state table. **No control is ever `aria-disabled`** — closed, they are simply not there, which is the honest version of A's dashed buttons.
- **Wide (45rem):** one row, Listen then More controls; open, the panel is a second row, `Previous Next · Stop · Speed`, `column-gap --kv-space-3`, Stop set apart by `--kv-space-6`. **320px:** Listen full width, More controls full width under it; open, Previous/Next a `1fr 1fr` grid, Stop content-width, Speed full width.
- **Best at:** an idle state with nothing dead in it, a stable Tab order inside each disclosure state, and one composition that serves both a resident page (closed) and a staff page (open) with no new parts.
- **Worst at:** it hides *back*. "Previous sentence" behind a press is the one thing the podcast evidence above says never to hide, and the dyslexic reader who needs "say that again" is the one least likely to hunt for "More controls". It also shifts the article twice (open and close), and a disclosure suggests the contents are optional, which Stop is not.
- **Accessibility:** Tab 2 → 6. `aria-expanded` on the trigger is the whole announcement; nothing goes to the live region. Focus stays on the trigger when the panel opens (it is after it in DOM order). 2.2.2 never depends on the panel, because Pause is in the bar. No height animation (DESIGN.md Motion animates no layout), so reduced motion needs no rule. Forced colours: the chevron changes shape, not only colour. 400%: both rows wrap.
- **Cost beyond A:** the lowest of E–H and lower than A. `Progress` is not composed. One choice class `kv-read-aloud--toolbar` plus `kv-read-aloud-bar` and `-more-panel`; the trigger reuses the shipped `Disclosure` parts, so **the consumer can build it today by wrapping `ReadAloud.Transport` in a `Disclosure`**. One new key: `readAloud.moreControls`.

## Concept F — "Docked while playing" (needs the maintainer's approval)

**From** Medium (an inline Listen that opens a docked player) and **Edge Read Aloud's** top ribbon with an explicit close. **Counter-evidence taken seriously:** the iOS Speech Controller, which floats, auto-minimises and gets stuck — so **nothing here floats, drags, auto-hides or covers the entry point.** **Optimises for** reach: Pause and Previous are on screen on a long page without burying "Listen".

- **The entry point never docks.** The in-flow Root is exactly A, under the `h1`. The dock is a **second, smaller group** rendered only while `data-status` is not `idle` **and** a sentinel above the Root is out of view. The two are never on screen together, which is what makes two "Pause" buttons tolerable — the failure D was rejected for.

```
div.kv-read-aloud  … exactly concept A, in the flow, never repositioned …
div.kv-read-aloud-dock  role=group aria-label="Listening controls"  data-status   ← fixed at the block end
  button.kv-button.kv-read-aloud-play      [pause] Pause
  div.kv-read-aloud-transport              [skip-previous] Previous sentence · [skip-next] Next sentence
  button.kv-button.kv-read-aloud-stop      [stop] Stop
  p.kv-read-aloud-status                   Sentence 3 of 12
```

- **Geometry, borrowed whole from `kv-quick-exit`:** `position: fixed`, block-end and both inline edges 0; `canvas` fill, 1px `border-subtle` at block-start, `--kv-space-2` block and `--kv-space-4` inline padding (`--kv-space-6` from 40rem); above page content, below popups and dialogs. **Wide:** one row, Speed omitted (it is one scroll up). **320px:** Pause full width, Previous/Next `1fr 1fr`, Stop content-width, Status last — about 110px tall.
- **How 2.4.11 and 2.2.2 stay intact:** `scroll-padding-block-end` on `html:has(.kv-read-aloud-dock)`, set to the tallest dock plus `--kv-space-4`, in `rem` so it grows with text; the consumer adds matching `padding-block-end` to the page so the dock never covers the last paragraph. Pause is the dock's first control, so the only loop on screen can always be stopped.
- **How 400% zoom stays intact:** the dock is **not rendered under `(min-height: 30rem)`** — the exact rule `kv-quick-exit` ships. At 400% the static player is the only player.
- **Best at:** reach, familiarity (it is what Medium, Edge and every podcast app do) and the strongest 2.2.2 story of all eight. There is no drag, no auto-minimise, no close-that-keeps-playing, and nothing on screen before a press.
- **Worst at:** honesty under zoom. The reader who needs reach most — magnified, scrolling a very long page — is exactly the one the `30rem` rule takes it away from, so the feature exists for everyone except the hardest case. It also covers the foot of the page, needs an IntersectionObserver and a `scroll-padding` contract the consumer must honour, and puts two identically-worded Pause buttons in the DOM.
- **Accessibility:** the dock appears **after** the Root in DOM order, so Tab order is Root (6) then dock (4); a screen-reader user reaches it last, which is right, because they are not the audience. Nothing is announced when it appears or leaves (4.1.3 — it is chrome, not news), and **it never appears while focus is inside the Root**: the flag waits for focusout, so nothing moves under a hand. Forced colours: `Canvas` fill, `CanvasText` edge, same as quick-exit. Print: `display: none`.
- **Cost beyond A:** the highest API cost. A new `ReadAloud.Dock` part, an IntersectionObserver sentinel, the viewport media query, one new key (`readAloud.dockLabel`), a documented consumer duty (`padding-block-end`), **and a reversal of the "never sticky" rule in `read-aloud.md` §5, §9 Q5 and DESIGN.md Layout** — a maintainer decision, with `kv-quick-exit` as the precedent that the rule already has an approved exception.

## Concept G — "Listen view"

**From** Microsoft Immersive Reader / Edge reading view and **ElevenReader's** reading view with a mini player; also Pocket's full-screen Listen overlay. **Optimises for** the hardest case in the brief: strip the page to the text being read, at a large size, with nothing else on screen.

```
main.kv-read-aloud-view                       ← a route (?listen) or a full replacement of main, never a second copy
  a.kv-link.kv-read-aloud-view-back  [arrow-back] Back to the page
  h1  Building permit for a deck
  div.kv-read-aloud.kv-read-aloud--view  role=group     ← sticky at the top of the view
     [pause] Pause · [skip-previous] Previous sentence · [skip-next] Next sentence · [stop] Stop · Speed · Status
  div.kv-prose.kv-prose--large  (contentRef)  the article, Container size="reading"
```

- **It is a page, not a modal.** No backdrop, no focus trap, no `inert`, no Escape-to-close (Escape still stops the audio). The consumer owns the route and the scroll restoration; the library ships the layout class and the composition recipe.
- **Sticky here is cheap:** the view has no site chrome to compete with, the bar covers only the view's own text, and the same `(min-height: 30rem)` + `scroll-padding-block-start` rules as F apply. This is a far weaker version of F's ask, and could be approved without F.
- **Wide:** the bar is one row inside the `45rem` column; prose at `kv-prose--large`. **320px:** Pause full width, Previous/Next `1fr 1fr`, Stop + Speed on a third row, Status last; the bar is then ~150px, so below 30rem of height it is static and scrolls away.
- **Best at:** the second-language reader, the dyslexic reader and the magnifier user all at once — one column, large type, the highlight the only moving thing, and a single obvious way out.
- **Worst at:** it is a **mode**. The resident leaves the page they were on; anything they had typed, any filter, any open accordion is the consumer's problem; and a "listen" that navigates is a bigger promise than a button that reads. It is also the only concept that can duplicate the article's DOM (and its `id`s and headings) if built carelessly.
- **Accessibility:** the only concept where **focus moves on purpose** — to the view's `h1` on entry and back to the Listen button on exit — which is correct for a page change and must be in the contract. Nothing is announced. `lang` is unchanged, so 3.1.2 behaviour carries over. 2.5.8, forced colours and 1.4.12 are the ordinary rules; 400% is better than every other concept because there is nothing else on the page.
- **Cost beyond A:** no new part; `kv-read-aloud--view` and `kv-read-aloud-view` (layout), a documented route recipe, and two new keys (`readAloud.viewBack`, `readAloud.viewLabel`). The real cost is documentation and the consumer's routing, not code.

## Concept H — "Continue listening"

**From** Audible/Spotify listening position and the "Continue listening" row, Pocket's continuous playback, and the NYT Listen tab's resume. **Optimises for** the interrupted resident: someone who starts listening, opens the fee table in a new tab, answers the phone, comes back — and today starts again at sentence 1 and gives up. **It is not a layout:** it composes with A and with E, F and G.

```
div.kv-read-aloud  data-status="idle"  data-resume="7"      ← data-resume only when a saved position matches this page
  span.kv-read-aloud-progress aria-hidden style="--kv-read-aloud-progress: .58"   ← pre-filled to the saved point
  button.kv-button.kv-read-aloud-play   [play] Continue listening     ← label key swaps: play → resume
  … Transport, Stop, Speed, exactly as A …
  p.kv-read-aloud-status  You stopped at sentence 7 of 12             ← readAloud.resumePosition
  p.kv-read-aloud-note    Listening sends … How listening works
```

- **No new button.** The cheaper of the two options, and the recommended one: **Stop is already in the transport and already means "back to the start"**, so it doubles as "start from the beginning" and clears the memory, with Status saying so. (The alternative — a second `kv-read-aloud-restart` button with the `first` icon — adds a live control to the idle row we spent A–E trying to empty. Reject it unless testing says Stop is not found.)
- **Where the position lives:** `sessionStorage`, keyed by the page URL plus the length of the collected text, so an edited page silently drops the memory instead of resuming into the wrong sentence. No cookie, no server, no personal data, no cross-tab sync — which keeps rule 7 and the GDPR line in the Note true as written. **Opt-in per instance** (`resume: 'session' | 'off'`, default `off`): a site with shared public terminals turns it off, and a library that remembers by default on a library PC is a defect.
- **The one trap this pattern has:** never show "Continue listening" while something is playing or paused — the [documented failure](https://github.com/johnarleyburns/parso-voxglass/issues/23) is a Resume hero shown over live audio, which invites a restart. `data-resume` is honoured in `idle` only.
- **Wide and 320px:** identical to whatever concept it is composed with. The only size risk is the longer label: "Continue listening" / fi `Jatka kuuntelua` both fit the full-width 320px button.
- **Best at:** the failure none of the layouts fix. It adds information instead of chrome, costs no screen space, and is the only concept that helps on the *second* visit.
- **Worst at:** a shared device (mitigated by session scope and the opt-out), a sentence index that is meaningless if the page is republished (mitigated by the length key), and one more idle string to read before pressing.
- **Accessibility:** **nothing is announced on load** — a live region that greets a returning reader is noise, and the state is in Status, which is `aria-live="off"`. Focus never moves. Tab stops unchanged. 1.4.1: the pre-filled meter duplicates words that are already there. No new token, no new colour pair.
- **Cost beyond A:** one `data-resume` attribute on Root, one option on the hook, a storage helper in `core` (no DOM at module scope), and three keys: `readAloud.resume`, `readAloud.resumePosition`, and `readAloud.resumeCleared`.

---

## Comparison, all eight

| | Chrome | Position cue | Idle targets | Reach on a long page | Layout shift | Tab stops idle → playing | New parts / keys | Cost vs A | Needs approval beyond §9 Q1 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| **A** panel | Bordered panel | Meter + words | 4 (3 dead) + select | Poor | None | 6 → 6 | Progress, Transport / 0 | baseline | no |
| **B** grows on press | None | Words + highlight | 1 | Poor | On press and at the end | 2 → 7 | 0 / 0 | lower | no |
| **C** text carries position | Strip → band | Rail in the article | 4 (3 dead) | Good | None | 7 → 7 | Rail, Root wraps content / 0 | highest | gutter ownership |
| **D** listen where you are | None → band | Words + highlight | 1 (link-look) | Good | On press, at every `h2` | 2 → 7 (+3/section) | 0 / 1 | medium | no |
| **E** more controls | None | Words | **2, none dead** | Poor | On open and close | 2 → 6 | 0 (reuses Disclosure) / 1 | **lowest** | no |
| **F** docked | Panel + fixed bar | Words, twice | 4 + select | **Best** | None | 6 → 6 + 4 | Dock / 1 | **highest API** | **"never sticky" (maintainer)** |
| **G** listen view | A whole view | Words + highlight | 1 (then a view) | Good, inside the view | A page change | 2 → 6 | 0 / 2 | medium (docs-heavy) | sticky **inside the view** |
| **H** continue listening | Whatever it composes with | Words + pre-filled meter | unchanged | unchanged | None | unchanged | 0 / 3 | low | storage scope |

## Revised recommendation across all eight

1. **Ship E as the default composition, with A's panel as the `--prominent` alternative** — but move **Previous sentence into the bar**, next to Pause, and leave only Next, Stop and Speed behind "More controls". That hybrid is the honest reading of the evidence: the market's progressive toolbars (ReadSpeaker, Select to Speak) are right that two controls beat six at rest, and the podcast evidence is right that *back* is the control people reach for. It costs one choice class and one key, and it deletes A's three dashed dead buttons without B's shift.
2. **Add H to whatever ships.** It is the only concept here that fixes a failure of the service rather than of the layout, it costs no pixels, and it is the cheapest thing on this page to test (did the returning resident press Continue, or start again?).
3. **Put F to the maintainer as a question, not a plan.** The evidence genuinely favours a docked player — Medium, Edge, Pocket and every podcast app dock, and `kv-quick-exit` proves this library can dock within 2.4.11 — but the `(min-height: 30rem)` rule means it vanishes at 400% zoom, i.e. for the user it was built for. Decide it with session data from task 1 and 6 of §8, not now.
4. **Keep G in the drawer for the municipal reference site, not the library.** It is the best experience in this document for the hardest-case user, and the worst fit for a headless component: almost all of it is the consumer's route.

**Traps, named.** **F is the trap of this second pass**: it looks like "what everyone does", and the honest version of it is a fixed bar, an observer, a viewport query, a consumer duty and a doubled Pause — a lot of machinery whose first act under magnification is to disappear. **E's trap is smaller and sharper**: shipped as drawn, with Previous behind the disclosure, it fails the one user it exists for; recommendation 1 is only safe with Previous promoted. **H's trap is the restart button** — a second idle control that re-creates exactly the clutter A was criticised for; Stop already does the job. And D's per-section repeats remain the trap of the first pass.

## Open questions added by this pass

6. **Does "never floating, never sticky" stand?** F and G both ask. G's is much the smaller ask (sticky inside a view the resident chose to enter) and could be approved alone.
7. **May the library write to `sessionStorage` at all** (H)? If not, H becomes a documented consumer recipe over the hook's `position`, which is a fine outcome and costs the library nothing.
8. **In E, is `More controls` the right wording,** or does it need to name what is inside ("Speed and skipping")? Untested; both are new keys, so the choice is free until it ships.
9. None of E–H is tested with residents, and nothing above was checked with assistive technology. The §8 plan stays `pending`.

---

# Third pass: Concept J — a top bar with a media transport (research, then the spec)

- **Why:** the maintainer has chosen a direction from the prototype — **I's top bar with E's "more controls"**, as a media transport with a settings menu — and named **Funka's Talande Webb** as the reference. This pass is the research behind that reference and the buildable anatomy. Everything binding in the second pass still binds; the one rule J challenges is named below. **I** is in the prototype only; its row is added to the table at the end.

## What Talande Webb actually is (checked 2026-10-25)

| Fact | Finding |
| --- | --- |
| Maker | **Not Funka's own engine.** It is Texthelp's Browsealoud, now **ReachDeck**, resold and localised by Funka in Sweden ([Funka](https://www.funka.com/vi-erbjuder/talande-webb/): "utvecklad av Texthelp, ett irländskt bolag"). **Plan 0151's guess is confirmed.** Free to the visitor, **annual licence paid by the site owner**, no code change, 34–40 languages with automatic language detection |
| Trigger | A speaker/ear symbol **with the word "Lyssna", top right of the page** ([Essunga](https://www.essunga.se/om-webbplatsen/las-mer-om-talande-webb.html): "klickar du på symbolen med örat och texten Lyssna upp till höger"). The transport is not on the page until then |
| The bar | A **docked toolbar at the top on desktop, at the bottom on mobile**, drawn by the vendor's script over the site ([Lymphoma Action](https://lymphoma-action.org.uk/information-and-support/support-you/books-and-information/accessible-information/reachdeck-toolbar)) |
| Controls, in order | hover-to-speak (pointing hand) · **play · pause · stop** · settings (cog) · translate · picture dictionary · MP3 · screen mask · text magnifier · simplify. **Icons only, about ten of them, no words** |
| Settings (cog) | highlight colours, magnifier default and size, **speech speed**, hover-to-speak on/off, font size/type/colour, simplify default, highlight links |
| Siblings | **ReadSpeaker webReader**: a worded "Listen" button in the content that expands in place to pause · stop · seek slider · volume · speed · close, with a second toolbar behind a chevron ([product sheet](http://tcuonline.tcu.edu/wp-content/uploads/ReadSpeaker-webReader-Product-Specification-Sheet.pdf)); in Finland it ships with the access keys **Alt+K** to listen and **Alt+1** for the menu ([hos.fi](https://hos.fi/readspeaker-webreaderin-kaytto/)) — an access key on a public page collides with AT and browser keys, and we take none of it |

**How these bars fail, in the record.** (1) **Supply chain:** the Browsealoud script was compromised in Feb 2018 and injected a Monero miner into **over 4,000 public sites** including the ICO, NHS and the US courts ([The Hacker News](https://thehackernews.com/2018/02/cryptojacking-malware.html), [cside](https://cside.com/blog/the-browsealoud-supply-chain-attack-a-case-study-in-cryptojacking)) — the price of one vendor script on every page. (2) **Data:** webperf measured Talande Webb and ReadSpeaker sending visitor IPs to US-controlled endpoints, and found **54% of Swedish municipalities and regions run one of the two** ([webperf.se](https://webperf.se/articles/gdpr-talande-webb-och-readspeaker/)). (3) **Quality:** NDLA switched ReadSpeaker's "Lytt til tekst" **off** because it could not tell languages apart and read badly ([NDLA support](https://support.ndla.no/hc/no/articles/360009660960-Lytte-til-tekst)) — our 3.1.2 rule exists for exactly this. (4) **Regulator:** Norway's Uutilsynet says there is **no requirement** to offer read-aloud at all; if you do, it must be a real button with descriptive label text and be easy to find ([uutilsynet](https://www.uutilsynet.no/podkast-og-webinar/universell-utforming-av-innhold-pa-nettsider/2786)). (5) **Icons:** the documented fix for an icon-only toolbar was adding text labels ([UX Myths](https://uxmyths.com/post/715009009/myth-icons-enhance-usability)), and labels measurably close comprehension gaps for older users.

## The Spotify transport, and what breaks without a timeline

Learned order, in every music and podcast app: **previous · play/pause · next**, play/pause centre and largest, nothing between them, stop absent (stop belongs to document readers — ReachDeck and ReadSpeaker both keep it). **So J is a transport with four controls and a word-based position, not a player:** the meter stays A's silent `aria-hidden` length, never a slider, because the honest readout is "Sentence 3 of 12".

| Convention | Depends on a timeline? | J |
| --- | --- | --- |
| prev · play/pause · next, play largest | no — item boundaries | **keep**. A sentence is our track |
| One play/pause toggle that never moves; a speed menu | no | **keep**: A's shared grid cell, and Speed in the settings menu |
| **Previous restarts the current track after ~3 s, else goes back one** ([Spotify's rule](https://github.com/ralph/Spotifly/pull/201), [and the complaints when it surprises people](https://community.spotify.com/t5/Accounts/I-click-restart-partway-through-song-but-it-doesn-t-restart-just/td-p/5374697)) | **yes** — needs elapsed time inside the item | **cannot copy.** Previous always means the previous sentence; **in sentence 1 it re-reads sentence 1**, so the control is never dead |
| Scrubber, elapsed/remaining, ±15 s, chapters, sleep timer, buffering inside a track | **yes** | **drop all.** 0151 returns no word alignments, and 12 sentences at 288px is a 24px step. Our wait is per chunk: the spinner in Play, `preparing` once past 1 s. Shuffle, repeat and a queue are meaningless: there is one text, read in order |

## Concept J — anatomy

```
a.kv-skip-link                                        ← stays the first Tab stop in body (DESIGN.md)
header.kv-site-header                                 ← the bar is its first row, so nothing sits outside a landmark
  div.kv-read-aloud.kv-read-aloud--bar  role=group aria-label=readAloud.barLabel  data-status data-error data-sticky
    div.kv-read-aloud-bar-inner                       ← Container size="wide", flex row, wrap, column-gap space-3, row-gap space-2
      span.kv-read-aloud-lede    [headphones 20] strong readAloud.barLabel      ← idle only; margin-inline-end auto
      div.kv-toolbar  role=toolbar  aria-label=readAloud.barLabel               ← Toolbar.Root: ONE Tab stop
        button.kv-button.kv-button--icon-only.kv-read-aloud-previous  [skip-previous]  name readAloud.previous
        button.kv-button.kv-read-aloud-play            [play|pause|spinner] + the word  ← words always
        button.kv-button.kv-button--icon-only.kv-read-aloud-next      [skip-next]      name readAloud.next
        button.kv-button.kv-button--icon-only.kv-read-aloud-stop      [stop]           name readAloud.stop   ← space-6 before it
        button.kv-button.kv-button--icon-only.kv-popover-trigger      [settings] aria-haspopup=dialog  name readAloud.settings
      span.kv-read-aloud-progress aria-hidden  style="--kv-read-aloud-progress:.25"     ← flex 1 1 8rem, min 5rem; playing/paused only
      p.kv-read-aloud-status  role=status aria-live=off   Sentence 3 of 12
      p.kv-read-aloud-note    readAloud.note + a.kv-link readAloud.howItWorks           ← idle: the full sentence; otherwise the link alone
      button.kv-button.kv-button--icon-only.kv-read-aloud-hide  [close] name readAloud.hide  ← idle only (see States)
    div.kv-popover-popup role=dialog aria-label=readAloud.settings              ← Popover.Popup, top layer
      div.kv-field  label readAloud.rate   select.kv-listbox-native
      div.kv-field  label readAloud.voice  select.kv-listbox-native             ← only when the page has more than one voice
      p.kv-read-aloud-note  readAloud.note  a.kv-link readAloud.howItWorks
```

- **Everything is a shipped recipe**: `kv-button` (+`--icon-only`, square at `--kv-control-min-block-size`, **not** the prototype's round `radius-full` pill — a round transport is a new look and a new rule for no gain), `Toolbar` (roving tabindex, APG), `Popover` (`role=dialog`, Escape, focus returns to the trigger), `kv-field` + `kv-listbox-native`, `kv-link`. Play keeps A's shared grid cell so it never changes width, and stays **secondary** unless the Root carries `kv-read-aloud--prominent` (the 2026-10-25 maintainer decision).
- **Sizes:** bar padding `--kv-space-2` block, `--kv-space-4` inline (`--kv-space-6` from 64rem); `--kv-space-2` inside the transport cluster, `--kv-space-3` between zones, `--kv-space-6` before Stop from 40rem; every control 44px (32px compact, never under 24); meter `--kv-space-2` tall with the `sm` radius; `surface` fill and a 1px `border-subtle` block-end hairline. **No new token and no new colour pair** — `text` and `text-muted` on `surface`, the button recipes and the meter's `border-control` edge are all measured already, so `theme:check` has nothing new to measure.
- **Why a settings *popover* and not E's disclosure:** a disclosure pushes the whole page down, from the top of the document, on every press; the popover is in the top layer and moves nothing. **Nothing in it is needed to operate the player**: Speed and Voice are preferences, and the note is repeated there but is also in the bar at idle. Pause, Previous, Next and Stop are never behind it (2.2.2, and E's documented sin).

## States

| `data-status` | Lede | Play | Prev / Next / Stop | Meter | Status | Note | Hide |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `idle` | shown | `play` + readAloud.play | **not rendered** (nothing dead in site chrome) | – | empty, 1 line reserved | full sentence + link | shown |
| `preparing` | hidden | spinner at 300 ms + readAloud.pause | rendered, live | holds | `preparing` from 300 ms | link only | hidden |
| `playing` | hidden | `pause` + readAloud.pause | live | current / total | `position` | link only | hidden |
| `paused` | hidden | `play` + readAloud.play | live | holds | `positionPaused` | link only | hidden |
| error (`data-error`) | hidden | `play` + readAloud.play | live | holds | the error + `warning` icon | link only | hidden |

**Dismissed:** the bar collapses to one `kv-read-aloud-play` button in the same row, focus moves to it, nothing is announced, and it lasts for this page view only (**no storage**). **Hide is rendered at `idle` only:** hiding the only Pause while audio runs would break 2.2.2, and a bar dismissed into nothing leaves a resident with no way back.

## Wide, 320px, static and sticky

- **From 64rem:** one row — lede · transport · meter · Status · Note link · Hide. **40–64rem:** the lede drops and Status and the Note link wrap to a second row. **320px:** the transport is one row of five 44px targets (four icons plus the worded Play ≈ 288px exactly), the meter and Status a second row, the Note a third at idle. **Two rows playing, three idle — about 150px of a phone screen, on every page.** That number is the whole argument against sticky.
- **Static (recommended):** the bar sits in the document above the header and scrolls away. Reach on a long page is no better than A's.
- **Sticky (needs the maintainer's approval, as F established):** `position: sticky; inset-block-start: 0` **only while `data-status` is not `idle`**, so nothing is ever pinned over a resident who never pressed Listen. With it: `scroll-padding-block-start` on `html`, in `rem`, to the bar's height (2.4.11, 1.4.12), and the consumer owes nothing else. **At `(max-height: 30rem)` it un-sticks rather than disappearing** — the honest version of F's rule: the magnifier user keeps the controls, at the top of the document, instead of losing them.

## Best at, worst at

- **Best at:** one include per site instead of one placement per article — the cheapest integration of all ten, and the only one a CMS can switch on globally. It is where Swedish residents have been taught to look ("Lyssna", top of the page). It never touches the article's DOM or layout, so nothing shifts; the whole transport is one Tab stop; and it survives a page with no `h1` or no clean content root.
- **Worst at:** **it does not know what it will read.** A site-wide bar is attached to the page, not to an article, so "Listen to this page" promises navigation, cookie text and footers unless the consumer sets `contentRef` per route — and when they do not, the first thing the hardest-case user hears is the menu. It is far from the text at 400% zoom, it spends ~150px of a phone on every page, its silhouette is an accessibility overlay (below), and the icon-only transport is a rule change (below).

## Accessibility

- **Tab order.** The skip link stays **first** (DESIGN.md; 2.4.1): the bar goes **after** it and before the header's nav. That is acceptable only because J is **2 Tab stops** (toolbar → Note link; 3 at idle with Hide), thanks to `Toolbar`'s roving tabindex — a worded five-button bar would be 5–6 stops before the nav on every page, which is not. Inside the toolbar: ArrowLeft/ArrowRight move, Home and End jump, and the arrows flip in RTL.
- **Icon-only transport — the rule conflict, resolved.** DESIGN.md allows icon-only for close, search, copy, map controls and dictation only, and the research above says words are what this audience parses fastest. **Recommendation: a hybrid.** The word stays on **Play/Pause** at every width (it is the entry point, the 2.2.2 control and the one with a privacy consequence), and **Previous, Next, Stop and Settings are icon-only**, each with its name from i18n, a Tooltip where a pointer hovers, and all four inside a toolbar named "Listen to this page". Why for *this* audience: ▶❙ ❙◀ ■ ⚙ are the most-learned glyphs in public use (every phone lock screen, car stereo and TV remote), their consequence is immediate, audible and undone by one more press, and the alternative — words on five controls — is a **three-row bar at 320px on every page of the site**, which costs the same reader more than the glyphs do. **This needs a DESIGN.md amendment and the maintainer's approval.** If it is refused, J is not buildable as drawn: fall back to I's bar carrying E's composition (a worded Listen plus "More controls"), and say so in the plan.
- **2.5.8:** every control is 44px (32px compact) with `--kv-space-2` between them; the slim band grows instead of shrinking its targets, and it never uses the 24px bar-item height of `kv-top-bar`.
- **2.4.11 / 400% / 1.4.12 and forced colours:** the sticky rules above cover the first three, and static there is nothing to obscure; text spacing only makes the band taller. `Canvas` fill, `CanvasText` hairline and icons, `Highlight` meter fill and ring — A's rules unchanged. Every icon-only control keeps its shape, and Status carries every state in words (1.4.1).
- **Announcements:** unchanged from A — `preparing` past 1 s and the three errors, polite, at most once per press. **Nothing** on opening or closing the settings, changing speed, hiding the bar, or any transport press.
- **The settings menu:** `Popover` (`role=dialog`, named `readAloud.settings`) holding Speed, Voice (only when the page has more than one) and the privacy note. **Nothing in it is required to operate or stop the player**, and the note is also in the bar at idle, before any press. **Escape, in order:** with the settings open, Escape closes the popover and returns focus to its trigger; a second Escape inside Root stops the audio — one Escape, one layer (`useDismissableLayer`).

## Cost beyond concept A

Three new classes (`kv-read-aloud--bar`, `-bar-inner`, `-lede`), two shipped parts composed (`Toolbar`, `Popover`), one new part (`ReadAloud.Hide`), three keys (`readAloud.barLabel`, `readAloud.settings`, `readAloud.hide`), one new `data-sticky` state, and **one DESIGN.md amendment** (icon-only in a read-aloud transport). No new token, no new colour pair, no storage. Sticky adds a documented `scroll-padding-block-start` and the `(max-height: 30rem)` rule.

## Is this an accessibility overlay? Honestly

The silhouette is the same: a persistent, site-wide accessibility bar is what ReachDeck, UserWay and accessiBe put on a page — the pattern **72% of disabled experts rate "not at all" or "not very" effective** ([Scope](https://business.scope.org.uk/why-accessibility-overlays-and-widgets-do-not-improve-your-website-accessibility/), [Overlay Fact Sheet](https://overlayfactsheet.com/en/)). **J differs in what it does, not in where it sits:** it is one first-party feature that reads the page's own text aloud; it changes no other element, overrides no user setting, detects no assistive technology, claims no conformance, and is built by the team that built the page. It is not a layer over a site — it is part of one. **What the docs must say, in these words:** ReadAloud is a convenience for people who prefer to listen; it does **not** make a page accessible, it is **not** a substitute for semantic HTML or for a screen reader, no rule requires it (Uutilsynet, above), and a site may ship it only **in addition to** meeting WCAG 2.2 AA. The docs must also say what the bar sends, to whom and when — once, in the bar, before the first press, never only in a cog menu.

## Comparison: the two rows this pass adds (rows A–H above are unchanged)

| | Chrome | Position cue | Idle targets | Reach on a long page | Layout shift | Tab stops idle → playing | New parts / keys | Cost vs A | Needs approval beyond §9 Q1 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| **I** top bar | Full-width band, site-wide | Words | 2 + dismiss | Good if sticky | None (the page never moves) | 3 → 7 | Bar, Hide / 2 | medium | sticky; the bar before the nav |
| **J** player bar | Band + popup | Meter + words | **2 (worded Play, Hide)** | Good if sticky | None | **2 → 2** (toolbar) | Bar, Hide + Toolbar, Popover / 3 | medium | **icon-only transport (DESIGN.md)**; sticky |

## Recommendation

1. **Icon-only: a hybrid, not pure Spotify.** Words stay on Play/Pause at every width; Previous, Next, Stop and Settings are icon-only inside a named `Toolbar`, with i18n names and Tooltips. It buys the two-Tab-stop bar and the two-row phone layout, and it keeps the word on the one control that starts a request to a server. It is a DESIGN.md change — **ask the maintainer**; if it is refused, build I with E's composition instead and drop J.
2. **Static by default; sticky only while playing, and only with approval.** A bar pinned to the top of every page before anyone has pressed anything is the overlay silhouette, and it costs ~150px of a phone. Pinned only after a real press, it is a player, which is what was asked for. At `(max-height: 30rem)` it un-sticks rather than vanishing, so the magnifier user keeps it.
3. **Compose H with it** (the remembered position) — free here — and keep Q10 open until it is answered, because it decides what the bar actually reads.

## Open questions added by this pass

10. **What does "this page" mean?** A site-wide bar needs a `contentRef` per route, or it reads the navigation. Is that a documented consumer duty, or does the library default to `main`?
11. **Does Hide survive a page load?** Per page view costs nothing and annoys a returning resident; persisting it needs the same storage decision as H (Q7).
12. **Tooltips on touch.** DESIGN.md makes copy show its word beside the icon where no Tooltip can show. Does the transport need the same at 320px — and if it does, is the hybrid still worth it?
13. Nothing in this pass was tested with residents or with assistive technology. The §8 plan stays `pending`; tasks 1 and 6 should now also measure whether the glyphs are read correctly, and whether anyone looks for the privacy note before pressing.
