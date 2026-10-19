import { announcementDebounceMilliseconds } from '@kvirn-ui/core'
import type {
  AddressResult,
  AddressSuggestion,
  GeocoderIntent,
  GeocoderProvider,
} from '@kvirn-ui/core'
import type { KvirnMessages } from '@kvirn-ui/i18n'
import { useAutocomplete, useLocale } from '@kvirn-ui/react'
import type { ComboboxInputPartProps, UseAutocompleteResult } from '@kvirn-ui/react'
import {
  useMessages,
  useQuietAnnouncer,
  warnAnnouncerMissing,
  warnOnce,
} from '@kvirn-ui/react/internal'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'

const DEFAULT_MIN_LENGTH = 3
const DEFAULT_DEBOUNCE_MILLISECONDS = 400
const DEFAULT_TIMEOUT_MILLISECONDS = 10_000

export type AddressSearchState =
  | 'idle'
  | 'too-short'
  | 'searching'
  | 'results'
  | 'empty'
  | 'error'
  | 'offline'
  | 'selected'

export interface UseAddressSearchOptions {
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
  disabled?: boolean | undefined
  /** The input's id, outside a Field. Inside one, the Field's control id is used. */
  id?: string | undefined
  /** Per-instance message overrides. */
  messages?: Partial<KvirnMessages['addressSearch']> | undefined
}

export interface AddressSearchSubmitPartProps {
  className: string
  type: 'button'
  disabled?: true
  onClick: () => void
}

export interface AddressSearchStatusPartProps {
  className: string
  'data-state': AddressSearchState
}

export interface UseAddressSearchResult extends UseAutocompleteResult<AddressSuggestion> {
  status: AddressSearchState
  /** The latest answer. Earlier results stay listed while the next search runs. */
  results: readonly AddressSuggestion[]
  /** True when only Enter or Search sends a search. */
  isOnRequest: boolean
  /** Searches now, as Enter and the Search button do. */
  search: () => void
  /** Spread on the Search button, shown only while `isOnRequest`. */
  submitProps: AddressSearchSubmitPartProps
  /** Spread on the status line in the popup. It has no text for `idle`, `results` and `selected`. */
  statusProps: AddressSearchStatusPartProps
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
export function useAddressSearchEngine({
  geocoder,
  onResult,
  minLength = DEFAULT_MIN_LENGTH,
  debounce = DEFAULT_DEBOUNCE_MILLISECONDS,
  timeoutMilliseconds = DEFAULT_TIMEOUT_MILLISECONDS,
  disabled = false,
  id,
  messages: messageOverrides,
}: UseAddressSearchOptions) {
  const messages = useMessages('addressSearch', messageOverrides)
  const { locale } = useLocale()
  const { announce, isAvailable } = useQuietAnnouncer()
  const isOnRequest = debounce === false || geocoder.suggest !== true

  const [text, setText] = useState('')
  const [results, setResults] = useState<readonly AddressSuggestion[]>(noResults)
  const [status, setStatus] = useState<AddressSearchState>('idle')
  const [isOpen, setOpen] = useState(false)
  const [answeredQuery, setAnsweredQuery] = useState('')

  const latest = useRef({
    geocoder,
    onResult,
    minLength,
    debounce,
    timeoutMilliseconds,
    messages,
    locale,
    isOnRequest,
  })
  const controllerRef = useRef<AbortController | undefined>(undefined)
  const debounceTimer = useRef<number | undefined>(undefined)
  const announceTimer = useRef<number | undefined>(undefined)
  const pendingPick = useRef<AddressSuggestion | undefined>(undefined)
  const notePick = (item: AddressSuggestion | undefined) => {
    pendingPick.current = item
  }
  const hasResult = useRef(false)
  // The popup stays open while a pick is resolved, so its status line shows and the wait is not silent.
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
    announceLater(latest.current.messages.searching)
    const current = latest.current
    startRequest(async (signal) => {
      const list = await current.geocoder.search(query, { signal, locale: current.locale, intent })
      if (signal.aborted || controllerRef.current?.signal !== signal) {
        return
      }
      setResults(list)
      setAnsweredQuery(query)
      setStatus(list.length > 0 ? 'results' : 'empty')
      setOpen(true)
      announceLater(
        list.length > 0
          ? current.messages.resultCount({ count: list.length })
          : current.messages.noResults({ query }),
      )
    }, showFailure)
  }

  const finishPick = (result: AddressResult) => {
    isResolving.current = false
    hasResult.current = true
    setStatus('selected')
    setOpen(false)
    latest.current.onResult?.(result)
    announceNow(latest.current.messages.picked({ label: result.label }))
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
    setText(value)
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
    disabled,
    id,
    geocoder,
    minLength,
    notePick,
    handleValueChange,
    handleOpenChange,
    search,
  }
}

export type AddressSearchEngine = ReturnType<typeof useAddressSearchEngine>

function statusTextOf(engine: AddressSearchEngine): string | undefined {
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
    default:
      return undefined
  }
}

/** Internal. The Autocomplete over the engine's state, with Enter and the pick wired to it. */
export function useAddressSearchField(engine: AddressSearchEngine): UseAddressSearchResult {
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
      className: 'kv-address-search-submit',
      type: 'button',
      ...(autocomplete.isDisabled ? { disabled: true as const } : {}),
      onClick: engine.search,
    },
    statusProps: {
      className: 'kv-listbox-empty kv-address-search-status',
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
 * const search = useAddressSearch({ geocoder, onResult: (result) => map.show(result) })
 * <input {...search.inputProps} />
 * <button {...search.submitProps}>{search.submitText}</button>
 */
export function useAddressSearch(options: UseAddressSearchOptions): UseAddressSearchResult {
  return useAddressSearchField(useAddressSearchEngine(options))
}
