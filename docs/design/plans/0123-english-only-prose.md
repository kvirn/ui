# Plan 0123: English-only prose, examples and fixtures

<!-- kv-lang-ok-file: the notes quote the Swedish words the sweep found -->

- **Status:** Done (scope, locale and marker decided by the maintainer on 2026-10-16; reviewer APPROVE)
- **Owner:** lead
- **Created:** 2026-10-16 · **Target:** before alpha
- **Related:** `storybook-docs`, `docs-pages`, `design` skills; `tooling/no-adr-references` (model for the check)

## Goal

Everything a reader sees that is not a translation is English: docs-site prose and examples, story and fixture text, package docs, comments, tests, design docs. Other languages live only in `packages/i18n` and in places that prove locale behaviour, each marked with a reason. A check fails the build when Swedish, Finnish or Norwegian prose appears anywhere else.

## Non-goals

- Changing a locale file or a translated component string.
- Rewriting the docs-site UI language switcher or locale-format demos (masks, dates, postal codes keep their national formats; their sample values stay).
- Legal or style rewrite of docs pages beyond language (docs-writer may fix a wrong claim and reports it).

## Background

Scout counted ~5,200 matching lines in ~510 files outside `packages/i18n`: `apps/` 2,832 lines, `packages/` 3,226 (react 2,735, mostly `*.test.tsx`), `docs/` 1,151 (many in `docs/design/prototypes/*.html`). Today the skills require the opposite: `storybook-docs/SKILL.md:33` ("real Swedish text"), `:98` (`globals: { locale: 'sv' }`), `:167`, `design/SKILL.md:27`, `docs-pages/SKILL.md:93` (English gloss).

## Decisions

| Decision                 | Chosen                                                                                                                                                      | Why                                                                                                |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Scope                    | Everything but `packages/i18n` and locale-behaviour tests                                                                                                   | One rule, no per-folder judgement; authored text is English or it is marked                        |
| Storybook default locale | `en` (toolbar still switches sv/fi/nb/nn)                                                                                                                   | Built-in strings and authored text read in one language; locale stories stay the translation proof |
| Exceptions               | `kv-lang-ok: <reason>` comment on the line or the line above; `kv-lang-ok-file: <reason>` in the first 10 lines for a whole file; `packages/i18n/**` exempt | Every exception is visible in review                                                               |
| Enforcement              | A Vitest check in `tooling/english-only/` (runs in `vp run test`, so CI), like `no-adr-references`                                                          | No new script, gate or dependency                                                                  |
| Rollout                  | Check lands first with a `pending` path list; each sweep batch removes its paths; the list is empty at Done                                                 | CI stays green while the sweep proceeds, and the list is the progress meter                        |

Marker placement: in Markdown the marker goes at the end of the same line (`vp fmt` puts a blank line after an HTML comment, which breaks "line above"); in JSX, `{/* */}` directly above the flagged line, in the same element. Prefer line markers; a file marker must name why the whole file needs the language.

Legitimate marked cases: `itemToLang` and `lang` demos (WCAG 3.1.2), locale-switcher labels (a language's own name), hyphenation or long-word stress strings in another language, collation tests (å ä ö), national-format examples that need the native word, and tests that assert a locale's built-in strings. <!-- kv-lang-ok: the plan quotes the letters and stop-words it detects -->

## Detector gap (found during the sweep)

Letters and ~25 stop-words miss plain Nordic UI words with no diacritic (`Spara`, `Adress`, `Kontakt`, `Blankett`, `Sivut`): a grep of ~60 such words found ~1,000 unmarked lines, mostly `*.test.tsx` fixtures in `packages/react` and fixtures in `apps/storybook`. Fix: task 9 widens the detector with words drawn from the sv/fi/nb/nn catalogs in `packages/i18n` (tokens not found in the en catalog or an English-also exclusion list, reviewed for false positives), then the leftovers are swept again. <!-- kv-lang-ok: plan quotes the words the detector finds -->

## Design

### Detector (draft contract)

Flags a line when it has a Nordic letter (`å ä ö æ ø ü` either case) or a distinctive sv/fi/nb/nn/da stop-word (`och`, `att`, `för`, `är`, `inte`, `vid`, `från`, `eller`, `ska`, `jag`, `ikke`, `og`, `ei`, `että`, `ja`…; words that are English too are excluded). Skips binary files, lockfiles, `packages/i18n/**`, `.changeset/`, `CHANGELOG.md`, the check itself and its fixtures. <!-- kv-lang-ok: the plan quotes the letters and stop-words it detects -->

| Row                                                                                                           | Proof                             |
| ------------------------------------------------------------------------------------------------------------- | --------------------------------- |
| Swedish, Finnish and Norwegian sentences are flagged                                                          | detector unit test, one case each |
| Plain English with a place or name without diacritics is not flagged                                          | unit test                         |
| Marker on the line, the line above, or the file head silences it; a marker without a reason is itself flagged | unit test                         |
| `packages/i18n/**` is exempt                                                                                  | unit test                         |
| No unmarked line in the tree outside the `pending` list                                                       | the repo test                     |

### Rules text

One line in `AGENTS.md` Conventions (language of authored text, the marker, the check). `storybook-docs`, `docs-pages`, `design` and `docs-writer` lose "Swedish text" and state: authored text is English; Nordic text only when marked; a hard-case string (long Finnish compound at 320px) is marked.

## Tasks

- [x] 1. `tooling/english-only/`: detector, unit tests, repo test with the `pending` list seeded from the current offenders (component-engineer)
- [x] 2. Rules text: `AGENTS.md`, the four skills, `docs-writer` agent; `storybook-docs` states the `en` default (component-engineer)
- [x] 3. Sweep `apps/docs` (pages, `examples/*/texts.ts`, `messages/reference*.ts`) (docs-writer)
- [x] 3b. Audit the 19 docs pages the sweep touched for a correct, brief, English page (docs-writer, 3 per spawn): A breadcrumb pagination skip-link · B combobox autocomplete listbox · C error-summary quick-exit dialog · D table section stack · E button-group link toolbar · F map read-aloud top-bar locales. Rule: correct over complete; fix a wrong claim, cut padding, no new content for its own sake; shared files (`messages/en.ts`, `search-index`) reported, not edited.
- [x] 4. Sweep `apps/storybook/src` stories and fixtures; default locale `en` in `apps/storybook/.storybook/preview.tsx:181` together with any story or play assertion that reads a Swedish built-in string; marker for locale stories (component-engineer)
- [x] 5. Sweep `packages/*/src` `*.md`, `*.a11y.md`, comments (component-engineer)
- [x] 6. Sweep `*.test.tsx` fixtures; per file `vp test run <file>` stays green, locale and collation tests marked (component-engineer, batches by package area)
- [x] 7. Sweep `docs/` including `docs/design/prototypes/*.html` (docs-writer or component-engineer)
- [x] 9. Widen the detector with catalog-derived Nordic words (component-engineer), then sweep what it finds, in batches (react tests, storybook fixtures, docs/design)
- [x] 8. `pending` list empty; whole-tree `vp run test`; `accessibility-reviewer` on the diff (a wording change must not remove an accessible name a test asserts)

## Decisions during implementation

- 3b group C done (error-summary, quick-exit, dialog): claims fixed against the contract (quick-exit `windowMs` is the gap between presses; history note; status `alpha-candidate`). Open for task 5: `quick-exit.a11y.md` Read-aloud table has unmarked Swedish phrases (from the test's `sv` catalog), and its Status line says draft while the roadmap says alpha candidate.
- 3b group A done (breadcrumb, pagination, skip-link): 10 claims fixed (WCAG 2.4.4 name, default label, `separatorProps`, hook `messages` example). Open for task 5: `pagination.a11y.md` Status line copied from Breadcrumb (mentions `variant`/`separator`, which Pagination lacks); a11y.md wording not followable by readers ("the wordmark", "the `Default` story"); Swedish JSDoc examples in `skip-link.tsx`, `use-skip-link.ts`, `use-breadcrumb.ts`, `breadcrumb.tsx`, `pagination.tsx`, `use-pagination.ts`; SkipLink has no test for "browser jump not cancelled". `examples/breadcrumb/texts.ts` keeps unused `sv` strings (typing needs them).
- 3b group B done (combobox, autocomplete, listbox): wrong Clear/Value part text fixed; two unverified screen-reader claims removed from Listbox; reminder and tip notes added to Combobox (it had none) from its contract. Open for task 5 (contracts): Swedish text in `combobox.a11y.md:27-28`, `autocomplete.a11y.md:125`; "(valfritt)" at `combobox.a11y.md:30`, `listbox.a11y.md:28` is locale-dependent, wrong for `en`; `listbox.a11y.md:7` says Popup has `role="listbox"` but the Roles table says the List does; lowercase "the accessibility checker axe" at `listbox.a11y.md:203`. <!-- kv-lang-ok: plan quotes the words the detector finds -->
- 3b group D done (table, section, stack): table "thousands of rows" corrected to 2,000, sort-order and screen-reader claims fixed, "virtualize"/"browse mode" explained; stack "number of items" claim cut to what the test proves. Open for task 5: Swedish JSDoc in `stack.tsx`, `section.tsx`, `use-section.ts`; Swedish fixtures in `stack.test.tsx`, `section.test.tsx`; `stack.a11y.md` Roles table contradicts its intro on `role="list"`; `section.a11y.md` "same open question as for Card" unreadable. Open question: `examples/table/large.tsx` uses inline `style` for the scroll height (rule 14 targets components; the page gives readers no class to copy).
- 3b group E done (button-group, link, toolbar): unsourced claims cut or fixed, decimal-format example corrected, missing `kv-button-group--attached` row added to the Toolbar attributes table. Open for task 5/6: Swedish in `button-group.a11y.md` (l.15 and consumer rows), `button-group.md` (l.47, 58, 59, 83), JSDoc in `button-group.tsx`, `use-button-group.ts`, `toolbar.tsx`, `link.tsx`, fixtures in `button-group.test.tsx`. Open question with D: inline `style` in docs examples `table/large.tsx` and `toolbar/vertical.tsx`; the theme has no class for either.
- 3b group F done (map, read-aloud, top-bar, locales): wrong claims fixed (map examples "use createMemoryProvider", "texts English in every language", read-aloud "Chrome only online voices"); `Map.Attribution` added to seven map examples and `Layers`/`BaseMapSwitch` moved before `Markers` per `map.md`; locales page no longer says "first-class" and states draft status. Open for task 5: unmarked Swedish in `top-bar.a11y.md` Read-aloud table; `use-read-aloud.ts` JSDoc `'Lyssna'`; contract wording "(on every press)" vs test "announces it once". <!-- kv-lang-ok: plan quotes the words the detector finds -->
- Decision (lead): a `kv-lang-ok: <reason>` marker after the last `|` of a contract table row added a cell and broke `contract-parser` (3 tests). `tableCells` in `apps/docs/lib/contract-parser.ts` now strips a trailing HTML comment; no gate weakened. Affected: `date-picker`, `date-range-picker`, `link` `*.a11y.md`.
- 3b gates: `vp check` (62 files) green, `vp test run apps/docs` green, `i18n:check` and `theme:check` green. `tooling/english-only` red only for stale `pending` entries (DESIGN.md, README.md, docs/*.md, tooling/component-naming/) cleaned by the concurrent task 7 sweep; its owner removes them.
- 3b review: `accessibility-reviewer` APPROVE, no blocking findings. `tableCells` now drops any comment-only cell (a marker after the last pipe, or in its own cell as in `autocomplete.a11y.md:57`), so both marker shapes parse; `docs` Map page names the opt-in box instead of "above". Open: `tooling/keyboard-docs/parse-keyboard-section.ts:66` splits rows without stripping comments, so a marker on a Keyboard-table row breaks that gate (task 5 must avoid markers there or teach the parser); `map.a11y.md:58` says Tab goes to markers "after the viewport" but Layers now come first; `packages/map/src/map-attribution.tsx:33` puts `aria-label` on a `<p>` (map owner).
- 5b batch 1 done (accordion … badge): "Plan 0058" reference and a missed Swedish word ("Nyheter") removed; doubled glosses fixed; one truncated test reference completed. The Autocomplete Keyboard row "any character | on the input, Swedish" was removed because a marker in its Test cell would break `keyboard-docs`; the behaviour stays in the Filtering bullet (`autocomplete.a11y.md:35`). Later batches must not delete Keyboard rows (ASK instead). Open: `autocomplete.test.tsx:686` has å ä ö in a test title and `autocomplete-virtual.test.tsx` keeps `sv-SE`/"Gatuadress" (task 6); `tooling/keyboard-docs` fails on `map.a11y.md` and `icons.stories.tsx` (not 5b).
- 5b batch 2 done (breadcrumb … checkbox): leftover Swedish in code samples fixed ("Fet", "Grupp", "/sophamtning.jpg"); Calendar Read-aloud table (20 rows) now glossed in English in the cells; Checkbox error-prefix claim fixed ("Fel:" in sv); Button hook Result table gained the `isBusy` row. The `> **Draft** (Plan NNNN)` banner on 54 package docs is stripped by `apps/storybook/src/docs-source.ts:69`, so it is not public: left as is. Open: `button.a11y.md:50,52` test references end in `› …` (a describe block).
- 5b batch 3 done (checkbox-group … date-picker): the sweep's wrong "(optional)/(valfritt)" statements restated per locale; date-input help-text table rewritten to the real orders (`use-date-input.ts:94-95`); date-picker Read-aloud table glossed; five stale "Draft (Plan NN)" status lines now "Alpha candidate" (roadmap). Open (task 6): Swedish test names/fixtures in `date-picker.test.tsx`, `combobox*.test.tsx`; `packages/i18n/src/types.ts` JSDoc Swedish examples (check markers); `combobox.a11y.md` "Remove Stockholm" has no test of that text.

- 5b batch 5 done (fieldset … input-group): Swedish leftovers the detector misses fixed ("Kontaktuppgifter", "Kvirnby kommun"); FileUpload refused-file example now the full default `en` sentence; InputGroup's stale "a DatePicker will put its Button here" claim replaced by what the tests prove. Open (task 6): `fieldset.test.tsx` test names carry "Plan 0013/0029" and the contract quotes them.

- 5b batch 4 done (date-range-picker … field): date-range-picker Read-aloud row corrected to what the test asserts (`startdatum`/`slutdatum`) and glossed; "Ej angivet" fixed in definition-list. Open: `field-label.md`, `form.md`, `field-help-text.md`, `field-error-message.md` are outside the changed set; Field Message-keys table lists en, sv, fi while the text says five languages.

- 5b batch 6 done (kbd … menu): listbox contract Roles line and "(optional)" fixed; a file-level language marker on line 1 of `listbox.md` pushed the H1 to line 3, so Storybook's `usageGuide` (`docs-source.ts`, strips only line 0) would have shown "# Listbox": replaced by a line-end one. No other package `<name>.md` has a file marker (grep). Rule for later sweeps: no file marker above the H1 in `<name>.md`.

- 5b batch 7 done (navigation … popover): more Swedish the detector misses fixed ("Komponenter", "Meny", "Telefonnummer", "Sverige"); two truncated test references in `navigation.a11y.md` completed; phone-input country name now correct for an English page. The Pagination Status line (reviewer APPROVE 2026-10-06) matches the roadmap row.

- 5b batch 9 done (skip-link … table): `switch.md` contradicted its contract on announcing a saved change (now: nothing announced on success, failure announced); stack Roles table made consistent with its intro; SkipLink "browser's own jump" claim reduced to what the code shows (no test); typos "Feeer" and a Swedish column header fixed in table docs. Open (task 6): Swedish fixtures in `stack.test.tsx`, `skip-link.test.tsx`, `table.test.tsx` (some legitimate sort tests); JSDoc in `stack.tsx`; check whether `stack.d.ts` is tracked.

- 5b batch 8 done (progress … section): provider docs example built an English string on the `sv` catalog (now `en`); quick-exit contract Status and Read-aloud intro corrected (tests run in `en`); radio-group Status line now matches the roadmap; section "same open question as for Card" replaced by the Safari list issue. Open (task 6): Swedish fixtures in `prose.test.tsx`; JSDoc in `section.tsx`.

- 5b batch 10 done (table-of-contents … toast): toast message-key table header said sv but showed the en value (now en); toast API example used `locale="sv"` with English texts (now en); two Swedish labels in text-input fixed. Open (task 6): Swedish strings without markers in `toast.test.tsx` (l.289, 307, 313, 324), `textarea.test.tsx:694`, `text-input.test.tsx:774`, `tabs-ids.test.ts:25,37`.

- 5b batch 11a done (toggle … visually-hidden): tooltip "a screen reader says" table reduced to "says, for example" (no test checks exact wording); the contract rows now match test wording ("Opens the print view"). `top-bar.a11y.md` keeps `navigation, Verktyg` (marked) because `top-bar.test.tsx` still asserts it: when task 6 translates that fixture, change the row to `navigation, Tools` and drop the marker. Open (task 6): "Meny"/"Fet"/"Understruken" fixtures in `visually-hidden`, `toggle`, `tooltip` tests; JSDoc in `visually-hidden.tsx`, `use-toolbar`.

- 5b batch 11b done (map, rich-text, site-footer, READMEs, Storybook `.mdx`): README hook example used methods that do not exist (`getTriggerProps()`; now `disclosure.triggerProps`) and carried two compliance-sounding claims (now "designed and tested to meet WCAG 2.2 AA, and built to help you meet EN 301 549, the WAD and the EAA"); "56 documented components" replaced by "more than 70" (`docs/marketing.md:67` still says 56 component pages: task 7); Storybook introduction no longer claims end-to-end tests (rule: no e2e layer). Open: `rich-text-editor.a11y.md` has a file marker on line 1 because tests still assert Swedish; Swedish sample `bilder.example.se` in rich-text `.ts` files.
- 5b gates: `vp test run tooling apps/docs` 340/342. Both failures pre-date this work and are not language edits: `keyboard-docs` (26 `(pending)` rows in `map.a11y.md` name tests that do not exist; `icons.stories.tsx` lacks the `a11y.md?raw` import: icon project) and `dev-warnings` (no rows for `map-many-markers`, `quick-exit-hint`, `quick-exit-href`, `quick-exit-multiple`; the warn calls are unchanged since HEAD). `i18n:check` and `theme:check` green. `map-attribution.tsx:33` `aria-label` on a `<p>`: map owner.

- 5b review: `accessibility-reviewer` CHANGES REQUIRED, one blocking finding, now fixed. Language markers at the end of a prose line in a contract were shown to docs-site readers (and read by screen readers). `splitSections` in `apps/docs/lib/contract-parser.ts` now strips HTML comments from lines that have other content (a comment-only line stays and is skipped), `usageGuide` in `apps/storybook/src/docs-source.ts` does the same for Storybook, and `contract-parser.test.ts` has a test that no comment reaches a rendered contract (checked: it fails with the strip disabled). Non-blocking, fixed: SkipLink Tab row says "next focusable element"; README says "a map or an address search calls only the tile or geocoding provider you configure" and lists the supported Node ranges. The removed Autocomplete Keyboard row is accepted (collation, not a key); restore a row-to-test link once task 6 renames the test title.
- Gates after the fix: `vp test run tooling apps/docs` 341/343; the two failures are the pre-existing `keyboard-docs` (map pending rows, icons stories) and `dev-warnings` (four missing rows).
- 2026-10-17, maintainer-approved: the icon labels (Plan 0124) added about 400 words to the detector's Nordic word set, so English and CSS words tripped it. `auto`, `brand`, `post`, `handling`, `journal` and `schema` were added to `englishToo` in `find-non-english.ts`, and real Nordic words left in tests, docs and comments (`Meny`, `Nyheter`, `Avfall`, `Energia`, `intyg`, `kvitto`) became English. The detector's own tests are unchanged.

## Risks

- A test that asserts an accessible name, typeahead match or sort order on Swedish text: translate the fixture and the assertion together, never only one.
- Docs-site Swedish samples that mirror a real service: replace with an English-language equivalent of the same public-sector case.
- The sweep touches hundreds of files: batches of one area, one agent per batch, no overlapping files.
