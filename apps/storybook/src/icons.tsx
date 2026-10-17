import { allIcons } from '@kvirn-ui/icons/all'
import { KvirnProvider } from '@kvirn-ui/react'
import type { Decorator } from '@storybook/react-vite'

export { allIcons }

// No `Register` augmentation: Storybook type-checks in one program with the packages, so it would
// narrow `IconName` in the library's own tests. Story names stay `string`, checked by the dev warning.

/**
 * Registers every library icon for a story that writes `<Icon name>`. It is a decorator on those
 * stories, not a global one: the outermost provider owns the live regions, the toast region and
 * the theme preference, which would break the announcer, toast and provider stories.
 */
export const withLibraryIcons: Decorator = (Story) => (
  <KvirnProvider icons={allIcons}>
    <Story />
  </KvirnProvider>
)
