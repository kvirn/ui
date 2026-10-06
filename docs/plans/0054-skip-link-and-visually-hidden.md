# Plan 0054: SkipLink and VisuallyHidden

- **Status:** In progress (implemented; reviewer, AT and docs adoption pending)
- **Owner:** orchestrator → component-engineer → accessibility-reviewer
- **Created:** 2026-10-06 · **Target:** M1
- **Related:** [design spec](../design/docs-site-components.md) §5 G1 and §9 decision 1, [0052](0052-docs-on-built-packages.md), [0053](0053-docs-as-municipality-site.md), `keyboard`, `accessibility`, `api-conventions`, `testing`, `storybook-docs`, `theme-css` skills

## Goal

A keyboard or screen-reader user presses Tab once on any page and can jump past the header to the main content. An adopter gets the bypass link and a safe "visually hidden text" helper without writing the CSS.

## Non-goals

- A router-aware link (SkipLink is a plain `<a href="#id">`, never `Link.Root`).
- Several skip links, a skip-links menu, or a landmark list.
- Moving focus on route change (Plan 0055).
- Hiding focusable content with `VisuallyHidden` (the one exception is the skip link, which is its own part).

## Background

Every adopter site needs a bypass block (2.4.1). The docs have two interim blocks: `.docs-skip-link` in `apps/docs/app/docs.css` (hidden until `:focus`, then in flow) and a visually-hidden clip rule, with a `Link render={<a />}` in `apps/docs/components/site-shell.tsx`. Both go when this ships (spec §6). GOV.UK's skip link is the model: first in the body, visible and in flow on focus, and a non-focusable target gets `tabindex="-1"` until blur. `Card` and `Heading` (`packages/react/src/card`, `heading`) are the layout for a small flat component: `use-x.ts`, `x.tsx`, `x.md`, `x.a11y.md`, `x.test.tsx`.

## Design

### API sketch

```tsx
<SkipLink href="#main" />                       {/* label from skipLink.label */}
<SkipLink href="#main">Hoppa till innehållet</SkipLink>
<main id="main">…</main>

<VisuallyHidden>, 3 resultat</VisuallyHidden>   {/* a span */}
<VisuallyHidden render={<h2 />}>Meny</VisuallyHidden>
```

- Both are flat. `useSkipLink({ href, messages })` returns `{ skipLinkProps, label }`; `useVisuallyHidden()` returns `{ visuallyHiddenProps }` (`className: 'kv-visually-hidden'`, frozen, like `useCard`). Export `UseSkipLinkOptions`, `UseSkipLinkResult`, `SkipLinkPartProps`, `VisuallyHiddenPartProps`. Both support `render` and the ref.
- `SkipLink` renders `<a class="kv-skip-link" href>`: children replace the default label (a custom label is the consumer's own string, `lang` is theirs). `href` is required and must be a same-page `#id`; a dev warning `skip-link-target-missing:<id>` fires once in an effect when no element has that id (never on the server).
- Activation: a click handler (a plain native hash follow does not reliably move focus in every browser) finds the target with `getElementById` through `useEnv()`, adds `tabindex="-1"` when it is not focusable, calls `focus()`, and removes the attribute on `blur` (once). It does not `preventDefault`: the native hash scroll and `scroll-padding-top` still apply, and without JavaScript the link still jumps and sets the sequential starting point.
- `VisuallyHidden` renders `<span class="kv-visually-hidden">` with no ARIA, role or handlers.

### Accessibility contract (draft, `skip-link.a11y.md` and `visually-hidden.a11y.md`)

APG: none (WCAG technique G1 "bypass blocks" and C7). Native `<a>`: one Tab stop, the first in the body. Focus strategy: native tab order; activation moves focus (the documented exception to "no focus moves", it is the purpose of the control).

| Key       | Context            | Action                                                                                           | Test (`skip-link.test.tsx ›`)                                         |
| --------- | ------------------ | ------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------- |
| Tab       | page load or start | Focuses the skip link, which becomes visible in flow                                             | `the first Tab stop is the skip link and it becomes visible`          |
| Tab       | on the skip link   | Moves to the next stop (the wordmark), the link hides again                                      | `Tab leaves the skip link for the next stop and it hides again`       |
| Shift+Tab | on the skip link   | Leaves the page content backwards (browser UI)                                                   | `Shift+Tab from the skip link leaves the document`                    |
| Enter     | on the skip link   | Focuses the target (`tabindex="-1"` added if it was not focusable); the next Tab continues in it | `Enter moves focus to the target and the next Tab continues after it` |
| Space     | on the skip link   | Not handled (a link; the page scrolls natively)                                                  | `Space is not handled`                                                |

`VisuallyHidden` has no keys: `visually-hidden.test.tsx › is not a Tab stop and adds only its class`.

- Roles and ARIA: `link` (`<a href>`); the name is the label; no `aria-*` added. Rendered text, not `aria-label`, so it is translated and searchable. `VisuallyHidden` content stays in the accessibility tree.
- Focus: visible state is `:focus-visible` (the theme's token ring); the visible link stays **in flow** and never overlaps the header (2.4.11). A target made focusable has `tabindex="-1"` until blur. Whether that programmatic target shows the ring: shows it under `:focus-visible` only (maintainer, spec §9 decision 1), so no `outline: none` on `[tabindex="-1"]`.
- Announcements: none. Moving focus to the target reads its name or content.
- WCAG SCs: 2.4.1, 2.4.3, 2.4.7, 2.4.11, 2.5.8, 1.4.10, 1.4.3, 1.4.11, 3.1.2, 4.1.2.

### i18n strings

New namespace `skipLink: { label: TextMessage }`, appended to `KvirnMessages` in `packages/i18n/src/types.ts` and to the six catalogs in `packages/i18n/src/locales/`. `VisuallyHidden` has no strings (its text is the consumer's).

| Key              | en                   | sv                         | fi                  | nb                  | nn                  | se                                 |
| ---------------- | -------------------- | -------------------------- | ------------------- | ------------------- | ------------------- | ---------------------------------- |
| `skipLink.label` | Skip to main content | Hoppa till huvudinnehållet | Siirry pääsisältöön | Gå til hovedinnhold | Gå til hovudinnhald | Skip to main content (placeholder) |

`se` stays the English placeholder like the other `se` strings (header comment in `se.ts`; native review `pending`). The proposed texts need a native review.

### Theming surface

Classes `kv-skip-link` and `kv-visually-hidden`; no `data-*`. `kv-visually-hidden` is the standard clip rule (`position: absolute`, 1px box, `clip-path: inset(50%)`, `overflow: hidden`, `white-space: nowrap`), zero specificity in `@layer kv`. `kv-skip-link` is that same rule under `:not(:focus)` and, on `:focus`, in flow (`position: static`, `link` colour on `canvas`, the token ring, `space` margins, a target of at least 24px). Forced colours: system link colour and the system ring (`Highlight` outline), no background reliance. Pair `link` on `canvas` is already measured in `theme:check`; no new pair, no new token. Both go in the not-prose list (`theme.css` header and the `theme-css` skill). A `theme-css/SKILL.md` and `DESIGN.md` (Components) line each.

## Tasks

- [x] Failing tests first: `skip-link.test.tsx` (every row above, axe, sv and en, a target without `tabindex`, a target already focusable, missing target warning, `renderToString` gives a working link) and `visually-hidden.test.tsx`
- [x] `packages/react/src/skip-link/`: `use-skip-link.ts`, `skip-link.tsx`, `skip-link.md`, `skip-link.a11y.md`; `packages/react/src/visually-hidden/`: `use-visually-hidden.ts`, `visually-hidden.tsx`, `visually-hidden.md`, `visually-hidden.a11y.md`; exports in `index.ts`; `naming.test.tsx` and `tooling/component-naming/component-naming.test.ts`
- [x] i18n: the type and the six catalogs; `vp run i18n:check`
- [x] `theme.css`: the two classes, the not-prose lists, the header list; `vp run theme:check`
- [x] Storybook `components/skip-link/` and `components/visually-hidden/`: stories for Default (a Tab-to-reveal fixture), Keyboard, CustomLabel, TargetNotFocusable, RTL, ForcedColors, `parameters.a11yContract` from each `.a11y.md`; the dev warning in `dev-warnings.mdx`
- [x] Docs: `key-tables.md` (a native-link row), `api-conventions/SKILL.md` flat list, `dev-warnings.md`, `theme-css/SKILL.md`, `DESIGN.md` (Components)
- [x] Docs site adoption (`apps/docs`): replace the `Link render={<a />}` in `site-shell.tsx` with `SkipLink`, delete `.docs-skip-link` and the visually-hidden clip rules from `docs.css`; the site-shell test still passes
- [x] Changeset `.changeset/skip-link-and-visually-hidden.md` (i18n, react, theme minor; adopters' full custom catalogs add `skipLink`), roadmap row "VisuallyHidden, SkipLink", `docs/plans/README.md`
- [ ] Orchestrator: the gates, then `accessibility-reviewer`; AT matrix `pending`

## Decisions

- **Two flat components, no core machine:** both are a class and one handler; nothing is stateful beyond blur cleanup (rule 3 untouched).
- **A click handler moves focus,** not only the hash: WebKit and older Chromium scroll to a hash without focusing a non-focusable target, so the next Tab starts back at the top. The native scroll is kept (no `preventDefault`).
- **`tabindex="-1"` is added and removed by the link,** not required of the consumer (GOV.UK). A target the consumer made focusable is left alone.
- **Plain `<a>`,** never `Link.Root`, so a registered router link is never used (a hash on the same page is not a route).
- **Ring on a programmatic focus target** shows under `:focus-visible` only: maintainer decision, spec §9.1.
- **Visible state in flow,** not an overlay: it cannot cover the header's own focused element (2.4.11).
- **A new `KvirnMessages` namespace** breaks full custom catalogs at the type level (0.x minor, said in the changeset). Needs the maintainer's approval at review.

- **Implementation:** the visible state is proved in the `Default` story (theme loaded), not the component test: the component test proves focus order and focus movement only (rule 13). Focus moves in the click handler with `target.focus()` and no `preventDefault`. The `tabindex` test is `target.tabIndex < 0 && !hasAttribute('tabindex')`, so `main` and `div` are "not focusable" and a consumer's `tabindex="-1"` is left alone.
- **Implementation:** the Storybook play functions stop the hash jump with a click listener (`keepFrameStill`), because a followed `#id` link closes the test browser's connection in the story runner (component tests are unaffected).
- **Implementation:** the dev warning has no code prefix in its text, only the dedupe key `skip-link-target-missing:<id>`. `dev-warnings.mdx` lists the code.
- **Implementation:** `.kv-skip-link` and `.kv-visually-hidden` sit in theme section 9d and in the first line of the not-prose list. `fi`, `nb` and `nn` labels are native-review drafts; `se` is the English placeholder.
- **Docs site adoption** (`apps/docs`) done: `SkipLink href="#main"` in `site-shell.tsx`, `.docs-skip-link` and the `skipLink` docs message deleted (the library label is used); no visually-hidden helper remained in the docs shell.

## Risks & open questions

- Does `:focus-visible` match on a programmatic `focus()` after a keyboard activation in Safari? Chromium does; WebKit is CI-only and `pending`.
- Question: should `VisuallyHidden` offer a `focusable` variant (the GOV.UK pattern)? Proposed no; the skip link covers the only real case.
- The Sámi string is a placeholder; native review `pending`.

## Testing strategy

Rule 13: no CSS values. Visibility is proved by the behaviour: a focused link is in the viewport and not clipped (`isVisible`-style check through the accessibility tree and a bounding box greater than 1px), an unfocused one is not a visible box. axe in every story state. The pair itself is `theme:check`'s.

## Rollout

`.changeset/skip-link-and-visually-hidden.md`: `@kvirn-ui/i18n`, `@kvirn-ui/react`, `@kvirn-ui/theme` minor. The i18n type change is called out.

## Done when

- [ ] All quality gates in AGENTS.md pass (manual AT and the `se` review may be `pending`)
- [ ] The docs' interim skip link and visually-hidden CSS are gone
- [ ] accessibility-reviewer APPROVE
- [x] Plan tasks ticked, `docs/roadmap.md` status updated
