# Plan 0154: ReadAloud player design — the player bar

- **Status:** In progress · **Owner:** lead → component-engineer, accessibility-reviewer
- **Created:** 2026-10-25 · **Target:** 1.2
- **Related:** [0153](0153-read-aloud-kvirn-only.md) (the engine this sits on), spec
  `docs/design/read-aloud.md`, concepts `docs/design/read-aloud-concepts.md` (A–J) and the HTML prototype
  `docs/design/read-aloud-concepts.html`

## Goal

A resident can start listening from anywhere on a public-sector site, from a control that looks like a player
they already know, without the site having to place anything per article.

## Background

Ten concepts (A–J) were drawn and put in a running HTML prototype on the real theme. **Concept A (a bordered
panel) was built first and is green** — it is on disk, uncommitted, and **J supersedes it as the direction**.
What A built survives: the `Progress` and `Transport` parts, the icons on controls, the meter, and
`read-aloud.css`'s state treatments. What changes is the addition of a top bar and a shared settings menu.

**Research (2026-10-25, sourced in the concepts file):** **Talande Webb is Texthelp's Browsealoud/ReachDeck,
resold by Funka** — confirming 0151's suspicion. Its record is the argument for a first-party component:
the **2018 Browsealoud cryptojacking served a Monero miner across 4 000+ public-sector sites**, webperf
found **54% of Swedish municipalities** run such a widget with GDPR findings, and NDLA switched ReadSpeaker
off over language detection. **Uutilsynet's position is that read-aloud is not legally required at all** —
so we never imply otherwise (rule 8).

## Non-goals

- A seekable meter (0154 D3). Floating, dragging, auto-hiding, or anything that covers the entry point.
- An "accessibility widget" that claims to fix a site. J is one honest feature the site hosts itself.
- Word-level highlighting, PDF reading, API keys (0151 stands).

## Design

Per `docs/design/read-aloud-concepts.md` §"Third pass: Concept J" and the prototype. Two surfaces, one
behaviour:

- **The top bar** — a band at the top of the page, above the site header and **after the skip link**. A
  four-control transport in a **`Toolbar` (one Tab stop, not five)**, an optional "Listen to this page" lede,
  the meter, a count, a Settings menu and Hide. **Static when idle; sticky only while playing** (D10).
- **The inline panel** — unchanged from A: worded buttons (`Listen`, `Previous sentence`, `Next sentence`,
  `Stop`), the transport cluster with Stop set apart, meter, Status and the privacy Note. It keeps words; it
  has the room.
- **One Settings menu, shared by both** (D8): Speed, Voice, Highlight. A `Popover`, reusing `kv-field` and
  `kv-listbox-native`.

### New public API, beyond what A shipped

`ReadAloud.Bar` (the top bar), `ReadAloud.Settings` (the shared menu). Classes `kv-read-aloud-bar`,
`-settings`, `-lede`, `-count`, and `kv-button--icon-only` reused for the transport.

### Accessibility

- **Tab order:** after the skip link, before the nav. Acceptable only because the transport is **one** Tab
  stop (a `Toolbar` with arrow-key navigation), giving 2–3 stops total. Five buttons at the top of every page
  would not be.
- **Target size (2.5.8):** 44px in a slim bar, including the icon-only controls.
- **Sticky:** at `(max-height: 30rem)` it **un-sticks rather than disappearing**, so the magnifier user keeps
  the controls — this is the fix for what made concept F a trap.
- Announcements unchanged from 0153: `preparing` once past 1 s, never per sentence; one polite status region;
  `partSkipped` visible only. Nothing announces when the bar becomes sticky (it is chrome, not news).
- **SCs:** 1.4.1, 1.4.2, 2.1.1, 2.2.2, 2.4.11, 2.5.8, 3.1.2, 3.3.1, 4.1.3.

## Tasks

- [x] T1 `ux-designer`: spec rev 3, concepts A–J with sourced research, the Talande Webb finding.
- [x] T2 `component-engineer`: Concept A built — `Progress`/`Transport` parts, icons, panel, cluster, meter.
      56 story tests × 4 themes green. **Superseded in direction by J; the parts survive.**
- [x] T3 `component-engineer`: `DESIGN.md` — the icon-only amendment (D9), the sticky amendment (D10) and the
      panel recipe (D2). **These are rule changes: they land with the code that needs them, in one PR.**
- [x] T4 (partial) `component-engineer`: `ReadAloud.Bar`, `ReadAloud.Settings`, `ReadAloud.Hide`; the `Toolbar`
      transport (one Tab stop); the `contentRef` → `scope` → `main` default (D11, D15, with the
      `KV:READ-ALOUD:START`/`STOP` marker pair in `collectText`); the hybrid labels (D9, D14, CSS-only);
      static→sticky (D10); `read-aloud.css`; the package's own `read-aloud.md` and `read-aloud.a11y.md`.
      **`apps/storybook` and `apps/docs` (stories, the Docs page, `read-aloud.api.ts`) are explicitly out of
      scope for this pass** (the brief's Don't list) — the next two tasks.
- [x] T5 `component-engineer`: the 3 new i18n keys × 5 locales (bar label, settings, hide). fi/nb/nn are
      machine drafts pending native review, as the existing strings already are.
- [ ] T6 **user**: run it and approve.
- [ ] T7 `component-engineer`: the full test suite (with 0153 T7). **`packages/read-aloud/src/read-aloud.test.tsx`
      does not exist yet**, so the contract currently cites tests that have never run. T7 must cover, at
      minimum: every keyboard-contract row including the **Bar Toolbar's** arrow/Home/End/Escape rows;
      the `Retry-After` retry (0153); the `contentRef → scope → main` resolution and its two dev warnings;
      the `KV:READ-ALOUD:*` markers and their three warnings; `hasVoice` for sv/fi/no-engine; `WhenStarted`;
      and axe in every story state. **Until then, no keyboard row is proved — do not claim otherwise.**
- [x] T8 `component-engineer`: every story in a real page frame (D27, D28) — `Default` the Bar above a
      site header at full page width, `Inline` the one "Listen to this text" button under the h1 and the
      dateline, and each state story in the same frame so it shows where it lives.
- [x] T9 `component-engineer`: `read-aloud.css` — the Bar is always a full-width band, Root paints no panel
      around one and carries the sticky instead (D38, D39); `docs/design/read-aloud.md` §5-6 corrected to match;
      `kv-read-aloud--prominent` retired (D41) and DESIGN.md's inline control panel recipe deleted (D42). The idle
      inline panel's chromeless state (D13, D40) could not be made CSS-conditional: `hasEverPlayed` is hook-only
      state, exposed nowhere as a `data-*` attribute, and `packages/read-aloud` is out of this task's scope — left
      undone, flagged for a `packages/read-aloud` pass.
- [x] T10 `component-engineer`: the stories, the fixture and `apps/docs` catch up with D40–D42 — the
      `InlineProminent` story and the fixture's `prominent` prop go, `read-aloud.api.ts` drops the class, and
      every story is re-checked against the band and the chromeless idle panel.
- [x] T11 `component-engineer`: `data-started` on Root (D43) and the chromeless idle inline panel it unblocks
      (D13, D40) — the one item T9 left undone.
- [x] T12 `component-engineer`: the inline variant becomes a bare button row (D44) — the panel chrome and
      `data-started` go, Pause/Stop/Settings sit in a row, Status shows only when it has something to say.
      Plus the designer's doc contradictions: the sticky is on Root-with-a-Bar and not the Bar, Speed is in
      Settings not the panel, the stale §8 question and 8k header comment.
- [x] T13 `component-engineer`: the inline stories rebuilt for the button row; `InlineFullTransport` and the
      meter/transport stories retired.
- [ ] T14 `lead`: gates, the four sweeps, `accessibility-reviewer`, roadmap, commit.
- [ ] T15 `component-engineer`: move the `### Read aloud` table in `read-aloud.a11y.md` from "Roles, states,
      properties" to "Announcements" (`contract-template.md:41-46`), so the docs page shows it as the Read aloud
      table (reviewer note, Plan 0156, 2026-11-10).

## Decisions

- **D1 `Progress` and `Transport` ship as parts (maintainer, 2026-10-25).** `Progress` must be a part — it
  reads `index` and `chunks.length`, which a `<div>` cannot. `Transport` creates the cluster, Stop's 36px
  separation and the `1fr 1fr` mobile grid; hand-written, a typo degrades silently to evenly-spaced buttons.
- **D2 The panel is a new container recipe, recorded in DESIGN.md (maintainer, 2026-10-25).** A Section is
  square and hairline-free; a Card is always `surface-raised` and would imply elevation this lacks.
- **D3 The meter is informative, never seekable (ux-designer, 2026-10-25; maintainer accepted).** A slider
  would need Arrow/Home/End/PageUp/PageDown, `aria-valuetext` and a pointer alternative (2.5.7) — and at
  288px with 12 sentences each step is 24px, so the hardest-case user is likeliest to lose their place.
- **D4 Listen is quiet by default in the panel; `kv-read-aloud--prominent` promotes it (maintainer,
  2026-10-25).** The designer recommended the reverse. **The cost is discoverability**, so the docs must show
  `--prominent` and say when to use it. The bar's Play is filled regardless — it is the bar's only action.
- **D5 Icons join words, never replace them in the panel (maintainer, 2026-10-25).** `mirrorInRtl: false`
  stays on the transport icons: a media transport follows the media, not the script.
- **D6 Nav: ReadAloud has its own category (maintainer, 2026-10-25).** Storybook `'Read aloud/ReadAloud'`;
  docs group id **`reading-aloud`** (the literal `read-aloud` collides with the component's page slug), label
  "Read aloud", component URL unchanged.
- **D7 Concept J, the player bar (maintainer, 2026-10-25).** Chosen from A–J after seeing all ten running.
  A's panel stays as the in-content player; J adds the top bar. The pitch is integration cost: one include in
  the layout, nothing per article — which no other concept matches.
- **D8 One Settings menu, shared by the bar and the panel (maintainer, 2026-10-25).** Speed, Voice and
  Highlight live in one place. **Consequence to watch:** the panel loses its always-visible Speed select, and
  speed is the most-adjusted setting in read-aloud tools — a dyslexic reader slowing the voice is the
  canonical first action. If testing shows that press costs too much, put Speed back in the panel only.
- **D9 Hybrid labels, and a DESIGN.md amendment (maintainer, 2026-10-25).** The word stays on **Play/Pause
  always**; Previous, Next, Stop and Settings are icon-only with names from i18n. This **amends DESIGN.md's
  icon-only list** (currently close, search, copy, map controls, dictation) to add a read-aloud transport.
  Bought by the fact that fully-worded controls make a **three-row bar at 320px on every page**. **The risk is
  real and named:** words are what low-literacy and second-language readers parse fastest, and they are this
  feature's audience; screen-reader users are unaffected, so a failure here would be silent. Open question 12
  (does touch need words at 320px) is the test that would reverse this.
- **D10 Static when idle, sticky only while playing (maintainer, 2026-10-25).** **Reverses "never floating,
  never sticky"** in `read-aloud.md` §5 and §9 Q5 and in DESIGN.md Layout; `kv-quick-exit` is the precedent
  that an approved exception already exists. Nothing is ever pinned over a resident who has not pressed
  anything — which is also what keeps J from reading as an overlay widget. At `(max-height: 30rem)` it
  un-sticks instead of disappearing, so the magnifier user keeps the controls.
- **D11 The bar reads `<main>` by default, overridable (maintainer, 2026-10-25).** A site-wide bar does not
  know what it will read; without this, **the first thing the hardest-case user hears is the navigation** —
  J's worst failure (open question 10). `main` is required on these sites for their own accessibility, so the
  default works out of the box and a consumer passes a `contentRef` per route where it does not.
- **D12 The bar carries no lede and no meter (maintainer, 2026-10-25).** "Listen to this page" and the
  progress meter are removed from the top bar: the word **Listen** on the filled play button identifies it,
  and the group keeps `aria-label="Listen to this page"` for assistive tech. The count is empty when idle and
  reads **"Sentence 2 of 5"** while playing — words, not a fraction, matching the panel. **Refines D3:** the
  meter is informative-only _and_ lives only in the inline panel. The bar is for reach, the panel for detail.
  **Open risk:** whether a sighted visitor reads a bare transport strip as "this page can be read aloud" or
  as unexplained media controls. One usability session answers it.
- **D13 The idle panel is one Listen button (maintainer, 2026-10-25).** No chrome, no dead controls, no empty
  meter; the transport appears on the press, in the same place, so Listen never moves. This is concept B's
  mechanic, adopted into J. It mostly retires **D4**'s reasoning — quiet-by-default existed so Listen would
  not compete with a page's primary action, but when it is the only control on screen the filled look is just
  the invitation. **Cost:** the article shifts when the panel opens; a flag keeps the panel open once used, so
  it never collapses mid-read.
- **D14 Options are composition and classes, never presentation props (lead, 2026-10-25, rule 14).** Showing
  the progress bar is **composition** — render `ReadAloud.Progress` or do not, which is why it is a part.
  Icons versus words is a **choice class**, `kv-read-aloud--icons` / `--words`, hybrid being the default
  (D9). No `showIcons` or `showProgress` prop: rule 14 allows no presentation prop beyond `variant`, `size`
  and `orientation`, and composition gives the same control without a rule change.
- **D15 A markup API: comment markers and a selector scope (maintainer, 2026-10-25).** Extends D11.
  **Resolution order for what is read:** `contentRef` → `scope` (a CSS selector, e.g. `'#article'` or
  `'.content-body'`) → `<main>`. **Within** the resolved root, `<!-- KV:READ-ALOUD:START -->` and `<!-- KV:READ-ALOUD:STOP -->`
  comment pairs narrow it further: if any `KV:READ-ALOUD:START` is present, only the marked ranges are read; if none,
  the whole root is. Several pairs are allowed. A selector scope still respects markers inside it.
  - **Why comments:** they are framework-agnostic and survive any template language, so a CMS site can mark
    regions without touching React. They also mark **mid-flow ranges that do not align with an element**,
    which `data-kv-read-aloud-skip` cannot — the two are complementary, inclusion versus exclusion.
  - **Known limitation, must be documented:** React/JSX cannot emit HTML comments, so the marker API is for
    server-rendered and CMS markup. React consumers use `contentRef` or `data-kv-read-aloud-skip`.
  - **Namespaced on purpose (maintainer, 2026-10-25):** `KV:READ-ALOUD:START`, not the generic `KV:START`
    first proposed. A bare `KV:` prefix would reserve the whole library's markup namespace for one feature,
    and public markup is expensive to change once a CMS template ships it. **No `KV:START` alias** — keeping
    one would reserve the generic namespace anyway, and nothing has shipped, so there is nothing to migrate.
  - **Known risk:** HTML minifiers strip comments by default. The docs must say so and name the setting to
    preserve them; an orphan `STOP` and an unclosed `START` both get a dev warning rather
    than silently reading the wrong thing.
- **D16 `ReadAloud.Settings`'s one implementation is `as`/`ref`-forwarding, not two components
  (component-engineer, 2026-10-25).** It renders a plain `Popover.Trigger` plus `Popover.Popup`, and forwards
  every prop (`ref` included) onto the trigger — the same convention `Popover.Trigger` and `Toolbar.Item`
  already use. That is what lets the Bar's default composition write `<Toolbar.Item as={ReadAloud.Settings}>`
  (one Tab stop, registered) while the panel renders `<ReadAloud.Settings />` bare (an ordinary button, no
  warning): `Toolbar.Item`'s own outside-root dev warning is never triggered either way, because `Settings`
  itself never calls that hook — only `Toolbar.Item` does, and only when it is actually used.
- **D17 Hybrid labels are CSS-only, not a new render path (component-engineer, 2026-10-25).** Previous, Next,
  Stop and Settings already render icon + a text label (the accessible name); 0154 only wraps that label in
  `<span class="kv-read-aloud-button-label">` so `read-aloud.css` can visually hide it inside `.kv-read-aloud-bar`
  (never `aria-hidden`, so the name never depends on the class). `kv-read-aloud--icons`/`--words` sit on Root,
  matching `--prominent`'s precedent. No JS branches on the mode.
- **D18 No Highlight control in `ReadAloud.Settings` (component-engineer, 2026-10-25).** The brief's prose
  named Speed/Voice/Highlight, but the concept's own buildable anatomy (§"Concept J — anatomy") lists only
  Rate and Voice in the popup, and the task's own `Done` criteria names exactly 3 new i18n keys — none for a
  Highlight label. The engine also exposes no runtime toggle for the sentence highlight (`highlight` is a
  hook option, not a live setting). Built to the anatomy and the `Done` list; a Highlight toggle is a
  follow-up if the maintainer still wants it, needing its own key and a small amount of new hook state.
- **D19 One group, not two (maintainer, 2026-10-25, superseding the component-engineer's nested-group
  draft).** `ReadAloud.Bar` renders a plain `<div>`: no `role="group"`, no `aria-label` of its own. Root keeps
  the one group, and while a Bar is mounted inside it, Root's `aria-label` reads `readAloud.barLabel` instead
  of `readAloud.label` — a screen-reader user pays for a second, near-identical group name on every page of
  the site for no navigational gain. Mechanism: `ReadAloud.Bar` calls `registerBar()` (from the
  `ReadAloudContext`, not `useReadAloud`'s public result) in an effect on mount/unmount; `ReadAloud.Root` holds
  the `hasBar` flag this sets and switches its own `aria-label` on it, the same registration shape
  `Tooltip.Root`'s `registerPart` already uses for `Tooltip.Name`/`Tooltip.Shortcut`. `readAloud.barLabel`
  **survives**: it is still read, just by Root instead of by the Bar.
- **D20 `hasEverPlayed` added to `UseReadAloudResult` (component-engineer, 2026-10-25).** D13's "the idle
  panel stays open for the session, once opened" needs a sticky flag across a later Stop (which returns
  `status` to `idle`). Exposed from the hook (`true` once reading has started, never resets) rather than left
  for every consumer to reimplement with their own `useState`/`useEffect`.
- **D21 The privacy disclosure lives in `ReadAloud.Settings`, not just the panel's `Note` (maintainer,
  2026-10-25, superseding the component-engineer's read of 0153 D11 as panel-only).** The popup always shows
  the recipient sentence (the existing `note` string) once `name` is known — the library already knows the
  recipient, so there is nothing to gate. `ReadAloud.Settings` takes a `howItWorksHref` prop, matching `Note`'s
  own; with no href, no link, and **no dev warning for a missing one** — the destination page is the
  consumer's duty (rule 7; `regulations` territory), not something the library nags for or invents. This is
  how `ReadAloud.Bar` meets the disclosure expectation when a page composes no standalone `Note`: the
  disclosure is one press away, in Settings, not absent.

- **D22 `apps/storybook` for the Bar and the panel, done (component-engineer, 2026-10-25).** 27 stories
  (14 new) × 4 theme projects, 108 tests, axe clean: the Bar's idle, preparing, playing, paused, each error,
  Settings open, Hide, the three label modes and sticky-while-playing; the panel's idle-one-Listen-button
  state (D13) added alongside the existing full-transport, paused, error, `partSkipped` and `--prominent`
  stories. **Finding, not fixed (`packages/read-aloud` is out of this brief's scope):** `read-aloud.md`'s own
  "The idle panel" code sketch calls `useReadAloud()` once outside `<ReadAloud.Root>` to read `hasEverPlayed`,
  and `<ReadAloud.Root>` calls it again internally — two separate machines against the same engine, so the
  external `hasEverPlayed` would never see Play's own presses. The `PanelIdle` story is built from the hook
  directly instead (one call, matching the package's own "Hook" section composition), which is correct but
  not what the doc's compound-parts sketch shows; the doc needs a fix in a later `packages/read-aloud` pass.

- **D23 `ReadAloud.WhenStarted` fixes D22's finding (component-engineer, 2026-10-25).** A part, not a render
  prop (rule 14, `api-conventions`): it reads the Root's own machine through `ReadAloudContext` — the same
  context `Bar`'s `registerBar` and `Hide`'s `status !== 'idle'` check already read — and renders `children`
  once `hasEverPlayed` is `true`, else nothing. `read-aloud.md`'s "The idle panel" sketch now composes it
  instead of a second `useReadAloud()` call, so the documented composition is one machine, correctly driven
  by the same Play press. A dev warning for "two machines" was considered and skipped: the only two shapes
  that create one are a second `useReadAloud()` call outside `Root` (the doc's old mistake, now fixed in
  the one place it appeared) or a second `<ReadAloud.Root>` nested inside the first, which is already loud
  on its own (`<ReadAloud.${part}> must be used inside <ReadAloud.Root>` never fires for a correctly nested
  Root, and a nested Root's own `role="group"` and controls would just be visibly duplicated) — a generic
  check would need to walk context identity or render counts for a case with no quiet failure mode to catch,
  so it is skipped as fragile rather than cheap.
- **D24 The HTML prototype is the authority for the Bar's look (lead, 2026-10-25).**
  `docs/design/read-aloud-concepts.html` is what the maintainer signed off and it **wins over the written
  spec** wherever the two differ. They did differ, and it cost a rebuild: the concepts file says to reuse
  `kv-button` / `kv-button--icon-only`, while the prototype draws a **round, borderless media-player
  transport** with a filled Play. The brief quoted both, the engineer followed the prose, and the Bar shipped
  as a row of ordinary rectangular buttons — structurally correct, visually wrong. **Lesson for the next
  visual change: when a prototype and a written spec both exist, name which one is normative in the brief.**
- **D25 The Bar is exempt from the icon-only Tooltip requirement (maintainer, 2026-10-25).** DESIGN.md's
  icon-only amendment (D9) requires an accessible name from i18n **and a visible Tooltip with the same text**.
  The Bar is exempted, written into the amendment as a decision rather than left as an oversight: play, pause
  and skip glyphs are near-universal, the names are already in each control's accessible name, tooltips on a
  persistent site-wide bar would fire on hover across every page, and **they do not appear on touch at all** —
  where most of this audience is. The exemption covers the Bar only; every other icon-only button keeps its
  Tooltip.
- **D26 `read-aloud` joins `sweepComponents` (maintainer, 2026-10-25).** A gate/config change, hence the
  approval. A sticky bar with round icon-only controls is precisely what breaks under reflow, text spacing,
  200% zoom and forced colours — the two display modes we just amended binding rules for. Costs CI time and
  may surface failures, which is the point: the component was swept by nothing before this.

- **D27 The story page frame is built from `@kvirn-ui/patterns`, not transcribed from the prototype (lead,
  2026-10-26).** Storybook and `read-aloud-concepts.html` now match in **composition, not markup**: the
  prototype's `.site`, `.site-head` and `.crumbs` are throwaway CSS, while the library ships the real thing —
  `PageFrame.Root` (which brings the skip link the Bar's tab order is specified against), `SiteHeader`,
  `Breadcrumb`, `PageHeader`. Transcribing would put hand-written classes and widths in a fixture (rule 14)
  and show adopters markup we do not ship. Costs nothing: `patterns` is already an `apps/storybook`
  devDependency and `theme.css` already imports `patterns.css`. **D24 still holds for the Bar itself.**
- **D28 A story-only frame in the fixture, not a slot on `ContentTypeShell` (lead, 2026-10-26).** The Bar is
  the **first child of `PageFrame.Root`, before the header** (D10, after the skip link), and
  `ContentTypeShell` renders root → header → `children` → footer with no slot above the header. Adding one is
  a `packages/patterns` change, outside what was approved (stories and fixtures). The fixture composes
  `PageFrame` and `SiteHeader` directly, as `site-chrome/site-alert.stories.tsx` already does for a band.
- **D29 `Default` is the top bar page; `Inline` is second (maintainer, 2026-10-26).** The brief named them
  `TopBar` and `Inline`, but `storybook-docs` binds the first export to `Default` as the Docs main example.
  `Default` rendering the Bar in the frame satisfies both — that composition **is** what most adopters write
  (D7). Naming it `TopBar` and amending the skill was offered and declined, so no convention changes.
- **D30 A story is kept only if it is the only one proving a distinct surface × state pair, or a distinct
  choice class (lead, 2026-10-26).** The rule behind the brief's "drop duplicates", so the judgement is
  reviewable. It retires exactly one: **`BarSticky` merges into `TopBarPlaying`** — a frame with a scrollable
  body makes sticky-while-playing observable in the playing story, which is all `BarSticky` staged. Both
  label modes stay (D9 is named here as most likely wrong, so both keep a swept story); the panel's and the
  Bar's error states both stay, the same message in two structurally different surfaces being two states.
  **Net 27 → 26 stories,** no surface × state pair losing axe coverage. (An earlier draft of this decision
  said 28 → 27, from a miscount of the exports; corrected by the engineer in D37.)
- **D31 Plan 0155 renumbered (lead, 2026-10-26).** Two plans claimed 0154. The AI plan is a Draft cited only
  by the index, so it became `0155-kvirn-ai.md`; this plan keeps 0154, which `DESIGN.md:258` cites.
- **D32 Breadcrumb nests inside `PageHeader.Root`, not as a sibling before `PageFrame.Main`
  (component-engineer, 2026-10-26).** The brief's arrow diagram reads `SiteHeader.Root → Breadcrumb →
  PageFrame.Main`, but `page-header.tsx`'s own contract says "Write the Breadcrumb, `PageHeader.Title`,
  `PageHeader.Lead` and `PageHeader.Facts` in that order" inside `PageHeader.Root`, and both
  `page-header.stories.tsx` and `apps/docs/components/docs-page.tsx` already compose it that way. Followed
  the shipped pattern's own contract over the brief's shorthand ordering.
- **D33 The dateline is a `PageHeader.Facts` row, not a bespoke paragraph (component-engineer,
  2026-10-26).** The prototype's `<p class="dateline">` has no equivalent part; `page-header.stories.tsx`
  already uses a `DefinitionList.Row` ("Updated" / a date) for the same fact, so the fixture does too rather
  than hand-writing new markup (rule 14).
- **D34 `Article`'s own heading drops from `h1` to `h2` (component-engineer, 2026-10-26).** Once the page
  frame supplies the page's one `h1` (`PageHeader.Title`, "Building permit for a deck"), the article's
  internal `<h1>Applying for a building permit</h1>` would be a second `h1` on the same page. The text read
  aloud is unchanged (`collectText` doesn't care about heading rank), so this doesn't touch the brief's "do
  not change the article text" constraint — only the tag.
- **D35 A `PageFiller` after the article, inside `Container` but outside `contentRef` (component-engineer,
  2026-10-26).** New English paragraphs (not in the prototype), added only so the page is taller than the
  chrome viewports and the Bar's sticky-while-playing is visible to scroll to, per the brief's "make the
  page scroll … with filler content outside that ref". Never read: it sits after the `<article>` element,
  so `collectText(articleRef.current)` never walks it.
- **D36 `Keyboard`, `RTL` and `ForcedColors` keep their bare names (component-engineer, 2026-10-26).**
  The brief says "renamed `TopBar*`/`Inline*`" for every other state story, but
  `tooling/keyboard-docs/check-keyboard-docs.ts` greps the stories file for `export const Keyboard` literally
  — renaming it would fail that gate. `RTL` and `ForcedColors` use the same `Reader()` (panel) composition;
  left unprefixed for the same reason as `Keyboard`, to keep the three cross-cutting display stories
  recognisable by their conventional names rather than tied to one surface.
- **D37 Net story count is 27 → 26, not 28 → 27 (component-engineer, 2026-10-26).** D30 states "28 → 27",
  but the file this task started from (after D22's prior pass) already had 27 exports, confirmed by
  `grep -c '^export const'`. Merging `BarSticky` into `TopBarPlaying` (the only removal, per D30) takes it
  to 26. The arithmetic in D30 doesn't match the tree it describes; recorded rather than silently changed.

- **D38 The Bar is always a full-width band, and that is core design, not story styling (maintainer,
  2026-10-26).** `read-aloud.css:32-44` paints `:where(.kv-read-aloud)` with a border on all four sides,
  `radius-lg`, `surface` fill and `space-3` padding **unconditionally**, and the file's only two `:has` rules
  (`:201`, `:496`) are not escapes. So `<ReadAloud.Root><ReadAloud.Bar/></ReadAloud.Root>` — the composition
  `apps/docs/examples/read-aloud/bar.tsx` and every Bar story write — renders a rounded, fully bordered card
  inset from both page edges and only as wide as its five controls. **This is why Storybook did not look like
  the prototype, and no story could have fixed it.** The fix is in `packages/theme/read-aloud.css`: the Bar is
  a band wherever it is mounted, and Root paints no panel around one.
- **D39 Root is the chromeless sticky wrapper; the Bar is the visible band (lead, 2026-10-26).** Sticky was
  dead for the same reason: `position: sticky` on `.kv-read-aloud-bar` is constrained by its containing block,
  which was a Root exactly one bar tall, so its range was zero and the rule at `:475` looked correct and did
  nothing. Two shapes were weighed. **`display: contents` on Root** is the elegant one but puts a known
  assistive-technology risk on an element carrying `role="group"` and the one `aria-label` (D19) — unacceptable
  in an accessibility-first library. **Chosen instead:** when Root contains a Bar it renders as a plain block
  with no border, radius, padding or fill, and **the sticky moves from the Bar to Root**, whose containing
  block is then the page frame and therefore tall. Sticky gets a real range, the band is full width inside a
  box that paints nothing, and `role="group"` stays in normal layout with no `display: contents` anywhere.
- **D40 The previous panel-centric design and the stories serving it are cast away for the inline and top bar
  design (maintainer, 2026-10-26).** Concept A's always-chromed panel is superseded, not merely added to. Its
  fate: the chromeless idle inline (D13) becomes the real rendered state rather than a spec sentence the CSS
  contradicts, and where an earlier decision conflicts with the inline + top bar design, the new design wins.
  `docs/design/read-aloud.md` §5-6, which still describes the always-chromed panel, is now wrong in the same
  three-way disagreement the designer found between spec, prototype and CSS, and is fixed in this pass.

- **D41 `kv-read-aloud--prominent` removed (maintainer, 2026-10-26).** D4 made Listen quiet by default and
  this class promoted it. D13 already called that reasoning mostly retired; with the idle inline panel
  chromeless and its one Listen button filled, the default case no longer differs from the promoted one, so
  the class bought a public API distinction a user could not see. A public API removal, hence the approval;
  nothing has shipped, so there is nothing to migrate. **D4 is superseded, not rewritten** — it stays as the
  record of a decision that was taken and later reversed.
- **D42 The inline control panel recipe deleted from `DESIGN.md` (maintainer, 2026-10-26).** D2 recorded it as
  a shared container recipe any control cluster in the content flow could reuse, with ReadAloud's panel as its
  first user. A chromeless panel leaves it with no user, and the maintainer chose deletion over keeping an
  unused rule that would invite the next component to adopt chrome nobody decided on. **Supersedes D2**, which
  likewise stays as written. The cost is accepted: the next self-contained control cluster re-derives the
  recipe rather than inheriting it.

- **D43 `hasEverPlayed` is exposed as `data-started` on Root (lead, 2026-10-26).** T9 could not deliver D40's
  chromeless idle panel: the state that distinguishes it is `hasEverPlayed`, and no `data-*` attribute exposes
  it, so no CSS can select it. `data-status` cannot stand in — it returns to `idle` after Stop, while
  `hasEverPlayed` stays true, which is the whole point of D20. This is the architecture's own answer rather
  than a new mechanism: **hard rule 5 says a headless package ships zero CSS and exposes state as `data-*`**,
  and Root already carries `data-status`, `data-busy` and `data-error`. `data-started` joins them, `data-*`
  being state and never a choice (rule 14). Taken by the lead rather than asked, because the maintainer
  approved the chromeless idle panel as core design (D40) and this is the only way to render it; it is
  recorded here so the addition is visible and the accessibility reviewer sees it.

- **D44 The inline variant is a bare button row, never a panel (maintainer, 2026-10-26).** Pressing Listen
  must not open the old player layout. Idle is one `Listen to this text` button; playing is **Pause · Stop ·
  Settings**, three buttons next to each other, and nothing else — no card, no meter, no transport cluster, no
  position line. Previous and Next were offered and declined; the asymmetry argument (re-hearing is worth more
  than skipping to this audience) therefore does not arise. **`ReadAloud.Status` is kept but shows only when
  it has something to say** (maintainer's choice of three): the service errors still render below the row and
  the polite live region stays mounted, so `preparing` and the five-value error map still announce. Removing
  it outright was rejected as a 4.1.3 regression — a resident pressing Listen against a dead service would get
  silence and no explanation.
  - **Supersedes D13** (the idle panel that stays open once used): with Pause taking Listen's own place, Listen
    never moves anyway, so the sticky-open flag has nothing left to buy.
  - **Supersedes D43, and `data-started` is withdrawn.** I added it hours ago purely to let CSS distinguish a
    chromeless idle panel from a carded started one. With the panel never carded, it gates nothing. It is
    uncommitted and nothing shipped, so it goes rather than lingering as an attribute with no reader.
  - **Supersedes D3 and D12's panel half:** the meter was already informative-only and bar-less; now it is not
    in the inline surface either, so `ReadAloud.Progress` has no composition that renders it.
- **D45 The `[hidden]` regression, found and fixed (ux-designer, lead, 2026-10-26).**
  `:where(.kv-read-aloud[hidden]) { display: none }` sits at `:47`, before the new Bar override at `:434`
  that sets `display: block`. Equal specificity, later wins, so a Root with a Bar carrying `hidden` rendered
  **visible** — the exact hole the `[hidden]` rule exists to close, re-opened for the Bar case. Fixed by
  `:not([hidden])` in the override's selector. The `:462` chromeless rule never touched `display`, so it was
  not affected. **Lesson: a later zero-specificity override must restate every guard the base rule relies on.**

- **D46 T12 implementation notes (component-engineer, 2026-10-26).** With the base `:where(.kv-read-aloud)`
  rule carrying no border, padding, radius or fill, the `:462` chromeless rule (D13/D40/D43) gated nothing
  and is removed outright, and the Bar override at `:434`/`:445` (D38/D39) drops its own now-redundant
  `padding: 0; border: none; border-radius: 0; background-color: transparent` resets, keeping only
  `display: block` and the `:not([hidden])` guard (D45) — nothing left to reset once the base paints nothing.
  `:where(.kv-read-aloud) > .kv-field` and its `40rem` counterpart are dropped: `ReadAloud.Rate`/`Voice` never
  render as a direct child of Root in the new composition (they live in `ReadAloud.Settings`'s popup, D8),
  so the selector matched nothing already. The Note's separator (item 3) is added as its own
  `border-block-start`/`padding-block-start` pair, with `border-block-start-color: CanvasText` beside the
  existing forced-colours rule for Status and Note. `hasEverPlayed` and `ReadAloud.WhenStarted` are kept
  (removing a public part is the maintainer's call, asked separately per the brief) with their doc comments
  reworded away from D13's superseded "idle panel" framing.

- **D47 T13, corrected: the row gates on `status`, not `ReadAloud.WhenStarted`'s sticky flag
  (lead, 2026-10-26, reversing this decision's first draft from the same day).** The first draft
  read D46's "`hasEverPlayed` and `ReadAloud.WhenStarted` are kept" as "keep composing with them",
  and built `ArticleWithPlayer` as `Play` plus `WhenStarted` wrapping `Stop`/`Settings`, asserting
  in the `Inline` story that both stayed visible through a later Stop. That is wrong: D46's "kept"
  meant the exports are not deleted (removing public API is the maintainer's call, asked
  separately), not that the recommended composition still uses them. **D44 is explicit that D13
  is superseded** — "idle is one `Listen to this text` button", including the idle a later Stop
  returns to, because with Pause taking Listen's own place the sticky "stays open" flag has
  nothing left to buy. Fixed: `ArticleWithPlayer` and `ArticleWithPlayerInFinnish` now call
  `useReadAloud` directly (no `<ReadAloud.Root>`, avoiding D22's two-machines trap, the reason
  `WhenStarted` was built in D23) and build Play, Stop, a `Popover`-based Settings menu, the
  selection trigger, Note and Status from its props, branching on `reader.status !== 'idle'`. The
  `Inline` story's `play` now asserts Stop and Settings are absent again after Stop, matching the
  very first idle paint. `ReadAloud.WhenStarted` itself is untouched (still sticky, by design, for
  a consumer who wants that): nothing in packages/read-aloud changed, only which parts this
  fixture composes with.
- **D48 `InlineFullTransport` and `InlineVoice` retired (component-engineer, 2026-10-26).**
  `InlineFullTransport` showed the Previous/Next/Rate/meter composition D44 removed outright. The
  previous separate `InlineVoice` story, and its `ArticleWithVoice` fixture, judged the same way:
  `ReadAloud.Settings` already renders `Rate`, `Voice` and `Note` in its popup by default (D8), so
  with Settings now part of every `Inline*` story's row, there is no longer a distinct
  composition left for a standalone Voice story to prove — `TopBarSettingsOpen` already covers
  the popup's contents opening. Net stories 25 → 23 (T10's own count, confirmed by
  `grep -c '^export const'`).
- **D49 `read-aloud.api.ts`: only the rows D44 directly contradicted (component-engineer,
  2026-10-26, text corrected with D47).** `kv-read-aloud`'s and `kv-read-aloud--words`'s "panel"
  framing fixed. `readAloudWhenStartedRows`'s description now says what D47 settled: the part is
  not in the recommended inline row (gated on `status` instead), kept for a consumer who wants
  its own sticky reveal — not "the inline row's Stop and Settings", the first draft's claim before
  D47's reversal. The file's pre-existing break (`useReadAloudResultRows` missing
  `loadVoices`/`toolbarLabel`, noted in Risks since T4) is untouched, confirmed still the only
  `vp check` error on this file.
- **D50 `ReadAloud.WhenStarted` has exactly one composition left, and it is the stale one (lead,
  2026-10-26, answering the coordinator's question 3).** `grep -rn WhenStarted` across the repo
  (excluding its own definition, exports, docs rows and this plan) finds one user:
  `apps/docs/examples/read-aloud/idle-panel.tsx`, which still wraps `Transport`/`Previous`/`Next`/
  `Stop`/`Settings` in a `WhenStarted` — the exact D13/D40-superseded shape D44 replaces, not a
  legitimate second use. It is out of this task's three files (fixture, stories, `read-aloud.api.ts`)
  and not named in the brief's scope, so left alone rather than fixed here. Once that example
  catches up to D44 (a future `apps/docs` pass), `WhenStarted` would have zero compositions in the
  repo, which is the maintainer's call to weigh against keeping a public part with no user.

- **D51 The inline row is `Listen` + `Listening settings`, side by side, Settings icon-only with a Tooltip
  (maintainer, 2026-10-26).** Three parts to the instruction. **(a) Settings is present at idle**, not only
  while playing: the button's accessible name is literally "Listening settings", and the maintainer named the
  pair, so a resident can set the voice and speed _before_ pressing Listen rather than having to start the
  audio to reach them. Stop remains gated on `status !== 'idle'` (D44). **(b) The text is dropped from
  Settings; it is icon-only with a visible Tooltip.** This needs no approval and no deviation: DESIGN.md's
  icon-only amendment requires exactly an accessible name from i18n _plus_ a visible Tooltip with the same
  text, and D25's tooltip exemption was written for the Bar only — hover-firing tooltips across every page of
  a site, and absent on touch — none of which applies to one control in an article. The string exists in all
  five locales already, so no new copy. **(c) Play is content width at every size:** the
  `flex-basis: 100%` below 40rem is removed, so adding the gear never stretches Listen and the two sit on one
  line on a phone. **The cost, accepted and named:** that rule was a deliberate choice, commented "the easiest
  target on the page". 2.5.8 is not at risk — "Listen to this text" is far past 44px either way — but the
  phone target does get smaller. **Implemented** (`component-engineer`, 2026-10-26): the fixture's Settings button now renders beside Listen at idle and beside Pause/Stop while active, as a `Tooltip.Root` wrapping `Tooltip.Trigger as={Popover.Trigger}` (the same composition as `FormattingToolbar`'s link item in `tooltip.fixture.tsx`) with its own `aria-label`; the tooltip's `Tooltip.Name` repeats that text visibly and is hidden from assistive technology so the name is heard once. The `Inline` story now asserts `Listening settings` present at idle, while active and again after Stop.
- **D52 The standalone `Note` stays below the inline row, pending the maintainer (lead, 2026-10-26).** With
  Settings always present and carrying the disclosure link (D21, already implemented: `howItWorksHref` on
  `Note`, `Settings` and `Bar`, the popup rendering the note at `read-aloud.tsx:481`), the visible note below
  the row is arguably redundant, and "nothing else, just buttons next to each other" points at removing it.
  **Not inferred.** Removing a visible privacy notice from the surface that sends a resident's text to a voice
  service is rule 7 territory, and keeping it is the safe default; D21 reasoned a disclosure one press away
  suffices, which makes removal defensible but still the maintainer's to say.

- **D53 The privacy note is removed from the inline row and lives only in the Settings popup (maintainer,
  2026-10-26, resolving D52).** The inline surface is `Listen` + the `Listening settings` gear and nothing
  else; the recipient sentence and the "How listening works" link render only inside the popup, which D21
  already built (`howItWorksHref` on `Note`, `Settings` and `Bar`; the popup renders it at
  `read-aloud.tsx:481`).
  - **The consequence, stated once and accepted by the maintainer:** a resident who presses Listen without
    opening Settings never sees the disclosure _before_ their text is sent to the voice service. The
    recipient is named one press away, not on the surface that sends it. D21's reasoning is what carries this
    — the disclosure is present, not absent — and hard rule 8 still binds: nothing here claims the
    arrangement satisfies any law. **GDPR transparency for the destination page remains the consumer's**
    (`regulations` skill), and the library still names the recipient and sends nothing until Play is pressed.
  - The `Note` part keeps its hairline, which now separates the recipient sentence from the popup's Rate and
    Voice selects rather than the inline row's buttons.
  - **Still to do:** `apps/docs`'s ReadAloud examples compose the old inline Note and must follow.

## Risks & open questions

- **D9 is the decision most likely to be wrong**, and it would fail silently. Test it before 1.2.
- **The overlay resemblance.** A persistent site-wide accessibility bar is the silhouette Scope and the FTC's
  accessiBe order criticise. J differs — first-party, one honest feature, no third-party script, nothing
  pinned before a press — and **the docs must say plainly what it is and is not**, never implying it makes a
  site accessible or compliant (rule 8).
- **Cookie-bar blindness.** The familiarity that makes the bar unintrusive is the same learned response that
  makes people ignore that strip entirely.
- **Nothing is tested with residents or AT.** The spec's §8 plan stays `pending`. Never claim otherwise.
- **`apps/docs/content/read-aloud.api.ts` does not type-check, and has not since T4 (found 2026-10-26).**
  `UseReadAloudResult` gained `loadVoices` and `toolbarLabel` in the T4 pass, which deliberately left
  `apps/docs` out of scope, and `useReadAloudResultRows` was never updated. Confirmed pre-existing: today's
  passes added only `data-started`. It is a build breaker in the tree regardless of this work, and it belongs
  to the outstanding `apps/docs` task, not to T8–T11.
- Open questions 10–13 in the concepts file: what "this page" means in odd layouts, whether Hide survives a
  page load (a storage decision, as H), the "More controls" wording, and D9's touch test.

## Testing strategy

With 0153 T7: stories cover every state in all four theme projects with axe; the parts get their contract
rows; the `Toolbar` gets its arrow-key rows. **Rule 13 holds — no test asserts CSS, layout or computed
styles.** A visual criterion asserts its threshold (44px targets, contrast), never the theme's value.

## Done when

- [ ] Gates green; `accessibility-reviewer` APPROVE
- [ ] The maintainer has run the player bar and approved it
- [ ] DESIGN.md carries the icon-only and sticky amendments, in the same PR as the code that needs them
