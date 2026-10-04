# Alert

> **Draft** (Plan 0020). This page moves to the docs site once `apps/docs` has a content system. The accessibility contract is [alert.a11y.md](alert.a11y.md), the design spec is [docs/design/alert.md](../../../../docs/design/alert.md), and the decisions are in the api-conventions skill.

> **Not assertive.** Despite the name, an Alert is not `role="alert"` and does not interrupt anyone. That role is only the Announcer's assertive region. See `announce` below.

A status message in the content: something people need to know now, or the result of what they just did. Use `Alert.Info`, `Alert.Success`, `Alert.Warning` or `Alert.Danger`: each shows its status with an icon, a word and a colour, never with colour alone. It doesn't announce itself unless you ask, and it never takes focus on its own.

- Five roots: the plain `Alert.Root`, and four ready-made ones, `Alert.Info`, `.Success`, `.Warning` and `.Danger` (also named exports: `AlertRoot`, `AlertInfo`, `AlertSuccess`, `AlertWarning`, `AlertDanger`).
- Three parts inside them: `Alert.Title` (required, an `h2` by default), `Alert.Body` and `Alert.Actions` (both optional).
- No role, no `aria-live` and no `aria-atomic` on the box. A screen reader reads it in reading order, and finds the Title in the heading list.
- Status is a class, not a prop: you choose it by choosing the component. There is no `variant` prop.
- Headless: no CSS. Every part renders its stable class, and your `className` joins it. With `@kvirn-ui/theme/theme.css` imported, it's styled.
- Not dismissible in this version. Never on a timer. A Toast (transient) is a later component.

## Component

```tsx
import { Button, Alert } from '@kvirn-ui/react'

// Present when the page loads: no announce, no role, no focus. It's content.
;<Alert.Warning>
  <Alert.Title>Ditt parkeringstillstånd går ut den 12 november 2026</Alert.Title>
  <Alert.Body>
    <p>Förnya det senast den 5 november.</p>
  </Alert.Body>
  <Alert.Actions>
    <Button>Förnya tillståndet</Button>
  </Alert.Actions>
</Alert.Warning>

// Inserted after an action, while focus stays on the button: announce it once.
{
  failed ? (
    <Alert.Danger announce="polite">
      <Alert.Title>Vi kunde inte skicka din ansökan</Alert.Title>
      <Alert.Body>
        <p>Det blev fel hos oss. Dina svar är sparade. Försök igen om några minuter.</p>
      </Alert.Body>
    </Alert.Danger>
  ) : null
}
```

Each ready-made root renders four things from one internal table:

| Root            | Class               | Icon (shape)           | Status word key (sv)              |
| --------------- | ------------------- | ---------------------- | --------------------------------- |
| `Alert.Info`    | `kv-alert--info`    | `info` (a square)      | `alert.infoPrefix` (Information:) |
| `Alert.Success` | `kv-alert--success` | `success` (a circle)   | `alert.successPrefix` (Klart:)    |
| `Alert.Warning` | `kv-alert--warning` | `warning` (a triangle) | `alert.warningPrefix` (Varning:)  |
| `Alert.Danger`  | `kv-alert--danger`  | `error` (an octagon)   | `alert.dangerPrefix` (Fel:)       |

The colour (CSS on the class), the icon and the status word therefore can't disagree. The word starts the Title, so heading navigation reads "Varning: Ditt parkeringstillstånd går ut …". The default theme hides it visually, as it does for a field's "Fel:". Override the word per instance (`messages={{ dangerPrefix: 'Viktigt:' }}`) or per provider (`messages.alert`), the usual order. An override changes the word, never which status it belongs to.

### Pick the status

Pick the status by what happened, not by the colour you want. If no status fits, it isn't an alert: a quote or an aside is plain content (a paragraph, or `blockquote` in prose), and never a `-subtle` background.

| Use             | For                                                                       |
| --------------- | ------------------------------------------------------------------------- |
| `Alert.Info`    | Something the user needs to know before they act. Otherwise, leave it out |
| `Alert.Success` | The result of what they just did, and what happens next                   |
| `Alert.Warning` | A consequence and its deadline, or something that may go wrong            |
| `Alert.Danger`  | An error or a failure: what happened, whether work is safe, what to do    |

For a status that comes from data, keep the choice visible in your code with a typed map:

```tsx
import { Alert } from '@kvirn-ui/react'
import type { AlertVariant } from '@kvirn-ui/react'

const alertFor = {
  info: Alert.Info,
  success: Alert.Success,
  warning: Alert.Warning,
  danger: Alert.Danger,
} satisfies Record<AlertVariant, unknown>

const ResultAlert = alertFor[result.variant]
```

### The Title

- A required heading. **You choose the level** (1.3.1, 2.4.6): one level below the heading of the part of the page it's in, so usually `h2` directly under the page's `h1`, `h3` inside a section with an `h2`. Never skip levels. `render={<h3 />}` changes it.
- For one sentence that needs no heading (a consequence next to the Send button), render a paragraph: `<Alert.Title render={<p />}>`. The status word is still first.
- Write the outcome in the user's words ("Vi kunde inte skicka din ansökan"), never only "Fel". The Body says what to do and by when. At most two actions, with verbs ("Försök igen"). One alert per region at a time.
- A root with no Title warns in development: the Title holds the status word and names the message.

### Announcing

The visible alert is never a live region. When it must be heard without focus, set `announce="polite"` (or `"assertive"`) on any root, and it calls the shared Announcer once, when it mounts, with its Title and Body text (the status word included). Needs a `KvirnProvider`.

| When it appears                                                               | Do                                                                                                                                                                      |
| ----------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Present when the page loads (a deadline, an outage, a warning about the task) | No `announce`, no role, no focus. It's content                                                                                                                          |
| Inserted after an action, and focus stays where it is (Saved, Send failed)    | `announce="polite"`, near the control that caused it                                                                                                                    |
| Urgent, not caused by the current action, and the user must act now           | `Alert.Danger announce="assertive"`. Rare. Never for Info or Success (dev warning)                                                                                      |
| The outcome of an action, shown after a page load or route change             | Move focus to the root once (`tabIndex={-1}`, `ref.focus()`), and no `announce`: both read it twice                                                                     |
| Errors on submit                                                              | The error summary block (later) moves focus. No `announce`. Each field's error reads on focus                                                                           |
| Its text changes while shown                                                  | Not supported. Call `useAnnouncer()` yourself. A new `key` also announces again, but never when a button inside it holds focus: the remount drops the focus to the page |

Never announce and focus at once. Set `announce` only from the state of the action that just happened: a server-rendered alert with `announce` is announced after hydration. Inside a modal dialog the Announcer's regions are silenced for now, so an alert there isn't heard.

### Your own look

From least to most work:

| You want                                         | Do                                                                                                                                                                                                              | You keep                                                                                            |
| ------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Our structure, your colours or spacing           | Set the two component tokens in your own (unlayered) CSS: `.kv-alert--warning { --kv-alert-background: …; --kv-alert-accent: … }`. Or set the semantic tokens and scales. Run `checkThemeCss()` on your colours | Everything: icon, word, announce, our classes                                                       |
| Our component, your own look entirely            | Skip or copy `theme.css` and style the classes yourself. Or keep the theme and drop our class with the `render` function form: `render={(props) => <div {...props} className="my-warning" />}`                  | The icon, the word and `announce`, from `Alert.Warning`                                             |
| Your own icon or word, or a status we don't have | `Alert.Root` with your class, your `<Icon name="…" className="kv-alert-icon" />` first, and your own `<span className="kv-alert-status">` with your translated word first in the Title                          | The layout, the Title, Body, Actions and `announce`. **You own the colour, icon and word agreeing** |
| A different icon drawing everywhere              | Register `info`, `success`, `warning` or `error` in `KvirnProvider`. Keep its shape distinct from the other three                                                                                               | Everything else                                                                                     |

Development warnings help you keep the agreement: a ready-made root whose `className` (or `render` element) carries another status class, such as `<Alert.Warning className="kv-alert--danger">`, and a plain `Alert.Root` with one of our status classes.

### Classes for the default theme

| Class                                                                                     | On                   | Sets                                                                                           |
| ----------------------------------------------------------------------------------------- | -------------------- | ---------------------------------------------------------------------------------------------- |
| `kv-alert`                                                                                | every root           | the box: neutral `surface` and a `border-control` bar, if no status class                      |
| `kv-alert--info`, `--success`, `--warning`, `--danger`                                    | the ready-made roots | the two tokens: `--kv-alert-background` (`-subtle`) and `--kv-alert-accent`                    |
| `kv-alert-icon`, `kv-alert-title`, `kv-alert-status`, `kv-alert-body`, `kv-alert-actions` | the parts            | the icon beside the first line, the title, the visually hidden word, the text, the actions row |

The look: a `-subtle` background, a 4px inline-start bar in the status colour, the icon, the `sm` radius, no shadow and no motion. In forced colours all four statuses share one colour, so the icon's shape and the status word carry the status. Compact density (`kv-compact`) reduces padding from 64rem. Add `kv-prose` to the Body for CMS content. An alert may sit on the page, in a Section or in a Card body. Never a Card or a Section inside an Alert, and never an Alert in an Alert.

### One site-wide alert as a landmark

The default `<div>` isn't a landmark. For one site-wide alert only (a service outage), render a named region:

```tsx
<Alert.Danger render={<section aria-labelledby={titleId} />}>
  <Alert.Title id={titleId}>Tjänsten är nere</Alert.Title>
</Alert.Danger>
```

Never for messages about a part of the page.

### `render`

An element keeps its own props, and the part's are merged in: class names join, styles merge and refs merge. The function form gets the props, a callback ref that fits any element, and an empty state object. On a root, the props include the icon as `children`, so spreading them keeps the icon.

## Hook

```tsx
import { Icon, useAlert } from '@kvirn-ui/react'

function PermitNotice() {
  const alert = useAlert({ variant: 'warning', announce: 'polite' })
  return (
    <div {...alert.rootProps}>
      <Icon {...alert.iconProps} />
      <h2 {...alert.titleProps}>
        <span {...alert.statusProps} /> Ditt tillstånd går ut
      </h2>
      <div {...alert.bodyProps}>…</div>
    </div>
  )
}
```

`useAlert({ variant?, announce?, messages? })` returns `rootProps`, `titleProps`, `bodyProps` and `actionsProps` (class names, plus callback refs for the root, Title and Body). With a `variant` it also returns `iconProps` (`name` and `className`, for `<Icon>`) and `statusProps` (`className` and the resolved word as `children`), from the same table as the components. Without one, it is the plain Root: no status class, `iconProps` and `statusProps` are `undefined`. Attach `titleProps` and `bodyProps` so `announce` can read their text. Merge your own classes with `mergeProps`.
