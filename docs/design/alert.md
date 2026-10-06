# Design spec: Alert

- **Status:** Draft. Renamed from Notification to Alert by Plan 0042 (maintainer's decision, 2026-10-04: §3.1 reverses the original name decision). Revised 2026-10-02 with the maintainer's answers: status by class, content by ready-made roots; the decisions are in §11). Plan 0020 implements it
- **Designer:** ux-designer agent · **Date:** 2026-10-02
- **Plan:** 0020. **Decision:** "Alert: one plain Root and four ready-made status roots, no role, announced through the Announcer" (§10). It follows the classes-not-props rule and makes no exception to it
- **Type:** new component (headless: a plain Root, four ready-made status roots that add an icon and a status word, and an optional announcement) + default-theme styling + DESIGN.md vocabulary and rule changes

The maintainer's framing, which this spec doesn't reopen: a status block is **its own component, not a variant of a container**. Status is chosen **by class**, like Card and Section, so the look is plain CSS that's easy to change or replace. The accessible content that must agree with the colour (the icon and the status word) comes from **ready-made roots**, one per status. This spec decides the name, what is and isn't an Alert, its parts, its semantics and announcements, its look, its content rules, and the vocabulary that separates it from Surface, Section and Card.

## 0. Vocabulary (the words we use from now on)

People say surface, card, panel and alert for the same box. From now on each word means one thing, in DESIGN.md, the docs, Storybook, specs and code comments.

| Word                | Means                                                                                                                                                                         | Is a component?                                                         | Never use it for                                                               |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| **Surface**         | A background **colour token**: `canvas`, `surface`, `surface-raised`, and the `-subtle` backgrounds                                                                           | No. `var(--kv-color-surface)` in your CSS                               | A box, a container or a component. "Put it on a surface" means "use the token" |
| **Section**         | A **region of the page**: a sidebar, a band. Elevation level 1, `surface`, square, no visible edge (`docs/design/section.md`)                                                 | `Section`                                                               | A thing on the page, a status message                                          |
| **Card**            | **One entity** people read, compare or act on as a unit. Level 2, `surface-raised`, hairline edge, rounded (`docs/design/card.md`)                                            | `Card`                                                                  | A region, a form section, a status message, a box for looks                    |
| **Alert**           | A **status message** in the content: info, success, warning or danger. A `-subtle` background, a bar, an icon, a status word and a title                                      | `Alert.Info`, `.Success`, `.Warning`, `.Danger` (and the plain `.Root`) | Decoration, emphasis, a quote, marketing, a field's own error                  |
| **Danger**          | The status for errors and failures, named after the `danger` token. Its status word is "Error:" / "Fel:"                                                                      | `Alert.Danger`                                                          | –                                                                              |
| **Toast**           | A **transient** message that floats over the page and goes away (roadmap M3). It reuses the Alert look and status words                                                       | Not yet                                                                 | Anything a user needs to complete the task                                     |
| **Error summary**   | The **block** at the top of a form after a failed submit: an `Alert.Danger` with links to each field, which takes focus (roadmap M4)                                          | A block, built on Alert                                                 | A single field's error                                                         |
| **Error message**   | The text under one invalid field (`Field.ErrorMessage`)                                                                                                                       | `Field.ErrorMessage`                                                    | A message about the page or the service                                        |
| **`role="alert"`**  | The ARIA role: an assertive live region. It is an Announcer detail (its assertive region) and is never put on an Alert box. `AlertDialog` (M2) is a separate, modal component | `AlertDialog`; the role lives in the Announcer                          | The visible Alert box, or a status name                                        |
| ~~Panel~~           | Retired. It was the level 1 container before the rename to Section                                                                                                            | No                                                                      | Anything. Say Section                                                          |
| ~~Banner, callout~~ | Not KvirnUI words. `banner` is the ARIA landmark for the site header                                                                                                          | No                                                                      | Anything. Say Alert (status) or Section (region)                               |

## 1. Brief

- **Users:** both.
  - Residents meet alerts at the worst moments: an application that didn't send, a deadline about to pass, a permit about to expire, a service that's down. Often once, often on a phone, often stressed, sometimes in their second language.
  - Staff see them every day in case tools ("Changes saved", "The case is locked by another officer"), in compact density.
  - Adopters' developers have so far had only `-subtle` tokens and a DESIGN.md sentence, so each builds their own status box, usually as a coloured Card, often with `role="alert"` on everything. They also want to restyle alerts to their own brand without losing the accessible content.
- **Hardest-case users, in order:**
  1. **A screen-reader user** (NVDA, JAWS, VoiceOver, TalkBack) who presses Send, and hears nothing when the send fails, or hears every status message on the page as an interruption when it loads.
  2. **A Windows Contrast Themes user** for whom every status colour becomes the same system colour, so red, green, amber and lavender are all `CanvasText`.
  3. **A low-vision resident at 400% zoom (320 CSS px)** with colour-vision deficiency, who sees part of the box at a time, and can't tell danger-red from success-green.
  4. **A resident with a cognitive disability, or reading Finnish as a second language,** under stress, who needs to know in one sentence what happened and what to do, with no timer and nothing that disappears.
  5. **A staff user in compact density** who sees ten saves an hour and must still notice the one that failed.
- **Job to be done:** When something happens that matters to what I'm doing, I want to see and hear what happened and what I can do about it, without losing my place, so I can finish my task or get help.
- **Context:** any device. In the content of a page, near what it's about. Present when the page loads, or inserted after an action.
- **Constraints:** headless packages ship no CSS (hard rule 5). Choices are classes, not props. No hard-coded strings: the status words are i18n keys in all six locales, overridable per provider and per instance. Announcements only through the shared Announcer. Only DESIGN.md tokens. No new runtime dependency.
- **Success criteria:**
  - 0 axe violations in every story, in the four themes, RTL and forced colours.
  - In every story that uses a ready-made root, the status is in text in the accessibility tree (a11y snapshot: the title starts with the status word).
  - A dynamic alert with `announce` puts its text in the polite (or assertive) region once (e2e), and an alert present at load puts nothing there.
  - No part ever renders `role`, `aria-live` or `aria-atomic` (unit test).
  - The four statuses are told apart in forced colours by icon shape (screenshot review) and by text.
  - Removing `theme.css`, or replacing the status class, never removes the icon or the status word (unit test and story).
  - No horizontal scroll at 320px with the Finnish fixture, and nothing clipped under the 1.4.12 overrides.
  - In the usability test (§8): participants say what happened and what to do next for each example, and screen-reader users hear the dynamic ones.
- **Evidence:** none from users. Prior art is cited in §2.
- **Assumptions and research questions:**
  - Assumption: an icon shape plus a title that states the outcome is enough for sighted users, so the status word can be visually hidden (as `Field.ErrorMessage`'s "Fel:" is; decided, §11 D4). → RQ: can participants with colour-vision deficiency, and Contrast Themes users, say which of four alerts is the error without reading the title? If not, revisit D4.
  - Assumption: a polite announcement after Send is heard in time and isn't lost to the screen reader's own feedback on the button. → RQ: in the AT run, is "Fel: Vi kunde inte skicka din ansökan" heard after pressing Send, in NVDA, JAWS, VoiceOver (macOS, iOS) and TalkBack?
  - Assumption: residents don't look for a close button and aren't bothered that alerts can't be dismissed. → RQ: does anyone try to close one, and why? (§11, open question 1.)

## 2. Prior art

| Source                                                                                                                                                                                                                                                        | What we reuse                                                                                                                                                                                                                                           | What we change and why                                                                                                                                                                                              |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| DESIGN.md Components ("Alerts use the `-subtle` background with a 4px inline-start border in the status colour, an icon, and a heading that states the status in words"), Colors (`primary-subtle` "info backgrounds"), Shapes (status icons differ in shape) | All of it: the four `-subtle` backgrounds, the 4px bar (`--kv-indicator-width`), the four status icon shapes, status never by colour alone                                                                                                              | "A heading that states the status in words" becomes a **title** that states the outcome, plus a **status word** that's always in the text. A title can be a `<p>` for a one-line alert (§6.3)                       |
| KvirnUI Card and Section: one part class, choices as modifier classes, look as plain CSS on the class                                                                                                                                                         | The status is a modifier class, `kv-alert--<status>`, and its look is only CSS and component tokens on that class                                                                                                                                       | The four ready-made roots render their status class themselves, as every part renders its own class, because the choice is which component you render, not a prop (§6.2)                                            |
| `Field.ErrorMessage`: the `error` icon, the visually hidden `field.errorPrefix` "Fel:" in its own span, not a live region                                                                                                                                     | The pattern: a decorative icon, a status word in its own span at the start of the text, visually hidden by the theme and visible without it, overridable through `messages`                                                                             | The word goes in the **Title**, so heading navigation hears "Varning: …". Four keys, one per status                                                                                                                 |
| Announcer: `useAnnouncer()`, a polite and an assertive region already in the page, clear-then-set                                                                                                                                                             | Every announcement. The Alert never renders a live region                                                                                                                                                                                               | Opt-in per instance with `announce`, because the component can't tell "present at load" from "inserted after an action" (§7.2)                                                                                      |
| [GOV.UK notification banner](https://design-system.service.gov.uk/components/notification-banner/)                                                                                                                                                            | Three uses (a problem with the service, something that affects the user, the outcome of what they just did). Heading level is the consumer's (default 2). "Avoid showing more than one notification banner on the same page." Not for validation errors | GOV.UK uses `role="region"` for neutral banners and `role="alert"` plus focus for success. We use **no role**: no landmark per message, and focus or the Announcer for outcomes, never both (§7.2)                  |
| [GOV.UK warning text](https://design-system.service.gov.uk/components/warning-text/)                                                                                                                                                                          | A warning about consequences next to the action, an `aria-hidden` icon and a visually hidden "Warning"                                                                                                                                                  | Not a separate component: it's an `Alert.Warning` with only a Title rendered as `<p>` (Example C2)                                                                                                                  |
| [GOV.UK error summary](https://design-system.service.gov.uk/components/error-summary/)                                                                                                                                                                        | Top of `main`, heading "There is a problem", links to each field worded like the field's error, focus moves to it                                                                                                                                       | A separate **block** (M4) composed from `Alert.Danger` (§3.3), with the danger bar, not GOV.UK's full border. GOV.UK nests `role="alert"` in it as well as moving focus. We only move focus, so it isn't read twice |
| [Designsystemet Alert](https://designsystemet.no/en/components/docs/alert/overview) (NO)                                                                                                                                                                      | The four statuses and names (info, success, warning, danger). A heading only when the message is longer than a sentence. Actions instead of a generic close icon. "Avoid multiple alerts on the same page"                                              | The name "Alert" (§3.1). Its `role="alert"` for critical and `role="status"` for informational messages: we never put a live role on the visible box                                                                |
| [Aksel LocalAlert and GlobalAlert](https://aksel.nav.no/komponenter/core/localalert) (NAV, NO)                                                                                                                                                                | Local (near the event) versus global (top of the page) placement. Icons have default text per severity, read as part of the content                                                                                                                     | Aksel's LocalAlert has `role="alert"` by default and asks you to remove it where it's wrong. We choose the opposite default: nothing is announced unless the consumer asks (§7.2)                                   |
| [WCAG 2.2 Understanding 4.1.3](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html), techniques ARIA22 and ARIA19                                                                                                                                | Status messages that don't take focus must reach AT. A live region must exist before its content changes                                                                                                                                                | The Announcer's regions carry the message; the visible box has no role (§7.2, known risk listed)                                                                                                                    |

No APG pattern for the visible block. APG's [Alert pattern](https://www.w3.org/WAI/ARIA/apg/patterns/alert/) is the `alert` live region, which the Announcer already provides, and APG warns that alerts shouldn't appear on load or disappear on their own.

## 3. Scope: what is an Alert, and what isn't

### 3.1 The name: Alert

**Decision (Plan 0042, maintainer, 2026-10-04): `Alert`, and the error status is `Danger`.** This reverses the original decision of this spec, which was `Notification`. The component is `Alert`, because that is the word adopters and the prior art (Designsystemet and Aksel) use. `role="alert"` stays an implementation detail of the Announcer's assertive region.

- **It's already the word.** DESIGN.md (Components: "Alerts …", Cards: "status belongs in an alert"), the Card decision's follow-up ("status panels (Alert) as their own component"), `card.md` §6.1 and `section.md` §6.1 and §6.9 all say Alert. Designsystemet's Alert and Aksel's LocalAlert and GlobalAlert are the closest prior art.
- **`Alert` is the component, not the role.** In ARIA and APG, `alert` is an assertive live region that interrupts the user. Our component is not assertive: most alerts are on the page when it loads and must **not** be announced. So the Alert box has no `role`, no `aria-live` and no `aria-atomic`, and a development warning fires when a consumer adds one. A message that must be heard goes through the Announcer (`announce`), whose assertive region is the one `<div role="alert">` (so `getByRole('alert')` finds only that region). The docs page starts with a one-line "this is not assertive" note, because adopters will read the name as the role.
- **`AlertDialog` is a different word** (roadmap M2). It is modal, takes focus and needs a response, and an Alert never does. Libraries that have both (Chakra, Radix) keep the two names apart without trouble.
- **`Danger`, not `Error` or `Alert`,** matches the `danger` tokens and `kv-button--danger`, so the class, the token and the component use one word. The status word users hear is still "Error:" / "Fel:", because that's what the message is.
- **The cost:** "Alert" can suggest a push or OS alert, something that goes away, or `role="alert"`. The first sentence of the docs says what it is (§4.3), the "not assertive" note follows it, and the transient kind has its own name, Toast.

### 3.2 Related things, and which ones are this component

| Thing                                                                                         | This component?                                                                     | Relation                                                                                                                                                                                                                                                                                                       |
| --------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A status message in the content, present at load or inserted after an action                  | **Yes**                                                                             | –                                                                                                                                                                                                                                                                                                              |
| GOV.UK "warning text": a consequence next to an action ("You can't change it after you send") | **Yes:** `Alert.Warning`, Title as `<p>`                                            | Example C2                                                                                                                                                                                                                                                                                                     |
| Toast (M3): floats, goes away by itself                                                       | **No.** Separate component                                                          | It reuses the `kv-alert` look and the same status words and icons (decided, §11 D9), and announces through the same Announcer (the Announcer decision follow-up). A Toast must never hold anything the user needs to finish the task, and never an error (2.2.1, 2.2.3). For residents, prefer an inline Alert |
| Error summary (M4 block)                                                                      | **No.** A block **built on** `Alert.Danger`                                         | `Alert.Danger tabIndex={-1}`, a Title "Det finns ett problem" / "There is a problem" (`h2`), and a Body with a list of Links to each field's `controlId`. The block moves focus to it on submit and doesn't set `announce`. Its link texts equal the fields' error messages (§3.3)                             |
| `Field.ErrorMessage`                                                                          | **No.** It stays the field's own part                                               | Shares the `error` icon and the status word idea. An Alert never replaces a field's error, and an error summary never replaces the field errors either: both are shown                                                                                                                                         |
| "Inset text" (GOV.UK): a neutral aside, a quote, an example                                   | **No.** It's not a status                                                           | Plain content. A quotation is prose's `blockquote` (its `border-control` bar). A neutral aside has no component or class in this version (decided, §11 D11). Never a `-subtle` background                                                                                                                      |
| A modal confirmation, a timeout warning that needs a response                                 | **No.** `AlertDialog` / `Dialog` (M2)                                               | A session timeout warning (2.2.1) needs a response and focus, so it's a dialog                                                                                                                                                                                                                                 |
| A status tag on an item ("Väntar på beslut")                                                  | **No.** A Badge                                                                     | Metadata on a thing, not a message                                                                                                                                                                                                                                                                             |
| A site-wide outage message at the top of every page                                           | **Yes**, placed at the top of `main` or just before it, outside the header landmark | Example A's pattern. One at a time. This is the one case where it may be a named landmark (§7.1)                                                                                                                                                                                                               |

### 3.3 The error summary, built from an Alert (for the M4 block, not in this component)

Recorded here so the Alert's API fits it:

```
Alert.Danger tabIndex=-1 ref=summaryRef        (div.kv-alert.kv-alert--danger; focused once, on a failed submit)
  [icon: error, aria-hidden]
  Alert.Title (h2)   [Fel:] Det finns ett problem
  Alert.Body
    ul
      li > Link href=#<controlId>   Ange ditt personnummer i formatet ÅÅÅÅMMDD-XXXX
      li > Link href=#<controlId>   Välj minst en dag
```

- Focus moves to the Root on submit, which reads the title and lets the user Tab to the links. No `announce` (a focus move already reads it; both would read it twice).
- **Decided (§11 D6):** the error summary uses the danger Alert look, the 4px bar, not DESIGN.md's current "danger border" all round, so residents learn one look for "error about this page". DESIGN.md's Error summary bullet changes (§9.2).

## 4. Content

### 4.1 Component strings (`@kvirn-ui/i18n`, all six locales)

Each ready-made root's status word starts its Title. It includes its punctuation, like `field.errorPrefix`, so a locale controls it. Agents write `fi`, `nb` and `nn`. The `se` (Northern Sámi) words are real Sámi, not English placeholders (the maintainer's decision, 2026-10-02).

| Key                   | Used by         | en             | sv             | fi (draft)  | nb (draft)     | nn (draft)     | se                       |
| --------------------- | --------------- | -------------- | -------------- | ----------- | -------------- | -------------- | ------------------------ |
| `alert.infoPrefix`    | `Alert.Info`    | `Information:` | `Information:` | `Tiedoksi:` | `Informasjon:` | `Informasjon:` | `Dieđut:` (draft)        |
| `alert.successPrefix` | `Alert.Success` | `Success:`     | `Klart:`       | `Valmis:`   | `Fullført:`    | `Fullført:`    | `Gárvvis:` (draft)       |
| `alert.warningPrefix` | `Alert.Warning` | `Warning:`     | `Varning:`     | `Varoitus:` | `Advarsel:`    | `Åtvaring:`    | `Váruhus:` (draft)       |
| `alert.dangerPrefix`  | `Alert.Danger`  | `Error:`       | `Fel:`         | `Virhe:`    | `Feil:`        | `Feil:`        | `Boasttuvuohta:` (draft) |

- **Why four new keys and not `field.errorPrefix`:** a site may want "Viktigt:" for danger alerts and keep "Fel:" for field errors. The values match today.
- **Overrides, first match wins:** `<Alert.Danger messages={{ dangerPrefix: 'Viktigt:' }}>` (each ready-made root reads only its own key; or `useAlert({ messages })`), then the nearest provider's `messages.alert` and its ancestors, then built-in `en`. An empty or whitespace-only value falls through. Overriding the **word** is fine; it can't change which status the word belongs to.
- **`Alert.Root` uses none of these keys.** A consumer who builds on the plain Root brings their own word from their own translations (§6.2).
- **No other component strings.** The announcement is the alert's own visible text (§7.2), so there's no announcement key.

### 4.2 Writing rules (for the docs page and the content guide)

DESIGN.md Content & Voice applies. Specific to alerts:

1. **The Title says what happened or what to know, in the user's words.** "Vi kunde inte skicka din ansökan", not "Fel" or "Något gick fel". Never only the status word: a ready-made root adds it for you.
2. **The Body says what to do, and by when.** One to three short sentences. Lead with the action and the date (`Intl` for the locale: `31.12.2026` in fi, `2026-12-31` in sv).
3. **Errors** answer, in this order: what happened; whether the user's work is safe; what to do now; another way to get it done (a phone number with opening hours). Say "we" for our failures ("Det blev fel hos oss"), never blame the user, never show error codes alone (put a reference code last, in `numeric`, for support).
4. **Warnings** say the consequence and the deadline: "Förnya det före 12 november, annars kan du få en parkeringsbot."
5. **Success** says what happens next and when: "Du får ett beslut inom 4 veckor." A success with nothing next is usually not needed at all.
6. **Info** is for something the user needs to know before they act. If it isn't needed for the task, leave it out: alerts compete with the task.
7. **Actions:** at most two, verbs ("Försök igen", "Förnya parkeringstillstånd"). Links for navigation, Buttons for actions. No "OK", "Stäng" or "Läs mer".
8. **One alert per region at a time.** Combine messages into one (GOV.UK, Designsystemet). Two danger alerts on one page means the page is broken.
9. **Never on a timer.** It stays until the situation changes or the user leaves (2.2.1, 2.2.3). The transient kind is [Toast](toast.md) (Plan 0071), which is info and success only: a warning or danger message never toasts, it is an Alert.
10. **Plain language, short sentences, no idioms**: second-language readers and easy-to-read (_lättläst_, _selkokieli_) versions must work.
11. **Pick the status by what happened, not by the colour you want.** If no status fits, it isn't an alert (§3.2).

### 4.3 Docs copy (first sentence of `alert.md` and the Storybook Docs page)

> **Not assertive.** Despite the name, an Alert is not `role="alert"` and does not interrupt anyone. That role is only the Announcer's assertive region. See `announce` below.

The note above is the first line of the page (Plan 0042). Then:

> A status message in the content: something people need to know now, or the result of what they just did. Use `Alert.Info`, `Alert.Success`, `Alert.Warning` or `Alert.Danger`: each shows its status with an icon, a word and a colour, never with colour alone. It doesn't announce itself unless you ask, and it never takes focus on its own.

### 4.4 Story fixture strings (`apps/storybook/src/components/alert/alert.fixture.tsx`)

Keys are local to the fixture, with values in all six locales (storybook-presentation.md §4). Agents write `fi`, `nb` and `nn`; `se` falls back to `en` with `lang="en"`. Variables are formatted with `Intl`.

| Key                 | en                                                                                                                                    | sv                                                                                                                            | longest: fi (draft)                                                                                                                                                    | Element                             |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| `deadline.title`    | Applications close on {date}                                                                                                          | Sista dag att ansöka är {date}                                                                                                | Hakuaika päättyy {date}                                                                                                                                                | Title, h2                           |
| `deadline.body`     | Apply before then if you want a summer job in the municipality. We reply to everyone by {replyDate}.                                  | Ansök senast då om du vill ha ett sommarjobb i kommunen. Vi svarar alla senast {replyDate}.                                   | Hae viimeistään silloin, jos haluat kesätyön kunnalta. Vastaamme kaikille viimeistään {replyDate}.                                                                     | Body, p                             |
| `saved.title`       | Your changes are saved                                                                                                                | Dina ändringar är sparade                                                                                                     | Muutoksesi on tallennettu                                                                                                                                              | Title, p                            |
| `permit.title`      | Your parking permit expires on {date}                                                                                                 | Ditt parkeringstillstånd går ut den {date}                                                                                    | Pysäköintilupasi päättyy {date}                                                                                                                                        | Title, h2                           |
| `permit.body`       | Renew it before then, or you may get a parking fine. It takes about 5 minutes.                                                        | Förnya det innan dess, annars kan du få en parkeringsbot. Det tar ungefär 5 minuter.                                          | Uusi lupa ennen sitä, muuten voit saada pysäköintivirhemaksun. Se vie noin 5 minuuttia.                                                                                | Body, p                             |
| `permit.renew`      | Renew parking permit                                                                                                                  | Förnya parkeringstillstånd                                                                                                    | Uusi pysäköintilupa                                                                                                                                                    | Actions, Link                       |
| `consequence.title` | You can't change your answers after you send the application.                                                                         | Du kan inte ändra dina svar när du har skickat ansökan.                                                                       | Et voi muuttaa vastauksiasi sen jälkeen, kun olet lähettänyt hakemuksen.                                                                                               | Title, p                            |
| `sendFailed.title`  | We couldn't send your application                                                                                                     | Vi kunde inte skicka din ansökan                                                                                              | Emme voineet lähettää hakemustasi                                                                                                                                      | Title, h2                           |
| `sendFailed.body`   | Something went wrong on our side. Your answers are saved. Try again in a few minutes, or call us on {phone}, weekdays {open}–{close}. | Det blev fel hos oss. Dina svar är sparade. Försök igen om några minuter, eller ring oss på {phone}, vardagar {open}–{close}. | Järjestelmässämme tapahtui virhe. Vastauksesi on tallennettu. Yritä uudelleen muutaman minuutin kuluttua tai soita meille numeroon {phone} arkisin klo {open}–{close}. | Body, p                             |
| `sendFailed.retry`  | Try again                                                                                                                             | Försök igen                                                                                                                   | Yritä uudelleen                                                                                                                                                        | Actions, Button                     |
| `longFinnish.title` | Processing of your housing adaptation grant application is paused                                                                     | Handläggningen av din ansökan om bostadsanpassningsbidrag är pausad                                                           | Asunnonmuutostyöavustushakemuksesi käsittely on keskeytetty                                                                                                            | Title, h2 (length)                  |
| `ownStatus.word`    | Notice:                                                                                                                               | Observera:                                                                                                                    | Huomio:                                                                                                                                                                | The `BringYourOwn` story's own word |

## 5. Structure

### 5.1 Anatomy

With a ready-made root (`Alert.Warning`):

```
div.kv-alert.kv-alert--warning                  (no role; both classes rendered by Alert.Warning)
  svg.kv-icon.kv-alert-icon  [aria-hidden]               (rendered by Alert.Warning: the `warning` icon)
  h2.kv-alert-title                                      (Title; element via `render`; required)
    span.kv-alert-status  "Varning:"                     (rendered by the Title from the root's context; visually hidden by the theme)
    " Ditt parkeringstillstånd går ut den 12 november 2026"
  div.kv-alert-body                                      (Body; optional)
    p  Förnya det innan dess, …
  div.kv-alert-actions                                   (Actions; optional)
    a.kv-link  Förnya parkeringstillstånd
```

With the plain `Alert.Root` (bring your own; §6.2):

```
div.kv-alert.my-notice                                 (only kv-alert from the component; my-notice is the consumer's)
  svg.kv-icon.kv-alert-icon  [aria-hidden]               (the consumer's <Icon name="…" className="kv-alert-icon" />, or none)
  h2.kv-alert-title
    span.kv-alert-status  "Observera:"                   (the consumer's own span and word; the Title adds nothing)
    " …"
```

Reading order equals DOM order equals visual order: icon (silent), title with its status word, body, actions.

### 5.2 Examples

- **A, info, present at load** (a start page; `h2` under the page's `h1`, before "Start now"): `Alert.Info`, Title `deadline.title`, Body `deadline.body`. No `announce`.
- **B, success, inserted after Save** (My pages or a staff form; the Save button keeps focus): `Alert.Success`, Title `saved.title` rendered as `<p>`, no Body. `announce="polite"`. Placed directly above the form's buttons.
- **C, warning with an action, present at load** (My pages): `Alert.Warning`, Title `permit.title` (`h2`), Body `permit.body`, Actions with a Link `permit.renew`.
- **C2, warning text next to an action** (the check-answers page, above Send): `Alert.Warning`, Title `consequence.title` rendered as `<p>`, no Body. No `announce`.
- **D, danger, inserted after Send fails** (the check-answers page; the Send button keeps focus): `Alert.Danger`, Title `sendFailed.title` (`h2`), Body `sendFailed.body`, Actions with a Button `sendFailed.retry`. `announce="polite"`. Placed directly above Send, so a magnifier user looking at Send sees it, and Shift+Tab from Send reaches "Försök igen".

### 5.3 Per breakpoint

| Width               | Padding (block / inline) | Icon to text gap | Actions                            | Text column (16px page gutter)             |
| ------------------- | ------------------------ | ---------------- | ---------------------------------- | ------------------------------------------ |
| 320px               | 16px / 12px              | 8px              | Stacked, full width, start-aligned | 320 − 32 − 4 − 1 − 24 − 20 − 8 = **231px** |
| 40rem               | 16px / 16px              | 12px             | In a row, start-aligned, wrapping  | Body capped at `--kv-prose-measure` (70ch) |
| 64rem, `kv-compact` | 12px / 12px              | 8px              | In a row                           | –                                          |

The icon stays beside the title at every width. At 231px a line holds about 26 characters at 18px: long Finnish compounds hyphenate (`fi` dictionary) or break (§6.3).

## 6. Visual specification

### 6.1 API surface (for the plan; the engineer owns the details)

**Parts.** Every part is also a named export, `Alert` + part name, the convention in `docs/architecture.md` ("`Disclosure.Trigger` and the named export `DisclosureTrigger`"):

| Part            | Named export   | Renders                                                                                               | Props (besides every `div` attribute, `ref`, `className` and `render`) |
| --------------- | -------------- | ----------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| `Alert.Root`    | `AlertRoot`    | `<div class="kv-alert">`. No status class, no icon, no status word                                    | `announce`                                                             |
| `Alert.Info`    | `AlertInfo`    | `<div class="kv-alert kv-alert--info">`, the `info` icon first, and the status word context           | `announce`, `messages`                                                 |
| `Alert.Success` | `AlertSuccess` | The same with `kv-alert--success`, the `success` icon and `alert.successPrefix`                       | `announce`, `messages`                                                 |
| `Alert.Warning` | `AlertWarning` | The same with `kv-alert--warning`, the `warning` icon and `alert.warningPrefix`                       | `announce`, `messages`                                                 |
| `Alert.Danger`  | `AlertDanger`  | The same with `kv-alert--danger`, the `error` icon and `alert.dangerPrefix`                           | `announce`, `messages`                                                 |
| `Alert.Title`   | `AlertTitle`   | `<h2 class="kv-alert-title">`; inside a ready-made root, the status span first, a space, the children | –                                                                      |
| `Alert.Body`    | `AlertBody`    | `<div class="kv-alert-body">`                                                                         | –                                                                      |
| `Alert.Actions` | `AlertActions` | `<div class="kv-alert-actions">`                                                                      | –                                                                      |

**Why `AlertInfo` and not `InfoAlert`:** the architecture's convention is component first, then part, so every export of the component sorts together in autocomplete, in the docs' API table and in tree-shaking reports (`AlertRoot`, `AlertInfo`, `AlertTitle`). `InfoAlert` would be the only export in the library that breaks it. The ready-made roots are Roots, so they sit next to `Alert.Root` in the vocabulary.

- **`announce?: AnnouncerPoliteness`** (`'polite' | 'assertive'`, the core type re-exported by `@kvirn-ui/react`), default none, on all five roots (§7.2).
- **`messages?: Partial<KvirnMessages['alert']>`** on the ready-made roots. Each reads only its own key.
- **Types:** `AlertVariant` (`'info' | 'success' | 'warning' | 'danger'`, used by the hook and by dynamic selection), `UseAlertOptions`, `UseAlertResult`, `AlertRootProps` (the plain Root), `AlertStatusRootProps` (the four ready-made roots: `AlertRootProps` plus `messages`), `AlertTitleProps`, `AlertBodyProps`, `AlertActionsProps`.
- **`useAlert({ variant?, announce, messages })`** for your own elements. Without `variant`, it's the plain Root: `rootProps` (`kv-alert`), `titleProps`, `bodyProps`, `actionsProps`. With `variant`, it's a ready-made root: `rootProps` also has the status class, and it returns `iconProps` (`name` and `className` for `<Icon>`) and `statusProps` (`className` and `children`, the resolved word), all from one table, so the hook gives the same agreement as the components. `titleProps` and `bodyProps` carry the refs the announcement reads. The hook option exists because the hook must offer what the components do (API conventions: hook and compound); it isn't a component prop (§11 open question 2).
- **Dynamic selection (status from data)** in v1 is a typed map in the consumer's code, no prop needed:

  ```tsx
  const alertFor = {
    info: Alert.Info,
    success: Alert.Success,
    warning: Alert.Warning,
    danger: Alert.Danger,
  } satisfies Record<AlertVariant, unknown>
  const ResultAlert = alertFor[result.variant]
  ```

  **Later sugar, not v1:** a `variant` prop on `Alert.Root` that makes it behave exactly like the matching ready-made root (class, icon, word). Without the prop, Root stays plain. Add it only if adopters ask: the map is three lines, typed, and keeps the choice visible in the JSX. The name is `variant` (the maintainer's rule), never `status` or `tone`.

- **Dev warnings** (`warnOnce`, silent in production):
  1. A root with no Title: "An Alert needs a Title: it holds the status word and names the message."
  2. A Title, Body or Actions outside a root.
  3. Any root given `role="alert"`, `role="status"` or `aria-live`: "It's announced through the Announcer (`announce`). A second live region reads it twice."
  4. `announce="assertive"` on `Alert.Info` or `Alert.Success`.
  5. **A ready-made root whose `className` (or a `render` element's) contains a different status class**, such as `<Alert.Warning className="kv-alert--danger">`: "The colour would say danger and the icon and word say warning. Use Alert.Danger."
  6. **A plain `Alert.Root` with one of our status classes** (`kv-alert--danger`): "This gives the danger colour without the icon and the status word. Use Alert.Danger, or your own class with your own icon and word."

### 6.2 Status by class, content by ready-made roots

| Ready-made root | Class it renders    | Background (CSS on the class) | Bar and icon colour (CSS) | Icon (built-in name, shape) | Status word key       |
| --------------- | ------------------- | ----------------------------- | ------------------------- | --------------------------- | --------------------- |
| `Alert.Info`    | `kv-alert--info`    | `primary-subtle`              | `primary`                 | `info`, a square            | `alert.infoPrefix`    |
| `Alert.Success` | `kv-alert--success` | `success-subtle`              | `success`                 | `success`, a circle         | `alert.successPrefix` |
| `Alert.Warning` | `kv-alert--warning` | `warning-subtle`              | `warning`                 | `warning`, a triangle       | `alert.warningPrefix` |
| `Alert.Danger`  | `kv-alert--danger`  | `danger-subtle`               | `danger`                  | `error`, an octagon         | `alert.dangerPrefix`  |

**How this follows the theme-delivery decision without an exception.** The look of a status is **only** CSS on its modifier class: each class sets two component tokens, `--kv-alert-background` and `--kv-alert-accent`, and nothing in the components knows about colour. The choice is not a prop: the consumer chooses by **which component they render**, and each ready-made root renders its own classes, the way every part renders its own class. The plain `Alert.Root` renders only `kv-alert`. `data-*` stays state (an alert has none).

**Why ready-made roots, not classes alone.** A status decides three things that must agree: the colour (theme), the icon and the status word screen readers hear. With a class alone, the headless component can't know the status, so a red box could say "Information:" or show the info square (a 1.3.1 and 1.4.1 failure). Each ready-made root takes its class, its icon name and its message key from **one internal table**, so with a ready-made root the three can't disagree:

- The icon and the word don't depend on the theme or on the class. Without `theme.css`, or with the class replaced, the icon and the word are still there.
- The consumer can't pass a status to a ready-made root (there's no prop), and a conflicting status class gives dev warning 5.
- `messages` can change the word's wording ("Viktigt:"), not which status it belongs to. The icon registry can change the drawing of `error`, not which name Danger uses. The docs say a replacement icon must keep its shape distinct from the other three.

**Why there's no default status.** The plain Root is deliberately unopinionated: no status class, no icon, no word. The theme gives a bare `.kv-alert` a neutral fallback (`surface` and a `border-control` bar), so a consumer's own status class only has to set the two tokens. A message with no status isn't an alert (§3.2): the docs say to pick a ready-made root, and `Alert.Info` when unsure.

**How a consumer restyles, from least to most work:**

| You want                                         | Do                                                                                                                                                                                                                                                                                              | You keep                                                                                                     |
| ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Our structure, your colours or spacing           | Set the tokens in your own (unlayered) CSS: `.kv-alert--warning { --kv-alert-background: …; --kv-alert-accent: … }`, or the semantic tokens and scales (`--kv-color-warning-subtle`, `--kv-warning-*`), or the spacing tokens on `:root`. Your CSS wins over `@layer kv`. Run `checkThemeCss()` | Everything: icon, word, announce, our classes                                                                |
| Our component, your own look entirely            | Skip or copy `theme.css` and style `kv-alert` and `kv-alert--warning` yourself. Or keep the theme and **drop our class**: use the `render` function form, which gives you the part props, and set your own `className` (`render={(props) => <div {...props} className="my-warning" />}`)        | The icon, the word and `announce`, from `Alert.Warning`                                                      |
| Your own icon or word, or a status we don't have | `Alert.Root` with your class, your `<Icon name="…" className="kv-alert-icon" />` first, and your own `<span className="kv-alert-status">` with your translated word first in the Title                                                                                                          | The layout, the Title, Body, Actions and `announce`. **You own the agreement** between colour, icon and word |
| A different icon drawing everywhere              | Register `info`, `success`, `warning` or `error` in `KvirnProvider`. Every ready-made root uses it                                                                                                                                                                                              | Everything else                                                                                              |

**No look-only modifier classes in v1.** Density comes from `kv-compact`. No size, no "subtle" variant, no "no icon" variant: on a ready-made root, the icon is one of the two non-colour cues.

### 6.3 Parts and look

| Part    | Element                                               | Style (default theme)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| ------- | ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Root    | `<div>`, no role (all five roots)                     | `display: grid`. With an icon as a direct child (`:has(> .kv-alert-icon)`), two columns (`auto 1fr`): the icon in the first, every other child in the second, in DOM order; without one, a single column. `box-sizing: border-box`, `min-inline-size: 0`, `max-inline-size: 100%`. `background-color: var(--kv-alert-background)` and `color: var(--kv-color-text)`, set together. **Edge:** `border-inline-start: var(--kv-indicator-width) solid var(--kv-alert-accent)` (4px), and 1px (`--kv-border-width`) `transparent` on the other three sides. **Radius:** `--kv-radius-sm` (4px; decided, §11 D7): its inner radius is 0, so the bar's inner edge stays straight and reads as a bar, where `md` (8px) would curve it into a bracket. No shadow, no transition. **Padding** per §5.3. **Text:** `overflow-wrap: break-word`, `hyphens: auto`, `hyphenate-limit-chars: 10 4 4` (the hyphenation decision: alerts join prose and cards; never in code). **Never** `overflow`, `clip-path` or a fixed size: a link's focus ring inside is never clipped (2.4.11, 2.4.13) and text spacing never cuts text (1.4.12). No margin: spacing around it is the consumer's |
| Icon    | `<svg class="kv-icon kv-alert-icon">`                 | Rendered by the ready-made roots (or by the consumer on a plain Root). `md` (1.25em of 16px, so 20px), `color: var(--kv-alert-accent)`, `aria-hidden`. Centred on the Title's **first line**, and still on it under 1.4.12 line height and when the title wraps (the `lh` technique of `kv-field-error-message`). Never mirrors in RTL                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| Title   | `<h2>` by default; any heading or `<p>` with `render` | `--kv-font-family-body` (sans, not the heading serif; decided, §11 D8: it's a message label, and serif at this size would read as a new page section), 1.125rem, weight 600, line height 1.4, `color: var(--kv-color-text)`, `margin: 0`, `max-inline-size: var(--kv-prose-measure)`. In `kv-compact` from 64rem: 1rem, line height 1.5. Inside a ready-made root it starts with the status span, a normal space, then the children; inside a plain Root, only the children                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| Status  | `<span class="kv-alert-status">` first in the Title   | Visually hidden by the theme (decided, §11 D4) with the same rule as `kv-field-error-prefix` (1px, `clip-path: inset(50%)`, never `display: none`), so screen readers read it and it's in the heading list. Without the theme it shows, which is correct unstyled. The theme hides any `.kv-alert-status`, so a consumer's own span on a plain Root behaves the same                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| Body    | `<div>`                                               | `body` (16px, `text`), `margin-block-start: var(--kv-space-2)` after the Title, `max-inline-size: var(--kv-prose-measure)`. Its own children: first and last block margins 0, `space-2` between blocks, lists keep their markers with `padding-inline-start: var(--kv-space-6)`, all at zero specificity (`:where()`). Links are `Link` (`kv-link`, underlined). Put `kv-prose` on the Body for CMS content, which turns prose on inside it, as in a card                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| Actions | `<div>`                                               | The button-group layout built in (no `kv-button-group` needed: arranging actions is the part's only job): a wrapping row with a `space-3` gap, start-aligned, primary first; below 40rem a column of full-width buttons. `margin-block-start: var(--kv-space-4)` (`space-3` in compact). Buttons keep their own size (44px, 32px in compact from 64rem). Links stay links. Buttons are secondary by default: an alert rarely holds the view's one primary action                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |

**Component tokens** (aliases of semantic tokens, no new colours or values):

| Token                       | Set on                                    | Value                                                                                                         |
| --------------------------- | ----------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `--kv-alert-background`     | `.kv-alert` (fallback), each status class | `surface` on the bare class; `primary-subtle`, `success-subtle`, `warning-subtle`, `danger-subtle` per status |
| `--kv-alert-accent`         | `.kv-alert` (fallback), each status class | `border-control` on the bare class; `primary`, `success`, `warning`, `danger` per status                      |
| `--kv-alert-padding-block`  | `:root`, `40rem`, compact from `64rem`    | `space-4`; `space-4`; `space-3`                                                                               |
| `--kv-alert-padding-inline` | `:root`, `40rem`, compact from `64rem`    | `space-3`; `space-4`; `space-3`                                                                               |
| `--kv-alert-gap`            | `:root`, `40rem`, compact from `64rem`    | `space-2`; `space-3`; `space-2`                                                                               |

The status classes set only the two colour tokens, so "change the default style" means changing tokens, and "design your own" means replacing two declarations or the class.

**Prose:** `.kv-alert` joins the prose boundary list next to `.kv-card`: nothing inside is prose-styled (so an `h2` Title in an article doesn't get prose's serif and 32px margin), the Root gets prose's block margins, and `kv-prose` inside turns prose on again.

**Nesting:** an Alert may sit on the page, in a Section or in a Card body. Never a Card or a Section inside an Alert, and never an Alert in an Alert.

### 6.4 States

| Part        | default | hover | focus-visible                                                                                                                                                        | active | disabled | invalid | loading | selected / open | empty                                     |
| ----------- | ------- | ----- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | -------- | ------- | ------- | --------------- | ----------------------------------------- |
| Root        | §6.3    | none  | Only when the consumer made it focusable (`tabIndex={-1}`, §7.3): the 2px `focus-ring` with a 2px offset, outside the box, following the `sm` radius (2.4.7, 2.4.13) | none   | none     | none    | none    | none            | The consumer doesn't render it            |
| Title, Body | §6.3    | none  | none                                                                                                                                                                 | none   | none     | none    | none    | none            | A root with no Title warns in development |
| Actions     | §6.3    | none  | none (its Links and Buttons show their own ring)                                                                                                                     | none   | none     | none    | none    | none            | The consumer doesn't render it            |

An alert is never interactive as a whole: no hover, no pointer cursor, no shadow, no click handler. It appears and disappears **instantly**, with no motion in any preference (no layout animation when an error appears, as for field errors).

### 6.5 Modes

- **Dark, light-contrast, dark-contrast:** only the tokens change. The `-subtle` backgrounds are step 50 in the light themes and step 950 in the dark themes, so an alert is slightly lighter than the dark page and slightly tinted on the light one. Text pairs are 7:1 or more in the contrast themes (§6.6).
- **Forced colours** (what carries status without colour): the background becomes `Canvas`, text `CanvasText`, links `LinkText`. An explicit rule `@media (forced-colors: active) { .kv-alert { border-color: CanvasText } }` draws all four edges, with the 4px bar kept at 4px, so the box and its bar survive. The icon takes `CanvasText` (DESIGN.md Shapes). **All four statuses then share one colour, so the status is carried by the icon's shape (square, circle, triangle, octagon), the status word in the accessibility tree, and the title's words.** No `forced-color-adjust: none`.
- **RTL:** logical properties only. The bar and the icon sit on the right. Status icons never mirror. Actions follow the inline direction.
- **Motion:** none. Reduced motion changes nothing.
- **320px, 400% zoom, 1.4.12:** no fixed sizes, no `overflow`, `min-inline-size: 0`, hyphenation then `overflow-wrap: break-word`. The icon stays on the title's first line under the text-spacing overrides. Actions stack below 40rem. Text spacing grows the height.
- **Density:** `kv-compact` from 64rem reduces padding, the gap and the Title size (§5.3, §6.3). The Body stays 16px.
- **Print:** backgrounds don't print by default, but the 4px bar (a border) and the icon do, so the status stays visible on paper.
- **Without `theme.css`:** no colour, no bar, no hidden word: the icon and "Varning: …" show as plain text, which is a correct unstyled alert.

### 6.6 Contrast and `theme:check`

Measured on 2026-10-02 with `resolveThemeColors()` and `contrastRatio()` from `packages/theme/src` against the current `theme.css`. **Every pair an Alert needs is already in `contrast-requirements.ts`. No new colour, token value or pair is required.** None of the pairs below may be removed. The bare `.kv-alert` fallback (`text` on `surface`, a `border-control` bar) uses plain-background pairs that are already required.

| Pair on the alert background (`primary-subtle` / `success-subtle` / `warning-subtle` / `danger-subtle`) | Minimum     | light                   | dark                    | light-contrast          | dark-contrast           | In `contrast-requirements.ts`                          |
| ------------------------------------------------------------------------------------------------------- | ----------- | ----------------------- | ----------------------- | ----------------------- | ----------------------- | ------------------------------------------------------ |
| `text`, `heading` (Title, Body)                                                                         | 4.5:1 (7:1) | 16.80/17.14/17.44/16.93 | 14.66/14.96/15.02/15.83 | 18.41/18.77/19.10/18.54 | 15.59/15.91/15.98/16.84 | Yes (`textPairs`)                                      |
| `text-muted` (metadata only, such as a reference code)                                                  | 4.5:1 (7:1) | 5.48/5.59/5.69/5.52     | 4.80/4.90/4.92/5.18     | 9.58/9.77/9.94/9.65     | 10.68/10.89/10.94/11.53 | Yes                                                    |
| `link`                                                                                                  | 4.5:1 (7:1) | 5.21/5.31/5.41/5.25     | 5.44/5.55/5.57/5.87     | 8.72/8.90/9.05/8.79     | 8.33/8.50/8.54/9.00     | Yes                                                    |
| `link-hover`                                                                                            | 4.5:1 (7:1) | 6.28/6.40/6.51/6.32     | 7.35/7.50/7.54/7.94     | 11.16/11.38/11.58/11.24 | 10.44/10.66/10.70/11.28 | Yes                                                    |
| The status's own accent: bar and icon (`primary`/`success`/`warning`/`danger` on its own `-subtle`)     | 3:1         | 4.15/5.46/5.79/5.69     | **3.32**/8.62/8.65/7.50 | 8.72/8.42/9.61/7.31     | 8.33/10.66/11.14/9.97   | Yes (`primary` non-text 3:1; the others as text 4.5:1) |
| `focus-ring` (a link's or button's ring inside)                                                         | 3:1         | 4.15/4.23/4.30/4.18     | 5.44/5.55/5.57/5.87     | 8.72/8.90/9.05/8.79     | 8.33/8.50/8.54/9.00     | Yes                                                    |
| `border-control`, `secondary` (a secondary button's edge in Actions)                                    | 3:1         | 4.39/4.48/4.56/4.42     | **3.13**/3.20/3.21/3.38 | 9.58/9.77/9.94/9.65     | 10.68/10.89/10.94/11.53 | Yes                                                    |
| `primary` (a primary button's fill, a hovered secondary button's edge)                                  | 3:1         | 4.15/4.23/4.30/4.18     | 3.32/3.39/3.40/3.58     | 8.72/8.90/9.05/8.79     | 8.33/8.50/8.54/9.00     | Yes                                                    |

| Pair on the page around it (`canvas` / `surface` / `surface-raised`)                    | Minimum | light                                 | dark                      | light-contrast            | dark-contrast                | In `contrast-requirements.ts` |
| --------------------------------------------------------------------------------------- | ------- | ------------------------------------- | ------------------------- | ------------------------- | ---------------------------- | ----------------------------- |
| The bar's outer side: `primary` / `success` / `warning` / `danger`, lowest of the three | 3:1     | 4.42 / 5.70 / 5.95 / 6.02             | 3.75 / 9.53 / 9.52 / 7.84 | 9.29 / 8.80 / 9.86 / 7.73 | 9.40 / 11.80 / 12.27 / 10.42 | Yes                           |
| `focus-ring` around a focused Root (error summary, arrival)                             | 3:1     | covered by the plain-background pairs | –                         | –                         | –                            | Yes                           |

**Decorative, not enforced:** the `-subtle` background against the page is 1.03–1.34:1 in every theme. That's fine: the box isn't a control (1.4.11 doesn't apply), and its edge is the bar, which passes 3:1 on both sides.

Lowest numbers to watch: `border-control` and `secondary` on `primary-subtle` in dark (**3.13:1**, a secondary button in an info alert), and `primary` on `primary-subtle` in dark (**3.32:1**, the info bar and icon). Info keeps the accent (decided, §11 D5). A rebrand of `--kv-primary-*` can break these first: the docs' theming page says so, and a consumer who sets their own `--kv-alert-*` values runs `checkThemeCss()` on their colours.

**Changes to `theme:check` (engineering task, no new values):**

1. Rename the comment on `statusBackgrounds` from "The status panels" to "Alerts (info uses `primary-subtle`)". Optionally define `alertBackgrounds = ['primary-subtle', ...statusBackgrounds]` for readability: it adds no pair that isn't already required.
2. **Extend the tinted button-edge check to the four alert backgrounds**, because Actions puts Buttons there and `checkButtonEdges` measures only `canvas`, `surface` and `surface-raised` today. A tinted edge only makes the edge darker in light and lighter in dark, so it should pass, but it's unmeasured. After that change, the orchestrator runs `vp run theme:check`.
3. Not added, on purpose: `danger-hover` on the `-subtle` backgrounds. Destructive buttons don't belong in an alert (DESIGN.md: destructive actions need a confirmation step). The docs say so.

**Known look trade-off:** a secondary Button's hover fill is `primary-subtle`, the info background, so in an info alert its hover shows only as the `primary` edge (3.32:1 dark) and the depth shadow. Hover isn't a WCAG requirement, and focus is the ring. Noted for the design review.

## 7. Accessibility annotations

Draft input for `packages/react/src/alert/alert.a11y.md`.

### 7.1 Roles, names and structure

- **APG pattern:** none for the visible block. **Deviations:** none.
- **Roots (all five):** `<div>`, `generic`. **Never** a `role`, `aria-live`, `aria-atomic`, `aria-label` or `aria-labelledby` from the component. Not a landmark by default: an alert is a message, not a place to jump to. **Landmark option (decided, §11 D10), documented:** for one site-wide alert only (a service outage), render it as a named region: `render={<section aria-labelledby={titleId} />}`, with the Title's `id`. Never for messages about a part of the page.
- **Icon:** decorative (`aria-hidden`). The status is in text.
- **Title:** the status word, then the consumer's text, in one heading: "rubrik nivå 2, Varning: Ditt parkeringstillstånd går ut den 12 november 2026". **The heading level is the consumer's** (1.3.1, 2.4.6): one level below the heading of the part of the page it's in, so usually `h2` directly under the page's `h1`, `h3` inside a section with an `h2`. Never skip levels. A one-sentence alert renders the Title as `<p>` (GOV.UK: "avoid using headings for single-line alerts that do not need them"); the status word is still first.
- **Plain Root:** the component adds no status word and no icon. The consumer's docs checklist: a status word first in the Title (in all their locales), an icon with a distinct shape, both agreeing with their colour (1.3.1, 1.4.1). Dev warning 6 catches our status class on a plain Root.
- **Body and Actions:** generic containers. Links and Buttons inside keep their own names and roles.
- **Language:** `lang` on any part in another language (3.1.2). The status word follows the provider's locale.

### 7.2 Announcements: when an alert is announced, and how

**The rule: the visible alert is never a live region. When it must be heard without focus, the root calls `useAnnouncer().announce(text, { politeness })` once, when it mounts, and only when `announce` is set.** This works the same on all five roots; there are no per-status defaults, so a status never announces by itself.

| When it appears                                                                                                        | Example                                              | Do                                                                                                                                                                                                                                                        | Why                                                                                                                                                                                                                                                                                                                            |
| ---------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Present when the page loads** (server-rendered, or in the first render): deadlines, outages, warnings about the task | A, C, C2                                             | No `announce`, no role, no focus. A heading (or a `<p>` near the action) placed before the content it's about                                                                                                                                             | It's content, read in reading order and found by heading navigation. A live region announces **changes**, not what's there at load. `role="alert"` on load is announced by some screen readers and not by others, interrupts the page title and the `h1` before the user knows where they are, and can fire again on hydration |
| **The outcome of the user's action, after a page load or route change,** shown on a page that's about something else   | "Ändringarna är sparade" back on the case list       | No `announce`. Move focus to the root once on arrival (`tabIndex={-1}`, `ref.focus()`), with `scroll-padding` so it isn't hidden (2.4.11)                                                                                                                 | Moving focus reads it once and puts the user next to it (as GOV.UK's success banner does). Doing both reads it twice                                                                                                                                                                                                           |
| **A confirmation page** whose purpose is the outcome                                                                   | "Ansökan skickad"                                    | The page's `h1` says it, and the router's focus handling reads it. An `Alert.Success` on that page is optional and isn't announced                                                                                                                        | The page is the message                                                                                                                                                                                                                                                                                                        |
| **Inserted in the page after an action, focus stays where it is**                                                      | B, D                                                 | `announce="polite"`. Insert it near the control that caused it                                                                                                                                                                                            | 4.1.3: a status message that doesn't take focus must reach AT. Polite waits for the screen reader to finish its feedback on the button                                                                                                                                                                                         |
| **Inserted, urgent, not caused by the current action, and the user must act now to avoid losing work**                 | "Anslutningen bröts. Det du skriver nu sparas inte." | `Alert.Danger announce="assertive"`. Rare                                                                                                                                                                                                                 | It interrupts. Never for Info or Success (dev warning 4)                                                                                                                                                                                                                                                                       |
| **Errors on submit** (validation)                                                                                      | The error summary block                              | No `announce`: the block moves focus to it                                                                                                                                                                                                                | Focus reads it; the field errors are read when each field gets focus                                                                                                                                                                                                                                                           |
| **Its text changes while it's shown**                                                                                  | Progress, a retry that fails again                   | Not supported by `announce`. Call `useAnnouncer()` yourself. A new React `key` also announces again, but never when the action that triggers it is a button inside the alert: the remount destroys the focused button and focus falls to the page (2.4.3) | One rule that's easy to test: announce on mount, once                                                                                                                                                                                                                                                                          |

Details:

- **The announced text** is what a screen reader would read: the Title's text (which starts with the status word on a ready-made root) and then the Body's text, with block boundaries as spaces. Actions aren't announced: they're controls the user reaches with Tab. Keep dynamic alerts short.
- **No i18n key for the announcement:** it's the visible, already-translated text, so visible and announced always match, on a plain Root too.
- **Why the Announcer, not a role on the box:** a live region inserted together with its text isn't announced by most screen readers, and a box with its own role plus the Announcer would read it twice. One shared, tested place does clear-then-set, so a repeated failure ("Vi kunde inte skicka …" twice) is read twice.
- **Why opt-in:** the component can't tell "present at load" from "inserted after an action" (a hydrated server render and a client insert both mount). The consumer knows, so the consumer says.
- **Known risks** (for the decision and the AT run, all `pending`):
  - 4.1.3 asks that the status message be programmatically determinable through role or properties. Here the message reaches AT through the Announcer's `status` or `alert` region, with the same text, and the visible box has no role. We believe this meets the intent; the manual AT matrix must confirm it.
  - Without a `KvirnProvider`, announcements are dropped after one dev warning. The docs say a provider is required for `announce`.
  - Inside a modal dialog, the Announcer's regions are silenced (the Announcer decision's modal follow-up). Until that's fixed, an alert inside a dialog isn't heard.
  - A consumer who sets `announce` on a server-rendered alert gets it announced after hydration. The docs say: set `announce` only from the state of the action that just happened.

### 7.3 Focus

- An Alert never moves focus, never traps it, and is not a Tab stop.
- The consumer may make it a focus target with `tabIndex={-1}` (the error summary, an arrival message). Then it shows the focus ring on `:focus-visible` (§6.4), Tab from it goes to its first link or button, and it never gets `tabIndex={0}`.
- Inserting an alert never moves focus away from the control the user pressed (3.2.2). Removing one that held focus is the consumer's bug: they move focus first.
- With a sticky header, the page sets `scroll-padding` so a focused alert isn't hidden (2.4.11).

### 7.4 Keyboard (draft of the contract's section)

```md
This component has no focusable parts and handles no keys.

An Alert is never a Tab stop of its own. Links and buttons in its Body and Actions keep their own keys (see `button.a11y.md` and `link.a11y.md`). The optional close button (§7.5) is the one part with a key of its own: it is a native button, so Enter and Space press it.

| Key       | Context                                         | Action                                         | Test                                                                 |
| --------- | ----------------------------------------------- | ---------------------------------------------- | -------------------------------------------------------------------- |
| Tab       | Before an alert with a link in its Actions      | Moves to the link. The alert itself is skipped | `alert.e2e.ts › Tab skips the alert and reaches its link`            |
| Shift+Tab | On the control after the alert                  | Moves back to the alert's last button or link  | `alert.e2e.ts › Shift+Tab reaches the alert's action`                |
| Tab       | On an alert focused by script (`tabIndex={-1}`) | Moves to the first link or button inside it    | `alert.e2e.ts › Tab from a focused alert goes to its first action`   |
| –         | Every root                                      | No `tabindex` is rendered by default           | `alert.test.tsx › rendering › adds no role, live region or tabindex` |
```

The optional `Alert.Close` is a focusable part, so there is a `Keyboard` story (the dismissible example). The e2e rows run on the `Keyboard`, `WithActions` and `FocusTarget` stories.

### 7.5 Dismissing: optional `Alert.Close`

**Decision (maintainer, 2026-10-05, Plan 0045, reverses D12 of v1): dismissing is optional.** `Alert.Close` is a native `<button type="button">` with the built-in `close` icon (decorative), named by `alert.close` ("Stäng meddelandet", all six locales, overridable per provider, root and button). It is `kv-alert-close`, a quiet icon button at the control size (44px, 32px compact, always at least 24px, 2.5.8), in the last column of the first row, at the inline end, and it is last in the DOM.

- The Alert owns no state: the consumer removes it in `onClick`. Persistence (does it come back on the next page?) is the consumer's decision, and nothing is written to storage.
- **Focus decision (2.4.3):** the consumer moves focus in the same handler, to the heading of the part of the page the alert belonged to (`tabIndex={-1}`), to the control that caused the alert, or to a control that brings the message back. Never to `body`. The `Keyboard` story shows it.
- Dismissing never changes the politeness: it announces nothing, and `announce` never reads the button.
- Guidance: offer it only where the user can safely be done with the message (a tip, an info, a saved confirmation). Errors and warnings the user still has to act on should not be dismissible: the problem doesn't go away when the message does, and a resident under stress may close the one thing that told them what to do. Designsystemet's guidance is to give actions that resolve the message instead of a generic close icon. This stays guidance, not a rule in code.
- From M2 the icon-only button may get a tooltip (Plan 0037); its name is already the accessible name.

### 7.6 WCAG success criteria of note

1.1.1 (decorative icon), 1.3.1 (title as a heading, status word in text), 1.3.2 (DOM order), 1.4.1 (icon shape and status word, never colour alone), 1.4.3 and 1.4.6 (text pairs, §6.6), 1.4.10 (320px), 1.4.11 (bar and icon 3:1), 1.4.12 (no fixed heights), 2.2.1 and 2.2.3 (no timers), 2.4.3 (focus order), 2.4.6 (title describes the topic), 2.4.7, 2.4.11 and 2.4.13 (focus on a focused root, never clipped), 3.2.2 (inserting never moves focus), 3.3.1 and 3.3.3 (error alerts identify and suggest), 4.1.2, 4.1.3 (announce).

### 7.7 Stories (`Components/Alert`, all with axe in the four theme projects, the contract passed as `a11yContract`)

Nothing exists yet, so every story is new. Only these are needed:

- `Default`: `Alert.Info`, Title and Body (Example A).
- `Statuses`: the four ready-made roots, each labelled with its component name as `<code>`, each with the same Title text, so the icon and colour are the only visual difference (review in forced colours).
- `TitleOnly`: Examples B and C2, Title as `<p>`.
- `WithActions`: Example C (a Link) and D (a Button).
- `Announced`: Example B behind a Save button that inserts it with `announce="polite"`; the play function checks the polite region gets "Klart: Dina ändringar är sparade" once, and an initially rendered alert puts nothing in it.
- `SendFailed`: Example D, inserted after Send, `announce="polite"`, and a second failure keeps the same instance and announces through `useAnnouncer()`, because Retry is inside it and a remount would drop focus.
- `FocusTarget`: an `Alert.Danger` focused on mount with `tabIndex={-1}` (the arrival pattern and the error summary's mechanics).
- `DynamicStatus`: a select that picks the status from data, rendered with the typed map from §6.1.
- `RestyleWithTokens`: `Alert.Warning` with the two colour tokens overridden on a wrapper (a documented rebrand), plus one with our class dropped through the `render` function form and a story-CSS class instead; the play function checks the icon and "Varning:" are still there.
- `BringYourOwn`: `Alert.Root` with a story-CSS class, the consumer's own `Icon` and the fixture's `ownStatus.word` in a `kv-alert-status` span.
- `MessagesOverride`: `messages={{ dangerPrefix: 'Viktigt:' }}` on one `Alert.Danger`, and a provider override.
- `InProseAndCard`: in an article with `kv-prose`, and in a Card body.
- `Compact`: Examples B and D in `kv-compact`.
- `LongFinnishText`: `longFinnish.title` with the `fi` fixture at 320px.
- `RTL` (en), `ForcedColors`, `AllExamples`.

### 7.8 Tests the plan should list

- `alert.test.tsx`:
  - `Alert.Root` renders `div.kv-alert` only: no status class, no icon, and its Title has no status span.
  - Each ready-made root renders `kv-alert` and its own status class, the right icon name first, and its status word first in the Title, followed by a normal space; all three from one table (a test iterates over the four).
  - Agreement: no prop changes a ready-made root's status; a conflicting status class in `className` or a `render` element warns (5); our status class on a plain Root warns (6); the `render` function form can replace `className` and the icon and word stay.
  - `className` joins; `render` changes the Title element (`h3`, `p`); `messages` per instance and from the provider (the message-override decision order, empty falls through; each root reads only its own key).
  - No `role`, `aria-live`, `aria-atomic` or `tabindex` on any root.
  - `announce` on every root calls the announcer once on mount with the Title and Body text and the politeness; not without `announce`; not on re-render; remount announces again.
  - The other dev warnings (1–4); `useAlert` without and with `variant` returns the same props as the Root and the matching ready-made root; server rendering.
- `theme-css.test.ts` has no Alert tests: the CSS rules (no clipping, the bar, the status classes, forced colours, the visually hidden status word) are reviewed in Storybook and covered by e2e (AGENTS.md rule 13).
- `alert.e2e.ts`: the keyboard rows; a11y snapshot (the heading's name starts with the status word; no `alert` or `status` role on the box); the polite region receives Example B's text after Save; forced colours draw the border on all four sides; no horizontal scroll at 320px with `fi`; text spacing clips nothing; a key-focused action and a focused root show a focus indicator (outline not `none`).
- `i18n:check`: the four keys in all six locales.

## 8. Validation

- [x] Self-review against `.claude/skills/design/references/review-checklist.md`. No open blockers. Checked: no hard-coded strings (four keys, fixture keys); colour never alone (icon shape, status word, title) on every ready-made root, and the plain Root's responsibility is documented and warned about; contrast measured (§6.6); 320px and 1.4.12 (§6.5); focus never obscured or clipped (§6.3, §7.3); no timers; no compliance claim. Not applicable: timeouts, target sizes of its own (children keep theirs).
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
  - Screen-reader users: whether the dynamic alerts (B, D) are heard, when, and whether anything is heard twice; whether they find A and C by heading navigation; whether "Varning:" in the heading helps or annoys.
  - Task 5: whether participants with colour-vision deficiency and in Contrast Themes tell the statuses apart by icon shape. This tests decision D4 (hidden status word).
  - Whether anyone looks for a close button (open question 1).
  - Magnifier user: whether D, placed above Send, is seen after pressing Send.
- **Result:** `pending`. Assistive-technology testing is also `pending`.

## 9. Everything that must change elsewhere

The brief limited edits to this file. These are for the plan and the main session.

### 9.1 The decision table (`section.md` §6.9, `card.md`, the Section, Card and Alert Docs pages, Foundation/Borders and elevation, DESIGN.md Components)

Retitle it **"Section, Card, Alert or a surface token: when to use which"**. Replace the last row, word for word, with:

| You're building                                                                                                                            | Use                                                                                                                                                             | Why                                                                                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A status message: something people need to know now, or the result of what they just did (an error, a warning, a confirmation, a deadline) | `Alert.Info`, `Alert.Success`, `Alert.Warning` or `Alert.Danger`. Each brings its status class (the `-subtle` background and bar), its icon and its status word | It's a message, not a region or a thing. Status is never shown by a surface colour alone (1.4.1), so you choose the status, and the colour, icon and word come with it |

and add two rows after it:

| You're building                                     | Use                                                                                                          | Why                                                                                      |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------- |
| An error on one form field                          | `Field.ErrorMessage` under the field. On submit, also the error summary (an `Alert.Danger` that takes focus) | The error belongs to its field, and the summary gets the user to it                      |
| A quote, an example or an aside that isn't a status | Plain content: a paragraph, or prose's `blockquote` for a quotation. Never a `-subtle` background            | A tinted box reads as a status. If nothing happened and nothing is at risk, it isn't one |

### 9.2 DESIGN.md (with the new decision)

- **Front matter `components`:** add `alert` (`backgroundColor: '{colors.primary-subtle}'` with a comment "per status class: primary-subtle, success-subtle, warning-subtle, danger-subtle; surface without one", `textColor: '{colors.text}'`, `rounded: '{rounded.sm}'`, `padding: 16px`, comment "12px inline below 40rem; 12px in compact density from 64rem").
- **Overview or Components intro:** add the vocabulary (§0) as "Words we use", short: Surface (a token), Section (a region, level 1), Card (one thing, level 2), Alert (a status message; Info, Success, Warning, Danger; not assertive), Toast (transient, later, same look), `role="alert"` (an Announcer detail) and AlertDialog (a modal, separate).
- **Colors table, Use column:** `primary` adds "info alert bar and icon"; `primary-subtle` "… selected rows, info alerts"; `danger-subtle` "Danger alerts, including the error summary"; `success-subtle` "Success alerts"; `warning-subtle` "Warning alerts". The `danger`, `success` and `warning` rows add "alert bar and icon".
- **Elevation:** one sentence: an alert isn't a level. It's a tinted block in the content at the level of whatever it sits on, with no shadow, and its edge is its bar.
- **Shapes, radii:** `sm` (4px) adds "alerts". **Lines:** "the 4px indicator bar (`--kv-indicator-width`) marks the current navigation item, a blockquote and an alert".
- **Components, Alerts bullet,** replaced by: "**Alerts** are status messages in the content. Use `Alert.Info`, `.Success`, `.Warning` or `.Danger`: each renders its status class (`kv-alert--info|success|warning|danger`), its icon (square, circle, triangle, octagon) and a status word at the start of the title (visually hidden, from i18n), so colour, icon and word always agree. The look is only CSS on the class: the `-subtle` background and a 4px inline-start bar in the status colour, through `--kv-alert-background` and `--kv-alert-accent`. The `sm` radius, 16px padding, a sans title at 18px weight 600, no shadow. `Alert.Root` is the plain base, with no status, for your own design: you bring the icon and the word. Never colour alone. The title is a heading at the consumer's level, or a `<p>` for one sentence. Dismissing is optional (`Alert.Close`, §7.5). Announced only with `announce`, through the Announcer. The design spec is `docs/design/alert.md`."
- **Components, Error summary bullet:** "An `Alert.Danger` at the top of `main` with the heading 'Det finns ett problem' and a list of links to each invalid field, worded like the field errors. It receives focus on submit and isn't announced." (Replaces "`danger` border with `danger-subtle` background".)
- **Components, Cards bullet:** "status belongs in an alert" links to the Alert. **Components intro:** list Alert and this spec.
- **Typography, Families:** one clause: an alert's title uses the body family (it's a message label, not a section heading).
- **Prose bullet:** `kv-alert` joins the boundary list next to `kv-card`.
- **Layout, Text expansion:** hyphenation applies to alerts too (the hyphenation decision amended).
- **Theming class list:** the part classes `kv-alert`, `kv-alert-icon`, `kv-alert-title`, `kv-alert-status`, `kv-alert-body`, `kv-alert-actions`, and the status classes `kv-alert--info|success|warning|danger`, "rendered by `Alert.Info`, `.Success`, `.Warning` and `.Danger`; `Alert.Root` renders `kv-alert` only". Site-wide properties: `--kv-alert-padding-block`, `--kv-alert-padding-inline`, `--kv-alert-gap`.
- **Do's and Don'ts:** Don't: "Use a `-subtle` background for anything but an alert", "Put `role="alert"` on an alert", and "Put a status class on a plain `Alert.Root`: use the ready-made root, which brings the icon and the word".

### 9.3 Other files

- `docs/design/section.md` §6.1 ("a future Alert") and §6.9 (the table, §9.1); `docs/design/card.md` §6.1 ("a future Alert component") → link this spec.
- The Card decision, Follow-ups: "Alert: designed in `docs/design/alert.md`".
- The hyphenation decision: a revision line adding alerts.
- `docs/architecture.md`: **Shared part vocabulary** gets a row: "`Info`, `Success`, `Warning`, `Danger` | A ready-made Root for one status: its class, its icon and its status word (Alert)". The blocks list says the error summary is built on `Alert.Danger`. No change to the Styling contract: there's no exception.
- `docs/roadmap.md`: a Primitives row "Alert (Root; Info, Success, Warning, Danger; Title, Body, Actions; announce) | – (native `<div>`, Announcer) | 1 | planned"; the Toast row notes "reuses the Alert look and status words"; the "Form wizard + error summary" block row notes "built on `Alert.Danger`".
- `packages/i18n/src/types.ts` and the six locales: the `alert` namespace (§4.1).
- `packages/theme/src/contrast-requirements.ts` comment, and `button-edge.ts` backgrounds (§6.6).
- `packages/theme/README.md`: the part classes, the status classes and who renders them, the component tokens, and the restyle table (§6.2).
- `docs/design/README.md`: this spec's row: `| [Alert: status messages (Info, Success, Warning, Danger), the vocabulary, and when to announce](alert.md) | to be written | Draft |`.
- New: `packages/react/src/alert/` (`alert.tsx`, `use-alert.ts`, `alert.test.tsx`, `alert.a11y.md`, `alert.md` with the restyle table), `apps/storybook/src/components/alert/` (stories, fixture, e2e), a changeset (`@kvirn-ui/react`, `@kvirn-ui/theme`, `@kvirn-ui/i18n` minor).

## 10. Decision to record (main session, status _Proposed_)

**"Alert: one plain Root and four ready-made status roots, no role, announced through the Announcer"**. It follows the theme-delivery decision: status is a class, and the look is CSS on it. Decisions to record:

1. **The name** Alert (was Notification until Plan 0042), and the error status is Danger (§3.1).
2. **The component split** (§6.1, §6.2). Options:
   - A. A `status` (or `variant`) prop on one Root that renders the status class, icon and word. Rejected for v1: a choice as a prop, against the theme-delivery decision, and a Root that's never plain.
   - B. Classes only, on one Root: the consumer adds `kv-alert--danger`, an icon and a word. Rejected as the only way: colour, icon and word can silently disagree (1.3.1, 1.4.1).
   - **C. Chosen:** a plain `Alert.Root` (`kv-alert` only), plus `Alert.Info`, `.Success`, `.Warning` and `.Danger` (named exports `AlertInfo` …), each rendering its status class, its icon and the context for its status word from one table. Title renders the word first. The look is only CSS on the class. Restyle by tokens, by replacing the class (the `render` function form), or by building on the plain Root.
3. **Agreement guards:** no prop changes a ready-made root's status; dev warnings for a conflicting status class and for our status class on a plain Root.
4. **The status words:** four i18n keys, visually hidden in the theme (§4.1, §6.3).
5. **No role and no live region on the box;** `announce` opts in to one Announcer call on mount, on every root, with no per-status default (§7.2), with the 4.1.3 risk and the AT validation.
6. **`variant`** is the only name for a status prop, if one is ever added (later sugar on `Alert.Root`); the hook's `variant` option in v1 (§6.1; open question 2).
7. **Dismissing is optional** (`Alert.Close`, §7.5; was "not dismissible" in v1).
8. **The error summary** is a block built on `Alert.Danger`, with the danger bar, and moves focus instead of announcing (§3.3).

## 11. Decisions and open questions

### Decided (maintainer, 2026-10-02)

- **D1. Status by class, content by ready-made roots,** no the theme-delivery decision exception (§6.2, §10).
- **D2. Named exports** follow the architecture's component-then-part convention: `AlertInfo`, `AlertSuccess`, `AlertWarning`, `AlertDanger` (§6.1).
- **D3. No status prop in v1.** If one is ever added, it's `variant`, as sugar on `Alert.Root` (§6.1).
- **D4. The status word is visually hidden** by default, as Field's "Fel:". The usability test (task 5) checks it.
- **D5. Info uses the accent:** `primary-subtle` with a `primary` bar and icon.
- **D6. The error summary uses the danger Alert bar,** not a full danger border. DESIGN.md changes (§9.2).
- **D7. Radius `sm`** (4px). The design review of the stories still checks the corner join between the 4px bar and the 1px edges at 200% zoom, as polish.
- **D8. The title is sans,** 18px weight 600 (1rem in compact).
- **D9. Toast (M3) reuses the Alert look,** the status words and the icons. Built in Plan 0071 as `useToast()` with a host in `KvirnProvider`: info and success only, persistent by default. Warning and danger never toast.
- **D10. The landmark option is documented:** `render={<section aria-labelledby>}` for one site-wide alert only.
- **D11. Inset text** isn't an Alert, and gets no class now: a paragraph or prose's `blockquote`. Revisit if adopters ask.
- **D12. Dismissing is optional** (§7.5). Superseded: v1 had no close button; the maintainer added an optional one on 2026-10-05 (Plan 0045).

### Open

1. **Dismissible alerts:** `Alert.Close` exists. Which real cases use it, and whether errors and warnings ever should (guidance says no)? Ask in the usability test.
2. **The hook's `variant` option in v1** (§6.1). The components take no status prop, but `useAlert` needs a way to give hook users the matching class, icon and word together, or they lose the agreement guarantee. Keep it as a hook option, or ship a separate exported table instead?
