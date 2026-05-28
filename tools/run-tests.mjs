#!/usr/bin/env node

/**
 * LingTour CI Test Runner
 *
 * Runs all test suites in order and prints a summary.
 *
 * Usage:
 *   node tools/run-tests.mjs              # run all suites
 *   node tools/run-tests.mjs --dry-run    # print what would run, skip execution
 *   node tools/run-tests.mjs --skip-e2e   # skip e2e suites (unit tests only)
 */

import { execSync, spawn } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const API_DIR = resolve(ROOT, 'api');

// ── CLI flags ────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const skipE2e = args.includes('--skip-e2e');

// ── Helpers ──────────────────────────────────────────────────────────
const PASS = '\x1b[32m✓\x1b[0m';
const FAIL = '\x1b[31m✗\x1b[0m';
const SKIP = '\x1b[33m⊘\x1b[0m';
const DIM = '\x1b[2m';
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';

function formatDuration(ms) {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function run(name, cmd, cwd) {
  if (dryRun) {
    console.log(`  ${SKIP} ${name} ${DIM}(dry-run)${RESET}`);
    console.log(`    ${DIM}cmd: ${cmd}${RESET}`);
    return { name, status: 'skip', duration: 0 };
  }

  const start = Date.now();
  try {
    execSync(cmd, {
      cwd: cwd || ROOT,
      stdio: 'inherit',
      env: { ...process.env, FORCE_COLOR: '1' },
    });
    const duration = Date.now() - start;
    console.log(`  ${PASS} ${name} ${DIM}(${formatDuration(duration)})${RESET}`);
    return { name, status: 'pass', duration };
  } catch (error) {
    const duration = Date.now() - start;
    console.log(`  ${FAIL} ${name} ${DIM}(${formatDuration(duration)})${RESET}`);
    return { name, status: 'fail', duration, error };
  }
}

// ── Test suites ──────────────────────────────────────────────────────
const suites = [
  {
    name: 'API Unit Tests (jest)',
    cmd: 'npx jest --passWithNoTests',
    cwd: API_DIR,
    group: 'unit',
  },
  {
    name: 'API Audit Log Unit Test',
    cmd: 'npx jest --testPathPattern=test/audit-log.spec.ts --passWithNoTests',
    cwd: API_DIR,
    group: 'unit',
  },
  {
    name: 'API E2E Tests (jest --config jest-e2e.json)',
    cmd: 'npx jest --config ./test/jest-e2e.json --passWithNoTests',
    cwd: API_DIR,
    group: 'e2e',
  },
  {
    name: 'Admin API E2E (--dry-run)',
    cmd: 'node tools/admin-api-e2e.mjs --dry-run',
    cwd: ROOT,
    group: 'e2e',
  },
];

// ── Main ─────────────────────────────────────────────────────────────
console.log(`\n${BOLD}═══ LingTour CI Test Runner ═══${RESET}`);
console.log(`${DIM}Working directory: ${ROOT}${RESET}`);
if (dryRun) console.log(`${DIM}Mode: dry-run (no tests will execute)${RESET}`);
if (skipE2e) console.log(`${DIM}Skipping e2e suites${RESET}`);
console.log('');

const results = [];
let hasFailure = false;

for (const suite of suites) {
  if (skipE2e && suite.group === 'e2e') {
    console.log(`  ${SKIP} ${suite.name} ${DIM}(skipped --skip-e2e)${RESET}`);
    results.push({ ...suite, status: 'skip', duration: 0 });
    continue;
  }

  const result = run(suite.name, suite.cmd, suite.cwd);
  results.push({ ...suite, ...result });

  if (result.status === 'fail') {
    hasFailure = true;
    // In CI, stop on first failure for fast feedback
    if (process.env.CI === 'true' || process.env.CI === '1') {
      console.log(`\n${FAIL} Stopping on first failure (CI mode)${RESET}`);
      break;
    }
  }
}

// ── Summary ──────────────────────────────────────────────────────────
const passed = results.filter((r) => r.status === 'pass').length;
const failed = results.filter((r) => r.status === 'fail').length;
const skipped = results.filter((r) => r.status === 'skip').length;
const totalDuration = results.reduce((sum, r) => sum + (r.duration || 0), 0);

console.log(`\n${BOLD}─────────── Summary ───────────${RESET}`);
for (const r of results) {
  const icon = r.status === 'pass' ? PASS : r.status === 'fail' ? FAIL : SKIP;
  const dur = r.duration ? ` ${DIM}(${formatDuration(r.duration)})${RESET}` : '';
  console.log(`  ${icon} ${r.name}${dur}`);
}
console.log(`${BOLD}───────────────────────────────${RESET}`);
console.log(
  `  Total: ${results.length}  ${PASS} ${passed}  ${failed ? `${FAIL} ${failed}` : `${FAIL} 0`}  ${SKIP} ${skipped}  ${DIM}Duration: ${formatDuration(totalDuration)}${RESET}`,
);
console.log('');

if (hasFailure) {
  console.log(`${FAIL}${BOLD} Some tests failed.${RESET}\n`);
  process.exit(1);
} else {
  console.log(`${PASS}${BOLD} All tests passed.${RESET}\n`);
  process.exit(0);
}
