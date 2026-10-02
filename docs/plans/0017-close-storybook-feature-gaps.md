# Plan 0017: Close the Storybook feature gaps

- **Status:** Draft
- **Owner:** Maintainer / Claude
- **Created:** 2026-10-02 · **Target:** M1
- **Related:** ADR-0039, ADR-0033, Plan 0014, Plan 0015, Plan 0016

## Goal

A reader who opens a component's Storybook page can find every public feature of that component there, without having to read the source or the `<component>.md` file.

## Non-goals

- No new components, props or behaviour. This plan only shows what already exists.
- No change to the manual AT matrix.
- No `form` or `number` component. Neither exists today.
- The `se` catalog stays English until a native reviewer translates it. This plan only records it as a known issue on the Docs page.

## Background

An audit of `packages/{core,react,i18n}` against `apps/storybook/src/components/*` found public API that no story demonstrates. Two patterns explain most of it:

1. The Docs page (`apps/storybook/.storybook/preview.tsx`) renders the JSDoc, the controls, the `a11yContract` and the Keyboard section. It does not render `<component>.md`, so anything documented only there is hidden from Storybook.
2. Every `render`, hook and `messages` argType is `control: false`, and no story uses them.

### Gap inventory

**A. Mask and Input** (largest cluster)

- `masks.oneTimeCode({ length, characters })` with `autoComplete="one-time-code"`.
- `masks.number({ grouping, locale })` and `mask.withLocale()`. The "Number" stories only use `inputMode`.
- `createMask`, function masks, `completeLengths` and the regexp `unmask` option.
- `checks.organisationNumber` and `checks.iban`. NO and FI variants of `organisationNumber`, `postalCode` and `personalIdentityNumber`.
- `details.rejected`, `isComplete` and `mask.apply()`/`MaskResult`.
- The `maximumLength` rejection and `characterNotAllowed` in fi, nb, nn and se.
- The `messages` prop and the `useMask` options.
- Dev warnings: `input-mask-on-email`, `input-mask-without-description`, a missing announcer, `input-without-name`, `input-type-number`.

**B. Field and Fieldset**

- `Fieldset.Root`: `group`, `required`, `id`, and a user `aria-describedby`. `Fieldset.Legend`: `marker`.
- `Field.Root`: `controlId` and the `messages` override (`field.optional`, `field.errorPrefix`). The same `messages` override on `Fieldset.Root`.
- A fieldset with several descriptions. Field parts used outside a Field, with their warnings.
- The WCAG 3.3.1 warning for an invalid field without an ErrorMessage.
- `data-required`, `data-disabled` and `data-invalid` on each part.

**C. InputGroup**

- `invalid` and `disabled` on `InputGroup.Root` without a Field.
- Pointer-down on the Addon focusing the Input. Today only e2e covers it.
- `input-group-addon-outside-root` and `input-group-addon-focusable` warnings.

**D. Button, Link, Card, Icon**

- Link: `current` values other than the default, custom `rel` merging, `LinkNewTabNotice` `render`, `.kv-link-new-tab-notice`, and the `--kv-link-underline-*` properties.
- Card: `kv-card-body--padding-*`, `kv-card--padding-md|lg`, the function form of `render`.
- Icon: the `{ component, mirrorInRtl }` registry form, per-instance `mirrorInRtl`, `iconDefaults.size`, string sizes, the unknown-name placeholder.
- Button: `type="reset"`, and the `button-not-a-button` and `button-without-name` warnings.

**E. Announcer and Provider**

- Announcer: `throttleMilliseconds`, the replacement within 100 ms, the 5 s auto-clear, and `announce` returning `false`.
- Provider: `theme.defaultColorScheme`, `theme.defaultContrast`, `theme.storage` (`'none'` and a custom adapter), `KvirnThemeScript` with `nonce`, `env`, `defineMessages`, function-valued messages, nested partial `messages`, and the dev warnings.

**F. Cross-cutting**

- `render` (element and function form, with `*State`) on every component.
- The hooks: `useInput`, `useInputGroup`, `useField`, `useFieldset`, `useButton`, `useLink`, `useCard`, `useIcon`.
- Core exports with no mention anywhere: `createThemeStore`, `resolveThemeOptions`, `findInvalidThemeOptions`, `isSameThemeConfiguration`, `resolveMessageNamespace`, `getLanguage`, `themeStorageKey`. `@kvirn-ui/core` has no README.
- `mergeProps` has no page of its own.

## Design

### Approach

1. **Make the Docs page show the `.md`.** Decide whether to render `<component>.md` on the Docs page, next to the contract and the Keyboard section (ADR-0039). This fixes most of group F in one change. It needs an ADR.
2. **Add one story per gap, grouped by component.** Use the story names `Render`, `Hook`, `Messages` and `DevWarnings` for the cross-cutting groups, so they are the same everywhere. Each story has a `play` function that asserts the behaviour it shows.
3. **Use the existing fixtures** (`mask.fixture.tsx`, `card.fixture.tsx`, `form.fixture.tsx`) where they fit. Add a new fixture only when a story needs a custom hook consumer.
4. **Show dev warnings as text,** not as console output: a story that renders the misuse and spies on the warning, and a table of codes in the Docs page.
5. **Add a README for `@kvirn-ui/core`** that lists its public exports, and give `mergeProps` a short section in the architecture docs.

### Accessibility contract (draft)

No new interactive behaviour. Every new story must pass axe in all five rule sets, and every story that focuses something has a `Keyboard` row in the contract already (ADR-0039). Stories that demonstrate misuse (outside a Field, no ErrorMessage) must keep the misuse out of the axe run, or say why in the story.

### i18n strings

None added. The `characterNotAllowed` and `maximumLength` stories use the existing keys in all six locales.

### Theming surface

None added. The Link and Card stories only show tokens and classes that exist in `theme.css`.

## Tasks

Do them in this order, one PR per group.

- [ ] ADR: render `<component>.md` on the Docs page (or decide not to)
- [ ] A. Mask and Input stories
- [ ] B. Field and Fieldset stories
- [ ] C. InputGroup stories
- [ ] D. Button, Link, Card and Icon stories
- [ ] E. Announcer and Provider stories
- [ ] F. `render` and hook stories, core README, `mergeProps` section
- [ ] Changeset only if a public API doc text changes
- [ ] Update `docs/roadmap.md`

## Risks & open questions

- **Decision for the maintainer:** should the Docs page render `<component>.md`? Doing so duplicates the contract for some content, and the `.md` files are marked Draft.
- A story per hook can read like a second copy of the `.md`. Keep each one to a single, short consumer.
- Some gaps may be intentional (internal helpers such as `useMergedRef`). Confirm each core export is meant to be public before documenting it. If not, remove it from the index instead.
- `masks.number({ locale })` and `withLocale` may overlap with the provider locale. Check ADR-0032 first.

## Testing strategy

`vp test run <story files>` for axe and `play` functions, then the whole-tree gates once at the end of each group. `vp run e2e` only where a story adds a keyboard row. A Storybook build proves that MDX and titles still compile.

## Rollout

Docs and stories only, so no version bump and no migration.

## Done when

- [ ] Every item in the gap inventory has a story, a Docs section, or an explicit "not public" decision
- [ ] All quality gates in AGENTS.md pass (manual AT may be `pending`)
- [ ] Plan tasks ticked, `docs/roadmap.md` status updated
