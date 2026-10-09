---
'@kvirn-ui/core': minor
'@kvirn-ui/react': minor
'@kvirn-ui/theme': minor
---

Add a motion axis to the theme preference: `useTheme()` gains `motion`, `resolvedMotion` and `selectMotion`, `KvirnProvider theme` and `KvirnThemeScript` gain `defaultMotion`, and the resolved value is written to `<html data-kv-motion="full" | "reduce">`. `@kvirn-ui/theme` stops every transition and animation under `data-kv-motion="reduce"`, as it already does under `prefers-reduced-motion: reduce`, so a site can offer "less motion" as a setting.
