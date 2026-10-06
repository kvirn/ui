---
'@kvirn-ui/testing': minor
---

In the new `@kvirn-ui/testing/read-aloud` sub-entry (it needs the optional peer `@guidepup/virtual-screen-reader`; the main entry is unchanged): `readAloud(container)` and `readAnnouncements(container, act)`: an approximate screen-reader transcript for tests, on `@guidepup/virtual-screen-reader`. `readAloud` returns the phrases in the order read (name, role, state, description, heading level, landmarks); `readAnnouncements` returns the non-empty live-region phrases (`polite: …`, `assertive: …`) that `act` causes, waiting `settle` ms (default 100) after the first so a second one is kept, and rejects if nothing is announced within `timeout`. This is an approximation, not NVDA or JAWS output, never proof of the manual AT matrix, and it does not prove modality or focus containment.
