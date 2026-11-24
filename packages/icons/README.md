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

In React, `SvgIcon` draws it. With no `title`, `aria-label` or `aria-labelledby` the icon is decorative and hidden from assistive technology; give it a name when it carries meaning on its own.

```tsx
import { arrowForward, attention } from '@kvirn/icons'
import { SvgIcon } from '@kvirn/icons/react'

<SvgIcon icon={arrowForward} />
<SvgIcon icon={attention} size={20} title="Warning" />
```

An icon with `mirrorInRtl: true` (an arrow, for example) should be flipped in right-to-left text. `SvgIcon` doesn't flip it: that's up to you.

`@kvirn/icons/all` exports every icon and the list of names, for pickers and galleries. It isn't tree-shakeable.

Every icon, its name and its meaning: [ui.kvirn.com](https://ui.kvirn.com).

## Licence

MIT, free for any use, commercial and public-sector use included. See [LICENSING.md](LICENSING.md) and [LICENSE](LICENSE).
