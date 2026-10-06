import { createProgressTimer } from '@kvirn-ui/core'
import type { ProgressPhase } from '@kvirn-ui/core'
import type { KvirnMessages } from '@kvirn-ui/i18n'
import { useEffect, useId, useRef, useState } from 'react'
import { useQuietAnnouncer, warnAnnouncerMissing } from '../announcer/use-announcer.ts'
import { warnOnce } from '../dev/dev-warning.ts'
import { useEnv } from '../provider/use-env.ts'
import { useMessages } from '../provider/use-messages.ts'

export interface UseProgressOptions {
  /**
   * What is happening, as a short sentence that ends with a full stop: `Sending your
   * application.` It names the bar and is announced once. Without it the message
   * `progress.loading` is used and a development warning asks for a specific label.
   */
  label?: string | undefined
  /**
   * How far along, when you know it. The bar renders only with a number, and shows no
   * movement for an unknown wait: the label alone says it is working.
   */
  value?: number | undefined
  /** The value that means done. Default 100. */
  max?: number | undefined
  /** How long a wait stays invisible, so a quick one never flashes. Default 1000. */
  delayMilliseconds?: number | undefined
  /** When, counted from mounting, the slow sentence is added. `false` never. Default 10000. */
  slowAfterMilliseconds?: number | false | undefined
  /**
   * Announces the label once when it is shown, and the slow sentence once when it becomes slow,
   * through the shared Announcer (4.1.3). Set `false` when focus already reads the state or
   * another part announces it. Default `true`. The percent is never announced.
   */
  announce?: boolean | undefined
  /** Per-instance message overrides: `{ slow: 'Det här tar tid. Stäng inte sidan.' }`. */
  messages?: Partial<KvirnMessages['progress']> | undefined
}

/** Spread on the Root's element. */
export interface ProgressRootPartProps {
  /** The part's class, for `@kvirn-ui/theme` and your own CSS: `.kv-progress`. */
  className: 'kv-progress'
  'data-state': 'busy' | 'slow'
  'data-determinate'?: ''
}

/** Spread on the element around the label text. */
export interface ProgressLabelPartProps {
  className: 'kv-progress-label'
}

/** Spread on a `<progress>`. Present only with a numeric `value`. */
export interface ProgressBarPartProps {
  className: 'kv-progress-bar'
  value: number
  max: number
  /** The label text only: the value already says the percent, and the slow sentence is not a name. */
  'aria-labelledby': string
  'aria-valuetext': string
}

export interface UseProgressResult {
  /** `false` while the wait is still inside the show delay: render nothing. */
  isShown: boolean
  /** `true` once the wait passed the slow limit. */
  isSlow: boolean
  /** The id for the element that holds the label text, which names the bar. */
  labelId: string
  /** `label`, or the message `progress.loading`. */
  label: string
  /** The message `progress.slow`. Show it after the label when `isSlow`. */
  slowText: string
  /** The value as a whole percent, 0 to 100. `undefined` without a `value`. */
  percent: number | undefined
  rootProps: ProgressRootPartProps
  labelProps: ProgressLabelPartProps
  /** `undefined` without a numeric `value`: an unknown wait has no bar. */
  barProps: ProgressBarPartProps | undefined
}

/**
 * A wait's behaviour for your own markup (contract: progress.a11y.md): hidden for the first
 * second, shown and announced once, a slow sentence after ten seconds, and a native bar only
 * when the value is known. Render nothing while `isShown` is `false`.
 *
 * @example
 * const progress = useProgress({ label: 'Sending your application.' })
 * if (!progress.isShown) return null
 * return <p {...progress.labelProps}><span id={progress.labelId}>{progress.label}</span></p>
 */
export function useProgress({
  label,
  value,
  max = 100,
  delayMilliseconds,
  slowAfterMilliseconds,
  announce = true,
  messages,
}: UseProgressOptions = {}): UseProgressResult {
  const progressMessages = useMessages('progress', messages)
  const env = useEnv()
  const { announce: say, isAvailable } = useQuietAnnouncer()
  const id = useId()
  const labelId = `${id}-label`
  const [phase, setPhase] = useState<ProgressPhase>('waiting')
  const announcedPhase = useRef<ProgressPhase>('waiting')

  useEffect(() => {
    const timer = createProgressTimer(env, { delayMilliseconds, slowAfterMilliseconds })
    const unsubscribe = timer.subscribe(() => setPhase(timer.getState().phase))
    timer.actions.start()
    return () => {
      unsubscribe()
      timer.actions.stop()
    }
  }, [env, delayMilliseconds, slowAfterMilliseconds])

  const text = label ?? progressMessages.loading
  const slowText = progressMessages.slow

  useEffect(() => {
    if (label === undefined) {
      warnOnce(
        'progress-without-label',
        'A Progress has no label, so it says only "Loading." Name what is happening and end with a full stop: label="Sending your application." (WCAG 4.1.2, 2.4.6).',
      )
    }
  }, [label])

  useEffect(() => {
    if (phase === 'waiting') {
      announcedPhase.current = 'waiting'
      return
    }
    if (!announce || announcedPhase.current === phase) {
      return
    }
    // A jump straight to slow (the limit is inside the delay, or two timers batched) says both,
    // so the label is never lost.
    const wasShownAnnounced = announcedPhase.current === 'shown'
    announcedPhase.current = phase
    if (!isAvailable) {
      warnAnnouncerMissing()
      return
    }
    if (phase === 'shown') {
      say(text, { key: id })
    } else {
      // Its own key: the throttle on the label's key would drop a slow sentence that follows it
      // within 3 s.
      say(wasShownAnnounced ? slowText : `${text} ${slowText}`, { key: `${id}-slow` })
    }
  }, [phase, announce, isAvailable, say, text, slowText, id])

  const isDeterminate = value !== undefined
  const percent = isDeterminate
    ? Math.round(Math.min(Math.max(max > 0 ? (value / max) * 100 : 0, 0), 100))
    : undefined

  return {
    isShown: phase !== 'waiting',
    isSlow: phase === 'slow',
    labelId,
    label: text,
    slowText,
    percent,
    rootProps: {
      className: 'kv-progress',
      'data-state': phase === 'slow' ? 'slow' : 'busy',
      ...(isDeterminate ? { 'data-determinate': '' } : {}),
    },
    labelProps: { className: 'kv-progress-label' },
    barProps:
      percent === undefined || value === undefined
        ? undefined
        : {
            className: 'kv-progress-bar',
            value,
            max,
            'aria-labelledby': labelId,
            // The label ends with its full stop, which would read "Exporting cases., 45%".
            'aria-valuetext': progressMessages.valueText({
              label: text.replace(/[.。]$/, ''),
              percent,
            }),
          },
  }
}
