'use client'
import { createElement, useContext, useEffect } from 'react'
import { useMergedRef } from '../merge-props/use-merged-ref.ts'
import type { ComponentPropsWithRef, ReactElement } from 'react'
import { warnOnce } from '../dev/dev-warning.ts'
import { mergeProps } from '../merge-props/merge-props.ts'
import { useFormat } from '../provider/use-format.ts'
import { resolveAsTag } from '../render/as-prop.ts'
import type { AsTag } from '../render/as-prop.ts'
import { renderPart } from '../render/render-part.ts'
import { ProgressContext } from './progress-context.ts'
import { useProgress } from './use-progress.ts'
import type { UseProgressOptions } from './use-progress.ts'

const labelTags = ['p', 'div', 'span'] as const

export interface ProgressRootProps
  extends ComponentPropsWithRef<'div'>, Omit<UseProgressOptions, 'messages'> {
  /** Per-instance message overrides: `{ slow: 'Det här tar tid. Stäng inte sidan.' }`. */
  messages?: UseProgressOptions['messages']
}

interface ProgressLabelOwnProps {
  /** Another text than the Root's `label`. It names the bar, so keep it the same words. */
  children?: ComponentPropsWithRef<'p'>['children']
}

/** `as` is `p` (default), `div`, or `span` beside a busy button. It is plain text, never a heading. */
export type ProgressLabelProps = AsTag<(typeof labelTags)[number], 'p', ProgressLabelOwnProps>

export type ProgressBarProps = Omit<
  ComponentPropsWithRef<'progress'>,
  'value' | 'max' | 'aria-labelledby'
>

export type ProgressIndicatorProps = ComponentPropsWithRef<'span'>

function useProgressContext(partName: string): ReturnType<typeof useProgress> | null {
  const progress = useContext(ProgressContext)
  useEffect(() => {
    if (progress === null) {
      warnOnce(
        `progress-${partName}-outside-root`,
        `Progress.${partName} was rendered outside Progress.Root, so it renders nothing.`,
      )
    }
  }, [progress, partName])
  return progress
}

/**
 * A wait that is shown only after a second, announced once, with a slow sentence after ten
 * seconds (contract: progress.a11y.md). Renders nothing until it is shown.
 * Put it where the result will appear, or beside the busy button. Needs a `KvirnProvider`
 * to announce.
 *
 * @example
 * <Progress.Root label="Sending your application.">
 *   <Progress.Indicator />
 *   <Progress.Label />
 * </Progress.Root>
 *
 * @example
 * <Progress.Root label="Exporting cases." value={percent}>
 *   <Progress.Label />
 *   <Progress.Bar />
 * </Progress.Root>
 */
export function ProgressRoot({
  label,
  value,
  max,
  delayMilliseconds,
  slowAfterMilliseconds,
  announce,
  messages,
  children,
  ref,
  ...otherProps
}: ProgressRootProps): ReactElement | null {
  const progress = useProgress({
    label,
    value,
    max,
    delayMilliseconds,
    slowAfterMilliseconds,
    announce,
    messages,
  })
  if (!progress.isShown) {
    return null
  }
  return (
    <ProgressContext.Provider value={progress}>
      {createElement('div', { ...mergeProps(otherProps, progress.rootProps), ref }, children)}
    </ProgressContext.Provider>
  )
}
ProgressRoot.displayName = 'Progress.Root'

/**
 * The visible text: the label, then the percent when the value is known, then the slow
 * sentence. Only the label names the bar. It is plain text, never a live region.
 */
export function ProgressLabel({
  as,
  children,
  ref,
  ...otherProps
}: ProgressLabelProps): ReactElement | null {
  const progress = useProgressContext('Label')
  const format = useFormat()
  const elementRef = useMergedRef(ref, null)
  if (progress === null) {
    return null
  }
  return renderPart({
    as: resolveAsTag({ part: 'Progress.Label', as, allowedTags: labelTags }),
    defaultElement: 'p',
    partProps: {
      ...mergeProps(otherProps, progress.labelProps),
      ref: elementRef,
      children: (
        <>
          <span id={progress.labelId}>{children ?? progress.label}</span>
          {progress.percent === undefined ? null : (
            <span className="kv-progress-percent">
              {' '}
              {format.number(progress.percent / 100, { style: 'percent' })}
            </span>
          )}
          {progress.isSlow ? <span className="kv-progress-slow"> {progress.slowText}</span> : null}
        </>
      ),
    },
  })
}
ProgressLabel.displayName = 'Progress.Label'

/**
 * A native `<progress>`, named by the label. Renders only when the Root has a numeric `value`.
 */
export function ProgressBar({ ref, ...otherProps }: ProgressBarProps): ReactElement | null {
  const progress = useProgressContext('Bar')
  const elementRef = useMergedRef(ref, null)
  if (progress === null || progress.barProps === undefined) {
    return null
  }
  return createElement('progress', {
    ...mergeProps(otherProps, progress.barProps),
    ref: elementRef,
  })
}
ProgressBar.displayName = 'Progress.Bar'

/**
 * The spinner of an unknown wait: a decorative `aria-hidden` span, a direct child of the Root
 * before the label. Renders nothing when the Root has a `value` (the `<progress>` is the one
 * indicator) and never takes focus.
 */
export function ProgressIndicator({
  ref,
  ...otherProps
}: ProgressIndicatorProps): ReactElement | null {
  const progress = useProgressContext('Indicator')
  const elementRef = useMergedRef(ref, null)
  if (progress === null || progress.percent !== undefined) {
    return null
  }
  return createElement('span', {
    ...mergeProps(otherProps, { className: 'kv-spinner', 'aria-hidden': true }),
    ref: elementRef,
  })
}
ProgressIndicator.displayName = 'Progress.Indicator'

export const Progress = {
  Root: ProgressRoot,
  Indicator: ProgressIndicator,
  Label: ProgressLabel,
  Bar: ProgressBar,
} as const
