---
name: slot-wrapper-layout-ab-probe
description: When a diff moves a flex child into a slot wrapper (classes split between a new div and the element), prove "looks identical" with a port-free A/B probe that unwraps the DOM back to the old shape and compares bounding boxes across breakpoints
metadata:
  type: feedback
---

Rule: a refactor that turns a hard-coded flex child into a slot (`{trailing && <div className="ml-auto sm:mr-3">{trailing}</div>}`
with the rest of the old classes left on the child) can change layout in ways no unit test sees: `min-width:auto` of a
flex item now comes from the wrapper's content, a `display:inline-*` child picks up a line-box gap, `align-items:stretch`
no longer reaches the child. Do not argue it from CSS theory; measure it.

**Why:** Menu's `showPaletteTrigger` button became `CommandPaletteTrigger` in a `trailing` slot (2026-10-04). The plan
required the Website to look identical. The A/B probe gave identical button rects at 14 widths on 4 pages, which settled
it in one run (the button is block-level `flex` and fit-content sized, so the wrapper is transparent here).

**How to apply:** serve the HEAD build port-free (mechanics in [[e2e-lazy-mounted-card-needs-scroll]]), with
`javaScriptEnabled: false` so the SSR markup stays put. Measure the element's `getBoundingClientRect()` plus the bar's
`scrollWidth`, then `page.evaluate` the old structure back (move the wrapper's classes onto the child, `wrapper.replaceWith(child)`)
and measure again. The wrapper's utilities exist in the built CSS, so the reconstruction is faithful. Sweep around this
theme's overridden breakpoints (`xs` 576, `sm` 768, `md` 992, `lg` 1200), not Tailwind's defaults. Then do one hydrated
click (JS on) to prove the moved element still works through the compiled package.

Related: [[overflow-hidden-card-clips-focus-ring]], [[optional-peer-entry-from-always-mounted-ui]].
