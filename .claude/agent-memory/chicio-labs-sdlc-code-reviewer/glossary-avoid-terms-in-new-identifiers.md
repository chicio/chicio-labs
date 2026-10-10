---
name: glossary-avoid-terms-in-new-identifiers
description: Implementers name new helpers/files after the UI heading they render ("Open Source" section → openSourceProjects), which lands on a glossary _Avoid_ term; grep every new identifier and test title against the Avoid lists
metadata:
  type: feedback
---

Rule: for every identifier, file name and test title a diff introduces, check it against the `_Avoid_` lines of
`GLOSSARY-MAP.md` and the context `GLOSSARY.md` files, and against any vocabulary instruction in the Approved Plan.
A hit is blocking when the plan or glossary forbids it explicitly.

**Why:** the implementer derives names from what is on screen. The About me section is headed "Open Source", so the
list became `openSourceProjects` / `OpenSourceProject` / `open-source-projects.ts`. But "open source project" is on the
Avoid list of **Standalone Project**, and the plan said in so many words "never 'open source project' as an
identifier". No gate catches it: lint, knip and typecheck are all green, and the Term Check only runs on prompts.

**How to apply:** `grep -n "_Avoid_" GLOSSARY-MAP.md */GLOSSARY.md`, lowercase the hits, and match them against the
camelCase or kebab-case split of each new export, file and `describe`/`it` title in the diff. The compliant direction is
usually to name the helper after the section or the screen element (`openSourceSection`), not after a category of
thing. Pre-existing names, such as the `Projects` component, are not the diff's fault, so leave them alone.

Related: [[fact-sheet-drift-intent-and-authorship]].
