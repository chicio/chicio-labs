---
name: hrefless-anchor-invisible-to-link-role
description: an `<a>` with an undefined href has no ARIA link role, so "absent prop → no link" tests built on getAllByRole("link") counts or href selectors pass even when the element still renders
metadata:
  type: feedback
---

When a diff makes a link prop optional ("absent → not rendered", e.g. SocialContacts `contactHref`, a social
platform), the regression is the element still rendering with `href={undefined}`. That `<a>` has NO `link` role, so
`getAllByRole("link")` counts and `a[href="/contact"]` selectors cannot see it: the test stays green on the mutant.
The original `links.devto!` bug was this exact shape, and the round-1 WU1 test for the contact envelope was vacuous
for it (a `true &&` mutant survived).

**Why:** RTL role queries follow ARIA; an anchor without href is generic, not a link. Title-based queries
(`queryByTitle("Devto")`) DO see it, which is why the per-platform tests were real and the envelope one was not.

**How to apply:** for every "absent → not rendered" guard on an anchor, replace the guard with `true &&` in a scratchpad
shadow ([[verify-mutation-claims-in-a-shadow-src-tree]]; for the design system mirror `packages/matrix-design-system`
under `shadow/packages/` with `shadow/node_modules` symlinked to the worktree root's, since vitest is hoisted) and
check a test fails. Demand an assertion that does not depend on href: `container.querySelectorAll("a")`, an icon title,
or a class unique to the element.
