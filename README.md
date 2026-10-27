# Amera Adapter Lab

A working, independent engineering concept built by C Abhineeth for Amera's custom claims-format integration workflows.

A source field containing `25000` can mean $250.00 or $25,000.00. An allowed amount can look perfectly valid while being the wrong field for paid amount. A format mapping needs tests that preserve meaning, not just valid JSON.

Adapter Lab replays synthetic source fixtures against explicitly supplied expected outputs, shows field-level differences and source provenance, and permits mapping-contract export only when the current configuration agrees with every selected fixture.

![Change review](screenshots/refined/01-change-review.jpg)

## Run

Requires Node.js 20.19+ or 22.12+.

```sh
npm ci
npm run dev
```

Open http://127.0.0.1:5184/.

```sh
npm test
npm run build
npm run replay
```

## The refined workflow

The primary view is a change review, not a grid of unexplained test failures.

1. Compare the bundled `harbor-v1` reference with a deliberately changed `harbor-v2` candidate.
2. Inspect **four changed rules**, rather than diagnose 20 differences from scratch. Each rule shows its reference setting, candidate setting, and the outputs affected by restoring just that rule. Counts overlap when rules affect the same fields.
3. Follow a record from its raw source through the reference output to the candidate output, alongside the explicit expected value. For example, after fixing money scale, allowed amount is still $220.00 where paid amount should be $200.00.
4. Use **Apply rule & replay** to restore one reference rule. The money correction takes the sample from 20 to 14 differences. Restoring the remaining three rules produces zero differences.
5. Each replay saves a snapshot with a run ID, configuration, source fixtures, expected values, and candidate outputs. Up to 12 runs remain available as read-only views on this browser.
6. Open **Run record**, inspect the passing result, and record a reviewer name and note. The note is bound to this exact run and fixture/configuration identity. A fresh replay requires a fresh review, even when its configuration is identical.
7. Export the reviewed JSON handoff. It includes the mapping, reference mapping, source fixtures, expected outputs, candidate outputs, run ID, and review. Markdown exports also include a matching review note when one exists.
8. Use **Mapping rules** for manual configuration and **Fixture library** to edit the synthetic test set. Mapping or fixture changes invalidate the current result. A changed rule that has no observable effect on the selected fixtures is explicitly shown as a coverage gap.

A reference-rule correction is a proposed restoration to the bundled reference, not an inferred fix for an unknown payer contract. Expected outputs remain explicit engineering assumptions.

Configuration, fixtures, saved replay snapshots, and review notes persist in localStorage. The latest matching saved replay is restored on reload. Browser history is local and editable outside the UI; it is not a tamper-proof audit log or authenticated approval system.

## Headless replay

The UI and CLI use the same pure functions in `src/engine.js`.

```sh
node scripts/replay.js examples/mapping-corrected.json examples/synthetic-fixtures.json
```

This exits **0** when all expected fields match. The deliberate regression exits **1**:

```sh
node scripts/replay.js examples/mapping-regression.json examples/synthetic-fixtures.json
```

An optional fourth argument writes the complete JSON result:

```sh
node scripts/replay.js examples/mapping-corrected.json examples/synthetic-fixtures.json replay-result.json
```

Invalid configuration or fixture input exits **2**. A GitHub Actions workflow runs the tests, build, and corrected replay on pushes and pull requests.

## What is actually implemented

- String-safe claim IDs, including leading zeros.
- Strict calendar validation with explicit US, day-first, or ISO date conventions.
- Exact conversion of decimal dollar strings into integer cents, without floating-point multiplication of decimal fractions.
- Configurable billed and paid source-field selection.
- Explicit missing-value errors; absent paid values are not silently converted to zero.
- Per-field source names, raw values, applied transformations, expected values, and candidate outputs.
- Editable synthetic fixture sets with validation.
- Replay identity based on both the full configuration and fixture contents.
- A current-run review gate, evidence-rich JSON handoff, Markdown replay report, and inspectable artifact previews.
- Rule-level change analysis, individual correction/replay, source/reference/candidate traces, and saved replay history.
- Browser-local state, responsive layouts, keyboard focus containment, and Escape dismissal.

## Why this is relevant to Amera

Research performed on October 27, 2026:

- [Amera's website](https://www.amerahealthsolutions.com/) describes multi-format normalization, integration with existing systems, claims pre-processing, stop-loss reporting, and operational visibility.
- [Amera's YC company page](https://www.ycombinator.com/companies/amera) describes a unified data layer mapping healthcare documents to hundreds of custom formats.
- [The clearinghouse page](https://www.amerahealthsolutions.com/solutions/unconventional-claims-clearinghouse) describes converting heterogeneous inputs into consistent claims workflows.
- [The pre-processing page](https://www.amerahealthsolutions.com/solutions/intelligent-claims-pre-processing) already advertises validation and routing, so this prototype does not rebuild those broad capabilities.

The proposed contribution is a narrow integration-engineering workbench for regression testing mapping changes before they enter downstream workflows. It is not a verified gap in Amera's private product, and no access to their code, customer data, schemas, or infrastructure was available. There is no guarantee of business impact or hiring response.

The design takes its direction from Amera's live site: warm off-white surfaces, editorial serif headings, generous spacing, and restrained teal accents. No proprietary product code, customer data, or marketing images were copied.

## Scope and limits

All five bundled records and the Harbor TPA name are fictional. Member references start with `SYN-`. The example target schema is authored for this prototype; it is not an Amera, X12, FHIR, HIPAA, or carrier-approved schema.

The app consumes JSON fixtures containing already parsed CSV-shaped source fields and independently supplied expected outputs. It does not parse raw CSV, EDI, PDFs, scanned documents, or receipt images. It does not use an LLM, perform medical coding, verify eligibility, adjudicate claims, calculate member liability, or submit claims to any system.

The finite synthetic fixture set is a demonstration, not exhaustive validation. Matching fixtures does not prove real-world correctness, security, regulatory compliance, financial reconciliation, throughput, or production readiness. The examples cover non-negative source amounts; adjustments, reversals, multi-line claims, and payer-specific contracts need additional models and fixtures. Values use safe JavaScript integers. Browser financial totals are illustrative fixture aggregates, not a ledger.

No application records are transmitted to a backend. Google Fonts is requested for open-source typography, with system fallbacks. Browser localStorage is not a secure production claims environment; use synthetic data only.

## Repository guide

- `src/engine.js`: normalization, fixtures, replay, validation, and export logic.
- `src/main.jsx`: interactive mapping, fixture library, and verification views.
- `scripts/replay.js`: CLI entry point.
- `tests/engine.test.js`: fifteen engine tests, including change grouping, fixture coverage gaps, and run-bound review invalidation.
- `src/ChangeReview.jsx`: task-focused comparison and correction workflow.
- `src/refinement.css`: responsive layout for the review and handoff.
- `examples/`: fixture JSON, corrected and broken configurations, verification contract, and regression report.
- `screenshots/refined/`: three current local-browser captures. The original screenshots remain in `screenshots/` for reference.
- `VERIFICATION.md`: evidence and remaining verification limits.
- `OUTREACH.txt`: copy-ready email with literal repository and resume URLs.
