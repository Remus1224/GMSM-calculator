# 2026.09.1 Light Sanctum Simulator

This release records the first feature milestone after the `2026.09` stable baseline.

## New tools since 2026.09

The live site now provides **17 main tools**:

- 8 simulators
- 5 calculators
- 4 HEXA-related tools

Two new public tools were added after the previous baseline:

- **1204 Generator**
- **Light Sanctum Pray Simulator**

## Light Sanctum Pray Simulator

The new Light Sanctum Pray Simulator adds a dedicated browser-based restoration / simulation experience for the Light Sanctum prayer interface.

The work included, among other things:

- a dedicated `light-sanctum-pray/` application route
- restored UI presentation and interaction behavior
- pray confirmation popup behavior
- fullscreen presentation work
- click-sound support and a sound toggle
- mobile click-audio latency fixes
- browser acceptance / verification work before publication

This release records the public, user-facing simulator that is now linked from the main toolbox.

## 1204 Generator

The `1204/` tool was also added after the previous stable baseline and is now included in the public tool count and README.

## Maintenance and validation

The repository README has been updated from 15 to 17 public tools.

The existing GitHub Actions validation has also been expanded so CI now checks the presence and JavaScript syntax of the two newly added standalone tools, in addition to the existing main-site checks.

CI is intended to catch repository-structure and JavaScript syntax regressions. It does not claim to verify gameplay formulas, reverse-engineered game behavior, visual parity, or numerical correctness; those still require evidence-based and browser testing.

## Release history

- `2026.09` — first documented OSS stable baseline
- `2026.09.1` — 1204 Generator + Light Sanctum Pray Simulator milestone

## Project

Live site: https://remus1224.github.io/GMSM-calculator/

Repository: https://github.com/Remus1224/GMSM-calculator

---

This is an unofficial, non-commercial community project and is not affiliated with, endorsed by, or sponsored by NEXON or the MapleStory / MapleStory M development and publishing teams.
