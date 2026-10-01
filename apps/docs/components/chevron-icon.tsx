/** A 16px outline chevron. Decorative: the toggle's state is `aria-expanded`. */
export function ChevronIcon() {
  return (
    <svg
      className="docs-chevron"
      aria-hidden="true"
      focusable="false"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 6l4 4 4-4" />
    </svg>
  )
}
