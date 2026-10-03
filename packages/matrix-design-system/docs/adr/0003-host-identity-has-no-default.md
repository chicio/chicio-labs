# Host Identity is required, never defaulted

The header and footer once hard-coded the Website's Host Identity ("CHICIO CODING", "Pixels. Code. Unplugged.", the
"Made with 💝 by … 'Chicio'" signature), and `Menu` always rendered the Website's command-palette trigger. When the Labs
Hub became a second host, these became required props with no default (`BrandHeader` `title`, `tagline`, `logoAlt`;
`Footer` `signature`), and the Website passes its own values like any other host.

The palette trigger is not Host Identity, it is optional UI: it moved out of `Menu` into a `trailing` slot filled by the
host, with `CommandPaletteTrigger` (from `matrix-design-system/command-palette`) as the ready-made content. A host
without a palette passes nothing.

## Considered Options

- **Optional props defaulting to the Website's values**: zero change on the Website and a non-breaking minor release,
  but every new host would silently inherit the Website's name unless it remembered to override it, and the package
  would keep one application's identity baked in, against [ADR-0001](0001-framework-agnostic-with-bindings.md).

## Consequences

- It was a breaking change, released as `matrix-design-system` 3.0.0.
