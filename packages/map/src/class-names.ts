export function joinClassNames(...names: (string | false | null | undefined)[]) {
  return names.filter(Boolean).join(' ')
}
