import {
  collectText,
  computePlacement,
  createReadAloud,
  createSpeechEngine,
  readAloudRates,
} from '@kvirn-ui/core'
import type {
  CollectedText,
  ReadAloud,
  ReadAloudEngine,
  ReadAloudState,
  ReadAloudStatus,
  ReadAloudVoice,
} from '@kvirn-ui/core'
import type { KvirnMessages } from '@kvirn-ui/i18n'
import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
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
import { warnOnce } from '../dev/dev-warning.ts'
import { useAnnouncer } from '../announcer/use-announcer.ts'
import { useButton } from '../button/use-button.ts'
import type { ButtonPartProps } from '../button/use-button.ts'
import { useEnv } from '../provider/use-env.ts'
import { useLocale } from '../provider/use-locale.ts'
import { useMessages } from '../provider/use-messages.ts'
import { collectRangeText } from './collect-range-text.ts'

const highlightName = 'kv-read-aloud'

const stateBeforeMount: ReadAloudState = {
  status: 'idle',
  chunks: [],
  index: 0,
  rate: 1,
  voiceURI: null,
  language: 'en',
  error: null,
  errorLanguage: null,
  source: 'content',
  voices: [],
}

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

export interface UseReadAloudOptions {
  /** The element whose text is read. Resolved when Play is pressed. */
  contentRef: RefObject<Element | null>
  /**
   * BCP 47 tag of the content, which picks the voice. Default: the closest `[lang]` of the
   * content, then the document's.
   */
  lang?: string | undefined
  /** Advanced, unstable: your own speech engine. Default: the browser's `speechSynthesis`. */
  engine?: ReadAloudEngine | undefined
  /** Lets the browser pick voices that may send the text to a remote service. Default `false`. */
  allowRemoteVoices?: boolean | undefined
  /** Highlights the sentence being read where the browser supports the CSS Custom Highlight API. Default `true`. */
  highlight?: boolean | undefined
  /** Scrolls the sentence into view when it is out of view, unless the user prefers reduced motion. Default `true`. */
  scroll?: boolean | undefined
  /** Per-instance message overrides: `{ play: 'Lyssna' }`. */
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
  'data-source': ReadAloudState['source']
  onKeyDown: (event: KeyboardEvent<HTMLElement>) => void
  onFocus: (event: FocusEvent<HTMLElement>) => void
  onBlur: (event: FocusEvent<HTMLElement>) => void
}

export interface ReadAloudPlayPartProps extends ReadAloudButtonPartProps {
  /** Present while it is reading. */
  'data-playing'?: ''
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
  'data-error'?: 'no-voice' | 'speech-error' | 'unsupported'
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
  state: ReadAloudState
  /** `false` when the browser has no speech synthesis: render only the group and the status. */
  isSupported: boolean
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
  /** Visible status text: the position, or the reason nothing is read. Empty when idle. */
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

function languageOf(element: Element | null, fallback: Document, locale: string): string {
  return (
    element?.closest('[lang]')?.getAttribute('lang') ||
    fallback.documentElement.getAttribute('lang') ||
    locale
  )
}

/**
 * A text-to-speech player's behaviour (contract: read-aloud.a11y.md): Play reads the captured
 * selection, else the content, sentence by sentence on the browser's `speechSynthesis`. Nothing
 * starts by itself and nothing but a failure is announced.
 *
 * @example
 * const reader = useReadAloud({ contentRef })
 * <button {...reader.playProps}>{reader.playLabel}</button>
 */
export function useReadAloud({
  contentRef,
  lang,
  engine,
  allowRemoteVoices = false,
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
  const voiceId = useId()

  const [machine, setMachine] = useState<ReadAloud | null>(null)
  const [captured, setCaptured] = useState<{ text: string; range: Range } | null>(null)
  const focusInside = useRef(false)
  const [triggerRect, setTriggerRect] = useState<DOMRect | null>(null)
  const [triggerElement, setTriggerElement] = useState<HTMLButtonElement | null>(null)
  const reading = useRef<CollectedText | null>(null)
  const latest = useRef({ lang, engine, allowRemoteVoices, onStatusChange })
  const engineDiagnostics = useRef<{
    engine: ReadAloudEngine
    allowRemoteVoices: boolean
    initialVoices: readonly ReadAloudVoice[]
  } | null>(null)
  const announcement = useRef({ announce, messages: readAloudMessages, noVoiceText: '' })

  const resolveLanguage = useCallback(
    (element: Element | null) =>
      latest.current.lang ?? languageOf(element, (env ?? { document }).document, locale),
    [env, locale],
  )

  useEffect(() => {
    if (env === undefined) {
      return undefined
    }
    const speechEngine = latest.current.engine ?? createSpeechEngine(env, { allowRemoteVoices })
    const created = createReadAloud({
      engine: speechEngine,
      getLanguage: () => resolveLanguage(contentRef.current),
    })
    setMachine(created)
    engineDiagnostics.current = {
      engine: speechEngine,
      allowRemoteVoices,
      initialVoices: created.getState().voices,
    }
    const stopOnHide = () => created.actions.destroy()
    env.window.addEventListener('pagehide', stopOnHide)
    return () => {
      env.window.removeEventListener('pagehide', stopOnHide)
      created.actions.destroy()
      setMachine(null)
    }
  }, [env, contentRef, resolveLanguage, allowRemoteVoices])

  const state = useSyncExternalStore(
    machine?.subscribe ?? subscribeToNothing,
    machine?.getState ?? getStateBeforeMount,
    getStateBeforeMount,
  )
  const { status, error, index, chunks } = state
  const noVoiceLanguage = state.errorLanguage ?? state.language
  useEffect(() => {
    const diagnostics = engineDiagnostics.current
    if (machine === null || diagnostics === null) {
      return
    }
    if (status === 'unsupported') {
      warnOnce(
        'read-aloud-unsupported',
        '<ReadAloud> renders only its unsupported text because this browser has no Web Speech API (speechSynthesis or SpeechSynthesisUtterance is missing).',
      )
      return
    }
    // Voices load late: an empty list counts once it has changed or Listen was pressed.
    if (state.voices.length === 0) {
      if (error === 'no-voice' || state.voices !== diagnostics.initialVoices) {
        const total = diagnostics.engine.getAllVoiceCount?.()
        warnOnce(
          'read-aloud-no-usable-voice',
          `<ReadAloud> has no usable voice: the browser reports ${total ?? 'an unknown number of'} voice(s), 0 are offered. Only local voices are used unless allowRemoteVoices is set (now ${diagnostics.allowRemoteVoices}). On Linux, install speech-dispatcher and espeak-ng.`,
        )
      }
    } else if (error === 'no-voice') {
      const languages = [...new Set(state.voices.map((voice) => voice.lang))].join(', ')
      warnOnce(
        `read-aloud-no-voice:${noVoiceLanguage}`,
        `<ReadAloud> has no voice for the language "${noVoiceLanguage}". Available voice languages: ${languages}. Set lang on the content, or install a voice for it.`,
      )
    }
  }, [machine, status, error, state.voices, noVoiceLanguage])
  const noVoiceText = readAloudMessages.noVoice({
    language: languageName(state.errorLanguage ?? state.language, locale),
  })
  useEffect(() => {
    latest.current = { lang, engine, allowRemoteVoices, onStatusChange }
    announcement.current = { announce, messages: readAloudMessages, noVoiceText }
  })

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

  const isSelectionTriggerShown =
    triggerRect !== null && captured !== null && status !== 'unsupported'
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

  useEffect(() => {
    if (error === 'no-voice') {
      announcement.current.announce(announcement.current.noVoiceText)
    } else if (error === 'speech-error') {
      announcement.current.announce(announcement.current.messages.speechError)
    }
    // Once per occurrence: the message text is not a trigger.
  }, [error])

  useEffect(() => {
    const view = env?.window as BrowserHighlights | undefined
    const registry = view?.CSS?.highlights
    const HighlightConstructor = view?.Highlight
    if (env === undefined || registry === undefined || HighlightConstructor === undefined) {
      return undefined
    }
    const chunk = chunks[index]
    const collected = reading.current
    if (!highlight || status === 'idle' || chunk === undefined || collected === null) {
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

  const isSupported = status !== 'unsupported'
  const isActive = status === 'playing' || status === 'paused'
  const hasSelection = captured !== null

  // A new no-voice error is announced by the effect above. A press that ends in the same error
  // again changes nothing in the state, so it is announced here: the user asked and gets the reason.
  const announceNoVoice = (current: ReadAloud, errorBefore: ReadAloudState['error']) => {
    const { error: currentError, errorLanguage, language } = current.getState()
    if (currentError === 'no-voice' && errorBefore === 'no-voice') {
      announce(
        readAloudMessages.noVoice({ language: languageName(errorLanguage ?? language, locale) }),
      )
    }
  }

  const play = () => {
    setTriggerRect(null)
    if (machine === null || env === undefined) {
      return
    }
    const errorBefore = machine.getState().error
    if (status === 'playing') {
      machine.actions.pause()
      return
    }
    if (captured !== null) {
      const range = captured.range.cloneRange()
      const collected = collectRangeText(range, {
        boundary: contentRef.current ?? undefined,
        ignoreBoundaryLanguage: latest.current.lang !== undefined,
      })
      reading.current = collected
      setCaptured(null)
      // The browser paints a selection over the highlight, so the selection gives way to it.
      env.window.document.getSelection()?.removeAllRanges()
      machine.actions.play({
        text: collected.text,
        source: 'selection',
        languageRuns: collected.languageRuns,
        language: resolveLanguage(contentRef.current),
      })
      announceNoVoice(machine, errorBefore)
      return
    }
    if (status === 'paused') {
      machine.actions.resume()
      announceNoVoice(machine, errorBefore)
      return
    }
    const content = contentRef.current
    if (content === null) {
      return
    }
    const collected = collectText(content)
    const contentLanguage = content.getAttribute('lang')?.trim()
    // The `lang` option is the default for unmarked text and beats the content's own `lang`; a
    // `lang` on an element inside it still wins for that stretch.
    const languageRuns =
      latest.current.lang === undefined || !contentLanguage
        ? collected.languageRuns
        : collected.languageRuns.filter(
            (run) =>
              collected
                .rangeFor(run.start, run.end)
                .startContainer.parentElement?.closest('[lang]') !== content,
          )
    reading.current = collected
    machine.actions.play({
      text: collected.text,
      source: 'content',
      languageRuns,
      language: resolveLanguage(content),
    })
    announceNoVoice(machine, errorBefore)
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
  const defaultVoice = voices.find((voice) => voice.voiceURI === state.voiceURI) ?? voices[0]

  const statusText =
    status === 'unsupported'
      ? readAloudMessages.unsupported
      : error === 'no-voice'
        ? noVoiceText
        : error === 'speech-error'
          ? readAloudMessages.speechError
          : chunks.length > 0
            ? (status === 'paused' ? readAloudMessages.positionPaused : readAloudMessages.position)(
                {
                  current: index + 1,
                  total: chunks.length,
                },
              )
            : ''

  const playLabel =
    status === 'playing'
      ? readAloudMessages.pause
      : hasSelection
        ? readAloudMessages.playSelection
        : readAloudMessages.play

  return {
    status,
    state,
    isSupported,
    hasSelection,
    hasVoiceChoice: voices.length >= 2,
    rootProps: {
      className: 'kv-read-aloud',
      role: 'group',
      'aria-label': readAloudMessages.label,
      'data-kv-read-aloud-skip': '',
      'data-status': status,
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
      id: voiceId,
      value: defaultVoice?.voiceURI ?? '',
      onChange: (event) => machine?.actions.setVoice(event.target.value),
    },
    voiceLabelProps: { className: 'kv-read-aloud-label', htmlFor: voiceId },
    statusProps: {
      className: 'kv-read-aloud-status',
      role: 'status',
      'aria-live': 'off',
      ...(status === 'unsupported'
        ? { 'data-error': 'unsupported' as const }
        : error === null
          ? {}
          : { 'data-error': error }),
    },
    playLabel,
    selectionLabel: readAloudMessages.playSelection,
    previousLabel: readAloudMessages.previous,
    nextLabel: readAloudMessages.next,
    stopLabel: readAloudMessages.stop,
    rateLabel: readAloudMessages.rate,
    voiceLabel: readAloudMessages.voice,
    statusText,
    rateOptions: readAloudRates.map((rate) => ({
      value: String(rate),
      label: readAloudMessages.rateOption({ rate }),
    })),
    voiceOptions: voices.map((voice) => ({ value: voice.voiceURI, label: voice.name })),
  }
}
