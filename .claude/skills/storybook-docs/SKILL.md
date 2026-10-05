---
name: storybook-docs
description: How KvirnUI documents a component in Storybook — the Docs page template (name, description, main example with every option, API, keyboard, notes, examples), prose from the package docs, and "Show code" as the code documentation. Use when writing or reviewing a component's stories, Docs page, package docs or fixtures.
when_to_use: add story, write a Docs page, story template, docs template, main example, document the API, keyboard docs, argTypes, controls, stories for a new component, "Show code" shows a wrapper, docs repeat each other, review stories
---

# Storybook docs

**The code is the docs.** An adopter learns a component from examples that run, and from the code that makes them. Plain-text code blocks in prose duplicate that and drift.

## The Docs page template

Every component's Docs page has these seven parts, in this order. The page layout is fixed in `apps/storybook/.storybook/preview.tsx` (`docs.page`). You fill it from two files: the package docs `packages/react/src/<name>/<name>.md` and the stories file.

| #   | Part             | What it says                                                                                           | Where it comes from                                                              |
| --- | ---------------- | ------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------- |
| 1   | **Name**         | The component's name                                                                                   | `meta.title`, `Components/<Name>`                                                |
| 2   | **Description**  | What it is, when and where to use it, and what to use instead when it's the wrong choice (a link)      | The `.md` lead: the prose between the title and the first `##`                   |
| 3   | **Main example** | The component with **every API option exposed** as a control                                           | The first story, `Default`, with `meta.args` and `meta.argTypes`                 |
| 4   | **API**          | Every option, part, state and class the component has                                                  | The controls (`argTypes` descriptions), then the `.md`'s `## API` section        |
| 5   | **Keyboard**     | How to reach and operate it: the focus strategy, then every key and what it does, right after the API  | The `## Keyboard` section of `<name>.a11y.md`, through `parameters.a11yContract` |
| 6   | **Notes**        | Anything else worth knowing: pitfalls, how it combines with others, when not to use an option          | The `.md`'s other `##` sections, as prose                                        |
| 7   | **Examples**     | One story per use case, state or hard case. Each story's "Show code" is how an adopter should write it | The other stories                                                                |

### 1–2. Name and description

- `meta.title` is `Components/<Name>`.
- The `.md` opens with one to three sentences, then the bullets that define it: what it renders, when to use it and where (a form, a page header, a dialog), and the alternative when it's the wrong choice (`For navigation, use [Link](../link/link.md)`).
- The stories file passes it: `meta.parameters.docs.description.component = usageGuide(guide)`, with `import guide from '<path>/<name>.md?raw'`. `usageGuide` (`apps/storybook/src/docs-source.ts`) drops the title, the draft note, **every fenced code block** and the sections `Your own look`, `Classes for the default theme` and `Hook`. So write prose that stands without its code. `splitUsageGuide` then splits it into the lead, `## API` and the notes.

### 3. Main example: every option exposed

- The first exported story is `Default`, and Storybook shows it as the main example. It renders the component the way most adopters will, with real Swedish text.
- **Read `<name>.tsx` and its hook before you write it.** Every prop the component and its parts accept gets an entry in `meta.argTypes` with a `control` and a one-line `description` (what it does, the default, which class or attribute it sets). That includes the theme's modifier classes (as a `select` on `className`), boolean props, enums (`inline-radio`), and strings. Props a control can't drive (`render`, refs, handlers) get `control: false` and a description, and handlers get `fn()` in `args`.
- `meta.args` holds the default value of every option, so the controls start at what an adopter gets with no props.
- A compound component (`X.Root` with parts): `meta.component` is `X.Root`, and `Default` has a `render` that composes every part, and maps args to the parts' props (`args.disabled` to the Trigger, for instance). Name these args after the prop they set, and list in `## API` which part takes each one.

### 4. API: nothing in the component goes undocumented

Before you finish, go through `<name>.tsx`, the hook and the core machine, and check that each of these is on the page, in the controls or in `## API`:

- every exported part (`X.Root`, `X.Trigger`, aliases) and the element it renders,
- every prop and option, with its type and default, and which part takes it,
- every `data-*` state attribute, the stable `kv-*` class and the theme's modifier classes,
- every message key (`messages` prop) and what it says by default,
- `render`, and what it must still render (the dev warning),
- anything the component does on its own: an id it generates, `aria-*` it wires up, focus it moves, an announcement it makes.

Write `## API` in the `.md` as tables and short bullets (see `announcer.md`). Don't repeat what an `argTypes` description already says: the table covers parts and the props the controls can't show. Keys belong in the Keyboard section, not in `## API`.

### 5. Keyboard: always right after the API

- Every Docs page has a Keyboard section directly under the API. It renders the `## Keyboard` section of `<name>.a11y.md` (the focus lines and the key table), so **every stories file passes `parameters.a11yContract`** (a `?raw` import). Without it the page has no Keyboard section, which fails the template.
- Never write keys by hand in the `.md`, an `argTypes` description or a story: the contract is the one source, and its rows are tested in the component test (`keyboard` skill).
- A component with no focusable part still gets the section: its contract says so, and the page shows "This component has no focusable parts and handles no keys."
- A component with a focusable part has a `Keyboard` story (an example) where readers can try the keys.

### 6. Notes

The `.md`'s other `##` sections (`## Component`, `## \`render\``, `## Strings`, …) are the notes. They explain choices and pitfalls in prose ("Prefer an enabled button that explains what's missing"). Their code blocks are for the package readers, and the Docs page drops them: the examples are the code.

### 7. Examples: the source is the usage

- Every story after `Default` shows one thing the others don't (see "Stories fill gaps").
- **"Show code" must be code an adopter can copy**: the real component and parts, real props, no story-only wrappers, no test plumbing. A story rendered inline (`args`, or JSX in `render`) is shown as written. A story rendered by a fixture uses `showSource` (below).
- Use the component the way the docs recommend: the variant class from the theme, a `Field` around a control, `aria-describedby` for a reason. An example never shows a pattern the Notes advise against, unless it's labelled as the thing to avoid.
- The one-line JSDoc above each story becomes its description: what it shows and when to use it.

### Skeleton

```tsx
import { Example } from '@kvirn-ui/react'
import contract from '../../../../../packages/react/src/example/example.a11y.md?raw'
import guide from '../../../../../packages/react/src/example/example.md?raw'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { usageGuide } from '../../docs-source.ts'

const meta = {
  title: 'Components/Example',
  component: Example,
  // 3. Every option at its default, so the main example starts where an adopter starts.
  args: { children: 'Spara', disabled: false, onChange: fn() },
  // 3–4. Every prop in example.tsx, with a control and what it does.
  argTypes: {
    className: {
      control: 'select',
      options: [undefined, 'kv-example--primary'],
      description: 'Joins `kv-example`. The theme styles `kv-example--primary`.',
    },
    disabled: { description: 'Natively disabled: skipped by Tab. Sets `data-disabled`.' },
    render: { control: false, description: 'Another element. It must still be a `<button>`.' },
  },
  globals: { locale: 'sv' },
  parameters: {
    a11yContract: contract,
    docs: { description: { component: usageGuide(guide) } },
  },
} satisfies Meta<typeof Example>

export default meta
type Story = StoryObj<typeof meta>

/** The main example: every option is a control below. */
export const Default: Story = {}

/** 6. One example per use case, written the way an adopter should write it. */
export const InAForm: Story = { render: (args) => <form>…</form> }
```

```md
# Example

> **Draft** (Plan NNNN). …

What it is in one sentence. When and where to use it. For <other need>, use [Other](../other/other.md).

- What it renders, and its defaults.
- …

## API

| Part | Renders | Props |
| ---- | ------- | ----- |

| State attribute | When |
| --------------- | ---- |

## Component

Notes in prose: choices, pitfalls, combinations. Code blocks here are for package readers only.

## Hook

…
```

### Also on every page

- A component with no focusable part has no `Keyboard` story.
- The Docs page uses `@storybook/addon-docs` with `tags: ['autodocs']`, and `apps/storybook/src/introduction.mdx` is the first page.
- **Say each thing once.** Cross-component guidance lives on one Foundation page, and Docs pages and stories link to it instead of copying it.

## "Show code" shows what an adopter writes

- A story that renders the component inline (`args`, or JSX in `render`) needs nothing: Storybook shows that markup.
- A story whose `render` is a **fixture component** (`<DeadlineAlert locale="sv" />`) would show that wrapper, which says nothing. Give it `parameters: showSource('<name>/<name>.fixture.tsx', 'FunctionName', …)`. It shows the fixture function's own source, read from the file, so it can't drift.
- **The shown function must contain the compound parts.** `Alert.Info` with its Title and Body, `Fieldset.Root` with `DateInput.Root`, `Field.Root` with `TextInput`: all written in the function, readable on its own. A function that renders another local component which holds the real markup (`<BirthDate />`, `<CasesView />`, `<ResultAlert />`) hides the API, so it fails this rule. Inline the parts, or show the function that has them.
- **No story-only plumbing in the shown code:**
  - no local wrapper component (`Contact`, `Duration`, `*Example`, `*Page`), and no `locale` prop on a wrapper that is shown as the example. A fixture shown by `showSource` may take `locale` as its own prop (as the `text-input` fixtures do) because the function is the example, with the text lookup at the top. An inline story reads the locale from `globals` and the `withFormLocale` decorator.
  - no `kv-story-*` layout wrappers, test counters or inline `style` for the preview: put them in a decorator or a `play`.
  - no hand-written code string (`parameters.docs.source.code`).
- **Storybook's source printer can't show function props or function children.** `Combobox.List`, `Listbox.List` (a render function child), `itemToString`, `onValueChange={(value) => …}` and the like print as `{function noRefCheck() {}}`. A story that has one is not rendered inline: it uses a `showSource` fixture whose function contains the real parts. So `meta.args` never holds a logging handler such as `fn()` or `logChange(…)` on a story that is shown inline (it prints as `() => {}`): drop it, or use a fixture.
- So write fixtures to be read: one exported function per example, the component usage visible, localisation plumbing at the top and nothing else clever. Name the function after the example. A state matrix (RTL, ForcedColors, Keyboard) is such a function too: its body is the real parts in each state, shown with `showSource`.
- Never hand-write a code string for a story. It will drift.

## Stories fill gaps

- Add a story only if it shows something the others don't: a state, a composition, a hard case (long Finnish text at 320px, RTL, forced colours), a way to build your own. Don't add one to have one.
- One-line JSDoc per story says what it shows and when to use it.
- Every state gets axe in the four theme projects, the component test covers the keyboard rows, and the display-mode sweep covers reflow and forced colours (testing skill).
- Strings in the story are real: a sentence a resident would read, in sv by default, with the locale toolbar switching them.

## Foundation pages

Cross-component guidance lives once on a Foundation page (`apps/storybook/src/foundation/`, titled `Foundation/<Name>`, Docs page only).

- **Reference pages are MDX with static tables:** Overview, Spacing, Radius, Borders & elevation, Focus ring, Motion, Density, Layout and Theming. The template is a title and lead, then `## Tokens` (tables), `## Usage`, `## Accessibility`, `## Customising` and `## Related`.
- **`tooling/foundation-docs/foundation-docs.test.ts` guards the tables.** Every token in a `## Tokens` table must exist on `:root` in `theme.css`, and the first code cell of its row must be its value (a `var()` resolved). A renamed or changed token fails `vp test run` instead of drifting.
- **Colors, Typography, Prose and KvirnProvider stay stories.** A single-story Foundation page uses `tags: ['!autodocs']` and names its story like its title, so Storybook hoists it.
- `remark-gfm` (a pinned dev dependency of `apps/storybook` only) enables tables, through `mdxPluginOptions`.
- MDX pages are not axe-tested, so review them by hand in the four themes.

## Maintainer preferences

- Stories follow the args-first convention (see the `testing` skill, `references/templates.md`).
- Cross-component guidance is said once on a Foundation page, never copied into Docs pages.

## Checklist

1. The page follows the template: name, description (what, when, where, the alternative), main example, API, keyboard, notes, examples.
2. `meta.parameters.a11yContract` is set, so the Keyboard section follows the API.
3. The package `.md` opens with the description, has a `## API` section, and reads as prose without its code blocks.
4. `meta` has `description.component = usageGuide(guide)`.
5. `Default` is the first story, and `meta.args` and `meta.argTypes` cover every prop in `<name>.tsx`, each with a description.
6. Every part, prop, `data-*` attribute, class and message key in the component is on the page.
7. Every example's "Show code" is how an adopter should write it: the real compound parts and hooks, no local wrapper, no `locale` prop on a shown wrapper, no `{function noRefCheck() {}}`, no hand-written source string. Every story with a fixture `render` has `showSource`, on a function that contains the parts.
8. No table or paragraph copied from another page: a link instead.
9. No story that repeats another.
