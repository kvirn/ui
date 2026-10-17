import {
  add,
  arrowBack,
  arrowForward,
  book,
  calendar,
  check,
  chevronDown,
  chevronForward,
  chevronUp,
  close,
  copy,
  document as documentIcon,
  download,
  eye,
  info,
  language,
  playground,
  search,
  swimmingPool,
  warning,
} from '@kvirn-ui/icons'
import { defineIcons } from '@kvirn-ui/react'

/** Only the icons the site draws by name, so it bundles no more: the practice the Icon page teaches. */
export const icons = defineIcons({
  add,
  'arrow-back': arrowBack,
  'arrow-forward': arrowForward,
  book,
  calendar,
  check,
  'chevron-down': chevronDown,
  'chevron-forward': chevronForward,
  'chevron-up': chevronUp,
  close,
  copy,
  document: documentIcon,
  download,
  eye,
  info,
  language,
  playground,
  search,
  'swimming-pool': swimmingPool,
  warning,
})

declare module '@kvirn-ui/react' {
  interface Register {
    icons: typeof icons
  }
}
