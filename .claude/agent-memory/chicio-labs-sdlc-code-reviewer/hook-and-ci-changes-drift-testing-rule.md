---
name: hook-and-ci-changes-drift-testing-rule
description: .claude/rules/testing.md quotes .husky/pre-push verbatim and draws the CI job graph; a diff that edits the hook or a ci.yml job leaves it stale, and a plan scoped to "own the hook file" never lists it
metadata:
  type: feedback
---

Rule: when a diff touches `.husky/pre-push` or adds/reorders a job in `.github/workflows/ci.yml`, open
`.claude/rules/testing.md` ("Pre-Push Hook (.husky/pre-push)" code block, "CI Shape" diagram, "Verification Checklist")
and diff it against the new file. A missing line there is a finding.

**Why:** the rule file loads into every agent working on tests and is the place they learn what the hook runs. It
copies the hook as a code block, so it does not degrade gracefully: it states the old hook as fact. Plans for a hook
change own only the hook (a fix-mode Work Unit lists exactly the files it edits), so nobody is assigned the doc and no
gate reads it (`.claude/` is in `.prettierignore`, and no checker parses rule prose). The CI Shape diagram already
omits the `format` job, which `build` needs.

**How to apply:** if the Approved Plan scoped the doc out, report it non-blocking with the exact line to add, so the
main thread can fold it in before opening the PR; if the plan claimed to document the hook, it is blocking. Also dry-run
the hook's first command in the MAIN checkout (read-only): a hook runs against the working tree, and prettier reads only
the root `.gitignore`, so a nested `.gitignore` (the main checkout's `venv/`) does not hide files from it. Related:
[[run-prettier-check-in-unit-review]], [[narrowing-a-doc-claim-drops-a-manifest]].
