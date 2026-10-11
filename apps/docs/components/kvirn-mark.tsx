/**
 * The KvirnUI mark (docs/design/assets/kvirn-mark.svg): a rounded square in the text colour with the
 * K cut out in the colour behind it (`--kv-mark-cut`, set in docs.css). Decorative; the name beside it is the label.
 */
export function KvirnMark() {
  return (
    <svg
      className="kv-application-logo-mark"
      viewBox="0 0 28 28"
      aria-hidden="true"
      focusable="false"
    >
      <rect x="2" y="2" width="24" height="24" rx="6" fill="currentColor" />
      <path
        d="M9 7v14M9 14l9-7M12 12l7 9"
        stroke="var(--kv-mark-cut, var(--kv-color-primary))"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
