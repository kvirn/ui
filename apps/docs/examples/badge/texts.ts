import { defineExampleTexts } from '../../components/local-example-texts.ts'

export interface BadgeTexts {
  application: string
  draft: string
  cases: {
    title: string
    status: string
    variant: 'neutral' | 'primary' | 'info' | 'success' | 'warning' | 'danger'
  }[]
  summary: { case: string; caseValue: string; status: string; statusValue: string }
}

export const useBadgeTexts = defineExampleTexts<BadgeTexts>({
  en: {
    application: 'Building permit, 4 Storgatan',
    draft: 'Draft',
    cases: [
      { title: 'Building permit, 4 Storgatan', status: 'Granted', variant: 'success' },
      { title: 'Parking permit', status: 'Waiting for more information', variant: 'warning' },
      { title: 'Noise complaint', status: 'Being processed', variant: 'info' },
      { title: 'School transport', status: 'Refused', variant: 'danger' },
      { title: 'Library card', status: 'New', variant: 'primary' },
      { title: 'Bulky waste collection', status: 'Draft', variant: 'neutral' },
    ],
    summary: {
      case: 'Case',
      caseValue: 'Building permit, 4 Storgatan',
      status: 'Status',
      statusValue: 'Granted',
    },
  },
  sv: {
    application: 'Bygglov Storgatan 4',
    draft: 'Utkast',
    cases: [
      { title: 'Bygglov Storgatan 4', status: 'Beviljat', variant: 'success' },
      { title: 'Parkeringstillstånd', status: 'Väntar på komplettering', variant: 'warning' },
      { title: 'Bullerklagomål', status: 'Under handläggning', variant: 'info' },
      { title: 'Skolskjuts', status: 'Avslaget', variant: 'danger' },
      { title: 'Bibliotekskort', status: 'Nytt', variant: 'primary' },
      { title: 'Grovavfallshämtning', status: 'Utkast', variant: 'neutral' },
    ],
    summary: {
      case: 'Ärende',
      caseValue: 'Bygglov Storgatan 4',
      status: 'Status',
      statusValue: 'Beviljat',
    },
  },
})
