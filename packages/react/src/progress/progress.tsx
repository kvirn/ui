'use client'
import { useContext, useEffect } from 'react'
import type { ComponentPropsWithRef, ReactElement } from 'react'
import { warnOnce } from '../dev/dev-warning.ts'
import { mergeProps } from '../merge-props/merge-props.ts'
import { useFormat } from '../provider/use-format.ts'
import { renderPart } from '../render/render-part.ts'
import type { RenderProp } from '../render/render-part.ts'
import { ProgressContext } from './progress-context.ts'
import { useProgress } from './use-progress.ts'
import type { UseProgressOptions } from './use-progress.ts'

/** What `render` receives as its second argument for the Root. */
export interface ProgressState {
  isSlow: boolean
  isDeterminate: boolean
}

export interface ProgressRootProps
  extends ComponentPropsWithRef<'div'>, Omit<UseProgressOptions, 'messages'> {
  /** Per-instance message overrides: `{ slow: 'Det här tar tid. Stäng inte sidan.' }`. */
  messages?: UseProgressOptions['messages']
  render?: RenderProp<ComponentPropsWithRef<'div'>, ProgressState> | undefined
}

export interface ProgressLabelProps extends ComponentPropsWithRef<'p'> {
  /** Another text than the Root's `label`. It names the bar, so keep it the same words. */
  children?: ComponentPropsWithRef<'p'>['children']
  render?: RenderProp<ComponentPropsWithRef<'p'>, ProgressState> | undefined
}

export interface ProgressBarProps extends Omit<
  ComponentPropsWithRef<'progress'>,
  'value' | 'max' | 'aria-labelledby'
> {
  render?: RenderProp<ComponentPropsWithRef<'progress'>, ProgressState> | undefined
}

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
 * seconds, and no spinner (contract: progress.a11y.md). Renders nothing until it is shown.
 * Put it where the result will appear, or beside the busy button. Needs a `KvirnProvider`
 * to announce.
 *
 * @example
 * <Progress.Root label="Sending your application.">
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
  render,
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
      {renderPart({
        render,
        defaultElement: 'div',
        partProps: { ...mergeProps(otherProps, progress.rootProps), ref, children },
        state: { isSlow: progress.isSlow, isDeterminate: progress.percent !== undefined },
      })}
    </ProgressContext.Provider>
  )
}
ProgressRoot.displayName = 'Progress.Root'

/**
 * The visible text: the label, then the percent when the value is known, then the slow
 * sentence. Only the label names the bar. It is plain text, never a live region.
 */
export function ProgressLabel({
  render,
  children,
  ref,
  ...otherProps
}: ProgressLabelProps): ReactElement | null {
  const progress = useProgressContext('Label')
  const format = useFormat()
  if (progress === null) {
    return null
  }
  return renderPart({
    render,
    defaultElement: 'p',
    partProps: {
      ...mergeProps(otherProps, progress.labelProps),
      ref,
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
    state: { isSlow: progress.isSlow, isDeterminate: progress.percent !== undefined },
  })
}
ProgressLabel.displayName = 'Progress.Label'

/** A native `<progress>`, named by the label. Renders only when the Root has a numeric `value`. */
export function ProgressBar({ render, ref, ...otherProps }: ProgressBarProps): ReactElement | null {
  const progress = useProgressContext('Bar')
  if (progress === null || progress.barProps === undefined) {
    return null
  }
  return renderPart({
    render,
    defaultElement: 'progress',
    partProps: { ...mergeProps(otherProps, progress.barProps), ref },
    state: { isSlow: progress.isSlow, isDeterminate: true },
  })
}
ProgressBar.displayName = 'Progress.Bar'

export const Progress = {
  Root: ProgressRoot,
  Label: ProgressLabel,
  Bar: ProgressBar,
} as const
