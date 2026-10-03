# Matrix Design System

The published, framework-agnostic React UI library that gives the site its Matrix look: green on near-black,
terminal-flavoured, and knowing nothing about the application that renders it.

## Language

### Component store

**Component Store**:
What a component's own store hook hands it: the State Store and the Effects Store it renders from.
_Avoid_: bare "store", view model, controller

**State Store**:
The values a component renders, already derived; a component may have only this half.

**Effects Store**:
The handlers a component calls, already bound to their arguments; a component may have only this half.
_Avoid_: callbacks, actions

**Shared Store**:
A value that lives outside every component, persists per browser, and any Component Store may read, such as the Motion
Preference.
_Avoid_: bare "store", global store

**Presentational Component**:
A component with no store of its own, rendering only what its props give it.

### Framework independence

**Binding**:
A framework-specific version of a design-system component that supplies what the design system cannot know itself:
the link and image implementations, the current path and the host's assets.
_Avoid_: adapter, wrapper

**Host Identity**:
The name, tagline, logo and signature a host presents itself with in the header and footer. The host always supplies
it; the system never assumes one.
_Avoid_: branding, brand

**Prefetch Strategy**:
When a link asks for its destination ahead of the click: on entering the viewport, on hover, or never; how it does so
is the Binding's business.

### Look and feel

**Matrix Theme**:
The fixed palette and fonts of the system: phosphor greens on near-black.
_Avoid_: Matrix palette, tokens

**Terminal Chrome**:
The look of a computer terminal: the `>` prompt, the blinking cursor and typed lines that succeed, fail or quote.
_Avoid_: using bare "chrome", which also means page layout and the browser

**Terminal Window**:
A panel dressed as a terminal session: a prompt header, a body and a footer of key hints.

**Pill**:
The film's red or blue pill, used as a button or link motif.
_Avoid_: pill button, when the motif itself is meant

**Project Card**:
A glowing card presenting one thing someone built: its name, a description, its features, calls to action and an
image.
_Avoid_: feature card, showcase card

**Motion Preference**:
The visitor's own choice, made on the site, to turn animation on or off.
_Avoid_: reduced motion, which is the operating-system setting

**Showcase**:
The browsable catalogue of every component and its states, published alongside the package.
_Avoid_: storybook, demo
