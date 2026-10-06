---
name: regulations
description: EU and Nordic accessibility/digital regulation guidance for KvirnUI — WAD, EAA, EN 301 549, DOS-lagen (SE), Laki digitaalisten palvelujen tarjoamisesta (FI), forskrift om universell utforming av IKT (NO), GDPR, CRA. Use when writing any claim about compliance, conformance reports, accessibility-statement or feedback/consent blocks, docs-site copy, or when adding third-party services or dependencies.
when_to_use: compliance claim, marketing copy, accessibility statement, tillgänglighetsredogörelse, saavutettavuusseloste, tilgjengelighetserklæring, cookie consent, SBOM, security policy, new dependency or external service
---

# Regulations

**This is not legal advice.** Our job is to design the product so adopters can comply, and to make accurate claims. The source of truth for the project's understanding is `docs/compliance.md`.

## Procedure

1. **Identify the instruments involved.** Public sector means WAD plus the national law. Private products and services means the EAA. Personal data means GDPR. Shipping software means the CRA (SBOM, vulnerability handling).
2. **Verify against primary sources** before writing anything new or date-sensitive. Laws, versions and deadlines change, so search the web and cite:
   - EU: eur-lex.europa.eu, ETSI (EN 301 549), W3C WAI
   - SE: digg.se, riksdagen.se (EAA supervision is split across sector authorities, so verify per sector)
   - FI: finlex.fi, traficom.fi (accessibility supervisor since 2025-01-01)
   - NO: lovdata.no, uutilsynet.no, digdir.no
3. **Update `docs/compliance.md`** if you learn something new. Add a "verified YYYY-MM-DD" note and the source link. If the change affects a rule, update the skill or doc that owns it in the same PR, with the maintainer's approval.
4. **Write the claim using the approved wording** below.

## Claims policy (hard rule)

- ✅ "Designed and tested to meet WCAG 2.2 Level AA."
- ✅ "Helps you meet the requirements of the Web Accessibility Directive and the EAA."
- ❌ "Compliant", "certified", "guarantees compliance", or "fully accessible". Conformance belongs to the final site, not to the library.
- Every claim on ui.kvirn.com links to its evidence: the conformance JSON, test records and known issues.

## Accessibility statement block, per country

| Country  | Name                                     | Must include (verify)                                                                             | Notes                                             |
| -------- | ---------------------------------------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| SE       | Tillgänglighetsredogörelse               | Conformance status, non-accessible content and reasons, feedback mechanism, how to report to Digg | Follow Digg's template                            |
| FI       | Saavutettavuusseloste                    | Status, deficiencies, feedback channel, enforcement contact (Traficom), in both fi **and** sv     | Public bodies publish in both national languages  |
| NO       | Tilgjengelighetserklæring                | Created and published via Digdir's **uustatus.no** tool for covered entities                      | Our block should link to uustatus, not replace it |
| EU (EAA) | Service information / accessibility info | Description of how the service meets the requirements                                             | Private-sector adopters                           |

The block must never pre-fill the adopter's conformance status. It provides structure and wording, and the adopter supplies the facts.

## Product constraints from regulation

- **GDPR:** no telemetry, no third-party requests (fonts, CDNs, analytics) in packages or the docs site, and no cookies set by the library. The one thing the library stores is the theme preference in `localStorage`, only after an explicit user selection and switchable off (`storage: 'none'`). `TODO(legal-verify)`: that an explicit UI preference is exempt under ePrivacy Art. 5(3).
- **Fonts and assets are self-hosted.** IBM Plex is IBM's own unmodified woff2, committed to `apps/docs/fonts/ibm-plex/` and fetched with `npm pack` rather than installed as a dependency, because its `postinstall` sends IBM telemetry. The theme itself loads no font.
- **Telemetry stays off** in every tool: Storybook (`core.disableTelemetry`) and Next.js (`NEXT_TELEMETRY_DISABLED=1`).
- **Consent block:** equal-weight accept and reject buttons, nothing pre-ticked, keyboard and screen-reader accessible, not a focus trap. Include an ePrivacy note.
- **Feedback block:** satisfies WAD Art. 7 (feedback mechanism).
- **CRA readiness:** CycloneDX SBOM, npm provenance, `SECURITY.md` with a disclosure process, and a documented support period.
- **New dependency or service:** needs the maintainer's approval. Check licence compatibility with AGPL-3.0 and a commercial licence (no GPL-incompatible, and no source-available or non-commercial dependency; MIT, Apache-2.0, BSD and ISC are fine), where data goes (EU only), any network calls and any install scripts, then record the result in the PR description and update the docs that list dependencies (`docs/architecture.md`, `docs/engineering.md`). A runtime dependency must be on the sanctioned list in AGENTS.md rule 6 or be added there. A dev dependency is pinned exactly in the pnpm catalog. `allowBuilds` lists the only packages allowed to run install scripts.
  - Example: Tiptap 3.31.4 (`@tiptap/core`, `pm`, `react`, `starter-kit`, `extension-table`, `extension-image` and `extensions`, with their ProseMirror and `linkifyjs` dependencies) is a peer of `@kvirn-ui/rich-text` only (Plan 0036). Every package is MIT, has no install scripts and makes no network calls (the source was grepped for fetch, XHR, WebSocket and beacons), and nothing from `@tiptap-pro` or Tiptap Cloud is used, because those call third-party servers (GDPR, rule 7). The editor's output is not sanitized: the docs tell adopters to sanitize it on the server, and an image's address is limited to the page's own origin by default, so a text never makes readers' browsers fetch from a third party.
  - Example: `@guidepup/virtual-screen-reader` (`~0.33.0`) is an optional peer of `@kvirn-ui/testing` (the `/read-aloud` sub-entry only) and a pinned dev dependency. It is MIT, has no install scripts, has 4 runtime dependencies and makes no network calls (`lib/` was grepped). It is a test helper and never ships to adopters' pages.
  - Example: the icon libraries `lucide-react`, `@heroicons/react` and `@phosphor-icons/react` are dev dependencies only (tests and stories). They are ISC or MIT, have no dependencies, no network calls and no install scripts, and are not in the SBOM.

## Output

When you've done compliance research, finish with a "Sources (verified YYYY-MM-DD)" list. Flag anything uncertain as `TODO(legal-verify)`.
