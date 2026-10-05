# Plan 0017: Close the Storybook feature gaps

- **Status:** Implemented (2026-10-05); the rich-option stories wait for Plan 0030
- **Owner:** Maintainer / Claude
- **Created:** 2026-10-02 · **Target:** M1
- **Related:** Plan 0027 (ADRs folded into skills), Plan 0028 (names), Plan 0029 (`Field.Hint`), Plan 0030 (rich options), storybook-docs skill

## Goal

A reader who opens a component's Storybook page finds every public feature of that component there, without reading the source.

## Non-goals

- No new behaviour. Plans 0028 to 0030 own the API changes, and this plan runs after them, so stories use the final names.
- No hook pages and no theming pages per component. The storybook-docs skill leaves both for later.
- No removal of core exports. Marking them internal is a separate, breaking change.
- The `se` catalog stays English, marked `lang="en"`.

## Background

The re-audit (2026-10-04) covered every component in `packages/react/src`. It replaces the first inventory. Three findings shape this plan:

1. **Docs pages:**
   - 8 components open their Docs page with their `.md` (`usageGuide`): Card, Heading, Prose, Kbd, Notification, Section, Combobox and Autocomplete. The rest don't, including all 14 form components.
   - Listbox and Popover pass a hand-written description.
   - Checkbox, CheckboxGroup and RadioGroup have no `.md`.
2. **Nothing cross-cutting is shown:**
   - No story shows a dev warning, and there are about 90 codes.
   - Only Icon shows both forms of `render`.
   - No form story shows a `messages` override.
3. **The fixtures cover three locales.** `form.fixture.tsx` has texts for sv, fi and en only, so nb and nn fall back to English. The mask fixture has sv and en.

The first inventory said a few items were already covered. Most of them were not.

## Design

Following the storybook-docs skill: say each thing once, and add a story only when it shows something new.

1. **Every component opens with its `.md`.**
   - Add `usageGuide` everywhere.
   - Write `checkbox.md`, `checkbox-group.md` and `radio-group.md`.
   - The Mask and Number pages take their prose from the matching sections of `input.md`.
2. **Two Foundation pages instead of repeated stories:**
   - **"Your own element":** `render` in element and function form, the `*State` argument, `mergeProps` (handler chaining, class join, style, refs, and the `merge-props-id` warning), and `className` joining.
   - **"Dev warnings":** a table of every warning code, the component it comes from, what it means and the fix.
     - A unit test greps `warnOnce('<code>'` across `packages/react/src`, then fails if the table and the code disagree.
     - Each component's Docs page links to its rows.
3. **Per-component stories,** only for the gaps listed below. Each has a `play` that asserts what it shows.
4. **Fixtures get nb and nn texts.** `se` stays the English fallback, with the known-issue note.

### Gap list (stories, unless marked .md)

**Form**

- **Input:**
  - a controlled masked `value`, with the `onValueChange` details (`rejected`, `isWithinRange`);
  - a per-instance `messages` override;
  - your own `aria-describedby` ids appended after the Field's.
- **Mask:**
  - `masks.number({ grouping, locale })` and `mask.withLocale`;
  - `masks.oneTimeCode` on a plain Input;
  - a custom function mask with `completeLengths`;
  - a regexp `unmask`;
  - `masks.pattern` with `\`, `*` and `transform`;
  - FI and NO `postalCode` and `organisationNumber`;
  - `checks.organisationNumber`, `checks.iban`, and FI and NO `personalIdentityNumber`, with the reasons `format`, `date` and `country`;
  - `allowSyntheticNumbers` (.md too);
  - the `maximumLength` announcement, and `characterNotAllowed` for `letters`, `lettersAndDigits` and `other` in every locale;
  - `announceRejections={false}`;
  - `createMask` and `MaskResult` only if the core README calls them public.
- **Number:** a `type="number"` anti-example, linked to the Mask page.
- **OneTimeCode:**
  - controlled `value`;
  - `readOnly` while the code is checked;
  - `onComplete` firing from typing;
  - the lowercase `a` symbol and the `*` symbol;
  - a static story for the slot `data-active`, `data-caret` and `data-selected` states;
  - the invalid-pattern `RangeError` (.md).
- **Field and Fieldset:**
  - `controlId`;
  - `messages` (`optional`, `errorPrefix`);
  - Fieldset `group`, `required`, `id` and your own `aria-describedby`;
  - Legend `marker`;
  - Label and ErrorMessage used outside a host;
  - two descriptions.
- **InputGroup:** `invalid` and `disabled` on the Root without a Field.
- **Checkbox, CheckboxGroup and RadioGroup:**
  - a standalone Checkbox with `aria-label`;
  - `required` groups;
  - RadioGroup `value={null}`;
  - a standalone Radio's state.
- **FileUpload:**
  - the rejections `tooSmall`, `tooMany`, `duplicate`, `folder` and `custom`, with their messages;
  - `autoUpload={false}` with `uploadAll()`;
  - `concurrency`;
  - a non-retryable failure with a message;
  - `messages`;
  - `FileUpload.ItemError` (.md, the fixture and a story);
  - the drag states.

**Other**

- **Button:** `type="reset"`, and an `onClick` that `disabled` blocks.
- **Link:**
  - `current` set to `step`, `location`, `date`, `time` and `true`;
  - custom `rel` merging;
  - `Link.NewTabNotice` `render`;
  - `render={<a/>}` bypassing the router;
  - `--kv-link-underline-*`.
- **Card:** function-form `render`, `render` on the Header and Footer, and `kv-card-body--padding-*`.
- **Icon:**
  - the `{ component, mirrorInRtl }` registry form;
  - per-instance `mirrorInRtl`;
  - `iconDefaults.size`;
  - string sizes;
  - the unknown-name placeholder;
  - nested provider `icons`.
- **Heading:** `size` on levels 4 to 6, and `id` with `aria-labelledby`.
- **Prose, Section and Kbd:** the documented `render` landmarks (`<article>`, `<nav>`, `<section aria-labelledby>`), and a plain `<kbd>` inside Prose.
- **Notification:** `announce="assertive"`, the landmark form, `render` on the Body and Actions, and the `infoPrefix` and `successPrefix` messages.
- **Listbox, Combobox and Autocomplete:**
  - a custom `filter`;
  - controlled `open` and `inputValue`, with the change reasons;
  - `placement`, `offset` and `padding`;
  - `announcementDebounceMilliseconds`;
  - `messages`;
  - `Listbox.Value` with a function child;
  - a Combobox `virtualize` story;
  - `virtualize` in the three `.md` files.
- **Popover:** placement variants, the `onOpenChange` reasons, and `--kv-popup-height-limit` and `--kv-anchor-width`.
- **Announcer:** `throttleMilliseconds` (including `0`), replacement within 100 ms, the 5 s auto-clear, blank messages, and `clear`.
- **Provider:**
  - `theme.defaultColorScheme`, `defaultContrast` and `storage` (`'none'` and a custom adapter);
  - `KvirnThemeScript` with `nonce`;
  - `env`, `defineMessages`, function-valued messages with `format.plural` and `format.number`, and nested partial `messages`;
  - the `Register` augmentation (.md).

### Bugs found by the audit (fixed here, since they're small)

- `file-upload.md` names a type `UploadContext` that doesn't exist. It should be `FileUploadContext`.
- `@kvirn-ui/react` doesn't re-export `FileUploadContext`, `FileUploadFailure` and `FileUploadRejection`, although `upload` and `onFilesReject` use them. Re-export them (changeset).
- `packages/react/src/panel/` and `apps/storybook/src/components/panel/` are empty leftovers. Delete them.

### Core

- Add a `packages/core/README.md` that lists what adopters may use: `masks`, `checks`, `createAnnouncer`, and `createMask` (decide). It says that everything else serves `@kvirn-ui/react` and is not a stable API.
- **Candidates to mark `@internal`** (in a separate breaking plan):
  - `createComponentStore`, `createThemeStore`, `resolveTheme`, `resolveThemeOptions`, `findInvalidThemeOptions`, `isSameThemeConfiguration`, `resolveMessageNamespace`, `getLanguage`;
  - `matchesText`, `startsWithText`;
  - the `default*` constants.

### Accessibility contract (draft)

No new behaviour.

- Every new story passes axe in all five rule sets.
- A story that shows misuse keeps the misuse out of the axe run, or says why in its JSDoc.
- Stories that focus something are already covered by the contract's Keyboard rows.

### i18n strings

None added. Fixtures gain nb and nn story texts. These are adopter strings, not catalog keys.

### Theming surface

None added.

## Tasks

Each group is one PR, run after Plans 0028 and 0029 (and 0030 for the option stories).

- [x] Bugs and the empty `panel/` dirs
- [x] `usageGuide` on every Docs page, and the three missing `.md` files
- [x] The "Your own element" and "Dev warnings" Foundation pages, with the drift test
- [x] Form gaps (Input, Mask, Number, OneTimeCode, Field and Fieldset, InputGroup, the choice controls)
- [x] FileUpload gaps
- [x] Button, Link, Card, Icon, Heading, Prose, Section, Kbd and Notification gaps
- [x] Listbox, Combobox, Autocomplete and Popover gaps (rich-option stories wait for Plan 0030)
- [x] Announcer and Provider gaps
- [x] nb and nn fixture texts
- [x] Core README
- [x] Changeset for the type re-exports
- [x] Update `docs/roadmap.md`

## Decisions taken during implementation

- **The dev-warnings table is the Foundation page itself.** `apps/storybook/src/foundation/dev-warnings.mdx` holds one markdown table per group, so it renders like the other Foundation pages and there is no second copy of the data. `tooling/dev-warnings/dev-warnings.test.ts` (the `node` project, next to the other repo checks) reads the MDX and the source of every `packages/*/src`, and fails when a `warnOnce` code has no row or a row has no call. A code with a variable part is written `${…}` in the source and `<name>` on the page (`toggle-not-a-button:<element>`). The test also fails on a `warnOnce` whose key is not a string or template literal.
- **The rows link to the component's Docs page, not the other way round.** Each component's `.md` (Listbox, Combobox, Autocomplete, Popover, Table) gets a short "Developer warnings" note that names the Foundation page. Other components' pages are other agents' files.
- **Listbox, Combobox and Autocomplete gaps:** Combobox virtualize (story and `.md`) and the three `virtualize` sections already existed, so nothing was added for them. The custom `filter`, `inputValue` and `announcementDebounceMilliseconds` gaps apply to Combobox and Autocomplete only (Listbox has none of them), and Autocomplete has no `inputValue` (its `value` is the text). The popup `placement`, `offset` and `padding` are one story per component, `PlacedAbove`.
- **Popover:** the `onOpenChange` reasons extend the existing `Controlled` story instead of adding another one.

- **Fixes found by the gates:** the sized-popup story scrolled with no focusable content (axe `scrollable-region-focusable`), so it now holds a link. Fixtures use `ButtonGroup`, `<output>` and a function-form `render` on the anchor, because the lint rules reject `role="group"`, `role="status"` and `<a />` without content.
- **Skipped, with reasons:** Label and ErrorMessage outside a host (misuse that only warns, covered by unit tests, documented in the `.md`), Announcer `clear` (core only), the 5 s auto-clear (unit-tested, a story would wait 5 s per theme project), Provider `storage: 'none'` (documented), Alert `render` on `Alert.Close`, and the rich-option stories (Plan 0030).
- **Docs moved:** the Masks section of `text-input.md` is now `mask.md`; Label, ErrorMessage, HelpText and Form got their own `.md` files in `packages/react/src/field/`.

## Risks & open questions

- **Story count.** The list is long. Merge gaps into one story wherever a single example shows several features naturally, such as a Provider story that sets the theme defaults and storage together.
- **`createMask` and `MaskDefinition`.** Decided: not adopter API (`packages/core/README.md`), so no stories.

## Testing strategy

- `vp test run <story files>` for axe and the `play` functions, plus the dev-warnings drift test.
- `vp run e2e` only where a story adds a keyboard row.
- A Storybook build proves that the MDX pages and titles compile.

## Rollout

Docs and stories, plus one additive type re-export (patch changeset).

## Done when

- [x] Every gap above has a story, a Docs section, or a recorded "not public" decision
- [x] All quality gates in AGENTS.md pass (manual AT may be `pending`)
- [x] Plan tasks ticked, `docs/roadmap.md` status updated
