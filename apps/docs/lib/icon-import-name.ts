export const iconCamelName = (name: string) =>
  name.replace(/-([a-z0-9])/g, (_match, character: string) => character.toUpperCase())

/** The component an icon is exported as from `@kvirn/icons/react`: PascalCase and `Icon`, as the generator names it. */
export const iconComponentName = (name: string) =>
  `${name.replace(/(?:^|-)([a-z0-9])/g, (_match, character: string) => character.toUpperCase())}Icon`
