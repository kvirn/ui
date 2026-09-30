# ADR-0008: Every string has a default and can be overridden

- **Status:** Accepted
- **Date:** 2026-09-30
- **Deciders:** Maintainer
- **Tags:** i18n, api, a11y

## Context

Components need visible and announced strings: labels, titles, error messages, status text and new-tab notices. We ship sensible defaults in six locales (hard rule 4). Adopters still need to change them:

- to match their own terminology or plain-language guidelines (klarspråk, selkokieli)
- to fix one string on one page
- to add a locale we don't ship
- to route strings through their existing translation system

## Decision drivers

- No string is ever hard-coded, and no string is ever locked
- Overrides are typed: a typo in a key or a missing interpolation value fails the type check
- No ICU runtime, `Intl.*` only
- Screen readers must never get an empty accessible name

## Decision

**1. Catalogs are typed objects, namespaced per component.** `@kvirn-ui/i18n` exports the `KvirnMessages` type and one catalog per locale.

- Keys without parameters are strings.
- Keys with parameters are functions, which receive the values and a small locale-aware `format` helper (`plural`, `number`, `date`, `list`, built on `Intl`).

```ts
export const sv = {
  link: { newTabNotice: '(öppnas i en ny flik)' },
  search: {
    resultCount: ({ count }, format) =>
      format.plural(count, { one: '1 träff', other: `${format.number(count)} träffar` }),
  },
} satisfies KvirnMessages
```

**2. Resolution order** (first match wins):

| #   | Where                                                    | Example                                                 |
| --- | -------------------------------------------------------- | ------------------------------------------------------- |
| 1   | Children of a visible text part                          | `<Link.NewTabNotice>(nytt fönster)</Link.NewTabNotice>` |
| 2   | The `messages` prop on the component or hook             | `<Link messages={{ newTabNotice: '(nytt fönster)' }}>`  |
| 3   | The nearest `KvirnProvider messages`, then its ancestors | `messages={{ link: { newTabNotice: '…' } }}`            |
| 4   | Built-in `en` (ADR-0007)                                 | Dev warning if the active locale isn't `en`             |

**3. Every provider's `messages` is deep-merged over what it inherits.** The root inherits `en`. So:

- `messages={sv}` gives Swedish.
- A nested provider with a partial object overrides only a section of the page.
- `defineMessages(sv, { … })` is a typed helper for building an adjusted catalog once.

**4. New locales** are a full `KvirnMessages` object (`satisfies KvirnMessages`), so any missing key fails the type check. We don't encourage partial locales, because they would silently mix in English.

**5. External i18n systems** plug in through function values, for example `newTabNotice: () => t('kvirn.link.newTabNotice')`. The provider re-renders when the app passes new messages. There is no adapter API until someone needs one.

**6. Messages are plain strings, never JSX.** They end up in `aria-label`s and announcements. Rich visible content goes through children (level 1).

## Accessibility impact

- **An override that resolves to an empty or whitespace-only string** triggers a dev warning and falls through to the next level. This way a component never gets an empty accessible name (4.1.2).
- **Changing a label is the adopter's responsibility** for 2.5.3 Label in Name, because the visible label and the accessible name must still match. Components whose accessible name comes from a message document this.

## Consequences

- Positive: defaults work out of the box, and any string can be changed at the scope that fits: app, section or instance.
- Negative: every component with strings must accept `messages`, and text parts must accept children. The shared `useMessages(namespace, instanceMessages)` hook keeps this to one line per component.
- Follow-ups:
  - `i18n:check` also verifies that function keys have the same parameters in all locales.
  - Architecture docs updated.
  - Each `<name>.a11y.md` lists its message keys.

## Validation

Type tests (`expectTypeOf`) for key typos, missing parameters and partial overrides. Browser tests for each resolution level, plus empty-string fallthrough.
