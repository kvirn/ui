/** Whether a field's optional text shows in its label: `optional` shows it, `none` never does. */
export type FieldMarker = 'optional' | 'none'

/** State that any part of a field or fieldset exposes as `data-*` attributes. */
export interface FieldStateAttributes {
  'data-invalid'?: ''
  'data-required'?: ''
  'data-disabled'?: ''
}

/** What `render` receives as its second argument, for every Field and Fieldset part. */
export interface FieldState {
  isInvalid: boolean
  isRequired: boolean
  isDisabled: boolean
}

/** Internal. The `data-*` attributes for the states that are on. */
export function stateAttributes(
  { isInvalid, isRequired, isDisabled }: FieldState,
  only: readonly (keyof FieldStateAttributes)[] = [
    'data-invalid',
    'data-required',
    'data-disabled',
  ],
): FieldStateAttributes {
  const attributes: FieldStateAttributes = {}
  if (isInvalid && only.includes('data-invalid')) attributes['data-invalid'] = ''
  if (isRequired && only.includes('data-required')) attributes['data-required'] = ''
  if (isDisabled && only.includes('data-disabled')) attributes['data-disabled'] = ''
  return attributes
}

/** Internal. Space-separated ids without the empty ones, or `undefined` when none are left. */
export function joinIds(...ids: readonly (string | undefined)[]): string | undefined {
  const present = ids.filter((id): id is string => id !== undefined && id.trim() !== '')
  return present.length === 0 ? undefined : present.join(' ')
}
