# ADR-0047: Notification is one plain Root and four ready-made status roots

- **Status:** Proposed
- **Date:** 2026-10-02
- **Deciders:** Magnus Vike (classes not props, separate status components, `variant` as the only prop name), proposed with Plan 0020
- **Tags:** api, a11y, theming, i18n

## Context

A status message (info, success, warning, danger) needs more than a colour: an icon and a status word, so it never relies on colour alone (1.4.1), and a decision about announcing it (4.1.3). The words in the docs also run together: surface, card, section, panel, notification. Section and Card are containers (ADR-0044, ADR-0020). Status is a different thing, and DESIGN.md says a card or section must never use a status background.

Adopters must be able to drop our class and design their own, and to change the default look easily (ADR-0013: choices are classes, the look is CSS on them).

## Decision drivers

- Choices are classes, not props (ADR-0013).
- Colour, icon and status word must not silently disagree.
- Easy to restyle: tokens first, then replacing the class.
- No second live region (ADR-0040): the Announcer is the only one.
- Every visible or announced string is in all six locales and overridable (ADR-0007).

## Options considered

### Option A: a `status` or `variant` prop on one Root that renders the class, icon and word

- ✅ One component, hard to get wrong.
- ❌ A choice as a prop, against ADR-0013, and a Root that is never plain, so dropping our look means dropping the component.

### Option B: classes only, on one Root

- ✅ Fully consistent with Card and Section.
- ❌ The consumer must add the class, the icon and the word by hand, and they can disagree (1.3.1, 1.4.1).

### Option C: a plain Root, and four ready-made status roots (chosen)

- ✅ Classes stay the choice mechanism. The ready-made roots keep colour, icon and word in one table.
- ✅ Restyling has three routes: override tokens, drop the class, or build on the plain Root.
- ❌ More exports (five roots).

## Decision

We will use Option C. The details are in the design spec `docs/design/notification.md`.

1. **Name.** `Notification`, not Alert (the ARIA role and AlertDialog). The error status is `Danger`, matching the tokens.
2. **Parts.** `Notification.Root` (`kv-notification` only: no status class, icon or word), `Notification.Info`, `.Success`, `.Warning`, `.Danger` (also `NotificationInfo`, … as named exports), and `Title` (required, `h2` by default, the consumer sets the level or uses a `<p>`), `Body` and `Actions`. Each ready-made root renders its `kv-notification--<status>` class, its icon and the context for its status word, from one table. Title renders the word first.
3. **Look.** Only CSS on the class, through two tokens. No new colour tokens. Every pair is already required in `contrast-requirements.ts`, and the tinted button-edge check is extended to the four `-subtle` backgrounds.
4. **Agreement guards.** No prop changes a ready-made root's status. Dev warnings catch a conflicting status class, and our status class on a plain Root.
5. **Status words.** Four i18n keys, `notification.infoPrefix|successPrefix|warningPrefix|dangerPrefix`, in all six locales and overridable per provider and per instance, visually hidden by the theme.
6. **Semantics.** No role, `aria-live` or `aria-atomic` on the box. `announce="polite|assertive"` on any root makes one Announcer call on mount. Content present at load is never announced, and a notification is never announced and focused at once.
7. **`variant`** is the only name for a status prop, if one is added later as sugar on `Notification.Root`. `useNotification()` takes `variant` in v1 so the hook gives the same agreement.
8. **Not dismissible** in v1. The error summary is a later block built on `Notification.Danger`.

## Accessibility impact

- Positive: status is never colour alone, the heading level is the consumer's, and nothing here adds a second live region.
- Known risk: the box has no role, so the message reaches screen readers only through the Announcer (4.1.3). Manual AT validation is `pending`.
- Contrast: every pair is already in `contrast-requirements.ts`. The tinted button-edge check is extended to the four `-subtle` backgrounds.
- The `se` (Northern Sámi) status words are machine-drafted, not English placeholders (maintainer's decision, 2026-10-02), and need a native speaker to verify them.

## Consequences

- Positive: one vocabulary, and a status component that is easy to restyle and hard to get wrong.
- Negative: five roots and four i18n keys to maintain. The ready-made roots are public API.
- Follow-ups: a `variant` prop on Root if adopters ask, the error summary block (M4), Toast reusing the look (M3), and a native-speaker review of the Northern Sámi words.

## Implementation notes (component-engineer, Plan 0020)

Choices made while building it that the spec left open, for the maintainer to confirm:

1. **The hook owns the table, the refs and the warnings.** `useNotification` holds one internal status table (class, icon name, message key, component name), and returns `rootProps`, `titleProps` and `bodyProps` with callback refs. `announce` reads the Title and Body text through them, once, in an effect on mount (the first `announce` value counts, a ref guards against Strict Mode's second effect). The text is `innerText` (block boundaries become spaces, `hidden` text is skipped), with `textContent` as the fallback, then whitespace is collapsed.
2. **Dev warnings 3, 5 and 6 read the real element.** An effect checks the root element's `role`, `aria-live` and class list, so a prop, a `render` element and the `render` function form are all covered. The "no Title" warning checks once on mount.
3. **Quiet announcer.** `announce` uses `useQuietAnnouncer` (as masks do) and warns about a missing `KvirnProvider` only when a root actually has `announce` set, so a notification without `announce` makes no noise outside a provider.
4. **The hook resolves `notification` messages for every root,** including the plain Root, so a provider with a partial catalog may log the usual "no translation" warnings for the four keys. Each ready-made root still uses only its own key.
5. **Two more theme tokens,** `--kv-notification-title-size` and `--kv-notification-title-line-height`, place the icon on the Title's first line (the `lh` of the icon would be the body's, not the Title's). They are aliases of fixed values, set on `:root` and in compact density. No new colour.
6. **Extra exported types,** `NotificationElementProps` and `NotificationState` (what a `render` function gets, as Card and Section export), and the `Notification*PartProps` types of the hook.
7. **Nesting rule in the decision table.** "A Notification may sit on the page, in a Section or in a Card body, but never put a Card or a Section inside one" (spec §6.3) is added next to the table's rules, in every copy.
8. **Northern Sámi.** The four `se` words are `Dieđut:`, `Gárvvis:`, `Váruhus:` and `Boasttuvuohta:`, machine-drafted by the agent, with a comment in the locale file. A native speaker must verify them. They are not English placeholders.

## Validation

- Component tests for each root, the Title's status word, the dev warnings, `announce` and axe.
- Stories with axe in four themes, forced colours and RTL, and e2e reflow at 320px.
- `theme:check` and `i18n:check` green.

## References

- Plan 0020, design spec `docs/design/notification.md`
- ADR-0007, ADR-0013, ADR-0020, ADR-0040, ADR-0044, DESIGN.md (Components)
