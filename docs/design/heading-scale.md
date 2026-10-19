# Heading scale: a wider h1–h6 span and prose heading rhythm

Status: Approved (option A with a 14px floor for h6, maintainer, 2026-10-16). Plan: Plan 0125. No code changed by this spec.

## Brief

- **Who:** residents reading guidance pages (once, on a phone, maybe at 400% zoom or in a second language) and staff scanning long internal pages. Hardest case: a low-vision reader at 400% zoom, where the `< 40rem` sizes apply, who scans by heading shape.
- **Problem (maintainer):** h1–h6 look too similar. Today h3–h6 sit within 16–18px, and h4–h6 differ by weight and tracking only.
- **Input:** Tailwind Typography `prose` (base: h1 2.25em/1.11, mb .89em; h2 1.5em/1.33, mt 2em mb 1em; h3 1.25em/1.6, mt 1.6em mb .6em; h4 1em, mt 1.5em mb .5em). Used for ratios, not copied.
- **Constraints:** sizes in `rem` (1.4.4); `rem` media queries, no `vw`; 320px reflow with hyphenated compounds (1.4.10); unitless line heights (1.4.12); size never replaces the level (1.3.1), so `.kv-heading--*` stays independent of the tag; body, lead and colours untouched.
- **Assumption, not research:** a 2px-or-larger step plus a family, weight or tracking cue is enough to tell adjacent levels apart. Research question below.

## Prior art

- **Tailwind Typography:** sizes in `em` of the body, h1 = 2.25× body, about a 1.2 ratio from h4 up, h5–h6 unstyled. We keep its h1 (36px) and its top/bottom margins, which our tokens already match for h3 and h4.
- **GOV.UK Design System:** 48/36/24/19px on desktop, 32/24/18/16px on mobile. It compresses hard on phones, which we follow for display.

## Decision: option A, with h6 at 14px

Desktop is `40rem` and up (the `--kv-font-<role>-*` tokens); mobile is `width < 40rem` (the existing media query at `theme.css:467`). Weights and tracking are unchanged. **Bold** marks a change.

| Role      | Desktop size      | Mobile size            | Weight | Line height   | Tracking               | Prose margin top / bottom                                           |
| --------- | ----------------- | ---------------------- | ------ | ------------- | ---------------------- | ------------------------------------------------------------------- |
| display   | **3rem** (48)     | **2.25rem** (36)       | 600    | 1.2           | −0.01em; 0em on mobile | none: no element, `.kv-heading` sets no margins                     |
| heading-1 | **2.25rem** (36)  | **1.875rem** (30)      | 600    | 1.2           | 0em                    | 0 / **`--kv-space-8`** (32), was `space-6`                          |
| heading-2 | **1.875rem** (30) | **1.625rem** (26)      | 500    | 1.25          | 0em                    | `--kv-prose-space-section` (40; 32/48/64 by prose size) / `space-4` |
| heading-3 | **1.5rem** (24)   | **1.375rem** (22), new | 600    | **1.3** (1.4) | 0em                    | `space-8` (32) / `space-3` (12)                                     |
| heading-4 | **1.25rem** (20)  | 1.25rem, no step       | 600    | 1.4           | 0em                    | `space-6` (24) / `space-2` (8)                                      |
| heading-5 | 1rem (16)         | 1rem, no step          | 500    | **1.4** (1.5) | 0em                    | **`space-5`** (20), was `space-6` / `space-2`                       |
| heading-6 | **0.875rem** (14) | 0.875rem, no step      | 500    | 1.5           | 0.03em                 | **`space-5`** (20), was `space-6` / `space-2`                       |

Pixels assume a 16px root. Adjacent levels differ by at least 2px and a ratio of 1.1 or more at both widths, plus a weight or tracking cue where the step is small.

### Why this ratio

- **Top follows Tailwind:** h1 is 2.25× body, display 3× (Tailwind `prose-lg` h1, GOV.UK xl). About 1.2 (minor third) from h4 to h1: 20 → 24 → 30 → 36.
- **Bottom:** h4 → h5 is 1.25 and h5 → h6 1.14, so h4–h6 differ by size, not by weight alone.
- **Mobile compresses only the top four:** 14/16/20/22/26/30/36. h4–h6 never step down, as today.
- **Line height tightens as size grows** (1.5 → 1.2). Display and h1 stay at 1.2, not Tailwind's 1.11, so the ring on Å clears the descenders of the line above (DESIGN.md:175). <!-- kv-lang-ok: the letter is the subject of the line-height rule -->
- **Tracking:** only display on desktop (48px). h1 at 36px stays at 0, per the "below 40px no tracking" rule.

### Accessibility trade-off: a 14px h6 (approved)

DESIGN.md:160 says essential content is never below 1rem. h6 at 0.875rem breaks that rule. The maintainer accepted this trade-off on 2026-10-16 so that h4–h6 differ by size. WCAG 2.2 sets no minimum font size, so this is a house rule, not an SC. Mitigations:

- **h6 still holds up:** line height 1.5 (21px, unitless, so 1.4.12 overrides apply); `rem`, so it grows with the text size (1.4.4); 14px is narrower than every other role, so it adds no 320px overflow (1.4.10). Target size doesn't apply: a heading isn't a control. h6 is normal text, so the heading colour must keep 4.5:1. It already does, because `heading` is held to the `text` floors (DESIGN.md:130).
- **h5 is at the body size (16px).** Three cues tell it apart from body text: the serif family, weight 500 against 400, and its 20px top margin. h6 has a fourth cue, 0.03em tracking.
- **Guidance stays:** resident-facing text stops at h3 where it can, so the 14px level carries no essential content. In `--small` prose, h6 is the body size (14px). In `--large` and up, h5 and h6 are smaller than the body.

### Margins: unit and why

- **`rem` space tokens, not Tailwind's `em`.** Prose sizes swap `--kv-prose-space-*` tokens while headings keep their roles. `em` margins would follow the heading role, not the prose size, and would leave the 4px grid. `rem` still follows the user's text size.
- Our tokens already equal Tailwind's px for h3 (32/12) and h4 (24/8). h1's bottom margin grows to Tailwind's 32px for the 36px h1. h5–h6 tighten to 20px, so top margins step down by level: 40 → 32 → 24 → 20 → 20. Each heading sits 2.5–4× closer to its own content than to the content above.
- h2's top stays on `--kv-prose-space-section`, so it still scales with the prose size. Margins don't change below 40rem. `:is(h1…h6, hr) + *` at `theme.css:3325` stays.

### Before / after (px at a 16px root)

| Role      | Before desktop / mobile | After desktop / mobile | Before ratio to next | After ratio to next |
| --------- | ----------------------- | ---------------------- | -------------------- | ------------------- |
| display   | 40 / 32                 | 48 / 36                | 1.43                 | 1.33                |
| heading-1 | 28 / 24                 | 36 / 30                | 1.27                 | 1.2                 |
| heading-2 | 22 / 20                 | 30 / 26                | 1.22                 | 1.25                |
| heading-3 | 18 / 18                 | 24 / 22                | 1.13                 | 1.2                 |
| heading-4 | 16 / 16                 | 20 / 20                | 1.0                  | 1.25                |
| heading-5 | 16 / 16                 | 16 / 16                | 1.0                  | 1.14                |
| heading-6 | 16 / 16                 | 14 / 14                | –                    | –                   |

The span from h6 to display goes from 2.5× to 3.4× on desktop and from 2× to 2.6× on mobile. h3 to h6 go from a 2px spread to a 10px spread.

### Alternatives rejected

- **A with a 16px floor** (h5 18, h6 16): the original proposal. It keeps DESIGN.md:160, but the maintainer chose the wider h4–h6 steps.
- **B, a pure 1.2 scale from 16** (16/20/24/28/32/40/48): h5 equals `lead` (20px), and a 40px h1 is too large for the 70ch measure.
- **C, Tailwind as is:** h4–h6 stay identical in size.
- **E, `em` margins:** see Margins.

## Accessibility notes

- 1.3.1: semantics don't change. The level comes from the tag, and `.kv-heading--<role>` picks the look. A bare `.kv-heading` still looks like heading-4, which is now 20px.
- 1.4.4 / 1.4.10: every size is in `rem`. At 320px the widest text is display at 36px. The 25-letter compound in the `.kv-heading` comment wraps at its hyphenation points or by `overflow-wrap: break-word`.
- 1.4.3: no colours change. 1.4.12: line heights stay unitless, and there are no fixed heights.

## Files that must change (plan 0125)

| File                                                                       | Change                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| -------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/theme/theme.css:317-354`                                         | New sizes: display, h1, h2, h3, h4 and h6 (h5 keeps 1rem). h3 line height 1.3. Rewrite the comment at :337-339: h4 to h6 step by size, and h6 at 14px is the approved exception.                                                                                                                                                                                                                                                                                                                                        |
| `packages/theme/theme.css:464-475`                                         | Mobile sizes: display 2.25rem, h1 1.875rem, h2 1.625rem, and a new h3 at 1.375rem. Update the comment: h4–h6 never step down.                                                                                                                                                                                                                                                                                                                                                                                           |
| `packages/theme/theme.css:2916-2973`                                       | h1 `margin-block: 0 var(--kv-space-8)`; h5 and h6 top margin `--kv-space-5`; replace the comment at :2945-2947; add `text-wrap: balance` to h3.                                                                                                                                                                                                                                                                                                                                                                         |
| `packages/theme/theme.css:3505-3511`                                       | `.kv-heading--heading-3`: add `text-wrap: balance`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| Size-token consumers outside headings                                      | Pin to `--kv-font-body-size`: `theme.css:3868` calendar heading, `map.css:460, 959` map titles, `patterns.css:680` logo name. The steps marker at `theme.css:3440` uses `--kv-font-body-large-size`. The dialog title at `theme.css:5596` uses `--kv-font-heading-3-size`, and so does the close-button calc at `:5658` (it uses the h3 line height too). The fieldset legend heading at `:6258` keeps h1. `patterns.css:277, 427` (logo name in the primary header, h2 and h1 sizes) are not decided: open question 1. |
| `DESIGN.md:159-175`                                                        | :160 records the approved h6 exception. :167 adds `heading-3` to the roles that step down on mobile. :171 becomes "Weight 600, except `heading-2`, `heading-5` and `heading-6` at 500". :173-174: h4–h6 are told apart by size; h5 is body-sized and h6 is 14px.                                                                                                                                                                                                                                                        |
| `packages/react/src/heading/heading.a11y.md:50`                            | "Levels 4 to 6 stay at 1rem" becomes: h4 1.25rem, h5 1rem, h6 0.875rem, with no step down. Say how h5 differs from body text (serif, 500).                                                                                                                                                                                                                                                                                                                                                                              |
| `apps/storybook/src/foundation/typography.stories.tsx:426-429, 449-453`    | The mobile list adds `heading-3`. The Heading levels text says h4–h6 differ by size, h6 is 14px, and h3 is the deepest level for resident text.                                                                                                                                                                                                                                                                                                                                                                         |
| `apps/storybook/src/components/heading/heading.stories.tsx`                | No text change. Check the Sizes story visually.                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `apps/storybook/.storybook/preview.css:603`                                | `.kv-story-text-heading-2` grows with h2. Check the story chrome.                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `apps/docs/components/heading-page.tsx:120`                                | "h4 to h6 keep one size" becomes "h4 to h6 step down by size, to 14px for h6".                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| `docs/design/typography-ibm-plex.md:62-68`, `foundations-and-prose.md:169` | The role table and the prose h4–h6 row get the new values.                                                                                                                                                                                                                                                                                                                                                                                                                                                              |

## Open questions

1. `patterns.css:277, 427`: the logo name in the primary site header uses the h2 and h1 sizes, which would grow to 30 and 36px. Should it be pinned to today's 22 and 28px, or follow the scale?
2. Should h2 move to weight 600 now that size carries the hierarchy? This is out of scope and only noted here.

## Usability test plan (pending)

- **Task:** on a guidance page at 320px and at 400% zoom, find the section about X and say which part it belongs to. Compare the before and after builds. Include one staff page that uses h5 and h6.
- **Participants:** 6–8 people: residents including low-vision users with magnification, screen-reader users (control: no visual change is expected for them), people reading in a second language, and 2 staff members.
- **Measure:** whether the parent section is named correctly, the time to find it, whether h4–h6 are named as different levels, and whether the 14px h6 can be read without zoom. Status: `pending`. No testing has happened.
