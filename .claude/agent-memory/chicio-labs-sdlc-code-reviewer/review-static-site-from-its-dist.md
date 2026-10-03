---
name: review-static-site-from-its-dist
description: For apps/labs-hub (or any Astro static workspace) review the implementer's existing dist/ with a python scan (empty fields, unresolved internal hrefs, duplicate ids) — no build, no port; manifest-driven fields hide empty values
metadata:
  type: feedback
---

When a Unit Review covers a static Astro workspace (`apps/labs-hub`, `apps/matrix-rain-showcase`), the implementer
usually leaves a fresh `dist/` in the Work Unit's worktree. Check its mtime against the last source commit
(`git log --format='%h %ad' --date=format:%H:%M`), then scan it with a read-only python script instead of building:

- every `href`/`src` starting with `/` must resolve to a file (`<path>/index.html` for trailing slashes); ignore
  matches inside `<pre>` (code samples like `src="/art/x.jpg"` are false positives)
- duplicate `id=` per page (a wrapper `id="glossary-map"` plus rehype-slug on the document's own h1 collided)
- empty rendered fields: `<p></p>` in cards, `content=""` in meta tags

**Why:** the Labs Hub reads description/version from manifests, and its build guard only failed when README AND
description were both missing. `apps/website/package.json` has no `description` (and a stale `version`; the Website's
real version is the root `package.json`), so the catalog's first Project Card shipped an empty description and
`/lab/website/` an empty meta description, with tests, typecheck and the build all green. Only the dist showed it.

**How to apply:** for any page fed by optional manifest/frontmatter keys, list the real values for every registered
entry (one `python3` over the JSON files) before trusting a "falls back to X" claim. A guard that checks
"neither source present" does not catch "source present but empty". Avoid `node -p` inside a shell `for` loop: the
worktree-isolated Bash refuses it as unverifiable — do the loop in python. See also [[run-knip-in-unit-review]].
