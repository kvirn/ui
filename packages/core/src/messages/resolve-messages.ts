import type { MessageFormatter } from './create-message-format.ts'

/**
 * A namespace after resolution: text keys are strings, and parameterised keys are
 * functions of their values only, with the locale's format helper already bound.
 */
export type ResolvedMessages<Namespace> = {
  readonly [Key in keyof Namespace]: Namespace[Key] extends string | (() => string)
    ? string
    : Namespace[Key] extends (values: infer Values, ...rest: never[]) => string
      ? (values: Values) => string
      : never
}

export interface MessageResolutionIssue {
  /**
   * `empty-override`: a layer gave an empty or whitespace-only string, so resolution fell
   * through to the next layer. `fallback`: no layer had the key, so the fallback was used.
   */
  type: 'empty-override' | 'fallback'
  namespace: string
  key: string
}

export interface ResolveMessageNamespaceOptions<Namespace extends object> {
  /** Used in issue reports only. */
  namespace: string
  /** The complete built-in namespace (`en`). It decides which keys exist and their kind. */
  fallback: Namespace
  /** Partial layers, first match wins: instance messages, nearest provider, …, root provider. */
  overrides: readonly (Partial<Namespace> | undefined)[]
  format: MessageFormatter
  reportIssue?: ((issue: MessageResolutionIssue) => void) | undefined
}

type MessageFunction = (values?: unknown, format?: MessageFormatter) => unknown

function isMessageFunction(value: unknown): value is MessageFunction {
  return typeof value === 'function'
}

function toText(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() !== '' ? value : undefined
}

function readValue(layer: object | undefined, key: string): unknown {
  return layer === undefined ? undefined : Reflect.get(layer, key)
}

/**
 * Resolves one namespace through ordered layers without pre-merging them, so an empty
 * override falls through to the next layer and an accessible name is never empty
 *. Pure: problems are reported through `reportIssue`, never logged here.
 */
export function resolveMessageNamespace<Namespace extends object>({
  namespace,
  fallback,
  overrides,
  format,
  reportIssue,
}: ResolveMessageNamespaceOptions<Namespace>): ResolvedMessages<Namespace> {
  const report = (type: MessageResolutionIssue['type'], key: string) => {
    reportIssue?.({ type, namespace, key })
  }
  const resolved: Record<string, unknown> = {}

  for (const [key, fallbackValue] of Object.entries(fallback)) {
    if (isMessageFunction(fallbackValue)) {
      resolved[key] = (values: unknown) => {
        for (const layer of overrides) {
          const candidate = readValue(layer, key)
          if (isMessageFunction(candidate)) {
            const text = toText(candidate(values, format))
            if (text !== undefined) {
              return text
            }
            report('empty-override', key)
          }
        }
        report('fallback', key)
        return String(fallbackValue(values, format))
      }
      continue
    }

    let text: string | undefined
    for (const layer of overrides) {
      const candidate = readValue(layer, key)
      if (candidate === undefined) {
        continue
      }
      text = toText(isMessageFunction(candidate) ? candidate() : candidate)
      if (text !== undefined) {
        break
      }
      report('empty-override', key)
    }
    if (text === undefined) {
      report('fallback', key)
      text = String(fallbackValue)
    }
    resolved[key] = text
  }

  return resolved as ResolvedMessages<Namespace>
}
