'use client'
import { useContext, useEffect, useMemo, useRef } from 'react'
import type { ReactElement } from 'react'
import type { KvirnMessages } from '@kvirn-ui/i18n'
import { useAnnouncer } from '../announcer/use-announcer.ts'
import { warnOnce } from '../dev/dev-warning.ts'
import { FieldGroupContext, FieldTextHostContext } from '../field/field-context.ts'
import type { FieldErrorMessageProps, FieldHelpTextProps } from '../field/field.tsx'
import {
  FieldsetErrorMessage,
  FieldsetHelpText,
  FieldsetLegend,
  FieldsetProse,
  FieldsetRoot,
} from '../fieldset/fieldset.tsx'
import type { FieldsetLegendProps, FieldsetRootProps } from '../fieldset/fieldset.tsx'
import { useMergedRef } from '../merge-props/use-merged-ref.ts'
import { mergeProps } from '../merge-props/merge-props.ts'
import type { ProseRootProps } from '../prose/prose.tsx'
import { useMessages } from '../provider/use-messages.ts'
import { renderPart } from '../render/render-part.ts'
import type { AsTag } from '../render/as-prop.ts'
import { resolveAsTag } from '../render/as-prop.ts'
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
    () => ({
      getRadioProps: group.getRadioProps,
      getRevealProps: group.getRevealProps,
      registerReveal: group.registerReveal,
      consumeUserChoice: group.consumeUserChoice,
      resetSelection: group.resetSelection,
    }),
    [
      group.getRadioProps,
      group.getRevealProps,
      group.registerReveal,
      group.consumeUserChoice,
      group.resetSelection,
    ],
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

const revealTags = ['div', 'section'] as const

export type RadioGroupRevealProps = AsTag<
  (typeof revealTags)[number],
  'div',
  {
    /** The `value` of the radio this content belongs to. */
    value: string
    /** Overrides the built-in text for this instance. */
    messages?: Partial<KvirnMessages['radioGroup']> | undefined
  }
>

/**
 * The content that belongs to one radio, such as an "Other, please specify" field: it follows
 * that radio's `Field.Root` in the DOM, is `hidden` until the radio is checked and is never
 * unmounted, so what the user typed survives switching options (and is still submitted by a
 * plain form: ignore or clear it on the server). Focus stays on the radio. The radio gets
 * `aria-controls`, and a field appearing is announced politely (contract: radio-group.a11y.md).
 *
 * @example
 * <RadioGroup.Reveal value="other">
 *   <Field.Root>
 *     <Field.Label>Please specify</Field.Label>
 *     <TextInput />
 *   </Field.Root>
 * </RadioGroup.Reveal>
 */
export function RadioGroupReveal({
  value,
  messages,
  as,
  ref,
  children,
  ...otherProps
}: RadioGroupRevealProps): ReactElement {
  const group = useContext(RadioGroupContext)
  const revealMessages = useMessages('radioGroup', messages)
  const { announce } = useAnnouncer()
  const elementRef = useRef<HTMLElement | null>(null)
  const mergedRef = useMergedRef(ref, elementRef)
  const registerReveal = group?.registerReveal
  const consumeUserChoice = group?.consumeUserChoice
  const resetSelection = group?.resetSelection
  const revealProps = group?.getRevealProps(value)
  const isOpen = revealProps !== undefined && revealProps.hidden === undefined

  useEffect(() => registerReveal?.(value), [registerReveal, value])

  const inGroup = group !== null
  useEffect(() => {
    if (!inGroup) {
      warnOnce(
        'radio-group-reveal-outside-group',
        'A RadioGroup.Reveal is outside a RadioGroup.Root, so it has no radio to follow and is always shown. Put it inside the group, right after its radio.',
      )
    }
  }, [inGroup])

  const wasOpen = useRef(isOpen)
  useEffect(() => {
    const justOpened = isOpen && !wasOpen.current
    wasOpen.current = isOpen
    if (justOpened && consumeUserChoice?.(value) === true) {
      announce(revealMessages.revealShown)
    }
  }, [isOpen, consumeUserChoice, value, announce, revealMessages.revealShown])

  useEffect(() => {
    const form = elementRef.current?.closest('form')
    if (form == null || resetSelection === undefined) {
      return undefined
    }
    form.addEventListener('reset', resetSelection)
    return () => {
      form.removeEventListener('reset', resetSelection)
    }
  }, [resetSelection])

  return renderPart({
    as: resolveAsTag({ part: 'RadioGroup.Reveal', as, allowedTags: revealTags }),
    defaultElement: 'div',
    // Its fields are the page's own fields, not options of the group: they keep their optional
    // marker and required state, and their text is not part of the group's description.
    partProps: {
      ...mergeProps(otherProps, revealProps ?? {}),
      children: (
        <FieldGroupContext.Provider value={false}>
          <FieldTextHostContext.Provider value={null}>{children}</FieldTextHostContext.Provider>
        </FieldGroupContext.Provider>
      ),
      ref: mergedRef,
    },
  })
}
RadioGroupReveal.displayName = 'RadioGroup.Reveal'

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
  Reveal: RadioGroupReveal,
  Legend: RadioGroupLegend,
  Prose: RadioGroupProse,
  HelpText: RadioGroupHelpText,
  ErrorMessage: RadioGroupErrorMessage,
} as const
