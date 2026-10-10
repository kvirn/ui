# Public-sector service patterns and heuristics

Evidence-based defaults for municipal and agency services. Deviate only with a reason written in the spec.

## Who we design for

| Group                                       | What it means for design                                                                                      |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Residents using a service once or rarely    | No learning curve. Explain each step, say what happens next, and show how long it takes                       |
| Older people and people with low vision     | 16px or larger text, strong contrast, zoom to 400% without loss, large targets                                |
| People with cognitive disabilities          | One thing per page, plain words, predictable layout, no time pressure, save and return, easy-to-read versions |
| Motor disabilities, tremor, switch or voice | 44px targets, no drag-only or precise gestures, visible labels that match the accessible name (2.5.3)         |
| Screen reader users                         | Real headings, landmarks, labelled fields, announced status, error summary with links                         |
| Second-language readers                     | Short sentences, common words, no idioms, a clear language switcher                                           |
| Finnish-Swedish and Nynorsk readers         | Content exists in their language. Longer strings, special letters and `lang` on language links                |
| Phone-only users on slow connections        | Mobile first, light pages, nothing that fails when a request is slow                                          |
| Case workers and staff                      | Speed, density, keyboard shortcuts with visible equivalents, and the same AA bar                              |
| People in a stressful situation             | Calm tone, no blame, clear deadlines, a human contact route                                                   |

## Service patterns

- **Start page.** What the service is for, who can use it, what you need before you start (ID, documents), how long it takes, and one "Start now" button. Mention other ways to apply (phone, visit).
- **One thing per page.** One question, or one closely related group (an address), per page. The question is the page's `h1` or the `legend`.
- **Question pages.** Label or legend is the question, a help text explains the format, and inputs are sized to the answer. Use `autocomplete` for personal data (1.3.5, 3.3.8).
- **Don't ask what you already know.** Prefill from login (BankID, Suomi.fi, ID-porten) and earlier answers (3.3.7), and let the user correct it.
- **Validation.** Validate on submit, not on every keystroke. Show an error summary at the top with links to fields, and an inline message above each invalid field. Keep what the user typed.
- **Check your answers.** A summary list of every answer with a "Change" link per row, which returns to the summary afterwards. Required before any legally binding submit (3.3.4).
- **Confirmation page.** A clear success panel, the reference number (in `numeric`, easy to copy), what happens next, when, and how to get in touch. Offer a receipt by email if the service has one.
- **Save and return.** Any service longer than a few minutes lets the user save and continue later.
- **Timeouts.** Warn at least 2 minutes before a session expires, with a way to extend it, and never lose entered data silently (2.2.1).
- **Step indicator.** "Step 2 of 5" in text, plus the step name. Back links go to the previous step and keep answers.
- **Language switcher.** Each language named in its own language ("Svenska", "Suomi", "Norsk"), with `lang` and `hreflang`, in the same place on every page.
- **Help.** Contact and help in the same place on every page (3.2.6).
- **Accessibility statement and feedback.** Linked from every page's footer (WAD). Use the `regulations` skill.
- **Login entry.** National eID buttons use the provider's official naming and wording. No CAPTCHA or cognitive test (3.3.8).
- **Search.** A labelled search field, a visible button, and the result count announced and shown as text.
- **Tables for staff.** Sortable, filterable, with a visible column header, a sticky header that never hides focus, and row actions reachable by keyboard.

## Heuristics to check against

1. **Visibility of system status.** Every action gets feedback: loading, saved, sent, failed.
2. **Match the user's language.** Use the words residents use, not the department's internal terms.
3. **User control.** Back, change, cancel and undo are always available. Nothing destructive without confirmation.
4. **Consistency.** Same thing, same name, same place, same look (3.2.3, 3.2.4).
5. **Error prevention.** Constrain inputs, explain formats up front and confirm before submit.
6. **Recognition over recall.** Show earlier answers and options instead of asking the user to remember them.
7. **Flexibility.** Staff tools support shortcuts. Resident services stay linear and simple.
8. **Minimalist design.** Every element earns its place. Remove before adding.
9. **Recover from errors.** Plain-language errors that say how to fix the problem.
10. **Help and documentation.** Inline help texts first, then a consistent help link, then a human.

## Inspiration (verify before citing)

- GOV.UK Design System and Service Manual: patterns, research-backed content guidance.
- Designsystemet (Digdir, Norway): Nordic public-sector components and tokens.
- Suomi.fi design system: Finnish public-sector components and content in fi, sv and en.
- Nordic plain-language guidance: Språkrådet (SE and NO), Kotus (FI), Selkokeskus (FI) for easy-to-read.
