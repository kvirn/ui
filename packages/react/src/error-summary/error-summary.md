# ErrorSummary

> **Draft** (Plan 0063). This page moves to the docs site once `apps/docs` has a content system. The accessibility contract is [error-summary.a11y.md](error-summary.a11y.md), and the decisions are in [Plan 0063](../../../../docs/plans/0063-summary-list-and-error-summary.md).

The problems of a failed submit, at the top of the form, each a link to its field. Focus moves to the summary once, so the screen reader reads it and a keyboard user starts at the list. It is an [Alert.Danger](../alert/alert.md): the colour, icon and status word agree with every other danger message.

- Five parts: `ErrorSummary.Root`, `.Title` (an `h2`, or `as="h3"` to `"h6"`), `.List` (`<ul>`, or `as="ol"`), `.Item` (`<li>`) and `.Link` (`<a href="#controlId">`). Also exported as `ErrorSummaryRoot`, `ErrorSummaryTitle`, `ErrorSummaryList`, `ErrorSummaryItem` and `ErrorSummaryLink`.
- **Focus is the announcement.** The root is `tabindex="-1"` and takes focus on mount and whenever `focusKey` changes. It is a named `group`, not `role="alert"` and not a live region, so nothing is read twice.
- **A link moves focus to the control** and scrolls its label (or its group's legend) into view. `href="#id"` stays the real address: a modified click, and a link whose control is missing, go to the browser.
- The Title defaults to `errorSummary.title` ("Det finns ett problem"), after the status word ("Fel:").
- With `prefixDocumentTitle`, the page title gets `errorSummary.titlePrefix` ("Fel:") while the summary is shown.
- Headless: no CSS. Classes `kv-error-summary` (with `kv-alert kv-alert--danger` from the Alert), `kv-error-summary-list`, `kv-error-summary-item` and `kv-link kv-error-summary-link`.

## Component

```tsx
import { ErrorSummary, Field, TextInput } from '@kvirn-ui/react'

;<main>
  {errors.length > 0 && (
    <ErrorSummary.Root focusKey={submitCount} prefixDocumentTitle>
      <ErrorSummary.Title />
      <ErrorSummary.List>
        {errors.map((error) => (
          <ErrorSummary.Item key={error.controlId}>
            <ErrorSummary.Link controlId={error.controlId}>{error.message}</ErrorSummary.Link>
          </ErrorSummary.Item>
        ))}
      </ErrorSummary.List>
    </ErrorSummary.Root>
  )}
  <h1>Ansök om parkeringstillstånd</h1>
  <form onSubmit={handleSubmit}>
    <Field.Root controlId="email" invalid={emailError !== undefined}>
      <Field.Label>E-post</Field.Label>
      <TextInput />
      <Field.ErrorMessage>{emailError}</Field.ErrorMessage>
    </Field.Root>
  </form>
</main>
```

Your part:

- **Render it only after a failed submit,** before the step caption and the `h1`, and remove it when there are no errors. Never update it while the user types.
- **Pass the submit count as `focusKey`,** so a second failed submit moves focus again while the summary is already on screen.
- **`controlId` is the control's id:** the Field's `controlId`, or for a group of radios or checkboxes, the first option's id.
- **Write each link like the field's own error,** with what to do ("Ange din e-postadress"). The field keeps its message under the control (3.3.1).
- **Keep `scroll-padding`** above a sticky header and under the on-screen keyboard (2.4.11).
- **A router owns `document.title`?** Leave `prefixDocumentTitle` off and add the prefix there.

| Prop on `ErrorSummary.Root` | What it does                                                                                                                          |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `focusKey`                  | Focus moves to the summary on mount and each time it changes. Without it, once, on mount                                              |
| `disableAutoFocus`          | Never moves focus to the summary. For a static preview (a docs page, a screenshot) only: in an app the focus move is the announcement |
| `prefixDocumentTitle`       | `errorSummary.titlePrefix` before `document.title` while shown. Off by default                                                        |
| `messages`                  | `{ title, titlePrefix }` for this instance                                                                                            |

## Hook

```tsx
import { useErrorSummary } from '@kvirn-ui/react'

function Problems({ errors, submitCount }) {
  const errorSummary = useErrorSummary({ focusKey: submitCount })
  return (
    <div
      {...errorSummary.rootProps}
      className={`${errorSummary.rootProps.className} kv-alert kv-alert--danger`}
    >
      <h2 {...errorSummary.titleProps}>{errorSummary.title}</h2>
      <ul {...errorSummary.listProps}>
        {errors.map((error) => (
          <li key={error.controlId} {...errorSummary.itemProps}>
            <a {...errorSummary.getLinkProps(error.controlId)}>{error.message}</a>
          </li>
        ))}
      </ul>
    </div>
  )
}
```

`useErrorSummary({ focusKey, disableAutoFocus, prefixDocumentTitle, messages })` returns `rootProps` (class, `role="group"`, `tabIndex={-1}`, `aria-labelledby`, a ref the hook focuses), `titleProps` (the id), `listProps`, `itemProps`, `getLinkProps(controlId)` and `title` (the message). It adds no `aria-live` and never announces.

## Dev warnings

- `error-summary-control-missing:<id>`: a link was activated whose `controlId` has no element on the page.
- `error-summary-<part>-outside-root`: a Title, List or Link outside `ErrorSummary.Root`.
- The Alert's `alert-announce-and-focus`: the summary root has `tabindex` and `announce`, which reads it twice.
