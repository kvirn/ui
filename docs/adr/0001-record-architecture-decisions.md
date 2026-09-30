# ADR-0001: Record architecture decisions

- **Status:** Accepted
- **Date:** 2026-09-30
- **Deciders:** Maintainers
- **Tags:** process

## Context

KvirnUI targets the public sector, where decisions must be traceable. That goes for tenders and audits, and for AI agents working in the repo who need context.

## Decision

We will record significant decisions as ADRs in `docs/adr/`, using `0000-template.md`, and larger work as plans in `docs/plans/`.

## Consequences

- Decisions are auditable, and agents can find the "why".
- Writing ADRs adds a small overhead, which is acceptable.
