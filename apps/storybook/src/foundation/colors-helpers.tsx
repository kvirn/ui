import { contrastRequirements } from '@kvirn-ui/theme'
import type {
  ColorTokenName,
  ContrastMinimum,
  ContrastRequirement,
  ThemeName,
} from '@kvirn-ui/theme'
import type { ReactNode, Ref } from 'react'
import { formatRatio } from './foundation-helpers.tsx'

// Shared by the three Foundation/Colors pages (docs/design/foundations-and-prose.md §6.6 and
// §7). Storybook tooling, in English. Colour is never the only signal: every value, ratio,
// tier and "In use" is text, and the swatches and chips are aria-hidden.

/** A Foundation page whose root is read live: the same markup as FoundationPage, with a ref. */
export function ColorsPage({
  title,
  pageRef,
  children,
}: {
  title: string
  pageRef: Ref<HTMLElement>
  children?: ReactNode
}): ReactNode {
  return (
    <main ref={pageRef} lang="en" className="kv-story-foundation kv-prose">
      <h1>{title}</h1>
      {children}
    </main>
  )
}

/** A token name as code, such as `text-muted`. */
export const TokenCode = ({ name }: { name: string }): ReactNode => <code>{name}</code>

/** The three thresholds, in words, so no colour key is needed (1.4.1). */
export function tierText(ratio: number): string {
  if (ratio >= 7) {
    return '7:1 or more'
  }
  if (ratio >= 4.5) {
    return '4.5:1 or more'
  }
  if (ratio >= 3) {
    return '3:1 or more'
  }
  return 'Below 3:1'
}

export const minimumText = (minimum: ContrastMinimum): string => `${minimum}:1`

export const isTextMinimum = (minimum: ContrastMinimum): boolean => minimum !== 3

/** A warning sign. Decorative: the words next to it carry the meaning. */
function FailIcon(): ReactNode {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width={16}
      height={16}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinejoin="round"
    >
      <path d="M8 1.75 14.75 14H1.25Z" />
      <path d="M8 6v4M8 11.5v1" strokeLinecap="round" />
    </svg>
  )
}

/** An in-use pair below its minimum: words, an icon and weight 600, in `danger`. */
export function FailText({ minimum }: { minimum: ContrastMinimum }): ReactNode {
  return (
    <span className="kv-story-fail">
      <FailIcon />
      Fails: needs {minimumText(minimum)}
    </span>
  )
}

export const cannotMeasureText = 'Can’t measure'

/** A requirement measured with the page's live colours. */
export interface MeasuredRequirement extends ContrastRequirement {
  ratio: number | undefined
}

export type RequirementResult = 'pass' | 'fail' | 'unmeasured'

export const resultOf = ({ ratio, minimum }: MeasuredRequirement): RequirementResult => {
  if (ratio === undefined) {
    return 'unmeasured'
  }
  return ratio >= minimum ? 'pass' : 'fail'
}

/** Whether `contrast-requirements.ts` measures this pair in a theme. */
export function requirementFor(
  theme: ThemeName,
  foreground: ColorTokenName,
  background: ColorTokenName,
): ContrastRequirement | undefined {
  return contrastRequirements[theme].find(
    (requirement) => requirement.foreground === foreground && requirement.background === background,
  )
}

/** The ratio as text, or "Can't measure": never a guessed value. */
export const ratioText = (ratio: number | undefined): string =>
  ratio === undefined ? cannotMeasureText : formatRatio(ratio)
