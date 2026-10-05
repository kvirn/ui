# Plan 0046: `useFormat()` and calendar dates

- **Status:** Implemented, gates green 2026-10-05 (maintainer chose option (a) and added the week-start rule)
- **Owner:** orchestrator
- **Created:** 2026-10-05 · **Target:** M2
- **Related:** 0002, 0039, `api-conventions`, `testing` skills

## Goal

A component or page writes a number, a date, a list or a plural the way the provider's locale writes it with one hook call, `const format = useFormat()`. It builds no `Intl.*` object, keeps no locale map and sets no time zone by hand.

## Non-goals

- No week-start setting and no calendar. `DatePicker` and `Calendar` are planned; the precedence rule for them is in Decisions.
- No new formatting methods (currency, relative time, units). `format.number(value, { style: 'currency', currency: 'SEK' })` covers money. Add a method when a component needs one.
- No `<Time>` part that renders `<time dateTime>` for you.
- No change to what a bare `en` means: `Intl` reads it as US English, and so does `useFormat()`.
- The other five fixtures with their own `formatLocales` map (form, card, icon, alert, section) move over in a follow-up, one concern per PR.
- `Temporal` values (`PlainDate`) are not accepted yet. A `YYYY-MM-DD` string is the calendar date until then.

## Background

The provider already builds a formatter for its `locale` and `timeZone` (`createMessageFormat` in `core`, held in `KvirnConfig.format`, memoised per locale and zone): `plural`, `number`, `date` and `list`. Only messages reach it, through `useMessages` (internal). The public hooks return `locale` and `timeZone` only, so adopters and our own fixtures rebuild `Intl.*` by hand: 20 call sites in Storybook and six copies of a `formatLocales` map. Nothing in Plan 0002 rules out exposing it.

Checked in Node 24:

- `sv`, `fi`, `nb` and `nn` format exactly the same with or without a region (`sv` and `sv-SE`), so the maps only matter for `en`: `October 14, 2026` and `10/14/26` against `14 October 2026` and `14/10/2026` for `en-GB`. `se` is supported by `Intl` too.
- `createMessageFormat` builds a new `Intl` object on every call. 20,000 date formats took 532 ms, against 15 ms when the object is reused. That is why the fixtures hoist `numbers`, `dates` and `months`.
- `new Date('2026-01-23')` formatted in `America/New_York` shows the 22nd. A calendar date has no time zone, which is why the Table fixture writes `asDate()` and `timeZone: 'UTC'`.
- `Intl.Locale#getWeekInfo().firstDay` is 7 (Sunday) for `en` and `en-US`, and 1 (Monday) for `en-GB`, `sv`, `fi`, `nb`, `nn` and `se`.

## Design

### API sketch

```tsx
import { useFormat } from '@kvirn-ui/react'

function Payments({ payments }: { payments: Payment[] }) {
  const format = useFormat() // the provider's locale and time zone
  return payments.map((payment) => (
    <tr key={payment.id}>
      <td>{format.date(payment.date, { month: 'long' })}</td>
      <td>{format.date(payment.date, { dateStyle: 'short' })}</td>
      <td>{format.number(payment.amount)}</td>
    </tr>
  ))
}
```

`useFormat()` returns the same `MessageFormatter` that message functions receive (`UseFormatResult`). Outside React (server components, scripts), `createMessageFormat({ locale, timeZone })` from `@kvirn-ui/core` is already exported.

### Behaviour

| Call                                                        | Result                                                                                                                                             |
| ----------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `format.date(new Date(…))` or `format.date(ms)`             | An instant, shown in the provider's `timeZone` (the runtime's when unset). `options.timeZone` still wins.                                          |
| `format.date('2026-01-23', options)`                        | A calendar date: the day, with no time of day and no zone. Shown in UTC, so it never moves to the day before or after, whatever the provider says. |
| `format.date('2026-01-23T10:00:00Z')`, `'2026-02-30'`, `''` | Throws a `RangeError` that names the fix, like an invalid `Date` already does.                                                                     |
| `format.number`, `format.list`, `format.plural`             | As before.                                                                                                                                         |
| The same options, again                                     | The same `Intl` object, so a table of 500 rows builds one formatter per kind of cell.                                                              |

### Accessibility contract (draft)

No role, ARIA, key, focus or announcement changes, and no new strings. The formatted value follows the provider's `locale`, and `lang` stays where the adopter puts it (`useLocale().localeProps`, WCAG 3.1.1 and 3.1.2). Nothing here needs an `a11y.md`, and `accessibility-reviewer` has no component or behaviour to review; the orchestrator says so in the summary.

### i18n strings

None.

### Theming surface

None.

## Tasks

- [x] Plan, and the worktree `kvirn-format` on branch `format-helpers`
- [x] Core: tests first, then `createMessageFormat` reuses `Intl` objects and accepts calendar dates (`create-message-format.ts`)
- [x] i18n: `MessageFormat.date` accepts a string, and the test helper in `format-file-size.test.ts` follows
- [x] React: `useFormat()` and `UseFormatResult` (`provider/use-format.ts`), the public export, a component test and a type test
- [x] The provider fixture shows its date with `useFormat()`
- [x] The Table fixture uses `useFormat()` and calendar dates, with a decorator that gives it the locale of its texts (`en-GB` for English)
- [x] Docs: `kvirn-provider.md` (a Formatting section, the `en-GB` note, the hooks table), `architecture.md`, the `api-conventions` skill, the plans index and the roadmap
- [x] Changeset

## Decisions

- **A public `useFormat()` that returns the provider's formatter** (maintainer asked for it, 2026-10-05). One formatter, the same one messages get, so a number reads the same in a message and in a cell. Not a new `useDateSettings` field, and not a second formatter type.
- **Reuse `Intl` objects inside `createMessageFormat`**, keyed by the effective options (the options plus the zone), at most 50 per kind, oldest dropped first. No API change, and messages get faster too. Instants and calendar dates have different default zones, so the key is the effective options, never the caller's alone.
- **A string is a calendar date.** Temporal's split (`Instant` against `PlainDate`) in one method: the argument says which. `YYYY-MM-DD` only, checked for a real day. Anything else throws a `RangeError` with the fix in its message, because a silent guess shifts days. `date` is typed `Date | number | string`: API data arrives as `string`, and a template-literal type would make every row need a cast.
- **`options.timeZone` of `undefined` is "not given"** (decided during implementation). `format.date(value, { timeZone: props.timeZone })` with an unset prop must not move a calendar date to the runtime's zone, or drop the provider's zone from an instant. Before this, an explicit `undefined` switched an instant to the runtime's zone. A defined `options.timeZone` still wins.
- **Bare `en` stays what `Intl` says, option (a)** (maintainer, 2026-10-05). The docs tell adopters to pass `locale="en-GB"` for EU English, and the stories' providers do. No hidden remap, and no message changes. Known gap: a provider left on the default `en` formats dates US-style, while `DateInput` already forces day-first for `en` (`dateInputOrder`). The maintainer chose that over mapping `en` to `en-GB`, which would also have changed the shipped English `list` output (`PDF, JPG, or PNG` to `PDF, JPG or PNG`).
- **Week start: no setting in this change** (maintainer, 2026-10-05). The provider has none: Plan 0002 sketched `weekStart`, but `architecture.md` and `kvirn-provider.md` say weeks always start on Monday and it is not a setting, and no calendar exists. The rule for the DatePicker plan: **an explicit provider setting wins over what the locale says** (`Intl` has `en` start on Sunday). Whether the fallback is then the locale or Monday stays with that plan, and changing the "not a setting" line needs the maintainer's approval then.
- **Table fixture only.** Its provider decorator gives `useFormat()` the locale of the texts: `en-GB` for English, and English for `se`, which has no texts. The English table's short dates therefore change from `3/2/26` to `02/03/2026`. No story or e2e spec asserts a date.
- **No `accessibility-reviewer` run** (see the contract above). Gate 6 is about components.

## Risks & open questions

- A bad string throws during render. That is what an invalid `Date` already does, and `RangeError` names the fix.
- `JSON.stringify` of the options is the reuse key. Key order makes two entries for the same options, which is harmless.
- `MessageFormat` in `@kvirn-ui/i18n` widens, and a type test keeps it equal to core's `MessageFormatter`. A hand-written `MessageFormat` (the `format-file-size` test helper is the only one in the repo) has to accept a string.
- The `RangeError` and the calendar rule exist only in `format.date`. Masks and `DateInput` keep their own `Intl` use in `core`.

## Testing strategy

Behaviour and requirements only, in the cheapest layer:

- `core` (node): calendar dates never shift in a zone west or east of UTC; instants still follow the provider zone; a calendar date and an instant with the same options do not share a formatter (in either order); bad strings throw; equal options build one `Intl` object.
- `react` (browser): `useFormat()` follows the provider's `locale` and `timeZone`, a nested provider, and the defaults without a provider; it is exported from the public entry; the object is stable until the locale or zone changes. The provider fixture test already compares the shown date with `Intl`, so it covers the fixture swap.
- Type test: `UseFormatResult` is `MessageFormatter`, `date` takes `Date | number | string`, and `MessageFormat` and `MessageFormatter` still extend each other.
- Storybook: the Table stories keep their axe runs in all four themes.

## Rollout

Changeset: minor for `@kvirn-ui/core`, `@kvirn-ui/i18n` and `@kvirn-ui/react` (0.x). Additive: no existing call changes behaviour, except that equal option sets now share one `Intl` object.

## Done when

- [x] All quality gates in AGENTS.md pass that apply: `vp check` on every changed file; `vp test run` on the core, i18n, provider and public-entry tests, the Table stories in all four themes, and the 57 files (1891 tests) that depend on the formatter in the node and browser projects; `i18n:check`; `theme:check`; the build, and `useFormat` is in the declarations; the Table e2e spec on chromium (36 passed, since its fixture changed). Manual AT does not apply, and `accessibility-reviewer` has no component to review
- [x] Plan tasks ticked, `docs/roadmap.md` and the plans index updated
