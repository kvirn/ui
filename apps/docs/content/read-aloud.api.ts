import type {
  ReadAloudBarProps,
  ReadAloudButtonProps,
  ReadAloudHideProps,
  ReadAloudNoteProps,
  ReadAloudSelectProps,
  ReadAloudSettingsProps,
  ReadAloudStatusProps,
  ReadAloudTransportProps,
  ReadAloudWhenStartedProps,
  UseReadAloudOptions,
  UseReadAloudResult,
} from '@kvirn-ui/read-aloud'
import type { KvirnSpeechEngineOptions } from '@kvirn-ui/core'
import { propRows } from '../components/api-block.tsx'
import type { AttributeRow } from '../components/api-block.tsx'

export const useReadAloudRows = propRows<UseReadAloudOptions>({
  contentRef: {
    type: 'RefObject<Element | null>',
    description: 'The element whose text is read. It is read when Play is pressed.',
  },
  scope: {
    type: 'string',
    default: '–',
    description:
      'A CSS selector for the element to read, used only while contentRef is not given (ReadAloud.Bar’s own default composition uses this). With neither, the page’s <main> is read. A selector that matches nothing, or no <main> at all, warns once in development and reads nothing.',
  },
  engine: {
    type: 'ReadAloudEngine',
    description:
      'The speech engine: kvirnSpeechEngine({ url }) from @kvirn-ui/core, or a fake for tests.',
  },
  name: {
    type: 'string',
    default: '–',
    description:
      'Who receives the text, named by the Note part. Pass the same value you gave kvirnSpeechEngine. Left out, the Note renders nothing.',
  },
  url: {
    type: 'string | URL',
    default: 'the provider’s readAloud.url',
    description:
      'Builds the engine for you instead of passing one. Ignored when you pass engine. Without either, and with no provider config, no player renders.',
  },
  store: {
    type: 'boolean',
    default: 'false',
    description: 'Asks the service to cache the audio. Only for public page text. Used with url.',
  },
  timeout: {
    type: 'number',
    default: '10000',
    description: 'Total budget per request, in milliseconds. Used with url.',
  },
  voices: {
    type: 'Readonly<Record<string, string>>',
    default: 'the provider’s readAloud.voices',
    description:
      'Which voice reads each language, by BCP 47 tag. Your entries resolve over the service’s own map. The language comes from the content’s lang, then the provider’s locale.',
  },
  highlight: {
    type: 'boolean',
    default: 'true',
    description:
      'Registers the sentence being read as a highlight where the browser supports the CSS Custom Highlight API. Nothing is painted until you style ::highlight(kv-read-aloud).',
  },
  scroll: {
    type: 'boolean',
    default: 'true',
    description:
      'Scrolls the sentence into view when it is out of view. Never when the user prefers reduced motion.',
  },
  messages: {
    type: "Partial<KvirnMessages['readAloud']>",
    default: '–',
    description:
      'Overrides the readAloud messages for this player, such as { play: "Listen to the notice" }.',
  },
  onStatusChange: {
    type: "(status: 'idle' | 'preparing' | 'playing' | 'paused') => void",
    default: '–',
    description: 'Called when the status changes.',
  },
})

export const readAloudRootAttributes: readonly AttributeRow[] = [
  {
    name: 'kv-read-aloud',
    values: 'always',
    meaning:
      'The part class. In the content flow it paints no panel: a bare row of buttons (D44). Inside a ReadAloud.Bar it is the full-width band instead.',
  },
  {
    name: 'kv-read-aloud--icons',
    values: 'your own class, on Root, with a Bar inside',
    meaning:
      'Hides every button’s word in the Bar, Play included, for the smallest possible bar. Each control keeps its name for assistive technology; only the visible text is hidden.',
  },
  {
    name: 'kv-read-aloud--words',
    values: 'your own class, on Root, with a Bar inside',
    meaning:
      'Shows every button’s word in the Bar, matching the inline row’s look. With neither class, the Bar shows the word on Play only and icons on the rest.',
  },
  {
    name: 'data-status',
    values: 'idle, preparing, playing, paused',
    meaning: 'What the player is doing. preparing covers the first press and a mid-text gap.',
  },
  {
    name: 'data-error',
    values: 'no-voice, speech-error, service-unavailable, service-busy, text-too-long',
    meaning: 'Why reading stopped, or a part was skipped. Absent otherwise.',
  },
  {
    name: 'data-source',
    values: 'content, selection',
    meaning: 'Whether Play reads the whole content or a captured selection.',
  },
  {
    name: 'data-kv-read-aloud-skip',
    values: 'always',
    meaning: 'The player’s own words are never read. Put it on content that must not be read too.',
  },
]

export const readAloudButtonRows = propRows<Pick<ReadAloudButtonProps, 'children'>>({
  children: {
    type: 'ReactNode',
    default: 'the message',
    description: 'Your own text. It replaces the message, so its language is yours to set.',
  },
})

export const readAloudPlayAttributes: readonly AttributeRow[] = [
  {
    name: 'kv-button kv-read-aloud-button kv-read-aloud-play',
    values: 'always',
    meaning:
      'The part classes. Previous, Next and Stop share the first two and add their own instead of the third (kv-read-aloud-previous, -next, -stop). SelectionTrigger has its own instead (kv-read-aloud-selection-trigger).',
  },
  { name: 'data-playing', values: 'while reading', meaning: 'Play is showing Pause.' },
  {
    name: 'data-busy',
    values: 'past 300 ms of preparing',
    meaning:
      'The wait for the first or next chunk has become visible. Play stays pressable: it is the way to stop the wait. The play/pause icon is replaced by a spinner in the same cell, so nothing moves.',
  },
]

export const readAloudProgressAttributes: readonly AttributeRow[] = [
  {
    name: 'kv-read-aloud-progress',
    values: 'always',
    meaning:
      'The part class, on a decorative <p aria-hidden="true">. No progressbar or slider role, no handle: the position is in words, in Status.',
  },
]

export const readAloudTransportRows = propRows<Pick<ReadAloudTransportProps, 'children'>>({
  children: {
    type: 'ReactNode',
    default: '–',
    description: 'Put ReadAloud.Previous and ReadAloud.Next here.',
  },
})

export const readAloudTransportAttributes: readonly AttributeRow[] = [
  {
    name: 'kv-read-aloud-transport',
    values: 'always',
    meaning:
      'The part class, on a plain <div>. Creates the cluster, its gap and the separation from Stop. Adds no Tab stop.',
  },
]

export const readAloudSelectRows = propRows<Pick<ReadAloudSelectProps, 'label'>>({
  label: {
    type: 'ReactNode',
    default: 'the message',
    description: 'The visible label. It replaces the message readAloud.rate or readAloud.voice.',
  },
})

export const readAloudSelectAttributes: readonly AttributeRow[] = [
  { name: 'kv-read-aloud-select', values: 'always', meaning: 'The class of the <select>.' },
  { name: 'kv-read-aloud-label', values: 'always', meaning: 'The class of its <label>.' },
]

export const readAloudStatusRows = propRows<Pick<ReadAloudStatusProps, 'as' | 'ref' | 'children'>>({
  as: {
    type: "'span' | 'p' | 'div'",
    default: "'span'",
    description: 'Changes the element. Another tag warns once and renders a span.',
  },
  ref: { type: 'Ref<HTMLElement>', default: '–', description: 'Reaches the element.' },
  children: {
    type: 'ReactNode',
    default: 'the status text',
    description: 'Your own text. It replaces the position or the reason nothing is read.',
  },
})

export const readAloudStatusAttributes: readonly AttributeRow[] = [
  { name: 'kv-read-aloud-status', values: 'always', meaning: 'The part class.' },
  {
    name: 'data-error',
    values: 'no-voice, speech-error, service-unavailable, service-busy, text-too-long',
    meaning: 'Why nothing is read.',
  },
]

export const readAloudNoteRows = propRows<Pick<ReadAloudNoteProps, 'howItWorksHref' | 'children'>>({
  howItWorksHref: {
    type: 'string',
    default: '–',
    description:
      'Shown as a readAloud.howItWorks link at the end of the note, pointing at your own page. Left out, no link is shown.',
  },
  children: {
    type: 'ReactNode',
    default: 'the note text',
    description: 'Your own text. It replaces readAloud.note, so its language is yours to set.',
  },
})

export const readAloudNoteAttributes: readonly AttributeRow[] = [
  { name: 'kv-read-aloud-note', values: 'always', meaning: 'The part class.' },
]

export const readAloudSelectionTriggerAttributes: readonly AttributeRow[] = [
  {
    name: 'kv-button kv-read-aloud-selection-trigger',
    values: 'always',
    meaning: 'The part classes.',
  },
  {
    name: 'popover="manual"',
    values: 'always',
    meaning: 'Puts the button in the top layer below the end of a selection made with a pointer.',
  },
]

export const readAloudBarRows = propRows<Pick<ReadAloudBarProps, 'children'>>({
  children: {
    type: 'ReactNode',
    default: 'the default toolbar, status count and Hide',
    description:
      'Your own markup instead of the default transport. Build it from the part props of useReadAloud.',
  },
})

export const readAloudBarAttributes: readonly AttributeRow[] = [
  {
    name: 'kv-read-aloud-bar',
    values: 'always',
    meaning:
      'The part class, on a plain <div> with no role or name of its own: ReadAloud.Root’s own group is the Bar’s group too. The default theme keeps it static while idle and makes it sticky only while playing.',
  },
]

export const readAloudSettingsRows = propRows<
  Pick<ReadAloudSettingsProps, 'howItWorksHref' | 'children'>
>({
  howItWorksHref: {
    type: 'string',
    default: '–',
    description:
      'Shown as a readAloud.howItWorks link after the recipient sentence, pointing at your own page. Left out, no link is shown and nothing warns: the destination is your own to write.',
  },
  children: {
    type: 'ReactNode',
    default: 'Speed, Voice, then the recipient note',
    description: 'Your own content for the popup. The trigger button itself stays fixed.',
  },
})

export const readAloudSettingsAttributes: readonly AttributeRow[] = [
  {
    name: 'kv-button kv-button--icon-only kv-read-aloud-settings',
    values: 'always, on the trigger',
    meaning: 'The classes of the icon-only button that opens the menu.',
  },
  {
    name: 'kv-read-aloud-settings-popup',
    values: 'always, on the popup',
    meaning: 'The class of the menu itself: Speed, Voice, then the recipient note.',
  },
  {
    name: 'aria-haspopup / aria-expanded',
    values: '"dialog" / true or false',
    meaning: 'Tells assistive technology the button opens a menu, and whether it is open.',
  },
]

export const readAloudHideRows = propRows<Pick<ReadAloudHideProps, 'children'>>({
  children: {
    type: 'ReactNode',
    default: 'a close icon',
    description: 'Your own icon or text, named by readAloud.hide either way.',
  },
})

export const readAloudHideAttributes: readonly AttributeRow[] = [
  {
    name: 'kv-button kv-button--icon-only kv-read-aloud-hide',
    values: 'always',
    meaning: 'The part classes.',
  },
  {
    name: 'aria-label',
    values: 'readAloud.hide',
    meaning: 'Names the button, since its icon is the only visible content.',
  },
]

export const readAloudWhenStartedRows = propRows<ReadAloudWhenStartedProps>({
  children: {
    type: 'ReactNode',
    default: '–',
    description:
      "Shown only once reading has started at least once; nothing before that, and it never goes back to hidden. Not part of the recommended inline row (D44, D47, gated on `status` instead), kept for a consumer's own composition that wants a sticky reveal. Reads the ReadAloud.Root it is inside, so there is still one engine, not a second one.",
  },
})

export const useReadAloudResultRows = propRows<UseReadAloudResult>({
  status: {
    type: "'idle' | 'preparing' | 'playing' | 'paused'",
    default: '–',
    description: 'What the player is doing.',
  },
  error: {
    type: "'no-voice' | 'speech-error' | 'service-unavailable' | 'service-busy' | 'text-too-long' | null",
    default: '–',
    description: 'Why reading stopped, or null.',
  },
  voicesStatus: {
    type: "'idle' | 'loading' | 'ready' | 'error'",
    default: '–',
    description: 'Whether the voice list has arrived from the service.',
  },
  state: {
    type: 'ReadAloudState',
    default: '–',
    description: 'The full state of the reader.',
  },
  hasVoice: {
    type: 'boolean | null',
    default: '–',
    description:
      'Whether the content language has a voice on the service. null until the voice list has loaded, so a consumer can render no player for a language with none without flashing it first.',
  },
  hasSelection: {
    type: 'boolean',
    default: '–',
    description: 'A selection inside the content is captured: Play reads it.',
  },
  hasVoiceChoice: {
    type: 'boolean',
    default: '–',
    description:
      'true with two or more voices for the language, which is when a Voice select is useful.',
  },
  rootProps: {
    type: 'ReadAloudRootPartProps',
    default: '–',
    description: 'Spread on the group’s element.',
  },
  playProps: {
    type: 'ReadAloudPlayPartProps',
    default: '–',
    description: 'Spread on the Play <button>.',
  },
  previousProps: {
    type: 'ReadAloudButtonPartProps',
    default: '–',
    description: 'Spread on the Previous <button>.',
  },
  nextProps: {
    type: 'ReadAloudButtonPartProps',
    default: '–',
    description: 'Spread on the Next <button>.',
  },
  stopProps: {
    type: 'ReadAloudButtonPartProps',
    default: '–',
    description: 'Spread on the Stop <button>.',
  },
  rateProps: {
    type: 'ReadAloudSelectPartProps',
    default: '–',
    description: 'Spread on the speed <select>.',
  },
  rateLabelProps: {
    type: 'ReadAloudLabelPartProps',
    default: '–',
    description: 'Spread on the speed <label>.',
  },
  voiceProps: {
    type: 'ReadAloudSelectPartProps',
    default: '–',
    description: 'Spread on the voice <select>.',
  },
  voiceLabelProps: {
    type: 'ReadAloudLabelPartProps',
    default: '–',
    description: 'Spread on the voice <label>.',
  },
  statusProps: {
    type: 'ReadAloudStatusPartProps',
    default: '–',
    description: 'Spread on the status element.',
  },
  noteProps: {
    type: 'ReadAloudNotePartProps',
    default: '–',
    description: 'Spread on the Note’s <p>.',
  },
  noteText: {
    type: 'string | null',
    default: '–',
    description:
      'readAloud.note with the recipient’s name, or null when Root was given no name: there is nothing sensible to show without it.',
  },
  isSelectionTriggerShown: {
    type: 'boolean',
    default: '–',
    description:
      'true after a selection made with a pointer in the content, until it is dismissed.',
  },
  selectionTriggerProps: {
    type: 'ReadAloudSelectionTriggerPartProps',
    default: '–',
    description: 'Spread on the <button> shown next to the selection.',
  },
  playLabel: {
    type: 'string',
    default: '–',
    description: 'The Play message: Listen, Listen to selected text or Pause.',
  },
  playIdleLabel: {
    type: 'string',
    default: '–',
    description: 'The Play message on its own, for building a custom idle label stack.',
  },
  selectionLabel: {
    type: 'string',
    default: '–',
    description:
      'The selection trigger’s name, and the Play message while a selection is captured.',
  },
  pauseLabel: {
    type: 'string',
    default: '–',
    description: 'The Play message on its own, for building a custom pause label stack.',
  },
  previousLabel: {
    type: 'string',
    default: '–',
    description: 'The Previous message.',
  },
  nextLabel: { type: 'string', default: '–', description: 'The Next message.' },
  stopLabel: { type: 'string', default: '–', description: 'The Stop message.' },
  rateLabel: { type: 'string', default: '–', description: 'The speed label.' },
  voiceLabel: { type: 'string', default: '–', description: 'The voice label.' },
  howItWorksLabel: {
    type: 'string',
    default: '–',
    description: 'The Note part’s link text, for your own howItWorksHref link.',
  },
  voicesLoadingLabel: {
    type: 'string',
    default: '–',
    description: 'Shown only while the Voice select’s options have not arrived yet.',
  },
  statusText: {
    type: 'string',
    default: '–',
    description:
      'The visible status: the position, a wait, a skipped part, or the reason reading stopped. Empty when idle.',
  },
  progressFraction: {
    type: 'number | null',
    default: '–',
    description:
      'The sentence meter’s fill, 0 to 1. null while idle, so a custom Progress part can render nothing.',
  },
  rateOptions: {
    type: 'ReadAloudOption[]',
    default: '–',
    description: 'The speeds, with formatted labels.',
  },
  voiceOptions: {
    type: 'ReadAloudOption[]',
    default: '–',
    description: 'The voices for the content language.',
  },
  barLabel: {
    type: 'string',
    default: '–',
    description:
      'readAloud.barLabel: the Bar’s own name for the group, used instead of readAloud.label while a Bar is mounted.',
  },
  settingsLabel: {
    type: 'string',
    default: '–',
    description: 'readAloud.settings: names the Settings button and its popup.',
  },
  hideProps: {
    type: 'ReadAloudHidePartProps',
    default: '–',
    description: 'Spread on the Hide <button>.',
  },
  hideLabel: {
    type: 'string',
    default: '–',
    description: 'The Hide message.',
  },
  hasEverPlayed: {
    type: 'boolean',
    default: '–',
    description:
      'true once reading has started at least once, and never resets. Lets a custom idle panel keep its transport open for the rest of the visit after the first press.',
  },
})

export const kvirnSpeechEngineRows = propRows<KvirnSpeechEngineOptions>({
  url: {
    type: 'string | URL',
    description: 'The service’s base URL: an origin, or a path on your own proxy. Named by none.',
  },
  name: {
    type: 'string',
    default: 'the URL’s host',
    description:
      'Who receives the text, named in the privacy notice. Pass the same value to useReadAloud’s name.',
  },
  store: {
    type: 'boolean',
    default: 'false',
    description: 'Asks the service to cache the audio. Only for public page text.',
  },
  timeout: {
    type: 'number',
    default: '10000',
    description: 'Total budget per request, in milliseconds.',
  },
  voices: {
    type: 'Readonly<Record<string, string>>',
    default: 'the service’s own map',
    description:
      'Which voice reads each language, by BCP 47 tag, such as { sv: sv_SE-male-0-medium }. Your entries resolve over the service’s own map. A language with no voice gets no player.',
  },
})
