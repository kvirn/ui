import type NextLink from 'next/link'

// Typed router links (ADR-0005): every KvirnUI Link on the site takes Next.js Link props.
declare module '@kvirn-ui/react' {
  interface Register {
    linkComponent: typeof NextLink
  }
}
