---
name: component-moved-into-ds-css-ownership
description: when a Website component moves into matrix-design-system with a "no visual change" claim, check every non-Tailwind class it uses is defined in the DS stylesheet, not the Website's css
metadata:
  type: feedback
---

A component moved from `apps/website/src/components/**` into `packages/matrix-design-system` keeps its markup, so
the move looks byte-identical, but its styling now has to come from the DS stylesheet alone. Tailwind utilities are
fine: `packages/matrix-design-system/src/styles/index.css` has `@source "../../dist/**/*.mjs"`, so any host importing
`matrix-design-system/styles.css` gets the utilities of every built DS component. A custom class (e.g.
`glow-container`, defined in the DS `styles/components.css`) is only safe if it lives in the DS styles, not in
`apps/website/src/app/css/globals.css`.

**Why:** the Website imports both stylesheets, so a class left in its globals.css still renders there and every gate
stays green, while a second host (the Labs Hub imports only the DS styles) gets an unstyled card. No check catches it.

**How to apply:** list the moved component's classes, drop the Tailwind utilities, and grep each remaining one in
`packages/matrix-design-system/src/styles/` and in the Website's css. Related: [[globals-css-ul-li-bullet-base-rule]].
