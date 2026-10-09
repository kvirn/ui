# Plan 0091: Landing v2, proof over adjectives

- **Status:** Implemented in the docs site from prototype D (2026-10-09, by the lead, no agent tool available); the three proof pages (ledger, transcript comparison, brand guard) are deferred to their own pages; stories and AT `pending`
- **Owner:** lead
- **Created:** 2026-10-08 · **Target:** docs site, pre-alpha
- **Related:** [Plan 0090](0090-docs-header-and-landing.md) (v1 landing, baseline), [docs/marketing.md](../marketing.md) (buyer map, message house, proof ideas), [docs-landing-and-header.md](../design/docs-landing-and-header.md) (v1 spec)

## Goal

A landing page that developers praise and decision makers trust, where every claim sits next to its evidence, built only from KvirnUI parts and the repo's own files.

## Non-goals

- Any commercial or design-partner call to action (maintainer: developers only for now).
- Prices or licence terms beyond `LICENSING.md`. New dependencies of any kind, including build-time. Naming other libraries. Claiming conformance reports, SBOM or provenance (planned, see roadmap).

## Background

`docs/marketing.md` §2–§6: first segment is Nordic consultancies and system suppliers building public e-services, developers are the advocates. Levers: honest status, headless flexibility, evidence beside the claim. v1 (Plan 0090) shipped the header, facts, three demos (keyboard form, languages, settings), method and Start bands; the maintainer finds the demos boring.

## Design

Spec: `docs/design/docs-landing-v2.md` (to be written by `ux-designer` from this plan and `docs/marketing.md`). Fixed by the maintainer, 2026-10-08:

1. **Tagline** under the fixed headline: "Accessibility you can verify." Subline: "Public-service components, with the evidence beside them."
2. **Licensing**: two honest sentences on the landing (AGPL-3.0; free for personal use; any other use needs a commercial licence; link `LICENSING.md`). No prices.
3. **Three proofs to build** (from `docs/marketing.md` §6.1):
   - **Evidence ledger**: a sortable KvirnUI `Table` of every component × contract (`*.a11y.md` exists) · keyboard tests (a named test per Keyboard row) · axe in four themes (stories) · reviewer · real AT (`pending` everywhere today, from `docs/accessibility.md`). A "copy for tender" `CopyButton` copies a Markdown summary. Data generated at build time by an `apps/docs` script using Node built-ins only.
   - **Transcript comparison**: a plain-`div` widget beside the KvirnUI component, with a language switch; hand-written example transcripts of what a screen reader may say, labelled as examples.
   - **Brand guard**: a role-colour swap with live contrast ratios computed in the browser (reuse `theme:check` contrast maths from `tooling/`), refusing any pair under AA and saying why.
4. Keep from v1 what works (facts, method, Start); rework or fold the keyboard form and radio demos.
5. Wording: only "designed and tested to meet WCAG 2.2 AA"; pre-alpha and "manual assistive-technology testing pending" stated plainly.

### Accessibility contract (draft)

Per proof, in the spec: Table per `table.a11y.md` (sortable headers, `aria-sort`, caption), CopyButton's existing announcement, RadioGroup for the language switch with `lang` on each transcript, the brand guard's refusal as a polite status message with text (not colour alone), no new tokens, reduced motion and forced colours per `DESIGN.md`.

## Tasks

- [x] Maintainer decisions (1b developers only, 2a honest licensing, 3a tagline, 4a no deps; the three proofs)
- [x] HTML prototypes of three directions (lead as designer, 2026-10-09, the Agent tool being unavailable in that session). Throwaway, in `docs/design/prototypes/`, each linking the real `theme.css` and the docs fonts by relative path, kv classes only, no network, hand-written transcripts, sample ledger rows:
  - **A, the ledger first** (`landing-v2-a-ledger.html`): calm status-report feel; hero with jump links for the two audiences; the sortable evidence ledger is the centrepiece, then div-vs-Disclosure transcript, hook/component code, method, start. Light theme.
  - **B, the transcript** (`landing-v2-b-transcript.html`): two-column hero, headline beside a numbered monospace transcript with the never-on-screen words underlined and a reduced-motion-aware fade; opens in the dark theme to make "your settings win" visible; ledger as a short table. No script at all.
  - **C, brand it and the guard says no** (`landing-v2-c-brand-guard.html`): the hero is the demo; presets and a hex field rebrand the page's own primary; three contrast pairs show live ratios and floors; a failing colour is refused in words and the page keeps the last passing one; evidence as a one-line-each ribbon.
  - Shared by all three: fixed headline, tagline A, subline B, pre-alpha status line with AT pending, facts, licence in two calm sentences, no competitor names, "designed and tested to meet WCAG 2.2 AA".
  - **Maintainer verdict on A–C (2026-10-09): too factual and sterile, "no emotions". Brief: sell the feeling first, like a car maker sells the family trip before the horsepower (references: Volvo, IKEA, Saab), then go deep tech.**
  - **D, for the day it matters** (`landing-v2-d-for-the-day.html`): emotion first. A near-full-viewport hero with a soft token wash and a human promise under the fixed headline; three "moments" bands, one person each (Maja applying at 23:40 on a phone, Bertil hearing his way through a renewal, Amal with forty seconds and one free hand), each ending in what KvirnUI does for them; a dark "we show you" turn with the counts; three short try-it cards (hear, make the mistake, paint it) linking to the full demos; then the deep end for developers; a "why we build it" letter with the honest status and the licence. Photo and film placeholders mark where real imagery goes (no third-party assets in the repo). No script.
  - **Imagery (maintainer, 2026-10-09): photographs, no video.** Four Pexels photos chosen by eye from about 14 candidates, self-hosted in `docs/design/prototypes/images/` with `CREDITS.md` (Pexels licence: commercial use, no attribution needed; people are models, the names are fictional and never captioned onto a photo). The scroll hint under the hero was removed on the maintainer's request.
  - **Header (maintainer, 2026-10-09):** the real site header with Display settings stays on the landing, and the panel gains a **Motion** setting ("Same as my device" / "Less motion"). Today `theme.css` only honours the OS `prefers-reduced-motion` query (18 rules) and `useTheme` has no motion axis, so this is a library change: a `data-kv-motion="reduce"` attribute on `<html>` from `KvirnProvider`/`useTheme` (stored like the other two), and `theme.css` treating it like the media query. Done as [Plan 0092](0092-motion-preference.md).
  - **Header at narrow widths (maintainer, 2026-10-09, after the 320px pass):** one Menu below 64rem, holding the site navigation and the Display settings disclosure in a stacked panel (`#docs-menu-panel`, `aria-controls` names it and the sidebar when there is one); from 64rem the panel dissolves (`display: contents`) and brand, navigation and Display settings sit in one row. The 40–64rem "nav always shown, Menu for the sidebar only" state is gone: it wrapped on ordinary desktops. Landing band padding steps `space-8` / `space-12` (40rem) / `space-16` (64rem); the hero and moment heights apply from 64rem only.
- **Structure under the stories (maintainer, 2026-10-09):** the stories are for the people who decide and the people who build; the "Try it" demo band was cut. Under the stories the page now runs: Built for the edges → Why we build it (with links on to evidence, start, contact) → the evidence turn (links to the ledger, a contract, the roadmap) → How to get started (developers) → Talk to us (three cards: decision makers → `mailto:` about a licence or pilot; developers → a question and the source; the licence in plain words) → a footer nav. Rule: never a dead end, every band ends in a link. **This supersedes decision 1 (developers only, no commercial CTA): the maintainer wants purchasers to be able to decide and contact from the landing.** Contact is a `mailto:` to the README address, no form, no third-party service.
  - **Maintainer on D (2026-10-09): "much better"; widen the target beyond screen readers to cognitive disabilities, colour vision, low vision, and the fact that accessible is better for everyone.** Applied: the promise names tiredness, a second language, reading difficulty, colour, eyesight, screen reader and one hand; Maja's moment is now about dyslexia and plain, forgiving errors; Amal's about low vision at 400% zoom; a fourth moment, Jonas (colour vision, status never colour alone, measured pairs, high-contrast themes); and a new band "Built for the edges. Better for everyone."
- [x] Maintainer picked D and approved its content, images and text (2026-10-09); built directly from the prototype, no separate spec
- [ ] (deferred, own pages) T1 generator script `apps/docs/scripts/evidence.ts` → `apps/docs/generated/evidence.json` (build-time, Node only)
- [ ] (deferred) T2 evidence ledger (`components/home/evidence-ledger.tsx`)
- [ ] (deferred) T3 transcript comparison (`components/home/transcript-comparison.tsx`)
- [ ] (deferred) T4 brand guard (`components/home/brand-guard.tsx`, contrast maths shared with `tooling/`)
- [x] T5 page assembly and copy from prototype D: `app/page.tsx`, `components/home/{hero,moments,statements,evidence,start,contact,band}.tsx`, `messages/home.ts`, `app/home.css`, photos in `public/images/home/` with `CREDITS.md`. The v1 demos (keyboard form, languages, settings, transcript, facts, breadth, method) were removed from the landing. `vp check` ✓, `/` serves 200 with all anchors and images. Mobile layout is single column at every band; a browser pass at 320px is still `pending`.
- [ ] Gates (`vp check`, docs build, `i18n:check`, `theme:check`; no docs tests by maintainer decision), `accessibility-reviewer`, roadmap

## Decisions

- **No tests in the docs site** (maintainer, Plan 0090). The ledger's honesty comes from the generator reading real files; a component without a test shows `pending`, never green.
- **Compliance facts corrected 2026-10-08** (`docs/compliance.md`, `regulations` skill): EN 301 549 v4.1.1 (WCAG 2.2 AA) published by ETSI 2026-09-02, OJ citation not yet verified; Digg merges into PTS 2027-01-01, DOS-lagen supervisor after that unverified.
- **README and roadmap synced 2026-10-08**: conformance report, SBOM, provenance, `SECURITY.md` and known issues are roadmap rows (M3 / before public 0.x), and the README has a Status section.

## Risks & open questions

- `LICENSING.md` wording vs AGPL rights (marketing.md §7): lawyer review before any sales conversation. Owner's call.
- The ledger exposes every gap publicly (AT `pending` across the board). Intended: honesty is the pitch.

## Done when

- [ ] Gates green, reviewer APPROVE, plan ticked, `docs/roadmap.md` updated; AT matrix `pending`
