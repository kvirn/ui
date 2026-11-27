import { defineExampleTexts } from '../../components/local-example-texts.ts'

export interface PermitExample {
  title: string
  type: 'extension' | 'garage' | 'fence'
}

const resultCount = (count: number) =>
  count === 0 ? 'No results' : count === 1 ? '1 result' : `${count} results`

export const useTagTexts = defineExampleTexts({
  en: {
    applied: 'Applied filters',
    none: 'No filters applied',
    startAgain: 'Start again',
    filters: ['Year: 2025', 'Status: Open', 'Area: North'],
    typeLegend: 'Type of permit',
    typeName: 'Type',
    types: { extension: 'Extension', garage: 'Garage', fence: 'Fence' },
    permits: [
      { title: 'Extension at 12 Mill Road', type: 'extension' },
      { title: 'Garage at 4 Birch Lane', type: 'garage' },
      { title: 'Fence at 31 Harbour Street', type: 'fence' },
      { title: 'Garage at 9 Station Road', type: 'garage' },
      { title: 'Extension at 2 Church Hill', type: 'extension' },
    ] satisfies PermitExample[],
    resultCount,
    removedResultCount: (label: string, count: number) =>
      `${label} removed. ${resultCount(count)}.`,
    clearedResultCount: (count: number) => `All filters cleared. ${resultCount(count)}.`,
    yourSearch: 'Your search',
    library: 'Library: Main library',
    day: 'Day: Saturday',
    seats: 'Seats: 4 or more',
    topics: 'Topics you follow',
    topicNames: ['Waste collection', 'Roadworks', 'School news'],
    followAll: 'Follow all topics',
    noTopics: 'You follow no topics',
  },
})
