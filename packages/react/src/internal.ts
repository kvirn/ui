'use client'

// `@kvirn-ui/react/internal`: for Kvirn packages only (Plan 0036). These are the pieces other
// KvirnUI packages, such as `@kvirn-ui/rich-text`, need and the public API deliberately doesn't
// offer: message resolution, the Field's wiring, focus modality and the shared announcer.
//
// It is unstable. A minor release may change or remove anything here, and it is not documented
// as API. The public entry (`index.ts`) never re-exports it: `internal.test.tsx` proves that.
export { useMessages } from './provider/use-messages.ts'
export {
  isKeyboardFocus,
  trackModality,
  useFocusVisible,
} from './focus-visible/use-focus-visible.ts'
export type { FocusVisibleProps, UseFocusVisibleResult } from './focus-visible/use-focus-visible.ts'
export { useQuietAnnouncer, warnAnnouncerMissing } from './announcer/use-announcer.ts'
export {
  useAddressLookup,
  useAddressLookupEngine,
  useAddressLookupField,
} from './address-lookup/use-address-lookup.ts'
export type {
  AddressLookupEngine,
  AddressLookupMessages,
  AddressLookupPickOutcome,
  AddressLookupState,
  AddressLookupStatusPartProps,
  AddressLookupSubmitPartProps,
  UseAddressLookupOptions,
  UseAddressLookupResult,
} from './address-lookup/use-address-lookup.ts'
export { ComboboxProviders } from './combobox/combobox.tsx'
export { FieldContext } from './field/field-context.ts'
export type { FieldContextValue } from './field/field-context.ts'
export { joinIds } from './field/field-state.ts'
export { useDescriptionPart } from './field/use-description-part.ts'
export { warnOnce } from './dev/dev-warning.ts'
export { renderPart } from './render/render-part.ts'
export { useMergedRef } from './merge-props/use-merged-ref.ts'
export { resolveAsTag } from './render/as-prop.ts'
export type { AsTag } from './render/as-prop.ts'
export { useEnv } from './provider/use-env.ts'
export { resetDevWarnings } from './dev/dev-warning.ts'
