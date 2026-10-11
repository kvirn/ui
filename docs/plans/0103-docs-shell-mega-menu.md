# Plan 0103: Docs shell, mega menu in the masthead and the PageHeader pattern

- **Status:** In progress (Phase 2 built, gates pending)
- **Owner:** component-engineer (Phase 1), a second engineer (Phase 2)
- **Created:** 2026-10-11 · **Target:** alpha candidate
- **Related:** [docs-shell-mega-menu.md](../design/docs-shell-mega-menu.md) (§10 is the input of Phase 1), plans 0095, 0099

## Goal

The docs site shows two header bands (top bar, masthead holding logo, topics with grouped mega panels, and search) and a page intro band, both as `@kvirn-ui/patterns` patterns with stories, so the library shows what the docs site uses.

## Non-goals

- `apps/docs` (Phase 2). Tokens, `theme.css`, dependencies. Presentation props (AGENTS.md rule 14).

## Background

Maintainer approved the spec and the DESIGN.md mega-panel line ("optionally grouped under a group link or label at weight 600", DESIGN.md:436) on 2026-10-11. Phase 1 = patterns, CSS, contracts, stories (this plan's tasks). Phase 2 = `apps/docs` composes them.

## Design

Spec: [docs-shell-mega-menu.md §10](../design/docs-shell-mega-menu.md). Decisions below.

### API sketch

```tsx
<SiteHeader.Root variant="primary">
  <TopBar.Root>…</TopBar.Root>
  <SiteHeader.Masthead>
    <ApplicationLogo.Root>…</ApplicationLogo.Root>
    <SiteHeader.Menu>
      <SiteHeader.MenuButton>Menu</SiteHeader.MenuButton>
      <SiteHeader.MenuPanel>
        <MainMenu.Root label="Site">
          <MainMenu.Topic>
            <MainMenu.TopicButton>Components</MainMenu.TopicButton>
            <MainMenu.TopicPanel>
              <MainMenu.Overview href="/c">All components</MainMenu.Overview>
              <MainMenu.Group>
                <MainMenu.GroupLink href="/c/actions">Actions</MainMenu.GroupLink>
                <Navigation.List>
                  <MainMenu.Link href="/c/button">Button</MainMenu.Link>
                </Navigation.List>
              </MainMenu.Group>
              <MainMenu.Group>
                <Navigation.Label>Data</Navigation.Label>
                <Navigation.List>…</Navigation.List>
              </MainMenu.Group>
            </MainMenu.TopicPanel>
          </MainMenu.Topic>
        </MainMenu.Root>
      </SiteHeader.MenuPanel>
    </SiteHeader.Menu>
    <SiteSearch …>Search</SiteSearch>
  </SiteHeader.Masthead>
</SiteHeader.Root>

<PageHeader.Root>
  <Breadcrumb… />
  <PageHeader.Title>Tabs</PageHeader.Title>
  <PageHeader.Lead>…</PageHeader.Lead>
  <PageHeader.Facts>
    <DefinitionList.Row><DefinitionList.Term>Package</DefinitionList.Term><DefinitionList.Description>…</DefinitionList.Description></DefinitionList.Row>
  </PageHeader.Facts>
</PageHeader.Root>
```

### Accessibility contract (draft)

No new keys. `site-header.a11y.md`: Menu may sit in Masthead; Tab order logo → topics (and open panel) → search field → Search. `main-menu.a11y.md`: nested group lists are lists of links. `page-header.a11y.md`: links only. All three updated in this change.

### Theming surface

`kv-site-header-masthead > .kv-site-header-menu`, `kv-mega-menu-group`, `kv-mega-menu-group-link`, `kv-page-header`, `kv-page-header-inner`, `kv-page-header-facts`. No token change.

## Tasks

- [x] Plan
- [x] `MainMenu.Group`, `MainMenu.GroupLink` and grouped panel CSS (P3)
- [x] Menu inside Masthead CSS (P2a), three-band layout unchanged
- [x] `PageHeader` pattern, CSS (P1a), contract, doc, export
- [x] Contracts: `site-header.a11y.md`, `main-menu.a11y.md`
- [x] Stories: `PrimaryMastheadMenu`, `…Open`, `…Narrow`, RTL, forced colours, Keyboard extended; `page-header.stories.tsx`
- [x] Phase 2 (`apps/docs`): shell, menu, `DocsPage` intro, Get started sidebar, pager, footer, favicon, tests (orchestrator gates and review pending)

## Decisions

- Options for groups: (a) only shipped parts (`li` + `Link.Root`), (b) a part. Chose a small `MainMenu.Group` (`<li class="kv-mega-menu-group">`) and `MainMenu.GroupLink` (a link that registers the trail like `MainMenu.Link` but is not a list item), because a group page can be the current page and its `data-trail` and only-while-shown rule must work. A group with no page uses `Navigation.Label` (no new part).
- Menu in Masthead is pure CSS on `.kv-site-header-masthead > .kv-site-header-menu`; no prop.
- `PageHeader` lives in `site-chrome/page-header/` (stories live there too).
- Wide search wraps to its own row when the brand and topics fill the row (flex wrap, as the spec says "wraps if needed"); below 64rem the search is full width (the brief), not max 22rem as in the spec's width table.
- `.kv-page-frame-main:has(> .kv-page-header:first-child)` drops main's top padding, so the band touches the header.
- Grouped panel link styling (underline rules) applies only to panels that hold a `MainMenu.Group`, so ungrouped panels keep their look.
- `PageHeader.Title` is `Heading as="h1" size="display"`; `Facts` is a `DefinitionList.Root` with rows written as children.
- Phase 2: the intro band must sit outside the article and above the Get started sidebar, but pages render inside the shell's `main`. Options: (a) a portal into a shell slot (breaks server rendering), (b) CSS breakout (fragile), (c) the shell passes the sidebar, trail and pager down in a context and each page renders `DocsPage`, which lays out band, sidebar, article and pager. Chose (c); `PageHeading` is removed.
- Phase 2: `SiteSection.groups` makes a section a topic (Components, Content types), `overviewLabel` names its overview link, `sidebar: true` marks Get started. The menu, breadcrumb and pager all derive from `site-sections.ts`.
- Phase 2: pager chain = a section's leaf pages (group pages' pages, or all pages of a section without groups, so Get started is in its chain). Index and group pages get none.
- Phase 2: `ComponentPage` takes `packageName` (default `@kvirn-ui/react`) and `pattern`; only the Tabs page sets `pattern` ("APG Tabs"). The status sentence stays under the facts unless the status is stable.
- Phase 2: `app/icon.svg` holds raw palette values by design; the raw-colour check only scans `.css`, so no exemption was needed.

## Risks & open questions

- A wide mega panel is `position: absolute` against `.kv-site-header`; the Menu inside the masthead must not become a positioning context.

## Testing strategy

Patterns have no unit tests: axe on every story in every theme, and the Keyboard story.

## Done when

- [ ] Scoped `vp check` and the three story files green, 0 axe violations
- [ ] Plan ticked, `docs/roadmap.md` updated

## Decisions: link-look Button and top bar items (2026-10-11)

- `kv-button--link` is a class, not a prop (Button has no `variant`). `DisplaySettings.Compact` already renders `Popover.Trigger as={Button}`, so its trigger has `kv-button`; the docs and stories pass `className="kv-button--link"` alone. The old `.kv-top-bar .kv-display-settings-compact-trigger` override is removed (only icon hiding and the bar's font size remain).
- A top-bar fill sets the link look's on-colour in patterns.css (`--kv-top-bar-on-fill`, `--kv-site-header-on`), not theme.css. Disabled in a fill keeps the on-colour with the dashed underline (text-muted fails on the fill, and a disabled control is exempt from 1.4.3).
- Every `.kv-link` and `button` in a top bar is `inline-flex`, 24px minimum at every width, underlined on hover only; Navigation items lose their padding and 44px minimum width, and the bar's nav list gap is `space-4`.
