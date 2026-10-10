---
name: data-redundant-filter-guard-equivalent-mutant
description: A list filter with two conditions where today's data makes one redundant (no Workbench has a cardImage) gives an equivalent mutant; "excludes X by name" tests over the real catalog are vacuous; demand a fixture
metadata:
  type: feedback
---

Rule: when a selector over real module-level data combines guards (`kind === "workbench" || image === undefined`),
check whether the current data already satisfies one guard through the other. If it does, deleting that guard
changes nothing today, and a test that asserts "X is left out" against the real data passes either way. Prove it with
a mutant in the shadow tree; a surviving mutant on a plan-specified rule is a blocking vacuous test.

**Why:** in the labs-catalog About me list, the plan said "published Lab Projects (not Workbench)". The code had the
Workbench guard, and the test "leaves out the Workbench" asserted that "Chicio Labs SDLC" was absent. No Workbench
entry has a `cardImage`, though, so the image guard already dropped them, and removing the Workbench guard left all
29 tests green. A self-oracle test that re-derives the same filter expression does not help either. The rule only
starts to matter when someone adds a card image to a Workbench project (the Labs Hub already has a Brand Kit image),
and at that point nothing protects it.

**How to apply:** for each filter clause, ask: "is there a real record where only this clause decides?" If not, the
test needs a fixture that `vi.mock`s the data module (or a selector that takes the data as an argument) with a record
where only that clause decides. Branch coverage does not help: the true branch of the redundant clause is still hit.

Related: [[verify-mutation-claims-in-a-shadow-src-tree]], [[hrefless-anchor-invisible-to-link-role]],
[[content-conversion-self-oracle-tests]].
