'use client'
import type { KvirnMessages } from '@kvirn-ui/i18n'
import type { ReactElement, ReactNode } from 'react'
import { Button } from '../button/button.tsx'
import { Card } from '../card/card.tsx'
import { Disclosure } from '../disclosure/disclosure.tsx'
import { Field } from '../field/field.tsx'
import { Popover } from '../popover/popover.tsx'
import { RadioGroup } from '../radio-group/radio-group.tsx'
import { useDisplaySettings } from './use-display-settings.ts'

export interface DisplaySettingsProps {
  /** Per-instance message overrides: `{ button, colorSchemeLegend, … }`. */
  messages?: Partial<KvirnMessages['displaySettings']> | undefined
  /** Goes on the button. */
  className?: string | undefined
  /** The panel or popup starts open. */
  defaultOpen?: boolean | undefined
  /**
   * Your own notes, after the groups: what less motion does, where the choice is kept. The
   * component has none of its own.
   */
  children?: ReactNode
}

export type DisplaySettingsInlineProps = DisplaySettingsProps
export type DisplaySettingsFloatingProps = DisplaySettingsProps
export type DisplaySettingsCompactProps = DisplaySettingsProps

export interface DisplaySettingsPanelProps {
  messages?: Partial<KvirnMessages['displaySettings']> | undefined
  className?: string | undefined
  /** Your own notes, after the groups. */
  children?: ReactNode
}
export type DisplaySettingsCompactPanelProps = DisplaySettingsPanelProps

/** The three groups as native radios. `short` draws each as a row of segments. */
function DisplaySettingsGroups({
  messages,
  short,
}: {
  messages: DisplaySettingsProps['messages']
  short?: boolean
}): ReactElement {
  const { groups } = useDisplaySettings({ messages, short })
  return (
    <div
      className={
        short === true
          ? 'kv-display-settings-groups kv-display-settings-groups--segments'
          : 'kv-display-settings-groups'
      }
    >
      {groups.map((group) => (
        <RadioGroup.Root
          key={group.id}
          name={group.name}
          value={group.value}
          onValueChange={group.select}
        >
          <RadioGroup.Legend marker="none">{group.legend}</RadioGroup.Legend>
          <div className={short === true ? 'kv-display-settings-segments' : undefined}>
            {group.options.map((option) => (
              <Field.Root key={option.value}>
                <RadioGroup.Radio value={option.value} />
                <Field.Label>{option.label}</Field.Label>
              </Field.Root>
            ))}
          </div>
        </RadioGroup.Root>
      ))}
    </div>
  )
}

/**
 * The choices on their own, with no container and no trigger: the three groups, the
 * forced-colours note while forced colours are on, and your children. Put it in a Card, a
 * Popover, a Dialog or on a page (contract: display-settings.a11y.md).
 */
export function DisplaySettingsPanel({
  messages,
  className,
  children,
}: DisplaySettingsPanelProps): ReactElement {
  const { text, isForcedColors } = useDisplaySettings({ messages })
  return (
    <div className={['kv-display-settings-content', className].filter(Boolean).join(' ')}>
      <DisplaySettingsGroups messages={messages} />
      {isForcedColors && <p>{text.forcedColors}</p>}
      {children}
    </div>
  )
}
DisplaySettingsPanel.displayName = 'DisplaySettings.Panel'

/**
 * The same choices as rows of segments, for small places. Still native radios in a fieldset, and
 * the device option has its short name. No container and no trigger.
 */
export function DisplaySettingsCompactPanel({
  messages,
  className,
  children,
}: DisplaySettingsCompactPanelProps): ReactElement {
  const { text, isForcedColors } = useDisplaySettings({ messages, short: true })
  return (
    <div
      className={['kv-display-settings-content', 'kv-display-settings-content--compact', className]
        .filter(Boolean)
        .join(' ')}
    >
      <DisplaySettingsGroups messages={messages} short />
      {isForcedColors && <p>{text.forcedColors}</p>}
      {children}
    </div>
  )
}
DisplaySettingsCompactPanel.displayName = 'DisplaySettings.CompactPanel'

/** A chevron that says the button opens a dropdown. Decorative: the state is `aria-expanded`. */
function DisplaySettingsChevron(): ReactElement {
  return (
    <svg
      className="kv-display-settings-chevron"
      viewBox="0 0 12 12"
      width="12"
      height="12"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M2.5 4.5 6 8l3.5-3.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

const buttonClass = (className: string | undefined) =>
  ['kv-display-settings-trigger', className].filter(Boolean).join(' ')

/**
 * The inline layout: a Disclosure. The panel opens in flow and pushes the content below it down.
 */
export function DisplaySettingsInline({
  messages,
  className,
  defaultOpen,
  children,
}: DisplaySettingsInlineProps): ReactElement {
  const { text } = useDisplaySettings({ messages })
  return (
    <Disclosure.Root defaultOpen={defaultOpen}>
      <Disclosure.Trigger className={buttonClass(className)}>{text.button}</Disclosure.Trigger>
      <Disclosure.Panel className="kv-display-settings-panel">
        <Card.Root className="kv-display-settings-card">
          <Card.Body>
            <DisplaySettingsPanel messages={messages}>{children}</DisplaySettingsPanel>
          </Card.Body>
        </Card.Root>
      </Disclosure.Panel>
    </Disclosure.Root>
  )
}
DisplaySettingsInline.displayName = 'DisplaySettings.Inline'

/**
 * The floating layout: a Popover. The popup opens over the page, in the top layer, next to its
 * button, and closes on Escape or a press outside.
 */
export function DisplaySettingsFloating({
  messages,
  className,
  defaultOpen,
  children,
}: DisplaySettingsFloatingProps): ReactElement {
  const { text } = useDisplaySettings({ messages })
  return (
    <Popover.Root placement="bottom-end" defaultOpen={defaultOpen}>
      <Popover.Trigger
        as={Button}
        className={['kv-display-settings-dropdown', buttonClass(className)].join(' ')}
      >
        {text.button}
        <DisplaySettingsChevron />
      </Popover.Trigger>
      <Popover.Popup aria-label={text.button} className="kv-display-settings-popup">
        <Card.Root className="kv-display-settings-card">
          <Card.Body>
            <DisplaySettingsPanel messages={messages}>{children}</DisplaySettingsPanel>
          </Card.Body>
        </Card.Root>
      </Popover.Popup>
    </Popover.Root>
  )
}
DisplaySettingsFloating.displayName = 'DisplaySettings.Floating'

/**
 * The compact layout: a small dropdown with a row of segments per group, still native radios.
 */
export function DisplaySettingsCompact({
  messages,
  className,
  defaultOpen,
  children,
}: DisplaySettingsCompactProps): ReactElement {
  const { text } = useDisplaySettings({ messages })
  return (
    <Popover.Root placement="bottom-end" defaultOpen={defaultOpen}>
      <Popover.Trigger
        as={Button}
        className={[
          'kv-display-settings-dropdown',
          'kv-display-settings-compact-trigger',
          buttonClass(className),
        ].join(' ')}
      >
        <svg
          className="kv-display-settings-icon"
          viewBox="0 0 16 16"
          width="16"
          height="16"
          aria-hidden="true"
          focusable="false"
        >
          <circle cx="8" cy="8" r="6.25" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <path d="M8 1.75a6.25 6.25 0 0 1 0 12.5z" fill="currentColor" />
        </svg>
        {text.button}
        <DisplaySettingsChevron />
      </Popover.Trigger>
      <Popover.Popup aria-label={text.button} className="kv-display-settings-compact-popup">
        <DisplaySettingsCompactPanel messages={messages}>{children}</DisplaySettingsCompactPanel>
      </Popover.Popup>
    </Popover.Root>
  )
}
DisplaySettingsCompact.displayName = 'DisplaySettings.Compact'

export const DisplaySettings = {
  Inline: DisplaySettingsInline,
  Floating: DisplaySettingsFloating,
  Compact: DisplaySettingsCompact,
  Panel: DisplaySettingsPanel,
  CompactPanel: DisplaySettingsCompactPanel,
} as const
