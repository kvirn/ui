# Compliance & regulation

> This is not legal advice. It records our current understanding. **Last verified:** 2026-09-30. Re-verify against primary sources every 6 months and before any public claim. The procedure and claims wording are in `.claude/skills/regulations/`.

## EU

| Instrument                                 | Applies to                                                                | Notes                                                                                                                                                                                                                                                                                                                                       |
| ------------------------------------------ | ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Web Accessibility Directive (EU) 2016/2102 | Public-sector sites and apps                                              | Requires EN 301 549, an accessibility statement and a feedback mechanism                                                                                                                                                                                                                                                                    |
| European Accessibility Act (EU) 2019/882   | Private products and services (e-commerce, banking, transport, e-books …) | Applies from 28 June 2025                                                                                                                                                                                                                                                                                                                   |
| EN 301 549                                 | Harmonised standard                                                       | v3.2.1 references WCAG 2.1 AA. The next revision is expected to align with 2.2, and we target 2.2 now                                                                                                                                                                                                                                       |
| Cyber Resilience Act (EU) 2024/2847        | Products with digital elements                                            | Open-source stewardship: SBOM, vulnerability handling, security advisories                                                                                                                                                                                                                                                                  |
| GDPR / ePrivacy                            | Everyone                                                                  | We ship no telemetry, no third-party requests and no cookies. `KvirnProvider` writes the theme preference to `localStorage` only after an explicit user selection (it can be turned off with `storage: 'none'` or replaced by an adapter). `TODO(legal-verify)`: that an explicitly chosen UI preference is exempt under ePrivacy Art. 5(3) |

## Nordic implementation

| Country | Law                                                                                                       | Supervision                                                            |
| ------- | --------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| Sweden  | Lag (2018:1937) om tillgänglighet till digital offentlig service (DOS-lagen). Lag (2023:254) for the EAA  | Digg (DOS). Several sector authorities for the EAA (verify per sector) |
| Finland | Laki digitaalisten palvelujen tarjoamisesta (306/2019), amended for the EAA                               | **Traficom** since 1 Jan 2025 (previously Etelä-Suomen AVI)            |
| Norway  | Likestillings- og diskrimineringsloven § 18, forskrift om universell utforming av IKT (WAD via EEA, 2023) | Uutilsynet (part of Digdir). Also covers some private-sector solutions |

## What KvirnUI gives adopters

1. **Per-component conformance data,** published as JSON and HTML with each release.
2. **Accessibility statement and feedback blocks,** with national variants. These provide structure only: the adopter supplies the facts.
3. **Supply-chain evidence:** a CycloneDX SBOM, npm provenance, `SECURITY.md` and a documented support/LTS period.
4. **Known issues,** published openly.

Conformance belongs to the final site, not the library. We never claim "compliant".
