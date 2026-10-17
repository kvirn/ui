const reservedWords: Readonly<Record<string, string>> = { delete: 'deleteIcon', new: 'newIcon' }

export const iconCamelName = (name: string) =>
  name.replace(/-([a-z0-9])/g, (_match, character: string) => character.toUpperCase())

/** The name an icon is exported under from `@kvirn-ui/icons`: camelCase, and `Icon` after a reserved word. */
export function iconImportName(name: string) {
  const camelCase = iconCamelName(name)
  return reservedWords[camelCase] ?? camelCase
}
