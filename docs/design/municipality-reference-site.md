# Design spec: the reference municipality site in `apps/docs`

- **Status:** Accepted (maintainer decisions in §10, 2026-10-06; inventory accepted 2026-10-13). **Revised 2026-10-13:** brought up to date with the shipped library and `@kvirn-ui/patterns`; the build order is re-cut into slices R0–R10 (§5), one engineer brief each.
- **Designer:** ux-designer agent · **Date:** 2026-10-06, revised 2026-10-13
- **Plan:** Plan 0053
- **Type:** inventory and build order. The reference site **composes** patterns and content types; it does not define them. Patterns and content types are specified in [storybook-patterns.md](storybook-patterns.md) (Plan 0095; its slices S4+ are in progress) and built in `@kvirn-ui/patterns`. The docs shell is [docs-site.md](docs-site.md).
- **Rule (maintainer, final):** the library comes first. A missing component or pattern is built in `@kvirn-ui/*`, reviewed in Storybook, then used on a reference page, then documented in the docs app. The roadmap is the order.

## 1. Brief

- **Users:**
  1. **Evaluators** (municipality frontend teams, accessibility specialists, procurement): "When I judge KvirnUI, I want to see the pages a municipality actually runs, working, so I can tell whether it covers our site."
  2. **Integrators** (in-house teams and suppliers): "When I build our site, I want to copy a whole page type and see exactly which parts it uses, so I don't rebuild patterns."
  3. **The fictional resident** each page is designed for, judged as if real: once a year, on a phone, under stress, in a second language, with a screen reader or a tremor.
- **Hardest-case user:** a Finnish accessibility consultant evaluating for a bilingual Ostrobothnian municipality, with NVDA, 400% zoom (320 CSS px), English and Swedish as second languages. They open a form page, make an error on purpose, and judge the library by what happens.
- **The municipality: Kvirnby kommun** (fictional; the name carries the library's name). A mid-sized Swedish municipality. **Locales (Q1):** `sv` first and `en`, both complete; Finnish and Sámi pages later (Lag 2009:724, `TODO(legal-verify)`). Tone: plain Swedish (_klarspråk_), "du" and "vi", calm, no blame. Content data: the Kvirnby world in [storybook-patterns.md §8.2](storybook-patterns.md#82-data-sketch).
- **Constraints:** no third-party requests, cookies or analytics (rule 7): no maps, embeds, real eID redirects or consent. No compliance claims (rule 8). Every form is client-side only and says so. A pattern holds no text (Plan 0095 D10): visible text and landmark names (`label` props) are the page's content, in the docs app's reference messages (sv, en); only strings a shipped component owns come from `@kvirn-ui/i18n` (five locales, rule 4).
- **Success criteria:**
  - Every reference page imports `theme.css`, the self-hosted IBM Plex CSS and `@kvirn-ui/*` only: **no `docs.css` or `gallery.css` on reference routes** (the proof that adopters can do the same).
  - Every page type works at 320px and 400% zoom, in four themes and forced colours, with 0 axe violations.
  - Each reference page links to "How this page is built", which lists every part with its docs page.
  - ≥ 80% of evaluators correctly say Kvirnby is not a real municipality, and ≥ 80% find the parts a page uses within 2 minutes (usability plan, §9, `pending`).
- **Evidence:** none from users. **Assumption:** evaluators trust a working page more than a component list. → Research question: do evaluators open reference pages or component pages first, and which do they copy from?

### Prior art (links not re-fetched 2026-10-13; verify before citing in docs)

| Source                                                                          | What we reuse                                                                                                   | What we change and why                                                     |
| ------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| [GOV.UK Design System](https://design-system.service.gov.uk/patterns/) patterns | Start page, question pages, check answers, confirmation, error summary, summary list, back link, service header | Nordic e-ID, sv and en, Alert-based summary (DESIGN.md)                    |
| [Designsystemet](https://www.designsystemet.no/) (Digdir, NO)                   | Breadcrumbs ("Du er her"), pagination, Tag as metadata                                                          | Breadcrumb never collapses                                                 |
| [Suomi.fi design system](https://designsystem.suomi.fi/)                        | fi/sv/en content side by side, language menu wording                                                            | Language links, not a menu, while there are 4 or fewer languages           |
| Digg's accessibility statement template; uustatus.no                            | Statement structure (regulations skill)                                                                         | The content type gives structure only, the adopter supplies facts          |
| [storybook-patterns.md](storybook-patterns.md) (Plan 0095)                      | Every pattern, the shell, the four content types, the Kvirnby fixture world                                     | Composed with real routes, sv and en, `<html lang>`, `noindex`, no stories |

## 2. Page types

Templates T1–T6 are in §3; B numbers in §4; the slice that builds each page in §5. States in bold are unhappy paths the page must show.

| #   | Page type (example)                                              | Job                                                               | Template | Blocks and parts (§4)                                                       | States                                                                           |
| --- | ---------------------------------------------------------------- | ----------------------------------------------------------------- | -------- | --------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| P1  | Start page                                                       | Find a top task or contact in one step                            | T1+T2    | B2, B3, B7, Hero, B8 top tasks and nav tiles, B9, B13, B16 header search    | site alert on / off                                                              |
| P2  | Topic page ("Barn och utbildning")                               | Choose the right sub-page                                         | T1+T2    | B4, page header, B8 nav tiles, B13                                          | 3 and 7 children                                                                 |
| P3  | Content page ("Förskola")                                        | Read and understand one topic                                     | T1+T3    | B4, B5, page header, page tools, TableOfContents, Prose, B12, B13, B18      | section nav open / closed below 64rem                                            |
| P4  | E-service start page ("Parkeringstillstånd för rörelsehindrade") | Know who can apply, what to have ready, how long it takes; start  | T1+T3    | B4, Prose, B18 service link and its alternative, B13                        | **e-service closed** (text, no dimmed link); **not eligible** exit links         |
| P5  | Sign in                                                          | Choose an e-ID and sign in                                        | T4       | B24, B19                                                                    | **e-ID unavailable** (Alert.Warning + other ways); **cancelled**                 |
| P6  | Question page (one per step)                                     | Answer one question                                               | T4       | B19, B20, B21, Field / Fieldset, Button                                     | **invalid** (summary + inline), prefilled from e-ID (3.3.7), **save and return** |
| P7  | Check your answers                                               | Confirm before a binding submit (3.3.4)                           | T4       | B20, B22 with Change links, Button                                          | change and return here; **submit failed** (Alert.Danger, answers kept)           |
| P8  | Confirmation                                                     | Know it worked, keep the reference number, know what happens next | T4       | Alert.Success, B23 (CopyButton), Prose                                      | **copy failed** (CopyButton's own status)                                        |
| P9  | Session timeout                                                  | Extend in time, or recover after expiry (2.2.1)                   | T4       | B25, T6 status page                                                         | warning, extended, **expired** (answers kept, sign in again)                     |
| P10 | My pages: case list                                              | See the status of my cases                                        | T1+T5    | B26 (Card, B22, Badge), B17                                                 | **no cases**, loading                                                            |
| P11 | Case detail                                                      | See one case, what happens next, who to contact                   | T1+T3    | B4, B22, Badge, B13                                                         | –                                                                                |
| P12 | News list                                                        | Scan recent news                                                  | T1+T5    | B4, B9 news list, B17                                                       | **empty**, last page                                                             |
| P13 | News article                                                     | Read one item; know when it was published                         | T1+T3    | B4, page header, Prose, page tools (`<time>`, `useFormat`)                  | updated after publishing                                                         |
| P14 | Events list and event                                            | Find an event by date; know where and when                        | T1+T5/T3 | as P12/P13, B9 event list, B22 for when, where, cost                        | **cancelled event** (Alert.Warning + word in title), **past**                    |
| P15 | Search results                                                   | Find a page by words                                              | T1+T5    | B16 search box and results, B17                                             | **no results** (suggestions), **empty query**, count announced                   |
| P16 | Contact and opening hours                                        | Reach a human; know when it's open                                | T1+T3    | B13, B14, address and visit, Alert.Info for holiday hours                   | holiday exceptions                                                               |
| P17 | Accessibility statement                                          | Know what doesn't work and how to report it (WAD)                 | T1+T3    | B27 (SE variant)                                                            | –                                                                                |
| P18 | Accessibility feedback                                           | Report a problem (WAD Art. 7)                                     | T4       | B28, B21, P8-style confirmation                                             | **invalid**, **sent** (says nothing left the browser)                            |
| P19 | Privacy (personuppgifter)                                        | Know what is stored and why                                       | T1+T3    | Prose                                                                       | –                                                                                |
| P20 | Cookies                                                          | Know there are none; where the display setting is stored          | T1+T3    | Prose (no consent banner: nothing needs consent; B29 is Storybook-only, Q9) | –                                                                                |
| P21 | Lättläst (easy-to-read Swedish)                                  | Get the essentials in easy Swedish                                | T1+T3    | Prose `kv-prose--large`                                                     | **page not in English**: the en language link says so in English                 |
| P22 | 404, 500, service unavailable                                    | Recover: search, start page, contact                              | T1+T6    | Heading, Prose, links, B16                                                  | the 500 page needs no data and no client JavaScript                              |

Out of v1 (Q1, Q11): Finnish and Sámi pages, page feedback ("Was this page helpful?", needs a backend), messages inbox, staff case handling, "Exit this page".

## 3. Templates

| Template           | Regions in DOM order (= reading and focus order)                                                                                                                                           | 320px                                                          | 64rem and wider                               |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------- | --------------------------------------------- |
| **T1 Site shell**  | SkipLink → `banner` (TopBar notice row, brand, language links, utility links, search, main menu) → site alert → content type → `contentinfo`                                               | header in rows; main menu behind "Meny"                        | storybook-patterns.md §5.1                    |
| **T2 Landing**     | `main` (`PageFrame.Main bleed`): bands, each with its own `Container`                                                                                                                      | one column                                                     | 3 columns; container max `80rem`              |
| **T3 Article**     | breadcrumb → `PageFrame.Body` (`.Sidebar` section nav, `.Main` with `h1`, lead, contents, prose, page tools)                                                                               | section nav collapsed behind "I det här avsnittet"             | sidebar + content; text at `45rem`            |
| **T4 Transaction** | SkipLink → `banner` (the Site header Transaction story: notice, brand, service name, language, "Kontakta oss") → `main`: back link → error summary → `h1` → Stepper → fields → one primary | `Container size="form"` (`40rem`) at every width; no main menu | same: a form never gets a sidebar             |
| **T5 List**        | breadcrumb → `main`: `h1` → (search field) → count as text → list → pagination                                                                                                             | one column                                                     | one column `45rem` (no card grid for results) |
| **T6 Status**      | `main`: `h1`, one or two paragraphs, links                                                                                                                                                 | `Container size="form"`                                        | same                                          |

- **Frame:** `PageFrame` (`@kvirn-ui/patterns`) wraps `KvirnProvider` and sets `lang`; its `locale` takes `sv` and `en`, which is v1. The shell and content-type split is Plan 0095 D12: the shell is the reference layout, each route renders only its content type and owns `main#main`.
- **Layout (shipped in `@kvirn-ui/react`):** `Container` (`page`, `reading`, `form`), `Stack`, `Grid` (`Grid.Root as="ul"` for lists of links, `Grid.Item as="nav"` for a named sidebar), `List`, `Address`. DOM order is the visual order at every width; nothing is sticky; nothing scrolls sideways at 320px (1.3.2, 1.4.10, 2.4.11).
- **`<html lang>`** is the page's locale, so the reference site has its own root layout (a route group), separate from the docs' `lang="en"` (3.1.1).

## 4. Blocks and where they live now

Status: **shipped** (in `@kvirn-ui/react`) · **built** (pattern in `@kvirn-ui/patterns` or a story composition, Plan 0095) · **0095 T5** (in Plan 0095's IA, not built; specified in storybook-patterns.md S4+) · **gap** (on no plan).

| #   | Block                    | Home now                                                                                            | Status            |
| --- | ------------------------ | --------------------------------------------------------------------------------------------------- | ----------------- |
| B1  | Skip link                | `SkipLink`, `VisuallyHidden`                                                                        | shipped           |
| B2  | Site header              | `TopBar` (notice row) · `SiteHeader` · `ApplicationLogo` · `MainMenu` (mega variant) · `SiteSearch` | built             |
| B3  | Site footer              | `SiteFooter` · `nav` > `Stack` > `Heading` + `List` · `Address`                                     | built             |
| B4  | Breadcrumb               | `Breadcrumb`                                                                                        | shipped           |
| B5  | Section navigation       | `SectionNav`                                                                                        | built             |
| B6  | Language links           | `LanguageLinks`                                                                                     | built             |
| B7  | Site alert               | `SiteAlert`                                                                                         | built             |
| B8  | Top tasks, nav tiles     | `Grid.Root as="ul"` of `Link` (top tasks, no pattern: D11) · `NavTiles`                             | built             |
| –   | Hero, page header, tools | `Hero` · `PageHeader` · `PageTools` (with `ReadAloud`, `CopyButton`)                                | built             |
| B9  | News list, event list    | `Card.Root as="li"` in a `Grid` until then · News list, Event list, Notice                          | 0095 T5           |
| B12 | FAQ                      | `Accordion`; a FAQ pattern only if it adds anything                                                 | shipped / 0095 T5 |
| B13 | Contact card             | `Card` + `DefinitionList` + `Address` (story `Patterns/Places and contacts/Contact card`)           | built (story)     |
| B14 | Opening hours            | `Table`, `useFormat`, `Alert.Info`                                                                  | 0095 T5           |
| B16 | Search box and results   | `SiteSearch` (header) · Search results                                                              | built / 0095 T5   |
| B17 | Pagination               | `Pagination`                                                                                        | shipped           |
| B18 | Service link             | `ServiceLink` (available, closed, alternative)                                                      | built             |
| B19 | Back link                | a `kv-link--back` Link choice (`arrow-back`, mirrors in RTL)                                        | **gap**           |
| B20 | Step indicator           | `Stepper`                                                                                           | shipped           |
| B21 | Error summary            | `ErrorSummary` · Form with error summary · Form page (content type)                                 | shipped / 0095 T5 |
| B22 | Definition list          | `DefinitionList` (with `Change`)                                                                    | shipped           |
| B23 | Reference number         | `CopyButton` · a `numeric` text class (only input and table numeric classes exist)                  | shipped / **gap** |
| B24 | Login entry              | Login entry                                                                                         | 0095 T5           |
| B25 | Timeout warning          | `AlertDialog` (native top layer)                                                                    | **gap**           |
| B26 | Case card                | `Card` + `DefinitionList` + `Badge`; pattern or composition (D11)                                   | **gap**           |
| B27 | Accessibility statement  | Accessibility statement (content type)                                                              | 0095 T5           |
| B28 | Accessibility feedback   | Form page (content type) + Form with error summary                                                  | 0095 T5           |
| B29 | Consent banner           | `CookieConsent`, story only (Q9)                                                                    | built             |
| –   | Route focus              | `useRouteFocus`                                                                                     | shipped           |

### What the reference site needs from pieces not yet specified

Requirements, not specs. The spec of record is storybook-patterns.md once it covers the piece; the gaps need an owner (§11 Q2).

| Piece         | Requirement from the reference pages                                                                                                                                                                                   |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| B19 back      | A link to the previous step's URL (not `history.back()`), text "Tillbaka" or the step's name as content, before the error summary and the `h1`.                                                                        |
| B23 number    | The number in `numeric` figures with `CopyButton` after it, and also in the Alert.Success title, so it is read without copying.                                                                                        |
| B24 login     | One equal-looking choice per e-ID (no primary, no service link), generic names on the reference site (Q7), "Andra sätt att ansöka" below, no CAPTCHA (3.3.8).                                                          |
| B25 timeout   | AlertDialog 2 minutes before expiry; "Fortsätt" (primary, initial focus) and "Logga ut"; time left in words, updated once a minute at most; on expiry a T6 page that keeps answers. Triggered by a demo control (Q14). |
| B26 case      | Title link, status as `Badge` plus text, dates in a `DefinitionList`, the next step in words.                                                                                                                          |
| B27 statement | SE variant in Digg's structure; never pre-fills a conformance status (regulations skill); names Digg with a note that Kvirnby is fictional (Q8).                                                                       |
| B28 feedback  | Page (prefilled with the referring URL, editable), what went wrong (Textarea + CharacterCount), optional email (`autocomplete="email"`); never a personal identity number; the confirmation says nothing was sent.     |

## 5. Build order

Each slice is one `component-engineer` brief in `apps/docs`, started after everything in "Needs first" is built and reviewed in Storybook. Each slice also adds its pages to the `/reference` index, a "How it's built" entry per page (Q13) and "See it on the reference site" links on the docs pages of the patterns it uses. Routes are under `/reference/{sv|en}/` with shared English slugs (Q10). Slices are named R to keep them apart from storybook-patterns.md's S slices.

| Slice | Routes (`/reference/{l}/…` unless noted)                                                                                                                                                                          | Pages      | Uses                                                                                                                                                                         | Needs first                                            | Today |
| ----- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ | ----- |
| R0    | `app/(reference)/reference/[locale]/layout.tsx` (own root layout); docs routes into `app/(docs)/`, URLs unchanged; `not-found`; `service-unavailable`; `/reference` and `/reference/how/[page]` in the docs shell | P22        | `PageFrame`, `SkipLink`, `TopBar` notice (`reference.notice`, two links), `useRouteFocus`, `Container`; `<title>` template, `noindex`; reference messages sv + en            | –                                                      | yes   |
| R1    | layouts `[locale]/(site)` (T1) and `[locale]/(transaction)` (T4); `search` as a T6 holding page until R9                                                                                                          | –          | `SiteHeader`, `ApplicationLogo`, `MainMenu` (mega, 7 topics), `LanguageLinks`, `SiteSearch`, `SiteAlert`, `SiteFooter`, `List`, `Address`; the Transaction header            | R0                                                     | yes   |
| R2    | `/`, `children-and-education`                                                                                                                                                                                     | P1, P2     | content types Start page, Subpage; `Hero`, top tasks (`Grid as="ul"`), `NavTiles`, news and events as `Card`s, contact card, `Breadcrumb`, `PageHeader`                      | R1                                                     | yes   |
| R3    | `children-and-education/preschool`, `privacy`, `cookies`, `easy-to-read`                                                                                                                                          | P3, P19–21 | content type Content page; `SectionNav`, `PageHeader`, `PageTools`, `TableOfContents`, `Accordion`, `Prose`, contact card                                                    | R2 (breadcrumb parent)                                 | yes   |
| R4    | `contact`                                                                                                                                                                                                         | P16        | content type Contact; contact card, opening hours, address and visit                                                                                                         | 0095 T5 Places and contacts                            | no    |
| R5    | `accessibility`, `accessibility/report`, `accessibility/report/sent`                                                                                                                                              | P17, P18   | content types Accessibility statement, Form page; Form with error summary; `ErrorSummary`, `Field`, `Textarea`, `CharacterCount`, `Alert`                                    | 0095 T5 statement, Form page, Form with error summary  | no    |
| R6    | `parking/disabled-parking-permit`, `…/sign-in`                                                                                                                                                                    | P4, P5     | content type Content page, `ServiceLink` (available, closed); Login entry; back link                                                                                         | 0095 T5 Login entry; B19                               | no    |
| R7    | `…/apply/[step]` ×3, `…/apply/check`, `…/apply/sent`                                                                                                                                                              | P6–P8      | Form page, Form with error summary; `Stepper`, `ErrorSummary`, `Fieldset`, `RadioGroup`, `DateInput`, `DefinitionList` with `Change`, `CopyButton`; back link; numeric class | R6; B19, B23                                           | no    |
| R8    | `news`, `news/[slug]`, `events`, `events/[slug]`                                                                                                                                                                  | P12–P14    | content types News article and list, Event and list; News list, Event list, Notice; `Pagination`, `Badge`, `PageHeader`, `PageTools`                                         | 0095 T5 News, events and notices                       | no    |
| R9    | `search?q=` (replaces the R1 holding page)                                                                                                                                                                        | P15        | content type Search results; Search results; `Pagination`; count announced on a client-side change only                                                                      | 0095 T5 Search results                                 | no    |
| R10   | `my-pages`, `my-pages/cases/[id]`, `…/apply/timeout`; the timeout demo control in the T4 notice row                                                                                                               | P9–P11     | `AlertDialog`, `Card`, `DefinitionList`, `Badge`, `Pagination`; timeout warning; case card; a My pages content type                                                          | B25, B26 and a My pages content type (no plan yet); R7 | no    |

Why this order: R0–R1 are on every page. R2–R3 are the most common page types on a municipal site and are buildable now. R5 is what WAD obliges every adopter to publish. R6–R7 are the e-service flow municipalities rebuild most (vision). R8–R9 have fallbacks (Cards on the start page; the holding search page). R10 has no pattern plan yet. The consent banner has no reference page (Q9).

## 6. Information architecture and labelling

- **Docs site:** the Patterns and Content types galleries (`/patterns`, `/content-types`) document the parts; a "Reference site" entry opens `/reference`: an index of P1–P22, each "Open the page" (sv, en) and "How it's built", unbuilt pages listed as such.
- **Routes:** `/reference/{sv|en}/…`, own root layout and `<html lang>`, only `theme.css`, the font CSS and `@kvirn-ui/*`; the docs shell is not shown. "How it's built" lives in the docs at `/reference/how/{page}`. Moving between the two root layouts is a full page load, which is acceptable.
- **Labelling, so nobody mistakes Kvirnby for a real service:**
  1. A `TopBar` notice row, first inside `banner` on every reference page, in the page's language (`reference.notice`), with "Så är sidan byggd" and "KvirnUI-dokumentation" links. Not an Alert (it isn't a status), never dismissible.
  2. `<title>`: "{page} – Kvirnby (påhittad kommun) – KvirnUI".
  3. `robots: noindex` on reference routes.
  4. Contact data that can't reach anyone: `@kvirnby.example` (RFC 2606), phone numbers from a range reserved for fiction (`TODO(legal-verify)` with PTS), no real organisation or personal identity numbers.
  5. Forms submit nowhere; every confirmation says "Inget skickades: det här är en referenswebbplats".
  6. No real coat of arms or e-ID marks (Q7).

## 7. Content

Library strings already exist for the shipped parts (`skipLink`, `breadcrumb`, `pagination`, `stepper`, `errorSummary`, `definitionList.change`, `copyButton`, `routeFocus`, `alert.close`); no new library key is needed. Reference keys live in `apps/docs/messages` (sv and en, the sv file typed by the en shape); each slice writes its pages' copy.

| Reference key                                   | en                                                                                                                             | sv                                                                                                                                  |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| `reference.notice`                              | Kvirnby is a fictional municipality. This is a KvirnUI reference site: no service here is real, and nothing you enter is sent. | Kvirnby är en påhittad kommun. Det här är en referenswebbplats för KvirnUI: inga tjänster är riktiga, och inget du skriver skickas. |
| `reference.howBuilt` / `reference.docs`         | How this page is built / KvirnUI documentation                                                                                 | Så är sidan byggd / KvirnUI-dokumentation                                                                                           |
| `reference.title`                               | {page} – Kvirnby (fictional municipality) – KvirnUI                                                                            | {page} – Kvirnby (påhittad kommun) – KvirnUI                                                                                        |
| `reference.nav.main` / `.utility` / `.language` | Main menu / Shortcuts / Language                                                                                               | Huvudmeny / Genvägar / Språk                                                                                                        |
| `reference.nav.section`                         | In this section                                                                                                                | I det här avsnittet                                                                                                                 |
| `reference.search.label` / `.submit`            | Search the site / Search                                                                                                       | Sök på webbplatsen / Sök                                                                                                            |
| `reference.back`                                | Back                                                                                                                           | Tillbaka                                                                                                                            |
| `reference.notSent`                             | Nothing was sent: this is a reference site.                                                                                    | Inget skickades: det här är en referenswebbplats.                                                                                   |

## 8. Accessibility annotations (shell level; patterns own theirs)

- **Landmarks:** one `banner`, one `main`, one `contentinfo`; every `nav` named and distinct (Språk, Genvägar, Huvudmeny, Du är här, I det här avsnittet, footer groups); the search in `<search>`; the site alert a named region.
- **Tab stops, T1:** skip link → notice links → brand → language links → utility links → search field → Sök → Meny (below 64rem) / main menu topics → site alert link and Close → breadcrumb → section nav (or its trigger) → main content → footer links.
- **Tab stops, T4:** skip link → notice links (and the timeout demo control, R10) → brand → language → "Kontakta oss" → back link → error summary links → fields in order → primary button → "Spara och fortsätt senare".
- **Focus moves:** skip link → `main`; client navigation → `h1` (`useRouteFocus`); submit with errors → error summary; summary link → its control; next step → the new `h1`; alert closed → `main`; dialog close → the control that opened it, or the `h1`. Never `body`.
- **Announcements:** search count (client-side change only), CopyButton result, timeout time left (once a minute at most). Nothing on page load.
- **SCs of note:** 1.3.1, 1.3.2, 1.4.10, 2.2.1, 2.4.1, 2.4.2 (titles with the error prefix), 2.4.3, 2.4.5 (nav + search + breadcrumb), 2.4.11, 3.1.1, 3.1.2, 3.2.3, 3.2.6, 3.3.1, 3.3.4, 3.3.7, 3.3.8, 4.1.3.

## 9. Validation

- [x] Self-review against `review-checklist.md` (2026-10-13): no blocker in the inventory; each pattern's spec repeats the review.
- [x] No new colour pair or token. **Wanted DESIGN.md text (maintainer approval):** the back link choice (B19) and a `numeric` text class (B23), both on the existing `numeric` type role; the case card and timeout looks if they become patterns.
- [ ] Usability test plan, result `pending`:
  - Participants: 3 evaluators (one NVDA, one 400% zoom), 2 integrators, and for R5–R7 five residents: a screen reader user, a magnifier user, a person with a cognitive disability, a person with low digital confidence, a Finnish-first reader using the Swedish pages.
  - Tasks: "Is Kvirnby a real municipality? How do you know?"; "Find which KvirnUI parts the parking-permit question page uses, and copy its error summary"; "Apply for a parking permit; the date you enter is wrong on purpose"; "Report an accessibility problem"; "Find when the town hall reception closes on 30 October".
  - Measure: correct answer to the first task, time to find the parts, completion, errors recovered without help, comments on wording.

## 10. Decided (maintainer)

1. **Municipality and locales (2026-10-06):** Kvirnby kommun, `sv` and `en` only. FI and NO statement variants still show on the pattern's docs page.
2. **Own shell** at `/reference/{locale}/`, own root layout, no `docs.css`: yes.
3. **Layout is React components:** `Container`, `Stack`, `Grid` (shipped; Grid replaced Columns and SidebarLayout).
4. **Roadmap:** DefinitionList is a primitive; Stepper is a text step indicator; NavigationMenu is off this path.
5. See 4.
6. **Overturned 2026-10-09 (Plan 0095 D3):** a mega menu is a Site header variant, the APG Disclosure Navigation, never `role="menu"` ([storybook-patterns.md](storybook-patterns.md) §5.2).
7. **e-ID marks:** generic names on the reference pages, real naming only in the pattern docs (`TODO(legal-verify)`).
8. **Statement:** describes the reference site's real state in Digg's structure, names Digg as the enforcement body with a note that Kvirnby is fictional.
9. **No live consent banner;** Storybook and its docs page only.
10. **Slugs:** shared English slugs under the locale prefix.
11. **Out of v1:** page feedback, inbox, staff case handling, "Exit this page", fi and se pages.
12. **Header search** always visible at 320px (and ships with the header, Plan 0095 D8).
13. **"How it's built":** parts list, CodeBlock excerpt and repository link.
14. **Timeout demo:** a "Simulate session timeout" control in the notice row on T4 pages.
15. **Open:** who reviews non-sv/en copy; moot for v1.
16. **Inventory accepted 2026-10-13** (§2–§4); Plan 0053 takes §5 as its task list.
17. **Flat page slugs (2026-10-14):** a page is `/reference/{locale}/{slug}` with the slug the R1 menu data uses (`preschool`, not `children-and-education/preschool`), so the dynamic `[topic]` route never meets a static folder of the same name. Units and steps nest under their page (`preschool/hillside`).
18. **Reference pages compose patterns and components, not content types (2026-10-14).** The content types in `@kvirn-ui/patterns/content-types` hold English example text and are the layout reference. Each page composes the exported patterns and components with its own sv and en content and real routes, as an adopter would, so the content types' API doesn't grow.
19. **Deferred from R6–R10 (2026-10-14):** P6 save-and-return and e-ID prefill, P7 "change and return to Check answers" and "submit failed" (nothing is sent, rule 7), the R7 DateInput step, and P10's empty and loading states; one roadmap line tracks them. The statement's supervisory section is a fill-in (§10.8 names Digg).
20. **R0 as built:** the docs routes live in `app/(docs)/`, the reference root layout is `app/(reference)/reference/[locale]/layout.tsx` (sv, en; `dynamicParams` off; noindex; title template; a bare `ReferenceShell` with the notice row). `/reference` and `/reference/how/[page]` stay in the docs shell (§6). The 404 and service-unavailable pages are plain markup, because `StatusPages` is fixed English example text. An unknown locale gets Next's default 404; unknown paths below a locale go through `[...rest]` to the reference 404.
21. **Order:** library first, docs second; the roadmap is the order (maintainer, 2026-10-06).

## 11. Open questions

1. **R0 route-group move:** every docs route moves under `app/(docs)/` (URLs unchanged) so the reference group can have its own root layout and `<html lang>` (3.1.1). Approve the move?
2. **Owner for the gaps:** B19 back link and B23 numeric class are library choices (a class each, DESIGN.md text, `theme.css`): one small plan? B25 timeout, B26 case card and a My pages content type are in no plan: add them to Plan 0095 T5 (storybook-patterns.md S4+) as a "My pages" group?
3. **Search holding page (R1–R8):** the header search goes to a T6 page that says search is not built on the reference site yet. Acceptable, or leave the search slot out until R9 (which contradicts Q12)?
4. **Re-cut order:** R0–R10 replaces S0–S7 because most S-slice library parts have shipped. Confirm.
5. Observed, out of scope: `docs/roadmap.md` says the docs app does not consume `@kvirn-ui/patterns` yet, but the docs shell imports it (`apps/docs/components/site-shell.tsx`).
