# Glossary Map

## Language

**Chicio Labs**:
Fabrizio Duroni's lab: the one repository where he experiments with code, AI and computer graphics, and from which every
Lab Project is published.
_Avoid_: monorepo, fabrizioduroni.it labs

**Lab Project**:
One thing built in Chicio Labs, such as the Website, a package or a plugin, whether it is published or only used inside
the lab.
_Avoid_: project, experiment

**Labs Hub**:
The Chicio Labs site that presents every Lab Project and links out to each one's Showcase.
_Avoid_: labs website, landing page, GitHub Pages site

**Workbench**:
The Lab Projects that only work inside Chicio Labs, the tools the published ones are built with.
_Avoid_: internal, private projects, tooling

**Brand Kit**:
The images that identify a Lab Project (its logo, icon and card image), kept inside the Lab Project itself. The Website
builds its Host Identity from its own Brand Kit.
_Avoid_: assets, branding, media

**Standalone Project**:
Open-source work by Fabrizio Duroni that lives in its own repository rather than in Chicio Labs; the Labs Hub lists it
next to the Lab Projects, but it is not one.
_Avoid_: open source project, side project, external project

## Contexts

- [Website](./apps/website/GLOSSARY.md): Fabrizio Duroni's personal site, its content (posts, the DSA course, the videogame
  collection, art) and the interactive layer around it (chat, terminal, easter eggs)
- [Matrix Design System](./packages/matrix-design-system/GLOSSARY.md): the published, framework-agnostic Matrix-themed UI
  library, together with the component-store contract (`packages/matrix-component-store`) and the rules that enforce it
  (`packages/eslint-plugin-chicio`); its showcase is `apps/matrix-design-system-showcase`
- [Matrix Rain](./packages/matrix-rain-webgpu/GLOSSARY.md): the published WebGPU digital-rain background effect; its
  showcase is `apps/matrix-rain-showcase`
- [Agentic Delivery](./claude-plugins/GLOSSARY.md): how agents plan, build and review code changes to this repository (the
  SDLC pipeline, its Human Gate and its Work Units, and the plugins that ship its tooling)

## Relationships

- **Website → Matrix Design System**: the Website renders the design system through its own Next bindings, injecting
  links, images, the current path and the site's branding; the design system knows nothing about the Website
- **Website → Matrix Rain**: the Website mounts the rain as its page background and exposes its settings to the visitor
- **Matrix Design System ↔ Matrix Rain**: independent; neither imports the other
- **Agentic Delivery → all**: it changes the other three contexts' code and uses their language; none of them knows it
