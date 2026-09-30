import {
  colorSchemeAttribute,
  colorSchemePreferences,
  colorSchemeQuery,
  contrastAttribute,
  contrastPreferences,
  contrastQuery,
  themeStorageKey,
} from './theme-constants.ts'
import { resolveThemeOptions } from './theme-store.ts'
import type { ThemeOptions } from './theme-store.ts'

export type ThemeScriptOptions = Pick<ThemeOptions, 'defaultColorScheme' | 'defaultContrast'>

/**
 * Source for the blocking inline script that sets the theme attributes on `<html>`
 * before first paint (ADR-0006). It mirrors the store's resolution for `storage: 'local'`;
 * a browser test runs both for every preference × system combination to keep them in sync.
 *
 * Defaults are validated first, since they can come from untyped config, and every embedded
 * value has `<` escaped, so the output can never close its `<script>` element.
 */
export function createThemeScriptSource(options: ThemeScriptOptions = {}): string {
  const resolvedOptions = resolveThemeOptions(options)
  const defaults = {
    colorScheme: resolvedOptions.defaultColorScheme,
    contrast: resolvedOptions.defaultContrast,
  }
  const embed = (value: unknown) => JSON.stringify(value).replaceAll('<', '\\u003c')

  return `(function () {
  var defaults = ${embed(defaults)};
  var stored = {};
  try {
    var serialized = window.localStorage.getItem(${embed(themeStorageKey)});
    if (serialized) {
      stored = JSON.parse(serialized) || {};
    }
  } catch (error) {}
  function pick(value, allowed, fallback) {
    return allowed.indexOf(value) === -1 ? fallback : value;
  }
  function isMatching(query) {
    try {
      return window.matchMedia(query).matches;
    } catch (error) {
      return false;
    }
  }
  var colorScheme = pick(stored.colorScheme, ${embed(colorSchemePreferences)}, defaults.colorScheme);
  var contrast = pick(stored.contrast, ${embed(contrastPreferences)}, defaults.contrast);
  if (colorScheme === "system") {
    colorScheme = isMatching(${embed(colorSchemeQuery)}) ? "dark" : "light";
  }
  if (contrast === "system") {
    contrast = isMatching(${embed(contrastQuery)}) ? "more" : "standard";
  }
  var root = document.documentElement;
  root.setAttribute(${embed(colorSchemeAttribute)}, colorScheme);
  root.setAttribute(${embed(contrastAttribute)}, contrast);
})();`
}
