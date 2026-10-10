import type { ReactNode } from 'react'
import { actionPreviews } from './actions.tsx'
import { choicePreviews } from './choice.tsx'
import { contentPreviews } from './content.tsx'
import { dataPreviews } from './data.tsx'
import { formsPreviews } from './forms.tsx'
import { layoutPreviews } from './layout.tsx'
import { navigationPreviews } from './navigation.tsx'

/** Decorative pictures by the page's slug (the last segment of its href). A missing key is a card without one. */
export const galleryPreviews: Readonly<Record<string, ReactNode>> = {
  ...actionPreviews,
  ...contentPreviews,
  ...layoutPreviews,
  ...navigationPreviews,
  ...formsPreviews,
  ...choicePreviews,
  ...dataPreviews,
}
