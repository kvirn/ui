---
name: storybook-docs
description: How KvirnUI documents a component in Storybook — the Docs page is prose from the package docs, "Show code" is the code documentation, and one Foundation page says which container to use. Use when writing or reviewing a component's stories, Docs page or fixtures.
when_to_use: add story, write a Docs page, stories for a new component, "Show code" shows a wrapper, docs repeat each other, review stories
---

# Storybook docs

**The code is the docs.** An adopter learns a component from examples that run, and from the code that makes them. Plain-text code blocks in prose duplicate that and drift. Rules from ADR-0023 (revised 2026-10-02).

## The Docs page

- **Opens with prose** from the package docs: `packages/react/src/<name>/<name>.md`, through `usageGuide` (`apps/storybook/src/docs-source.ts`). `meta.parameters.docs.description.component = usageGuide(guide)`, with `import guide from '<path>/<name>.md?raw'`.
- `usageGuide` drops the title, the draft note, **every fenced code block**, and the sections `Your own look`, `Classes for the default theme`, `Hook` and `Which container to use`. Theming and the hook get their own pages later. So write the package `.md` with that in mind: prose sections that stand without their code.
- Then `Primary`, the controls, the contract's Keyboard section (`parameters.a11yContract`), and the stories. A component with no focusable part has no `Keyboard` story.
- **Say each thing once.** The "Section, Card, Notification or a surface token: when to use which" table lives only on the Foundation page `apps/storybook/src/foundation/containers.mdx`. Link to it from a Docs page or story (`?path=/docs/foundation-containers-and-status--docs`), never copy it. The same goes for any cross-component guidance: one Foundation page, links elsewhere.

## "Show code" shows what an adopter writes

- A story that renders the component inline (`args`, or JSX in `render`) needs nothing: Storybook shows that markup.
- A story whose `render` is a **fixture component** (`<DeadlineNotification locale="sv" />`) would show that wrapper, which says nothing. Give it `parameters: showSource('<name>/<name>.fixture.tsx', 'FunctionName', …)`. It shows the fixture function's own source, read from the file, so it can't drift. A good fixture function is the example: the real `Notification.Info` with its Title and Body, readable on its own.
- So write fixtures to be read: one exported function per example, the component usage visible, localisation plumbing at the top and nothing else clever. Name the function after the example.
- Never hand-write a code string for a story. It will drift.

## Stories fill gaps

- Add a story only if it shows something the others don't: a state, a composition, a hard case (long Finnish text at 320px, RTL, forced colours), a way to build your own. Don't add one to have one.
- One-line JSDoc per story says what it shows and when to use it.
- Every state gets axe in the four theme projects, and the e2e covers reflow, forced colours and the keyboard rows (testing skill).
- Strings in the story are real: a sentence a resident would read, in sv by default, with the locale toolbar switching them.

## Checklist

1. The package `.md` reads as prose without its code blocks.
2. `meta` has `a11yContract` and `description.component = usageGuide(guide)`.
3. Every story with a fixture `render` has `showSource`.
4. No table or paragraph copied from another page: a link instead.
5. No story that repeats another.
