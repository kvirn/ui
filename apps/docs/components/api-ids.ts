const slug = (name: string) => name.toLowerCase().replaceAll(/[^a-z0-9]+/g, '-')

/** The one place an API anchor is made, so a use case's link and the API row can't drift. */
export const apiPartId = (part: string) => `api-${slug(part)}`
export const apiRowId = (part: string, prop: string) => `${apiPartId(part)}-${prop.toLowerCase()}`
/** The `part` of a hook's Options or Result table, for `apiRowId` and `PropUsed`. */
export const apiHookPart = (hook: string, table: 'options' | 'result') => `${hook}-${table}`
export const apiStringsId = 'api-strings'
