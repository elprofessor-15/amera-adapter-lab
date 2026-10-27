import React, { useState } from "react";
import {
  Play,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  AlertCircle,
  GitBranch,
  FileText,
  ChevronRight,
  Check,
  SlidersHorizontal,
  RotateCcw,
} from "lucide-react";
import { compareRules, referenceMapping, normalize, replay } from "./engine";
const money = (n) =>
  n === null
    ? "Not available"
    : new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(n / 100);
const display = (value, field) =>
  value === null
    ? "Invalid output"
    : field.endsWith("_cents")
      ? money(value)
      : String(value);
export default function ChangeReview({
  state,
  result,
  fresh,
  onReplay,
  onFix,
  onEdit,
  onRelease,
  onReset,
  onInspect,
}) {
  const [selectedRule, setSelectedRule] = useState("moneyEncoding"),
    [fixtureId, setFixtureId] = useState(null);
  const items = result.cases,
    rules = compareRules(items, result.config),
    rule = rules.find((r) => r.key === selectedRule) || rules[0];
  const record =
    (rule
      ? items.find((c) => c.id === (fixtureId || rule.affected[0]?.id))
      : null) || items[0];
  const ref = normalize(record.source, referenceMapping),
    field = rule?.field || "paid_cents";
  const refRun = replay(items, referenceMapping);
  return (
    <div className="change-review">
      <div className="change-title">
        <div>
          <span className="eyebrow">
            INTEGRATION ENGINEERING / CHANGE REVIEW
          </span>
          <h1>
            Review the change.<em> Keep the meaning.</em>
          </h1>
          <p>
            Harbor TPA <span>/</span> Legacy claims feed <span>/</span>{" "}
            {result.total} synthetic fixtures
          </p>
        </div>
        <button className="button primary" onClick={onReplay}>
          <Play size={14} />
          Replay candidate
        </button>
      </div>
      <div
        className={
          "review-alert " +
          (!fresh ? "pending" : result.failed ? "attention" : "success")
        }
      >
        <span>
          {!fresh ? (
            <AlertCircle size={16} />
          ) : result.failed ? (
            <AlertCircle size={16} />
          ) : (
            <CheckCircle2 size={16} />
          )}
        </span>
        <div>
          <strong>
            {!fresh
              ? "Candidate changed. These results need a new replay."
              : result.failed
                ? `${rules.length} changed rules to inspect. ${result.failed} fixtures differ.`
                : "All expected fields match in this fixture set."}
          </strong>
          <p>
            {!fresh
              ? "The panels below describe the last completed replay. Exports remain locked."
              : result.failed
                ? "Start with a rule, follow its values, then replay the correction."
                : "Review this exact run and its limits before exporting the handoff."}
          </p>
        </div>
        <span className="run-label">{result.runId || "LOCAL RUN"}</span>
      </div>
      <div className="version-comparison">
        <section className="version-card">
          <div className="version-top">
            <span>
              <span className="version-dot reference" />
              REFERENCE MAPPING
            </span>
            <span className="version-tag">Bundled example</span>
          </div>
          <div className="version-name">
            <GitBranch size={16} />
            <strong>{referenceMapping.version}</strong>
            <span>
              {refRun.passed}/{refRun.total} fixture matches
            </span>
          </div>
          <p>
            String identifiers · US dates · Integer cents · Paid from net_cents
          </p>
        </section>
        <div className="version-arrow">
          <ArrowRight size={19} />
        </div>
        <section className="version-card candidate">
          <div className="version-top">
            <span>
              <span
                className={
                  "version-dot " + (result.failed ? "warning" : "reference")
                }
              />
              CANDIDATE MAPPING
            </span>
            <button onClick={onEdit}>
              Edit rules <SlidersHorizontal size={12} />
            </button>
          </div>
          <div className="version-name">
            <GitBranch size={16} />
            <strong>{result.config.version}</strong>
            <span className={result.failed ? "warning-text" : ""}>
              {result.passed}/{result.total} fixture matches
            </span>
          </div>
          <p>
            {rules.length
              ? `${rules.length} rules differ from the reference. Inspect their effects below.`
              : "Same field interpretation as the reference. Version identity is retained."}
          </p>
        </section>
      </div>
      <div className="change-summary">
        <span>
          <b>{result.changedFields}</b> field differences
        </span>
        <span>
          <b>{money(result.expectedPaid)}</b> expected paid total
        </span>
        <span>
          <b
            className={
              result.actualPaid !== result.expectedPaid ? "warning-text" : ""
            }
          >
            {money(result.actualPaid)}
          </b>{" "}
          candidate paid total
        </span>
        <span className="summary-scope">
          Synthetic fixture aggregates, not savings.
        </span>
      </div>
      {rule ? (
        <section className="diagnosis-grid">
          <aside className="rule-list">
            <div className="section-label">
              CHANGED RULES <span>{rules.length}</span>
            </div>
            {rules.map((r, i) => (
              <button
                key={r.key}
                className={"rule-item " + (rule.key === r.key ? "active" : "")}
                onClick={() => {
                  setSelectedRule(r.key);
                  setFixtureId(null);
                }}
              >
                <span className="rule-number">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3>{r.title}</h3>
                  <p>
                    {r.affected.length
                      ? `${r.affected.length} fixtures · ${r.affectedFields} output fields change`
                      : "Not exercised by this fixture set"}
                  </p>
                </div>
                <ChevronRight size={13} />
              </button>
            ))}
            <div className="rule-list-note">
              <GitBranch size={14} />
              <p>
                Effects are measured by restoring one reference rule at a time.
                Counts can overlap.
              </p>
            </div>
          </aside>
          <article className="rule-detail">
            <div className="detail-title">
              <div>
                <span className="eyebrow">{rule.label.toUpperCase()}</span>
                <h2>{rule.title}</h2>
              </div>
              <span className="finding-label">
                {rule.affected.length ? "Behavior changes" : "Coverage gap"}
              </span>
            </div>
            <p className="rule-explanation">{rule.explanation}</p>
            <div className="rule-delta">
              <div>
                <span>REFERENCE RULE</span>
                <code>{rule.format(rule.before)}</code>
              </div>
              <ArrowRight size={17} />
              <div>
                <span>CANDIDATE RULE</span>
                <code>{rule.format(rule.after)}</code>
              </div>
            </div>
            <div className="trace-toolbar">
              <span>FOLLOW ONE RECORD</span>
              <select
                aria-label="Inspect affected fixture"
                value={record.id}
                onChange={(e) => setFixtureId(e.target.value)}
              >
                {items
                  .filter(
                    (c) =>
                      !rule.affected.length ||
                      rule.affected.some((a) => a.id === c.id),
                  )
                  .map((c) => (
                    <option value={c.id} key={c.id}>
                      {c.id} / {c.note}
                    </option>
                  ))}
              </select>
            </div>
            <div className="three-way-trace">
              <section>
                <span className="trace-step">01 / SOURCE VALUE</span>
                <code>{record.trace[field].sourceField}</code>
                <strong>"{record.trace[field].raw}"</strong>
                <p>{record.note}</p>
              </section>
              <section>
                <span className="trace-step">02 / REFERENCE OUTPUT</span>
                <code>{field}</code>
                <strong>{display(ref.output[field], field)}</strong>
                <p>
                  {ref.trace[field].sourceField} · {ref.trace[field].transform}
                </p>
              </section>
              <section className="candidate-trace">
                <span className="trace-step">03 / CANDIDATE OUTPUT</span>
                <code>{field}</code>
                <strong>{display(record.output[field], field)}</strong>
                <p>{record.errors[field] || record.trace[field].transform}</p>
              </section>
            </div>
            <div className="golden-value">
              <CheckCircle2 size={13} />
              <span>
                Explicit fixture expectation:{" "}
                <strong>{display(record.expected[field], field)}</strong>
              </span>
              <button onClick={() => onInspect(record)}>
                Inspect complete record <ArrowUpRight size={12} />
              </button>
            </div>
            <div className="fix-action">
              <div>
                <strong>Restore only this reference rule</strong>
                <p>
                  Other candidate settings stay in place. A new replay records
                  the result.
                </p>
              </div>
              <button
                disabled={!fresh}
                className="button primary"
                onClick={() => onFix(rule.key, rule.before)}
              >
                <RotateCcw size={13} />
                Apply rule & replay
              </button>
            </div>
          </article>
        </section>
      ) : (
        <section className="review-complete">
          <div className="complete-mark">
            <CheckCircle2 size={28} />
          </div>
          <div>
            <span className="eyebrow">READY FOR ENGINEERING REVIEW</span>
            <h2>
              The outputs agree.
              <br />
              <em>Now review the evidence.</em>
            </h2>
            <p>
              {result.total} synthetic fixtures passed. No current field-rule
              differences remain against the bundled reference. This does not
              establish correctness for untested inputs.
            </p>
          </div>
          <button className="button primary" onClick={onRelease}>
            Review passing run <ArrowUpRight size={14} />
          </button>
        </section>
      )}
      <div className="review-bottom">
        <span>
          <FileText size={13} />
          Reference mappings and fixtures are editable engineering assumptions,
          not a live payer contract.
        </span>
        <button onClick={onReset}>
          Restart regression example <RotateCcw size={12} />
        </button>
      </div>
    </div>
  );
}
