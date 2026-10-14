import type { ReactNode } from 'react'
import { ApplyAnswersProvider } from './apply-answers.tsx'

export default function ReferenceApplyLayout({ children }: { children: ReactNode }) {
  return <ApplyAnswersProvider>{children}</ApplyAnswersProvider>
}
