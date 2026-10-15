# Plans

Plans describe **how** we will build something. Decisions live in the skills and docs they change. A plan records the options it weighed and the one it chose. Write a plan before any work that spans several PRs or packages, or before a new component.

- Copy `0000-template.md` to `NNNN-short-title.md`.
- Statuses: `Draft` → `Approved` → `In progress` → `Done` | `Abandoned`.
- Keep the task checklist current. Agents should tick items off as they go.
- A plan is deleted in the change that finishes its code and gates. Review and the manual AT matrix are Beta blockers in `docs/roadmap.md`, not plan tasks; its decisions live in the skill or doc that owns them, and `git log -- docs/design/plans/NNNN-*.md` has the plan itself.
- Keep a plan under 250 lines: a Sonnet agent reads it at every spawn. Link prior art instead of pasting it.

## Index

| #                          | Title                                                  | Status      |
| -------------------------- | ------------------------------------------------------ | ----------- |
| [0088](0088-read-aloud.md) | ReadAloud (text to speech player and selection reader) | In progress |
| [0122](0122-quick-exit.md) | QuickExit (leave a sensitive page in one action)       | In progress |
