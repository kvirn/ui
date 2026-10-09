# Design spec: the component page and the contents list on every docs page

- **Status:** Draft · **Designer:** ux-designer agent · **Date:** 2026-10-06
- **Plan:** to be written (amends [0052](../plans/0052-docs-on-built-packages.md) Phase C and docs-site.md Phase 2, C3–C4)
- **Type:** docs site template (`apps/docs`, not Storybook). Amends [docs-site-components.md](docs-site-components.md) §2 (Sections, Example and Contents rows) and R9, and [docs-site.md](docs-site.md) §4 "Page content outlines" (component pages). Everything else there stands.

## 1. Brief

- **Users and hardest case:** as in docs-site.md §1: a Finnish accessibility specialist with NVDA at 200% zoom, judging the library by its page, and an integrator copying one use case on a 320px phone between meetings.
- **Job:** "When I open a component page, I want to see what it is, see it work, find the case like mine with code I can copy, and know what I must do for accessibility, so I can decide and build without reading the source."
- **Fixed by the maintainer:** the section order (§2), notes built on Alert (§3, maintainer 2026-10-06), a contents list on every page (§5).
- **Success:** every component page has the same h2s in the same order; Keyboard and Announcements equal the contract (a test, §6); the contents list fits one 320 × 640 screen; no empty heading.
- **Assumption:** evaluators jump straight to Keyboard and Accessibility. Research question: do they use the contents list or the H key? (`pending`)

## 2. Page anatomy

Prior art: GOV.UK (guidance before code, one long page, no code tabs), Radix (per-part props and data-attribute tables), APG (key tables). DOM order = reading order = focus order. Sections without content are **not rendered**: no heading without content under it.

| #   | Section        | h2 `id` · visible title (key)                                   | Contains                                                                                                                                                                                                                                                                                                                      | Built with                                                  | Optional?                                             |
| --- | -------------- | --------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- | ----------------------------------------------------- |
| 1   | Name           | h1 (no id) · the component name                                 | Name only                                                                                                                                                                                                                                                                                                                     | `Heading as="h1"` (`PageHeading`)                           | No                                                    |
| 2a  | What           | – (lead under the h1)                                           | One or two sentences: what it is and what it does for the user                                                                                                                                                                                                                                                                | `<p className="kv-lead">`                                   | No                                                    |
| –   | Status         | –                                                               | §7                                                                                                                                                                                                                                                                                                                            | `StatusLine`                                                | No                                                    |
| –   | Contents       | `contents-title` · On this page (`docs.contents.heading`)       | The h2s below that are rendered                                                                                                                                                                                                                                                                                               | `Heading as="h2" size="heading-4"` + `TableOfContents.Root` | No                                                    |
| 2b  | When and where | `when-to-use` · When to use it (`docs.template.whenToUse`)      | 2–5 bullets: when, where (resident or staff, form or page), when not, each "not" linking the right component                                                                                                                                                                                                                  | `ul` in prose                                               | No                                                    |
| 3   | Main example   | `example` · Example (`docs.template.example`)                   | The component alone with its defaults, then its code                                                                                                                                                                                                                                                                          | Example Card (§4.4) + `CodeBlock`                           | Only for a planned component                          |
| 4   | Use cases      | `use-cases` · Use cases (`docs.template.useCases`, new)         | 2–8 use-case blocks (§4.4), most common first                                                                                                                                                                                                                                                                                 | h3 per case                                                 | Yes, a component with one use leaves it out           |
| 5   | Accessibility  | `accessibility` · Accessibility (`docs.template.accessibility`) | h3s, all derived from `.a11y.md`: What it does for you (pattern, deviations, native elements, intro, Roles table; "It announces nothing." when it doesn't) · What you need to do (Consumer responsibilities) · Focus · Testing with assistive technology (AT record + `atPendingNote`) · Known issues · WCAG success criteria | `Heading`, `Table`, lists; notes (§3)                       | Known issues only when the contract lists any         |
| 6   | Keyboard       | `keyboard` · Keyboard (`docs.template.keyboard`)                | §4.1                                                                                                                                                                                                                                                                                                                          | `Table` + `Kbd`                                             | Never: no keys renders `docs.keyboard.noKeys`         |
| 7   | Announcer      | `announcements` · Announcements (`docs.template.announcements`) | §4.2                                                                                                                                                                                                                                                                                                                          | `Table` + one reminder note                                 | **Only** if a contract row goes through the Announcer |
| 8   | API            | `api` · API reference (`docs.template.api`)                     | §4.3: one h3 per part, the hook, Strings                                                                                                                                                                                                                                                                                      | `Heading`, `Table`, `CodeBlock`                             | Strings h3 only if the component has message keys     |

**Leaving the component page** (amends docs-site.md §4): Installation goes to Home "Start here" (it's the same for every component, and each code sample shows its import); Styling's "override variables / replace the theme" goes to one Foundation page, Theming, linked from every API part; the classes and `data-*` move into the API (§4.3); Strings becomes an h3 of the API; Related moves into "When to use it".

**Contents list: h2s only.** A component page has 6–7 entries (the Announcements one only when shown). At 320px an item is 44px (comfortable below 64rem), so 7 items + title ≈ 370px: one screen with the h1 and lead above it. Use cases as h3 entries would add 2–8 more, push the main example two screens down and make the list longer than the content it skips. Every h3 still has an id for deep links. Same list at every width: a list that changes with the window is a list you can't describe to a colleague.

```
320px to 80rem                                     80rem and wider (docs-site-components §9.4)
h1 · lead · status · [On this page: 7 links]       h1 · lead · status            | On this page
When to use it · Example · Use cases …             When to use it · Example …    | (not sticky)
```

## 3. Notes (the brief's "callouts")

DESIGN.md "Words we use" retires "callout" and keeps status for Alert, so these are **notes**: advice to the reader about their code, shown with the library's own `Alert` (maintainer decision, 2026-10-06, replacing the neutral Card): a reminder ("Don't forget") is `Alert.Warning`, a tip ("Did you know?") and a recipe ("Implement like this") are `Alert.Info`. The Alert's title is the kind word, set as a paragraph (`as="p"`) so it stays out of the heading list, and the Alert shows its own status word and icon. It never announces. A message about the state of the library or the page ("Not verified yet", "Pre-alpha", a deprecation) is also an Alert, but it is a status, not a note.

| Kind       | Visible word (key)                       | Icon (built-in, decorative) | Use when                                                                                                                                                                                         | Not for                             |
| ---------- | ---------------------------------------- | --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------- |
| `tip`      | Did you know? (`docs.note.tip`)          | `info` (square)             | A true, non-obvious fact that saves work: "`Tabs` never changes the URL, so Back leaves the page."                                                                                               | Rules (those are in the contract)   |
| `recipe`   | Implement like this (`docs.note.recipe`) | `check`                     | The recommended way when there are several, with at most one short `CodeBlock` or a link to a use case                                                                                           | A whole example (that's a use case) |
| `reminder` | Don't forget (`docs.note.reminder`)      | `warning` (triangle)        | Restates one contract Consumer responsibility whose omission breaks accessibility, and links `#what-you-need-to-do`. The Announcements section's one is templated: `docs.note.announcerProvider` | New rules the contract doesn't have |

**Markup (exact):** existing classes only, no `docs-*` class, no new token.

```tsx
<Card.Root className="kv-card--padding-sm kv-prose">
  {' '}
  {/* div: no role, no landmark */}
  <p>
    <Icon name="info" /> <strong>{text.note.tip}</strong> {firstSentence}
  </p>
  {/* optional: one more <p>, or (recipe only) one CodeBlock */}
</Card.Root>
```

- **Title: a lead-in, not a heading and not a labelled region.** The kind word is the first text of the note, in `strong`, so it's read first and exists without CSS (1.3.1). A heading would add up to three "Did you know?" stops to the H-key list that name a kind, not a topic, and would cut a use case's h3 into pieces. An `aside` with a name would add a landmark per note (card.md §7: landmarks only for regions people jump to). `role="note"` adds little in screen readers today: native first.
- **Colour is never a cue:** every kind is the same `surface-raised` Card with its `border-subtle` edge (DESIGN.md: no `-subtle` status surface on a Card). Kinds differ by word and icon shape. The icon is `currentColor` (`text`), so no new pair. Forced colours: the Card's border becomes `CanvasText`, the icon follows the text.
- **Limits:** at most 3 notes a page, at most 1 per h2 or h3 section, never two in a row, never inside the Example Card or a table, at most 3 sentences. More than that means the page's text or the contract is wrong.
- **Plain English:** a note reads well without its word: "Don't forget" is not a substitute for a reason.

## 4. Blocks

### 4.1 Keyboard (section 6), derived from `## Keyboard`

1. The four contract facts as a `dl`: Focus (`docs.keyboard.focusStrategy`) · Selection follows focus · Arrows wrap · Shortcuts.
2. The contract's paragraph(s) before the table, verbatim.
3. Table (`Table` in `Table.ScrollRegion`, labelled by the h2): **Key** (`th scope="row"`) · **Where** (contract Context) · **What happens** (contract Action, then a second line `Test:` + the test name in `code`). Three columns, so it wraps before it scrolls at 320px; the test name stays as evidence without a fourth column.
4. The paragraphs after the table, verbatim ("Escape … not handled", "Why these choices").

| Contract key cell                                       | Rendered                                                                                   |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `Tab`, `Enter`, `Home`                                  | `<Kbd>Tab</Kbd>`                                                                           |
| `Shift+Tab`                                             | `<Kbd><Kbd>Shift</Kbd>+<Kbd>Tab</Kbd></Kbd>` (kbd.md group, never wraps)                   |
| `ArrowRight / ArrowLeft`, `Arrows, Enter, Space`        | one `Kbd` each, the `/` and `, ` kept as text                                              |
| `–`, `(with a modifier key)`, `(a key already handled)` | plain text, no `Kbd`: "No key" (`docs.keyboard.noKey`) for `–`, the parenthesis as written |

- **RTL:** the contract's right-to-left rows are rows like any other ("tab list, horizontal, right to left"). The page never flips keys itself: what it shows is what was tested. Cells use logical alignment (start).
- **No keys** (Card, Stack): `docs.keyboard.noKeys` "{component} has no keys of its own. What you put in it keeps its own keys." and no table.

### 4.2 Announcements (section 7), derived from `## Announcements`

Shown only when a row's politeness is `polite` or `assertive` (an Announcer message). A row that is part of a name or description (Field's `field.errorPrefix`) belongs in the API's Strings h3.

1. Intro (`docs.announcements.intro`): "{component} tells screen reader users about these changes without moving focus. Each message waits until the screen reader is quiet (polite) or interrupts it (assertive)."
2. Table: **When** (Event) · **What it says** (the `en` text from `@kvirn-ui/i18n`, parameters filled with the contract's example, `lang="en"`) · **Message key** (`code`) · **Politeness** (in words). Link "The text in all six languages" to `#api-strings`.
3. **Change the text** (`docs.announcements.override`): "For your whole app, pass `messages` to `KvirnProvider`. For one {component}, pass its `messages` prop." + a 4-line `CodeBlock` with the first key.
4. The one templated `reminder` note: "Announcements need a `KvirnProvider` around your app, outside any `<form>`. Without it nothing is announced, and a development warning says so."

### 4.3 API reference (section 8)

- **Opening:** the import line (`CodeBlock`) and one sentence: "Each part renders one element, takes every attribute of that element, and passes `ref` to it." Links: Theming (Foundation), "How `render` works" (one shared Foundation section, not repeated per page).
- **h3 per part, in tree order** (`Tabs.Root`, `Tabs.List`, `Tabs.Tab`, `Tabs.Panel`), id `api-<part>` (`api-tabs-tab`). Then h3 the hook (`useTabs`, Options and Result tables), then h3 Strings (`api-strings`, optional).

| In each part h3        | Content                                                                                                                                                                                                                                     |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| First line             | "Renders `<button type="button">` with the role `tab`." (from the contract's Roles table)                                                                                                                                                   |
| Props table            | **Prop** (`th scope="row"`, `code`, id `api-<part>-<prop>`) · **Type** (`code`) · **Default** (`code`, or "Required", or "–") · **Description** (one sentence). Only KvirnUI's own props; the element's attributes are one line under it    |
| `as` and `ref`         | One line: "`as` changes the element to one of the listed tags, or names a component with its props set on the part. `ref` reaches the element." Only a part with an allowed-elements list says more; a part without `as` points to its hook |
| Classes and attributes | **Class or attribute** · **Values** · **Meaning**: the part class (`kv-tabs-tab`), its modifier classes, and its `data-*` (`data-selected`, `data-disabled`)                                                                                |
| Child components       | A child part (`Link.NewTabNotice`, `Alert.Title`) is its own h3 in tree order, with the same four rows. A "child component" that is a separate export with its own contract gets a link to its own page instead                             |
| Strings h3             | Per key: an h4 with the key in `code`, a **Language · Default text** table, each cell with `lang`, the `se` row `stringPendingSami` while pending                                                                                           |

### 4.4 Example Card and use-case block (sections 3 and 4)

**Example Card (amends R9):** `Card.Root as="figure" aria-labelledby={sectionHeadingId}` with `kv-card--dividers`; `Card.Header` holds **only** the Example language field (no title of its own, at inline end from 40rem); `Card.Body kv-card-body--padding-lg` holds the Sámi note and the stage. The figure is named by the h2 "Example" or the use case's h3, so the title isn't said twice. Then `<p>Code</p>` + `CodeBlock`.

| Use-case block, in order | Rule                                                                                                                                                                                                                   |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| h3 · title               | The user's situation, not the prop: "Disabled with a reason", not "focusableWhenDisabled". id: a slug (`disabled-with-reason`)                                                                                         |
| Why                      | One paragraph: when you meet this case and why this way. Native attributes it needs (`aria-describedby`) are named here                                                                                                |
| Live example             | The Example Card, named by the h3                                                                                                                                                                                      |
| Source                   | `<p>Code</p>` + `CodeBlock`, the example file's own text (§6)                                                                                                                                                          |
| Props used               | `<p>` "Props in this example:" (`docs.useCase.propsUsed`) + `ul` of `Link`s: "`focusableWhenDisabled` on Button" → `#api-button-focusablewhendisabled`. KvirnUI props only; each must resolve to an API row (test, §6) |
| Note                     | At most one (§3), after Props used                                                                                                                                                                                     |

## 5. The contents list on every page

- **Every page with an h2 has it**, in the same place: after the lead (and the status on a component page), before the first h2; a third column from 80rem. The 404 page has no h2s, so it has none: `TableOfContents.Root` renders nothing for empty `items`, and `PageContents` must not render its title alone either.
- **Always h2s only**, from the same `sections` list that gives the headings their ids, so the list and the headings can't drift.
- **Home:** What you get · Components · Start here (gains Installation) · What "designed and tested to meet WCAG 2.2 AA" means. **Foundation topic pages** (Theming, Colour, Typography): their own h2s, no fixed set. **KvirnProvider** and other Foundation pages with a contract use the component template. **Reference pages** (for example all message keys): one h2 per group.
- **Page length, one rule: at most 8 entries in "On this page".** A ninth h2 means a second page (8 × 44px + title still fits one 320 × 640 screen). Use cases are capped at 8 for the same reason.

## 6. Data contract (no new dependency)

Pages stay TSX server components (docs-site.md Open question 2). Build-time reads use `node:fs`; parsing is first-party.

| Section                      | Source                                     | How                                                                                                                                                                                                                                  |
| ---------------------------- | ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1, 2a, 2b, notes             | Hand-written                               | The page file, `apps/docs/app/components/<name>/page.tsx`. Strings in the page (English site prose); template words in `messages/en.ts`                                                                                              |
| 3, 4 examples                | Hand-written example files                 | `apps/docs/examples/<name>/<case>.tsx`. The page renders the component and reads **the same file's text** for `CodeBlock`, so the code shown is the code that runs (it shows `t('…')` for fixture strings, which models hard rule 4) |
| Status                       | Contract                                   | `- **Status:**` line (Open question 5)                                                                                                                                                                                               |
| 5, 6, 7                      | `packages/react/src/<name>/<name>.a11y.md` | A small parser (`apps/docs/content/contract.ts`): known `##` headings, header bullets, GFM pipe tables, paragraphs. Unknown heading or column → the build fails naming file and section (docs-site.md §3)                            |
| 7 "What it says", Strings h3 | `@kvirn-ui/i18n` catalogs                  | Imported, never retyped                                                                                                                                                                                                              |
| 8                            | Hand-written typed data                    | `apps/docs/content/<name>.api.ts`: rows typed as `Record<OwnProps, PropRow>`, where `OwnProps` is the part's props minus the element's. A missing or extra prop is a type error in `vp check`                                        |
| `<name>.md` drafts           | Migrated, then a pointer                   | Its prose moves into the page once; it isn't parsed (Open question 7)                                                                                                                                                                |

**No tests in `apps/docs`** (maintainer, 2026-10-06): the docs are read-only, and components are tested in their packages and in Storybook. What keeps the pages honest instead: the build fails on a contract with an unknown heading or column; API rows are typed (`Record<OwnProps, PropRow>`), so a missing or extra prop fails `vp check`; the contents list is built from the same list as the h2s, so they cannot drift.

## 7. Status

One line right after the lead, before the contents list: what it is first, then whether you may use it. Text as today ("Status: Alpha. … Don't use it in a live service yet."), plain text until G6 Badge. It ends with a link "See the test results" → `#testing-with-assistive-technology`, so the claim and its evidence are one jump apart. A **planned** component's page has h1, lead, status ("Not built yet."), contents and When to use it, nothing else. A page-level warning (`TODO(verify-recipe)`) is an `Alert.Warning` after the status, never a note.

## 8. Accessibility annotations

- **Outline:** h1 → h2s in the fixed order → h3s (use cases, Accessibility parts, API parts) → h4 only for Strings keys. No skipped levels; every h2/h3 has an id; `scroll-margin` as today. Notes add no heading.
- **Tab stops:** skip link and shell as docs-site-components §7 → contents links → per Example Card: the language select, the example's controls → in-text and "Props used" links → a table's scroll region only while it overflows. Notes, `Kbd` and tables add no stop.
- **Names:** the contents `nav` by its heading; each `figure` by its section's heading; each table by its section heading (`aria-labelledby`), the scroll region the same.
- **Focus moves and announcements:** none added. Deep links rely on native hash behaviour; nothing is sticky (2.4.11).
- **Language:** `lang` on each Strings cell and on the `en` message text in Announcements (3.1.2); key names in `Kbd` are English like the site.
- **SCs of note:** 1.3.1, 1.3.2, 1.4.1, 1.4.10, 2.4.1, 2.4.4, 2.4.6, 2.4.11, 3.1.2, 4.1.2.

## 9. Validation

- [x] Self-review against `review-checklist.md`: no blockers. Every colour pair is existing (`text` on `surface-raised`, `link` on `canvas`, Kbd and Table pairs in `theme:check`). No new token.
- **DESIGN.md wants (not changed here, maintainer):** (W1) add "Note" to "Words we use" if a library Note component is ever wanted; for now it's a docs pattern. (W2) an inline-icon rule (baseline alignment of an `Icon` in running text). (W3) G6 Badge, for the status line.
- **Usability test plan** (6 participants as docs-site.md §8, including an NVDA user at 200% and a 320px phone user). Tasks: (1) Find what Tabs does with the arrow keys in right-to-left text. (2) Copy the code for "Disabled with a reason" and say the default of the prop it uses. (3) Change Table's "sorted" announcement for your app. (4) From the contents list, send a colleague a link to Keyboard. (5) In Windows Contrast Themes, say which notes are warnings. Measure completion, time, wrong turns. Status: `pending`.

## 10. Open questions (recommendations)

1. **Note titles as a lead-in `p`, not a heading** (§3). Recommend yes; the alternative adds noise to heading navigation. Maintainer to confirm.
2. **Test names** in the Keyboard table's "What happens" cell (recommended) vs their own column (harder at 320px) vs off the page (loses the evidence).
3. **Key names:** as the contract writes them (`ArrowRight`, recommended for now: the test compares equal strings) or APG's "Right Arrow" through a fixed display map (friendlier; the map then needs its own test).
4. **Installation, Styling, Related leave the component page** (§2). Recommend yes; they repeat on every page.
5. **Status source:** a machine-readable `- **Status:** alpha|beta|stable` in each contract (recommended, next to the evidence). Changing the contract template is an `accessibility` skill change: maintainer approval.
6. **API data:** hand-written typed rows (recommended) vs extracting types with the TypeScript compiler API at build time (no new package, but new tooling; revisit past ~20 pages).
7. **`<name>.md` drafts:** replace each with a pointer to its page once migrated (docs-site.md Open question 3). Recommend yes, one source.
8. **Example source from the example file**, showing `t('…')` instead of literal Swedish (recommended: the code shown is the code that runs, and it teaches hard rule 4). Alternative: hand-copied strings, which drift.

## Checklist: how to write a component page

The Button page is the reference: copy `apps/docs/components/button-page.tsx` and its files.

1. Create `examples/<name>/<case>.tsx`: one runnable client component per case, fixture text from `defineExampleTexts` (`components/local-example-texts.ts`) in `examples/<name>/texts.ts`: `en` required, other locales optional (do not edit the shared `example-texts.tsx`; fall back is `lang="en"`). The page shows the file's own text.
2. Create `content/<name>.api.ts`: `propRows<Pick<XProps, …>>` for every part, `propRows<UseXOptions>` and `propRows<UseXResult>` for the hook, and the classes and `data-*` as `AttributeRow`s. Verify each against `x.tsx` and `use-x.ts`, never the `.md` draft.
3. Create `components/<name>-page.tsx` (`ComponentPage` in the §2 order, props `contract` and `sources`) and a thin `app/components/<name>/page.tsx` that does the `node:fs` reads (`readContract`, `readExampleSource`).
4. Only use cases the component really supports, 2 to 8, each with title, why, example, source, "Props in this example" (KvirnUI props with an API row only) and at most one note. At most 3 notes on the page. Leave out a section with no content.
5. Don't edit `site-navigation.tsx` or `messages/en.ts`: the orchestrator adds the nav entries once the pages exist. Page-specific text lives with the examples.
6. **No tests in `apps/docs`** (maintainer). Typed API rows and the build's contract parser are the guards.
7. Run `vp check apps/docs`, one command, scoped to your files.
8. **Shared pieces, so no page writes its own** (migrating the existing pages is a later pass):
   - `ApiBlock`'s `hook` takes `options`, `result` or both. `PropTable` is exported. A `PropUsed` takes `label` for the text after "on" (`useTable (options)`), and `apiHookPart(hook, 'options')` is its `part` for a hook row.
   - `ApiHook.intro` is a sentence under the hook's heading ("Takes no options."). `ApiBlock`'s `hooks` takes several hooks (`useRadioGroup` and `useRadio`, or `announce` beside `useAnnouncer`), one `h3` each; `hook` still takes one.
   - `StringsBlock` (`strings-block.tsx`) is the whole `strings` prop: `<StringsBlock namespace="table" keys={[{ key, meaning, values }]} component="Table" />`. `layout="table"` is one table for a large catalog. `stringsFromCatalog` gives the entries when a page needs the rows itself; `stringText(namespace, key, values?)` gives one English text (for example `ContractAnnouncementRow` examples). `values` take strings, numbers, booleans and string lists.
   - `ContractSectionsView` already renders "Change the text" and the announcer reminder. Pass `extraAnnouncementRows` (and the same to `contractSectionList`) when the contract's Announcements is prose, `linkToStrings` when the page has Strings, and `messageNamespace` when it isn't the contract name in camelCase.
   - `status` is `planned`, `in-progress`, `alpha-candidate`, `alpha`, `beta` or `stable`, the roadmap's words. Only `beta` and later claim assistive-technology testing, and only `alpha` and later an independent review.
