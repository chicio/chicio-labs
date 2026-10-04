# Changelog

## [3.1.0](https://github.com/chicio/chicio-labs/compare/matrix-design-system%403.0.0...matrix-design-system%403.1.0) (2026-10-04)

### Features

* **ux:** :lipstick: redesign the Labs Hub and make labs-catalog the single source of every project ([#749](https://github.com/chicio/chicio-labs/issues/749)) ([f9df72f](https://github.com/chicio/chicio-labs/commit/f9df72f7892dc6387d747e7b623f614625bba1d5))

## [3.0.0](https://github.com/chicio/chicio-labs/compare/glossary-browser--v0.2.0...matrix-design-system%402.0.1) (2026-10-03)

### ⚠ BREAKING CHANGES

* **capabilities:** BrandHeader takes required title, tagline and logoAlt; the hard-coded Chicio Coding identity is gone (ADR-0003).
* **capabilities:** Footer takes a required signature instead of author; socialLinks and contactHref are optional; FooterLink gains external.
* **capabilities:** Menu takes a required showPaletteTrigger. When false, no search button and no shortcut hint.

### Features

* **capabilities:** :sparkles: the Labs Hub, and matrix-design-system 3.0.0 with required Host Identity ([#746](https://github.com/chicio/chicio-labs/issues/746)) ([df02a4e](https://github.com/chicio/chicio-labs/commit/df02a4ed3c1b6c1427974434b4ba2ad733d9a83c))
* **capabilities:** :truck: rename the repository to Chicio Labs ([#744](https://github.com/chicio/chicio-labs/issues/744)) ([76bbab2](https://github.com/chicio/chicio-labs/commit/76bbab2faaa1681bc9c9a2f7cacfa4ef77001e0e))

### Bug Fixes

* **ux:** :bug: serve the labs hub from labs.fabrizioduroni.it ([#743](https://github.com/chicio/chicio-labs/issues/743)) ([fb8b0d7](https://github.com/chicio/chicio-labs/commit/fb8b0d77cc1719c57b792f952764001944218890))
* **ux:** :lipstick: rework the Labs Hub after the first look ([#747](https://github.com/chicio/chicio-labs/issues/747)) ([f9ff572](https://github.com/chicio/chicio-labs/commit/f9ff5723cef2f4ef6e320bafe0742dafeef06a52))

## [2.0.1](https://github.com/chicio/chicio-labs/compare/matrix-design-system%402.0.0...matrix-design-system%402.0.1) (2026-10-03)

### Features

* **ai:** :sparkles: adopt the GLOSSARY convention and add a README to each plugin ([#740](https://github.com/chicio/chicio-labs/issues/740)) ([d28fed4](https://github.com/chicio/chicio-labs/commit/d28fed493b970e5469cf156b34ab54c180c63abc))
* **capabilities:** :sparkles: add the Manga Collection and share the collection components ([#715](https://github.com/chicio/chicio-labs/issues/715)) ([37a216b](https://github.com/chicio/chicio-labs/commit/37a216bdf6ccfbf97601cef212ac9d9f05055603))
* **capabilities:** :truck: rename the repository to Chicio Labs ([#744](https://github.com/chicio/chicio-labs/issues/744)) ([76bbab2](https://github.com/chicio/chicio-labs/commit/76bbab2faaa1681bc9c9a2f7cacfa4ef77001e0e))

### Bug Fixes

* **ux:** :bug: serve the labs hub from labs.fabrizioduroni.it ([#743](https://github.com/chicio/chicio-labs/issues/743)) ([fb8b0d7](https://github.com/chicio/chicio-labs/commit/fb8b0d77cc1719c57b792f952764001944218890))

## [2.0.0](https://github.com/chicio/chicio-blog/compare/matrix-rain-webgpu%402.0.3...matrix-design-system%401.1.0) (2026-09-28)

### ⚠ BREAKING CHANGES

* **capabilities:** Footer no longer takes navHrefs and navTracking. It receives links (label, to, onClick) and contactHref.
* **capabilities:** Menu no longer takes navHrefs and tracking. It receives entries (links and dropdowns of grouped links), pinnedOnPaths and per-link onClick.

### Features

* **capabilities:** :boom: design system Menu and Footer take injected navigation (v2.0.0) ([#712](https://github.com/chicio/chicio-blog/issues/712)) ([317165c](https://github.com/chicio/chicio-blog/commit/317165ced546bf3fd34ad6e200bc71d4f84ea68a))

## [1.1.0](https://github.com/chicio/chicio-blog/compare/matrix-design-system%401.0.0...matrix-design-system%401.1.0) (2026-08-30)

### Features

* **capabilities:** :sparkles: publish the design system as a Storybook showcase ([#547](https://github.com/chicio/chicio-blog/issues/547)) ([d094849](https://github.com/chicio/chicio-blog/commit/d094849f5ff4ee72488d160b9effc19063ad8d52))

### Bug Fixes

* :bug: skip release-it's npm auth precondition under trusted publishing ([#546](https://github.com/chicio/chicio-blog/issues/546)) ([023d170](https://github.com/chicio/chicio-blog/commit/023d1704168f8e73b2096562012aa706b37d6084))
