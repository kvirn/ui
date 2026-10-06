---
'@kvirn-ui/react': patch
---

A `Menu` or `Popover` that starts open (`defaultOpen`) and is closed by the platform, such as another popover opening, no longer moves focus to its trigger or scrolls the page to it when focus was never inside it.

Focus is returned from `body` only after it had been inside the popup (or on the trigger, for `Popover`), or when the user closed a `Popover` themselves with Escape or its Close button. A popup closed by the platform before anyone interacted with it leaves focus alone. `Dialog` and `AlertDialog` behave as before, including under StrictMode.

When a pointer press outside (or a light dismiss) closes a `Menu` or `Popover`, focus still returns to the trigger but the page no longer scrolls back to it. Escape and item or Close activation still scroll the trigger into view.
