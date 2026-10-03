# APG pattern map

Source: https://www.w3.org/WAI/ARIA/apg/patterns/. Re-check the live page before implementing, because APG gets updated. Full key tables, and the APG keyboard practice that applies to every pattern, are in the `keyboard` skill: `.claude/skills/keyboard/references/key-tables.md`.

| KvirnUI component   | APG pattern                     | Key notes                                                                                                                             |
| ------------------- | ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Button, Toggle      | Button                          | Native `<button>`. Toggle uses `aria-pressed`. Space and Enter activate                                                               |
| Checkbox            | Checkbox                        | Native input where possible. Mixed state uses `aria-checked="mixed"` / `indeterminate`                                                |
| RadioGroup          | Radio Group                     | Arrows move and select, and wrap. Tab goes to the checked item, or the first if none                                                  |
| Switch              | Switch                          | `role=switch` + `aria-checked`, or `<button>`. The label doesn't change when the state changes                                        |
| Disclosure          | Disclosure (Show/Hide)          | `<button aria-expanded aria-controls>`. `<details>` is acceptable if the styling allows                                               |
| Accordion           | Accordion                       | Headings wrap the buttons. Optional arrow and Home/End navigation between headers                                                     |
| Dialog, AlertDialog | Dialog (Modal), Alert Dialog    | Prefer `<dialog>.showModal()`. Set background `inert`, Escape closes, restore focus. AlertDialog focuses the least destructive action |
| Popover             | – (non-modal dialog)            | No trap. Escape and outside click dismiss. Return focus when appropriate                                                              |
| Tooltip             | Tooltip                         | Appears on hover and focus. Escape dismisses. Hoverable and persistent (1.4.13). Never for essential info                             |
| Menu, MenuButton    | Menu Button, Menu               | **Only** for app-style command menus. Arrows, typeahead, Home/End. Escape closes and returns focus                                    |
| NavigationMenu      | Disclosure Navigation (example) | **Not** `role=menu`. Buttons with `aria-expanded` and plain links                                                                     |
| Tabs                | Tabs                            | Arrows between tabs. Automatic activation unless panels load slowly (document which). Tab moves into the panel                        |
| Listbox, Select     | Listbox, Select-Only Combobox   | Single and multi-select. Typeahead. `aria-selected`                                                                                   |
| Combobox            | Combobox (ARIA 1.2)             | `role=combobox` on the input with `aria-expanded`, `aria-controls` and `aria-activedescendant`. Announce the result count             |
| Toast               | – (status / alert)              | Polite `role=status`. No auto-dismiss for actionable toasts (2.2.1). Pausable                                                         |
| Breadcrumb          | Breadcrumb                      | `<nav aria-label>` + `<ol>`. Current page gets `aria-current="page"`                                                                  |
| Pagination          | –                               | `<nav aria-label>`. Current page gets `aria-current="page"`. Targets of at least 24px                                                 |
| Slider              | Slider (+ Multi-Thumb)          | `aria-valuetext` for human values. Also provide an input or buttons (2.5.7)                                                           |
| DatePicker          | Date Picker Dialog, Grid        | Allow typed input as well. Monday week start. Localised `aria-label` on days                                                          |
| Stepper             | –                               | `<ol>` with `aria-current="step"`. Status in text, not colour only                                                                    |
| FileUpload          | –                               | A native `<input type=file>` button is always present. The drop zone is an enhancement                                                |
| Tree (future)       | Tree View                       | Only if needed. Tree views are hard for screen reader users                                                                           |
