/**
 * Apps register their router's link component once, for typed link props everywhere
 * (ADR-0005):
 *
 * ```ts
 * declare module '@kvirn-ui/react' {
 *   interface Register {
 *     linkComponent: typeof NextLink
 *   }
 * }
 * ```
 */
export interface Register {}

/** The link component a `Register`-shaped interface names, or a native `<a>`. */
export type LinkComponentOf<Registration> = Registration extends {
  linkComponent: infer LinkComponent
}
  ? LinkComponent
  : 'a'

/** The app's registered link component, or `'a'` when nothing is registered. */
export type RegisteredLinkComponent = LinkComponentOf<Register>
