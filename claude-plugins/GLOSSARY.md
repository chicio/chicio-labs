# Agentic Delivery

How code changes to this repository are planned, built and reviewed by agents: the pipeline, its stages, the units of
work it moves through them, and the plugins that ship the agents' tooling.

## Language

### Planning

**Human Gate**:
The single point in a pipeline run where Fabrizio decides: approving the plan in feature mode, or confirming the root
cause in fix mode.
_Avoid_: checkpoint, approval step

**Approved Plan**:
The plan Fabrizio accepted at the Human Gate, including its Work Unit Graph; nothing after the gate reopens it.
_Avoid_: spec, design

**Work Unit**:
A slice of the Approved Plan that can be implemented and tested on its own, owning a declared set of files and naming
the Work Units it depends on.
_Avoid_: task, slice, lane, chunk

**Work Unit Graph**:
The Work Units of an Approved Plan together with their dependencies.
_Avoid_: task list, DAG

**Wave**:
The Work Units whose dependencies are all complete, and so can be implemented at the same time.
_Avoid_: batch, phase

### Checks

**Unit Checks**:
The fast mechanical checks a single Work Unit must pass: lint, architecture validation, typecheck and unit tests.
_Avoid_: gates, pre-checks

**Full Checks**:
Every mechanical check, including the build and the end-to-end suite, run once on all Work Units combined.
_Avoid_: CI, the gate suite

### Review

**Unit Review**:
The review of a single Work Unit's changes, looping with its implementer until it converges.
_Avoid_: per-task review

**Integration Review**:
The review of all Work Units' changes combined, looking for what no Unit Review can see: the seams between them.
_Avoid_: final review, global review

### Tooling

**Project Plugin**:
A Claude Code plugin from this repository's marketplace that only works on this repository.
_Avoid_: local plugin, private plugin

**Public Plugin**:
A Claude Code plugin from this repository's marketplace meant to work in any repository.
_Avoid_: generic package, general-purpose plugin, global plugin

**Mod**:
A plugin whose hooks run inside Claude Code and can draw in its interface, as Claude Code's
[mods](https://claude.dev/blog/getting-started-with-claude-code-mods/) define them. A Mod is a Public Plugin or a
Project Plugin, never a third kind.
_Avoid_: extension, add-on
