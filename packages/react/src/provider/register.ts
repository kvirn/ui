/**
 * Apps register their router's link component and their icons once,
 * for typed link props and icon names everywhere:
 *
 * ```ts
 * declare module '@kvirn-ui/react' {
 *   interface Register {
 *     linkComponent: typeof NextLink
 *     icons: typeof icons
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
