'use client'

// Public API. The whole entry is client code (ADR-0010). `useStoreSelector`, `useMessages`,
// `useEnv` and `useLinkComponent` are internal by design (ADR-0003, Plan 0002).
export { KvirnProvider } from './provider/kvirn-provider.tsx'
export type { KvirnProviderProps } from './provider/kvirn-provider.tsx'
export { KvirnThemeScript } from './provider/kvirn-theme-script.tsx'
export type { KvirnThemeScriptProps } from './provider/kvirn-theme-script.tsx'
export { useLocale } from './provider/use-locale.ts'
export type { LocaleProps, UseLocaleResult } from './provider/use-locale.ts'
export { useDateSettings } from './provider/use-date-settings.ts'
export type { UseDateSettingsResult } from './provider/use-date-settings.ts'
export { useTheme } from './provider/use-theme.ts'
export type { UseThemeResult } from './provider/use-theme.ts'
export type { Register, RegisteredLinkComponent } from './provider/register.ts'
export { useAnnouncer } from './announcer/use-announcer.ts'
export type { UseAnnouncerResult } from './announcer/use-announcer.ts'
export { mergeProps } from './merge-props/merge-props.ts'
export type { MergedProps } from './merge-props/merge-props.ts'
export type { RenderProp } from './render/render-part.ts'
export { Button } from './button/button.tsx'
export type { ButtonProps, ButtonState } from './button/button.tsx'
export { useButton } from './button/use-button.ts'
export type { ButtonPartProps, UseButtonOptions, UseButtonResult } from './button/use-button.ts'
export { Link, LinkNewTabNotice } from './link/link.tsx'
export type { LinkElementProps, LinkNewTabNoticeProps, LinkProps, LinkState } from './link/link.tsx'
export { useLink } from './link/use-link.ts'
export type { LinkCurrent, LinkPartProps, UseLinkOptions, UseLinkResult } from './link/use-link.ts'
export { Card, CardBody, CardFooter, CardHeader, CardRoot } from './card/card.tsx'
export type {
  CardBodyProps,
  CardElementProps,
  CardFooterProps,
  CardHeaderProps,
  CardRootProps,
  CardState,
} from './card/card.tsx'
export { useCard } from './card/use-card.ts'
export type { CardPartProps, UseCardResult } from './card/use-card.ts'
export { Panel, PanelRoot } from './panel/panel.tsx'
export type { PanelElementProps, PanelRootProps, PanelState } from './panel/panel.tsx'
export { usePanel } from './panel/use-panel.ts'
export type { PanelPartProps, UsePanelResult } from './panel/use-panel.ts'
export {
  Field,
  FieldDescription,
  FieldErrorMessage,
  FieldLabel,
  FieldRoot,
} from './field/field.tsx'
export type {
  FieldDescriptionProps,
  FieldErrorMessageProps,
  FieldLabelProps,
  FieldMarker,
  FieldRootProps,
  FieldState,
} from './field/field.tsx'
export { useField } from './field/use-field.ts'
export type {
  FieldControlPartProps,
  FieldDescriptionPartProps,
  FieldErrorMessagePartProps,
  FieldLabelPartProps,
  FieldRootPartProps,
  FieldStateAttributes,
  UseFieldOptions,
  UseFieldResult,
} from './field/use-field.ts'
export {
  Fieldset,
  FieldsetDescription,
  FieldsetErrorMessage,
  FieldsetLegend,
  FieldsetRoot,
} from './fieldset/fieldset.tsx'
export type { FieldsetLegendProps, FieldsetRootProps, FieldsetState } from './fieldset/fieldset.tsx'
export { useFieldset } from './fieldset/use-fieldset.ts'
export type {
  FieldsetLegendPartProps,
  FieldsetRootPartProps,
  UseFieldsetOptions,
  UseFieldsetResult,
} from './fieldset/use-fieldset.ts'
export { Input } from './input/input.tsx'
export type { InputChangeDetails, InputProps, InputState, InputType } from './input/input.tsx'
export { useInput } from './input/use-input.ts'
export type { InputPartProps, UseInputOptions, UseInputResult } from './input/use-input.ts'
export { useMask } from './mask/use-mask.ts'
export type { MaskInputPartProps, UseMaskOptions, UseMaskResult } from './mask/use-mask.ts'
export { Icon } from './icon/icon.tsx'
export type { IconElementProps, IconProps, IconState } from './icon/icon.tsx'
export { useIcon } from './icon/use-icon.ts'
export type {
  IconDefaults,
  IconPartProps,
  IconSize,
  IconSizeStep,
  UseIconOptions,
  UseIconResult,
} from './icon/use-icon.ts'
export { defineIcons } from './icon/icon-registry.ts'
export type {
  IconComponent,
  IconComponentProps,
  IconName,
  IconRegistry,
  IconRegistryEntry,
} from './icon/icon-registry.ts'
export type { BuiltInIconName } from './icon/built-in-icons.tsx'
export { checks, masks } from '@kvirn-ui/core'
export type {
  CheckResult,
  Mask,
  MaskAllowedCharacters,
  MaskAttributes,
  MaskRejection,
  MaskRejectionReason,
  MaskResult,
} from '@kvirn-ui/core'
export type {
  ColorSchemePreference,
  ContrastPreference,
  AnnounceOptions,
  AnnouncerPoliteness,
  Direction,
  Env,
  ResolvedColorScheme,
  ResolvedContrast,
  StoredThemePreference,
  ThemeOptions,
  ThemeStorage,
  ThemeStorageAdapter,
} from '@kvirn-ui/core'
export { InputGroup, InputGroupAddon, InputGroupRoot } from './input-group/input-group.tsx'
export type {
  InputGroupAddonProps,
  InputGroupRootProps,
  InputGroupState,
} from './input-group/input-group.tsx'
export { useInputGroup } from './input-group/use-input-group.ts'
export type {
  InputGroupAddonPartProps,
  InputGroupRootPartProps,
  UseInputGroupOptions,
  UseInputGroupResult,
} from './input-group/use-input-group.ts'
export {
  OneTimeCode,
  OneTimeCodeInput,
  OneTimeCodeRoot,
  OneTimeCodeSlot,
} from './one-time-code/one-time-code.tsx'
export type {
  OneTimeCodeInputProps,
  OneTimeCodeRootProps,
  OneTimeCodeSlotProps,
  OneTimeCodeState,
} from './one-time-code/one-time-code.tsx'
export { useOneTimeCode } from './one-time-code/use-one-time-code.ts'
export type {
  OneTimeCodeInputPartProps,
  OneTimeCodeRootPartProps,
  OneTimeCodeSlotPartProps,
  OneTimeCodeSlotState,
  UseOneTimeCodeOptions,
  UseOneTimeCodeResult,
} from './one-time-code/use-one-time-code.ts'
export { Checkbox } from './checkbox/checkbox.tsx'
export type {
  CheckboxChangeDetails,
  CheckboxDataState,
  CheckboxProps,
  CheckboxState,
} from './checkbox/checkbox.tsx'
export { useCheckbox } from './checkbox/use-checkbox.ts'
export type {
  CheckboxPartProps,
  UseCheckboxOptions,
  UseCheckboxResult,
} from './checkbox/use-checkbox.ts'
export { CheckboxGroup, CheckboxGroupRoot } from './checkbox-group/checkbox-group.tsx'
export type {
  CheckboxGroupChangeDetails,
  CheckboxGroupRootProps,
} from './checkbox-group/checkbox-group.tsx'
export { useCheckboxGroup } from './checkbox-group/use-checkbox-group.ts'
export type {
  CheckboxGroupItemProps,
  UseCheckboxGroupOptions,
  UseCheckboxGroupResult,
} from './checkbox-group/use-checkbox-group.ts'
export { RadioGroup, RadioGroupRoot } from './radio-group/radio-group.tsx'
export type { RadioGroupChangeDetails, RadioGroupRootProps } from './radio-group/radio-group.tsx'
export { Radio } from './radio-group/radio.tsx'
export type { RadioProps, RadioState } from './radio-group/radio.tsx'
export { useRadioGroup } from './radio-group/use-radio-group.ts'
export type {
  RadioGroupItemProps,
  UseRadioGroupOptions,
  UseRadioGroupResult,
} from './radio-group/use-radio-group.ts'
export { useRadio } from './radio-group/use-radio.ts'
export type { RadioPartProps, UseRadioOptions, UseRadioResult } from './radio-group/use-radio.ts'
export { NativeSelect } from './native-select/native-select.tsx'
export type {
  NativeSelectChangeDetails,
  NativeSelectProps,
  NativeSelectState,
} from './native-select/native-select.tsx'
export { useNativeSelect } from './native-select/use-native-select.ts'
export type {
  NativeSelectPartProps,
  UseNativeSelectOptions,
  UseNativeSelectResult,
} from './native-select/use-native-select.ts'
