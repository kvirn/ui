import type {
  ReadAloudButtonProps,
  ReadAloudSelectProps,
  ReadAloudStatusProps,
  UseReadAloudOptions,
  UseReadAloudResult,
} from '@kvirn-ui/react'
import { propRows } from '../components/api-block.tsx'
import type { AttributeRow } from '../components/api-block.tsx'

export const useReadAloudRows = propRows<UseReadAloudOptions>({
  contentRef: {
    type: 'RefObject<Element | null>',
    description: 'The element whose text is read. It is read when Play is pressed.',
  },
  engine: {
    type: 'ReadAloudEngine',
    default: 'speechSynthesis',
    description: 'Advanced and unstable: your own speech engine, for tests or a self-hosted voice.',
  },
  allowRemoteVoices: {
    type: 'boolean',
    default: 'false',
    description:
      'Also offers browser voices that may send the text to a remote service. Leave it off for personal data.',
  },
  highlight: {
    type: 'boolean',
    default: 'true',
    description:
      'Highlights the sentence being read where the browser supports the CSS Custom Highlight API.',
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
    description: 'Overrides the readAloud messages for this player, such as { play: "Lyssna" }.',
  },
  onStatusChange: {
    type: "(status: 'idle' | 'playing' | 'paused' | 'unsupported') => void",
    default: '–',
    description: 'Called when the status changes.',
  },
})

export const readAloudRootAttributes: readonly AttributeRow[] = [
  {
    name: 'kv-read-aloud',
    values: 'always',
    meaning: 'The part class. The default theme styles it.',
  },
  {
    name: 'data-status',
    values: 'idle, playing, paused, unsupported',
    meaning: 'What the player is doing.',
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
    name: 'kv-button kv-read-aloud-button',
    values: 'always',
    meaning: 'The part classes. Previous, Next, Stop and SelectionTrigger share the first.',
  },
  { name: 'data-playing', values: 'while reading', meaning: 'Play is showing Pause.' },
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
    values: 'no-voice, speech-error, unsupported',
    meaning: 'Why nothing is read.',
  },
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

export const useReadAloudResultRows = propRows<UseReadAloudResult>({
  status: {
    type: "'idle' | 'playing' | 'paused' | 'unsupported'",
    default: '–',
    description: 'What the player is doing.',
  },
  state: {
    type: 'ReadAloudState',
    default: '–',
    description: 'The full state of the reader.',
  },
  isSupported: {
    type: 'boolean',
    default: '–',
    description:
      'false when the browser has no speech synthesis: render only the group and the status.',
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
  selectionLabel: {
    type: 'string',
    default: '–',
    description: 'The selection trigger’s name.',
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
  statusText: {
    type: 'string',
    default: '–',
    description:
      'The visible status: the position, or the reason nothing is read. Empty when idle.',
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
})
