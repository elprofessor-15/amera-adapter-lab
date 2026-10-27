import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import {
  Play,
  ArrowUpRight,
  ArrowRight,
  ChevronRight,
  ChevronDown,
  CheckCircle2,
  Check,
  X,
  FileText,
  Download,
  GitBranch,
  RotateCcw,
  AlertCircle,
  Braces,
  Columns3,
  Search,
  FlaskConical,
  ShieldCheck,
  Copy,
  Plus,
} from "lucide-react";
import {
  fields,
  fixtures,
  corrected,
  candidate,
  normalize,
  replay,
  signature,
  validateFixtures,
  contract,
  report,
} from "./engine";
import "./style.css";
const key = "amera-adapter-lab-v1";
function load() {
  try {
    const s = JSON.parse(localStorage.getItem(key));
    if (s?.items && s?.config) {
      validateFixtures(s.items);
      normalize(s.items[0].source, s.config);
      return s;
    }
  } catch {}
  return { items: fixtures, config: candidate };
}
const usd = (n) =>
  n === null
    ? "Invalid"
    : new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(n / 100);
const label = (v) => (v === null ? "Invalid / not mapped" : String(v));
function download(name, value, type = "text/plain") {
  const u = URL.createObjectURL(new Blob([value], { type })),
    a = document.createElement("a");
  a.href = u;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(u), 1000);
}
function App() {
  const [state, setState] = useState(load),
    [result, setResult] = useState(() => replay(state.items, state.config)),
    [page, setPage] = useState("replay"),
    [selected, setSelected] = useState(state.items[0].id),
    [onlyFailures, setOnlyFailures] = useState(false),
    [modal, setModal] = useState(null),
    [text, setText] = useState(""),
    [error, setError] = useState(""),
    [toast, setToast] = useState("");
  const fresh = result.fingerprint === signature(state.config, state.items),
    current = result.cases.find((c) => c.id === selected) || result.cases[0],
    eligible = fresh && result.failed === 0;
  function persist(next) {
    setState(next);
    localStorage.setItem(key, JSON.stringify(next));
  }
  function update(name, value) {
    persist({ ...state, config: { ...state.config, [name]: value } });
  }
  function run() {
    setResult(replay(state.items, state.config));
    notify(
      "Replay complete. " + state.items.length + " synthetic fixtures checked.",
    );
  }
  function notify(t) {
    setToast(t);
    setTimeout(() => setToast(""), 3000);
  }
  function preview(value, kind) {
    setText(value);
    setError("");
    setModal(kind);
  }
  useEffect(() => {
    if (!modal) return;
    const prior = document.activeElement,
      dialog = document.querySelector("[role=dialog]");
    dialog?.querySelector("button,textarea")?.focus();
    function onKey(e) {
      if (e.key === "Escape") setModal(null);
      if (e.key === "Tab") {
        const n = [...dialog.querySelectorAll("button,textarea,a")];
        if (e.shiftKey && document.activeElement === n[0]) {
          e.preventDefault();
          n.at(-1)?.focus();
        } else if (!e.shiftKey && document.activeElement === n.at(-1)) {
          e.preventDefault();
          n[0]?.focus();
        }
      }
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      prior?.focus();
    };
  }, [modal]);
  return (
    <>
      <header>
        <a
          className="brand"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setPage("replay");
          }}
        >
          Amera<span className="brand-dot">.</span>
        </a>
        <span className="header-rule" />
        <span className="product-name">Adapter Lab</span>
        <nav>
          <button
            className={page === "replay" ? "selected" : ""}
            onClick={() => setPage("replay")}
          >
            Mapping & replay
          </button>
          <button
            className={page === "fixtures" ? "selected" : ""}
            onClick={() => setPage("fixtures")}
          >
            Fixture library <span>{state.items.length}</span>
          </button>
          <button
            className={page === "release" ? "selected" : ""}
            onClick={() => setPage("release")}
          >
            Verification record
          </button>
        </nav>
        <span className="prototype">
          <span />
          Independent prototype
        </span>
      </header>
      <main>
        <div className="breadcrumb">
          Integration engineering <ChevronRight size={12} /> Harbor TPA{" "}
          <ChevronRight size={12} />
          <span>Legacy claims feed</span>
          <span className="synthetic-label">
            <FlaskConical size={12} />
            Synthetic data only
          </span>
        </div>
        <section className="hero">
          <div>
            <div className="eyebrow">BUILD CONFIDENCE INTO EVERY MAPPING</div>
            <h1>
              {page === "replay" ? (
                <>
                  A new format.
                  <br />
                  <em>No silent changes.</em>
                </>
              ) : page === "fixtures" ? (
                <>
                  Small fixtures.
                  <br />
                  <em>Specific expectations.</em>
                </>
              ) : (
                <>
                  The mapping changed.
                  <br />
                  <em>Keep the evidence.</em>
                </>
              )}
            </h1>
          </div>
          <div className="hero-note">
            <span className="overline">HARBOR TPA / ADAPTER V2</span>
            <p>
              {page === "replay"
                ? "Replay a mapping change before it reaches a claims workflow. Every difference, down to the source field."
                : page === "fixtures"
                  ? "Synthetic source records paired with explicit expected outputs. Test the contract, not a guess."
                  : "A portable verification record with the configuration, test results, and limits of what was checked."}
            </p>
            <span className="local-tag">
              <span />
              Local execution · No claims transmitted
            </span>
          </div>
        </section>
        {page === "replay" && (
          <>
            <section className="adapter-strip">
              <div className="feed-icon">
                <FileText size={18} />
              </div>
              <div>
                <strong>Harbor TPA</strong>
                <p>Legacy CSV → normalized claim record</p>
              </div>
              <span className="adapter-version">
                <GitBranch size={12} />
                {state.config.version}
              </span>
              <button
                className="text-button"
                onClick={() =>
                  preview(JSON.stringify(state.config, null, 2), "mapping")
                }
              >
                View mapping JSON <ArrowUpRight size={12} />
              </button>
              <button className="button primary" onClick={run}>
                <Play size={13} />
                Run replay
              </button>
            </section>
            <section className="lab">
              <aside className="mapping-panel">
                <div className="panel-heading">
                  <span className="step">01</span>
                  <h2>Mapping contract</h2>
                </div>
                <p className="panel-intro">
                  The source format is fixed.
                  <br />
                  Change how each field is interpreted.
                </p>
                <div className="field-group">
                  <label>
                    CLAIM IDENTIFIER
                    <span className="field-path">
                      claim_no <ArrowRight size={10} /> claim_id
                    </span>
                    <select
                      aria-label="Claim identifier handling"
                      value={state.config.idMode}
                      onChange={(e) => update("idMode", e.target.value)}
                    >
                      <option value="string">Preserve as string</option>
                      <option value="number">Convert through number</option>
                    </select>
                  </label>
                  <label>
                    SERVICE DATE
                    <span className="field-path">
                      service_date <ArrowRight size={10} /> service_date
                    </span>
                    <select
                      aria-label="Source date format"
                      value={state.config.dateFormat}
                      onChange={(e) => update("dateFormat", e.target.value)}
                    >
                      {["MM/DD/YYYY", "DD/MM/YYYY", "YYYY-MM-DD"].map((f) => (
                        <option key={f}>{f}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    MONEY ENCODING
                    <span className="field-path">
                      Source values → integer cents
                    </span>
                    <select
                      aria-label="Money encoding"
                      value={state.config.moneyEncoding}
                      onChange={(e) => update("moneyEncoding", e.target.value)}
                    >
                      <option value="cents">Integer cents</option>
                      <option value="dollars">
                        Dollars with decimal fraction
                      </option>
                    </select>
                  </label>
                  <label>
                    BILLED AMOUNT
                    <select
                      aria-label="Billed source field"
                      value={state.config.billedSource}
                      onChange={(e) => update("billedSource", e.target.value)}
                    >
                      {["gross_cents", "allowed_cents", "net_cents"].map(
                        (f) => (
                          <option key={f}>{f}</option>
                        ),
                      )}
                    </select>
                  </label>
                  <label>
                    PAID AMOUNT
                    <select
                      aria-label="Paid source field"
                      value={state.config.paidSource}
                      onChange={(e) => update("paidSource", e.target.value)}
                    >
                      {["net_cents", "allowed_cents", "gross_cents"].map(
                        (f) => (
                          <option key={f}>{f}</option>
                        ),
                      )}
                    </select>
                  </label>
                </div>
                <button
                  className="button outline wide"
                  onClick={() => {
                    persist({ ...state, config: corrected });
                    notify("Corrected mapping loaded. Run replay to verify.");
                  }}
                >
                  <CheckCircle2 size={13} />
                  Load corrected mapping
                </button>
                <button
                  className="reset-button"
                  onClick={() => {
                    persist({ ...state, config: candidate });
                    notify("Deliberately broken candidate loaded");
                  }}
                >
                  <RotateCcw size={11} />
                  Load regression example
                </button>
                <div className="mapping-foot">
                  <Braces size={14} />
                  <p>
                    Target amounts use integer cents. IDs stay strings. Dates
                    use ISO format.
                  </p>
                </div>
              </aside>
              <article className="results">
                <div className="results-heading">
                  <div className="panel-heading">
                    <span className="step">02</span>
                    <h2>Replay results</h2>
                  </div>
                  <span className={"freshness " + (!fresh ? "stale" : "")}>
                    {fresh
                      ? "Current configuration"
                      : "Mapping changed · replay needed"}
                  </span>
                </div>
                <div
                  className={
                    "outcome-banner " + (result.failed ? "blocked" : "passed")
                  }
                >
                  <span className="outcome-icon">
                    {result.failed ? (
                      <AlertCircle size={18} />
                    ) : (
                      <CheckCircle2 size={18} />
                    )}
                  </span>
                  <div>
                    <strong>
                      {result.failed
                        ? "Differences found. Contract export blocked."
                        : "All expected outputs match."}
                    </strong>
                    <p>
                      {result.failed
                        ? "Inspect the source, transformation, and expected value before accepting this mapping."
                        : "This mapping agrees with the selected synthetic fixtures. It is ready to export for review."}
                    </p>
                  </div>
                  <span className="outcome-count">
                    {result.passed}
                    <small>/{result.total}</small>
                  </span>
                </div>
                <div className="result-metrics">
                  <div>
                    <span className="overline">FIXTURES CHECKED</span>
                    <strong>
                      {result.total}
                      <small>records</small>
                    </strong>
                  </div>
                  <div>
                    <span className="overline">FIELD DIFFERENCES</span>
                    <strong className={result.changedFields ? "rust" : ""}>
                      {result.changedFields}
                      <small>fields</small>
                    </strong>
                  </div>
                  <div>
                    <span className="overline">PAID TOTAL / EXPECTED</span>
                    <strong>{usd(result.expectedPaid)}</strong>
                  </div>
                  <div>
                    <span className="overline">PAID TOTAL / CANDIDATE</span>
                    <strong
                      className={
                        result.actualPaid !== result.expectedPaid ? "rust" : ""
                      }
                    >
                      {usd(result.actualPaid)}
                    </strong>
                  </div>
                </div>
                <div className="case-toolbar">
                  <span className="overline">FIXTURE RESULTS</span>
                  <label>
                    <input
                      type="checkbox"
                      checked={onlyFailures}
                      onChange={(e) => setOnlyFailures(e.target.checked)}
                    />
                    Differences only
                  </label>
                </div>
                <div className="case-tabs">
                  {result.cases
                    .filter((c) => !onlyFailures || !c.passed)
                    .map((c) => (
                      <button
                        className={current.id === c.id ? "active" : ""}
                        onClick={() => setSelected(c.id)}
                        key={c.id}
                      >
                        {c.passed ? (
                          <CheckCircle2 size={11} />
                        ) : (
                          <span className="case-dot" />
                        )}
                        {c.id}
                        <span>{c.diffs.length}</span>
                      </button>
                    ))}
                </div>
                {onlyFailures && result.failed === 0 ? (
                  <div className="empty-state">
                    <CheckCircle2 />
                    <h3>No field differences.</h3>
                    <p>
                      Every value matches the expected output in this fixture
                      set.
                    </p>
                    <button
                      className="text-button"
                      onClick={() => setOnlyFailures(false)}
                    >
                      Show all fixtures <ArrowRight size={12} />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="case-heading">
                      <div>
                        <span className="overline">
                          {current.id} / {current.note.toUpperCase()}
                        </span>
                        <h3>
                          {current.passed
                            ? "Expected output preserved."
                            : "Follow the value, not just the format."}
                        </h3>
                      </div>
                      <button
                        className="text-button"
                        onClick={() =>
                          preview(
                            JSON.stringify(
                              {
                                source: current.source,
                                expected: current.expected,
                                actual: current.output,
                              },
                              null,
                              2,
                            ),
                            "source",
                          )
                        }
                      >
                        Inspect fixture <ArrowUpRight size={12} />
                      </button>
                    </div>
                    <div className="diff-table-scroll">
                      <table className="diff-table">
                        <thead>
                          <tr>
                            <th>TARGET FIELD</th>
                            <th>EXPECTED</th>
                            <th>CANDIDATE</th>
                            <th>CHECK</th>
                          </tr>
                        </thead>
                        <tbody>
                          {fields.map((field) => {
                            const d = current.diffs.find(
                              (d) => d.field === field,
                            );
                            return (
                              <tr className={d ? "diff-row" : ""} key={field}>
                                <td>
                                  <code>{field}</code>
                                  <small>
                                    {current.trace[field].sourceField}
                                  </small>
                                </td>
                                <td>
                                  {field.endsWith("_cents")
                                    ? usd(current.expected[field])
                                    : label(current.expected[field])}
                                  <small>
                                    {field.endsWith("_cents")
                                      ? current.expected[field] + " cents"
                                      : "Expected value"}
                                  </small>
                                </td>
                                <td>
                                  {d?.error ? (
                                    <span className="invalid">
                                      {field === "service_date"
                                        ? "Invalid date"
                                        : "Invalid value"}
                                    </span>
                                  ) : field.endsWith("_cents") ? (
                                    usd(current.output[field])
                                  ) : (
                                    label(current.output[field])
                                  )}
                                  <small>
                                    {d?.error || current.trace[field].transform}
                                  </small>
                                </td>
                                <td>
                                  {d ? (
                                    <span className="check-fail">Review</span>
                                  ) : (
                                    <span className="check-pass">
                                      <Check size={12} />
                                      Match
                                    </span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                    <div className="trace-card">
                      <span className="overline">
                        <GitBranch size={12} />
                        SOURCE TRACE / {current.id}
                      </span>
                      <div>
                        <code>{current.trace.paid_cents.sourceField}</code>
                        <ArrowRight size={13} />
                        <code>"{current.trace.paid_cents.raw}"</code>
                        <ArrowRight size={13} />
                        <span>
                          {result.config.moneyEncoding === "cents"
                            ? "Preserve integer cents"
                            : "Multiply by 100"}
                        </span>
                        <ArrowRight size={13} />
                        <strong>{usd(current.output.paid_cents)}</strong>
                      </div>
                      <p>
                        The bundled contract maps paid to <code>net_cents</code>
                        . A valid number can still be the wrong field; review
                        expectations when editing fixtures.
                      </p>
                    </div>
                  </>
                )}
                <div className="results-foot">
                  <span>
                    <FlaskConical size={12} />
                    Fixture agreement is not production certification.
                  </span>
                  <button
                    className="text-button"
                    onClick={() => {
                      setPage("release");
                    }}
                  >
                    Open verification record <ArrowUpRight size={12} />
                  </button>
                </div>
              </article>
            </section>
          </>
        )}
        {page === "fixtures" && (
          <section className="fixture-layout">
            <article className="fixture-register">
              <div className="register-top">
                <div>
                  <h2>The regression set</h2>
                  <p>
                    Five deliberate edge cases. No patient names, diagnoses, or
                    real member data.
                  </p>
                </div>
                <button
                  className="button outline"
                  onClick={() =>
                    preview(JSON.stringify(state.items, null, 2), "fixtures")
                  }
                >
                  Edit synthetic fixtures <Braces size={13} />
                </button>
              </div>
              <div className="fixture-table-scroll">
                <table className="fixture-table">
                  <thead>
                    <tr>
                      <th>FIXTURE / PURPOSE</th>
                      <th>RAW CLAIM ID</th>
                      <th>RAW DATE</th>
                      <th>BILLED / RAW CENTS</th>
                      <th>PAID / RAW CENTS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {state.items.map((f) => (
                      <tr key={f.id}>
                        <td>
                          <b>{f.id}</b>
                          <span>{f.note}</span>
                        </td>
                        <td>
                          <code>{f.source.claim_no}</code>
                        </td>
                        <td>
                          <code>{f.source.service_date}</code>
                        </td>
                        <td>{f.source.gross_cents}</td>
                        <td>{f.source.net_cents}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="schema-note">
                <span className="overline">INPUT CONTRACT</span>
                <p>
                  All monetary source fields are integer cents. Dates are
                  month/day/year. Claim identifiers retain their leading zeros.
                </p>
              </div>
            </article>
            <aside className="fixture-side">
              <span className="overline">WHAT THESE CASES CATCH</span>
              <h2>
                Syntax can pass.
                <br />
                <em>Meaning can change.</em>
              </h2>
              {[
                [
                  "01",
                  "Identifiers",
                  "Leading zeros are part of the reference.",
                ],
                ["02", "Dates", "02/03 can be February 3 or March 2."],
                ["03", "Amounts", "25000 cents is $250.00, not $25,000.00."],
                [
                  "04",
                  "Semantics",
                  "Allowed and paid can both be valid numbers.",
                ],
              ].map(([n, t, p]) => (
                <div className="edge-case" key={n}>
                  <span>{n}</span>
                  <div>
                    <h3>{t}</h3>
                    <p>{p}</p>
                  </div>
                </div>
              ))}
            </aside>
          </section>
        )}
        {page === "release" && (
          <section className="release-layout">
            <article className="release-paper">
              <div className="paper-header">
                <span className="brand small-brand">Amera.</span>
                <span>ADAPTER VERIFICATION / LOCAL RECORD</span>
              </div>
              <div className="eyebrow">HARBOR TPA / SYNTHETIC CSV CONTRACT</div>
              <h2>
                {eligible
                  ? "Verified against the fixtures."
                  : "A mapping needs evidence."}
              </h2>
              <p className="paper-subtitle">
                {fresh
                  ? "The current mapping was replayed against the selected expected outputs."
                  : "The mapping has changed since the last replay. Run the current configuration before exporting."}
              </p>
              <div className={"release-status " + (eligible ? "good" : "bad")}>
                {eligible ? (
                  <CheckCircle2 size={17} />
                ) : (
                  <AlertCircle size={17} />
                )}
                <strong>
                  {eligible
                    ? "Fixture checks passed"
                    : !fresh
                      ? "Replay required"
                      : "Field differences remain"}
                </strong>
                <span>
                  {result.passed} / {result.total} fixtures
                </span>
              </div>
              <dl className="verification-facts">
                <div>
                  <dt>MAPPING VERSION</dt>
                  <dd>{result.config.version}</dd>
                </div>
                <div>
                  <dt>FIXTURE SET</dt>
                  <dd>{result.total} synthetic records</dd>
                </div>
                <div>
                  <dt>DIFFERENCES</dt>
                  <dd>{result.changedFields} fields</dd>
                </div>
                <div>
                  <dt>RUN TIME / UTC</dt>
                  <dd>
                    {new Date(result.runAt)
                      .toISOString()
                      .slice(0, 19)
                      .replace("T", " ")}
                  </dd>
                </div>
              </dl>
              <h3>Configuration that was checked</h3>
              <div className="config-lines">
                {[
                  ["Claim ID", "claim_no → " + result.config.idMode],
                  ["Source date format", result.config.dateFormat],
                  ["Source money encoding", result.config.moneyEncoding],
                  ["Billed source", result.config.billedSource],
                  ["Paid source", result.config.paidSource],
                ].map(([k, v]) => (
                  <div key={k}>
                    <span>{k}</span>
                    <code>{v}</code>
                  </div>
                ))}
              </div>
              <h3>Fixture coverage</h3>
              <div className="coverage">
                {result.cases.map((c) => (
                  <div key={c.id}>
                    {c.passed ? (
                      <CheckCircle2 size={13} />
                    ) : (
                      <AlertCircle size={13} />
                    )}
                    <span>{c.id}</span>
                    <p>{c.note}</p>
                    <b>{c.passed ? "Pass" : c.diffs.length + " differences"}</b>
                  </div>
                ))}
              </div>
              <div className="paper-limit">
                Scope: agreement with this finite synthetic fixture set only. No
                clinical, coverage, payment, EDI, security, or
                production-readiness determination.
              </div>
            </article>
            <aside className="release-side">
              <span className="eyebrow">REVIEWABLE. REPEATABLE. PORTABLE.</span>
              <h2>
                Take the contract.
                <br />
                <em>Keep the proof.</em>
              </h2>
              <p>
                Export the mapping alongside its verification record. The
                contract stays locked until the current configuration passes
                every selected fixture.
              </p>
              <button
                className="button primary wide"
                disabled={!eligible}
                onClick={() => {
                  download(
                    "harbor-mapping-contract.json",
                    JSON.stringify(contract(result), null, 2),
                    "application/json",
                  );
                  notify("Verified mapping contract export prepared");
                }}
              >
                <Download size={14} />
                Export mapping contract
              </button>
              <button
                className="button outline wide"
                onClick={() => {
                  download(
                    "harbor-replay-report.md",
                    report(result),
                    "text/markdown",
                  );
                  notify("Replay report export prepared");
                }}
              >
                <FileText size={14} />
                Export replay report
              </button>
              <button
                className="text-button"
                onClick={() => preview(report(result), "report")}
              >
                Inspect exact report text <ArrowUpRight size={12} />
              </button>
              <div className="release-note">
                <ShieldCheck size={17} />
                <p>
                  No adapters are deployed from this prototype. Exported files
                  are artifacts for engineering review.
                </p>
              </div>
              <div className="cli-note">
                <span className="overline">
                  RUN THE SAME CHECK IN A TERMINAL
                </span>
                <code>npm run replay</code>
                <p>
                  Uses the shared engine and exits non-zero when a fixture
                  differs.
                </p>
              </div>
            </aside>
          </section>
        )}
        <footer>
          <span>AMERA / ADAPTER LAB</span>
          <p>Built by C Abhineeth · Independent concept · Synthetic fixtures</p>
          <button onClick={() => setModal("about")}>
            About this prototype <ArrowUpRight size={11} />
          </button>
        </footer>
      </main>
      {modal && (
        <div className="overlay" onClick={() => setModal(null)}>
          <section
            className="dialog"
            role="dialog"
            aria-modal="true"
            aria-label={
              modal === "fixtures"
                ? "Edit synthetic fixtures"
                : modal === "about"
                  ? "About this prototype"
                  : "Inspect data"
            }
            onClick={(e) => e.stopPropagation()}
          >
            <div className="dialog-top">
              <span className="overline">
                {modal === "fixtures"
                  ? "SYNTHETIC FIXTURE EDITOR"
                  : modal === "about"
                    ? "METHOD & SCOPE"
                    : "LOCAL ARTIFACT PREVIEW"}
              </span>
              <button
                className="icon-button"
                aria-label="Close dialog"
                onClick={() => setModal(null)}
              >
                <X size={20} />
              </button>
            </div>
            {modal === "about" ? (
              <>
                <h2>
                  Test the mapping.
                  <br />
                  <em>Expose the assumptions.</em>
                </h2>
                <p>
                  Amera's public product describes normalizing custom claims
                  formats into a unified data layer. This independent workbench
                  explores regression testing for changes to those format
                  mappings.
                </p>
                <p>
                  It is a deterministic CSV-field mapping demo, not Amera's
                  schema or product. Source values and expected outputs are
                  explicitly provided. No OCR, model inference, EDI parsing,
                  eligibility checks, or claim adjudication run here.
                </p>
                <div className="dialog-note">
                  All included records are synthetic. Data stays in browser
                  local storage. Only fixture agreement is verified; performance
                  and correctness on real payer data are untested.
                </div>
                <a
                  href="https://www.amerahealthsolutions.com/"
                  target="_blank"
                  rel="noreferrer"
                  className="text-button"
                >
                  Amera's actual platform <ArrowUpRight size={13} />
                </a>
              </>
            ) : (
              <>
                <h2>
                  {modal === "fixtures"
                    ? "Make an assumption testable."
                    : modal === "mapping"
                      ? "An explicit mapping."
                      : "Every value, inspectable."}
                </h2>
                <p>
                  {modal === "fixtures"
                    ? "Use the sample schema and SYN- member references. Changing fixtures invalidates the last replay. Synthetic records only."
                    : "This is the exact local artifact, without a network request."}
                </p>
                <textarea
                  aria-label="Artifact text"
                  spellCheck="false"
                  className="artifact-editor"
                  readOnly={modal !== "fixtures"}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                />
                {error && (
                  <p role="alert" className="error">
                    {error}
                  </p>
                )}
                <div className="dialog-actions">
                  <button
                    className="button outline"
                    onClick={() =>
                      download(
                        modal === "report"
                          ? "replay-report.md"
                          : modal === "fixtures"
                            ? "synthetic-fixtures.json"
                            : modal + ".json",
                        text,
                      )
                    }
                  >
                    Download text <Download size={13} />
                  </button>
                  {modal === "fixtures" && (
                    <button
                      className="button primary"
                      onClick={() => {
                        try {
                          if (text.length > 50000)
                            throw Error("Keep fixtures under 50 KB.");
                          const items = validateFixtures(JSON.parse(text));
                          persist({ ...state, items });
                          setSelected(items[0].id);
                          setModal(null);
                          notify("Fixtures saved. Run replay to check them.");
                        } catch (e) {
                          setError(e.message);
                        }
                      }}
                    >
                      Save fixtures <Check size={13} />
                    </button>
                  )}
                </div>
              </>
            )}
          </section>
        </div>
      )}
      {toast && (
        <div className="toast" role="status">
          <CheckCircle2 size={16} />
          {toast}
        </div>
      )}
    </>
  );
}
createRoot(document.getElementById("root")).render(<App />);
