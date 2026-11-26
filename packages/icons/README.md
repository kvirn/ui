# @kvirn/icons

Outline icons from KvirnUI on one 24 grid, as plain data with no dependencies. Each icon is tree-shakeable, and an optional React component draws it.

## Install

```sh
npm install @kvirn/icons
```

React is an optional peer (`^19.0.0`). You need it only for `@kvirn/icons/react`.

## Use

Each icon is plain data: its shapes, ready to draw with any framework.

```ts
import { arrowForward } from '@kvirn/icons'

arrowForward.shapes // [['path', { d: '…' }], …]
```

In React, every icon is a component. With no `title`, `aria-label` or `aria-labelledby` the icon is decorative and hidden from assistive technology; give it a name when it carries meaning on its own. Take `title` or `aria-label` from your app's translations. Only the icons you import end up in your bundle.

```tsx
import { ArrowForwardIcon, AttentionIcon } from '@kvirn/icons/react'

<ArrowForwardIcon />
<ArrowForwardIcon size={20} />
<ArrowForwardIcon className="size-4" />   // CSS sizes it instead
<AttentionIcon title="Warning" />
```

`size`, `className`, `title` and the other SVG props pass through, except `tabIndex`, `onClick` and `aria-describedby`: an icon that does something goes inside a `<button>` or `<a>`, and the name goes on that control, not on the icon. To draw icon data you pick at runtime, use `SvgIcon`:

```tsx
import { allIcons, type LibraryIconName } from '@kvirn/icons/all'
import { SvgIcon } from '@kvirn/icons/react'

function PickedIcon({ name }: { name: LibraryIconName }) {
  return <SvgIcon icon={allIcons[name]} />
}
```

An icon with `mirrorInRtl: true` (an arrow, for example) should be flipped in right-to-left text. The components and `SvgIcon` don't flip it: that's up to you. The hint is `arrowForward.mirrorInRtl` from `@kvirn/icons`, and it's shown in the gallery. A flip is one rule, for example `.my-icon:dir(rtl) { transform: scaleX(-1) }`.

`@kvirn/icons/all` exports every icon and the list of names, for pickers and galleries. It isn't tree-shakeable.

Every icon, its name and its meaning: [ui.kvirn.com](https://ui.kvirn.com).

## Licence

MIT, free for any use, commercial and public-sector use included. See [LICENSING.md](LICENSING.md) and [LICENSE](LICENSE).
