# Roadmap & components

Component status moves `planned` → `alpha` (gates 1–6 pass) → `beta` (core AT set passed, ADR-0004) → `stable` (API frozen). Update the status here when it changes.

## Milestones

| Milestone                                                                                                       | Exit criteria                                                                                  |
| --------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| **M0 Foundation**: monorepo, Vite+, CI gates, Storybook, docs skeleton, core utilities, i18n and theme packages | All gates green on one real component (Button, Plan 0003). ADRs 0001–0004 accepted ✓           |
| **M1 Forms & basics**                                                                                           | All M1 components `alpha`                                                                      |
| **M2 Overlays & navigation**                                                                                    | M1 components `beta`                                                                           |
| **M3 Advanced inputs**                                                                                          | First conformance JSON published. Public 0.x on npm                                            |
| **M4 Public sector**: first blocks                                                                              | Pilot with one municipality                                                                    |
| **1.0**                                                                                                         | API freeze, LTS policy, disabled-user testing round, zero open A/AA defects, docs site audited |

## Primitives

| Component                                              | APG pattern                  | M   | Status  |
| ------------------------------------------------------ | ---------------------------- | --- | ------- |
| KvirnProvider (locale, dates, links, theme preference) | –                            | 0   | alpha   |
| VisuallyHidden, SkipLink, Announcer                    | –                            | 1   | planned |
| FocusScope, Portal, DismissableLayer                   | –                            | 1   | planned |
| Button                                                 | Button                       | 1   | alpha   |
| Toggle                                                 | Button                       | 1   | planned |
| Link                                                   | – (native `<a>`)             | 1   | alpha   |
| Field, Label, Description, ErrorMessage, Fieldset      | –                            | 1   | planned |
| Input, Textarea                                        | –                            | 1   | planned |
| Checkbox, CheckboxGroup                                | Checkbox                     | 1   | planned |
| RadioGroup                                             | Radio Group                  | 1   | planned |
| Switch                                                 | Switch                       | 1   | planned |
| Disclosure, Accordion                                  | Disclosure, Accordion        | 1   | planned |
| Dialog, AlertDialog                                    | Dialog (Modal), Alert Dialog | 2   | planned |
| Popover, Tooltip                                       | –, Tooltip                   | 2   | planned |
| Menu, MenuButton                                       | Menu Button                  | 2   | planned |
| Tabs                                                   | Tabs                         | 2   | planned |
| Listbox, Select                                        | Listbox                      | 2   | planned |
| Combobox                                               | Combobox (ARIA 1.2)          | 3   | planned |
| Toast                                                  | status / alert               | 3   | planned |
| Breadcrumb, Pagination                                 | Breadcrumb                   | 3   | planned |
| Slider                                                 | Slider                       | 3   | planned |
| DatePicker, Calendar                                   | Date Picker Dialog, Grid     | 4   | planned |
| Stepper                                                | –                            | 4   | planned |
| FileUpload                                             | –                            | 4   | planned |
| NavigationMenu                                         | Disclosure Navigation        | 4   | planned |

## Theme and docs

| Item                                                                     | Plan | Status                                                                                                 |
| ------------------------------------------------------------------------ | ---- | ------------------------------------------------------------------------------------------------------ |
| Default theme (`theme.css`: palette, tokens, Button and Link)            | 0005 | accepted (ADR-0013, ADR-0014, ADR-0017, ADR-0019); e2e, design review and accessibility review pending |
| Styled Storybook (`Components/*`, Theme toolbar with None, Introduction) | 0005 | prototype                                                                                              |
| Docs site (shell and the Button page)                                    | 0005 | prototype. The other pages come in Phase 2                                                             |
| Prose (`data-kv-prose`) and the lead and shadow tokens                   | 0006 | accepted (ADR-0018). The docs site's articles use it                                                   |
| Storybook Foundation section                                             | 0006 | in progress                                                                                            |

## Blocks (M4 and later)

| Block                       | Key requirements                                                       |
| --------------------------- | ---------------------------------------------------------------------- |
| Site header                 | Skip link, language switcher (`lang`), search, consistent help (3.2.6) |
| Site footer                 | Accessibility statement, contact, feedback                             |
| Accessibility statement     | SE, FI (fi+sv) and EU variants. NO links to uustatus.no                |
| Feedback form               | WAD Art. 7 feedback mechanism                                          |
| Consent banner              | Equal-weight choices, nothing pre-ticked, not a focus trap             |
| Form wizard + error summary | Step indicator, focus moves to the summary on submit, 3.3.7            |
| Search + results            | Result count announced                                                 |
| Login entry                 | BankID, Suomi.fi, ID-porten buttons. 3.3.8                             |
