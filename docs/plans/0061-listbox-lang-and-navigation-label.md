# Plan 0061: Listbox `itemToLang` and `Navigation.Label`

- **Status:** In progress (implemented; reviewer and AT pending)
- **Owner:** component-engineer
- **Created:** 2026-10-06 · **Target:** M1
- **Related:** [design spec](../design/docs-site-components.md) §5 G5 and G8, [0053](0053-docs-as-municipality-site.md), [0043](0043-navigation-and-service-link.md), [0047](0047-navigation-t3c-and-horizontal.md) (ruled out `Navigation.Group`), `accessibility`, `api-conventions`, `testing`, `storybook-docs`, `theme-css` skills

## Goal

A language switcher built with Listbox reads each language's name in its own language (WCAG 3.1.2), and a staff sidebar can group links under a label that a screen reader announces as the name of the nested list, without a heading or a fake link.

## Non-goals

- A `Navigation.Group` part, a heading inside a navigation, or a collapsible group (0047, NavigationMenu).
- `itemToLang` on Combobox and Autocomplete (see Decisions).
- Detecting a language: the consumer returns the code.
- Replacing the docs app's interim code (`example-frame.tsx`, `.docs-nav-group-label`): a later step.

## Background

G5: `Listbox.Root native="always"` renders `<option>`s from `itemToString`, so a language name such as "Suomi" is read with the page's voice. G8: the docs sidebar groups links ("Foundation", "Components") under non-link labels, today a styled element with no relation to its list. `Navigation.Item` holds a link and an optional nested `Navigation.List`; the label names that list.

## Design

### API sketch

```tsx
<Listbox.Root items={localeCodes} itemToString={(code) => languages[code]} itemToLang={(code) => code}>…</Listbox.Root>

<Navigation.Root label="Documentation">
  <Navigation.List>
    <Navigation.Item>
      <Navigation.Label>Components</Navigation.Label>
      <Navigation.List>
        <Navigation.Item><Link.Root href="/button">Button</Link.Root></Navigation.Item>
      </Navigation.List>
    </Navigation.Item>
  </Navigation.List>
</Navigation.Root>
```

- `itemToLang?: (item) => string | undefined` on `UseListboxOptions` (so `Listbox.Root` and `useListbox`). A BCP 47 code, or `undefined` for "the page's language" (no attribute). Added in `listbox.tsx` from the Root's props through the two contexts; the machine and `@kvirn-ui/core` are untouched.
- Applied to: each native `<option lang>` (not the empty placeholder option, not `<optgroup>`); each popup `Listbox.Option` (`lang` on the `role="option"` element, a consumer's own `lang` wins); the trigger's `Listbox.Value`: each chosen label is wrapped in `<span lang>` (joined by ", ") when `itemToLang` is given and `Value` has no children of its own. The placeholder and a custom `children` are the consumer's.
- `Navigation.Label` is a flat-aliased part (`NavigationLabel`): `<span class="kv-navigation-label">` with a generated `id`. `Navigation.Item` creates an id (`useId`) and a context; a `Navigation.Label` in it registers and renders that id, and a `Navigation.List` in the same item gets `aria-labelledby` to it. A consumer's own `aria-label` or `aria-labelledby` on the list wins. A label with no nested list names nothing and warns (`navigation-label-without-list`, once, in an effect). `useNavigation()` returns `labelProps` (`className`) for your own elements. Supports `render` and the ref.
- Not a heading and not a link: no role, no `tabindex`, no handlers. The label's text is the consumer's.

### Accessibility contract (draft, `listbox.a11y.md` and `navigation.a11y.md`)

APG: none new. Neither change adds a key, a Tab stop or a focus move. Focus strategy unchanged (Listbox: DOM focus stays on the trigger; Navigation: native). Tab and Shift+Tab rows are unchanged; each existing row keeps its test.

- Listbox: `lang` on `option` elements and the value's spans. No ARIA is added. Test: `listbox.test.tsx › itemToLang`.
- Navigation: the nested `<ul>` gets `aria-labelledby` = the label's id, so it is announced "Components, list, 3 items". The label is exposed as plain text. The outer list's name is unaffected. Test: `navigation.test.tsx › Navigation.Label`.
- Announcements: none.
- WCAG SCs: 3.1.2 (Language of Parts), 1.3.1, 4.1.2, 1.4.3 (label colour), 2.4.6.

### i18n strings

None: the language code and the label text are the consumer's. Nothing to add in `sv fi nb nn se en`.

| Key | en  | sv  | fi  | nb  | nn  | se  |
| --- | --- | --- | --- | --- | --- | --- |
| –   | –   | –   | –   | –   | –   | –   |

### Theming surface

Class `kv-navigation-label`, no `data-*`. `label-compact` role at weight and size of the compact label (DESIGN's type role), `text-muted` on `surface`: the pair is measured already in docs-site.md §6 and in `theme:check`, so no new pair and no new token. The label is not a link: no underline, no hover. Forced colours: `CanvasText`. It joins the not-prose list. DESIGN.md (Components) gets a line marked for maintainer review.

## Tasks

- [x] Contracts: `listbox.a11y.md`, `navigation.a11y.md` (rows and notes for the two additions)
- [x] Failing tests first: `listbox.test.tsx` (native, popup, trigger value, multiple, placeholder, no `itemToLang`), `navigation.test.tsx` (label names the list, id link, own `aria-labelledby` wins, no list warning, axe, flat alias)
- [x] `use-listbox.ts` option, `listbox.tsx` plumbing; `use-navigation.ts`, `navigation.tsx` (`Label`, `NavigationLabel`, item context)
- [x] Exports in `index.ts`; `naming.test.tsx` and `tooling/component-naming` expectations
- [x] `theme.css`: `.kv-navigation-label` and the not-prose list
- [x] Stories: Listbox `LanguageSwitcher` (native and popup, sv fi se); Navigation `GroupLabels` (plus RTL, forced colours via the existing decorators)
- [x] Docs in package: `listbox.md`, `navigation.md`; `dev-warnings.mdx` entry; DESIGN.md line
- [x] Changeset, roadmap rows, plans README
- [ ] Orchestrator: the gates, then `accessibility-reviewer`; AT matrix `pending`

## Decisions

- **`itemToLang` returns a code or `undefined`,** not a map: it sits beside `itemToString` and fits any item shape.
- **React-only, no core change:** `lang` is a rendering concern; the machine has no use for it.
- **Combobox and Autocomplete:** they share the popup parts, so a later `itemToLang` on their Roots can reuse the option and context plumbing (the context field is optional and they leave it unset). Not done now: their value lives in an `<input>`, which takes one `lang` for the whole text, so the value half of G5 needs its own design. Follow-up.
- **Trigger value in spans only when `itemToLang` is set:** nothing changes for current adopters.
- **The native select's closed face** is drawn by the browser; `lang` on the chosen `<option>` is what the platform exposes. Not asserted beyond the attribute.
- **Item context, not a prop on the list:** the label and the list are siblings in an item, and the consumer should not wire ids. A label registers in an effect, so `aria-labelledby` appears after hydration, not in server HTML (the label and list still read in order).
- **Own naming wins:** a list's own `aria-label` or `aria-labelledby` replaces the label's, like `Option`'s rule.
- **No `Navigation.Group`** (0047): this part is only the name. A label in the top-level Root list's item with no nested list is a warning, not an error.
- **Implementation:** the label's `aria-labelledby` appears after hydration (the item registers it in a layout effect), so server HTML has the label's `id` and an unnamed list. Tested as such.
- **Implementation:** `.kv-navigation-label` uses `label-compact` at every density, `space-2` block padding, and the links' inline padding (`space-4` start, `space-3` end), so its text lines up with the links' text; `margin-block-start: space-4` from the second item on. DESIGN.md has the line, marked for maintainer review. It sits inside `.kv-navigation`, which is already not-prose, so the not-prose list is unchanged.
- **Implementation:** multiple choice wraps every label in a `<span>` (with `lang` only when `itemToLang` returns one), so the comma stays the page's language.
- **Implementation:** stories `Languages` (Listbox), `GroupLabels`, `LongFinnishGroupLabel` (320px), `GroupLabelsRTL`, `GroupLabelsForcedColors` (Navigation).

## Risks & open questions

- `aria-labelledby` on a plain `<ul>`: widely supported (NVDA, JAWS, VoiceOver read the name with the list); AT run `pending`.
- Safari list semantics for lists without markers are a known issue already in `navigation.a11y.md`.

## Testing strategy

Component tests (Chromium) for attributes and names; axe in the stories. No CSS tests (rule 13): the label's pair is `theme:check`'s.

## Rollout

`.changeset/listbox-lang-and-navigation-label.md`: `@kvirn-ui/react` and `@kvirn-ui/theme` minor. No i18n change.

## Done when

- [ ] All quality gates in AGENTS.md pass (manual AT `pending`)
- [ ] accessibility-reviewer APPROVE
