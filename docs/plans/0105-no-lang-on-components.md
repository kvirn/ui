# Plan 0105: No `lang` on components in docs, examples and tests

- **Status:** Done
- **Owner:** orchestrator
- **Created:** 2026-10-12 · **Target:** alpha
- **Related:** AGENTS.md rule 14, `docs/architecture.md` (Language and direction come from `KvirnProvider`), `api-conventions` skill

## Goal

The language comes from `KvirnProvider` alone. No doc, example, story or test sets `lang` on a KvirnUI component, so nobody learns to.

## Non-goals

- No type change. The native `lang` attribute still passes through to a part's element; it just isn't documented, shown or tested.
- Component-computed `lang` stays: the Calendar heading (a month in a fallback language), a toast shown from a provider in another locale, and `itemToLang` (Listbox, Combobox, Autocomplete). Their tests stay.
- `LanguageLinks.Link` keeps `lang`, documented as the exception (each language written in itself, 3.1.2).
- `lang` on plain elements the consumer owns (`<html>`, `<article>`, `<span>`, `<div dir="rtl" lang="ar">` wrappers in tests, read-aloud content) stays.

## Decisions (maintainer, 2026-10-12)

| Question                                      | Options weighed                                            | Chosen                                  |
| --------------------------------------------- | ---------------------------------------------------------- | --------------------------------------- |
| Scope                                         | `Omit<…, 'lang'>` in types · docs and tests only           | Docs and tests only                     |
| `LanguageLinks.Link`                          | derive from `hrefLang` · keep as exception · drop          | Keep as exception                       |
| Computed `lang` (Calendar, toast, itemToLang) | keep · remove                                              | Keep                                    |
| Example text that falls back to English       | nested provider · plain `<div lang>` wrapper · just delete | Nested provider                         |
| Reach                                         | everything · packages only                                 | packages, `apps/docs`, `apps/storybook` |

## Design

**Fallback text.** When an example's or story's own text has no entry for the locale and falls back to English, the whole example renders in a nested English provider. The language reaches the DOM through the provider's `localeProps`, spread on one wrapper element the helper owns (`display: contents`, no landmark). The component strings switch to English too, which matches the text.

```tsx
// apps/docs/components/example-language.tsx (docs) and apps/storybook/src/fixture-language.tsx (stories)
export function InEnglishWhenFallback({
  isFallback,
  children,
}: {
  isFallback: boolean
  children: ReactNode
}) {
  if (!isFallback) return children
  return (
    <KvirnProvider locale="en" messages={en}>
      <LocaleScope>{children}</LocaleScope>
    </KvirnProvider>
  )
}
function LocaleScope({ children }: { children: ReactNode }) {
  const { localeProps } = useLocale()
  return (
    <div className="…-language-scope" {...localeProps}>
      {children}
    </div>
  ) // display: contents
}
```

- `apps/docs`: `getExampleTexts`, `useExampleTexts` and `defineExampleTexts` return `isFallback: boolean` instead of `textLang`. Every example wraps its root in the helper and drops each `lang={textLang}`.
- `apps/storybook`: each fixture's `xTextsFor(locale)` returns `isFallback` instead of `lang`, and each story or fixture wraps its root in the helper and drops each `lang={lang}`. A fixed `lang="en"`, `"sv"` or `"fi"` on a component goes: the story's locale or a nested provider sets it. An RTL story takes `dir` from a nested provider (`dir="rtl"`), as `calendar.fixture.tsx` does.
- `packages`: a test that passes `lang` only as a sample pass-through attribute drops it (`id`, `data-*` and `aria-*` already prove pass-through). The `a11y.md` "passed through" rows drop `lang`. Kbd, Link, PageHeader and SiteAlert docs drop the `lang` advice; a passage in another language points to a nested `KvirnProvider` with `localeProps` on the consumer's element (`kvirn-provider.md`, "A section in another language").

## Tasks

- [x] packages: tests, `.md`, `.a11y.md`, JSDoc examples (Kbd, Link, PageHeader, SiteAlert, Card, Section, Navigation, TableOfContents)
- [x] `apps/docs`: helper, text hooks, every example under `apps/docs/examples`
- [x] `apps/storybook`: helper (`fixture-language.tsx`: `InEnglishWhenFallback`, `InLanguage`), every fixture and story
- [x] skills: `api-conventions` (docs, examples and tests never set `lang` on a component), `storybook-docs` (fallback text: nested provider)
- [x] gates: `vp check` · `vp test run` on the changed files · `i18n:check` · `theme:check`
- [x] `accessibility-reviewer` on the diff (3.1.2 kept through the nested provider)

## Implementation notes (apps/storybook)

- `InLanguage({ locale, messages, dir })` joins the helper for a passage fixed in another language (Navigation in Finnish, Link in fi/sv, Address in Arabic RTL); `messages` defaults to `en`.
- `Kbd lang="en"` is dropped (key names in running text); in the Arabic RTL Kbd story the key sits in a plain `<span lang="en">`. `PageHeader.Title lang="fi"` became a plain `<span lang="fi">` inside it.
- `.kv-story-language-scope { display: contents }` in `preview.css`.
