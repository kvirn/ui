# Metaphor, naming and the inventory

## Choosing a metaphor

1. **Concrete beats abstract.** A house for home, an envelope for message. Abstract symbols (hamburger, kebab) only where they are already universal, and always with a visible label beside them.
2. **Stable over time.** Avoid objects that disappear from daily life as a metaphor for the action: floppy disk is acceptable for "save" only with the label; prefer the tray with a down arrow. A telephone handset is fine, a rotary dial is not.
3. **Neutral across the Nordics and the EU.** Test against a resident in Tornio, Tromsø, Tallinn and Torremolinos. No hand gestures (thumbs, OK, wave), no mailboxes in a national style, no currency symbols (use `payment`/`invoice`), no religious or national symbols, no flags, no animals as a mascot. <!-- kv-lang-ok: Tromsø is a Norwegian place name -->
4. **People are neutral.** Head and shoulders only: no gender, no age, no ability stereotype. Use the standard accessibility symbol only where the service means exactly that.
5. **No text.** No letters, numerals or words inside an icon (1.4.5, and translation). Sign-language, text-size and language icons use shapes, not "A" or "EN". The exceptions: `bold`, `italic`, `underline` and `strike` are the B, I, U and S letterforms (Plan 0131), and `heading-1`…`heading-6` are the letter H and the numerals 1–6 (Plan 0133), because those symbols are the conventions every editor user knows (maintainer 2026-10-17). They don't extend to any other icon.
6. **One concept.** If it takes two sentences to say what it means, split it or drop it.
7. **Public-sector first.** Prioritise what e-services, municipalities and agencies actually need (forms, case status, appointments, benefits, permits, payments, health and social care, schools, waste, transport, emergencies, elections) over generic stock.
8. **Prove it against look-alikes** before adding: if a resident could confuse it with a neighbour at 16px, it is the wrong metaphor, not the wrong drawing.

## Names

- kebab-case, by meaning, English: `calendar`, `document-check`, `bell-off`.
- Pattern: `<object>` then `<object>-<modifier>` (`add`, `remove`, `check`, `search`, `off`, `edit`, `lock`). The modifier comes last.
- Direction is `back`/`forward`/`up`/`down`, never `left`/`right` (`arrow-back`, `chevron-forward`).
- Name the concept, not the shape or the brand: `delete`, not `trash`; `settings`, not `cog`; `home`, not `house-with-chimney`.
- No synonyms in the set. A synonym is an **alias** in the registry (`trash` → `delete`), listed in the inventory, not a second drawing.
- A modifier is only combined with a host that exists in the set. No modifier that appears on one host only.
- Names are public API once released: renaming is a breaking change.

## RTL decision per icon

Mirror (`mirrorInRtl`): arrows, chevrons, back/forward, undo/redo, list indent/outdent, text-align start/end, send (paper plane), reply, external link, sign-in/sign-out, a progress track pointing to the end.
Never mirror: check, close, add, status icons, search, clock and refresh (rotation is not language), chart, calendar, media play (a play triangle follows the media, not the script), objects held in a hand, anything depicting a physical object.
When unsure: don't mirror, and record why in the inventory.

## Taxonomy and indicative counts (about 160)

The first task of the library plan turns this into the named inventory in `docs/design/icon-library.md`. Counts are a budget, not a target; cut anything no component or e-service uses.

| Family                   | Count | Examples (meaning)                                                                                         |
| ------------------------ | ----- | ---------------------------------------------------------------------------------------------------------- |
| Direction and movement   | 14    | chevrons, arrows, expand/collapse, first/last, refresh, undo/redo, external                                |
| Actions                  | 18    | add, remove, close, check, edit, delete, copy, paste, save, share, print, download, upload, search, filter |
| Status and feedback      | 10    | info, success, warning, error, help, pending, in-progress, blocked, new, attention                         |
| Interface controls       | 14    | menu, more, settings, sort, view-list/grid, eye/eye-off, lock/unlock, zoom in/out, fullscreen, drag        |
| Documents and files      | 14    | document, form, folder, attachment, image, table, certificate, archive, signature, receipt, stamp          |
| Communication            | 10    | message, mail, phone, chat, notification (bell/off), megaphone, contact, feedback                          |
| People and identity      | 12    | person, people, person-add, account, id-card, key, shield, verified, family, guardian, accessibility       |
| Time and date            | 8     | calendar, clock, schedule, deadline, history, timer, event, repeat                                         |
| Places and buildings     | 12    | home, city hall, school, hospital, library, court, police, fire, pin/location, map, building, door         |
| Money and case handling  | 10    | payment, invoice, tax, benefit, receipt, wallet, case, task, application, decision                         |
| Health and social care   | 8     | health, care, medication, emergency, vaccination, appointment, support, wellbeing                          |
| Learning and work        | 6     | education, book, job, certificate, training, workplace                                                     |
| Mobility and environment | 12    | car, bike, bus, train, parking, walk, waste, recycle, water, energy, tree, weather                         |
| Safety, law and civic    | 8     | law, vote, report, privacy, shield-check, quick-exit, alarm, rights                                        |
| Language and access      | 8     | language, text-size, contrast, read-aloud, captions, sign-language, easy-read, keyboard                    |
| Data                     | 6     | chart-bar, chart-line, chart-pie, trend-up/down, download-data                                             |

Total about 170 at the high end; the first release is the 25 existing plus what the components, patterns and docs need. Inventory columns: name, concept, family, keyline, metaphor, aliases, mirrors yes/no, label key, status (`proposed`, `drawn`, `reviewed`, `shipped`).
