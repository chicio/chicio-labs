# labs-catalog

The public facts about every Lab Project and every Standalone Project (name, type, description, links and card
image), in one place. The Labs Hub and the Website's About me both read it, so a new project is described once.
Private: it is never published to npm. The decision behind it is
[ADR-0008](../../docs/adr/0008-labs-catalog-package.md).

## What it exports

```ts
import { labProjects, standaloneProjects, cardImagePath } from "labs-catalog";
```

- `labProjects`: the Lab Projects, each with `kind`, a free-form `type` label, `description`, `links` and an optional
  `cardImage`.
- `standaloneProjects`: the open-source work that lives in its own repository, each with a `meta` (language or
  platform) and a `cardImage`.
- `cardImagePath(project)`: where the project's card image is served from, relative to the package
  (`media/<id>.<ext>`), or `undefined` when it has none.

The built package serves each image at `labs-catalog/media/<file>`.

## Card images

A Lab Project keeps its identity images in its Brand Kit, the `brand/` folder at its own root, and `cardImage` is a
path inside it. A Standalone Project has no repository folder here, so its images live in `media/standalone/`.

`npm run build` validates the catalog (every id unique, every link an https URL, every card image present and inside
its own folder) and fails when it is not sound; it then copies every card image into `dist/media/`, which is
gitignored. Nothing is committed twice.

## Adding a project

Add it to `src/catalog.ts`. For a Lab Project, put its card image in its own `brand/` folder and register it in the
Labs Hub's `registry.ts` too, which carries what is about documentation (manifests, READMEs, CHANGELOGs).
