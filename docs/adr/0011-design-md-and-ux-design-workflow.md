# ADR-0011: DESIGN.md design language and a UX design workflow

- **Status:** Proposed
- **Date:** 2026-09-30
- **Deciders:** Maintainer
- **Tags:** theming, a11y, tooling

## Context

The default theme (`packages/theme/src/tokens.ts`) has no palette yet, and the blocks (M4) and the docs site need a consistent look. Our adopters are Nordic municipalities and agencies whose users include residents using a service once, often on a phone, and staff using tools daily. Agents were designing ad hoc with no shared visual source of truth and no design step before planning.

`docs/vision.md` lists "a brand or full design system" as a non-goal. We need a default look that is easy to rebrand, not a brand.

## Decision drivers

- WCAG 2.2 AA as the floor, and the default theme also meets 2.4.13 and 2.5.5 (ADR-0004)
- Rebranding by overriding semantic tokens must stay accessible (`theme:check`)
- Agents must read the same design rules humans do, in a format they understand
- No third-party requests, fonts included (GDPR, AGENTS.md hard rule 7)
- Resident-facing services need clarity and generous targets. Staff tools need density

## Options considered

### Option A: Adopt a national public-sector design system's look

- ✅ Proven with public-sector users
- ❌ Tied to one country's brand, which is odd for SE, FI and NO adopters alike

### Option B: No default visual language, only tokens

- ✅ Smallest scope
- ❌ Blocks and docs still need a look. Every agent and contributor invents one

### Option C: A neutral, calm, product-grade default in a root `DESIGN.md`, plus a design skill and agent

- ✅ One source of truth for humans and agents, in the open DESIGN.md format (YAML tokens plus prose)
- ✅ Neutral enough for any municipality to rebrand via semantic tokens
- ❌ More to maintain, and it must stay in sync with `tokens.ts`

## Decision

We will use Option C:

- **`DESIGN.md`** at the repo root is the visual source of truth for the default theme, blocks, stories and the docs site. The direction is calm and precise: cool neutral greys, one indigo accent, 1px lines, small radii, flat layered surfaces and tight, legible Inter-first typography with a system fallback. It defines four themes (ADR-0006), comfortable (44px, default) and compact (24px minimum, opt-in for staff tools) density, and its colour values have measured contrast.
- **The `design` skill** (`.claude/skills/design/`) is the procedure from brief to spec: frame, prior art, flow, content, structure, specify, validate and hand off. It also covers design review.
- **The `ux-designer` agent** runs that procedure, writes specs to `docs/design/` and never writes code. For blocks, flows and visual changes it runs before planning, and the plan links its spec.
- Changing a token or rule in `DESIGN.md` needs an ADR and a passing `theme:check`.

## Accessibility impact

Positive: contrast, focus appearance (2px ring, 2px offset), target size, reflow, text spacing, forced colours and reduced motion become properties of the tokens and review checklist rather than fixes. The compact density meets 2.5.8 but not 2.5.5, and is documented as opt-in.

## Consequences

- Positive: consistent blocks and docs, and agents design against written rules.
- Negative / trade-offs: `DESIGN.md` and `tokens.ts` can drift until the tokens are implemented and checked together.
- Follow-ups: a plan to implement the `DESIGN.md` palette, typography and spacing in `packages/theme` with `contrastRequirements` for every pair, and to add an optional `@google/design.md` lint step (needs its own ADR as a dev dependency).

## Validation

`theme:check` passes on the implemented tokens. Design reviews of the first blocks find no blocker against the checklist. Disabled-user testing (docs/accessibility.md) is `pending`.

## References

- DESIGN.md format: https://github.com/google-labs-code/design.md
- ADR-0004, ADR-0006, `docs/vision.md`, `docs/architecture.md#styling-contract`
