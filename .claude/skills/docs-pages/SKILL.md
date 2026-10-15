---
name: docs-pages
description: How a KvirnUI component page on the docs site (apps/docs) is written and audited - the one template every page follows, plain language for non-technical readers, checking every claim against WCAG 2.2, the APG, EN 301 549 and the EU directives, and examples that are real, runnable public-sector cases. Use when writing, rewriting or auditing a component page.
when_to_use: docs page, component page, audit the docs, check a claim, plain language, non-technical reader, use case, example on the docs site, When to use it, What you need to do, WCAG success criteria on a page, Known issues on a page
---

# Docs pages

A component page is read by a product owner, a content editor or an accessibility specialist at a municipality, not only by a developer. It must be **true** (every claim has evidence), **plain** (a reader who doesn't code can follow it) and **useful** (the examples are the cases they will build).

The template is [references/component-page-template.md](references/component-page-template.md). The Button page (`apps/docs/components/button-page.tsx`) is the reference implementation; [docs-component-page.md](../../../docs/design/docs-component-page.md) owns the visual design of the blocks (notes, Example Card, tables).

## Where each part comes from

| Page part                                                    | Source file                                                          | Who may change it                                                        |
| ------------------------------------------------------------ | -------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| Title, description, status, package, pattern, When to use it | `apps/docs/components/<name>-page.tsx`                               | docs-writer                                                              |
| Example and use cases                                        | `apps/docs/examples/<name>/*.tsx`, `texts.ts`                        | docs-writer                                                              |
| Accessibility, Keyboard, Known issues, Announcements         | `packages/*/src/<name>/<name>.a11y.md` (the contract)                | docs-writer for wording only; a changed claim goes to component-engineer |
| API reference                                                | `apps/docs/content/<name>.api.ts`                                    | docs-writer, verified against `<name>.tsx` and `use-<name>.ts`           |
| Template order, header facts, section titles                 | `component-page.tsx`, `contract-sections-view.tsx`, `messages/en.ts` | component-engineer (a template change, not a page change)                |

The summary sentence comes from `componentPages` in `site-sections.ts`; status words from `docs/roadmap.md`.

## Procedure, per component

1. **Read** the page, its examples, its `.api.ts`, the contract, the component and its tests. Nothing else.
2. **Analyse** the component against three bars (below): WCAG 2.2 AA, EU regulation and good accessible UX. The result is a gap table, and it decides what the page must say.
3. **List the claims.** Every sentence that states a fact is a claim: a behaviour ("Escape closes it"), a WCAG mapping ("meets 2.4.7"), a regulation ("helps you meet the EAA"), an AT result ("works in NVDA"), a status.
4. **Verify each claim** against its source (table below). Record a verdict: `OK`, `fixed` (wording was wrong, the fact was right), `wrong` (the fact is wrong: report, don't paper over), `unverified` (no evidence: remove it or mark it `pending`).
5. **Check the template** (the checklist in the template file): order, every required section, no empty heading.
6. **Check the examples**: each runs, uses only props in the `.api.ts`, meets the contract's "What you need to do" itself, uses fixture text from its own `examples/<name>/texts.ts` (`defineExampleTexts`; the shared `example-texts.tsx` is legacy, don't add to it), and is a real case (below). Shared data files such as `examples/listbox/data.ts` are read, not edited: a change there touches other pages.
7. **Add the notes** the gap table calls for (Notes, below).
8. **Ask an expert** when the analysis needs a judgement you can't settle from the sources (below). Don't guess.
9. **Rewrite for plain language** (below), without changing what any sentence claims.
10. **Report** in the format the agent definition sets.

## Analysis: the three bars

Ask of the component, and of what the page tells people to do with it:

| Bar                | Go through                                                                                                                                                                                                                                                                  | A gap is                                                                                                                                                                                   |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| WCAG 2.2 AA        | Every one of the 55 A and AA criteria in `.claude/skills/accessibility/references/wcag-22-checklist.md`: does it apply, does the component meet it (contract + named test), or must the adopter do something                                                                | An applicable criterion that is neither met by the component nor in "What you need to do"                                                                                                  |
| EU regulation      | `docs/compliance.md` and the `regulations` skill: EN 301 549 (chapter 9 is WCAG; also chapter 12, documentation: the page itself must describe the accessibility features and be accessible), the WAD and national laws for the public sector, the EAA for private services | Something an adopter needs to know to meet them that the page doesn't say: what goes in their accessibility statement (a Known issue), a feedback need, a setting that must stay available |
| Good accessible UX | `DESIGN.md`, the `design` skill and the closest spec in `docs/design/`: plain labels, errors that say how to fix them, no disabled control without a reason, no time limits, works at 320px and 400% zoom, one thing per page for residents                                 | A use case or recommendation that passes WCAG but would trip up a resident under stress or in their second language                                                                        |

Write it as a table in the report: `requirement | component does | adopter must | page says it | action`. Every gap becomes one of: a line in "What you need to do", a Known issue, a note, a use case, or a finding for component-engineer. Don't add a criterion to the page that the component doesn't contribute to.

## Asking an expert

You can't start other agents. Put the question in your report under `ASK`, and the orchestrator asks the expert and sends you the answer:

- `accessibility-reviewer`: whether a criterion applies, whether a behaviour meets it, an APG question, what a screen reader would announce.
- `ux-designer`: whether a use case is the right one, wording for residents, a better example, a note that would help.

One line per question: the expert, the question, what you looked at, and what's blocked until the answer. Finish everything that isn't blocked first.

## Notes: help people get it right

Notes are the `Note` component (`apps/docs/components/note.tsx`), the library's own Alert. Use them to help the reader meet the requirements, not to decorate:

| Kind       | Shows as            | Use for                                                                                                                                                        | Example                                                                                                                                    |
| ---------- | ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `reminder` | Don't forget        | An adopter task from "What you need to do" whose omission fails a WCAG criterion. Put it where the reader does the task: in the use case, or under the section | "Give the dialog a title. Without one, a screen reader user hears only 'dialog' and doesn't know what it's for (4.1.2 Name, Role, Value)." |
| `tip`      | Did you know?       | A true, non-obvious fact that saves work or helps compliance                                                                                                   | "Anything on this page's Known issues list belongs in your accessibility statement, with the workaround."                                  |
| `recipe`   | Implement like this | The recommended way when there are several, with at most one short code block                                                                                  | "Put the error text above the field and link it with the Field, so it's read with the label."                                              |

- Every reminder and tip names its evidence: a criterion, the contract or `docs/compliance.md`. A note never states a new rule the contract doesn't have.
- Every adopter task that fails WCAG when it's forgotten gets a reminder somewhere on the page.
- At most one note per h2 or h3 section, never two in a row, never in a table, at most three sentences.
- A note under a section that comes from the contract goes in `ContractSectionsView`'s `notes` prop, keyed by the section id (`what-you-need-to-do`, `visual-and-modes`, `focus`, `keyboard`, `known-issues`, …): `<ContractSectionsView contract={contract} notes={{ 'what-you-need-to-do': <Note kind="reminder">…</Note> }} />`. A note for a section the page doesn't render throws in development.

## Verifying a claim

| Claim kind                | Verify against                                                                                                                             | Pass when                                                                                                                                                                                                                                                                                     |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Behaviour, key, focus     | The component code and a named test in `<name>.test.tsx`                                                                                   | A test proves it. Code alone is `unverified`                                                                                                                                                                                                                                                  |
| WCAG success criterion    | `.claude/skills/accessibility/references/wcag-22-checklist.md`, then the W3C Understanding page (`w3.org/WAI/WCAG22/Understanding/<slug>`) | Number, name and level are right, the SC applies to this component, and the page says what the component does toward it, not that it "meets" it alone                                                                                                                                         |
| APG pattern and keys      | `.claude/skills/accessibility/references/apg-patterns.md`, then `w3.org/WAI/ARIA/apg/patterns/<name>/`                                     | Pattern name matches; every deviation is in the contract's Deviations with approval                                                                                                                                                                                                           |
| EU or national regulation | `docs/compliance.md` and the `regulations` skill; primary sources (EUR-Lex, ETSI) for anything new or dated                                | Approved wording only. WAD = Directive (EU) 2016/2102, EAA = Directive (EU) 2019/882, EN 301 549 as in `docs/compliance.md`                                                                                                                                                                   |
| Assistive technology      | The contract's AT test record and `docs/accessibility.md` "When a row passes"                                                              | `pass` only with both the agent check (named tests that re-run) and the human check (person, date, versions); `agent-verified` is shown as that, never as tested with the AT                                                                                                                  |
| Status                    | `docs/roadmap.md`, then the page's `status` prop and the contract's Status line                                                            | The roadmap wins. The page uses its word; a contract Status line or a roadmap entry that isn't one of the status words (`alpha-candidate`, `alpha`, …) is a finding for the orchestrator, never a guess. Only `alpha` and later claim an independent review, only `beta` and later AT testing |

Never write "compliant", "certified", "fully accessible" or "guarantees". A library helps; conformance belongs to the finished site.

## Contract wording checklist

Most of an audit is the contract's wording, because the page shows it. In every section that renders on the page:

- No internal references: no "Plan NNNN", skill names, file paths or "hard rule N". The reader can't follow them.
- No token names or pixel values in Visual and modes. Write the threshold and who it helps: "the focus ring has at least 3:1 contrast against its background", not `--kv-focus-ring` or `2px`. System colours (forced colours) are described by what they do: "uses the system's text and highlight colours".
- A non-English string gets an English gloss: "Inga träffar" (No matches).
- Every WCAG criterion is number, name and level: "1.4.11 Non-text Contrast (AA)". AAA criteria are marked AAA and are never counted toward the AA bar.
- A relative link in a contract doesn't render as a link today. Don't rely on it: name the page in words.
- Before a batch of audits, grep every contract once for API words that no longer exist (`isSelected`, "`render` state", `asChild`) and hand the hits to component-engineer in one brief.

## Plain language

The reader is clever and busy, may not code, and may read English as a second language.

- Short sentences, about 20 words at most. One idea each. Active voice, and "you" for the reader.
- Say what happens to the person using the service first, then how: "Someone using only a keyboard can reach it" before `tabindex`.
- Explain a term the first time on the page, in a few words: _screen reader_ (software that reads the screen aloud), _focus_ (the part the keyboard is acting on), _assistive technology_. No unexplained acronyms except WCAG.
- Code words (`aria-describedby`, prop names) belong in code formatting and in the API and use-case code. In "When to use it" and "What it does for you", write the effect, not the attribute.
- A WCAG criterion is its number, its name and one sentence on what it means for people: "1.4.3 Contrast (Minimum): text is dark enough on its background to read."
- Cut what doesn't help a decision. No marketing, no "simply", "just", "easy".
- **Technical is fine; hard to follow is not.** Keep the precise term (`aria-live`, focus trap, roving tabindex) where it is the right word, and say what it means in plain words next to it. Never swap a correct term for a vague one.
- Everyday words over formal ones: "use" not "utilise", "so that" not "in order to", "needs" not "necessitates", "about" not "approximately". No idioms or metaphors ("out of the box", "under the hood", "first-class", "a11y"): a translation tool or a second-language reader gets them wrong.
- One word for one thing across the page. Don't alternate "dialog", "modal" and "popup" unless they are different things.
- Put the subject and verb early. Avoid long noun chains ("the form field error message association") and stacked negatives. Prefer a list or a numbered step to a sentence with three "and"s.
- Say who does what: "You give the dialog a title" beats "A title must be provided".
- **Read-aloud test** before you finish a section: if you stumble, or a sentence needs a second read, split it or reword it. Headings say what the section answers ("When should I use this?"), not what it is called internally.
- Words: DESIGN.md "Words we use" wins.

## Real examples

- **Main example:** the component alone, with its defaults.
- **Use cases:** at least 2, no upper limit, most common first, each a task from a Nordic or EU public service: applying for a permit, booking a time, reporting a fault, a staff list of cases. Not "Example 1" or lorem ipsum.
- Each has a title that names the task, a description of when and why to use it (one or two plain sentences), the running example and its code. At most one note.
- A use case shows something the main example doesn't. Two cases that differ by one prop are one case.
- An example that waits (saving, loading) shows what is happening in words, and the contract's paired part (a Progress for a busy Button). An example with an error or a disabled control shows its error or its reason.
- An example is accessible on its own: labelled, with its error text and its reason for a disabled control, so copying it doesn't copy a defect.
