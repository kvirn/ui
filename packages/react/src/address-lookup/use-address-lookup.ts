import { announcementDebounceMilliseconds } from '@kvirn-ui/core'
import type {
  ResolvedMessages,
  AddressResult,
  AddressSuggestion,
  GeocoderIntent,
  GeocoderProvider,
} from '@kvirn-ui/core'
import type { KvirnMessages } from '@kvirn-ui/i18n'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { useQuietAnnouncer, warnAnnouncerMissing } from '../announcer/use-announcer.ts'
import { useAutocomplete } from '../autocomplete/use-autocomplete.ts'
import type { UseAutocompleteResult } from '../autocomplete/use-autocomplete.ts'
import type { ComboboxInputPartProps } from '../combobox/use-combobox.ts'
import { warnOnce } from '../dev/dev-warning.ts'
import { useLocale } from '../provider/use-locale.ts'
import { useMessages } from '../provider/use-messages.ts'

const DEFAULT_MIN_LENGTH = 3
export const DEFAULT_DEBOUNCE_MILLISECONDS = 400
export const DEFAULT_TIMEOUT_MILLISECONDS = 10_000

export type AddressLookupState =
  | 'idle'
  | 'too-short'
  | 'searching'
  | 'results'
  | 'empty'
  | 'error'
  | 'offline'
  | 'selected'
  | 'rejected'

export interface UseAddressLookupOptions {
  /** Where the text goes. Nothing is sent before the visitor types and, on request, presses Search. */
  geocoder: GeocoderProvider
  /** The pick, with a position, or `null` when the text is cleared or emptied. It never moves focus (3.2.2). */
  onResult?: ((result: AddressResult | null) => void) | undefined
  /** The fewest characters, trimmed, before a search is sent. Default 3. */
  minLength?: number | undefined
  /**
   * Milliseconds of no typing before a search is sent as you type, default 400. `false`, or a
   * geocoder without `suggest: true`, searches on request: Enter or the Search button.
   */
  debounce?: number | false | undefined
  /** How long to wait for an answer before the search counts as failed, in milliseconds. Default 10 000. */
  timeoutMilliseconds?: number | undefined
  /** ISO 3166-1 alpha-2: sent as the geocoder's `country` option, which ranks that country first. */
  country?: string | undefined
  /** With `country`: drops the results that are in another country, since the form can't record one. */
  limitToCountry?: boolean | undefined
  /**
   * Decides what a pick means before `onResult` runs: `{ rejected }` keeps the list open and says
   * that text instead of choosing (a place with no postal address), `{ announcement }` replaces
   * the `picked` message.
   */
  describePick?:
    | ((result: AddressResult, messages: AddressLookupMessages) => AddressLookupPickOutcome)
    | undefined
  disabled?: boolean | undefined
  /** The text the input starts with, for a field that already holds a value. */
  initialText?: string | undefined
  /** The input's id, outside a Field. Inside one, the Field's control id is used. */
  id?: string | undefined
  /** Per-instance message overrides. */
  messages?: Partial<KvirnMessages['addressSearch']> | undefined
}

/** The `addressSearch` messages, resolved: what the lookup says. */
export type AddressLookupMessages = ResolvedMessages<KvirnMessages['addressSearch']>

export type AddressLookupPickOutcome = { announcement: string } | { rejected: string }

export interface AddressLookupSubmitPartProps {
  className: string
  type: 'button'
  disabled?: true
  onClick: () => void
}

export interface AddressLookupStatusPartProps {
  className: string
  'data-state': AddressLookupState
}

export interface UseAddressLookupResult extends UseAutocompleteResult<AddressSuggestion> {
  status: AddressLookupState
  /** The latest answer. Earlier results stay listed while the next search runs. */
  results: readonly AddressSuggestion[]
  /** True when only Enter or Search sends a search. */
  isOnRequest: boolean
  /** Searches now, as Enter and the Search button do. */
  search: () => void
  /** Spread on the Search button, shown only while `isOnRequest`. */
  submitProps: AddressLookupSubmitPartProps
  /** Spread on the status line in the popup. It has no text for `idle`, `results` and `selected`. */
  statusProps: AddressLookupStatusPartProps
  statusText: string | undefined
  labelText: string
  helpText: string
  noticeText: string
  attribution: string | undefined
  submitText: string
}

const noResults: readonly AddressSuggestion[] = []
const segmenter = new Intl.Segmenter()

const graphemeCount = (text: string) => [...segmenter.segment(text)].length

/** Internal. The search itself, apart from the field, so the Root can read the status outside the Field. */
export function useAddressLookupEngine({
  geocoder,
  onResult,
  minLength = DEFAULT_MIN_LENGTH,
  debounce = DEFAULT_DEBOUNCE_MILLISECONDS,
  timeoutMilliseconds = DEFAULT_TIMEOUT_MILLISECONDS,
  country,
  limitToCountry = false,
  describePick,
  initialText = '',
  disabled = false,
  id,
  messages: messageOverrides,
  narrowing,
}: UseAddressLookupOptions & {
  /** Read when a search is sent: the town and postal code the geocoder narrows to. Empty is not sent. */
  narrowing?: (() => { city: string; postalCode: string }) | undefined
}) {
  const messages = useMessages('addressSearch', messageOverrides)
  const { locale } = useLocale()
  const { announce, isAvailable } = useQuietAnnouncer()
  const isOnRequest = debounce === false || geocoder.suggest !== true

  const [text, setText] = useState(initialText)
  // A value written by autofill or the form fill is text, not typing: it searches nothing.
  const programmaticValue = useRef<string | undefined>(undefined)
  // The text before a pick replaced it with the label, restored when the pick is rejected.
  const typedText = useRef(initialText)
  const [results, setResults] = useState<readonly AddressSuggestion[]>(noResults)
  const [status, setStatus] = useState<AddressLookupState>('idle')
  const [isOpen, setOpen] = useState(false)
  const [answeredQuery, setAnsweredQuery] = useState('')
  const [rejection, setRejection] = useState('')

  const latest = useRef({
    geocoder,
    onResult,
    minLength,
    debounce,
    timeoutMilliseconds,
    messages,
    locale,
    isOnRequest,
    country,
    limitToCountry,
    describePick,
    narrowing,
  })
  const controllerRef = useRef<AbortController | undefined>(undefined)
  const debounceTimer = useRef<number | undefined>(undefined)
  const announceTimer = useRef<number | undefined>(undefined)
  const pendingPick = useRef<AddressSuggestion | undefined>(undefined)
  const notePick = (item: AddressSuggestion | undefined) => {
    pendingPick.current = item
  }
  // The text whose search is not announced because a structured answer says its own, single message.
  const silencedQuery = useRef<string | undefined>(undefined)
  const hasResult = useRef(false)
  // The popup stays open while a pick is resolved or rejected, so its status line shows and the wait is not silent.
  const isResolving = useRef(false)
  const say = useRef<(message: string) => void>(() => {})
  useLayoutEffect(() => {
    latest.current = {
      geocoder,
      onResult,
      minLength,
      debounce,
      timeoutMilliseconds,
      messages,
      locale,
      isOnRequest,
      country,
      limitToCountry,
      describePick,
      narrowing,
    }
    say.current = (message) => {
      if (isAvailable) {
        announce(message)
      } else {
        warnAnnouncerMissing()
      }
    }
  })

  const announceLater = (message: string) => {
    window.clearTimeout(announceTimer.current)
    announceTimer.current = window.setTimeout(
      () => say.current(message),
      announcementDebounceMilliseconds,
    )
  }
  const announceNow = (message: string) => {
    window.clearTimeout(announceTimer.current)
    say.current(message)
  }
  const cancelRequest = () => {
    window.clearTimeout(debounceTimer.current)
    controllerRef.current?.abort()
    controllerRef.current = undefined
    isResolving.current = false
  }
  useEffect(
    () => () => {
      window.clearTimeout(debounceTimer.current)
      window.clearTimeout(announceTimer.current)
      controllerRef.current?.abort()
    },
    [],
  )

  /** A request that another one replaces is ignored; the one still current ends with a timeout or a failure. */
  const startRequest = (
    perform: (signal: AbortSignal) => Promise<void>,
    fail: () => void,
  ): void => {
    cancelRequest()
    const controller = new AbortController()
    controllerRef.current = controller
    let hasTimedOut = false
    const timer = window.setTimeout(() => {
      hasTimedOut = true
      controller.abort()
    }, latest.current.timeoutMilliseconds)
    new Promise<void>((resolve) => resolve(perform(controller.signal))).then(
      () => {
        window.clearTimeout(timer)
        if (hasTimedOut && controllerRef.current === controller) {
          fail()
        }
      },
      () => {
        window.clearTimeout(timer)
        if (controllerRef.current === controller && (hasTimedOut || !controller.signal.aborted)) {
          fail()
        }
      },
    )
  }

  const isOffline = () => typeof navigator !== 'undefined' && navigator.onLine === false

  const showFailure = () => {
    const failure = isOffline() ? 'offline' : 'error'
    isResolving.current = false
    setResults(noResults)
    setStatus(failure)
    setOpen(true)
    announceLater(latest.current.messages[failure])
  }

  const run = (query: string, intent: GeocoderIntent) => {
    cancelRequest()
    if (isOffline()) {
      setResults(noResults)
      setStatus('offline')
      setOpen(true)
      announceLater(latest.current.messages.offline)
      return
    }
    setStatus('searching')
    setOpen(true)
    if (silencedQuery.current !== query) {
      announceLater(latest.current.messages.searching)
    }
    const current = latest.current
    const { city = '', postalCode = '' } = current.narrowing?.() ?? {}
    startRequest(async (signal) => {
      const answer = await current.geocoder.search(query, {
        signal,
        locale: current.locale,
        intent,
        ...(current.country === undefined ? {} : { country: current.country }),
        ...(city === '' ? {} : { city }),
        ...(postalCode === '' ? {} : { postalCode }),
      })
      if (signal.aborted || controllerRef.current?.signal !== signal) {
        return
      }
      const list =
        current.limitToCountry && current.country !== undefined
          ? answer.filter(
              (candidate) =>
                candidate.address === undefined || candidate.address.country === current.country,
            )
          : answer
      setResults(list)
      setAnsweredQuery(query)
      setStatus(list.length > 0 ? 'results' : 'empty')
      setOpen(true)
      if (silencedQuery.current !== query) {
        announceLater(
          list.length > 0
            ? current.messages.resultCount({ count: list.length })
            : current.messages.noResults({ query }),
        )
      }
    }, showFailure)
  }

  const finishPick = (result: AddressResult) => {
    isResolving.current = false
    const outcome = latest.current.describePick?.(result, latest.current.messages)
    if (outcome !== undefined && 'rejected' in outcome) {
      isResolving.current = true
      setRejection(outcome.rejected)
      setText(typedText.current)
      setStatus('rejected')
      setOpen(true)
      announceNow(outcome.rejected)
      return
    }
    hasResult.current = true
    setStatus('selected')
    setOpen(false)
    latest.current.onResult?.(result)
    announceNow(outcome?.announcement ?? latest.current.messages.picked({ label: result.label }))
  }

  const pick = (item: AddressSuggestion) => {
    cancelRequest()
    if (item.position !== undefined) {
      setOpen(false)
      finishPick({ ...item, position: item.position })
      return
    }
    const current = latest.current
    if (current.geocoder.resolve === undefined) {
      warnOnce(
        'address-search-unresolved',
        'The geocoder returned a result without a position and has no resolve(). Give each result a position, or add resolve() to the geocoder.',
      )
      setOpen(false)
      showFailure()
      return
    }
    const { resolve } = current.geocoder
    setStatus('searching')
    setOpen(true)
    announceLater(current.messages.searching)
    startRequest(async (signal) => {
      const resolved = await resolve(item, { signal, locale: current.locale })
      if (signal.aborted || controllerRef.current?.signal !== signal) {
        return
      }
      finishPick(resolved)
    }, showFailure)
    isResolving.current = true
  }

  const reset = () => {
    cancelRequest()
    window.clearTimeout(announceTimer.current)
    setResults(noResults)
    setStatus('idle')
    setOpen(false)
    if (hasResult.current) {
      hasResult.current = false
      latest.current.onResult?.(null)
    }
  }

  const handleValueChange = (value: string, reason: 'input' | 'selection' | 'clear') => {
    if (reason !== 'selection') {
      typedText.current = value
    }
    setText(value)
    const isProgrammatic = programmaticValue.current === value
    programmaticValue.current = undefined
    silencedQuery.current = undefined
    if (reason === 'input' && isProgrammatic) {
      return
    }
    if (reason === 'selection') {
      const picked = pendingPick.current
      pendingPick.current = undefined
      const item = picked ?? results.find((candidate) => candidate.label === value)
      if (item !== undefined) {
        pick(item)
      }
      return
    }
    const trimmed = value.trim()
    if (reason === 'clear' || trimmed === '') {
      reset()
      return
    }
    cancelRequest()
    window.clearTimeout(announceTimer.current)
    const current = latest.current
    if (status === 'searching' && results.length > 0) {
      setStatus('results')
    } else if (status !== 'results') {
      setStatus('idle')
      setOpen(false)
    }
    if (current.isOnRequest) {
      return
    }
    if (graphemeCount(trimmed) < current.minLength) {
      setResults(noResults)
      setStatus('idle')
      setOpen(false)
      return
    }
    debounceTimer.current = window.setTimeout(
      () => run(trimmed, 'suggest'),
      current.debounce === false ? 0 : current.debounce,
    )
  }

  const search = () => {
    const current = latest.current
    window.clearTimeout(debounceTimer.current)
    const trimmed = text.trim()
    if (graphemeCount(trimmed) < current.minLength) {
      if (!current.isOnRequest) {
        return
      }
      cancelRequest()
      setStatus('too-short')
      setOpen(true)
      announceLater(current.messages.tooShort({ min: current.minLength }))
      return
    }
    if (answeredQuery === trimmed && (status === 'results' || status === 'empty')) {
      setOpen(true)
      announceLater(
        status === 'results'
          ? current.messages.resultCount({ count: results.length })
          : current.messages.noResults({ query: trimmed }),
      )
      return
    }
    run(trimmed, 'submit')
  }

  const handleOpenChange = (next: boolean, reason: string) => {
    if (!next) {
      if (isResolving.current && (reason === 'key' || reason === 'option-press')) {
        return
      }
      setOpen(false)
    } else if (reason !== 'input' && (results.length > 0 || status !== 'idle')) {
      setOpen(true)
    }
  }

  return {
    messages,
    status,
    results,
    text,
    isOpen,
    isOnRequest,
    answeredQuery,
    rejection,
    disabled,
    id,
    geocoder,
    minLength,
    notePick,
    markProgrammatic: (value: string) => {
      programmaticValue.current = value
    },
    syncText: setText,
    /** Says one message for the text instead of its search's own, which stays silent. */
    announceInstead: (message: string, query: string) => {
      silencedQuery.current = query.trim()
      announceNow(message)
    },
    handleValueChange,
    handleOpenChange,
    search,
  }
}

export type AddressLookupEngine = ReturnType<typeof useAddressLookupEngine>

function statusTextOf(engine: AddressLookupEngine): string | undefined {
  const { messages, status } = engine
  switch (status) {
    case 'too-short':
      return messages.tooShort({ min: engine.minLength })
    case 'searching':
      return messages.searching
    case 'empty':
      return messages.noResults({ query: engine.answeredQuery })
    case 'error':
      return messages.error
    case 'offline':
      return messages.offline
    case 'rejected':
      return engine.rejection
    default:
      return undefined
  }
}

/** Internal. The Autocomplete over the engine's state, with Enter and the pick wired to it. */
export function useAddressLookupField(engine: AddressLookupEngine): UseAddressLookupResult {
  const { messages, geocoder } = engine
  const autocomplete = useAutocomplete<AddressSuggestion>({
    items: engine.results,
    itemToString: (item) => item.label,
    itemToKey: (item) => item.id,
    filter: false,
    value: engine.text,
    onValueChange: (value, { reason }) => engine.handleValueChange(value, reason),
    open: engine.isOpen,
    onOpenChange: (next, { reason }) => engine.handleOpenChange(next, reason),
    disabled: engine.disabled,
    id: engine.id,
    // Our own announcements say these, with the address search's words.
    announceResults: false,
  })

  const notePickByKey = (key: string | undefined) =>
    engine.notePick(engine.results.find((candidate) => candidate.id === key))

  const inputProps: ComboboxInputPartProps = {
    ...autocomplete.inputProps,
    onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => {
      const isActive = autocomplete.activeKey !== undefined
      if (event.key === 'Enter' && !isActive && !event.nativeEvent.isComposing) {
        // The text is a lookup, not an answer: Enter searches and never submits a form.
        event.preventDefault()
        engine.search()
        return
      }
      if ((event.key === 'Enter' || (event.key === 'ArrowUp' && event.altKey)) && isActive) {
        notePickByKey(autocomplete.activeKey)
      }
      autocomplete.inputProps.onKeyDown?.(event)
    },
  }

  const statusText = statusTextOf(engine)
  return {
    ...autocomplete,
    inputProps,
    getOptionProps: (entry) => {
      const optionProps = autocomplete.getOptionProps(entry)
      return {
        ...optionProps,
        onClick: (event) => {
          notePickByKey(entry.key)
          optionProps.onClick?.(event)
        },
      }
    },
    popupProps: {
      ...autocomplete.popupProps,
      ...(engine.status === 'searching' && autocomplete.isOpen
        ? { 'data-loading': '' as const }
        : {}),
    },
    status: engine.status,
    results: engine.results,
    isOnRequest: engine.isOnRequest,
    search: engine.search,
    submitProps: {
      className: 'kv-address-lookup-submit',
      type: 'button',
      ...(autocomplete.isDisabled ? { disabled: true as const } : {}),
      onClick: engine.search,
    },
    statusProps: {
      className: 'kv-listbox-empty kv-address-lookup-status',
      'data-state': engine.status,
    },
    statusText,
    labelText: messages.label,
    helpText: engine.isOnRequest
      ? messages.helpRequest
      : messages.helpSuggest({ min: engine.minLength }),
    noticeText:
      geocoder.name === undefined
        ? messages.privacyUnnamed
        : messages.privacy({ service: geocoder.name }),
    attribution: geocoder.attribution,
    submitText: messages.submit,
  }
}

/**
 * The state and props of an address search (contract: address-search.a11y.md): an Autocomplete
 * over a geocoder's answers. It searches on request (Enter or the Search button) unless the
 * geocoder declares `suggest: true`, never sends before the visitor types, cancels the request in
 * flight on each new one, and says what it does through the Announcer (needs a `KvirnProvider`).
 * Enter with no suggestion active searches and never submits a form.
 *
 * @example
 * const search = useAddressLookup({ geocoder, onResult: (result) => map.show(result) })
 * <input {...search.inputProps} />
 * <button {...search.submitProps}>{search.submitText}</button>
 */
export function useAddressLookup(options: UseAddressLookupOptions): UseAddressLookupResult {
  return useAddressLookupField(useAddressLookupEngine(options))
}
