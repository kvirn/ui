import type { KvirnMessages, PartialMessages } from './types.ts'

type NamespaceName = keyof KvirnMessages

function mergeNamespace<Name extends NamespaceName>(
  target: KvirnMessages,
  base: KvirnMessages,
  overrides: PartialMessages,
  name: Name,
): void {
  target[name] = { ...base[name], ...overrides[name] }
}

/**
 * Builds an adjusted catalog once: `overrides` replace keys of `base`, one namespace at a
 * time, and everything else is kept (ADR-0007).
 *
 * @example defineMessages(sv, { link: { newTabNotice: '(öppnas i nytt fönster)' } })
 */
export function defineMessages(base: KvirnMessages, overrides: PartialMessages): KvirnMessages {
  const merged: KvirnMessages = { ...base }
  for (const name of Object.keys(overrides) as NamespaceName[]) {
    mergeNamespace(merged, base, overrides, name)
  }
  return merged
}
