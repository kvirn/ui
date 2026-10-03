import type NextLink from 'next/link'

// Typed router links: every KvirnUI Link on the site takes Next.js Link props.
declare module '@kvirn-ui/react' {
  interface Register {
    linkComponent: typeof NextLink
  }
}
