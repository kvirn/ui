'use client'
import { allIcons } from '@kvirn-ui/icons/all'
import { getMessages } from '@kvirn-ui/react/server'
import {
  Badge,
  Button,
  Card,
  CopyButton,
  Divider,
  Field,
  Fieldset,
  Icon,
  Link,
  Listbox,
  RadioGroup,
  TextInput,
  Tooltip,
  useAnnouncer,
  VisuallyHidden,
} from '@kvirn-ui/react'
import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import type { FormEvent } from 'react'
import type { IconSize, IconVariant } from '@kvirn-ui/react'
import { iconCamelName, iconImportName } from '../lib/icon-import-name.ts'
import { messages } from '../messages/en.ts'

const text = messages.docs.icons
const iconMessages = getMessages('icons')
const copyMessages = getMessages('copyButton')
const copiedMilliseconds = 5000

export interface IconLibraryEntry {
  name: string
  aliases: readonly string[]
  tags: readonly string[]
  meaning: string
  mirrorInRtl: boolean
  hasLabel: boolean
}

export interface IconLibraryCategory {
  id: string
  title: string
  description: string
  icons: readonly IconLibraryEntry[]
}

const variantKeys = [
  'primary',
  'secondary',
  'accent',
  'muted',
  'info',
  'success',
  'warning',
  'danger',
] as const satisfies readonly IconVariant[]
const sizeKeys = ['16', '20', '24', '32', '48', '64'] as const satisfies readonly IconSize[]
const strokeKeys = ['1', '2'] as const

/** An empty variant or stroke is the default: no `variant` prop, and the icon's own 1.5 stroke. */
interface PreviewSettings {
  variant: string
  size: string
  stroke: string
}

const defaultSettings: PreviewSettings = { variant: '', size: '64', stroke: '' }

const oneOf = (allowed: readonly string[], value: string | undefined, fallback: string) =>
  value !== undefined && allowed.includes(value) ? value : fallback

const allCategoriesKey = 'all'
const searchPath = '/icons'
const typingPauseMilliseconds = 500

/** `-`, `_` and camelCase boundaries count as spaces, so `chevronDown` is `chevron down`. */
const toWords = (value: string) =>
  value
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .toLowerCase()
    .split(/[\s\-_]+/)
    .filter(Boolean)

const matches = (icon: IconLibraryEntry, words: readonly string[]) => {
  const haystack = [
    icon.name,
    iconImportName(icon.name),
    ...icon.aliases,
    ...icon.tags,
    icon.meaning,
  ]
    .flatMap(toWords)
    .join(' ')
  return words.every((word) => haystack.includes(word))
}

const subscribeNothing = () => () => {}

// The theme's own motion rules keep these still under reduced motion.
const animatedIcons = new Set(['spinner'])

type CopyStatus = 'idle' | 'copied' | 'failed'

function IconTile({
  icon,
  isHydrated,
  settings,
}: {
  icon: IconLibraryEntry
  isHydrated: boolean
  settings: PreviewSettings
}) {
  const importName = iconImportName(icon.name)
  const importLine = `import { ${importName} } from '@kvirn-ui/icons'`
  const label = icon.hasLabel
    ? iconMessages[iconCamelName(icon.name) as keyof typeof iconMessages]
    : undefined
  const previewClassName = [
    settings.stroke === '' ? '' : `kv-icon--stroke-${settings.stroke}`,
    animatedIcons.has(icon.name) ? 'kv-animate-spinner' : '',
  ]
    .filter(Boolean)
    .join(' ')
  const lineRef = useRef<HTMLElement>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const [status, setStatus] = useState<CopyStatus>('idle')

  useEffect(() => () => clearTimeout(timer.current), [])

  const showStatus = (next: CopyStatus) => {
    clearTimeout(timer.current)
    setStatus(next)
    if (next === 'copied') {
      timer.current = setTimeout(() => setStatus('idle'), copiedMilliseconds)
    }
  }

  return (
    <Card.Root as="li" className="docs-icon-item">
      <div className="docs-icon-preview">
        <Icon
          icon={allIcons[icon.name as keyof typeof allIcons]}
          size={settings.size as IconSize}
          {...(settings.variant === '' ? {} : { variant: settings.variant as IconVariant })}
          {...(previewClassName === '' ? {} : { className: previewClassName })}
        />
        {isHydrated ? (
          <div className="docs-icon-tools">
            <Tooltip.Root>
              <Tooltip.Trigger
                as={CopyButton}
                className="kv-button--icon-only docs-icon-copy"
                status={false}
                text={importLine}
                textRef={lineRef}
                onClick={() => showStatus('idle')}
                onCopied={() => showStatus('copied')}
                onCopyError={() => showStatus('failed')}
              >
                <Icon name="copy" size="20" className="docs-icon-copy-idle" />
                <Icon name="check" size="20" className="docs-icon-copy-done" />
                <span className="docs-icon-copy-label">{text.copy}</span>
                <VisuallyHidden>{text.copyHidden({ importName })}</VisuallyHidden>
              </Tooltip.Trigger>
              <Tooltip.Popup>
                <Tooltip.Name>
                  {status === 'copied'
                    ? copyMessages.copied
                    : `${text.copy}${text.copyHidden({ importName })}`}
                </Tooltip.Name>
              </Tooltip.Popup>
            </Tooltip.Root>
            {status === 'copied' ? (
              <span className="docs-icon-copy-status" aria-hidden="true">
                {copyMessages.copied}
              </span>
            ) : null}
          </div>
        ) : null}
      </div>
      <div className="docs-icon-copy-failed" hidden={status !== 'failed'}>
        <p>
          <Icon name="warning" />
          {copyMessages.failed}
        </p>
        <code ref={lineRef}>{importLine}</code>
      </div>
      <hgroup className="docs-icon-title">
        <h3>
          <code>{icon.name}</code>
        </h3>
        <p>
          <code>{importName}</code>
        </p>
      </hgroup>
      <p>{icon.meaning}</p>
      {icon.aliases.length > 0 || label !== undefined ? (
        <div className="docs-icon-meta">
          {icon.aliases.length > 0 ? (
            <p>{text.aliases({ list: icon.aliases.join(', ') })}</p>
          ) : null}
          {label === undefined ? null : <p>{text.label({ label })}</p>}
        </div>
      ) : null}
      {icon.mirrorInRtl ? (
        <p className="docs-icon-flags">
          <Badge>{text.flips}</Badge>
        </p>
      ) : null}
    </Card.Root>
  )
}

export function IconLibrary({
  categories,
  initialQuery,
  initialCategory,
  initialVariant,
  initialSize,
  initialStroke,
}: {
  categories: readonly IconLibraryCategory[]
  initialQuery: string
  initialCategory: string
  initialVariant?: string | undefined
  initialSize?: string | undefined
  initialStroke?: string | undefined
}) {
  const [query, setQuery] = useState(initialQuery)
  const [categoryKey, setCategoryKey] = useState(initialCategory)
  const [settings, setSettings] = useState<PreviewSettings>({
    variant: oneOf(variantKeys, initialVariant, defaultSettings.variant),
    size: oneOf(sizeKeys, initialSize, defaultSettings.size),
    stroke: oneOf(strokeKeys, initialStroke, defaultSettings.stroke),
  })
  const searchRef = useRef<HTMLInputElement>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const pauseTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const { announce } = useAnnouncer()
  const isHydrated = useSyncExternalStore(
    subscribeNothing,
    () => true,
    () => false,
  )

  useEffect(() => () => clearTimeout(pauseTimer.current), [])

  const selectedCategory = categories.find((category) => category.id === categoryKey)
  const words = toWords(query)
  const visible = categories
    .filter((category) => selectedCategory === undefined || category === selectedCategory)
    .map((category) => ({
      ...category,
      icons: category.icons.filter((icon) => matches(icon, words)),
    }))
    .filter((category) => category.icons.length > 0)

  const countText = (nextQuery: string, nextCategoryKey: string) => {
    const nextCategory = categories.find((category) => category.id === nextCategoryKey)
    const nextWords = toWords(nextQuery)
    const count = categories
      .filter((category) => nextCategory === undefined || category === nextCategory)
      .reduce(
        (sum, category) => sum + category.icons.filter((icon) => matches(icon, nextWords)).length,
        0,
      )
    return count === 0
      ? text.noMatch({ query: nextQuery.trim(), category: nextCategory?.title })
      : text.count({ count, query: nextQuery.trim(), category: nextCategory?.title })
  }

  const total = visible.reduce((sum, category) => sum + category.icons.length, 0)
  const trimmedQuery = query.trim()
  const isFiltered = trimmedQuery !== '' || selectedCategory !== undefined
  const heading = total === 0 ? undefined : countText(query, categoryKey)

  const pathFor = (
    nextQuery: string,
    nextCategoryKey: string,
    nextSettings: PreviewSettings = settings,
  ) => {
    const params = new URLSearchParams()
    if (nextQuery.trim() !== '') {
      params.set('q', nextQuery.trim())
    }
    if (categories.some((category) => category.id === nextCategoryKey)) {
      params.set('category', nextCategoryKey)
    }
    if (nextSettings.variant !== defaultSettings.variant) {
      params.set('variant', nextSettings.variant)
    }
    if (nextSettings.size !== defaultSettings.size) {
      params.set('size', nextSettings.size)
    }
    if (nextSettings.stroke !== defaultSettings.stroke) {
      params.set('stroke', nextSettings.stroke)
    }
    const search = params.toString()
    return search === '' ? searchPath : `${searchPath}?${search}`
  }

  const keepUrl = (
    nextQuery: string,
    nextCategoryKey: string,
    nextSettings: PreviewSettings = settings,
  ) => {
    window.history.replaceState(null, '', pathFor(nextQuery, nextCategoryKey, nextSettings))
  }

  const changeSetting = (name: keyof PreviewSettings, value: string) => {
    const next = { ...settings, [name]: value }
    setSettings(next)
    keepUrl(query, categoryKey, next)
  }

  const resetPreview = () => {
    setSettings(defaultSettings)
    keepUrl(query, categoryKey, defaultSettings)
    formRef.current?.querySelector<HTMLInputElement>('input[name="variant"]')?.focus()
  }

  const apply = (nextQuery: string, nextCategoryKey: string, announceNow: boolean) => {
    setQuery(nextQuery)
    setCategoryKey(nextCategoryKey)
    keepUrl(nextQuery, nextCategoryKey)
    clearTimeout(pauseTimer.current)
    if (announceNow) {
      announce(countText(nextQuery, nextCategoryKey))
    }
  }

  const onQueryChange = (nextQuery: string) => {
    apply(nextQuery, categoryKey, false)
    pauseTimer.current = setTimeout(
      () => announce(countText(nextQuery, categoryKey)),
      typingPauseMilliseconds,
    )
  }

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    apply(query, categoryKey, true)
  }

  const reset = (keepQuery: boolean) => {
    apply(keepQuery ? query : '', allCategoriesKey, true)
    searchRef.current?.focus()
  }

  const isDefaultPreview =
    settings.variant === defaultSettings.variant &&
    settings.size === defaultSettings.size &&
    settings.stroke === defaultSettings.stroke
  const summaryText = text.settingsSummary({
    colour:
      settings.variant === ''
        ? text.textColour
        : text.variants[settings.variant as (typeof variantKeys)[number]],
    size: settings.size,
    stroke: settings.stroke === '' ? '1.5' : settings.stroke,
  })

  const categoryItems = [
    { key: allCategoriesKey, label: text.allCategories },
    ...categories.map((category) => ({ key: category.id, label: category.title })),
  ]

  return (
    <>
      <search aria-label={text.searchRegion}>
        <form
          ref={formRef}
          method="get"
          action={searchPath}
          className="docs-icon-controls"
          onSubmit={onSubmit}
        >
          <div className="docs-icon-controls-row">
            <Field.Root>
              <Field.Label marker="none">{text.searchLabel}</Field.Label>
              <TextInput
                ref={searchRef}
                type="search"
                name="q"
                autoComplete="off"
                value={query}
                onChange={(event) => onQueryChange(event.currentTarget.value)}
              />
              <Field.HelpText>{text.searchHelp}</Field.HelpText>
            </Field.Root>
            <Field.Root>
              <Field.Label marker="none">{text.categoryLabel}</Field.Label>
              <Listbox.Root
                native="always"
                name="category"
                items={categoryItems}
                itemToString={(item) => item.label}
                itemToKey={(item) => item.key}
                value={categoryKey}
                onValueChange={(next) =>
                  apply(query, (next as string | null) ?? allCategoriesKey, true)
                }
              />
            </Field.Root>
            <div className="docs-icon-submit">
              <Button type="submit">{text.submit}</Button>
            </div>
          </div>
          <Divider />
          <details className="docs-icon-customize">
            <summary className="kv-disclosure-trigger">
              <span>{text.customize}</span>{' '}
              <span className="docs-icon-now">{text.customizeNow({ settings: summaryText })}</span>
              <Icon
                name="chevron-down"
                size="20"
                className="kv-disclosure-icon docs-icon-chevron-down"
              />
              <Icon
                name="chevron-up"
                size="20"
                className="kv-disclosure-icon docs-icon-chevron-up"
              />
            </summary>
            <Fieldset.Root className="docs-icon-settings">
              <Fieldset.Legend marker="none" className="kv-visually-hidden">
                {text.previewLegend}
              </Fieldset.Legend>
              <div className="docs-icon-setting-groups">
                <RadioGroup.Root
                  name="variant"
                  value={settings.variant}
                  onValueChange={(next) => changeSetting('variant', next)}
                  className="docs-icon-setting"
                >
                  <RadioGroup.Legend marker="none">{text.variantLegend}</RadioGroup.Legend>
                  <div className="docs-icon-options">
                    <RadioGroup.Option>
                      <RadioGroup.Radio value="" />
                      <Field.Label>
                        <span className="docs-icon-swatch" aria-hidden="true" />
                        {text.variantDefault}
                      </Field.Label>
                    </RadioGroup.Option>
                    {variantKeys.map((variant) => (
                      <RadioGroup.Option key={variant}>
                        <RadioGroup.Radio value={variant} />
                        <Field.Label>
                          <span
                            className={`docs-icon-swatch kv-icon--${variant}`}
                            aria-hidden="true"
                          />
                          {text.variants[variant]}
                        </Field.Label>
                      </RadioGroup.Option>
                    ))}
                  </div>
                </RadioGroup.Root>
                <RadioGroup.Root
                  name="size"
                  value={settings.size}
                  onValueChange={(next) => changeSetting('size', next)}
                  className="docs-icon-setting"
                >
                  <RadioGroup.Legend marker="none">{text.sizeLegend}</RadioGroup.Legend>
                  <div className="docs-icon-options">
                    {sizeKeys.map((size) => (
                      <RadioGroup.Option key={size}>
                        <RadioGroup.Radio value={size} />
                        <Field.Label>{size}</Field.Label>
                      </RadioGroup.Option>
                    ))}
                  </div>
                </RadioGroup.Root>
                <RadioGroup.Root
                  name="stroke"
                  value={settings.stroke}
                  onValueChange={(next) => changeSetting('stroke', next)}
                  className="docs-icon-setting"
                >
                  <RadioGroup.Legend marker="none">{text.strokeLegend}</RadioGroup.Legend>
                  <div className="docs-icon-options">
                    <RadioGroup.Option>
                      <RadioGroup.Radio value="1" />
                      <Field.Label>1</Field.Label>
                    </RadioGroup.Option>
                    <RadioGroup.Option>
                      <RadioGroup.Radio value="" />
                      <Field.Label>{text.strokeDefault}</Field.Label>
                    </RadioGroup.Option>
                    <RadioGroup.Option>
                      <RadioGroup.Radio value="2" />
                      <Field.Label>2</Field.Label>
                    </RadioGroup.Option>
                  </div>
                </RadioGroup.Root>
              </div>
              <Fieldset.HelpText>{text.previewNote}</Fieldset.HelpText>
              <p className="docs-icon-usage">
                {text.props} <code>{text.usage(settings)}</code>
              </p>
              {isDefaultPreview ? null : (
                <p className="docs-icon-usage">
                  <Link
                    href={pathFor(query, categoryKey, defaultSettings)}
                    onClick={(event) => {
                      event.preventDefault()
                      resetPreview()
                    }}
                  >
                    {text.resetPreview}
                  </Link>
                </p>
              )}
            </Fieldset.Root>
          </details>
        </form>
      </search>
      {total === 0 ? (
        <div className="kv-empty-state">
          <h2 className="kv-empty-state-title">
            {text.noMatch({ query: trimmedQuery, category: selectedCategory?.title })}
          </h2>
          <p className="kv-empty-state-body">{text.noMatchHelp}</p>
          <ul role="list">
            {selectedCategory === undefined ? null : (
              <li>
                <Link
                  href={pathFor(query, allCategoriesKey)}
                  onClick={(event) => {
                    event.preventDefault()
                    reset(true)
                  }}
                >
                  {text.allCategoriesLink}
                </Link>
              </li>
            )}
            <li>
              <Link
                href={pathFor('', allCategoriesKey)}
                onClick={(event) => {
                  event.preventDefault()
                  reset(false)
                }}
              >
                {text.clear}
              </Link>
            </li>
            <li>
              <Link href="/contact">{text.request}</Link>
            </li>
          </ul>
        </div>
      ) : (
        <>
          <p>
            {heading}
            {isFiltered ? (
              <>
                {' '}
                <Link
                  href={pathFor('', allCategoriesKey)}
                  onClick={(event) => {
                    event.preventDefault()
                    reset(false)
                  }}
                >
                  {text.clear}
                </Link>
              </>
            ) : null}
          </p>
          {visible.map((category) => (
            <section key={category.id}>
              <h2 id={`icons-${category.id}`}>
                {category.title} ({category.icons.length})
              </h2>
              <p>{category.description}</p>
              <ul role="list" className="docs-icon-list">
                {category.icons.map((icon) => (
                  <IconTile
                    key={icon.name}
                    icon={icon}
                    isHydrated={isHydrated}
                    settings={settings}
                  />
                ))}
              </ul>
            </section>
          ))}
        </>
      )}
    </>
  )
}
