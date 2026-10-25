import {
  collectText,
  computePlacement,
  createReadAloud,
  kvirnSpeechEngine,
  readAloudRates,
} from '@kvirn-ui/core'
import type {
  CollectedText,
  ReadAloud,
  ReadAloudEngine,
  ReadAloudError,
  ReadAloudState,
  ReadAloudStatus,
  ReadAloudVoice,
  ReadAloudVoiceMap,
  ReadAloudVoicesStatus,
  ResolvedMessages,
} from '@kvirn-ui/core'
import type { KvirnMessages } from '@kvirn-ui/i18n'
import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react'
import type {
  ChangeEvent,
  FocusEvent,
  KeyboardEvent,
  MouseEvent,
  PointerEvent,
  RefObject,
} from 'react'
import { useAnnouncer, useButton, useLocale } from '@kvirn-ui/react'
import type { ButtonPartProps } from '@kvirn-ui/react'
import { useEnv, useMessages, useReadAloudEngine, warnOnce } from '@kvirn-ui/react/internal'
import { collectRangeText } from './collect-range-text.ts'

const highlightName = 'kv-read-aloud'

/** Past this wait, the spinner and the `preparing` text replace whatever Status showed before. */
const preparingVisibleMilliseconds = 300
/** Past this wait, `preparing` is announced once, and only for the first chunk of a press. */
const preparingAnnounceMilliseconds = 1000
/** How long `partSkipped` is shown before Status returns to the position it would otherwise show. */
const partSkippedMilliseconds = 4000

const stateBeforeMount: ReadAloudState = {
  status: 'idle',
  chunks: [],
  index: 0,
  rate: 1,
  voiceId: null,
  language: 'en',
  error: null,
  errorLanguage: null,
  source: 'content',
  voicesStatus: 'idle',
  voices: [],
  hasVoice: null,
  skippedCount: 0,
}

/** No engine resolved at all (`engine`, `url` and `<KvirnProvider readAloud>` all absent): the only case `hasVoice` is a settled `false` rather than `null`, so the Root renders nothing. */
const stateWithNoEngine: ReadAloudState = { ...stateBeforeMount, hasVoice: false }

function applyPosition(element: HTMLElement, x: number, y: number) {
  element.style.cssText = `position: fixed; margin: 0; right: auto; bottom: auto; left: ${x}px; top: ${y}px;`
}

const subscribeToNothing = () => () => {}

/**
 * The selected part of `content`, as a copy: a selection that runs past it is cut at its edges. A
 * triple-click on the last paragraph selects up to the start of whatever follows, and that must
 * still read the paragraph.
 */
function selectedRangeWithin(content: Element, selection: Selection | null): Range | null {
  if (selection === null || selection.rangeCount === 0 || selection.isCollapsed) {
    return null
  }
  const range = selection.getRangeAt(0)
  if (!range.intersectsNode(content)) {
    return null
  }
  const clamped = range.cloneRange()
  const bounds = content.ownerDocument.createRange()
  bounds.selectNodeContents(content)
  if (clamped.compareBoundaryPoints(clamped.START_TO_START, bounds) < 0) {
    clamped.setStart(bounds.startContainer, bounds.startOffset)
  }
  if (clamped.compareBoundaryPoints(clamped.END_TO_END, bounds) > 0) {
    clamped.setEnd(bounds.endContainer, bounds.endOffset)
  }
  return clamped.toString().trim() === '' ? null : clamped
}
const getStateBeforeMount = () => stateBeforeMount
const getStateWithNoEngine = () => stateWithNoEngine

export interface UseReadAloudOptions {
  /** The element whose text is read. Resolved when Play is pressed. */
  contentRef: RefObject<Element | null>
  /**
   * An already-built speech engine, used as-is: `url` and the options below it are then ignored.
   * Wins over both `url` and `<KvirnProvider readAloud>` (Plan 0153 D13).
   */
  engine?: ReadAloudEngine | undefined
  /**
   * Builds and memoises `kvirnSpeechEngine({ url, ... })` for this player alone. Ignored when
   * `engine` is given. Wins over `<KvirnProvider readAloud>`, so the package keeps working with
   * no provider at all. With none of `engine`, `url` or a provider config, the Root renders no
   * player and a development warning names the three ways to give it one.
   */
  url?: string | URL | undefined
  /** Asks the service to cache the audio. Only for public page text. Default `false`. Read only when `url` builds the engine. */
  store?: boolean | undefined
  /** Total budget per request. Default 10000 ms. Read only when `url` builds the engine. */
  timeout?: number | undefined
  /**
   * The language-to-voice map, resolved over the service's own: your entry for a language wins,
   * any language you don't name keeps the service's voice. Read only when `url` builds the engine.
   */
  voices?: ReadAloudVoiceMap | undefined
  /**
   * Who receives the text, named by the Note part (`readAloud.note`). Pass the same value you
   * gave `kvirnSpeechEngine`'s `name` (or this `url`'s own `name`), since the engine itself has
   * nowhere to carry it. Omit it and the Note renders nothing: there is no sensible default to
   * show without it.
   */
  name?: string | undefined
  /** Highlights the sentence being read where the browser supports the CSS Custom Highlight API. Default `true`. */
  highlight?: boolean | undefined
  /** Scrolls the sentence into view when it is out of view, unless the user prefers reduced motion. Default `true`. */
  scroll?: boolean | undefined
  /** Per-instance message overrides: `{ play: 'Listen' }`. */
  messages?: Partial<KvirnMessages['readAloud']> | undefined
  /** Called when the status changes. */
  onStatusChange?: ((status: ReadAloudStatus) => void) | undefined
}

/** Spread on a `<button>`: the Button's props and its class for the player. */
export interface ReadAloudButtonPartProps extends Omit<ButtonPartProps, 'className'> {
  className: 'kv-button kv-read-aloud-button'
}

export interface ReadAloudRootPartProps {
  className: 'kv-read-aloud'
  role: 'group'
  'aria-label': string
  'data-kv-read-aloud-skip': ''
  'data-status': ReadAloudStatus
  'data-error'?: ReadAloudError
  'data-source': ReadAloudState['source']
  onKeyDown: (event: KeyboardEvent<HTMLElement>) => void
  onFocus: (event: FocusEvent<HTMLElement>) => void
  onBlur: (event: FocusEvent<HTMLElement>) => void
}

export interface ReadAloudPlayPartProps extends ReadAloudButtonPartProps {
  /** Present while it is reading. */
  'data-playing'?: ''
  /** Present while the wait for the first or next chunk has passed 300 ms. Never disabled: it is the way to stop the wait. */
  'data-busy'?: ''
}

/** Spread on a `<select>`. Its `<label>` takes the matching `...LabelProps`. */
export interface ReadAloudSelectPartProps {
  className: 'kv-read-aloud-select'
  id: string
  value: string
  onChange: (event: ChangeEvent<HTMLSelectElement>) => void
}

export interface ReadAloudLabelPartProps {
  className: 'kv-read-aloud-label'
  htmlFor: string
}

export interface ReadAloudStatusPartProps {
  className: 'kv-read-aloud-status'
  /** Findable by a screen reader, but silent: the speech is the feedback. */
  role: 'status'
  'aria-live': 'off'
  'data-error'?: ReadAloudError
}

/** Spread on the `<p>` of the Note part. */
export interface ReadAloudNotePartProps {
  className: 'kv-read-aloud-note'
}

/** Spread on the `<button>` that is shown next to a selection made with a pointer. */
export interface ReadAloudSelectionTriggerPartProps {
  className: 'kv-button kv-read-aloud-selection-trigger'
  type: 'button'
  popover: 'manual'
  tabIndex: -1
  ref: (element: HTMLButtonElement | null) => void
  onPointerDown: (event: PointerEvent<HTMLButtonElement>) => void
  onMouseDown: (event: MouseEvent<HTMLButtonElement>) => void
  onClick: () => void
}

export interface ReadAloudOption {
  value: string
  label: string
}

export interface UseReadAloudResult {
  status: ReadAloudStatus
  error: ReadAloudError | null
  voicesStatus: ReadAloudVoicesStatus
  state: ReadAloudState
  /**
   * Whether the resolved content language (never the UI's `locale`) has a voice: a synchronous
   * lookup in the engine's voice map, true or false as soon as the machine exists (D14), so a
   * consumer can render nothing for a language with none (D9) without a player that flashes then
   * vanishes. `null` only before mount, or with no engine resolved at all (`false` there instead,
   * once mounted: see `UseReadAloudOptions.engine`).
   */
  hasVoice: boolean | null
  /** A selection inside the content is captured: Play reads it. */
  hasSelection: boolean
  /** The voice select is only useful with two or more voices for the language. */
  hasVoiceChoice: boolean
  rootProps: ReadAloudRootPartProps
  playProps: ReadAloudPlayPartProps
  previousProps: ReadAloudButtonPartProps
  nextProps: ReadAloudButtonPartProps
  stopProps: ReadAloudButtonPartProps
  rateProps: ReadAloudSelectPartProps
  rateLabelProps: ReadAloudLabelPartProps
  voiceProps: ReadAloudSelectPartProps
  voiceLabelProps: ReadAloudLabelPartProps
  statusProps: ReadAloudStatusPartProps
  noteProps: ReadAloudNotePartProps
  /** `readAloud.note` with `{name}`, or `null` when `name` was not given: there is nothing sensible to show. */
  noteText: string | null
  /** `true` after a pointer-made selection in the content, until it is dismissed. */
  isSelectionTriggerShown: boolean
  selectionTriggerProps: ReadAloudSelectionTriggerPartProps
  /** The messages: `play` becomes `playSelection` or `pause` as the state changes. */
  playLabel: string
  /** The message `playSelection`: the selection trigger's name. */
  selectionLabel: string
  previousLabel: string
  nextLabel: string
  stopLabel: string
  rateLabel: string
  voiceLabel: string
  /** The Note part's link text, for the consumer's own `howItWorksHref` link. */
  howItWorksLabel: string
  /** Shown only while the Voice select's options have not arrived yet. */
  voicesLoadingLabel: string
  /** Visible status text: the position, a wait, a skip or the reason reading stopped. Empty when idle. */
  statusText: string
  rateOptions: ReadAloudOption[]
  voiceOptions: ReadAloudOption[]
}

type BrowserHighlights = Window & {
  CSS?: { highlights?: Map<string, unknown> }
  Highlight?: new (...ranges: Range[]) => unknown
}

const primarySubtag = (tag: string) => tag.toLowerCase().replaceAll('_', '-').split('-')[0]

function voicesForLanguage(voices: readonly ReadAloudVoice[], language: string) {
  const tag = language.toLowerCase().replaceAll('_', '-')
  const matching = voices.filter((voice) => primarySubtag(voice.lang) === primarySubtag(language))
  const exact = matching.filter((voice) => voice.lang.toLowerCase().replaceAll('_', '-') === tag)
  return [...exact, ...matching.filter((voice) => !exact.includes(voice))]
}

function languageName(tag: string, locale: string): string {
  try {
    return new Intl.DisplayNames([locale], { type: 'language' }).of(tag) ?? tag
  } catch {
    return tag
  }
}

/**
 * The content's own declared language, which picks its voice and must never be the UI's, else a
 * page read in another UI language reads its own-language text in the wrong voice (3.1.2): a
 * Finnish municipality's Swedish-UI page over Finnish content must still read Finnish, and an
 * English-UI page over Swedish content must still read Swedish, not English. Only content with no
 * declared language at all falls back to `locale`, the provider's own (D14); `core`'s own `'en'`
 * is the last resort below that, for the rare `getLanguage` caller with no locale of its own.
 */
function languageOf(element: Element | null, locale: string): string {
  return element?.closest('[lang]')?.getAttribute('lang') || locale
}

function errorStatusText(
  error: ReadAloudError,
  language: string,
  messages: ResolvedMessages<KvirnMessages['readAloud']>,
): string {
  switch (error) {
    case 'no-voice':
      return messages.errorNoVoice({ language })
    case 'speech-error':
      return messages.errorPlayback
    case 'service-busy':
      return messages.errorServiceBusy
    case 'service-unavailable':
      return messages.errorServiceUnavailable
    case 'text-too-long':
      return messages.partSkipped
  }
}

/**
 * A text-to-speech player's behaviour (contract: read-aloud.a11y.md): Play reads the captured
 * selection, else the content, sentence by sentence, on the Kvirn voice service. Nothing starts
 * by itself, Pause and Stop stay reachable while a chunk is being fetched, and nothing but a
 * failure or a skipped part is ever announced.
 *
 * @example
 * const reader = useReadAloud({ contentRef, engine: kvirnSpeechEngine({ url }) })
 * <button {...reader.playProps}>{reader.playLabel}</button>
 */
export function useReadAloud({
  contentRef,
  engine: engineProp,
  url,
  store,
  timeout,
  voices: engineVoices,
  name,
  highlight = true,
  scroll = true,
  messages,
  onStatusChange,
}: UseReadAloudOptions): UseReadAloudResult {
  const env = useEnv()
  const { locale } = useLocale()
  const readAloudMessages = useMessages('readAloud', messages)
  const { announce } = useAnnouncer()
  const rateId = useId()
  const voiceSelectId = useId()
  const providerEngine = useReadAloudEngine()

  // Memoised on the primitive values, not `url`'s or `voices`' object identity, so an inline
  // `url={new URL(...)}` literal doesn't rebuild the engine on every render.
  const urlKey = url?.toString()
  const voicesKey = engineVoices === undefined ? undefined : JSON.stringify(engineVoices)
  const builtEngine = useMemo<ReadAloudEngine | undefined>(() => {
    if (url === undefined) {
      return undefined
    }
    return kvirnSpeechEngine({
      url,
      name,
      store,
      timeout,
      voices: voicesKey === undefined ? undefined : JSON.parse(voicesKey),
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlKey, name, store, timeout, voicesKey])
  const ownsBuiltEngine = engineProp === undefined && url !== undefined
  useEffect(
    () => (ownsBuiltEngine ? () => builtEngine?.destroy() : undefined),
    [ownsBuiltEngine, builtEngine],
  )

  // Resolution order (Plan 0153 D13): the hook's own `engine` or `url`, then the provider's
  // `readAloud`, then no player at all.
  const resolvedEngine = engineProp ?? builtEngine ?? providerEngine
  const resolvedFromProvider =
    engineProp === undefined && builtEngine === undefined && providerEngine !== undefined
  if (resolvedEngine === undefined) {
    warnOnce(
      'read-aloud-no-engine',
      'useReadAloud has no speech engine: pass `engine`, pass `url`, or configure <KvirnProvider readAloud>. Rendering no player.',
    )
  }
  // A provider's engine is shared by every player under it: only the provider may destroy it
  // (on unmount or a config change), never one player's own lifecycle.
  const machineEngine = useMemo(() => {
    if (resolvedEngine === undefined) {
      return undefined
    }
    return resolvedFromProvider ? { ...resolvedEngine, destroy: () => {} } : resolvedEngine
  }, [resolvedEngine, resolvedFromProvider])
  const hasEngine = machineEngine !== undefined

  const [machine, setMachine] = useState<ReadAloud | null>(null)
  const [captured, setCaptured] = useState<{ text: string; range: Range } | null>(null)
  const focusInside = useRef(false)
  const [triggerRect, setTriggerRect] = useState<DOMRect | null>(null)
  const [triggerElement, setTriggerElement] = useState<HTMLButtonElement | null>(null)
  const reading = useRef<CollectedText | null>(null)
  const latest = useRef({ engine: machineEngine, onStatusChange })
  const announcement = useRef({ announce, messages: readAloudMessages })

  // Kept in sync before the machine effect below, every render: that effect reads `latest.current`
  // instead of `machineEngine` directly so an unmemoised engine never rebuilds the machine, but it
  // must still see this render's engine the moment `hasEngine` itself is what triggers it.
  useEffect(() => {
    latest.current = { engine: machineEngine, onStatusChange }
    announcement.current = { announce, messages: readAloudMessages }
  })

  const resolveLanguage = useCallback(
    (element: Element | null) => languageOf(element, locale),
    [locale],
  )

  useEffect(() => {
    if (env === undefined || latest.current.engine === undefined) {
      return undefined
    }
    const created = createReadAloud({
      engine: latest.current.engine,
      getLanguage: () => resolveLanguage(contentRef.current),
    })
    setMachine(created)
    // Resolves `hasVoice` before the first press, so a site that declares its content language
    // never shows a player that then disappears (D9).
    created.actions.loadVoices()
    const stopOnHide = () => created.actions.destroy()
    env.window.addEventListener('pagehide', stopOnHide)
    return () => {
      env.window.removeEventListener('pagehide', stopOnHide)
      created.actions.destroy()
      setMachine(null)
    }
  }, [env, contentRef, resolveLanguage, hasEngine])

  const state = useSyncExternalStore(
    machine?.subscribe ?? subscribeToNothing,
    machine?.getState ?? (hasEngine ? getStateBeforeMount : getStateWithNoEngine),
    hasEngine ? getStateBeforeMount : getStateWithNoEngine,
  )
  const { status, error, index, chunks, voicesStatus, hasVoice } = state
  const errorLanguageName = languageName(state.errorLanguage ?? state.language, locale)

  useEffect(() => {
    if (env === undefined) {
      return undefined
    }
    const document = env.window.document
    const capture = () => {
      const selection = document.getSelection()
      const content = contentRef.current
      if (selection !== null && selection.rangeCount > 0 && !selection.isCollapsed) {
        const range = content === null ? null : selectedRangeWithin(content, selection)
        if (range !== null) {
          setCaptured({ text: range.toString(), range })
        }
        return
      }
      setTriggerRect(null)
      if (!focusInside.current) {
        setCaptured(null)
      }
    }
    // Only a selection finished with a pointer shows the trigger: a keyboard selection never does.
    const showTrigger = () => {
      const content = contentRef.current
      const range = content === null ? null : selectedRangeWithin(content, document.getSelection())
      if (range === null) {
        return
      }
      const rects = range.getClientRects()
      setTriggerRect(rects.item(rects.length - 1) ?? range.getBoundingClientRect())
    }
    const dismiss = () => setTriggerRect(null)
    document.addEventListener('selectionchange', capture)
    document.addEventListener('pointerup', showTrigger)
    document.addEventListener('keydown', dismiss)
    env.window.addEventListener('scroll', dismiss, true)
    env.window.addEventListener('resize', dismiss)
    return () => {
      document.removeEventListener('selectionchange', capture)
      document.removeEventListener('pointerup', showTrigger)
      document.removeEventListener('keydown', dismiss)
      env.window.removeEventListener('scroll', dismiss, true)
      env.window.removeEventListener('resize', dismiss)
    }
  }, [env, contentRef])

  const isSelectionTriggerShown = triggerRect !== null && captured !== null
  useLayoutEffect(() => {
    if (env === undefined || triggerElement === null || triggerRect === null) {
      return
    }
    try {
      triggerElement.showPopover()
    } catch {
      // Already open, or the browser has no Popover API.
    }
    const size = triggerElement.getBoundingClientRect()
    const root = env.document.documentElement
    const { x, y } = computePlacement(
      triggerRect,
      { width: size.width, height: size.height },
      { x: 0, y: 0, width: root.clientWidth, height: root.clientHeight },
      {
        placement: 'bottom-end',
        direction: env.window.getComputedStyle(root).direction === 'rtl' ? 'rtl' : 'ltr',
        offset: 4,
        padding: 4,
      },
    )
    applyPosition(triggerElement, x, y)
  }, [env, triggerElement, triggerRect])

  const previousStatus = useRef(status)
  useEffect(() => {
    if (previousStatus.current !== status) {
      previousStatus.current = status
      latest.current.onStatusChange?.(status)
    }
    if (status === 'idle') {
      reading.current = null
    }
  }, [status])

  // The last chunk that actually reached `playing` this press, so a mid-text buffering gap can
  // hold the highlight and the position there instead of jumping ahead to a chunk with no audio
  // yet. `null` again once the press ends, so the next one starts honestly empty.
  const lastPlayedIndex = useRef<number | null>(null)
  const announcedPreparingThisPress = useRef(false)
  useEffect(() => {
    if (status === 'playing') {
      lastPlayedIndex.current = index
    } else if (status === 'idle') {
      lastPlayedIndex.current = null
      announcedPreparingThisPress.current = false
    }
  }, [status, index])

  const [isPreparingVisible, setIsPreparingVisible] = useState(false)
  useEffect(() => {
    if (status !== 'preparing' || env === undefined) {
      setIsPreparingVisible(false)
      return undefined
    }
    const visibleTimer = env.window.setTimeout(
      () => setIsPreparingVisible(true),
      preparingVisibleMilliseconds,
    )
    // Only the first chunk's wait of a press is ever announced: a mid-text gap or a retry would
    // otherwise narrate every pause in the reading.
    const announceTimer =
      lastPlayedIndex.current === null && !announcedPreparingThisPress.current
        ? env.window.setTimeout(() => {
            announcedPreparingThisPress.current = true
            announcement.current.announce(announcement.current.messages.preparing)
          }, preparingAnnounceMilliseconds)
        : undefined
    return () => {
      env.window.clearTimeout(visibleTimer)
      if (announceTimer !== undefined) {
        env.window.clearTimeout(announceTimer)
      }
    }
  }, [status, env])

  const skippedCountSeen = useRef(state.skippedCount)
  const [isPartSkippedVisible, setIsPartSkippedVisible] = useState(false)
  useEffect(() => {
    const grew = state.skippedCount > skippedCountSeen.current
    skippedCountSeen.current = state.skippedCount
    if (!grew) {
      return undefined
    }
    setIsPartSkippedVisible(true)
    if (env === undefined) {
      return undefined
    }
    const timer = env.window.setTimeout(
      () => setIsPartSkippedVisible(false),
      partSkippedMilliseconds,
    )
    return () => env.window.clearTimeout(timer)
  }, [state.skippedCount, env])

  const announceSameError = (current: ReadAloud, errorBefore: ReadAloudError | null) => {
    const after = current.getState()
    if (after.error !== null && after.error === errorBefore) {
      announce(
        errorStatusText(
          after.error,
          languageName(after.errorLanguage ?? after.language, locale),
          readAloudMessages,
        ),
      )
    }
  }

  useEffect(() => {
    if (error === null) {
      return
    }
    announce(errorStatusText(error, errorLanguageName, readAloudMessages))
    // Once per occurrence: the message text is not a trigger.
  }, [error])

  useEffect(() => {
    const view = env?.window as BrowserHighlights | undefined
    const registry = view?.CSS?.highlights
    const HighlightConstructor = view?.Highlight
    if (env === undefined || registry === undefined || HighlightConstructor === undefined) {
      return undefined
    }
    const displayIndex =
      status === 'preparing' && lastPlayedIndex.current !== null ? lastPlayedIndex.current : index
    const suppressed =
      status === 'idle' || (status === 'preparing' && lastPlayedIndex.current === null)
    const chunk = chunks[displayIndex]
    const collected = reading.current
    if (!highlight || suppressed || chunk === undefined || collected === null) {
      registry.delete(highlightName)
      return undefined
    }
    const range = collected.rangeFor(chunk.start, chunk.end)
    registry.set(highlightName, new HighlightConstructor(range))
    const target = range.startContainer.parentElement
    if (
      scroll &&
      target !== null &&
      !env.window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      const { top, bottom } = target.getBoundingClientRect()
      if (bottom < 0 || top > env.window.innerHeight) {
        target.scrollIntoView({ block: 'nearest' })
      }
    }
    return undefined
  }, [env, status, index, chunks, highlight, scroll])

  useEffect(() => {
    const registry = (env?.window as BrowserHighlights | undefined)?.CSS?.highlights
    return () => {
      registry?.delete(highlightName)
    }
  }, [env])

  const isActive = status !== 'idle'
  const hasSelection = captured !== null

  const play = () => {
    setTriggerRect(null)
    if (machine === null || env === undefined) {
      return
    }
    const errorBefore = machine.getState().error
    if (status === 'playing' || status === 'preparing') {
      machine.actions.pause()
      return
    }
    if (captured !== null) {
      const range = captured.range.cloneRange()
      const collected = collectRangeText(range, {
        boundary: contentRef.current ?? undefined,
      })
      reading.current = collected
      setCaptured(null)
      announcedPreparingThisPress.current = false
      // The browser paints a selection over the highlight, so the selection gives way to it.
      env.window.document.getSelection()?.removeAllRanges()
      machine.actions.play({
        text: collected.text,
        source: 'selection',
        languageRuns: collected.languageRuns,
        language: resolveLanguage(contentRef.current),
      })
      announceSameError(machine, errorBefore)
      return
    }
    if (status === 'paused') {
      machine.actions.resume()
      announceSameError(machine, errorBefore)
      return
    }
    const content = contentRef.current
    if (content === null) {
      return
    }
    const collected = collectText(content)
    reading.current = collected
    announcedPreparingThisPress.current = false
    machine.actions.play({
      text: collected.text,
      source: 'content',
      languageRuns: collected.languageRuns,
      language: resolveLanguage(content),
    })
    announceSameError(machine, errorBefore)
  }

  const playButton = useButton({ onClick: play })
  const previous = useButton({
    disabled: !isActive,
    focusableWhenDisabled: true,
    onClick: () => machine?.actions.previous(),
  })
  const next = useButton({
    disabled: !isActive,
    focusableWhenDisabled: true,
    onClick: () => machine?.actions.next(),
  })
  const stop = useButton({
    disabled: !isActive,
    focusableWhenDisabled: true,
    onClick: () => {
      setTriggerRect(null)
      machine?.actions.stop()
    },
  })
  const buttonClass = 'kv-button kv-read-aloud-button' as const

  const voices = voicesForLanguage(state.voices, state.language)
  const defaultVoice = voices.find((voice) => voice.id === state.voiceId) ?? voices[0]

  const statusText =
    error !== null
      ? errorStatusText(error, errorLanguageName, readAloudMessages)
      : isPartSkippedVisible
        ? readAloudMessages.partSkipped
        : status === 'preparing'
          ? isPreparingVisible
            ? readAloudMessages.preparing
            : lastPlayedIndex.current === null
              ? ''
              : readAloudMessages.position({
                  current: lastPlayedIndex.current + 1,
                  total: chunks.length,
                })
          : chunks.length === 0
            ? ''
            : status === 'paused'
              ? readAloudMessages.positionPaused({ current: index + 1, total: chunks.length })
              : readAloudMessages.position({ current: index + 1, total: chunks.length })

  const playLabel =
    status === 'playing' || status === 'preparing'
      ? readAloudMessages.pause
      : hasSelection
        ? readAloudMessages.playSelection
        : readAloudMessages.play

  return {
    status,
    error,
    voicesStatus,
    hasVoice,
    state,
    hasSelection,
    hasVoiceChoice: voices.length >= 2,
    rootProps: {
      className: 'kv-read-aloud',
      role: 'group',
      'aria-label': readAloudMessages.label,
      'data-kv-read-aloud-skip': '',
      'data-status': status,
      ...(error === null ? {} : { 'data-error': error }),
      'data-source': state.source,
      onKeyDown(event) {
        if (event.key === 'Escape' && isActive && !event.defaultPrevented) {
          event.preventDefault()
          machine?.actions.stop()
        }
      },
      onFocus() {
        focusInside.current = true
      },
      onBlur(event) {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          focusInside.current = false
        }
      },
    },
    playProps: {
      ...playButton.buttonProps,
      className: buttonClass,
      ...(status === 'playing' ? { 'data-playing': '' as const } : {}),
      ...(status === 'preparing' && isPreparingVisible ? { 'data-busy': '' as const } : {}),
    },
    previousProps: { ...previous.buttonProps, className: buttonClass },
    nextProps: { ...next.buttonProps, className: buttonClass },
    isSelectionTriggerShown,
    selectionTriggerProps: {
      className: 'kv-button kv-read-aloud-selection-trigger',
      type: 'button',
      popover: 'manual',
      tabIndex: -1,
      ref: setTriggerElement,
      // The default would move focus and collapse the selection that is about to be read. Browsers
      // only skip the focus and selection change when `mousedown` is cancelled, not `pointerdown`.
      onPointerDown: (event) => event.preventDefault(),
      onMouseDown: (event) => event.preventDefault(),
      onClick: () => {
        setTriggerRect(null)
        play()
      },
    },
    stopProps: { ...stop.buttonProps, className: buttonClass },
    rateProps: {
      className: 'kv-read-aloud-select',
      id: rateId,
      value: String(state.rate),
      onChange: (event) => machine?.actions.setRate(Number(event.target.value)),
    },
    rateLabelProps: { className: 'kv-read-aloud-label', htmlFor: rateId },
    voiceProps: {
      className: 'kv-read-aloud-select',
      id: voiceSelectId,
      value: defaultVoice?.id ?? '',
      onChange: (event) => machine?.actions.setVoice(event.target.value),
    },
    voiceLabelProps: { className: 'kv-read-aloud-label', htmlFor: voiceSelectId },
    statusProps: {
      className: 'kv-read-aloud-status',
      role: 'status',
      'aria-live': 'off',
      ...(error === null ? {} : { 'data-error': error }),
    },
    noteProps: { className: 'kv-read-aloud-note' },
    noteText: name === undefined ? null : readAloudMessages.note({ name }),
    playLabel,
    selectionLabel: readAloudMessages.playSelection,
    previousLabel: readAloudMessages.previous,
    nextLabel: readAloudMessages.next,
    stopLabel: readAloudMessages.stop,
    rateLabel: readAloudMessages.rate,
    voiceLabel: readAloudMessages.voice,
    howItWorksLabel: readAloudMessages.howItWorks,
    voicesLoadingLabel: readAloudMessages.voicesLoading,
    statusText,
    rateOptions: readAloudRates.map((rate) => ({
      value: String(rate),
      label: readAloudMessages.rateOption({ rate }),
    })),
    voiceOptions: voices.map((voice) => ({ value: voice.id, label: voice.name })),
  }
}
