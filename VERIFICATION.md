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
