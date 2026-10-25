'use client'
import { createElement } from 'react'
import type { ReactElement, ReactNode, Ref } from 'react'
import type { ComponentPropsWithRef, HTMLAttributes } from 'react'
import { mergeProps } from '@kvirn-ui/react'
import { renderPart, resolveAsTag, useMergedRef } from '@kvirn-ui/react/internal'
import type { AsTag } from '@kvirn-ui/react/internal'
import { ReadAloudContext } from './read-aloud-context.ts'
import { useReadAloud } from './use-read-aloud.ts'
import type { UseReadAloudOptions, UseReadAloudResult } from './use-read-aloud.ts'
import { useContext } from 'react'

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

export interface ReadAloudNoteProps extends ComponentPropsWithRef<'p'> {
  /** Shown as a `readAloud.howItWorks` link at the end of the note, pointing at your own page. Omit it for no link. */
  howItWorksHref?: string | undefined
  children?: ReactNode
}

/** `as` is `span` (default), `p` or `div`. Visible text, never a heading or a live region. */
export type ReadAloudStatusProps = AsTag<(typeof statusTags)[number], 'span'>

function useReader(part: string): UseReadAloudResult {
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
  if (reader.hasVoice === false) {
    return null
  }
  return (
    <ReadAloudContext.Provider value={reader}>
      {createElement(
        'div',
        { ...mergeProps(otherProps, reader.rootProps), ref: mergedRef },
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
  children,
  ...otherProps
}: ReadAloudButtonProps & {
  part: string
  pick: (reader: UseReadAloudResult) => UseReadAloudResult['previousProps']
  label: (reader: UseReadAloudResult) => string
}): ReactElement {
  const reader = useReader(part)
  return createElement('button', mergeProps(otherProps, pick(reader)), children ?? label(reader))
}

/** Listen, Listen to selected text or Pause (also while fetching, so the wait can be stopped). Space and Enter are the button's own. */
export function ReadAloudPlay(props: ReadAloudButtonProps): ReactElement {
  return (
    <ReadAloudButton
      {...props}
      part="Play"
      pick={(reader) => reader.playProps}
      label={(reader) => reader.playLabel}
    />
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
    />
  )
}
ReadAloudStop.displayName = 'ReadAloud.Stop'

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

export const ReadAloud = {
  Root: ReadAloudRoot,
  Play: ReadAloudPlay,
  Previous: ReadAloudPrevious,
  Next: ReadAloudNext,
  Stop: ReadAloudStop,
  Rate: ReadAloudRate,
  Voice: ReadAloudVoice,
  Status: ReadAloudStatus,
  Note: ReadAloudNote,
  SelectionTrigger: ReadAloudSelectionTrigger,
}
