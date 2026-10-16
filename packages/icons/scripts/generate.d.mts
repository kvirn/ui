export function buildOutputs(
  svgDirectory: string,
  mirrorInRtl: readonly string[],
): Map<string, string>
export function camelCase(name: string): string
export function readMirrorList(): string[]
export function parseIcon(
  file: string,
  source: string,
): [tag: string, attributes: Record<string, string>][]
