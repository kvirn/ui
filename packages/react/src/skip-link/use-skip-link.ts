import type { KvirnMessages } from '@kvirn-ui/i18n'
import { useEffect } from 'react'
import type { MouseEvent } from 'react'
import { warnOnce } from '../dev/dev-warning.ts'
import { useEnv } from '../provider/use-env.ts'
import { useMessages } from '../provider/use-messages.ts'

export interface UseSkipLinkOptions {
  /** A same-page address, `#main`: the id of the element the link jumps to. */
  href: string
  /** Per-instance message overrides: `{ label: 'Hoppa till innehållet' }`. */
  messages?: Partial<KvirnMessages['skipLink']> | undefined
}

/** Spread on the `<a>`. */
export interface SkipLinkPartProps {
  /**
   * The part's class, for `@kvirn-ui/theme` and your own CSS: `.kv-skip-link`. Add a class of
   * your own next to it with `mergeProps`: class names join.
   */
  className: 'kv-skip-link'
  /** From the option. */
  href: string
  /** Moves focus to the target. It does not prevent the browser's own jump. */
  onClick: (event: MouseEvent<HTMLAnchorElement>) => void
}

export interface UseSkipLinkResult {
  skipLinkProps: SkipLinkPartProps
  /** The message `skipLink.label`: the default text of the link. */
  label: string
}

function getTargetId(href: string): string | undefined {
  if (!href.startsWith('#') || href.length === 1) {
    return undefined
  }
  try {
    return decodeURIComponent(href.slice(1))
  } catch {
    return href.slice(1)
  }
}

/**
 * A bypass link's props and label (contract: skip-link.a11y.md). Spread the props on your own
 * `<a>`, first in the body, and give the main content the id.
 *
 * - **Activation** focuses the target, and gives it `tabindex="-1"` until it loses focus when it
 *   isn't focusable, so the next Tab continues inside it. The native jump still happens.
 * - **A missing target** warns in development (`skip-link-target-missing:<id>`).
 *
 * @example
 * const { skipLinkProps, label } = useSkipLink({ href: '#main' })
 * <a {...skipLinkProps}>{label}</a>
 * <main id="main">…</main>
 */
export function useSkipLink({ href, messages }: UseSkipLinkOptions): UseSkipLinkResult {
  const env = useEnv()
  const skipLinkMessages = useMessages('skipLink', messages)
  const targetId = getTargetId(href)

  useEffect(() => {
    if (env === undefined || targetId === undefined) {
      return
    }
    if (env.document.getElementById(targetId) === null) {
      warnOnce(
        `skip-link-target-missing:${targetId}`,
        `SkipLink href="#${targetId}" has no element with that id on the page, so the link goes nowhere (2.4.1). Put id="${targetId}" on the main content.`,
      )
    }
  }, [env, targetId])

  const onClick = () => {
    if (env === undefined || targetId === undefined) {
      return
    }
    const target = env.document.getElementById(targetId)
    if (target === null) {
      return
    }
    // A div or main has a tabIndex of -1 without the attribute, so the attribute is what tells.
    if (target.tabIndex < 0 && !target.hasAttribute('tabindex')) {
      target.setAttribute('tabindex', '-1')
      target.addEventListener('blur', () => target.removeAttribute('tabindex'), { once: true })
    }
    target.focus()
  }

  return {
    skipLinkProps: { className: 'kv-skip-link', href, onClick },
    label: skipLinkMessages.label,
  }
}
