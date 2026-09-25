# 2026.09 Stable Baseline

This release establishes the first documented stable baseline for the public GMSM-calculator repository.

## Project scope

The live site currently provides 15 main tools for Global MapleStory M players:

- 6 simulators
- 5 calculators
- 4 HEXA-related tools

## Maintenance improvements included in this baseline

- Refreshed project README to reflect the current live toolset
- Added MIT License for original project code and other licensable original material
- Added third-party notices clarifying that MapleStory / MapleStory M trademarks, artwork, icons, images, and other game materials are not covered by the MIT License
- Added structured GitHub Issue Forms for bug reports and data / formula discrepancies
- Added lightweight GitHub Actions validation for required project files and JavaScript syntax
- Documented the maintainer / AI-assisted development workflow more clearly

## Validation

The first `Validate project` GitHub Actions run passed successfully before the maintenance workflow was merged into `main`.

The validation currently checks:

- required repository files are present
- `script.js` parses successfully with `node --check`
- `craft-effects.js` parses successfully with `node --check`
- README links to the local license and third-party notice files

This validation does not claim to verify gameplay formulas or numerical correctness. Formula and data changes still require evidence-based review against game data and practical testing.

## Runtime impact

The OSS-readiness and maintenance changes included in this baseline do not modify calculator formulas, HTML behavior, CSS presentation, game assets, or live-site logic.

## Project

Live site: https://remus1224.github.io/GMSM-calculator/

Repository: https://github.com/Remus1224/GMSM-calculator

---

This is an unofficial, non-commercial community project and is not affiliated with, endorsed by, or sponsored by NEXON or the MapleStory / MapleStory M development and publishing teams.
