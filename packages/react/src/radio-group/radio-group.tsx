'use client'
import { useMemo } from 'react'
import type { ReactElement } from 'react'
import type { FieldErrorMessageProps, FieldHelpTextProps } from '../field/field.tsx'
import {
  FieldsetErrorMessage,
  FieldsetHelpText,
  FieldsetLegend,
  FieldsetProse,
  FieldsetRoot,
} from '../fieldset/fieldset.tsx'
import type { FieldsetLegendProps, FieldsetRootProps } from '../fieldset/fieldset.tsx'
import type { ProseRootProps } from '../prose/prose.tsx'
import { Radio } from './radio.tsx'
import type { RadioProps } from './radio.tsx'
import { RadioGroupContext } from './radio-group-context.ts'
import type { RadioGroupContextValue } from './radio-group-context.ts'
import { useRadioGroup } from './use-radio-group.ts'
import type { RadioGroupChangeDetails } from './use-radio-group.ts'

export type { RadioGroupChangeDetails } from './use-radio-group.ts'

export interface RadioGroupRootProps extends Omit<FieldsetRootProps, 'group'> {
  /** The `name` every radio shares, so the browser groups them. Default: generated. */
  name?: string | undefined
  /** Controlled: the value of the checked radio from your form logic. `null`: none checked. */
  value?: string | null | undefined
  /** Uncontrolled: the value checked at the start. The browser keeps the state after that. */
  defaultValue?: string | undefined
  /** Called with the value of the radio the user chose. It only reports. */
  onValueChange?: ((value: string, details: RadioGroupChangeDetails) => void) | undefined
}

/**
 * A group of radios: the native `<fieldset>` of a `Fieldset.Root` with `group` set, so
 * `RadioGroup.Legend`, `RadioGroup.Prose` (the description), `RadioGroup.HelpText` and
 * `RadioGroup.ErrorMessage` work inside it (contract: radio-group.a11y.md). Radios that share a
 * `name` are one Tab stop, and the browser's arrow keys move and check, mirrored in
 * right-to-left. It holds no form state: pass `value` and `onValueChange`, or `defaultValue` and
 * `name` for a plain form.
 *
 * @example
 * <RadioGroup.Root name="language" value={language} onValueChange={setLanguage} required>
 *   <RadioGroup.Legend>Vilket språk vill du använda?</RadioGroup.Legend>
 *   <Field.Root>
 *     <RadioGroup.Radio value="sv" />
 *     <Field.Label>Svenska</Field.Label>
 *   </Field.Root>
 * </RadioGroup.Root>
 */
export function RadioGroupRoot({
  name,
  value,
  defaultValue,
  onValueChange,
  invalid,
  disabled,
  className,
  ...fieldsetProps
}: RadioGroupRootProps): ReactElement {
  const group = useRadioGroup({ name, value, defaultValue, onValueChange, invalid, disabled })
  const context = useMemo<RadioGroupContextValue>(
    () => ({ getRadioProps: group.getRadioProps }),
    [group.getRadioProps],
  )

  return (
    <RadioGroupContext.Provider value={context}>
      <FieldsetRoot
        {...fieldsetProps}
        group
        invalid={invalid}
        disabled={disabled}
        className={className === undefined ? 'kv-radio-group' : `${className} kv-radio-group`}
      />
    </RadioGroupContext.Provider>
  )
}
RadioGroupRoot.displayName = 'RadioGroup.Root'

/**
 * One radio of the group: the shared `Radio` under the group's name. It only works inside a
 * `RadioGroup.Root`, which gives it its `name` and checked state.
 */
export function RadioGroupRadio(props: RadioProps): ReactElement {
  return <Radio {...props} />
}
RadioGroupRadio.displayName = 'RadioGroup.Radio'

/** The group's question and its accessible name: the `Fieldset.Legend` under the group's name. */
export function RadioGroupLegend(props: FieldsetLegendProps): ReactElement {
  return <FieldsetLegend {...props} />
}
RadioGroupLegend.displayName = 'RadioGroup.Legend'

/** The group's description: the `Fieldset.Prose` under the group's name. */
export function RadioGroupProse(props: ProseRootProps): ReactElement {
  return <FieldsetProse {...props} />
}
RadioGroupProse.displayName = 'RadioGroup.Prose'

/** The group's help text: the `Fieldset.HelpText` under the group's name. */
export function RadioGroupHelpText(props: FieldHelpTextProps): ReactElement {
  return <FieldsetHelpText {...props} />
}
RadioGroupHelpText.displayName = 'RadioGroup.HelpText'

/** The group's error message: the `Fieldset.ErrorMessage` under the group's name. */
export function RadioGroupErrorMessage(props: FieldErrorMessageProps): ReactElement {
  return <FieldsetErrorMessage {...props} />
}
RadioGroupErrorMessage.displayName = 'RadioGroup.ErrorMessage'

/** A group of radios under a legend, with a description, a help text and an error. */
export const RadioGroup = {
  Root: RadioGroupRoot,
  Radio: RadioGroupRadio,
  Legend: RadioGroupLegend,
  Prose: RadioGroupProse,
  HelpText: RadioGroupHelpText,
  ErrorMessage: RadioGroupErrorMessage,
} as const
