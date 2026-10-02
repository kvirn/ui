import { useComboboxMachine } from '../combobox/use-combobox.ts'
import type {
  ComboboxInputChangeDetails,
  UseComboboxCommonOptions,
  UseComboboxResult,
} from '../combobox/use-combobox.ts'

/**
 * Autocomplete's `value` is the text, not an option. It is controlled with `value`, uncontrolled
 * with `defaultValue`, and with `name` the input itself carries it in a plain `<form>`.
 */
export interface UseAutocompleteOptions<TItem> extends UseComboboxCommonOptions<TItem> {
  /** Controlled: the text. */
  value?: string | undefined
  /** Uncontrolled: the text to begin with. */
  defaultValue?: string | undefined
  /**
   * Called with the text when the user types, picks a suggestion (it fills the input) or clears.
   * It only reports (ADR-0029).
   */
  onValueChange?: ((value: string, details: ComboboxInputChangeDetails) => void) | undefined
  /** Put on the `<input>`, so a plain `<form>` sends the text. */
  name?: string | undefined
}

/** The same props and state as a Combobox. Its options are never "chosen": picking a suggestion fills the input. */
export type UseAutocompleteResult<TItem> = UseComboboxResult<TItem>

/**
 * The state and props of an Autocomplete (ADR-0037, item 5; contract: autocomplete.a11y.md): a
 * text field that suggests, whose value is the text, which may match nothing. It is the same
 * `role="combobox"` input and popup as a Combobox, with these differences:
 *
 * - **Picking a suggestion fills the input** and closes the popup. Nothing is "selected":
 *   no option is `aria-selected`, and the text is never turned into a key.
 * - **The popup opens for text** (and for ArrowDown), and closes when the text is empty.
 * - **Suggestions never block other text.** Enter with no active suggestion is the browser's own:
 *   a form can submit whatever was typed.
 *
 * Focus, keys, filtering and announcements are the Combobox's.
 *
 * @example
 * const street = useAutocomplete({ items: streets, value, onValueChange: setValue })
 * <input {...street.inputProps} />
 * <div {...street.popupProps}><div {...street.listProps}>…</div></div>
 */
export function useAutocomplete<TItem>(
  options: UseAutocompleteOptions<TItem>,
): UseAutocompleteResult<TItem> {
  return useComboboxMachine({
    ...options,
    variant: 'autocomplete',
    multiple: false,
    inputValue: options.value,
    defaultInputValue: options.defaultValue,
    onInputValueChange: options.onValueChange,
  })
}
