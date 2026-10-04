'use client'
import { useMemo } from 'react'
import type { ReactElement } from 'react'
import { useMergedRef } from '../merge-props/use-merged-ref.ts'
import type { FieldErrorMessageProps, FieldHintProps } from '../field/field.tsx'
import {
  FieldsetErrorMessage,
  FieldsetHint,
  FieldsetLegend,
  FieldsetProse,
  FieldsetRoot,
} from '../fieldset/fieldset.tsx'
import type { FieldsetLegendProps, FieldsetRootProps } from '../fieldset/fieldset.tsx'
import type { ProseRootProps } from '../prose/prose.tsx'
import { CheckboxGroupContext } from './checkbox-group-context.ts'
import type { CheckboxGroupContextValue } from './checkbox-group-context.ts'
import { useCheckboxGroup } from './use-checkbox-group.ts'
import type { CheckboxGroupChangeDetails } from './use-checkbox-group.ts'

export type { CheckboxGroupChangeDetails } from './use-checkbox-group.ts'

export interface CheckboxGroupRootProps extends Omit<FieldsetRootProps, 'group'> {
  /** The `name` every checkbox in the group submits under. A checkbox's own `name` wins. */
  name?: string | undefined
  /** Controlled: the values of the checked boxes, from your form logic. */
  value?: readonly string[] | undefined
  /** Uncontrolled: the values checked at the start. The browser keeps the state after that. */
  defaultValue?: readonly string[] | undefined
  /**
   * Called with the next values when a box changes: `value` with the box's value added or
   * removed, or, without `value`, the group's checked boxes. It only reports.
   */
  onValueChange?: ((value: string[], details: CheckboxGroupChangeDetails) => void) | undefined
}

/**
 * A group of checkboxes: the native `<fieldset>` of a `Fieldset.Root` with `group` set, so
 * `CheckboxGroup.Legend`, `CheckboxGroup.Prose` (the description), `CheckboxGroup.Hint` and
 * `CheckboxGroup.ErrorMessage` work inside it (contract: checkbox-group.a11y.md). It holds no
 * form state: pass `value` and `onValueChange`, or `defaultValue` and `name` for a plain form.
 * Give each `Checkbox` a `value`.
 *
 * @example
 * <CheckboxGroup.Root name="contact" value={contact} onValueChange={setContact}>
 *   <CheckboxGroup.Legend>Hur vill du bli kontaktad?</CheckboxGroup.Legend>
 *   <CheckboxGroup.Prose>
 *     <p>Välj alla som passar. Vi kontaktar dig bara om beslutet.</p>
 *   </CheckboxGroup.Prose>
 *   <Field.Root>
 *     <Checkbox value="email" />
 *     <Field.Label>E-post</Field.Label>
 *     <Field.Hint>Beslutet kommer inom en vecka.</Field.Hint>
 *   </Field.Root>
 *   <CheckboxGroup.Hint>Du kan ändra dig senare under Mina sidor.</CheckboxGroup.Hint>
 * </CheckboxGroup.Root>
 */
export function CheckboxGroupRoot({
  name,
  value,
  defaultValue,
  onValueChange,
  invalid,
  disabled,
  className,
  ref,
  ...fieldsetProps
}: CheckboxGroupRootProps): ReactElement {
  const group = useCheckboxGroup({ name, value, defaultValue, onValueChange, invalid, disabled })
  const mergedRef = useMergedRef(ref, group.groupRef)
  const context = useMemo<CheckboxGroupContextValue>(
    () => ({ getCheckboxProps: group.getCheckboxProps }),
    [group.getCheckboxProps],
  )

  return (
    <CheckboxGroupContext.Provider value={context}>
      <FieldsetRoot
        {...fieldsetProps}
        group
        invalid={invalid}
        disabled={disabled}
        className={className === undefined ? 'kv-checkbox-group' : `${className} kv-checkbox-group`}
        ref={mergedRef}
      />
    </CheckboxGroupContext.Provider>
  )
}
CheckboxGroupRoot.displayName = 'CheckboxGroup.Root'

/** The group's question and its accessible name: the `Fieldset.Legend` under the group's name. */
export function CheckboxGroupLegend(props: FieldsetLegendProps): ReactElement {
  return <FieldsetLegend {...props} />
}
CheckboxGroupLegend.displayName = 'CheckboxGroup.Legend'

/** The group's description: the `Fieldset.Prose` under the group's name. */
export function CheckboxGroupProse(props: ProseRootProps): ReactElement {
  return <FieldsetProse {...props} />
}
CheckboxGroupProse.displayName = 'CheckboxGroup.Prose'

/** The group's hint: the `Fieldset.Hint` under the group's name. */
export function CheckboxGroupHint(props: FieldHintProps): ReactElement {
  return <FieldsetHint {...props} />
}
CheckboxGroupHint.displayName = 'CheckboxGroup.Hint'

/** The group's error message: the `Fieldset.ErrorMessage` under the group's name. */
export function CheckboxGroupErrorMessage(props: FieldErrorMessageProps): ReactElement {
  return <FieldsetErrorMessage {...props} />
}
CheckboxGroupErrorMessage.displayName = 'CheckboxGroup.ErrorMessage'

/** A group of checkboxes under a legend, with a description, a hint and an error. */
export const CheckboxGroup = {
  Root: CheckboxGroupRoot,
  Legend: CheckboxGroupLegend,
  Prose: CheckboxGroupProse,
  Hint: CheckboxGroupHint,
  ErrorMessage: CheckboxGroupErrorMessage,
} as const
