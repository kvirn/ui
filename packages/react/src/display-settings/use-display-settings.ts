import type { KvirnMessages } from '@kvirn-ui/i18n'
import { useMessages } from '../provider/use-messages.ts'
import { useTheme } from '../provider/use-theme.ts'

export interface UseDisplaySettingsOptions {
  /** Per-instance message overrides for the `displaySettings` namespace. */
  messages?: Partial<KvirnMessages['displaySettings']> | undefined
  /** The device option gets its short name, for segments. */
  short?: boolean | undefined
}

export interface DisplaySettingsOption {
  value: string
  label: string
}

export interface DisplaySettingsGroup {
  /** `colorScheme`, `contrast` or `motion`. */
  id: 'colorScheme' | 'contrast' | 'motion'
  /** The radio group's name, unique per group. */
  name: string
  legend: string
  /** The preference in force: one of the option values. */
  value: string
  options: readonly DisplaySettingsOption[]
  /** Persists the choice through the provider. Ignores a value that is not an option. */
  select: (value: string) => void
}

export interface UseDisplaySettingsResult {
  /** The resolved messages: every key is text. */
  text: { [Key in keyof KvirnMessages['displaySettings']]: string }
  /** Colour scheme, contrast and motion, each with its options. */
  groups: readonly DisplaySettingsGroup[]
  /** The device forces its own colours: they replace these choices while they are on. */
  isForcedColors: boolean
}

const colorSchemes = ['light', 'dark', 'system'] as const
const contrasts = ['standard', 'more', 'system'] as const
const motions = ['full', 'reduce', 'system'] as const

/**
 * The state of the display settings: three groups on `useTheme()`, with their labels from the
 * `displaySettings` messages. It renders nothing; the parts and your own markup draw it
 * (contract: display-settings.a11y.md).
 */
export function useDisplaySettings(
  options: UseDisplaySettingsOptions = {},
): UseDisplaySettingsResult {
  const theme = useTheme()
  const text = useMessages('displaySettings', options.messages)
  const system = options.short === true ? text.systemShort : undefined

  const groups: DisplaySettingsGroup[] = [
    {
      id: 'colorScheme',
      name: 'kv-display-settings-color-scheme',
      legend: text.colorSchemeLegend,
      value: theme.colorScheme,
      options: [
        { value: 'light', label: text.colorSchemeLight },
        { value: 'dark', label: text.colorSchemeDark },
        { value: 'system', label: system ?? text.colorSchemeSystem },
      ],
      select: (value) => {
        const option = colorSchemes.find((candidate) => candidate === value)
        if (option !== undefined) {
          theme.selectColorScheme(option)
        }
      },
    },
    {
      id: 'contrast',
      name: 'kv-display-settings-contrast',
      legend: text.contrastLegend,
      value: theme.contrast,
      options: [
        { value: 'standard', label: text.contrastStandard },
        { value: 'more', label: text.contrastMore },
        { value: 'system', label: system ?? text.contrastSystem },
      ],
      select: (value) => {
        const option = contrasts.find((candidate) => candidate === value)
        if (option !== undefined) {
          theme.selectContrast(option)
        }
      },
    },
    {
      id: 'motion',
      name: 'kv-display-settings-motion',
      legend: text.motionLegend,
      value: theme.motion,
      options: [
        { value: 'full', label: text.motionFull },
        { value: 'reduce', label: text.motionReduce },
        { value: 'system', label: system ?? text.motionSystem },
      ],
      select: (value) => {
        const option = motions.find((candidate) => candidate === value)
        if (option !== undefined) {
          theme.selectMotion(option)
        }
      },
    },
  ]

  return { text, groups, isForcedColors: theme.isForcedColors }
}
