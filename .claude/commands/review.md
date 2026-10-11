---
description: Review the current diff (or a branch/PR/path) against the rulebook and definition of done
argument-hint: "[branch | PR | path] — defaults to the current diff"
---

Review target: $ARGUMENTS (empty = the current working-tree diff)

Delegate to the `reviewer` subagent with the target. It follows
`brain/03-loop-engineering/review-loop.md` and returns the findings table from
`output-contracts.md` §Review. Relay its table and verdict; do not apply fixes unless asked.
