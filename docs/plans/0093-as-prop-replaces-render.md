# Plan 0093: `as` replaces `render`

- **Status:** In progress
- **Owner:** lead (maintainer decided the direction)
- **Created:** 2026-10-09 · **Target:** pre-alpha, breaking, no backward compatibility
- **Related:** `.claude/skills/api-conventions/SKILL.md`, `docs/architecture.md#api-conventions`, `docs/dev-warnings.md`

## Goal

A part's element is chosen with a plain `as` prop, so `<Heading as="h1">` is a real `h1` and the same markup comes out on the server and in the client, from a Server Component or a Client Component. `render` is removed. No deprecation, no shim, no workaround.

## Non-goals

- A server-safe package entry (`'use client'` banner per chunk): a separate plan.
- Changing any component's behaviour, keyboard contract or tokens.

## Background

In this stack (Next 16.3.8, React 19.3) an element prop made in a Server Component reaches a client part as a `React.lazy` wrapper, so `isValidElement(render)` is false and the part silently renders its default element: hydration mismatch (`Alert.Title` `<p>` on the server, `<h2>` on the client). A function prop can never cross from a Server Component. A string and a client reference both cross. Architect's inventory: 166 `renderPart(` calls in 61 part files, 372 `render=` uses under `packages/react/src`, 55 in `apps/docs`, 77 in Storybook, 5 in rich-text, 9 `takeRenderElementProps` sites.

## Decisions (maintainer, 2026-10-09)

1. Option B: `as` only where the element makes sense. Everything else gets no `as`; write your own element with the hook (`useButton()` and the rest).
2. `Heading` takes `as: 'h1' | … | 'h6'` (required) instead of `level`. `size` stays. A `<legend>` or other element uses `useHeading` and its own element.
3. No workaround and no backward compatibility: `apps/docs/components/note.tsx` loses its `'use client'`; `render`, its function form and `takeRenderElementProps` are deleted, not deprecated.
4. Allowed tags per part and the parts with component `as` are set below; the a11y reviewer checks them. A tag list change is an accessibility trade-off, so the part's `*.a11y.md` gets an "Allowed elements" line.

## Design

### The prop

- **Tag parts:** `as?: <Union of tag names>`. A string only. Typed as a discriminated union per part so the element's own attributes type-check (`as="form"` allows `action`). A string outside the union is a type error, and in JS it warns once in development (`as-not-allowed:<part>:<tag>`) and falls back to the default.
- **Component parts:** `as?: ElementType`, with the part's own props plus `Omit<ComponentPropsWithRef<C>, keyof OwnProps>`. Props are plain JSX props on the part and are forwarded: `<Tooltip.Trigger as={Button} aria-label="Close">`. Merge is `mergeProps(consumerProps, hookProps)`: handlers chain, `className` joins, `ref` merges. The target must accept `ref` and spread the rest on its DOM node; the existing tag and focusability dev warnings stay.
- **Implementation:** `renderPart({ as, defaultElement, partProps })` is `createElement(as ?? defaultElement, partProps)` and nothing more. `RenderProp`, the `render` function form, the `State` generic and `takeRenderElementProps` are deleted. A part that gated an element's `onClick` (Button, Toggle, Tabs, Disclosure, Menu, Alert.Close, FileUpload) now gets `onClick` as its own prop, which it already gates.
- **RSC:** `as="p"` from a Server Component works. `as={ClientComponent}` works (a client reference). `as={ServerComponent}` or an inline function throws at render, loudly.

### Which parts get what

| Group           | Parts                                                                                                                                                                                                                                                                                                                 | `as`                                    |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| Heading         | Heading                                                                                                                                                                                                                                                                                                               | `'h1'…'h6'`, required, replaces `level` |
| Tag parts       | Alert (Title `h2…h6`/`p`, Body, Actions, roots), Section, Prose, Stack, Columns, Container, Card, Kbd, Badge, VisuallyHidden, SidebarLayout, SummaryList, Accordion Root/Item, CodeBlock, ErrorSummary, Link.NewTabNotice/Icon, ReadAloud, TableOfContents List/Item, Progress, CharacterCount, ScrollArea, Stepper   | union of safe tags, per part            |
| Component parts | Link.Root (and Breadcrumb.Link, Pagination.Link, Navigation links, SkipLink through it), Tooltip.Trigger, Toolbar.Item, Popover.Trigger, Popover.Close, Dialog.Close, Menu.Trigger, Icon                                                                                                                              | `ElementType`                           |
| No `as`         | Button, Toggle, Tabs, Disclosure, Menu items, Checkbox, Switch, Radio, TextInput, Textarea, NumberInput, Slider, Date\*, Calendar, Combobox, Listbox, Autocomplete, FileUpload, OneTimeCode, InputGroup, Field, Fieldset, Dialog (rest), AlertDialog, Tag, ButtonGroup, Table, Toast, and every part not listed above | none: use the hook                      |

Tag lists: derive from the tags the apps and tests use today, then cut anything that harms the outline or semantics (1.3.1, 4.1.2). Link stays an `<a href>` (`as="a"` bypasses the registered router link); a link that looks like a button is `Link.Root className="kv-button…"`.

## Tasks

Gates run on the main thread once at the end (`vp check`, `vp test run`, `i18n:check`, `theme:check`); each engineer runs scoped `vp check`/`vp test run` on its own files.

- [x] **T0 Reference** (sequential, first): `render-part.ts`, the `as` type helpers, the `as-not-allowed` warning, `Heading`, `Alert`; tests, `*.a11y.md`, `*.md`; `api-conventions` skill section.
- [x] **T1 Tag parts** (all of group "Tag parts" except Heading and Alert).
- [x] **T2 Component parts** (Link family, Tooltip, Toolbar, Popover, Dialog.Close, Menu.Trigger, Icon, FocusScope).
- [x] **T3 No-`as` parts A** (Button, Toggle, Tabs, Disclosure, Menu, form controls, Calendar, Date\*, Field, Fieldset, InputGroup, Tag, ButtonGroup, OneTimeCode).
- [ ] **T4 No-`as` parts B** (Combobox, Listbox, Autocomplete, FileUpload, Dialog, AlertDialog, Table, Toast, the rest of `packages/react/src`, `packages/rich-text`).
- [ ] **T5 apps/docs** (`render=` and `<Heading level=`; revert `note.tsx`; docs prose and design docs `docs-site*.md`).
- [ ] **T6 Storybook** (stories, fixtures, `your-own-element.mdx` rewritten around hooks and `as`).
- [x] **T7 Docs and skills**: `AGENTS.md`, `architecture.md`, `api-conventions`, `dev-warnings.md`, the other skills; a major changeset (`feat(react)!`) with a migration table.
- [ ] **T8 Verify and review**: whole-tree gates, a hydration check on `/components/button`, `accessibility-reviewer` on the diff.

## Implementation decisions (T0)

- Helpers in `render/as-prop.ts` (no barrel): `AsTag<Tags, DefaultTag, OwnProps>`, `AsComponent<Component, OwnProps>`, `resolveAsTag({ part, as, allowedTags })` (returns the tag or `undefined`, warns `as-not-allowed:<part>:<tag>` once). Tag-part `ref` is `Ref<HTMLElement>` (as before), so one type fits every tag.
- `resolveAsTag` warns during render, not in an effect (it reads the prop only); a rule-by-exception in the skill.
- Heading: an invalid `as` from JS warns and falls back to `h2`. `HeadingState`, `HeadingElementProps`, `AlertState`, `AlertElementProps`, `AlertCloseState`, `RenderProp` are gone from the public index; `HeadingTag` is added.
- Alert tags: roots `div|section|aside`, Title `h2..h6|p`, Body `div|p|section`, Actions `div|section`; Close has no `as`, no ref merge and no not-a-button warning (`alert-close-not-a-button` removed, its row in the Dev warnings page replaced by `as-not-allowed`).
- The dev-warnings home is `apps/storybook/src/foundation/dev-warnings.mdx` (checked by `tooling/dev-warnings`) plus the skill reference, not `docs/dev-warnings.md`.

## Implementation decisions (batches and T7)

- Each tag part's allowed tags live in its own `*.a11y.md` ("Allowed elements"), not in the skill or `architecture.md`; the part's a11y.md wins over any doc.
- One `as` per part. Composing two behaviours needs a wrapper component passed as `as`.
- `Accordion.Heading` keeps `level`; `useHeading` keeps `level`. Only the `Heading` component takes `as`.
- Dev warnings deleted because their cause is gone: `toggle-not-a-button`, `tabs-tab-not-a-button`, `disclosure-not-a-button`, the `Button` and `Fieldset.Root` element checks, `menu-item-navigation`, `alert-close-not-a-button`, `file-upload-trigger-text-missing`. `menu-trigger-not-a-button` stays.
- The changeset is `.changeset/as-replaces-render.md`: major for `@kvirn-ui/react` and `@kvirn-ui/rich-text` (`RichTextEditorState` left its exports). `@kvirn-ui/testing` has no `render` API.
- RSC rule in `architecture.md`: a string and a client-component `as` cross from a Server Component; a separate server-safe entry is a possible later step, not promised.

## Risks

- A target component that ignores `ref` or drops props: the dev warnings stay, and the docs say what a target must do.
- Function-form users of `state` (tabs-page `isSelected`, Alert and Card stories, Listbox option state) move to `data-*` styling or the hook; each batch records what it changed.
- Mid-plan the tree does not type-check as a whole: batches own disjoint files and use the final API above.

## Implementation decisions (T5, apps/docs)

- `AnchoredHeading` takes `Heading`'s props, so its `level` became `as`. `contract-sections-view` `Blocks` prop `headingLevel` became `headingTag: HeadingTag`. `PageHeading` keeps its API (no `level` prop of its own).
- Parts without `as` lost their `render` row and, where that left a part with no own props, its `*Rows` export and `props:` entry on the page. Ready-made `renamed()` (state-type renaming for Combobox/Autocomplete rows) was dead without state types and is removed.
- Tabs lazy-panel recipe uses a controlled `value` instead of the function-form `render`.
- `role="list"` next to `as="ul"` trips `jsx-a11y/prefer-tag-over-role` (5 examples); kept, since the a11y contracts ask for it. Open for the maintainer.
