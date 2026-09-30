/**
 * Flattens a catalog into `key path → kind` so catalogs can be compared.
 * Functions are recorded with their parameter count, so a parameterised key
 * cannot silently lose or gain parameters in one locale.
 */
export function describeCatalog(catalog: object, prefix = ''): Map<string, string> {
  const shape = new Map<string, string>()
  for (const [key, value] of Object.entries(catalog)) {
    const path = prefix === '' ? key : `${prefix}.${key}`
    if (typeof value === 'function') {
      shape.set(path, `function(${value.length})`)
    } else if (typeof value === 'object' && value !== null) {
      for (const [nestedPath, kind] of describeCatalog(value, path)) {
        shape.set(nestedPath, kind)
      }
    } else if (typeof value === 'string' && value.trim() === '') {
      shape.set(path, 'empty string')
    } else {
      shape.set(path, typeof value)
    }
  }
  return shape
}

/** Lists every difference between the reference catalog and another locale. */
export function compareCatalogs(
  referenceCode: string,
  reference: object,
  localeCode: string,
  catalog: object,
): string[] {
  const referenceShape = describeCatalog(reference)
  const catalogShape = describeCatalog(catalog)
  const problems: string[] = []

  for (const [path, kind] of referenceShape) {
    const localeKind = catalogShape.get(path)
    if (localeKind === undefined) {
      problems.push(`${localeCode}: missing "${path}"`)
    } else if (localeKind === 'empty string') {
      problems.push(`${localeCode}: "${path}" is empty`)
    } else if (localeKind !== kind) {
      problems.push(`${localeCode}: "${path}" is ${localeKind}, but ${referenceCode} has ${kind}`)
    }
  }
  for (const path of catalogShape.keys()) {
    if (!referenceShape.has(path)) {
      problems.push(`${localeCode}: unexpected "${path}" (not in ${referenceCode})`)
    }
  }
  return problems
}
