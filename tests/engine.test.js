import { test } from "node:test";
import assert from "node:assert/strict";
import {
  fixtures,
  corrected,
  candidate,
  replay,
  money,
  dateValue,
  normalize,
  signature,
  validateFixtures,
  contract,
  report,
} from "../src/engine.js";
test("corrected mapping matches all independently supplied expected outputs", () => {
  const r = replay(fixtures, corrected);
  assert.equal(r.passed, 5);
  assert.equal(r.failed, 0);
  assert.equal(r.changedFields, 0);
  assert.equal(r.actualPaid, r.expectedPaid);
});
test("regression candidate is blocked on all five fixtures", () => {
  const r = replay(fixtures, candidate);
  assert.equal(r.failed, 5);
  assert.ok(r.changedFields > 10);
  assert.throws(() => contract(r));
});
test("integer cents and decimal dollars stay exact", () => {
  assert.equal(money("1250.50", "dollars"), 125050);
  assert.equal(money("0.29", "dollars"), 29);
  assert.equal(money("25000", "cents"), 25000);
  assert.equal(money("0", "cents"), 0);
  for (const v of ["2.345", "1e3", "NaN", "-2", ""])
    assert.throws(() => money(v, "dollars"));
  assert.throws(() => money("2.5", "cents"));
  assert.throws(() => money("9007199254740992", "cents"));
});
test("date parser distinguishes ambiguous formats and rejects impossible dates", () => {
  assert.equal(dateValue("02/03/2025", "MM/DD/YYYY"), "2025-02-03");
  assert.equal(dateValue("02/03/2025", "DD/MM/YYYY"), "2025-03-02");
  for (const [v, f] of [
    ["02/30/2025", "MM/DD/YYYY"],
    ["13/01/2025", "MM/DD/YYYY"],
    ["2025-02-29", "YYYY-MM-DD"],
  ])
    assert.throws(() => dateValue(v, f));
  assert.equal(dateValue("2024-02-29", "YYYY-MM-DD"), "2024-02-29");
});
test("leading-zero identifiers survive string mapping", () => {
  assert.equal(
    normalize(fixtures[0].source, corrected).output.claim_id,
    "00037311",
  );
  assert.equal(
    normalize(fixtures[0].source, candidate).output.claim_id,
    "37311",
  );
});
test("paid-vs-allowed swap is detected even with valid numbers", () => {
  const r = replay(fixtures, { ...corrected, paidSource: "allowed_cents" });
  assert.equal(r.cases[0].diffs.length, 1);
  assert.equal(r.cases[0].diffs[0].field, "paid_cents");
  assert.equal(r.cases[0].diffs[0].sourceField, "allowed_cents");
  assert.equal(r.cases[4].passed, true);
});
test("missing field is an explicit error, not coerced zero", () => {
  const s = { ...fixtures[0].source };
  delete s.net_cents;
  const n = normalize(s, corrected);
  assert.equal(n.output.paid_cents, null);
  assert.match(n.errors.paid_cents, /missing/);
});
test("changing mapping or fixture contents changes replay identity", () => {
  assert.notEqual(
    signature(corrected, fixtures),
    signature(candidate, fixtures),
  );
  const f = structuredClone(fixtures);
  f[0].expected.paid_cents++;
  assert.notEqual(signature(corrected, fixtures), signature(corrected, f));
});
test("fixture validation enforces schema, unique IDs and synthetic references", () => {
  validateFixtures(fixtures);
  for (const edit of [
    (f) => (f[0].source.member_ref = "real-member"),
    (f) => (f[1].id = f[0].id),
    (f) => (f[0].expected.paid_cents = 1.5),
    (f) => delete f[0].source.net_cents,
    (f) => (f[0].expected.service_date = "2025-02-30"),
  ]) {
    const f = structuredClone(fixtures);
    edit(f);
    assert.throws(() => validateFixtures(f));
  }
});
test("contract and replay report preserve config, provenance and test scope", () => {
  const r = replay(fixtures, corrected),
    c = contract(r);
  assert.deepEqual(c.mapping, corrected);
  assert.equal(c.verification.total, 5);
  assert.match(c.scope, /Synthetic/);
  const bad = report(replay(fixtures, candidate));
  for (const v of ["claim_id", "00037311", "allowed_cents", "source"])
    assert.ok(bad.toLowerCase().includes(v.toLowerCase()));
});

test("aggregate amounts never silently exceed safe integer precision", () => {
  const large = fixtures.slice(0, 2).map((fixture) => ({
    ...structuredClone(fixture),
    source: { ...fixture.source, net_cents: "9007199254740991" },
    expected: { ...fixture.expected, paid_cents: Number.MAX_SAFE_INTEGER },
  }));
  const result = replay(large, corrected);
  assert.equal(result.actualPaid, null);
  assert.equal(result.expectedPaid, null);
  assert.equal(result.passed, 2);
});
