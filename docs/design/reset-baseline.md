# Design spec: reset.css is the baseline the theme is designed on

- **Status:** Approved (maintainer decision, 2026-10-09)
- **Designer:** ux-designer agent · **Date:** 2026-10-09
- **Plan:** to be written (handoff in §8)
- **Type:** theme/token change · docs page

## 1. Brief

- **Users:** consumers (municipal front-end teams) reading Storybook and the docs site, and through them every resident and staff user of a site built on the theme.
- **Job to be done:** When I import the default theme, I want the page to look exactly like Storybook and the docs, so I can trust what I saw and ship it.
- **Context:** today `reset.css` exists, is exported and documented as optional, and nothing in the repo loads it. Storybook and the docs site import `theme.css` on top of the browser's UA styles, so they show the theme on a page no consumer will have.
- **Constraints:** headless packages still ship zero CSS (AGENTS.md rule 5). Nothing loads CSS for the consumer; `KvirnProvider` never does.
- **Success criteria:** Storybook, the docs site and a consumer who follows the README render the same pixels. The design language has one baseline to be judged against.
- **Decision (maintainer):** the theme is designed and demonstrated on `reset.css`. "The theme works without the reset" stops being a promise. A consumer who wants another baseline (Tailwind Preflight, their own reset, no reset) owns the result, the same way they own a copied `theme.css`.

## 2. Prior art

| Source                           | What we reuse                                                 | What we change and why                                                                                                                                     |
| -------------------------------- | ------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tailwind CSS v4 Preflight        | The whole reset, already ported in `packages/theme/reset.css` | Nothing new. The three existing deviations stay: list markers kept (1.3.1 in Safari/VoiceOver), `svg:not(.kv-icon)` block, fonts from `--kv-font-family-*` |
| GOV.UK Frontend, DKFDS, Sanity   | A design system ships one baseline and its examples run on it | Same here: the reset becomes the first line of the import pair, not an aside                                                                               |
| `theme.css` §Theming (DESIGN.md) | `@layer kv-reset, kv;` is already declared in both files      | Keep. Order-independence stays, the `[hidden]` restatements stay (cheap, and a consumer who drops the reset still gets collapsed groups)                   |

## 3. Flow

Not a user flow. The change is to what we demonstrate and promise.

Unhappy paths for a consumer:

| Case                                                  | What happens                                                                    | Our answer                                                                            |
| ----------------------------------------------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| Imports `theme.css` only                              | Browser UA margins, default link blue, serif headings around the components     | Documented as unsupported: "import both, in this order"                               |
| Already has Tailwind                                  | Preflight twice, identical rules                                                | Skip our reset: Preflight is the same file. Say so in the README                      |
| Has their own reset                                   | Both apply; ours is in `kv-reset`, theirs probably unlayered and wins           | Fine, their CSS wins by design. Mention it                                            |
| A bare `<a>` outside prose or `kv-link`               | Looks like body text: Preflight sets `color: inherit; text-decoration: inherit` | Every link in Storybook and the docs is `Link`/`kv-link` or inside `kv-prose` (1.4.1) |
| A bare `<h1>`–`<h6>` outside prose or `kv-heading`    | Body size and weight                                                            | Stories and docs use `kv-heading` or `kv-prose`, as a consumer would                  |
| Bare `<select>`, `<textarea>`, `<input>` in a fixture | Appearance reset, no border                                                     | Fixtures use the components or their `kv-*` classes                                   |

## 4. Content

Docs copy only, in the apps (English, not i18n keys: Storybook and docs pages are developer-facing and not localised today).

| Where                            | Text                                                                                                                                                                                                   |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Foundation/Theming, level 1      | "Import `reset.css` then `theme.css`, once. The reset is Tailwind's Preflight in plain CSS; if you already run Tailwind v4, skip it. Everything you see in Storybook and the docs runs on both files." |
| `packages/theme/README.md` §Use  | Same, replacing the "Optionally start from a blank page first" paragraph. Drop "The theme works without it"                                                                                            |
| `reset.css` header               | Drop "Optional" and "The theme works with or without it". Keep the licence, the deviations and the import order                                                                                        |
| DESIGN.md §Theming, How it works | Done in this change: "Two files, opt-in by import"                                                                                                                                                     |

## 5. Structure

No layout change. Storybook: `preview.tsx` imports `reset.css` before `theme.css`. Docs: `app/layout.tsx` imports `reset.css` before `theme.css`. `preview.css` and `docs.css` stay unlayered and keep their body base; `docs.css`'s "interim page base" comment stays until G2 ships it in the theme.

## 6. Visual specification

No new token, no new colour, no new contrast pair. What the reset changes on the two apps:

| Area                       | Before (UA styles)                      | After (reset)                                               | Check                                                                  |
| -------------------------- | --------------------------------------- | ----------------------------------------------------------- | ---------------------------------------------------------------------- |
| Body, headings, paragraphs | UA margins around story fixtures        | Zero margins; spacing comes from the theme and the fixtures | Stories with stacked bare elements may need a `kv-prose` or a gap      |
| Headings outside prose     | UA sizes + `preview.css` heading family | Body size, heading family from `preview.css`                | Add `kv-heading` or wrap in `kv-prose`; don't grow `preview.css`       |
| Links outside prose        | UA blue underline                       | Inherit colour, inherit decoration                          | Must be `kv-link` (1.4.1)                                              |
| Images, SVG, video         | Inline, overflow at 320px               | Block, `max-width: 100%`                                    | Helps 1.4.10 reflow; an inline `<img>` in text needs `display: inline` |
| Form controls              | UA appearance                           | Reset; theme's `kv-input`, `kv-button` etc. restyle them    | Fixtures with bare controls                                            |
| Tables                     | UA spacing                              | `border-collapse`, no indent                                | `kv-table` already sets these                                          |
| Lists                      | UA markers and indent                   | Kept (our deviation)                                        | None                                                                   |
| Focus                      | UA outline                              | Unchanged (only Firefox's inner ring removed)               | 2.4.7, 2.4.13 unchanged                                                |

### Modes

- Dark, light-contrast, dark-contrast: the reset has no colour. Nothing changes.
- Forced colours: the reset has no colour or border it would remove, except `border-style: solid` with `border-width: 0`, which is what Preflight does under Tailwind today. Nothing changes.
- RTL: the reset uses no physical properties that matter. Nothing changes.
- Motion: none.
- 320px reflow, 400% zoom: `img, video { max-width: 100%; height: auto }` improves reflow.

### New or changed tokens

None.

## 7. Accessibility annotations

- No interactive change. No new Tab stop, key or announcement.
- 1.4.1 Use of Color: the one real risk. A bare link under the reset is indistinguishable from text. Every story and docs page is checked for `<a>` without `kv-link` outside `kv-prose`.
- 1.3.1 Info and Relationships: list markers are kept, so Safari/VoiceOver still announces lists.
- The gate: the four `storybook*` Vitest projects run every story in every theme with axe. Once `preview.tsx` loads the reset, every story is tested on the reset. No new project is needed.

## 8. Handoff (engineering tasks, `component-engineer`)

1. `apps/storybook/.storybook/preview.tsx`: `import '@kvirn-ui/theme/reset.css'` before `theme.css`.
2. `apps/docs/app/layout.tsx`: same, before `theme.css`.
3. Audit the 48 story and fixture files that render bare `<a>` or `<h1>`–`<h6>` (`grep -rlE "<(a |h[1-6][ >])" apps/storybook/src`) and the docs pages: `kv-link`, `kv-heading` or `kv-prose`. Fix fixtures, not `preview.css`.
4. Copy from §4: `theming.mdx`, `packages/theme/README.md`, `reset.css` header.
5. `.claude/skills/theme-css/SKILL.md` lines 20–22 and the `## reset.css` section: the reset is the baseline; delete "No story loads the reset" and "the theme works with or without it".
6. Changeset for `@kvirn-ui/theme` (docs-level: the file is unchanged, its status is).
7. Gates: `vp run test` (every story on the reset, axe), `vp run theme:check` (no colour changed, expected green).

## 9. Usability test plan

`pending`. Not applicable to users directly; the check is the visual diff of Storybook and the docs before and after, by the maintainer.

## 10. Open questions

- G2 (page base in `theme.css`): with the reset loaded, the body base in `preview.css` and `docs.css` is the remaining duplication. Fold it into the theme in G2 and delete both.
- Should `theme.css` keep its `[hidden]` restatements now that the reset is the baseline? Recommendation: keep. Two lines, and they protect a consumer who drops the reset.
- A consumer on Tailwind v3: its Preflight sets `list-style: none`, which is the Safari/VoiceOver 1.3.1 problem our reset avoids. Worth one sentence in the README.
