# Design review checklist

Use it for self-review before handoff and for reviewing stories, blocks and pages. Items marked **(B)** are blockers.

## Task and flow

- [ ] **(B)** The user can finish the task, including every unhappy path in the spec.
- [ ] The page's purpose and the next step are clear within five seconds.
- [ ] One primary action per view, in a consistent place.
- [ ] Back, change and cancel exist and keep the user's answers.
- [ ] Nothing asks for information the service already has (3.3.7).
- [ ] Timeouts warn and allow extending (2.2.1). Long services support save and return.

## Content

- [ ] **(B)** No hard-coded string. Every visible or announced string has an i18n key.
- [ ] Plain language: short sentences, common words, active voice, no internal jargon.
- [ ] Headings and buttons describe the task. Link text makes sense out of context (2.4.4).
- [ ] Errors say what went wrong and how to fix it, without blaming the user.
- [ ] Tested with the longest Finnish string and with Sámi letters.

## Visual (DESIGN.md)

- [ ] **(B)** Text contrast is at least 4.5:1 (7:1 in contrast themes). Control boundaries and focus are at least 3:1 (1.4.3, 1.4.11).
- [ ] **(B)** Nothing relies on colour alone (1.4.1).
- [ ] **(B)** Focus is visible on every interactive element: 2px ring, 2px offset (2.4.7, 2.4.13).
- [ ] **(B)** No essential text in `text-muted`, `body-small`, tooltips or images of text, except the help text under a control (`Field.HelpText`), which is `body-small` in the `text` colour and is never the only place essential information lives (the error repeats the format, and anything needed before answering is a 16px description).
- [ ] Only semantic tokens are used. New values have a measured contrast pair and the maintainer's approval.
- [ ] Controls use `border-control`, never `border-subtle`, as their edge.
- [ ] Typography follows the scale. Body text is 16px or larger, sentence case, and prose lines are no longer than about 70 characters.
- [ ] Spacing is on the 4px grid, radii match their element type, and elevation follows the table.

## Layout and modes

- [ ] **(B)** Works at 320px wide and at 400% zoom without horizontal scrolling, except inside data tables (1.4.10).
- [ ] **(B)** Survives the 1.4.12 text-spacing overrides. No clipped or overlapping text.
- [ ] **(B)** Targets are at least 44×44px in comfortable density and at least 24×24px in compact density (2.5.5, 2.5.8).
- [ ] **(B)** Focus is never hidden by sticky headers, footers or popups (2.4.11).
- [ ] Dark, light-contrast and dark-contrast themes all checked, not just light.
- [ ] Forced colours: boundaries and states are still visible.
- [ ] Reduced motion: no non-essential animation. Nothing flashes.
- [ ] RTL: logical properties, mirrored directional icons.

## Interaction and semantics

- [ ] **(B)** Every pointer action has a keyboard equivalent, and every drag has a single-pointer alternative (2.1.1, 2.5.7).
- [ ] **(B)** Visible label matches the accessible name (2.5.3). No placeholder-only labels.
- [ ] Heading outline and landmarks make sense on their own. Reading order equals focus order.
- [ ] Status changes (saved, sent, results count, errors) are announced via the Announcer.
- [ ] Hover or focus content is dismissible, hoverable and persistent (1.4.13).
- [ ] The pattern follows APG, or the deviation has the maintainer's approval and the `keyboard` skill is updated.

## Honesty

- [ ] **(B)** No compliance claim beyond "designed and tested to meet WCAG 2.2 AA".
- [ ] **(B)** Research and usability testing that hasn't happened is marked `pending` or as an assumption.
