/** A header, cell or footer template: text, or a function that gets the context (ADR-0059). */
export type Template<Context extends object, Result> = string | ((context: Context) => Result)

/**
 * Renders what a column definition holds for `header`, `cell` or `footer`: a string is returned
 * as it is, and a function is called with the context (`header.getContext()` or
 * `cell.getContext()`). A missing template gives `null`. This stands in for TanStack's
 * `flexRender`, so no framework helper is needed: the React binding passes `ReactNode` as
 * `Result`.
 */
export function renderTemplate<Context extends object, Result>(
  template: Template<Context, Result> | null | undefined,
  context: Context,
): Result | string | null {
  if (template === undefined || template === null) {
    return null
  }
  return typeof template === 'function' ? template(context) : template
}
