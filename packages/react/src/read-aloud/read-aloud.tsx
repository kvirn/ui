'use client'
import type { ReactElement, ReactNode, Ref, RefCallback } from 'react'
import type { ComponentPropsWithRef, HTMLAttributes } from 'react'
import { mergeProps } from '../merge-props/merge-props.ts'
import { useMergedRef } from '../merge-props/use-merged-ref.ts'
import { renderPart } from '../render/render-part.ts'
import type { RenderProp } from '../render/render-part.ts'
import { ReadAloudContext } from './read-aloud-context.ts'
import { useReadAloud } from './use-read-aloud.ts'
import type { UseReadAloudOptions, UseReadAloudResult } from './use-read-aloud.ts'
import { useContext } from 'react'

/** What `render` receives as its second argument. */
export interface ReadAloudPartState {
  status: UseReadAloudResult['status']
}

export interface ReadAloudElementProps extends HTMLAttributes<HTMLElement> {
  ref: RefCallback<HTMLElement>
}

type PartRender = RenderProp<ReadAloudElementProps, ReadAloudPartState> | undefined

export interface ReadAloudRootProps
  extends UseReadAloudOptions, Omit<HTMLAttributes<HTMLElement>, 'onKeyDown'> {
  ref?: Ref<HTMLElement> | undefined
  render?: PartRender
  children?: ReactNode
}

export interface ReadAloudButtonProps extends ComponentPropsWithRef<'button'> {
  /** Your own text. Replaces the message, so its language is yours to set. */
  children?: ReactNode
  render?: RenderProp<ReadAloudElementProps, ReadAloudPartState> | undefined
}

export interface ReadAloudSelectProps extends Omit<ComponentPropsWithRef<'select'>, 'children'> {
  /** The visible label. Replaces the message `readAloud.rate` or `readAloud.voice`. */
  label?: ReactNode
  render?: RenderProp<ReadAloudElementProps, ReadAloudPartState> | undefined
}

export interface ReadAloudStatusProps extends HTMLAttributes<HTMLElement> {
  ref?: Ref<HTMLElement> | undefined
  render?: PartRender
}

function useReader(part: string): UseReadAloudResult {
  const reader = useContext(ReadAloudContext)
  if (reader === null) {
    throw new Error(`<ReadAloud.${part}> must be used inside <ReadAloud.Root>.`)
  }
  return reader
}

/** The group: `role="group"` named by `readAloud.label`. Put the player's parts in it. */
export function ReadAloudRoot({
  contentRef,
  lang,
  engine,
  allowRemoteVoices,
  highlight,
  scroll,
  messages,
  onStatusChange,
  render,
  ref,
  children,
  ...otherProps
}: ReadAloudRootProps): ReactElement {
  const reader = useReadAloud({
    contentRef,
    lang,
    engine,
    allowRemoteVoices,
    highlight,
    scroll,
    messages,
    onStatusChange,
  })
  const mergedRef = useMergedRef(ref, null)
  return (
    <ReadAloudContext.Provider value={reader}>
      {renderPart({
        render,
        defaultElement: 'div',
        partProps: { ...mergeProps(otherProps, reader.rootProps), ref: mergedRef, children },
        state: { status: reader.status },
      })}
    </ReadAloudContext.Provider>
  )
}
ReadAloudRoot.displayName = 'ReadAloud.Root'

function ReadAloudButton({
  part,
  pick,
  label,
  children,
  render,
  ...otherProps
}: ReadAloudButtonProps & {
  part: string
  pick: (reader: UseReadAloudResult) => UseReadAloudResult['previousProps']
  label: (reader: UseReadAloudResult) => string
}): ReactElement | null {
  const reader = useReader(part)
  if (!reader.isSupported) {
    return null
  }
  return renderPart({
    render: render as RenderProp<object, ReadAloudPartState> | undefined,
    defaultElement: 'button',
    partProps: { ...mergeProps(otherProps, pick(reader)), children: children ?? label(reader) },
    state: { status: reader.status },
  })
}

/** Listen, Listen to selected text or Pause. Space and Enter are the button's own. */
export function ReadAloudPlay(props: ReadAloudButtonProps): ReactElement | null {
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

export function ReadAloudPrevious(props: ReadAloudButtonProps): ReactElement | null {
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

export function ReadAloudNext(props: ReadAloudButtonProps): ReactElement | null {
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

export function ReadAloudStop(props: ReadAloudButtonProps): ReactElement | null {
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
export function ReadAloudRate({
  label,
  ...selectProps
}: ReadAloudSelectProps): ReactElement | null {
  const reader = useReader('Rate')
  if (!reader.isSupported) {
    return null
  }
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

/** A native `<select>` of the voices for the language. Rendered only when there are two or more. */
export function ReadAloudVoice({
  label,
  ...selectProps
}: ReadAloudSelectProps): ReactElement | null {
  const reader = useReader('Voice')
  if (!reader.isSupported || !reader.hasVoiceChoice) {
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
  render,
  ...otherProps
}: ReadAloudButtonProps): ReactElement | null {
  const reader = useReader('SelectionTrigger')
  if (!reader.isSupported || !reader.isSelectionTriggerShown) {
    return null
  }
  return renderPart({
    render: render as RenderProp<object, ReadAloudPartState> | undefined,
    defaultElement: 'button',
    partProps: {
      ...mergeProps(otherProps, reader.selectionTriggerProps),
      children: children ?? reader.selectionLabel,
    },
    state: { status: reader.status },
  })
}
ReadAloudSelectionTrigger.displayName = 'ReadAloud.SelectionTrigger'

/** Visible text, not a live region: the position, or why nothing is read. */
export function ReadAloudStatus({
  render,
  ref,
  children,
  ...otherProps
}: ReadAloudStatusProps): ReactElement {
  const reader = useReader('Status')
  const mergedRef = useMergedRef(ref, null)
  return renderPart({
    render,
    defaultElement: 'span',
    partProps: {
      ...mergeProps(otherProps, reader.statusProps),
      ref: mergedRef,
      children: children ?? reader.statusText,
    },
    state: { status: reader.status },
  })
}
ReadAloudStatus.displayName = 'ReadAloud.Status'

export const ReadAloud = {
  Root: ReadAloudRoot,
  Play: ReadAloudPlay,
  Previous: ReadAloudPrevious,
  Next: ReadAloudNext,
  Stop: ReadAloudStop,
  Rate: ReadAloudRate,
  Voice: ReadAloudVoice,
  Status: ReadAloudStatus,
  SelectionTrigger: ReadAloudSelectionTrigger,
}
