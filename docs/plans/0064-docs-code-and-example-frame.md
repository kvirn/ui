# Plan 0064: Docs-only CodeBlock and ExampleFrame with a highlighter

- **Status:** Approved (D1–D3 and the locale choice approved by the maintainer, 2026-10-06)
- **Owner:** lead → component-engineer
- **Created:** 2026-10-06 · **Target:** docs site
- **Related:** [design spec](../design/docs-code.md) (the contract, tokens and strings live there), [0057](0057-docs-component-pages.md), [0060](0060-copy-button-and-code-block.md) (the library CopyButton and CodeBlock; this plan does not replace it), `docs/design/docs-site.md`

## Goal

Docs readers see highlighted code with a copy button, and an example with its preview first and its code one disclosure away, in the KvirnUI look. Everything lives in `apps/docs`.

## Non-goals

- Any change in `packages/`, `theme.css` or `DESIGN.md`. No new dependency.
- A copy icon in the Icon set, package-manager tabs, a library `CopyButton` (0060).
- Rewriting how pages pass `code` to `ExampleFrame`.

## Background

Today `components/code-block.tsx` is a plain `<pre>` with no highlighting or copy, and `components/example-frame.tsx` shows the example, an example-language select and the code. Read the design spec in full: §5 structure, §6 visual, §7 accessibility contract, §4 strings.

## Design

Follow the spec. The decisions below are binding.

### Decisions already taken (maintainer)

- **D1** Code is collapsed by default behind a Disclosure (`aria-expanded` + `aria-controls`), Copy works while collapsed, `hidden="until-found"` with a `beforematch` handler, no-JS shows the code. Amends `docs-site.md` "code always visible".
- **D2** Long lines scroll horizontally from 40rem and wrap below. The scroll area is a focusable named region only while it overflows. Amends `docs-site.md` "No 2D scrolling".
- **D3** Syntax colours are four docs-only aliases in `docs.css` (`--docs-code-keyword|string|literal|comment`) over `link`, `success`, `warning` and `text-muted`. No new colour pair.
- **Locales:** the example language select offers **Swedish and English only** (today: all six). The spec's recommendation to keep six was declined.

### API sketch

```tsx
<CodeBlock code={string} language="tsx" fileName?="button.tsx" lineNumbers? />
<ExampleFrame caption? headingId? code language?="tsx">{example}</ExampleFrame> // same props as today, plus optional language
```

`highlight(code, language): Token[]` is a pure function in `apps/docs/lib/` (no React, no DOM), run on the server. Languages: tsx/ts, json, css, bash, html. It never throws: unknown input returns plain text.

### Accessibility contract

As spec §7. Native `button`s only, no custom key handlers. Copy announces `docs.code.copied` or `docs.code.copyFailed` politely through `useAnnouncer()`. A refused clipboard opens the code and selects it. Line numbers are `aria-hidden` and not in the copied text.

### i18n strings

Keys and en/sv text: spec §4. They go in `apps/docs/messages/en.ts`, and `docs.code.label` replaces `docs.example.codeHeading`. Remove only keys this change makes unused.

### Theming surface

`--docs-code-*` and the `docs-code-*` classes in `apps/docs/app/docs.css`. State uses `data-*` or `aria-*`, never a class.

## Tasks

- [x] Tokenizer `highlight()` + node unit tests per language (including "never throws" and empty input)
- [x] `CodeBlock`: header, copy, status, line numbers, overflow region, `docs.css`
- [x] `ExampleFrame`: code bar, disclosure, until-found, sv/en select, `useAnnouncer`
- [x] Strings in `messages/en.ts`
- [x] Browser tests, one named per spec §7 row: toggle (click, Enter, Space), copy announces `copied`, refused clipboard announces `copyFailed` and selects, region role and tabindex only while overflowing, line numbers absent from the copied text, find-in-page opens the panel
- [ ] Update `docs/design/docs-site.md` for D1 and D2, record D3 and the locale choice there, README row for the spec
- [ ] Record the `success` and `warning` on `surface` numbers from `theme:check` in spec §6
- [ ] Changeset: none (docs site is private); say so in the PR

## Decisions

- **No syntax-highlighter dependency:** a hand-written tokenizer, about 150 lines, for five languages. Shiki and Prism were weighed. Both add a runtime dependency (rule 6) and far more than five languages' worth of code.
- **Disclosure, not Tabs** (spec §7): preview and code are parts of one example, not alternatives.
- **Test wiring (flag for the maintainer):** `apps/docs` has no test files and no Vitest project covers it (`vite.config.ts:217-247`). The engineer adds the smallest glob to the existing `node` and `browser` projects for `apps/docs/**/*.test.{ts,tsx}` and reports the diff. This extends coverage and weakens no gate.

- **Implementation (engineer):** `CodeBlock` is a client component (it copies and observes overflow); the tokenizer runs in it, so the code is highlighted in the server-rendered HTML of both CodeBlock and ExampleFrame. `language` is optional on `CodeBlock` (existing callers pass none): no label, tokenised as tsx. The bar is a `Card.Footer`, the panel a plain `div` after it. React 19 types and runtime know `hidden` only as a boolean, so the panel renders plain `hidden` and an effect upgrades it to `until-found` (no JS keeps plain `hidden`, which docs.css shows). `fi nb nn se` catalogs are no longer imported by `ExampleFrame`; the `languages` message keys stay (used by strings-block and locales-page). Tab test uses an example with no focusable content, since the stage sits between the select and the bar.

## Risks & open questions

- With the select limited to sv/en, the Sámi note in `ExampleFrame` can no longer be reached. Report it, don't remove it (rule 10).
- The `ExampleFrame` bar sits outside the nested `KvirnProvider`, so its strings are the site's.
- `hidden="until-found"` support differs by browser; the fallback is plain `hidden`.

## Testing strategy

Tokenizer in node (pure function). Component rows in browser mode with real key events and clipboard stubbed to resolve or reject. Axe on a docs page in four themes waits for the docs harness (`docs-site.md` open question 6).

## Rollout

Docs site only. No version, flag or migration.

## Done when

- [ ] `vp check`, `vp test run` on the changed files, `vp run i18n:check` and `vp run theme:check` pass
- [ ] `accessibility-reviewer` returns APPROVE
- [ ] Plan tasks ticked, `docs/roadmap.md` updated
