'use client'

import { Link, mergeProps } from '@kvirn-ui/react'
import type { LinkProps } from '@kvirn-ui/react'
import { createContext, useContext, useId, useLayoutEffect, useState } from 'react'
import type { ComponentPropsWithRef, ElementType, ReactElement } from 'react'

interface ApplicationLogoContextValue {
  nameId: string
  sloganId: string
  setHasName: (hasName: boolean) => void
  setHasSlogan: (hasSlogan: boolean) => void
}

const ApplicationLogoContext = createContext<ApplicationLogoContextValue | null>(null)

/**
 * `current` is `page` on the start page. Put a `ApplicationLogo.Logo` first, then the
 * organisation's or service's `ApplicationLogo.Name`, and an optional `ApplicationLogo.Slogan`.
 */
export type ApplicationLogoRootProps<Component extends ElementType = 'a'> = LinkProps<Component>
export type ApplicationLogoLogoProps = Omit<ComponentPropsWithRef<'img'>, 'alt'>
export type ApplicationLogoNameProps = ComponentPropsWithRef<'span'>
export type ApplicationLogoSloganProps = ComponentPropsWithRef<'span'>

/**
 * The link to the start page: a `Link.Root`, through the registered router link or `as`. Its
 * name is the `Name` alone and the `Slogan` is its description, so a screen reader says the name
 * first and a voice user says what they see (2.5.3). Contract: application-logo.a11y.md.
 */
export function ApplicationLogoRoot<Component extends ElementType = 'a'>(
  props: ApplicationLogoRootProps<Component>,
): ReactElement
export function ApplicationLogoRoot(props: LinkProps<'a'>): ReactElement {
  const nameId = useId()
  const sloganId = useId()
  const [hasName, setHasName] = useState(false)
  const [hasSlogan, setHasSlogan] = useState(false)
  const context = { nameId, sloganId, setHasName, setHasSlogan }
  return (
    <ApplicationLogoContext.Provider value={context}>
      <Link.Root
        {...mergeProps(props, {
          className: 'kv-application-logo',
          'aria-labelledby': hasName && hasSlogan ? nameId : undefined,
          'aria-describedby': hasSlogan ? sloganId : undefined,
        })}
      />
    </ApplicationLogoContext.Provider>
  )
}
ApplicationLogoRoot.displayName = 'ApplicationLogo.Root'

function useApplicationLogo(partName: string) {
  const applicationLogo = useContext(ApplicationLogoContext)
  if (applicationLogo === null) {
    throw new Error(`<ApplicationLogo.${partName}> must be used inside <ApplicationLogo.Root>.`)
  }
  return applicationLogo
}

/** The mark. It is decorative (`alt=""`): the name is the text beside it. */
export function ApplicationLogoLogo(props: ApplicationLogoLogoProps): ReactElement {
  return <img alt="" {...mergeProps(props, { className: 'kv-application-logo-mark' })} />
}
ApplicationLogoLogo.displayName = 'ApplicationLogo.Logo'

/** The organisation's or service's name, as text: the link's accessible name. */
export function ApplicationLogoName(props: ApplicationLogoNameProps): ReactElement {
  const applicationLogo = useApplicationLogo('Name')
  const { setHasName } = applicationLogo
  useLayoutEffect(() => {
    setHasName(true)
    return () => setHasName(false)
  }, [setHasName])
  return (
    <span
      {...mergeProps(props, { id: applicationLogo.nameId, className: 'kv-application-logo-name' })}
    />
  )
}
ApplicationLogoName.displayName = 'ApplicationLogo.Name'

/** A short slogan under the name, as text. It describes the link and is not part of its name. */
export function ApplicationLogoSlogan(props: ApplicationLogoSloganProps): ReactElement {
  const applicationLogo = useApplicationLogo('Slogan')
  const { setHasSlogan } = applicationLogo
  useLayoutEffect(() => {
    setHasSlogan(true)
    return () => setHasSlogan(false)
  }, [setHasSlogan])
  return (
    <span
      {...mergeProps(props, {
        id: applicationLogo.sloganId,
        className: 'kv-application-logo-slogan',
      })}
    />
  )
}
ApplicationLogoSlogan.displayName = 'ApplicationLogo.Slogan'

export const ApplicationLogo = {
  Root: ApplicationLogoRoot,
  Logo: ApplicationLogoLogo,
  Name: ApplicationLogoName,
  Slogan: ApplicationLogoSlogan,
} as const
