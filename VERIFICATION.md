# Verification

Locally verified on October 27, 2026 with Node 24 and Google Chrome.

## Automated checks

- `npm test`: 11 tests passed.
- Corrected mapping: 5/5 fixtures match, zero field differences.
- Deliberate regression: 0/5 fixtures match, 20 field differences.
- Tests cover exact cents conversion, decimal precision, invalid and ambiguous dates, leap dates, leading-zero identifiers, paid-versus-allowed semantics, missing-value errors, replay identity, synthetic fixture validation, and contract/report scope.
- `npm run build`: passed.
- `npm run replay`: exit 0 on the corrected mapping.
- CLI regression with example configuration and fixtures: exit 1, five failed fixtures, 20 field differences. JSON result was written and inspected.
- Local preview: HTTP 200.

## Browser workflows

- Inspected the broken mapping and field-level candidate/expected differences.
- Loaded corrected configuration, replayed, and verified 5/5 passed and no difference rows.
- Verified the mapping-contract export was enabled after that replay.
- Changed the paid source field after a passing result. Verified contract export immediately became disabled without a new replay.
- Edited fixtures with a duplicate ID and verified a clear rejection.
- Added a sixth synthetic fixture, replayed the corrected mapping, and verified 6/6 passed. Reload confirmed the fixture count persisted.
- Restored the original five fixtures and verified both the failing and corrected configurations again.
- Exercised mapping-contract export. Automation timed out during the browser download action; completed download on disk was not independently verified. Export-generation functions are tested and generated artifacts are included in examples/.
- At 390 x 844, both the mapping page and verification record had document width 390 px. The data table scrolls inside its own container.
- Fixed an oversized mobile artifact dialog, then verified its width was 360 px at the 390 px viewport. Escape dismissed the dialog.
- No captured browser console errors or warnings in the final check.
- Captured and visually inspected the real local screenshots. Transient replay notifications were removed by recapturing from recomputed page-load results.

No live Amera integration, claim-processing accuracy, healthcare compliance, real-data generalization, or production-scale performance was tested or claimed. GitHub Actions is configured; its remote result is separate from the completed local checks.

## Product refinement

Additional verification on October 27, 2026:

- `npm test`: 15 tests pass after refinement. Added rule-level effect grouping, an unexercised-rule coverage case, the four-correction path, and review identity checks.
- The initial 20 field differences are grouped into four changed rules. Money encoding affects five fixtures and ten output fields when restored in isolation; paid-source selection affects four fixtures. Counts deliberately overlap.
- Applied the money rule alone in the browser: differences fell from 20 to 14; three changed rules remained. Applied each remaining rule: zero differences and five passing fixtures.
- Verified a passing run still requires a reviewer note for contract export.
- Recorded an engineering review, reloaded, and confirmed the same saved replay and review restored with export enabled.
- Inspected a historical replay through a read-only artifact view, including its associated review note.
- Ran the same passing mapping again: the new run required a new review. Old notes did not authorize the new run.
- Tests verify changing config, changing fixture content, a failing replay, or an inadequate review note cannot produce a reviewed handoff.
- Reviewed JSON exports now include source fixtures, expected outputs, candidate outputs, the reference mapping, and the run-bound reviewer note. Markdown reports include matching review metadata.
- Phone view at 390 x 844: document width 390 px; artifact dialog width 360 px.
- Tablet view at 768 x 1024: document width 768 px.
- Final screenshots are stored in `screenshots/refined/`. They show the initial change review, a semantic paid-field difference after correcting money scale, and the reviewed passing handoff.

Earlier export-download automation limits remain as recorded above. Local state is an engineering demonstration, not authenticated approval or a tamper-resistant audit system.
