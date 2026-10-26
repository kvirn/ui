'use client'
import { createElement, useCallback, useContext, useEffect, useRef, useState } from 'react'
import type { CSSProperties, ReactElement, ReactNode, Ref } from 'react'
import type { ComponentPropsWithRef, HTMLAttributes } from 'react'
import { close, pause, play, settings, skipNext, skipPrevious, stop } from '@kvirn-ui/icons'
import { Icon, Popover, Toolbar, mergeProps } from '@kvirn-ui/react'
import { renderPart, resolveAsTag, useMergedRef } from '@kvirn-ui/react/internal'
import type { AsTag } from '@kvirn-ui/react/internal'
import { ReadAloudContext } from './read-aloud-context.ts'
import type { ReadAloudContextValue } from './read-aloud-context.ts'
import { useReadAloud } from './use-read-aloud.ts'
import type { UseReadAloudOptions, UseReadAloudResult } from './use-read-aloud.ts'

const statusTags = ['span', 'p', 'div'] as const

export interface ReadAloudRootProps
  extends UseReadAloudOptions, Omit<HTMLAttributes<HTMLElement>, 'onKeyDown' | 'lang'> {
  ref?: Ref<HTMLElement> | undefined
  children?: ReactNode
}

export interface ReadAloudButtonProps extends ComponentPropsWithRef<'button'> {
  /** Your own text. Replaces the message, so its language is yours to set. */
  children?: ReactNode
}

export interface ReadAloudSelectProps extends Omit<ComponentPropsWithRef<'select'>, 'children'> {
  /** The visible label. Replaces the message `readAloud.rate` or `readAloud.voice`. */
  label?: ReactNode
}

/** `aria-hidden`, informative only: see `ReadAloud.Progress`'s doc comment. No `children` slot: the fill is fixed. */
export interface ReadAloudProgressProps extends Omit<ComponentPropsWithRef<'p'>, 'children'> {}

/** A grouping `<div>` around Previous and Next: see `ReadAloud.Transport`'s doc comment. */
export interface ReadAloudTransportProps extends ComponentPropsWithRef<'div'> {}

export interface ReadAloudNoteProps extends ComponentPropsWithRef<'p'> {
  /** Shown as a `readAloud.howItWorks` link at the end of the note, pointing at your own page. Omit it for no link. */
  howItWorksHref?: string | undefined
  children?: ReactNode
}

/** `as` is `span` (default), `p` or `div`. Visible text, never a heading or a live region. */
export type ReadAloudStatusProps = AsTag<(typeof statusTags)[number], 'span'>

export interface ReadAloudBarProps extends ComponentPropsWithRef<'div'> {
  /** Forwarded to the default composition's `ReadAloud.Settings`, so a site-wide Bar can offer its own explanation page too (rule 7). Ignored when `children` replaces the default composition. */
  howItWorksHref?: string | undefined
  children?: ReactNode
}

export interface ReadAloudSettingsProps extends ComponentPropsWithRef<'button'> {
  /**
   * Shown as a `readAloud.howItWorks` link after the recipient sentence, pointing at your own
   * page (Plan 0154, superseding 0153 D11's placement in the panel only). Omit it for no link:
   * the destination is your duty, never the library's to invent (rule 7).
   */
  howItWorksHref?: string | undefined
  /** Replaces the popup's contents (Rate, Voice and the recipient note by default). The trigger stays fixed. */
  children?: ReactNode
}

export interface ReadAloudHideProps extends ComponentPropsWithRef<'button'> {
  children?: ReactNode
}

export interface ReadAloudWhenStartedProps {
  children?: ReactNode
}

function useReader(part: string): ReadAloudContextValue {
  const reader = useContext(ReadAloudContext)
  if (reader === null) {
    throw new Error(`<ReadAloud.${part}> must be used inside <ReadAloud.Root>.`)
  }
  return reader
}

/**
 * The group: `role="group"` named by `readAloud.label`. Put the player's parts in it. Renders
 * nothing once the voices have loaded and none serves the page's language (D9): a dead Listen
 * button that always fails is worse than none.
 */
export function ReadAloudRoot({
  contentRef,
  scope,
  engine,
  url,
  store,
  timeout,
  voices,
  name,
  highlight,
  scroll,
  messages,
  onStatusChange,
  ref,
  children,
  ...otherProps
}: ReadAloudRootProps): ReactElement | null {
  const reader = useReadAloud({
    contentRef,
    scope,
    engine,
    url,
    store,
    timeout,
    voices,
    name,
    highlight,
    scroll,
    messages,
    onStatusChange,
  })
  const mergedRef = useMergedRef(ref, null)
  // Whether a `ReadAloud.Bar` is mounted inside: if so, this one and only group takes
  // `readAloud.barLabel` instead of `readAloud.label` (Plan 0154). `registerBar`'s identity is
  // stable, so the Bar's own effect registers once, not on every render.
  const [hasBar, setHasBar] = useState(false)
  const registerBar = useCallback(() => {
    setHasBar(true)
    return () => setHasBar(false)
  }, [])
  if (reader.hasVoice === false) {
    return null
  }
  const contextValue: ReadAloudContextValue = { ...reader, registerBar }
  return (
    <ReadAloudContext.Provider value={contextValue}>
      {createElement(
        'div',
        {
          ...mergeProps(
            otherProps,
            reader.rootProps,
            hasBar ? { 'aria-label': reader.barLabel } : {},
          ),
          ref: mergedRef,
        },
        children,
      )}
    </ReadAloudContext.Provider>
  )
}
ReadAloudRoot.displayName = 'ReadAloud.Root'

function ReadAloudButton({
  part,
  pick,
  label,
  icon,
  children,
  ...otherProps
}: ReadAloudButtonProps & {
  part: string
  pick: (reader: UseReadAloudResult) => UseReadAloudResult['previousProps']
  label: (reader: UseReadAloudResult) => string
  icon: ReactNode
}): ReactElement {
  const reader = useReader(part)
  return createElement(
    'button',
    mergeProps(otherProps, pick(reader)),
    children ?? (
      <>
        {icon}
        {/* Visible text, never aria-hidden: the accessible name. A Bar hides it with CSS in its
         * default hybrid mode and its `--icons` choice class (0154 D9, D14); the panel never
         * does, and `kv-read-aloud--words` reveals it in a Bar too. */}
        <span className="kv-read-aloud-button-label">{label(reader)}</span>
      </>
    ),
  )
}

/**
 * Listen, Listen to selected text or Pause (also while fetching, so the wait can be stopped).
 * Space and Enter are the button's own. The icon (`play`/`pause`) and the three possible words
 * share one grid cell (`kv-read-aloud-play-icon`, `-label`, in `read-aloud.css`): the inactive
 * ones are `aria-hidden` and `visibility: hidden`, so the button's size never changes with the
 * word, and a second press never lands on Previous (2.5.3). Past the 300 ms busy threshold the
 * spinner takes the icon's cell, so nothing moves there either.
 */
export function ReadAloudPlay({ children, ...otherProps }: ReadAloudButtonProps): ReactElement {
  const reader = useReader('Play')
  const isPlayingOrPreparing = reader.status === 'playing' || reader.status === 'preparing'
  const isSpinnerVisible = 'data-busy' in reader.playProps
  return createElement(
    'button',
    mergeProps(otherProps, reader.playProps),
    children ?? (
      <>
        <span className="kv-read-aloud-play-icon" aria-hidden="true">
          {isSpinnerVisible ? (
            <span className="kv-spinner" />
          ) : (
            <Icon
              name={isPlayingOrPreparing ? 'pause' : 'play'}
              icon={isPlayingOrPreparing ? pause : play}
              size="20"
            />
          )}
        </span>
        <span className="kv-read-aloud-play-label">
          <span aria-hidden={isPlayingOrPreparing || reader.hasSelection ? 'true' : undefined}>
            {reader.playIdleLabel}
          </span>
          <span aria-hidden={isPlayingOrPreparing || !reader.hasSelection ? 'true' : undefined}>
            {reader.selectionLabel}
          </span>
          <span aria-hidden={isPlayingOrPreparing ? undefined : 'true'}>{reader.pauseLabel}</span>
        </span>
      </>
    ),
  )
}
ReadAloudPlay.displayName = 'ReadAloud.Play'

export function ReadAloudPrevious(props: ReadAloudButtonProps): ReactElement {
  return (
    <ReadAloudButton
      {...props}
      part="Previous"
      pick={(reader) => reader.previousProps}
      label={(reader) => reader.previousLabel}
      icon={<Icon name="skip-previous" icon={skipPrevious} size="20" />}
    />
  )
}
ReadAloudPrevious.displayName = 'ReadAloud.Previous'

export function ReadAloudNext(props: ReadAloudButtonProps): ReactElement {
  return (
    <ReadAloudButton
      {...props}
      part="Next"
      pick={(reader) => reader.nextProps}
      label={(reader) => reader.nextLabel}
      icon={<Icon name="skip-next" icon={skipNext} size="20" />}
    />
  )
}
ReadAloudNext.displayName = 'ReadAloud.Next'

export function ReadAloudStop(props: ReadAloudButtonProps): ReactElement {
  return (
    <ReadAloudButton
      {...props}
      part="Stop"
      pick={(reader) => reader.stopProps}
      label={(reader) => reader.stopLabel}
      icon={<Icon name="stop" icon={stop} size="20" />}
    />
  )
}
ReadAloudStop.displayName = 'ReadAloud.Stop'

/**
 * The cluster around Previous and Next (`div.kv-read-aloud-transport`): what creates the 8px gap
 * between them, the `1fr 1fr` grid below 40rem that keeps them equal and never split across
 * lines, and Stop's 36px separation from the cluster above that width. Purely structural: it
 * holds no state of its own, and renders no part prop beyond its class.
 */
export function ReadAloudTransport({
  ref,
  children,
  ...otherProps
}: ReadAloudTransportProps): ReactElement {
  useReader('Transport')
  const mergedRef = useMergedRef(ref, null)
  return createElement(
    'div',
    mergeProps(otherProps, { className: 'kv-read-aloud-transport', ref: mergedRef }),
    children,
  )
}
ReadAloudTransport.displayName = 'ReadAloud.Transport'

/**
 * The sentence meter: `aria-hidden`, not focusable, no `progressbar` or `slider` role and no
 * handle (D3, read-aloud.md §6) — the position lives in words in `ReadAloud.Status`, which is
 * the accessible cue (1.4.1, 4.1.2). Renders nothing while idle: nothing has been read yet, so
 * there is no position to show. Sets the measured custom property `--kv-read-aloud-progress`
 * (0 to 1) inline, the same way Toast sets its timer (`toast-region.tsx`): a value read-aloud.css
 * turns into the fill's width, never a choice the consumer makes.
 */
export function ReadAloudProgress({
  style,
  ref,
  ...otherProps
}: ReadAloudProgressProps): ReactElement | null {
  const reader = useReader('Progress')
  const mergedRef = useMergedRef(ref, null)
  if (reader.progressFraction === null) {
    return null
  }
  return createElement(
    'p',
    mergeProps(otherProps, {
      className: 'kv-read-aloud-progress',
      'aria-hidden': 'true' as const,
      style: { ...style, '--kv-read-aloud-progress': reader.progressFraction } as CSSProperties,
      ref: mergedRef,
    }),
    <span className="kv-read-aloud-progress-fill" />,
  )
}
ReadAloudProgress.displayName = 'ReadAloud.Progress'

/** A native `<select>` of the speeds, with a visible `<label>`. */
export function ReadAloudRate({ label, ...selectProps }: ReadAloudSelectProps): ReactElement {
  const reader = useReader('Rate')
  return (
    <>
      <label {...reader.rateLabelProps}>{label ?? reader.rateLabel}</label>
      <select {...mergeProps(selectProps, reader.rateProps)}>
        {reader.rateOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </>
  )
}
ReadAloudRate.displayName = 'ReadAloud.Rate'

/**
 * A native `<select>` of the voices for the language. Rendered only when there are two or more;
 * while the voice list has not arrived yet, shows `readAloud.voicesLoading` text instead. Not in
 * the recommended composition (D8): the list only arrives after the first press.
 */
export function ReadAloudVoice({
  label,
  ...selectProps
}: ReadAloudSelectProps): ReactElement | null {
  const reader = useReader('Voice')
  // B4 (Plan 0154): the Voice part is the one place other than the first press that genuinely
  // needs the voice list, so it loads it on mount rather than the player doing so eagerly for
  // every consumer. Idempotent: a repeated or concurrent mount never double-fetches. Depends on
  // `loadVoices` alone, a stable function per machine: `reader` is a fresh object every render.
  useEffect(() => {
    reader.loadVoices()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reader.loadVoices])
  if (reader.voicesStatus === 'loading') {
    return <span className="kv-read-aloud-voice-loading">{reader.voicesLoadingLabel}</span>
  }
  if (!reader.hasVoiceChoice) {
    return null
  }
  return (
    <>
      <label {...reader.voiceLabelProps}>{label ?? reader.voiceLabel}</label>
      <select {...mergeProps(selectProps, reader.voiceProps)}>
        {reader.voiceOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </>
  )
}
ReadAloudVoice.displayName = 'ReadAloud.Voice'

/**
 * A button next to a selection made with a pointer, in the top layer. It never takes focus and
 * is not a Tab stop: the keyboard path is Play. It runs what Play does for a selection.
 */
export function ReadAloudSelectionTrigger({
  children,
  ...otherProps
}: ReadAloudButtonProps): ReactElement | null {
  const reader = useReader('SelectionTrigger')
  if (!reader.isSelectionTriggerShown) {
    return null
  }
  return createElement(
    'button',
    mergeProps(otherProps, reader.selectionTriggerProps),
    children ?? reader.selectionLabel,
  )
}
ReadAloudSelectionTrigger.displayName = 'ReadAloud.SelectionTrigger'

/** Visible text, not a live region: the position, or why nothing is read. */
export function ReadAloudStatus({
  as,
  ref,
  children,
  ...otherProps
}: ReadAloudStatusProps): ReactElement {
  const reader = useReader('Status')
  const mergedRef = useMergedRef(ref, null)
  return renderPart({
    as: resolveAsTag({ part: 'ReadAloud.Status', as, allowedTags: statusTags }),
    defaultElement: 'span',
    partProps: {
      ...mergeProps(otherProps, reader.statusProps),
      ref: mergedRef,
      children: children ?? reader.statusText,
    },
  })
}
ReadAloudStatus.displayName = 'ReadAloud.Status'

/**
 * The privacy affordance: names who the text is sent to and that nothing is stored
 * (`readAloud.note`), with an optional `howItWorks` link to your own page. Part of the
 * recommended composition (D11). Renders nothing without `name` on `ReadAloud.Root`: there is no
 * sensible text to show without knowing who receives it.
 */
export function ReadAloudNote({
  howItWorksHref,
  children,
  ...otherProps
}: ReadAloudNoteProps): ReactElement | null {
  const reader = useReader('Note')
  if (reader.noteText === null) {
    return null
  }
  return (
    <p {...mergeProps(otherProps, reader.noteProps)}>
      {children ?? (
        <>
          {reader.noteText}
          {howItWorksHref !== undefined ? (
            <>
              {' '}
              <a className="kv-link" href={howItWorksHref}>
                {reader.howItWorksLabel}
              </a>
            </>
          ) : null}
        </>
      )}
    </p>
  )
}
ReadAloudNote.displayName = 'ReadAloud.Note'

/**
 * The shared Speed/Voice menu (Plan 0154 D8), a `Popover` so neither control sits behind a layer
 * that moves the page. One implementation, two call sites: standalone in the panel, or as
 * `<Toolbar.Item as={ReadAloud.Settings}>` in `ReadAloud.Bar`'s default composition, which is why
 * every prop (including `ref`) forwards straight onto the trigger — the one focusable control a
 * toolbar item needs. `children` replaces the popup's contents; the trigger (icon, name) is fixed.
 */
export function ReadAloudSettings({
  ref,
  howItWorksHref,
  children,
  ...otherProps
}: ReadAloudSettingsProps): ReactElement {
  const reader = useReader('Settings')
  return (
    <Popover.Root>
      <Popover.Trigger
        {...mergeProps(otherProps, {
          className: 'kv-button kv-button--icon-only kv-read-aloud-settings',
        })}
        ref={ref}
      >
        <Icon name="settings" icon={settings} size="20" />
        {/* A visible label span, like every other Bar control (0154), not `aria-label`: the
         * `--words` choice class only reveals text, and an `aria-label` has none to reveal, so
         * Settings alone would stay wordless in that mode. */}
        <span className="kv-read-aloud-button-label">{reader.settingsLabel}</span>
      </Popover.Trigger>
      <Popover.Popup aria-label={reader.settingsLabel} className="kv-read-aloud-settings-popup">
        {children ?? (
          <>
            <ReadAloudRate />
            <ReadAloudVoice />
            {/* The recipient sentence, always shown once `name` is known (Plan 0154, superseding
             * 0153 D11's placement): the library names no URL, the consumer names the recipient,
             * and this is the sentence that discharges that half of rule 7. The link is the
             * consumer's own explanation page — no href, no link; never invented here. */}
            <ReadAloudNote howItWorksHref={howItWorksHref} />
          </>
        )}
      </Popover.Popup>
    </Popover.Root>
  )
}
ReadAloudSettings.displayName = 'ReadAloud.Settings'

/**
 * Collapses `ReadAloud.Bar` to its one Play button for the rest of this page view (no storage,
 * Plan 0154 D13). Renders nothing once reading has started: hiding the only Pause while audio
 * runs would break 2.2.2, and a bar dismissed into nothing leaves no way back. The collapse
 * itself is the Bar's own state; give this an `onClick` that sets it (the Bar's default
 * composition already does).
 */
export function ReadAloudHide({
  children,
  ...otherProps
}: ReadAloudHideProps): ReactElement | null {
  const reader = useReader('Hide')
  if (reader.status !== 'idle') {
    return null
  }
  return createElement(
    'button',
    mergeProps(otherProps, reader.hideProps),
    children ?? <Icon name="close" icon={close} size="20" />,
  )
}
ReadAloudHide.displayName = 'ReadAloud.Hide'

/**
 * The idle panel's expansion (D13, read-aloud.md "The idle panel"): renders `children` once
 * reading has started, nothing before. Reads the Root it is mounted in through context, so the
 * composition stays one machine — no second `useReadAloud` call to go out of sync with the one
 * Play actually drives. Plain children, not a render prop: the reader's state is never a prop a
 * consumer needs to thread through.
 */
export function ReadAloudWhenStarted({ children }: ReadAloudWhenStartedProps): ReactElement | null {
  const reader = useReader('WhenStarted')
  if (!reader.hasEverPlayed) {
    return null
  }
  return <>{children}</>
}
ReadAloudWhenStarted.displayName = 'ReadAloud.WhenStarted'

/**
 * The site-wide player (Plan 0154, concept J): a `Toolbar` so Previous, Play, Next, Stop and
 * Settings are **one** Tab stop with arrow-key navigation, not five — the only reason a bar at
 * the top of every page, before the site's own nav, is acceptable (2.4.3). No lede and no meter
 * (D12): the word "Listen" on Play is the entry point, and the count (`ReadAloud.Status`) is
 * empty while idle and reads the position once playing, same as the panel. Static by default;
 * sticky only while playing is a theme rule (`read-aloud.css`), never this part's concern.
 * Dismissing with Hide collapses to one Play button, in the same place, and moves focus there.
 */
export function ReadAloudBar({
  ref,
  howItWorksHref,
  children,
  ...otherProps
}: ReadAloudBarProps): ReactElement {
  const reader = useReader('Bar')
  const mergedRef = useMergedRef(ref, null)
  const playRef = useRef<HTMLButtonElement | null>(null)
  const [isDismissed, setIsDismissed] = useState(false)
  // No role or name of its own (Plan 0154, superseding the nested-group draft): Root's own
  // group *is* the Bar's group, and it takes `readAloud.barLabel` instead of `readAloud.label`
  // for as long as a Bar is mounted inside it. `registerBar` alone, not `reader` (a fresh object
  // every render, `contextValue` in `ReadAloudRoot`): otherwise this effect re-runs every render.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => reader.registerBar(), [reader.registerBar])
  useEffect(() => {
    if (isDismissed) {
      playRef.current?.focus()
    }
  }, [isDismissed])
  if (isDismissed) {
    return createElement(
      'div',
      mergeProps(otherProps, { className: 'kv-read-aloud-bar', ref: mergedRef }),
      <ReadAloudPlay ref={playRef} />,
    )
  }
  return createElement(
    'div',
    mergeProps(otherProps, { className: 'kv-read-aloud-bar', ref: mergedRef }),
    children ?? (
      <>
        <Toolbar.Root aria-label={reader.toolbarLabel} className="kv-toolbar kv-read-aloud-toolbar">
          <Toolbar.Item as={ReadAloudPrevious} />
          <Toolbar.Item as={ReadAloudPlay} ref={playRef} />
          <Toolbar.Item as={ReadAloudNext} />
          <Toolbar.Item as={ReadAloudStop} />
          <Toolbar.Item as={ReadAloudSettings} howItWorksHref={howItWorksHref} />
        </Toolbar.Root>
        <ReadAloudStatus as="p" className="kv-read-aloud-count" />
        <ReadAloudHide onClick={() => setIsDismissed(true)} />
      </>
    ),
  )
}
ReadAloudBar.displayName = 'ReadAloud.Bar'

export const ReadAloud = {
  Root: ReadAloudRoot,
  Progress: ReadAloudProgress,
  Play: ReadAloudPlay,
  Transport: ReadAloudTransport,
  Previous: ReadAloudPrevious,
  Next: ReadAloudNext,
  Stop: ReadAloudStop,
  Rate: ReadAloudRate,
  Voice: ReadAloudVoice,
  Status: ReadAloudStatus,
  Note: ReadAloudNote,
  SelectionTrigger: ReadAloudSelectionTrigger,
  Bar: ReadAloudBar,
  Settings: ReadAloudSettings,
  Hide: ReadAloudHide,
  WhenStarted: ReadAloudWhenStarted,
}
