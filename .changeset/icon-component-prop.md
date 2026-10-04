---
'@kvirn-ui/react': minor
'@kvirn-ui/theme': minor
---

Add `icon` to `Icon` (Plan 0044): `<Icon icon={Search} />` draws a Lucide, Heroicons or other icon component with no registration. Icon's `size`, `color`, `strokeWidth` and `label` replace the component's own, and `className` is joined with it. `icon` takes an `IconComponent`.

`name`, `icon`, `render` and `children` are now mutually exclusive in `IconProps`, which includes `render` with `children` (the types allowed it before), and two together warn once in development. `icon.md` is rewritten around the three routes: `icon`, `name` with the registry, and `render`.

**Breaking in 0.x: the size scale.** The `sm`, `md` and `lg` steps are gone, and `size` is a step of Tailwind's `size-*` scale (`IconScale`): `<Icon size={4} />`, `size={0.5}`, `size={32}`. A step is `step × 0.25em`, so an icon still follows the text size: `4` is 1em (the old `sm`), `5` is 1.25em (the old `md`, and the default) and `6` is 1.5em (the old `lg`). A string is a CSS length (`'48px'`, `'2rem'`, `'1.5em'`). A bare number is now a step and no longer pixels: `size={48}` was 48px and is now 12em, so write `size="48px"` instead. `iconDefaults.size` takes the same type, `IconSizeStep` is replaced by `IconScale`, and `data-size` is the step (`data-size="4"`), so the theme's vertical alignment rules are `[data-size='4']`, `'5'` and `'6'`. Migration: `size="sm"` to `size={4}`, `"md"` to `{5}`, `"lg"` to `{6}`, and a pixel number to a length string.
