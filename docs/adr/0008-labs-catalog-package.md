# The public facts about every Lab Project and Standalone Project live in one package

The Labs Hub and the Website's About me both list Fabrizio's open-source work, and each kept its own copy: the hub in
its registry, the Website in a TypeScript file next to About me, and the chat prompt in a third hand-written list. The
public facts (name, type, description, links, card image) now live in a private workspace package,
`packages/labs-catalog`, and both apps depend on it. Card images stay in each Lab Project's own Brand Kit (its `brand/`
folder); the package's build gathers them into its `dist/`, so no image is committed twice.

## Considered Options

- **The Website reads the hub's data, or the hub reads the Website's, by relative path**: rejected. Turborepo and
  Vercel's deploy skipping ([ADR-0004](0004-vercel-deploy-skipping.md)) only see dependencies between workspaces, so a
  change to the data would not rebuild the app reading it.
- **The Website fetches a JSON the hub publishes**: rejected, because it ties the Website's build to the hub's last
  deploy.
- **About me links out to the hub instead of listing anything**: rejected. About me should still show the work, and
  its Markdown Representation and the chat should see it too.
- **Copy every card image next to the code that renders it**: rejected. Each image was already declared in four places
  (registry, Vite glob, turbo inputs, `pages.yml`); copies would have added a fifth.

## Consequences

- The package's turbo inputs include every Brand Kit (`{apps,packages,claude-plugins}/*/brand/**`). A change to a
  Brand Kit alone rebuilds the hub, but it redeploys the Website only when the Website's own workspace is affected; the
  weekly scheduled rebuild covers the rest.
- The hub's `registry.ts` keeps only what is about documentation (manifests, READMEs, CHANGELOGs, glossaries); a new
  Lab Project is registered in both places.
