---
name: migration-notes-vs-last-released-api
description: A "Migrating from N.x" section written on a feature branch tends to describe the branch's own unreleased intermediate API (props that never shipped) and to list only the latest commit's breaks; diff it against the last released version on origin/main
metadata:
  type: feedback
---

Rule: when a diff adds or edits a package README "Migrating from N.x" section, check it against the API of the last
*released* version, not against the branch base. Read the version from `git show origin/main:packages/<pkg>/package.json`,
then `git show origin/main:<component file>` for what consumers actually have, and
`git log --oneline $(git merge-base origin/main HEAD)..HEAD -- packages/<pkg>` for every breaking commit since.

**Why:** in the Labs Hub follow-up (2026-10-04) the new "Migrating from 2.x" told 2.x users that `Menu`'s
`showPaletteTrigger` was gone, a prop that only ever existed in an earlier commit of the same unreleased 3.0.0 branch (2.x
always rendered the button). It also listed only the Menu change and the type rename, leaving out the other 3.0.0 breaks
(`BrandHeader` `title`/`tagline`/`logoAlt` and `Footer` `signature` now required). Two Work Units each added a break,
and the guide was written by the second.

**How to apply:** non-blocking by the severity model (docs), but name each missing or phantom item. Squash-merge means
the CHANGELOG comes from the PR's one commit, so the README section is the only migration guide outside consumers get.
