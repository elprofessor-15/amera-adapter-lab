import { readFileSync, writeFileSync } from "node:fs";
import {
  fixtures,
  corrected,
  validateFixtures,
  validateConfig,
  replay,
  report,
} from "../src/engine.js";
try {
  const config = process.argv[2]
    ? JSON.parse(readFileSync(process.argv[2], "utf8"))
    : corrected;
  const items = process.argv[3]
    ? JSON.parse(readFileSync(process.argv[3], "utf8"))
    : fixtures;
  validateConfig(config);
  validateFixtures(items);
  const result = replay(items, config);
  console.log(report(result));
  if (process.argv[4])
    writeFileSync(process.argv[4], JSON.stringify(result, null, 2) + "\n");
  process.exitCode = result.failed ? 1 : 0;
} catch (e) {
  console.error("Replay failed: " + e.message);
  process.exitCode = 2;
}
