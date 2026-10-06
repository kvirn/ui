# Plan 0063: SummaryList and ErrorSummary

- **Status:** Approved
- **Owner:** component-engineer (agent)
- **Created:** 2026-10-06 · **Target:** M3 (SummaryList), M4 (ErrorSummary)
- **Related:** [0053](0053-docs-as-municipality-site.md) (B21, B22; §2 library first), [0020 Alert](../../packages/react/src/alert/alert.a11y.md), [0013 form fields](0013-form-fields.md), [municipality-reference-site.md](../design/municipality-reference-site.md) §3, §7, `forms` skill (ids), DESIGN.md "Error summary"

## Goal

A municipality's check-your-answers page, contact card or case card shows rows of label, value and an optional "Change" link as one native `<dl>` (SummaryList). A form that fails to submit shows one region at the top that lists every problem as a link to its field, takes focus once, and is read by the screen reader because focus moved there (ErrorSummary).

## Non-goals

- A form library: ErrorSummary lists what the consumer passes. It never reads fields or validates.
- Announcing the summary through the Announcer (the focus move is the announcement).
- A task list, a step indicator, a "Check answers" template (a later pattern).
- Router-aware links (the fragment link is native; a router adopter's `Link` is not needed for `#id`).
- Docs pages (`apps/docs`): a later step.

## Background

GOV.UK [Summary list](https://design-system.service.gov.uk/components/summary-list/) and [Error summary](https://design-system.service.gov.uk/components/error-summary/); WCAG 1.3.1 (the `<dl>` relationships), 2.4.3, 2.4.6, 3.3.1 (error identification), 3.3.3, 4.1.3 (status: focus move instead of a live region), 2.5.3 (label in name), 2.4.4 (link purpose: "Change" plus the key). The `forms` skill: `controlId` on the Field sets a control's id for the summary link; the group's id is its first option's.

## Design

### API sketch

```tsx
;<SummaryList.Root>
  <SummaryList.Row>
    <SummaryList.Key>Namn</SummaryList.Key>
    <SummaryList.Value>Anna Svensson</SummaryList.Value>
    <SummaryList.Actions>
      <SummaryList.Change href="/steg/1" />
    </SummaryList.Actions>
  </SummaryList.Row>
</SummaryList.Root>

{
  errors.length > 0 && (
    <ErrorSummary.Root focusKey={submitCount} prefixDocumentTitle>
      <ErrorSummary.Title />
      <ErrorSummary.List>
        <ErrorSummary.Item>
          <ErrorSummary.Link controlId="email">Ange en e-postadress</ErrorSummary.Link>
        </ErrorSummary.Item>
      </ErrorSummary.List>
    </ErrorSummary.Root>
  )
}
```

Both are compound components with flat aliases (`SummaryListRoot`, `ErrorSummaryLink`, ...) and hooks `useSummaryList` and `useErrorSummary`.

**SummaryList parts:** Root `<dl class="kv-summary-list">`, Row `<div class="kv-summary-list-row">`, Key `<dt>`, Value `<dd>`, Actions `<dd>`, Change `<a>` (flat, class `kv-link`). Row gives the Key an id; Change's accessible name is "Change" + the key's text through `aria-labelledby="{own id} {key id}"` (visible text is "Change", so 2.5.3 holds, and no hidden-span word order problem in fi/nb/nn). Outside a Row, Change warns (`summary-list-change-outside-row`) and falls back to its own text.

**ErrorSummary parts:** Root = `Alert.Danger` (icon, "Error:" status word, `kv-alert--danger`) plus class `kv-error-summary`, `role="group"`, `aria-labelledby` the Title, `tabindex="-1"` and the focus effect. Title = `Alert.Title`, an `h2`, default text `errorSummary.title`. List `<ul>`, Item `<li>`, Link `<a href="#controlId">`.

### Accessibility contract (draft)

Full contracts: `summary-list.a11y.md`, `error-summary.a11y.md`.

SummaryList: native `<dl>`, the only focusable parts are the consumer's links (Change). Focus strategy native. Tab and Shift+Tab walk the Change links in DOM order, Enter follows the link.

ErrorSummary: focus strategy native, programmatic focus on the root once per `focusKey`.

| Key       | Context           | Action                                                   |
| --------- | ----------------- | -------------------------------------------------------- |
| Tab       | summary has focus | Moves to the first link in the list                      |
| Tab       | on a link         | Moves to the next link, then on into the page            |
| Shift+Tab | on the first link | Moves back to the summary, then to the stop before it    |
| Enter     | on a link         | Moves focus to the field and scrolls its label into view |

- Roles / ARIA: SummaryList `dl`, `div`, `dt`, `dd` (native, no ARIA). ErrorSummary root `group` named by its Title; the list is a `list`. No `aria-live`, no `role="alert"`.
- Focus management: on mount and when `focusKey` changes, `focus()` on the root (`tabindex="-1"`). A link moves focus to the control (`preventDefault`, then `focus({ preventScroll: true })` and scroll the control's label or legend into view, never smooth). A link whose target is missing is left to the browser (hash navigation) and warns.
- Announcements: none. The focus move reads the group name (the Title, with the status word); whether the content is read too is pending AT (decision 1, open question).
- WCAG SCs: 1.3.1, 2.4.3, 2.4.4, 2.4.6, 2.5.3, 3.3.1, 3.3.3, 4.1.2. The document title prefix helps 2.4.2 and 3.3.1.

### i18n strings

| Key                        | en                 | sv                    | fi                      | nb                | nn                 | se (placeholder)   |
| -------------------------- | ------------------ | --------------------- | ----------------------- | ----------------- | ------------------ | ------------------ |
| `errorSummary.title`       | There is a problem | Det finns ett problem | Lomakkeessa on virheitä | Det er et problem | Det er eit problem | There is a problem |
| `errorSummary.titlePrefix` | Error:             | Fel:                  | Virhe:                  | Feil:             | Feil:              | Error:             |
| `summaryList.change`       | Change             | Ändra                 | Muuta                   | Endre             | Endre              | Change             |

fi, nb, nn are drafts that need native review. se is an English placeholder. Both are noted in the locale files' headers.

### Theming surface

Classes: `kv-summary-list`, `kv-summary-list-row`, `kv-summary-list-key`, `kv-summary-list-value`, `kv-summary-list-actions`; `kv-error-summary`, `kv-error-summary-list`, `kv-error-summary-item`, `kv-error-summary-link` (all new classes, existing tokens only: `border-subtle`, `text`, `text-muted`, `danger`, the Alert's tokens). No `data-*`: neither has state. Custom property: none. The focus ring is the existing zero-specificity `:where([tabindex='-1']:focus-visible)` rule.

## Tasks

- [x] Plan, README row
- [x] Contracts: `summary-list.a11y.md`, `error-summary.a11y.md`
- [x] Tests first: `summary-list.test.tsx`, `error-summary.test.tsx`
- [x] Hooks and compound components, exports, `naming.test.tsx`
- [x] i18n namespaces `summaryList`, `errorSummary` in all six locales
- [x] Theme classes (one layer, forced colours, `not-prose`, no new tokens)
- [x] Stories (every state, RTL, forced colours, 320px, `Keyboard` for ErrorSummary and SummaryList's Change links)
- [x] `<name>.md` pages, DESIGN.md proposals (marked for review), dev-warnings.mdx
- [x] Changeset, roadmap rows
- [ ] AT matrix run (pending: never claimed by an agent)
- [ ] accessibility-reviewer (pending)

## Decisions

1. **How ErrorSummary gets focus, and how it is announced.** Options: (a) `role="alert"` on the root (GOV.UK 4.x): announced by the live region and focused, which several readers read twice; (b) a live region through the Announcer, no focus: a keyboard user stays at the submit button; (c) **chosen:** `tabindex="-1"` and a focus effect, like `useRouteFocus`, with no live region and no `announce`. The screen reader reads the focused group's name (the Title with the status word; reading the list as well is not assured and is pending AT), so focus is the one announcement. The root is `role="group"` with `aria-labelledby`: a generic `div` must not carry `aria-labelledby`, and a `region` would add a landmark per failed submit. `Alert.Danger`'s `announce` is never set, and the Alert's own dev warning `alert-announce-and-focus` stays as the guard.
2. **When it focuses.** On mount and whenever `focusKey` changes (pass the submit count), so a second failed submit refocuses a summary that is already on screen. The summary is rendered only while there are errors and is never updated while typing. No `focusKey`: once, on mount.
3. **Link activation.** `href="#id"` stays the real address, so middle-click and copy work. A plain left click or Enter runs the handler: focus the control, scroll its label into view (`label[for]`, or the enclosing fieldset's legend), `preventDefault`. Modified clicks (Ctrl, Meta, Shift, Alt, non-primary button) are left to the browser. A group links to its first option's id (the `forms` skill's `controlId`). Not a keyboard interception: Enter on a link still activates it.
4. **Document title prefix is opt-in** (`prefixDocumentTitle`): `errorSummary.titlePrefix` plus a space, removed when the summary unmounts, never doubled. Off by default because a router owns `document.title` and would fight it.
5. **Built on `Alert.Danger`**, not a copy: the colour, icon and status word cannot disagree with Alert (DESIGN.md "Error summary"). The Alert's status word "Error:" precedes the Title text, which reads "Error: There is a problem" on focus.
6. **Change link name.** `summaryList.change` is the visible word only ("Change"), not the spec's "Change {key}": the name is built with `aria-labelledby` from the link and the row's key, so word order is never a translation concern and the visible text is the start of the name (2.5.3). Deviates from the §7 table of the municipality inventory, which should read "Change". Needs no hidden text, so G1's VisuallyHidden is not used.
7. **Rows stack below 40rem** with the key above the value and the actions below, left-aligned. Dividers are `border-subtle`; no zebra. Values wrap anywhere (`overflow-wrap: anywhere`), never truncate.
8. **No state, no data attributes**, frozen class-only props like Card; the hook of ErrorSummary also returns `getLinkProps(controlId)`.
9. **Docs page iframes.** The summary focuses on mount, so its stories set `docs.story.inline: false` and a Docs page does not jump between stories.
10. **`role="list"`** is explicit on `ErrorSummary.List`: the theme draws no markers and Safari drops the list semantics without it.
11. **Shift+Tab** from the first link goes to the stop before the summary, not the summary: a `tabindex="-1"` element is not a Tab stop (the contract says so).
12. **DESIGN.md** gets two subsections marked "Maintainer review (Plan 0063)", reusing existing tokens only.

## Risks & open questions

- `docs/design/form-fields.md` still says "until the error summary ships": update it in the docs step (Plan 0053).
- Whether a `group` named by the Title is read as well as `role="alert"` content on NVDA + Firefox and VoiceOver iOS. AT run pending.
- A scripted focus after a mouse click on submit does not match `:focus-visible` in all browsers, so a pointer user may see no ring. Consistent with maintainer decision 1 of the docs-site spec (ring under `:focus-visible` only).
- Chrome and Firefox differ on whether a fragment link focuses a non-focusable target. Hence the handler.

## Testing strategy

Browser tests (real key events) per contract row; axe in every state; a story file per component with the contract imported with `?raw`. Behaviour only, never CSS (rule 13): "stacks below 40rem" is checked by the 320px story's axe run, not by a computed style.

## Rollout

Minor changeset for `@kvirn-ui/react`, `@kvirn-ui/i18n` and `@kvirn-ui/theme`. Alpha candidate. No migration.

## Done when

- [ ] All quality gates in AGENTS.md pass (manual AT `pending`; the orchestrator runs the whole-tree gates)
- [x] Plan tasks ticked, `docs/roadmap.md` status updated

## Review fixes (a11y review)

- ErrorSummary link: if `focus()` leaves `document.activeElement` elsewhere, warn once and let the native hash jump proceed (no `preventDefault`, no scroll).
- SummaryList.Key keeps a consumer `id`; it reports it to the Row (layout effect) so the Change link's `aria-labelledby` follows it. Change warns once (checked in a microtask, after that re-render) when its key id is not in the document.
