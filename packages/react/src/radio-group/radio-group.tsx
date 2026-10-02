'use client'
import { useMemo } from 'react'
import type { ReactElement } from 'react'
import { FieldsetRoot } from '../fieldset/fieldset.tsx'
import type { FieldsetRootProps } from '../fieldset/fieldset.tsx'
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
  /** Called with the value of the radio the user chose. It only reports (ADR-0029, item 0). */
  onValueChange?: ((value: string, details: RadioGroupChangeDetails) => void) | undefined
}

/**
 * A group of radios: the native `<fieldset>` of a `Fieldset.Root` with `group` set, so
 * `Fieldset.Legend`, `Fieldset.Description` and `Fieldset.ErrorMessage` work inside it
 * (ADR-0029, contract: radio-group.a11y.md). Radios that share a `name` are one Tab stop, and
 * the browser's arrow keys move and check, mirrored in right-to-left. It holds no form state:
 * pass `value` and `onValueChange`, or `defaultValue` and `name` for a plain form.
 *
 * @example
 * <RadioGroup.Root name="language" value={language} onValueChange={setLanguage} required>
 *   <Fieldset.Legend>Vilket språk vill du använda?</Fieldset.Legend>
 *   <Field.Root>
 *     <Radio value="sv" />
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

/** A group of radios under a legend, with a hint and an error (ADR-0029). */
export const RadioGroup = {
  Root: RadioGroupRoot,
} as const
