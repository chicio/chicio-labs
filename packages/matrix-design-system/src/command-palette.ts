/**
 * The command palette, behind its own entry point because it needs `cmdk`.
 *
 * `cmdk` is an optional peer dependency: keeping these out of the root barrel is what lets a
 * consumer install the design system without it. Importing this module is the opt-in.
 *
 * The palette's cross-component contracts (context, events, change cause) stay in the root barrel: they
 * are plain types and event helpers with no `cmdk` dependency, and components such as BrandHeader
 * reference the palette events without ever rendering a palette.
 */

export * from "./organism/command-palette";
