# Design spec: Notification

- **Status:** Draft
- **Designer:** ux-designer agent · **Date:** 2026-10-02
- **Plan:** to be written (links this spec in its Design section) · **Related ADRs:** ADR-0007 (message overrides), ADR-0013 (classes, not props), ADR-0015 (`render`, `mergeProps`), ADR-0018 (prose on status backgrounds), ADR-0020 (its follow-up: "status panels (Notification) as their own component, not a card surface"), ADR-0021, ADR-0024 (icon registry), ADR-0028 (hyphenation), ADR-0029 (field error prefix), ADR-0039 (keyboard), ADR-0040 (Announcer), ADR-0044 (Section and Card). **New ADR to draft** (main session, _Proposed_, next free number, likely ADR-0046): "Notification: a status block whose status is a prop, with no role, announced through the Announcer" (§10)
- **Type:** new component (headless, with an icon, a status word and an optional announcement) + default-theme styling + DESIGN.md vocabulary and rule changes

The maintainer's framing, which this spec doesn't reopen: a status block is **its own component, not a variant of a container**. This spec decides the name, what is and isn't a Notification, its parts, its semantics and announcements, its look, its content rules, and the vocabulary that separates it from Surface, Section and Card.

## 0. Vocabulary (the words we use from now on)

People say surface, card, panel and notification for the same box. From now on each word means one thing, in DESIGN.md, the docs, Storybook, specs, ADRs and code comments.

| Word                | Means                                                                                                                                        | Is a component?                                | Never use it for                                                               |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- | ------------------------------------------------------------------------------ |
| **Surface**         | A background **colour token**: `canvas`, `surface`, `surface-raised`, and the `-subtle` backgrounds                                          | No. `var(--kv-color-surface)` in your CSS      | A box, a container or a component. "Put it on a surface" means "use the token" |
| **Section**         | A **region of the page**: a sidebar, a band. Elevation level 1, `surface`, square, no visible edge (ADR-0044, `docs/design/section.md`)      | `Section`                                      | A thing on the page, a status message                                          |
| **Card**            | **One entity** people read, compare or act on as a unit. Level 2, `surface-raised`, hairline edge, rounded (ADR-0020, `docs/design/card.md`) | `Card`                                         | A region, a form section, a status message, a box for looks                    |
| **Notification**    | A **status message** in the content: info, success, warning or danger. A `-subtle` background, a bar, an icon, a status word and a title     | `Notification` (this spec)                     | Decoration, emphasis, a quote, marketing, a field's own error                  |
| **Toast**           | A **transient** notification that floats over the page and goes away (roadmap M3)                                                            | Not yet                                        | Anything a user needs to complete the task                                     |
| **Error summary**   | The **block** at the top of a form after a failed submit: a danger Notification with links to each field, which takes focus (roadmap M4)     | A block, built on Notification                 | A single field's error                                                         |
| **Error message**   | The text under one invalid field (`Field.ErrorMessage`, ADR-0029)                                                                            | `Field.ErrorMessage`                           | A message about the page or the service                                        |
| **Alert**           | Only the ARIA role `alert` (an assertive live region) and the `AlertDialog` component (M2)                                                   | `AlertDialog`; the role lives in the Announcer | A component name for status blocks                                             |
| ~~Panel~~           | Retired. It was the level 1 container before the rename to Section                                                                           | No                                             | Anything. Say Section                                                          |
| ~~Banner, callout~~ | Not KvirnUI words. `banner` is the ARIA landmark for the site header                                                                         | No                                             | Anything. Say Notification (status) or Section (region)                        |

## 1. Brief

- **Users:** both.
  - Residents meet notifications at the worst moments: an application that didn't send, a deadline about to pass, a permit about to expire, a service that's down. Often once, often on a phone, often stressed, sometimes in their second language.
  - Staff see them every day in case tools ("Changes saved", "The case is locked by another officer"), in compact density.
  - Adopters' developers have so far had only `-subtle` tokens and a DESIGN.md sentence, so each builds their own status box, usually as a coloured Card, often with `role="alert"` on everything.
- **Hardest-case users, in order:**
  1. **A screen-reader user** (NVDA, JAWS, VoiceOver, TalkBack) who presses Send, and hears nothing when the send fails, or hears every status message on the page as an interruption when it loads.
  2. **A Windows Contrast Themes user** for whom every status colour becomes the same system colour, so red, green, amber and lavender are all `CanvasText`.
  3. **A low-vision resident at 400% zoom (320 CSS px)** with colour-vision deficiency, who sees part of the box at a time, and can't tell danger-red from success-green.
  4. **A resident with a cognitive disability, or reading Finnish as a second language,** under stress, who needs to know in one sentence what happened and what to do, with no timer and nothing that disappears.
  5. **A staff user in compact density** who sees ten saves an hour and must still notice the one that failed.
- **Job to be done:** When something happens that matters to what I'm doing, I want to see and hear what happened and what I can do about it, without losing my place, so I can finish my task or get help.
- **Context:** any device. In the content of a page, near what it's about. Present when the page loads, or inserted after an action.
- **Constraints:** headless packages ship no CSS (hard rule 5). No hard-coded strings: the status words are i18n keys in all six locales, overridable per provider and per instance (ADR-0007). Announcements only through the shared Announcer (ADR-0040). Only DESIGN.md tokens. No new runtime dependency.
- **Success criteria:**
  - 0 axe violations in every story, in the four themes, RTL and forced colours.
  - The status is in text in the accessibility tree of every story (a11y snapshot: the title starts with the status word).
  - A dynamic notification with `announce` puts its text in the polite (or assertive) region once (e2e), and a notification present at load puts nothing there.
  - The Root never has `role`, `aria-live` or `aria-atomic` (unit test).
  - The four statuses are told apart in forced colours by icon shape (screenshot review) and by text.
  - No horizontal scroll at 320px with the Finnish fixture, and nothing clipped under the 1.4.12 overrides.
  - In the usability test (§8): participants say what happened and what to do next for each example, and screen-reader users hear the dynamic ones.
- **Evidence:** none from users. Prior art is cited in §2.
- **Assumptions and research questions:**
  - Assumption: an icon shape plus a title that states the outcome is enough for sighted users, so the status word can be visually hidden (as `Field.ErrorMessage`'s "Fel:" is). → RQ: can participants with colour-vision deficiency, and Contrast Themes users, say which of four notifications is the error without reading the title? (Open question 3.)
  - Assumption: a polite announcement after Send is heard in time and isn't lost to the screen reader's own feedback on the button. → RQ: in the AT run, is "Fel: Vi kunde inte skicka din ansökan" heard after pressing Send, in NVDA, JAWS, VoiceOver (macOS, iOS) and TalkBack?
  - Assumption: residents don't look for a close button and aren't bothered that notifications can't be dismissed. → RQ: does anyone try to close one, and why? (Open question 5.)

## 2. Prior art

| Source                                                                                                                                                                                                                                                               | What we reuse                                                                                                                                                                                                                                           | What we change and why                                                                                                                                                                               |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| DESIGN.md Components ("Notifications use the `-subtle` background with a 4px inline-start border in the status colour, an icon, and a heading that states the status in words"), Colors (`primary-subtle` "info backgrounds"), Shapes (status icons differ in shape) | All of it: the four `-subtle` backgrounds, the 4px bar (`--kv-indicator-width`), the four status icon shapes, status never by colour alone                                                                                                              | "A heading that states the status in words" becomes a **title** that states the outcome, plus a **status word** that's always in the text. A title can be a `<p>` for a one-line notification (§6.3) |
| `Field.ErrorMessage` (ADR-0029): the `error` icon, the visually hidden `field.errorPrefix` "Fel:" in its own span, not a live region                                                                                                                                 | The pattern: a decorative icon, a status word in its own span at the start of the text, visually hidden by the theme and visible without it, overridable through `messages`                                                                             | The word goes in the **Title**, so heading navigation hears "Varning: …". Four keys, one per status                                                                                                  |
| Announcer (ADR-0040): `useAnnouncer()`, a polite and an assertive region already in the page, clear-then-set                                                                                                                                                         | Every announcement. The Notification never renders a live region                                                                                                                                                                                        | Opt-in per instance with `announce`, because the component can't tell "present at load" from "inserted after an action" (§7.2)                                                                       |
| [GOV.UK notification banner](https://design-system.service.gov.uk/components/notification-banner/)                                                                                                                                                                   | Three uses (a problem with the service, something that affects the user, the outcome of what they just did). Heading level is the consumer's (default 2). "Avoid showing more than one notification banner on the same page." Not for validation errors | GOV.UK uses `role="region"` for neutral banners and `role="alert"` plus focus for success. We use **no role**: no landmark per message, and focus or the Announcer for outcomes, never both (§7.2)   |
| [GOV.UK warning text](https://design-system.service.gov.uk/components/warning-text/)                                                                                                                                                                                 | A warning about consequences next to the action, an `aria-hidden` icon and a visually hidden "Warning"                                                                                                                                                  | Not a separate component: it's a warning Notification with only a Title rendered as `<p>` (Example C2)                                                                                               |
| [GOV.UK error summary](https://design-system.service.gov.uk/components/error-summary/)                                                                                                                                                                               | Top of `main`, heading "There is a problem", links to each field worded like the field's error, focus moves to it                                                                                                                                       | A separate **block** (M4) composed from a danger Notification (§3.3). GOV.UK nests `role="alert"` in it as well as moving focus. We only move focus, so it isn't read twice                          |
| [Designsystemet Alert](https://designsystemet.no/en/components/docs/alert/overview) (NO)                                                                                                                                                                             | The four statuses and names (info, success, warning, danger). A heading only when the message is longer than a sentence. Actions instead of a generic close icon. "Avoid multiple alerts on the same page"                                              | The name "Alert" (§3.1). Its `role="alert"` for critical and `role="status"` for informational messages: we never put a live role on the visible box                                                 |
| [Aksel LocalAlert and GlobalAlert](https://aksel.nav.no/komponenter/core/localalert) (NAV, NO)                                                                                                                                                                       | Local (near the event) versus global (top of the page) placement. Icons have default text per severity, read as part of the content                                                                                                                     | Aksel's LocalAlert has `role="alert"` by default and asks you to remove it where it's wrong. We choose the opposite default: nothing is announced unless the consumer asks (§7.2)                    |
| [WCAG 2.2 Understanding 4.1.3](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html), techniques ARIA22 and ARIA19                                                                                                                                       | Status messages that don't take focus must reach AT. A live region must exist before its content changes                                                                                                                                                | The Announcer's regions carry the message; the visible box has no role (§7.2, known risk listed)                                                                                                     |

No APG pattern for the visible block. APG's [Alert pattern](https://www.w3.org/WAI/ARIA/apg/patterns/alert/) is the `alert` live region, which the Announcer already provides, and APG warns that alerts shouldn't appear on load or disappear on their own.

## 3. Scope: what is a Notification, and what isn't

### 3.1 The name: Notification, not Alert

**Decision: `Notification`.**

- **It's already the word.** DESIGN.md (Components: "Notifications …", Cards: "status belongs in a notification"), ADR-0020's follow-up ("status panels (Notification) as their own component"), `card.md` §6.1 and `section.md` §6.1 and §6.9 all say Notification. Renaming would mean editing five places to introduce the ambiguity below.
- **"Alert" is a role, and it's assertive.** In ARIA and APG, `alert` is a live region that interrupts the user. A component called Alert invites `role="alert"` on everything, and most libraries ship it that way (Aksel's LocalAlert does, and asks you to remove it where it's wrong). Our default is the opposite: most notifications are on the page when it loads and must **not** be announced. The name shouldn't argue with the default.
- **"Alert" collides with `AlertDialog`** (roadmap M2), which is modal, takes focus and needs a response. A notification never does.
- **The cost:** "Notification" can suggest a push or OS notification, or something that goes away. The first sentence of the docs says what it is (§4.3), and the transient kind has its own name, Toast.

### 3.2 Related things, and which ones are this component

| Thing                                                                                         | This component?                                                                     | Relation                                                                                                                                                                                                                                                                                                |
| --------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A status message in the content, present at load or inserted after an action                  | **Yes**                                                                             | –                                                                                                                                                                                                                                                                                                       |
| GOV.UK "warning text": a consequence next to an action ("You can't change it after you send") | **Yes:** `status="warning"`, Title as `<p>`                                         | Example C2                                                                                                                                                                                                                                                                                              |
| Toast (M3): floats, goes away by itself                                                       | **No.** Separate component                                                          | It may reuse the `kv-notification` look and the same status words, and announce through the same Announcer (ADR-0040 follow-up). A Toast must never hold anything the user needs to finish the task, and never an error (2.2.1, 2.2.3). For residents, prefer an inline Notification                    |
| Error summary (M4 block)                                                                      | **No.** A block **built on** Notification                                           | `Notification.Root status="danger" tabIndex={-1}`, a Title "Det finns ett problem" / "There is a problem" (`h2`), and a Body with a list of Links to each field's `controlId`. The block moves focus to it on submit and doesn't set `announce`. Its link texts equal the fields' error messages (§3.3) |
| `Field.ErrorMessage`                                                                          | **No.** It stays the field's own part                                               | Shares the `error` icon and the status word idea. A Notification never replaces a field's error, and an error summary never replaces the field errors either: both are shown                                                                                                                            |
| "Inset text" (GOV.UK): a neutral aside, a quote, an example                                   | **No.** It's not a status                                                           | Plain content. A quotation is prose's `blockquote` (its `border-control` bar). A neutral aside has no component in this version (open question 11). Never a `-subtle` background                                                                                                                        |
| A modal confirmation, a timeout warning that needs a response                                 | **No.** `AlertDialog` / `Dialog` (M2)                                               | A session timeout warning (2.2.1) needs a response and focus, so it's a dialog                                                                                                                                                                                                                          |
| A status tag on an item ("Väntar på beslut")                                                  | **No.** A Badge                                                                     | Metadata on a thing, not a message                                                                                                                                                                                                                                                                      |
| A site-wide outage message at the top of every page                                           | **Yes**, placed at the top of `main` or just before it, outside the header landmark | Example A's pattern. One at a time                                                                                                                                                                                                                                                                      |

### 3.3 The error summary, built from a Notification (for the M4 block, not in this component)

Recorded here so the Notification's API fits it:

```
Notification.Root status=danger tabIndex=-1 ref=summaryRef     (focused once, on a failed submit)
  [icon: error, aria-hidden]
  Notification.Title (h2)   [Fel:] Det finns ett problem
  Notification.Body
    ul
      li > Link href=#<controlId>   Ange ditt personnummer i formatet ÅÅÅÅMMDD-XXXX
      li > Link href=#<controlId>   Välj minst en dag
```

- Focus moves to the Root on submit, which reads the title and lets the user Tab to the links. No `announce` (a focus move already reads it; both would read it twice).
- DESIGN.md's Error summary bullet says "`danger` border with `danger-subtle` background". This spec proposes the error summary uses the **danger Notification look** (the bar), so residents learn one look for "error about this page". Open question 4.

## 4. Content

### 4.1 Component strings (`@kvirn-ui/i18n`, all six locales)

The status word starts every Title. It includes its punctuation, like `field.errorPrefix`, so a locale controls it. `fi`, `nb` and `nn` are designer drafts for a translator to confirm. **`se` uses the English strings with `TODO(native-review)`, which blocks `beta`** (as `field.*` does today).

| Key                          | en             | sv             | fi (draft)  | nb (draft)     | nn (draft)     | se                    |
| ---------------------------- | -------------- | -------------- | ----------- | -------------- | -------------- | --------------------- |
| `notification.infoPrefix`    | `Information:` | `Information:` | `Tiedoksi:` | `Informasjon:` | `Informasjon:` | `Information:` (TODO) |
| `notification.successPrefix` | `Success:`     | `Klart:`       | `Valmis:`   | `Fullført:`    | `Fullført:`    | `Success:` (TODO)     |
| `notification.warningPrefix` | `Warning:`     | `Varning:`     | `Varoitus:` | `Advarsel:`    | `Åtvaring:`    | `Warning:` (TODO)     |
| `notification.dangerPrefix`  | `Error:`       | `Fel:`         | `Virhe:`    | `Feil:`        | `Feil:`        | `Error:` (TODO)       |

- **Why four new keys and not `field.errorPrefix`:** a site may want "Viktigt:" for danger notifications and keep "Fel:" for field errors. The values match today.
- **Overrides (ADR-0007), first match wins:** `<Notification.Root messages={{ warningPrefix: 'Observera:' }}>` (or `useNotification({ messages })`), then the nearest provider's `messages.notification` and its ancestors, then built-in `en`. An empty or whitespace-only value falls through.
- **No other component strings.** The announcement is the notification's own visible text (§7.2), so there's no announcement key.

### 4.2 Writing rules (for the docs page and the content guide)

DESIGN.md Content & Voice applies. Specific to notifications:

1. **The Title says what happened or what to know, in the user's words.** "Vi kunde inte skicka din ansökan", not "Fel" or "Något gick fel". Never only the status word: the status word is added for you.
2. **The Body says what to do, and by when.** One to three short sentences. Lead with the action and the date (`Intl` for the locale: `31.12.2026` in fi, `2026-12-31` in sv).
3. **Errors** answer, in this order: what happened; whether the user's work is safe; what to do now; another way to get it done (a phone number with opening hours). Say "we" for our failures ("Det blev fel hos oss"), never blame the user, never show error codes alone (put a reference code last, in `numeric`, for support).
4. **Warnings** say the consequence and the deadline: "Förnya det före 12 november, annars kan du få en parkeringsbot."
5. **Success** says what happens next and when: "Du får ett beslut inom 4 veckor." A success with nothing next is usually not needed at all.
6. **Info** is for something the user needs to know before they act. If it isn't needed for the task, leave it out: notifications compete with the task.
7. **Actions:** at most two, verbs ("Försök igen", "Förnya parkeringstillstånd"). Links for navigation, Buttons for actions. No "OK", "Stäng" or "Läs mer".
8. **One notification per region at a time.** Combine messages into one (GOV.UK, Designsystemet). Two danger notifications on one page means the page is broken.
9. **Never on a timer.** It stays until the situation changes or the user leaves (2.2.1, 2.2.3).
10. **Plain language, short sentences, no idioms**: second-language readers and easy-to-read (_lättläst_, _selkokieli_) versions must work.

### 4.3 Docs copy (first sentence of `notification.md` and the Storybook Docs page)

> A status message in the content: something people need to know now, or the result of what they just did. It shows its status (info, success, warning or danger) with an icon, a word and a colour, never with colour alone. It doesn't announce itself unless you ask, and it never takes focus on its own.

### 4.4 Story fixture strings (`apps/storybook/src/components/notification/notification.fixture.tsx`)

Keys are local to the fixture, with values in all six locales (storybook-presentation.md §4). `fi` is a designer draft for length; `fi`, `nb`, `nn` and `se` need a translator, and `se` falls back to `en` with `lang="en"` until reviewed. Variables are formatted with `Intl`.

| Key                 | en                                                                                                                                    | sv                                                                                                                            | longest: fi (draft)                                                                                                                                                    | Element            |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ |
| `deadline.title`    | Applications close on {date}                                                                                                          | Sista dag att ansöka är {date}                                                                                                | Hakuaika päättyy {date}                                                                                                                                                | Title, h2          |
| `deadline.body`     | Apply before then if you want a summer job in the municipality. We reply to everyone by {replyDate}.                                  | Ansök senast då om du vill ha ett sommarjobb i kommunen. Vi svarar alla senast {replyDate}.                                   | Hae viimeistään silloin, jos haluat kesätyön kunnalta. Vastaamme kaikille viimeistään {replyDate}.                                                                     | Body, p            |
| `saved.title`       | Your changes are saved                                                                                                                | Dina ändringar är sparade                                                                                                     | Muutoksesi on tallennettu                                                                                                                                              | Title, p           |
| `permit.title`      | Your parking permit expires on {date}                                                                                                 | Ditt parkeringstillstånd går ut den {date}                                                                                    | Pysäköintilupasi päättyy {date}                                                                                                                                        | Title, h2          |
| `permit.body`       | Renew it before then, or you may get a parking fine. It takes about 5 minutes.                                                        | Förnya det innan dess, annars kan du få en parkeringsbot. Det tar ungefär 5 minuter.                                          | Uusi lupa ennen sitä, muuten voit saada pysäköintivirhemaksun. Se vie noin 5 minuuttia.                                                                                | Body, p            |
| `permit.renew`      | Renew parking permit                                                                                                                  | Förnya parkeringstillstånd                                                                                                    | Uusi pysäköintilupa                                                                                                                                                    | Actions, Link      |
| `consequence.title` | You can't change your answers after you send the application.                                                                         | Du kan inte ändra dina svar när du har skickat ansökan.                                                                       | Et voi muuttaa vastauksiasi sen jälkeen, kun olet lähettänyt hakemuksen.                                                                                               | Title, p           |
| `sendFailed.title`  | We couldn't send your application                                                                                                     | Vi kunde inte skicka din ansökan                                                                                              | Emme voineet lähettää hakemustasi                                                                                                                                      | Title, h2          |
| `sendFailed.body`   | Something went wrong on our side. Your answers are saved. Try again in a few minutes, or call us on {phone}, weekdays {open}–{close}. | Det blev fel hos oss. Dina svar är sparade. Försök igen om några minuter, eller ring oss på {phone}, vardagar {open}–{close}. | Järjestelmässämme tapahtui virhe. Vastauksesi on tallennettu. Yritä uudelleen muutaman minuutin kuluttua tai soita meille numeroon {phone} arkisin klo {open}–{close}. | Body, p            |
| `sendFailed.retry`  | Try again                                                                                                                             | Försök igen                                                                                                                   | Yritä uudelleen                                                                                                                                                        | Actions, Button    |
| `longFinnish.title` | Processing of your housing adaptation grant application is paused                                                                     | Handläggningen av din ansökan om bostadsanpassningsbidrag är pausad                                                           | Asunnonmuutostyöavustushakemuksesi käsittely on keskeytetty                                                                                                            | Title, h2 (length) |

## 5. Structure

### 5.1 Anatomy

```
div.kv-notification.kv-notification--warning                  (no role; status from the `status` prop)
  svg.kv-icon.kv-notification-icon  [aria-hidden]               (rendered by the Root: info | success | warning | error)
  h2.kv-notification-title                                      (Title; element via `render`; required)
    span.kv-notification-status  "Varning:"                     (visually hidden by the theme)
    " Ditt parkeringstillstånd går ut den 12 november 2026"
  div.kv-notification-body                                      (Body; optional)
    p  Förnya det innan dess, …
  div.kv-notification-actions                                   (Actions; optional)
    a.kv-link  Förnya parkeringstillstånd
```

Reading order equals DOM order equals visual order: icon (silent), title with its status word, body, actions.

### 5.2 Examples

- **A, info, present at load** (a start page; `h2` under the page's `h1`, before "Start now"): Title `deadline.title`, Body `deadline.body`. No `announce`.
- **B, success, inserted after Save** (My pages or a staff form; the Save button keeps focus): Title `saved.title` rendered as `<p>`, no Body. `announce="polite"`. Placed directly above the form's buttons.
- **C, warning with an action, present at load** (My pages): Title `permit.title` (`h2`), Body `permit.body`, Actions with a Link `permit.renew`.
- **C2, warning text next to an action** (the check-answers page, above Send): Title `consequence.title` rendered as `<p>`, no Body. No `announce`.
- **D, danger, inserted after Send fails** (the check-answers page; the Send button keeps focus): Title `sendFailed.title` (`h2`), Body `sendFailed.body`, Actions with a Button `sendFailed.retry`. `announce="polite"`. Placed directly above Send, so a magnifier user looking at Send sees it, and Shift+Tab from Send reaches "Försök igen".

### 5.3 Per breakpoint

| Width               | Padding (block / inline) | Icon to text gap | Actions                            | Text column (16px page gutter)             |
| ------------------- | ------------------------ | ---------------- | ---------------------------------- | ------------------------------------------ |
| 320px               | 16px / 12px              | 8px              | Stacked, full width, start-aligned | 320 − 32 − 4 − 1 − 24 − 20 − 8 = **231px** |
| 40rem               | 16px / 16px              | 12px             | In a row, start-aligned, wrapping  | Body capped at `--kv-prose-measure` (70ch) |
| 64rem, `kv-compact` | 12px / 12px              | 8px              | In a row                           | –                                          |

The icon stays beside the title at every width. At 231px a line holds about 26 characters at 18px: long Finnish compounds hyphenate (`fi` dictionary) or break (§6.3).

## 6. Visual specification

### 6.1 API surface (for the plan; the engineer owns the details)

- `Notification.Root`, `Notification.Title`, `Notification.Body`, `Notification.Actions`, also as named exports (`NotificationRoot`, …), and `useNotification(options)`.
- **Root props:** `status?: 'info' | 'success' | 'warning' | 'danger'` (default `'info'`), `announce?: AnnouncerPoliteness` (`'polite' | 'assertive'`, default none), `messages?: Partial<KvirnMessages['notification']>`, `render`, and every `div` attribute (`id`, `lang`, `tabIndex`, `ref`, `className`).
- **Types:** `NotificationStatus`, `UseNotificationOptions`, `UseNotificationResult`, `NotificationRootProps`, `NotificationTitleProps`, `NotificationBodyProps`, `NotificationActionsProps`.
- **`useNotification({ status, announce, messages })` returns** `rootProps` (class, both classes below), `iconProps` (`name` and `className` for `<Icon>`), `titleProps` (class and a ref the announcement reads), `statusProps` (`className` and `children`, the resolved status word), `bodyProps` (class and ref) and `actionsProps` (class).
- **Dev warnings** (`warnOnce`, silent in production): a Root with no Title ("A Notification needs a Title: it carries the status word"); a Title, Body or Actions outside a Root; a Root given `role="alert"`, `role="status"` or `aria-live` ("It's announced through the Announcer: a second live region reads it twice"); `announce="assertive"` with `status` `info` or `success`.

### 6.2 Status is a prop, and the Root renders its class (a deliberate exception to ADR-0013)

| `status`             | Class the Root renders     | Background       | Bar and icon colour | Icon (built-in name, shape) | Status word key              |
| -------------------- | -------------------------- | ---------------- | ------------------- | --------------------------- | ---------------------------- |
| **`info`** (default) | `kv-notification--info`    | `primary-subtle` | `primary`           | `info`, a square            | `notification.infoPrefix`    |
| `success`            | `kv-notification--success` | `success-subtle` | `success`           | `success`, a circle         | `notification.successPrefix` |
| `warning`            | `kv-notification--warning` | `warning-subtle` | `warning`           | `warning`, a triangle       | `notification.warningPrefix` |
| `danger`             | `kv-notification--danger`  | `danger-subtle`  | `danger`            | `error`, an octagon         | `notification.dangerPrefix`  |

**Why a prop, when ADR-0013 says choices are classes the consumer adds:** a status isn't a look. It decides three things that must agree: the colour (theme), the icon (component) and the status word that screen readers hear (component, i18n). If the consumer added `kv-notification--danger` by hand, the headless component couldn't know it, and a red box could say "Information:" to a screen reader, or an error could render the info square. That's a 1.3.1 and 1.4.1 failure built into the API. So the component takes `status` and renders the modifier class itself. The class names are still the public styling API, the theme still selects on classes, and `data-*` stays state. This needs the new ADR (§10). Open question 1.

**Why the default is `info`:** the safest wrong answer. A notification with no status chosen must not look like an error or a success it isn't. There's no separate "neutral" status: a neutral message without a status isn't a Notification (§3.2). Info uses `primary-subtle` and `primary`, as DESIGN.md Colors already says ("info backgrounds"). Open question 8 asks whether info should be neutral grey instead of the accent.

**No look-only modifier classes in v1.** Density comes from `kv-compact`. No size, no "subtle" variant, no "no icon" variant: the icon is one of the two non-colour cues.

**The icon** comes from the icon registry (ADR-0024), so a site that registers `warning` replaces it in every notification. Its shape must stay distinct from the other three (docs say so).

### 6.3 Parts

| Part    | Element                                               | Style (default theme)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| ------- | ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Root    | `<div>`, no role                                      | `display: grid`, two columns (`auto 1fr`): the icon in the first, every other child in the second, in DOM order. `box-sizing: border-box`, `min-inline-size: 0`, `max-inline-size: 100%`. `background-color: var(--kv-notification-background)` and `color: var(--kv-color-text)`, set together. **Edge:** `border-inline-start: var(--kv-indicator-width) solid var(--kv-notification-accent)` (4px), and 1px (`--kv-border-width`) `transparent` on the other three sides. **Radius:** `--kv-radius-sm` (4px): its inner radius is 0, so the bar's inner edge stays straight and reads as a bar, where `md` (8px) would curve it into a bracket. No shadow, no transition. **Padding** per §5.3. **Text:** `overflow-wrap: break-word`, `hyphens: auto`, `hyphenate-limit-chars: 10 4 4` (ADR-0028: notifications join prose and cards; never in code). **Never** `overflow`, `clip-path` or a fixed size: a link's focus ring inside is never clipped (2.4.11, 2.4.13) and text spacing never cuts text (1.4.12). No margin: spacing around it is the consumer's |
| Icon    | `<svg class="kv-icon kv-notification-icon">`          | `md` (1.25em of 16px, so 20px), `color: var(--kv-notification-accent)`, `aria-hidden`. Centred on the Title's **first line**, and still on it under 1.4.12 line height and when the title wraps (the `lh` technique of `kv-field-error-message`). Never mirrors in RTL                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| Title   | `<h2>` by default; any heading or `<p>` with `render` | `--kv-font-family-body` (sans, not the heading serif: it's a message label, and serif at this size would read as a new page section), 1.125rem, weight 600, line height 1.4, `color: var(--kv-color-text)`, `margin: 0`, `max-inline-size: var(--kv-prose-measure)`. In `kv-compact` from 64rem: 1rem, line height 1.5. Starts with the status span, a normal space, then the children                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| Status  | `<span class="kv-notification-status">` in the Title  | Visually hidden by the theme with the same rule as `kv-field-error-prefix` (1px, `clip-path: inset(50%)`, never `display: none`), so screen readers read it and it's in the heading list. Without the theme it shows, which is correct unstyled. Open question 3 asks whether to show it                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| Body    | `<div>`                                               | `body` (16px, `text`), `margin-block-start: var(--kv-space-2)` after the Title, `max-inline-size: var(--kv-prose-measure)`. Its own children: first and last block margins 0, `space-2` between blocks, lists keep their markers with `padding-inline-start: var(--kv-space-6)`, all at zero specificity (`:where()`). Links are `Link` (`kv-link`, underlined). Put `kv-prose` on the Body for CMS content, which turns prose on inside it, as in a card                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| Actions | `<div>`                                               | The button-group layout built in (no `kv-button-group` needed: arranging actions is the part's only job): a wrapping row with a `space-3` gap, start-aligned, primary first; below 40rem a column of full-width buttons. `margin-block-start: var(--kv-space-4)` (`space-3` in compact). Buttons keep their own size (44px, 32px in compact from 64rem). Links stay links. Buttons are secondary by default: a notification rarely holds the view's one primary action                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |

**Component tokens** (aliases of semantic tokens, no new colours or values): `--kv-notification-background` and `--kv-notification-accent`, set by each status class; `--kv-notification-padding-block`, `--kv-notification-padding-inline` and `--kv-notification-gap`, set on `:root`, redefined from `40rem` and in the compact rule from `64rem` (§5.3), so a site can tune spacing without touching colours.

**Prose:** `.kv-notification` joins the prose boundary list next to `.kv-card`: nothing inside is prose-styled (so an `h2` Title in an article doesn't get prose's serif and 32px margin), the Root gets prose's block margins, and `kv-prose` inside turns prose on again.

**Nesting:** a Notification may sit on the page, in a Section or in a Card body. Never a Card or a Section inside a Notification, and never a Notification in a Notification.

### 6.4 States

| Part        | default | hover | focus-visible                                                                                                                                                        | active | disabled | invalid | loading | selected / open | empty                                     |
| ----------- | ------- | ----- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | -------- | ------- | ------- | --------------- | ----------------------------------------- |
| Root        | §6.3    | none  | Only when the consumer made it focusable (`tabIndex={-1}`, §7.3): the 2px `focus-ring` with a 2px offset, outside the box, following the `sm` radius (2.4.7, 2.4.13) | none   | none     | none    | none    | none            | The consumer doesn't render it            |
| Title, Body | §6.3    | none  | none                                                                                                                                                                 | none   | none     | none    | none    | none            | A Root with no Title warns in development |
| Actions     | §6.3    | none  | none (its Links and Buttons show their own ring)                                                                                                                     | none   | none     | none    | none    | none            | The consumer doesn't render it            |

A notification is never interactive as a whole: no hover, no pointer cursor, no shadow, no click handler. It appears and disappears **instantly**, with no motion in any preference (no layout animation when an error appears, as for field errors).

### 6.5 Modes

- **Dark, light-contrast, dark-contrast:** only the tokens change. The `-subtle` backgrounds are step 50 in the light themes and step 950 in the dark themes, so a notification is slightly lighter than the dark page and slightly tinted on the light one. Text pairs are 7:1 or more in the contrast themes (§6.6).
- **Forced colours** (what carries status without colour): the background becomes `Canvas`, text `CanvasText`, links `LinkText`. An explicit rule `@media (forced-colors: active) { .kv-notification { border-color: CanvasText } }` draws all four edges, with the 4px bar kept at 4px, so the box and its bar survive. The icon takes `CanvasText` (DESIGN.md Shapes). **All four statuses then share one colour, so the status is carried by the icon's shape (square, circle, triangle, octagon), the status word in the accessibility tree, and the title's words.** No `forced-color-adjust: none`.
- **RTL:** logical properties only. The bar and the icon sit on the right. Status icons never mirror. Actions follow the inline direction.
- **Motion:** none. Reduced motion changes nothing.
- **320px, 400% zoom, 1.4.12:** no fixed sizes, no `overflow`, `min-inline-size: 0`, hyphenation then `overflow-wrap: break-word`. The icon stays on the title's first line under the text-spacing overrides. Actions stack below 40rem. Text spacing grows the height.
- **Density:** `kv-compact` from 64rem reduces padding, the gap and the Title size (§5.3, §6.3). The Body stays 16px.
- **Print:** backgrounds don't print by default, but the 4px bar (a border) and the icon do, so the status stays visible on paper.

### 6.6 Contrast and `theme:check`

Measured on 2026-10-02 with `resolveThemeColors()` and `contrastRatio()` from `packages/theme/src` against the current `theme.css`. **Every pair a Notification needs is already in `contrast-requirements.ts`. No new colour, token value or pair is required.** None of the pairs below may be removed.

| Pair on the notification background (`primary-subtle` / `success-subtle` / `warning-subtle` / `danger-subtle`) | Minimum     | light                   | dark                    | light-contrast          | dark-contrast           | In `contrast-requirements.ts`                          |
| -------------------------------------------------------------------------------------------------------------- | ----------- | ----------------------- | ----------------------- | ----------------------- | ----------------------- | ------------------------------------------------------ |
| `text`, `heading` (Title, Body)                                                                                | 4.5:1 (7:1) | 16.80/17.14/17.44/16.93 | 14.66/14.96/15.02/15.83 | 18.41/18.77/19.10/18.54 | 15.59/15.91/15.98/16.84 | Yes (`textPairs`)                                      |
| `text-muted` (metadata only, such as a reference code)                                                         | 4.5:1 (7:1) | 5.48/5.59/5.69/5.52     | 4.80/4.90/4.92/5.18     | 9.58/9.77/9.94/9.65     | 10.68/10.89/10.94/11.53 | Yes                                                    |
| `link`                                                                                                         | 4.5:1 (7:1) | 5.21/5.31/5.41/5.25     | 5.44/5.55/5.57/5.87     | 8.72/8.90/9.05/8.79     | 8.33/8.50/8.54/9.00     | Yes                                                    |
| `link-hover`                                                                                                   | 4.5:1 (7:1) | 6.28/6.40/6.51/6.32     | 7.35/7.50/7.54/7.94     | 11.16/11.38/11.58/11.24 | 10.44/10.66/10.70/11.28 | Yes                                                    |
| The status's own accent: bar and icon (`primary`/`success`/`warning`/`danger` on its own `-subtle`)            | 3:1         | 4.15/5.46/5.79/5.69     | **3.32**/8.62/8.65/7.50 | 8.72/8.42/9.61/7.31     | 8.33/10.66/11.14/9.97   | Yes (`primary` non-text 3:1; the others as text 4.5:1) |
| `focus-ring` (a link's or button's ring inside)                                                                | 3:1         | 4.15/4.23/4.30/4.18     | 5.44/5.55/5.57/5.87     | 8.72/8.90/9.05/8.79     | 8.33/8.50/8.54/9.00     | Yes                                                    |
| `border-control`, `secondary` (a secondary button's edge in Actions)                                           | 3:1         | 4.39/4.48/4.56/4.42     | **3.13**/3.20/3.21/3.38 | 9.58/9.77/9.94/9.65     | 10.68/10.89/10.94/11.53 | Yes                                                    |
| `primary` (a primary button's fill, a hovered secondary button's edge)                                         | 3:1         | 4.15/4.23/4.30/4.18     | 3.32/3.39/3.40/3.58     | 8.72/8.90/9.05/8.79     | 8.33/8.50/8.54/9.00     | Yes                                                    |

| Pair on the page around it (`canvas` / `surface` / `surface-raised`)                    | Minimum | light                                 | dark                      | light-contrast            | dark-contrast                | In `contrast-requirements.ts` |
| --------------------------------------------------------------------------------------- | ------- | ------------------------------------- | ------------------------- | ------------------------- | ---------------------------- | ----------------------------- |
| The bar's outer side: `primary` / `success` / `warning` / `danger`, lowest of the three | 3:1     | 4.42 / 5.70 / 5.95 / 6.02             | 3.75 / 9.53 / 9.52 / 7.84 | 9.29 / 8.80 / 9.86 / 7.73 | 9.40 / 11.80 / 12.27 / 10.42 | Yes                           |
| `focus-ring` around a focused Root (error summary, arrival)                             | 3:1     | covered by the plain-background pairs | –                         | –                         | –                            | Yes                           |

**Decorative, not enforced:** the `-subtle` background against the page is 1.03–1.34:1 in every theme. That's fine: the box isn't a control (1.4.11 doesn't apply), and its edge is the bar, which passes 3:1 on both sides.

Lowest numbers to watch: `border-control` and `secondary` on `primary-subtle` in dark (**3.13:1**, a secondary button in an info notification), and `primary` on `primary-subtle` in dark (**3.32:1**, the info bar and icon). A rebrand of `--kv-primary-*` can break these first: the docs' theming page says so.

**Changes to `theme:check` (engineering task, no new values):**

1. Rename the comment on `statusBackgrounds` from "The status panels" to "Notifications (info uses `primary-subtle`)". Optionally define `notificationBackgrounds = ['primary-subtle', ...statusBackgrounds]` for readability: it adds no pair that isn't already required.
2. **Extend the tinted button-edge check (ADR-0026) to the four notification backgrounds**, because Actions puts Buttons there and `checkButtonEdges` measures only `canvas`, `surface` and `surface-raised` today. A tinted edge only makes the edge darker in light and lighter in dark, so it should pass, but it's unmeasured. After that change, the orchestrator runs `vp run theme:check`.
3. Not added, on purpose: `danger-hover` on the `-subtle` backgrounds. Destructive buttons don't belong in a notification (DESIGN.md: destructive actions need a confirmation step). The docs say so.

**Known look trade-off:** a secondary Button's hover fill is `primary-subtle`, the info background, so in an info notification its hover shows only as the `primary` edge (3.32:1 dark) and the depth shadow. Hover isn't a WCAG requirement, and focus is the ring. Noted for the design review.

## 7. Accessibility annotations

Draft input for `packages/react/src/notification/notification.a11y.md`.

### 7.1 Roles, names and structure

- **APG pattern:** none for the visible block. **Deviations:** none.
- **Root:** `<div>`, `generic`. **Never** a `role`, `aria-live`, `aria-atomic`, `aria-label` or `aria-labelledby` from the component. Not a landmark by default: a notification is a message, not a place to jump to. A consumer who wants a page-level notification in the landmark list renders it as `<section aria-labelledby={titleId}>`, and only for one site-wide message (open question 9).
- **Icon:** decorative (`aria-hidden`). The status is in text.
- **Title:** the status word, then the consumer's text, in one heading: "rubrik nivå 2, Varning: Ditt parkeringstillstånd går ut den 12 november 2026". **The heading level is the consumer's** (1.3.1, 2.4.6): one level below the heading of the part of the page it's in, so usually `h2` directly under the page's `h1`, `h3` inside a section with an `h2`. Never skip levels. A one-sentence notification renders the Title as `<p>` (GOV.UK: "avoid using headings for single-line notifications that do not need them"); the status word is still first.
- **Body and Actions:** generic containers. Links and Buttons inside keep their own names and roles.
- **Language:** `lang` on any part in another language (3.1.2). The status word follows the provider's locale.

### 7.2 Announcements: when a notification is announced, and how

**The rule: the visible notification is never a live region. When it must be heard without focus, the Root calls `useAnnouncer().announce(text, { politeness })` once, when it mounts, and only when `announce` is set.**

| When it appears                                                                                                        | Example                                              | Do                                                                                                                                        | Why                                                                                                                                                                                                                                                                                                                            |
| ---------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Present when the page loads** (server-rendered, or in the first render): deadlines, outages, warnings about the task | A, C, C2                                             | No `announce`, no role, no focus. A heading (or a `<p>` near the action) placed before the content it's about                             | It's content, read in reading order and found by heading navigation. A live region announces **changes**, not what's there at load. `role="alert"` on load is announced by some screen readers and not by others, interrupts the page title and the `h1` before the user knows where they are, and can fire again on hydration |
| **The outcome of the user's action, after a page load or route change,** shown on a page that's about something else   | "Ändringarna är sparade" back on the case list       | No `announce`. Move focus to the Root once on arrival (`tabIndex={-1}`, `ref.focus()`), with `scroll-padding` so it isn't hidden (2.4.11) | Moving focus reads it once and puts the user next to it (as GOV.UK's success banner does). Doing both reads it twice                                                                                                                                                                                                           |
| **A confirmation page** whose purpose is the outcome                                                                   | "Ansökan skickad"                                    | The page's `h1` says it, and the router's focus handling reads it. A success Notification on that page is optional and isn't announced    | The page is the message                                                                                                                                                                                                                                                                                                        |
| **Inserted in the page after an action, focus stays where it is**                                                      | B, D                                                 | `announce="polite"`. Insert it near the control that caused it                                                                            | 4.1.3: a status message that doesn't take focus must reach AT. Polite waits for the screen reader to finish its feedback on the button                                                                                                                                                                                         |
| **Inserted, urgent, not caused by the current action, and the user must act now to avoid losing work**                 | "Anslutningen bröts. Det du skriver nu sparas inte." | `status="danger"`, `announce="assertive"`. Rare                                                                                           | It interrupts. Never for success or info (dev warning)                                                                                                                                                                                                                                                                         |
| **Errors on submit** (validation)                                                                                      | The error summary block                              | No `announce`: the block moves focus to it                                                                                                | Focus reads it; the field errors are read when each field gets focus (ADR-0029)                                                                                                                                                                                                                                                |
| **Its text changes while it's shown**                                                                                  | Progress, a retry that fails again                   | Not supported by `announce`. Remount it with a new React `key` to announce again, or call `useAnnouncer()` yourself                       | One rule that's easy to test: announce on mount, once                                                                                                                                                                                                                                                                          |

Details:

- **The announced text** is what a screen reader would read: the Title's text (which starts with the status word) and then the Body's text, with block boundaries as spaces. Actions aren't announced: they're controls the user reaches with Tab. Keep dynamic notifications short.
- **No i18n key for the announcement:** it's the visible, already-translated text, so visible and announced always match.
- **Why the Announcer, not a role on the box:** a live region inserted together with its text isn't announced by most screen readers (ADR-0040), and a box with its own role plus the Announcer would read it twice. One shared, tested place does clear-then-set, so a repeated failure ("Vi kunde inte skicka …" twice) is read twice.
- **Why opt-in:** the component can't tell "present at load" from "inserted after an action" (a hydrated server render and a client insert both mount). The consumer knows, so the consumer says.
- **Known risks** (for the ADR and the AT run, all `pending`):
  - 4.1.3 asks that the status message be programmatically determinable through role or properties. Here the message reaches AT through the Announcer's `status` or `alert` region, with the same text, and the visible box has no role. We believe this meets the intent; the manual AT matrix must confirm it.
  - Without a `KvirnProvider`, announcements are dropped after one dev warning (ADR-0040). The docs say a provider is required for `announce`.
  - Inside a modal dialog, the Announcer's regions are silenced (ADR-0040's modal follow-up). Until that's fixed, a notification inside a dialog isn't heard.
  - A consumer who sets `announce` on a server-rendered notification gets it announced after hydration. The docs say: set `announce` only from the state of the action that just happened.

### 7.3 Focus

- A Notification never moves focus, never traps it, and is not a Tab stop.
- The consumer may make it a focus target with `tabIndex={-1}` (the error summary, an arrival message). Then it shows the focus ring on `:focus-visible` (§6.4), Tab from it goes to its first link or button, and it never gets `tabIndex={0}`.
- Inserting a notification never moves focus away from the control the user pressed (3.2.2). Removing one that held focus is the consumer's bug: they move focus first.
- With a sticky header, the page sets `scroll-padding` so a focused notification isn't hidden (2.4.11).

### 7.4 Keyboard (draft of the contract's section, ADR-0039)

```md
This component has no focusable parts and handles no keys.

A Notification is never a Tab stop of its own. Links and buttons in its Body and Actions keep their own keys (see `button.a11y.md` and `link.a11y.md`). Dismissing isn't supported in this version.

| Key       | Context                                               | Action                                                | Test                                                                             |
| --------- | ----------------------------------------------------- | ----------------------------------------------------- | -------------------------------------------------------------------------------- |
| Tab       | Before a notification with a link in its Actions      | Moves to the link. The notification itself is skipped | `notification.e2e.ts › Tab skips the notification and reaches its link`          |
| Shift+Tab | On the control after the notification                 | Moves back to the notification's last button or link  | `notification.e2e.ts › Shift+Tab reaches the notification's action`              |
| Tab       | On a notification focused by script (`tabIndex={-1}`) | Moves to the first link or button inside it           | `notification.e2e.ts › Tab from a focused notification goes to its first action` |
| –         | Root                                                  | No `tabindex` is rendered by default                  | `notification.test.tsx › rendering › adds no role, live region or tabindex`      |
```

No `Keyboard` story is needed (no focusable part of its own), as for Section. The e2e rows run on the `WithActions` and `FocusTarget` stories.

### 7.5 Dismissing: not in v1

**Decision: not dismissible in this version.**

- Errors and warnings must not be dismissible: the problem doesn't go away when the message does, and a resident under stress may close the one thing that told them what to do.
- A close button adds a focus decision (where focus goes when the box is gone: never to `body`), a persistence decision (does it come back on the next page?), and an icon-only button with a name and, from M2, a tooltip. That's worth an ADR of its own when there's a real case.
- Designsystemet's guidance agrees: give the user actions that both resolve the message and move them on, instead of a generic close icon. The `Actions` part is for that.
- Open question 5 asks for the cases that need it (a staff "dismiss this tip", a cookie-free "seen it" info).

### 7.6 WCAG success criteria of note

1.1.1 (decorative icon), 1.3.1 (title as a heading, status word in text), 1.3.2 (DOM order), 1.4.1 (icon shape and status word, never colour alone), 1.4.3 and 1.4.6 (text pairs, §6.6), 1.4.10 (320px), 1.4.11 (bar and icon 3:1), 1.4.12 (no fixed heights), 2.2.1 and 2.2.3 (no timers), 2.4.3 (focus order), 2.4.6 (title describes the topic), 2.4.7, 2.4.11 and 2.4.13 (focus on a focused Root, never clipped), 3.2.2 (inserting never moves focus), 3.3.1 and 3.3.3 (error notifications identify and suggest), 4.1.2, 4.1.3 (announce).

### 7.7 Stories (`Components/Notification`, all with axe in the four theme projects, the contract passed as `a11yContract`)

Nothing exists yet, so every story is new. Only these are needed:

- `Default`: info, Title and Body (Example A).
- `Statuses`: all four, labelled with `status="…"` as `<code>`, each with the same Title text, so the icon and colour are the only visual difference (review in forced colours).
- `TitleOnly`: Examples B and C2, Title as `<p>`.
- `WithActions`: Example C (a Link) and D (a Button).
- `Announced`: Example B behind a Save button that inserts it with `announce="polite"`; the play function checks the polite region gets "Klart: Dina ändringar är sparade" once, and an initially rendered notification puts nothing in it.
- `SendFailed`: Example D, inserted after Send, `announce="polite"`, and a second failure remounts it (new `key`) so it's announced again.
- `FocusTarget`: a notification focused on mount with `tabIndex={-1}` (the arrival pattern and the error summary's mechanics).
- `MessagesOverride`: `messages={{ dangerPrefix: 'Viktigt:' }}` on one instance, and a provider override.
- `InProseAndCard`: in an article with `kv-prose`, and in a Card body.
- `Compact`: Examples B and D in `kv-compact`.
- `LongFinnishText`: `longFinnish.title` with the `fi` fixture at 320px.
- `RTL` (en), `ForcedColors`, `AllExamples`.

### 7.8 Tests the plan should list

- `notification.test.tsx`: renders `div.kv-notification.kv-notification--info` by default and the right class, icon name and status word for each `status`; `className` joins; `render` changes the Title element (`h3`, `p`); the status span is first in the Title, followed by a normal space; `messages` per instance and from the provider (ADR-0007 order, empty falls through); no `role`, `aria-live`, `aria-atomic` or `tabindex`; `announce` calls the announcer once on mount with the Title and Body text and the politeness, and not without `announce`, and not on re-render; remount announces again; the dev warnings in §6.1; `useNotification` returns the same props; server rendering.
- `theme-css.test.ts`: the Notification never sets `overflow`, `clip-path`, a fixed height or a shadow; the bar is `--kv-indicator-width`; each status class sets both component tokens to semantic tokens; the forced-colours rule sets `border-color: CanvasText`; `.kv-notification` is in the prose boundary list.
- `notification.e2e.ts`: the keyboard rows; a11y snapshot (the heading's name starts with the status word; no `alert` or `status` role on the box); the polite region receives Example B's text after Save; forced colours draw the border on all four sides; no horizontal scroll at 320px with `fi`; text spacing clips nothing and the icon stays on the first line; a link's focus ring in Actions isn't clipped; a focused Root's ring is visible.
- `i18n:check`: the four keys in all six locales.

## 8. Validation

- [x] Self-review against `.claude/skills/design/references/review-checklist.md`. No open blockers. Checked: no hard-coded strings (four keys, fixture keys); colour never alone (icon shape, status word, title); contrast measured (§6.6); 320px and 1.4.12 (§6.5); focus never obscured or clipped (§6.3, §7.3); no timers; no compliance claim. Not applicable: timeouts, target sizes of its own (children keep theirs).
- [x] Contrast of every pair measured (§6.6). No new colour, no new pair. One check extension (button edges on `-subtle`), for the orchestrator to run `vp run theme:check` after it lands.
- [x] Usability test plan written. Result: `pending`.

### Usability test plan

- **Participants (8–10):** two screen-reader users (NVDA on Windows, VoiceOver on iOS), a screen-magnifier user at 400%, a Windows Contrast Themes user, a person with colour-vision deficiency, a person with a cognitive disability, a person with low digital confidence, a Finnish or Swedish second-language reader, and one or two staff users in compact density.
- **Tasks:**
  1. On a summer-job start page (Example A), say when applications close, and start the application.
  2. On My pages (Example C), find out if anything needs doing, and do it.
  3. On a check-answers page (Examples C2 and D), send the application. Sending fails (D). Say what happened, whether your answers are lost, and what you'll do now.
  4. In a staff form, change a field and save (Example B). Say whether it saved.
  5. Shown the four statuses with the same title (the `Statuses` story, in your own theme), point to the error and to the success.
- **What we measure:**
  - Task completion, time on task, and the participant's own words for "what happened" and "what next".
  - Screen-reader users: whether the dynamic notifications (B, D) are heard, when, and whether anything is heard twice; whether they find A and C by heading navigation; whether "Varning:" in the heading helps or annoys.
  - Task 5: whether participants with colour-vision deficiency and in Contrast Themes tell the statuses apart by icon shape (RQ, §1; open question 3).
  - Whether anyone looks for a close button (open question 5).
  - Magnifier user: whether D, placed above Send, is seen after pressing Send.
- **Result:** `pending`. Assistive-technology testing is also `pending`.

## 9. Everything that must change elsewhere

The brief limited edits to this file. These are for the plan and the main session.

### 9.1 The decision table (`section.md` §6.9, `card.md`, the Section, Card and Notification Docs pages, Foundation/Borders and elevation, DESIGN.md Components)

Retitle it **"Section, Card, Notification or a surface token: when to use which"**. Replace the last row, word for word, with:

| You're building                                                                                                                            | Use                                                                                                                                                | Why                                                                                                                                        |
| ------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| A status message: something people need to know now, or the result of what they just did (an error, a warning, a confirmation, a deadline) | `Notification` with `status="info"`, `"success"`, `"warning"` or `"danger"`. The status brings its `-subtle` background, bar, icon and status word | It's a message, not a region or a thing. Status is never shown by a surface colour alone (1.4.1), so you choose the status, not the colour |

and add two rows after it:

| You're building                                     | Use                                                                                                              | Why                                                                                      |
| --------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| An error on one form field                          | `Field.ErrorMessage` under the field. On submit, also the error summary (a danger Notification that takes focus) | The error belongs to its field, and the summary gets the user to it                      |
| A quote, an example or an aside that isn't a status | Plain content: a paragraph, or prose's `blockquote` for a quotation. Never a `-subtle` background                | A tinted box reads as a status. If nothing happened and nothing is at risk, it isn't one |

### 9.2 DESIGN.md (with the new ADR)

- **Front matter `components`:** add `notification` (`backgroundColor: '{colors.primary-subtle}'` with a comment "per status: primary-subtle, success-subtle, warning-subtle, danger-subtle", `textColor: '{colors.text}'`, `rounded: '{rounded.sm}'`, `padding: 16px`, comment "12px inline below 40rem; 12px in compact density from 64rem").
- **Overview or Components intro:** add the vocabulary (§0) as "Words we use", short: Surface (a token), Section (a region, level 1), Card (one thing, level 2), Notification (a status message), Toast (transient, later), Alert (only the ARIA role and AlertDialog).
- **Colors table, Use column:** `primary` adds "info notification bar and icon"; `primary-subtle` "… selected rows, info notifications"; `danger-subtle` "Error notifications, including the error summary"; `success-subtle` "Success notifications"; `warning-subtle` "Warning notifications". The `danger`, `success` and `warning` rows add "notification bar and icon".
- **Elevation:** one sentence: a notification isn't a level. It's a tinted block in the content at the level of whatever it sits on, with no shadow, and its edge is its bar.
- **Shapes, radii:** `sm` (4px) adds "notifications". **Lines:** "the 4px indicator bar (`--kv-indicator-width`) marks the current navigation item, a blockquote and a notification".
- **Components, Notifications bullet,** replaced by: "**Notifications** are status messages in the content (`Notification`). The status is a prop (`info` by default, `success`, `warning`, `danger`), and it brings the `-subtle` background, a 4px inline-start bar and an icon in the status colour (square, circle, triangle, octagon), and a status word at the start of the title (visually hidden, from i18n). The `sm` radius, 16px padding, a sans title at 18px weight 600, no shadow. Never colour alone. The title is a heading at the consumer's level, or a `<p>` for one sentence. Not dismissible. Announced only with `announce`, through the Announcer. The design spec is `docs/design/notification.md`."
- **Components, Error summary bullet:** "A danger Notification at the top of `main` with the heading 'Det finns ett problem' and a list of links to each invalid field, worded like the field errors. It receives focus on submit and isn't announced." (Pending open question 4.)
- **Components, Cards bullet:** "status belongs in a notification" links to the Notification. **Components intro:** list Notification and this spec.
- **Typography, Families:** one clause: a notification's title uses the body family (it's a message label, not a section heading).
- **Prose bullet:** `kv-notification` joins the boundary list next to `kv-card`.
- **Layout, Text expansion:** hyphenation applies to notifications too (ADR-0028 amended).
- **Theming class list:** the part classes `kv-notification`, `kv-notification-icon`, `kv-notification-title`, `kv-notification-status`, `kv-notification-body`, `kv-notification-actions`, and `kv-notification--info|success|warning|danger`, "rendered by the component from `status`, not added by hand".
- **Do's and Don'ts:** Don't: "Use a `-subtle` background for anything but a notification", and "Put `role="alert"` on a notification".

### 9.3 Other files

- `docs/design/section.md` §6.1 ("a future Notification") and §6.9 (the table, §9.1); `docs/design/card.md` §6.1 ("a future Notification component") → link this spec.
- `docs/adr/0020-card-container.md` Follow-ups: "Notification: designed in `docs/design/notification.md`, ADR-0046".
- `docs/adr/0028-…` (hyphenation): a revision line adding notifications.
- `docs/architecture.md`: Styling contract, one sentence on the exception (a component may render a modifier class when the choice carries meaning it must also put in the text: Notification's `status`, ADR-0046); the blocks list says the error summary is built on Notification.
- `docs/roadmap.md`: a Primitives row "Notification (Root, Title, Body, Actions; status, announce) | – (native `<div>`, Announcer) | 1 | planned"; the Toast row notes "reuses the Notification look"; the "Form wizard + error summary" block row notes "built on a danger Notification".
- `packages/i18n/src/types.ts` and the six locales: the `notification` namespace (§4.1).
- `packages/theme/src/contrast-requirements.ts` comment, and `button-edge.ts` backgrounds (§6.6).
- `packages/theme/README.md`: the part classes and the status classes.
- `docs/design/README.md`: this spec's row: `| [Notification: status messages (info, success, warning, danger), the vocabulary, and when to announce](notification.md) | to be written | Draft |`.
- New: `packages/react/src/notification/` (`notification.tsx`, `use-notification.ts`, `notification.test.tsx`, `notification.a11y.md`, `notification.md`), `apps/storybook/src/components/notification/` (stories, fixture, e2e), a changeset (`@kvirn-ui/react`, `@kvirn-ui/theme`, `@kvirn-ui/i18n` minor).

## 10. ADR to draft (main session, status _Proposed_)

**"Notification: a status block whose status is a prop, with no role, announced through the Announcer"** (likely ADR-0046). Decisions to record, with the options from this spec:

1. The name Notification, not Alert (§3.1).
2. `status` is a typed prop, and the Root renders `kv-notification--<status>`: a scoped exception to ADR-0013, because status decides the icon and the announced word as well as the look (§6.2). Option rejected: a consumer-added class (look and words can disagree).
3. The Root renders the status icon; the Title renders the status word from four i18n keys (§4.1, §6.3).
4. No role and no live region on the box; `announce` opts in to one Announcer call on mount (§7.2), with the 4.1.3 risk and the AT validation.
5. Not dismissible in v1 (§7.5).
6. The error summary is a block built on a danger Notification, and moves focus instead of announcing (§3.3).

## 11. Open questions for the maintainer

1. **Status as a prop that renders its class** (§6.2), an exception to ADR-0013. Accept, or keep classes only and accept that the icon and status word must be passed separately (and can disagree with the colour)?
2. **The prop name `status`.** It matches DESIGN.md's "status colours" and your framing, but it's also an ARIA role the component never uses. The alternative is `tone` (Shopify Polaris Banner uses it). Keep `status`?
3. **Visible or hidden status word.** Hidden by default (as Field's "Fel:"), with the icon shape as the visual non-colour cue. GOV.UK shows "Important" / "Success" as a visible title. Keep hidden, or show it (it costs a line, and repeats the icon), or add a class to show it? The usability test (task 5) can decide.
4. **The error summary's look:** the danger Notification bar (proposed, one look for "error on this page"), or DESIGN.md's current "danger border" all round (GOV.UK's look)?
5. **Dismissible notifications later:** which real cases need them? Errors and warnings never.
6. **Radius `sm` or `none`.** `sm` keeps the bar straight on its inner side. If the corner join between the 4px bar and the 1px transparent edges looks slanted at 200% zoom, `none` is the fallback. Decide in the design review of the stories.
7. **Title type:** sans 18px 600 (proposed: a message label that doesn't compete with the page outline), or the serif `heading-3` like other headings?
8. **Info colour:** the accent (`primary-subtle` with a `primary` bar, as DESIGN.md says today), or a neutral info (`surface` with a `border-control` bar) so lavender keeps meaning only "interactive or selected"?
9. **A landmark option** for one site-wide notification (a service outage): document `render={<section aria-labelledby>}`, or never a landmark?
10. **Toast (M3):** reuse the `kv-notification` look and status words? Recommended, so there's one visual language for status.
11. **Inset text:** a neutral aside isn't a Notification. Do we want a small prose class for it later (for example `kv-inset`), or is a paragraph enough?
12. **Northern Sámi** status words are English placeholders and block `beta`, as for Field. Who translates them?
