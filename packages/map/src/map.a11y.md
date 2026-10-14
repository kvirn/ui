# Accessibility contract: Map (Root, Skip, Viewport, Markers, Controls, Attribution, BaseMapSwitch, List, Details)

- **APG pattern:** none. There is no APG map pattern. The keys follow the [keyboard interface practice](https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/), and the markers follow the [Toolbar](https://www.w3.org/WAI/ARIA/apg/patterns/toolbar/) arrow model.
- **Deviations:** the markers in view are **one Tab stop** and the arrow keys move between them, where a Tab stop per marker is unusable with many places. Arrows on the viewport pan and `+` / `-` zoom, while it has focus. Approved by the maintainer on 2026-10-14 (Plan 0117, spec §9 D2 and D4, recorded in the `keyboard` skill).
- **Native elements used:** `<div role="region">` (Viewport), `<div role="group">` (Markers, Controls), `<button>` (marker, controls, list row trigger, Close), `<a>` (skip link), radio group (BaseMapSwitch), `<h2>` and `<ul>` (List), `<section>` (Details), `<p>` (Attribution).
- **Status:** in progress. English only. **No tests exist yet**: every Test cell is `pending`. Manual AT is `pending`.
- **Tests:** `map.test.tsx` next to this file (pending, Plan 0117). `map.stories.tsx` in `apps/storybook/src/components/map/`.

A Map shows places on a camera over a base map, with the same places as a list. It is one focusable region you can pan and zoom from the keyboard, with a set of markers that is a single Tab stop, buttons for every gesture, and a list that is the screen reader user's equivalent of the map.

## Roles, states, properties

| Part              | Element / role                                | ARIA / state                                                                                                                    | Notes                                                                                                                              |
| ----------------- | --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Map.Root          | `<div class="kv-map">`                        | none                                                                                                                            | Owns the camera, the selected place and the base map. `label` is the viewport's name                                               |
| Map.Skip          | `<a>` skip link                               | none                                                                                                                            | `map.skipToList`. Goes to the list heading, or the details title while a place is open (2.4.1)                                     |
| Map.Viewport      | `<div role="region" tabindex="0">`            | `aria-label` the consumer's `label`, `aria-roledescription` `map.roleDescription`, `aria-describedby` the summary and the hint | The engine's canvas inside is `aria-hidden` and out of the tab order. `data-status` is `loading`, `ready` or `failed`             |
| Map.Markers       | `<div role="group">`                          | `aria-label` `map.markersLabel`                                                                                                 | One Tab stop: `tabindex="0"` on the selected marker, else the first, `-1` on the others                                            |
| Marker            | `<button>`                                    | named by the place's name, `aria-expanded`, `aria-controls` the details                                                         | Opens the details. `data-highlighted` while its list row is hovered                                                                |
| Map.Controls      | `<div role="group">`                          | `aria-label` `map.controlsLabel`                                                                                                | Icon-only buttons named `map.zoomIn`, `map.zoomOut`, `map.panNorth` and so on, and a text button `map.reset`                       |
| Map.Attribution   | `<p>`                                         | `aria-label` `map.attributionLabel`                                                                                             | The consumer's text and links. Native links                                                                                        |
| Map.BaseMapSwitch | radio group in a `<div>`                      | legend `map.baseMapLabel`                                                                                                       | Renders nothing with fewer than two base maps. Native radios, see `radio-group.a11y.md`                                            |
| Map.List          | `<h2 tabindex="-1">` and `<ul role="list">`   | each row's trigger is a `<button aria-expanded aria-controls>`                                                                  | The heading states the count (`map.placesInView` or `map.placesAll`). Empty: `map.listEmpty`                                       |
| Map.Details       | `<section aria-labelledby>` with a heading    | Close is named `map.detailsClose` with the title                                                                                | Heading `tabindex="-1"` takes focus on open. In flow, never a modal                                                                |

Each rule below has a test (pending):

- **Equivalent.** Every place in the data is in the list, and the viewport's description states the count (1.1.1, 1.3.1).
- **Names.** The viewport's name is the consumer's `label` and its role description is `map.roleDescription`.
- **Announcements** go through the shared Announcer, polite, about 500 ms after the view settles and never during a drag: `map.placesInView` (or `map.placesAll`) after a key, a button or a reset moves the view and the count changed, `map.zoomLimitIn` and `map.zoomLimitOut` at the limits, `map.tilesFailedTitle` once per failure, and `map.baseMapChanged` when the map type changes. Not announced: the map loading, hover, highlight and opening details (focus is the announcement).
- **Focus.** Opening details moves focus to the details heading. Closing returns it to the opener (the marker or the list row), else the list heading. Never `body` (2.4.3).
- **Keys are taken only while the viewport has focus** and never with Control, Command or Alt, so browser zoom keeps working (1.4.4, 2.1.4).
- **Pointer.** Drag pans, one finger scrolls the page on touch and two fingers pan, the wheel scrolls the page and zooms with Control or Command. A hint (`map.gestureTouch`, `map.gestureWheel`) shows until the next interaction. Every gesture has a button (2.5.1, 2.5.7). Buttons are at least 24 by 24 CSS px (2.5.8).
- **Failure.** When tiles fail, `map.tilesFailedTitle` and `map.tilesFailedBody` show in the viewport and the list still works (3.3.1).
- **WCAG SCs:** 1.1.1, 1.3.1, 1.3.2, 1.4.1, 1.4.4, 1.4.10, 1.4.11, 1.4.13, 2.1.1, 2.1.2, 2.1.4, 2.4.1, 2.4.3, 2.4.7, 2.4.11, 2.5.1, 2.5.3, 2.5.7, 2.5.8, 3.2.1, 3.2.2, 4.1.2, 4.1.3. Raster tile labels are images of text that do not follow the text size (1.4.4, 1.4.5): the tile source is the consumer's, and vector tiles are advised.

## Keyboard

<!-- Format and rules: the `keyboard` skill. Shown on the Storybook Docs page. -->

- **Focus strategy:** roving tabindex
- **Selection follows focus:** no (Enter or Space opens the details)
- **Arrows wrap:** yes (the markers)
- **Shortcuts:** none

| Key                       | Context                     | Action                                                                                                                              | Test                                                          |
| ------------------------- | --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| Tab                       | before the map              | Moves focus to the skip link, then the viewport. The viewport is one stop                                                           | `map.test.tsx › Tab reaches the skip link and the viewport` (pending) |
| Shift+Tab                 | on the viewport             | Moves focus back to the skip link, then the previous focusable element                                                              | `map.test.tsx › Shift+Tab leaves the viewport backwards` (pending) |
| ArrowUp / ArrowDown       | on the viewport             | Pans the map north or south by a quarter of the viewport's shorter side                                                             | `map.test.tsx › the arrows pan the map` (pending)             |
| ArrowLeft / ArrowRight    | on the viewport             | Pans the map west or east. Spatial, so never flipped in RTL                                                                         | `map.test.tsx › the arrows pan the same way in RTL` (pending) |
| `+` / `=`                 | on the viewport             | Zooms in. With Control or Command it is the browser's                                                                               | `map.test.tsx › plus zooms in` (pending)                      |
| `-`                       | on the viewport             | Zooms out. With Control or Command it is the browser's                                                                              | `map.test.tsx › minus zooms out` (pending)                    |
| Escape                    | on the viewport             | Hides the keyboard hint; otherwise the page's                                                                                       | `map.test.tsx › Escape hides the keyboard hint` (pending)     |
| Tab                       | after the viewport          | Enters the markers at the selected one, else the first in list order. The next Tab leaves them                                      | `map.test.tsx › the markers are one Tab stop` (pending)       |
| ArrowRight / ArrowDown    | on a marker                 | Moves to the next marker in list order, and wraps. ArrowRight flips to ArrowLeft in RTL                                             | `map.test.tsx › the arrows move between the markers` (pending) |
| ArrowLeft / ArrowUp       | on a marker                 | Moves to the previous marker, and wraps. ArrowLeft flips to ArrowRight in RTL                                                       | `map.test.tsx › the arrows move between the markers in RTL` (pending) |
| Home / End                | on a marker                 | Moves to the first or the last marker                                                                                               | `map.test.tsx › Home and End move to the first and last marker` (pending) |
| Enter / Space             | on a marker                 | Opens its details. Focus moves to the details heading                                                                               | `map.test.tsx › Enter and Space open the details` (pending)   |
| Enter / Space             | on a control button         | Zooms, pans or resets the map. The change is announced                                                                              | `map.test.tsx › the control buttons zoom, pan and reset` (pending) |
| Tab / Shift+Tab           | across the controls         | Moves through zoom in, zoom out, Whole map and the four pan buttons, then the attribution links and the map type radios             | `map.test.tsx › Tab moves through the controls in DOM order` (pending) |
| Enter / Space             | on a list row's trigger     | Opens that place's details and moves focus to the details heading                                                                   | `map.test.tsx › a list row opens the details` (pending)       |
| Escape                    | focus inside the details    | Closes the details and returns focus to the opener, else the list heading. Never `body`                                             | `map.test.tsx › Escape closes the details and returns focus` (pending) |
| Enter / Space             | on Close in the details     | Closes the details and returns focus to the opener                                                                                  | `map.test.tsx › Close closes the details and returns focus` (pending) |
| ArrowUp / ArrowDown       | on a map type radio         | Native: moves the choice and changes the map type, which is announced                                                               | `map.test.tsx › the arrows change the map type` (pending)     |

The map takes no other key. Keys on the viewport are read only while the viewport itself has focus, so a button or a link inside keeps its own keys. Control, Command and Alt combinations are never taken.

## Focus management

- Initial focus: none. The map never moves focus on its own: a pan, a zoom, a changed map type and a result shown on the map leave focus where the user put it (3.2.2).
- Opening details: focus moves to the details heading (`tabindex="-1"`), so a screen reader reads the place.
- Closing details: focus returns to the marker or the list row that opened them, else the list heading. Never `body`.
- Never obscured by: the overlays (controls, attribution, hints) never cover a focused marker, and nothing is sticky (2.4.11).
