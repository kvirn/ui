---
'@kvirn-ui/react': major
'@kvirn-ui/rich-text': major
---

`as` replaces `render` (Plan 0093). A part's element is now a plain `as` prop, and `render`, its function form, `RenderProp` and `takeRenderElementProps` are removed, with no deprecation. Why: an element prop made in a Server Component reaches a client part as a `React.lazy` wrapper, so the part silently rendered its default element and hydration mismatched (`Alert.Title` was a `<p>` on the server and an `<h2>` in the browser). A string and a client component both cross from a Server Component, and a function never can.

- Tag parts take `as` with a string from a short list per part (`Alert.Title`: `h2` to `h6` or `p`; `Section`: `div`, `section`, `aside`, `nav`, …). The list is in the part's `*.a11y.md`. A tag outside it is a type error, and in JS it warns once (`as-not-allowed:<part>:<tag>`) and renders the default.
- Component parts (`Link.Root` and the links built on it, `Tooltip.Trigger`, `Toolbar.Item`, `Popover.Trigger`, `Popover.Close`, `Dialog.Close`, `Menu.Trigger`, `Icon`) take `as={Component}`. Its props are plain JSX props on the part and are merged with `mergeProps`. The target must accept `ref` and spread the rest on its DOM node. One `as` per part: to combine two, write a wrapper component.
- Every other part renders one native element and has no `as`. For another element, call the hook and spread its prop object (`useButton()`, `useHeading()`).
- `Columns`, `Stack` and `Accordion.Root` add `role="list"` themselves when they render a `ul` or `ol` (WebKit and VoiceOver drop the list role under `list-style: none`), as `Navigation.List`, `ErrorSummary.List` and `TableOfContents.List` already did. Don't write it.
- `Heading` takes a required `as="h1"` to `"h6"` instead of `level`. `useHeading` and `Accordion.Heading` keep `level`.

Migration:

| Before                                         | After                                                |
| ---------------------------------------------- | ---------------------------------------------------- |
| `<Alert.Title render={<p />}>`                 | `<Alert.Title as="p">`                               |
| `<Link.Root render={<RouterLink to="/" />}>`   | `<Link.Root as={RouterLink} to="/">`                 |
| `<Tooltip.Trigger render={<Button />}>`        | `<Tooltip.Trigger as={Button}>`                      |
| `<Button render={<a href="/" />}>` (no `as`)   | `useButton()` and your own element, or `<Link.Root>` |
| `render={(props, state) => …}` (function form) | style with `data-*`, or call the hook                |
| `<Heading level={2}>`                          | `<Heading as="h2">`                                  |
| `<Heading level={2}>` as a `<legend>`          | `useHeading({ level: 2 })` on your own element       |

Removed with their cause, because `as` or the part's own element can no longer produce it: the not-a-`<button>` warnings of `Button`, `Toggle`, `Tabs.Tab` and `Disclosure.Trigger` (`toggle-not-a-button`, `tabs-tab-not-a-button`, `disclosure-not-a-button`), the not-a-`<fieldset>` warning of `Fieldset.Root`, `menu-item-navigation`, the `Alert.Close` not-a-button warning and the `FileUpload.Trigger` missing-text warning. The `*State` and `*ElementProps` types are no longer exported (for example `HeadingState`, `HeadingElementProps`, `AlertState`, `AlertCloseState`, `RichTextEditorState`), and `HeadingTag` is new. `RichTextEditor` composes its own tooltips and popovers through `as`.
