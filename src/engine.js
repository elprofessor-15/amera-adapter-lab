export const fields = [
  "claim_id",
  "member_id",
  "service_date",
  "billed_cents",
  "paid_cents",
];
export const sourceFields = [
  "claim_no",
  "member_ref",
  "service_date",
  "gross_cents",
  "allowed_cents",
  "net_cents",
];
export const corrected = {
  version: "harbor-v2",
  idMode: "string",
  dateFormat: "MM/DD/YYYY",
  moneyEncoding: "cents",
  billedSource: "gross_cents",
  paidSource: "net_cents",
};
export const candidate = {
  ...corrected,
  idMode: "number",
  dateFormat: "DD/MM/YYYY",
  moneyEncoding: "dollars",
  paidSource: "allowed_cents",
};
const rows = [
  [
    "SYN-001",
    "00037311",
    "SYN-M101",
    "10/15/2025",
    "25000",
    "22000",
    "20000",
    "2025-10-15",
  ],
  [
    "SYN-002",
    "00012345",
    "SYN-M102",
    "02/03/2025",
    "95000",
    "75000",
    "50000",
    "2025-02-03",
  ],
  [
    "SYN-003",
    "00061463",
    "SYN-M103",
    "03/04/2025",
    "125050",
    "100000",
    "85025",
    "2025-03-04",
  ],
  [
    "SYN-004",
    "00000720",
    "SYN-M104",
    "11/12/2025",
    "7500",
    "6500",
    "0",
    "2025-11-12",
  ],
  [
    "SYN-005",
    "00000108",
    "SYN-M105",
    "12/31/2025",
    "9999",
    "9999",
    "9999",
    "2025-12-31",
  ],
];
export const fixtures = rows.map(
  (
    [
      id,
      claim_no,
      member_ref,
      service_date,
      gross_cents,
      allowed_cents,
      net_cents,
      date,
    ],
    i,
  ) => ({
    id,
    note: [
      "Unambiguous US date",
      "Ambiguous month/day",
      "Cent precision",
      "Zero paid value",
      "Matching allowed and paid",
    ][i],
    source: {
      claim_no,
      member_ref,
      service_date,
      gross_cents,
      allowed_cents,
      net_cents,
    },
    expected: {
      claim_id: claim_no,
      member_id: member_ref,
      service_date: date,
      billed_cents: Number(gross_cents),
      paid_cents: Number(net_cents),
    },
  }),
);
export function validateConfig(c) {
  if (
    !c ||
    !["string", "number"].includes(c.idMode) ||
    !["MM/DD/YYYY", "DD/MM/YYYY", "YYYY-MM-DD"].includes(c.dateFormat) ||
    !["cents", "dollars"].includes(c.moneyEncoding) ||
    !["gross_cents", "allowed_cents", "net_cents"].includes(c.billedSource) ||
    !["gross_cents", "allowed_cents", "net_cents"].includes(c.paidSource)
  )
    throw Error("Unsupported mapping configuration.");
  if (typeof c.version !== "string" || !c.version.trim())
    throw Error("A mapping version is required.");
  return c;
}
export function money(value, encoding) {
  const raw = String(value).trim();
  if (encoding === "cents") {
    if (!/^\d+$/.test(raw))
      throw Error("Expected a non-negative integer in cents.");
    const n = Number(raw);
    if (!Number.isSafeInteger(n))
      throw Error("Amount exceeds safe integer range.");
    return n;
  }
  if (encoding !== "dollars" || !/^\d+(?:\.\d{1,2})?$/.test(raw))
    throw Error("Expected dollars with at most two decimal places.");
  const [whole, fraction = ""] = raw.split(".");
  const n = Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
  if (!Number.isSafeInteger(n))
    throw Error("Amount exceeds safe integer range.");
  return n;
}
export function dateValue(value, format) {
  const raw = String(value);
  let year, month, day;
  if (format === "YYYY-MM-DD") {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) throw Error("Expected YYYY-MM-DD.");
    [year, month, day] = raw.split("-").map(Number);
  } else {
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(raw))
      throw Error("Expected a two-digit month/day and four-digit year.");
    const [a, b, y] = raw.split("/").map(Number);
    year = y;
    [month, day] =
      format === "MM/DD/YYYY"
        ? [a, b]
        : format === "DD/MM/YYYY"
          ? [b, a]
          : [0, 0];
  }
  if (
    year < 1900 ||
    year > 2100 ||
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > 31
  )
    throw Error("Date does not match the selected format.");
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day)
    throw Error("Invalid calendar date.");
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}
export function normalize(source, config) {
  validateConfig(config);
  const output = {},
    errors = {},
    trace = {};
  function field(name, from, transform, fn) {
    trace[name] = { sourceField: from, raw: source[from], transform };
    try {
      if (
        source[from] === undefined ||
        source[from] === null ||
        String(source[from]).trim() === ""
      )
        throw Error("Required source value is missing.");
      output[name] = fn(source[from]);
    } catch (e) {
      output[name] = null;
      errors[name] = e.message;
    }
  }
  field(
    "claim_id",
    "claim_no",
    config.idMode === "string"
      ? "Preserve as string"
      : "Convert through number",
    (v) => {
      if (config.idMode === "string") return String(v);
      if (!/^\d+$/.test(String(v)) || !Number.isSafeInteger(Number(v)))
        throw Error("Claim identifier cannot safely convert to number.");
      return String(Number(v));
    },
  );
  field("member_id", "member_ref", "Preserve as string", String);
  field("service_date", "service_date", config.dateFormat, (v) =>
    dateValue(v, config.dateFormat),
  );
  field(
    "billed_cents",
    config.billedSource,
    config.moneyEncoding + " → integer cents",
    (v) => money(v, config.moneyEncoding),
  );
  field(
    "paid_cents",
    config.paidSource,
    config.moneyEncoding + " → integer cents",
    (v) => money(v, config.moneyEncoding),
  );
  return { output, errors, trace };
}
export function signature(config, items) {
  return JSON.stringify({ config, items });
}
export function replay(items, config) {
  validateConfig(config);
  const cases = items.map((f) => {
    const mapped = normalize(f.source, config);
    const diffs = fields
      .map((field) => ({
        field,
        expected: f.expected[field],
        actual: mapped.output[field],
        error: mapped.errors[field] || null,
        ...mapped.trace[field],
      }))
      .filter((d) => d.error || d.expected !== d.actual);
    return { ...f, ...mapped, diffs, passed: diffs.length === 0 };
  });
  return {
    config: { ...config },
    fingerprint: signature(config, items),
    runAt: new Date().toISOString(),
    cases,
    total: cases.length,
    passed: cases.filter((c) => c.passed).length,
    failed: cases.filter((c) => !c.passed).length,
    changedFields: cases.reduce((n, c) => n + c.diffs.length, 0),
    expectedPaid: safeTotal(cases.map((c) => c.expected.paid_cents)),
    actualPaid: safeTotal(cases.map((c) => c.output.paid_cents)),
  };
}
function safeTotal(values) {
  if (!values.every(Number.isSafeInteger)) return null;
  const sum = values.reduce((total, value) => total + BigInt(value), 0n);
  return sum <= BigInt(Number.MAX_SAFE_INTEGER) ? Number(sum) : null;
}
export function validateFixtures(input) {
  if (!Array.isArray(input) || input.length < 1 || input.length > 30)
    throw Error("Use an array of 1 to 30 synthetic fixtures.");
  const ids = new Set();
  for (const f of input) {
    if (typeof f.id !== "string" || !/^SYN-[\w-]+$/.test(f.id) || ids.has(f.id))
      throw Error("Every fixture needs a unique SYN- identifier.");
    ids.add(f.id);
    if (typeof f.note !== "string" || f.note.length > 150)
      throw Error("Each fixture needs a short note.");
    if (
      !f.source ||
      !f.expected ||
      Object.keys(f.source).sort().join() !== [...sourceFields].sort().join() ||
      Object.keys(f.expected).sort().join() !== [...fields].sort().join()
    )
      throw Error("Fixture fields must match the sample schema exactly.");
    for (const k of sourceFields)
      if (
        typeof f.source[k] !== "string" ||
        !f.source[k].trim() ||
        f.source[k].length > 100
      )
        throw Error(
          "Source values must be non-empty strings of at most 100 characters.",
        );
    if (
      !/^SYN-[\w-]+$/.test(f.source.member_ref) ||
      !/^SYN-[\w-]+$/.test(f.expected.member_id)
    )
      throw Error("Use synthetic member references starting with SYN-.");
    if (typeof f.expected.claim_id !== "string" || !f.expected.claim_id.trim())
      throw Error("Expected claim IDs must be strings.");
    if (
      dateValue(f.expected.service_date, "YYYY-MM-DD") !==
      f.expected.service_date
    )
      throw Error("Expected dates must be ISO dates.");
    for (const k of ["billed_cents", "paid_cents"])
      if (!Number.isSafeInteger(f.expected[k]) || f.expected[k] < 0)
        throw Error("Expected amounts must be non-negative integer cents.");
  }
  return input;
}
export function contract(result) {
  if (result.failed)
    throw Error("All fixtures must pass before exporting the contract.");
  return {
    schema: "amera-adapter-lab.contract.v1",
    adapter: "Harbor TPA / synthetic CSV",
    mapping: result.config,
    targetSchema: {
      claim_id: "string",
      member_id: "string",
      service_date: "YYYY-MM-DD",
      billed_cents: "integer",
      paid_cents: "integer",
    },
    verification: {
      runAt: result.runAt,
      fixtureIds: result.cases.map((c) => c.id),
      passed: result.passed,
      total: result.total,
    },
    scope:
      "Synthetic regression fixture agreement only. Not production certification or an Amera schema.",
  };
}
export function report(result) {
  return (
    `# Adapter replay | Harbor TPA\n\nMapping version: ${result.config.version}\nRun: ${result.runAt}\nFixtures passed: ${result.passed}/${result.total}\nField differences: ${result.changedFields}\nScope: synthetic regression fixtures only.\n\n` +
    result.cases
      .map(
        (c) =>
          `## ${c.id}: ${c.note}\n\n${c.passed ? "PASS" : c.diffs.map((d) => `${d.field}: expected ${JSON.stringify(d.expected)}, got ${JSON.stringify(d.actual)}${d.error ? " (" + d.error + ")" : ""}. Source ${d.sourceField}=${JSON.stringify(d.raw)}; transform ${d.transform}.`).join("\n")}\n`,
      )
      .join("\n")
  );
}
