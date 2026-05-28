#!/usr/bin/env node

/**
 * LingTour Mobile Performance Analysis
 *
 * Uses Puppeteer + Chrome DevTools Protocol to measure real-user
 * performance metrics on an iPhone 12 viewport (390×844).
 *
 * Metrics collected:
 *   - First Contentful Paint (FCP)
 *   - Largest Contentful Paint (LCP)
 *   - Total Blocking Time (TBT)
 *   - Cumulative Layout Shift (CLS)
 *   - Total page weight (bytes)
 *   - Image count & total image size
 *   - JavaScript bundle size
 *
 * Usage:
 *   node tools/mobile-perf.mjs
 *   node tools/mobile-perf.mjs --site-url http://localhost:3001 --admin-url http://localhost:4173
 *   node tools/mobile-perf.mjs --auth-token eyJhbG...
 *   node tools/mobile-perf.mjs --skip-admin
 *   node tools/mobile-perf.mjs --runs 3           # average over N runs
 */

import { writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── CLI arguments ──────────────────────────────────────────────────────
const args = process.argv.slice(2);

function getArg(name, fallback) {
  const idx = args.indexOf(`--${name}`);
  if (idx === -1) return fallback;
  return args[idx + 1] ?? fallback;
}

const SITE_URL = getArg('site-url', 'http://localhost:3001');
const ADMIN_URL = getArg('admin-url', 'http://localhost:4173');
const AUTH_TOKEN = getArg('auth-token', '');
const SKIP_ADMIN = args.includes('--skip-admin');
const RUNS = Math.max(1, parseInt(getArg('runs', '1'), 10) || 1);

// ── ANSI helpers ───────────────────────────────────────────────────────
const PASS = '\x1b[32m✓\x1b[0m';
const FAIL = '\x1b[31m✗\x1b[0m';
const SKIP = '\x1b[33m▘\x1b[0m';
const DIM = '\x1b[2m';
const BOLD = '\x1b[1m';
const RESET = '\x1b[0m';

// ── Viewport (iPhone 12) ──────────────────────────────────────────────
const VIEWPORT = {
  width: 390,
  height: 844,
  deviceScaleFactor: 3,
  isMobile: true,
  hasTouch: true,
};

const USER_AGENT =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1';

// ── Pages ──────────────────────────────────────────────────────────────
const SITE_PAGES = [
  { name: 'Home',         path: '/' },
  { name: 'Culture',      path: '/culture' },
  { name: 'Route Detail', path: '/routes/southern-sea-table' },
  { name: 'Interpreting', path: '/interpreting' },
  { name: 'Shop',         path: '/shop' },
];

const ADMIN_PAGES = [
  { name: 'Login',        path: '/login',           requiresAuth: false },
  { name: 'Dashboard',    path: '/admin/dashboard',  requiresAuth: true  },
  { name: 'Cities List',  path: '/admin/cities',     requiresAuth: true  },
];

// ── Output ─────────────────────────────────────────────────────────────
const REPORT_PATH = resolve(__dirname, 'perf-report.json');

// ── Helpers ────────────────────────────────────────────────────────────

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function formatMs(ms) {
  if (ms < 1000) return `${Math.round(ms)} ms`;
  return `${(ms / 1000).toFixed(2)} s`;
}

/**
 * Collect all network resources loaded during page navigation.
 * Returns resource entries with type, url, and transfer size.
 */
async function collectResources(page) {
  return page.evaluate(() => {
    const entries = performance.getEntriesByType('resource');
    return entries.map((e) => ({
      name: e.name,
      initiatorType: e.initiatorType,
      transferSize: e.transferSize || 0,
      encodedBodySize: e.encodedBodySize || 0,
      decodedBodySize: e.decodedBodySize || 0,
      duration: e.duration,
    }));
  });
}

/**
 * Wait for Largest Contentful Paint by observing the PerformanceObserver buffer.
 */
async function waitForLCP(page, timeout = 10_000) {
  return page.evaluate((t) => {
    return new Promise((resolve) => {
      let lcpValue = 0;
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        if (entries.length > 0) {
          lcpValue = entries[entries.length - 1].startTime;
        }
      });
      observer.observe({ type: 'largest-contentful-paint', buffered: true });

      // Resolve after a short delay to allow late entries
      setTimeout(() => {
        observer.disconnect();
        resolve(lcpValue);
      }, t);
    });
  }, timeout);
}

/**
 * Wait for Cumulative Layout Shift by observing buffered entries.
 */
async function waitForCLS(page, timeout = 5_000) {
  return page.evaluate((t) => {
    return new Promise((resolve) => {
      let clsValue = 0;
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        }
      });
      observer.observe({ type: 'layout-shift', buffered: true });
      setTimeout(() => {
        observer.disconnect();
        resolve(clsValue);
      }, t);
    });
  }, timeout);
}

/**
 * Measure Total Blocking Time: sum of all task durations > 50ms
 * between FCP and Time to Interactive (simplified: between FCP and load).
 */
async function measureTBT(page) {
  return page.evaluate(() => {
    const entries = performance.getEntriesByType('longtask');
    let tbt = 0;
    for (const entry of entries) {
      const blockingTime = entry.duration - 50;
      if (blockingTime > 0) {
        tbt += blockingTime;
      }
    }
    return tbt;
  });
}

/**
 * Single pass: navigate, wait, collect all metrics.
 */
async function measurePage(page, url) {
  // Clear previous state
  await page.evaluate(() => {
    performance.clearResourceTimings();
  });

  const response = await page.goto(url, { waitUntil: 'networkidle2', timeout: 30_000 });

  if (!response || !response.ok()) {
    return { ok: false, error: `HTTP ${response?.status() ?? 'no response'}` };
  }

  // Give the page time to settle
  await new Promise((r) => setTimeout(r, 1500));

  // Paint timing
  const paintTimings = await page.evaluate(() => {
    const entries = performance.getEntriesByType('paint');
    const result = {};
    for (const entry of entries) {
      if (entry.name === 'first-contentful-paint') result.fcp = entry.startTime;
      if (entry.name === 'first-paint') result.fp = entry.startTime;
    }
    return result;
  });

  const fcp = paintTimings.fcp ?? 0;

  // LCP — use buffered observer entries (already fired by now)
  const lcp = await page.evaluate(() => {
    return new Promise((resolve) => {
      let value = 0;
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        if (entries.length > 0) {
          value = entries[entries.length - 1].startTime;
        }
      });
      observer.observe({ type: 'largest-contentful-paint', buffered: true });
      setTimeout(() => {
        observer.disconnect();
        resolve(value);
      }, 200);
    });
  });

  // CLS
  const cls = await page.evaluate(() => {
    return new Promise((resolve) => {
      let value = 0;
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            value += entry.value;
          }
        }
      });
      observer.observe({ type: 'layout-shift', buffered: true });
      setTimeout(() => {
        observer.disconnect();
        resolve(value);
      }, 200);
    });
  });

  // TBT (long tasks)
  const tbt = await measureTBT(page);

  // Resources
  const resources = await collectResources(page);
  const totalTransferSize = resources.reduce((sum, r) => sum + r.transferSize, 0);

  // Image metrics
  const imageResources = resources.filter(
    (r) =>
      r.initiatorType === 'img' ||
      /\.(png|jpe?g|gif|webp|avif|svg)(\?|$)/i.test(r.name),
  );
  const imageCount = imageResources.length;
  const totalImageSize = imageResources.reduce((sum, r) => sum + r.transferSize, 0);

  // JS metrics
  const jsResources = resources.filter(
    (r) =>
      r.initiatorType === 'script' ||
      /\.m?js(\?|$)/i.test(r.name),
  );
  const jsBundleSize = jsResources.reduce((sum, r) => sum + r.transferSize, 0);
  const jsFileCount = jsResources.length;

  // CSS metrics
  const cssResources = resources.filter(
    (r) =>
      r.initiatorType === 'link' ||
      r.initiatorType === 'css' ||
      /\.css(\?|$)/i.test(r.name),
  );
  const cssSize = cssResources.reduce((sum, r) => sum + r.transferSize, 0);

  // Font metrics
  const fontResources = resources.filter(
    (r) => /\.(woff2?|ttf|otf|eot)(\?|$)/i.test(r.name),
  );
  const fontSize = fontResources.reduce((sum, r) => sum + r.transferSize, 0);

  return {
    ok: true,
    fcp,
    lcp,
    cls,
    tbt,
    totalTransferSize,
    imageCount,
    totalImageSize,
    jsBundleSize,
    jsFileCount,
    cssSize,
    fontSize,
    resourceCount: resources.length,
  };
}

/**
 * Average multiple runs.
 */
function averageResults(runs) {
  const validRuns = runs.filter((r) => r.ok);
  if (validRuns.length === 0) return { ok: false, error: 'All runs failed' };

  const avg = { ok: true, runs: validRuns.length };
  const keys = ['fcp', 'lcp', 'cls', 'tbt', 'totalTransferSize', 'imageCount', 'totalImageSize', 'jsBundleSize', 'jsFileCount', 'cssSize', 'fontSize', 'resourceCount'];

  for (const key of keys) {
    const values = validRuns.map((r) => r[key] ?? 0);
    avg[key] = values.reduce((a, b) => a + b, 0) / values.length;
  }

  return avg;
}

// ── Main ───────────────────────────────────────────────────────────────

async function main() {
  console.log(`${BOLD}\n═══ LingTour Mobile Performance Analysis ═══${RESET}`);
  console.log(`${DIM}Viewport:  iPhone 12 (${VIEWPORT.width}×${VIEWPORT.height})${RESET}`);
  console.log(`${DIM}Site:      ${SITE_URL}${RESET}`);
  console.log(`${DIM}Admin:     ${ADMIN_URL}${RESET}`);
  console.log(`${DIM}Runs:      ${RUNS}${RESET}`);
  if (SKIP_ADMIN) console.log(`${DIM}Admin pages: skipped${RESET}`);
  console.log('');

  let puppeteer;
  try {
    puppeteer = await import('puppeteer');
  } catch {
    console.error(`${FAIL} puppeteer is not installed. Run: npm i -D puppeteer`);
    process.exit(1);
  }

  const allPageResults = [];

  const browser = await puppeteer.default.launch({
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      // Enable performance observer for LCP/CLS
      '--enable-features=PerformanceObserver',
    ],
  });

  try {
    const context = await browser.createBrowserContext();
    const page = await context.newPage();

    await page.setViewport(VIEWPORT);
    await page.setUserAgent(USER_AGENT);

    // Enable CDP for long-task measurement
    const cdp = await page.createCDPSession();
    await cdp.send('Performance.enable');

    // ── Build page list ──
    const pagesToTest = [];

    for (const pg of SITE_PAGES) {
      pagesToTest.push({ ...pg, url: `${SITE_URL}${pg.path}`, type: 'site' });
    }

    if (!SKIP_ADMIN) {
      for (const pg of ADMIN_PAGES) {
        if (pg.requiresAuth && !AUTH_TOKEN) {
          allPageResults.push({
            name: pg.name,
            type: 'admin',
            url: `${ADMIN_URL}${pg.path}`,
            skipped: true,
            reason: 'no auth token',
          });
          console.log(`  ${SKIP} ${pg.name} ${DIM}(no --auth-token)${RESET}`);
          continue;
        }
        pagesToTest.push({ ...pg, url: `${ADMIN_URL}${pg.path}`, type: 'admin' });
      }
    }

    // ── Run measurements ──
    for (const pg of pagesToTest) {
      console.log(`${BOLD}── ${pg.name} ──${RESET}`);

      // Set admin auth cookie if needed
      if (pg.requiresAuth && AUTH_TOKEN) {
        await page.setCookie({
          name: 'token',
          value: AUTH_TOKEN,
          domain: new URL(ADMIN_URL).hostname,
          path: '/',
        });
      }

      const runs = [];
      for (let i = 0; i < RUNS; i++) {
        if (RUNS > 1) process.stdout.write(`  ${DIM}Run ${i + 1}/${RUNS}...${RESET} `);
        const result = await measurePage(page, pg.url);
        runs.push(result);
        if (RUNS > 1 && result.ok) {
          console.log(`${PASS} FCP=${formatMs(result.fcp)} LCP=${formatMs(result.lcp)}`);
        }
      }

      const metrics = RUNS === 1 ? runs[0] : averageResults(runs);

      if (!metrics.ok) {
        console.log(`  ${FAIL} ${pg.name}: ${metrics.error}`);
        allPageResults.push({ name: pg.name, type: pg.type, url: pg.url, ok: false, error: metrics.error });
        continue;
      }

      allPageResults.push({
        name: pg.name,
        type: pg.type,
        url: pg.url,
        ...metrics,
      });

      // Print single-run summary
      console.log(`  ${PASS} FCP:  ${formatMs(metrics.fcp)}`);
      console.log(`     LCP:  ${formatMs(metrics.lcp)}`);
      console.log(`     TBT:  ${formatMs(metrics.tbt)}`);
      console.log(`     CLS:  ${metrics.cls.toFixed(3)}`);
      console.log(`     Weight: ${formatBytes(metrics.totalTransferSize)} (${metrics.resourceCount} resources)`);
      console.log(`     JS:   ${formatBytes(metrics.jsBundleSize)} (${metrics.jsFileCount} files)`);
      console.log(`     Images: ${metrics.imageCount} (${formatBytes(metrics.totalImageSize)})`);
    }

    await context.close();
  } finally {
    await browser.close();
  }

  // ── Build summary ──────────────────────────────────────────────────
  const measured = allPageResults.filter((r) => r.ok);
  const skipped = allPageResults.filter((r) => r.skipped);

  const summary = {
    totalPageWeight: measured.reduce((sum, r) => sum + (r.totalTransferSize || 0), 0),
    avgFCP: measured.length ? measured.reduce((sum, r) => sum + (r.fcp || 0), 0) / measured.length : 0,
    avgLCP: measured.length ? measured.reduce((sum, r) => sum + (r.lcp || 0), 0) / measured.length : 0,
    avgTBT: measured.length ? measured.reduce((sum, r) => sum + (r.tbt || 0), 0) / measured.length : 0,
    avgCLS: measured.length ? measured.reduce((sum, r) => sum + (r.cls || 0), 0) / measured.length : 0,
    heaviestPage: measured.reduce(
      (max, r) => (r.totalTransferSize > (max?.totalTransferSize || 0) ? r : max),
      null,
    )?.name || 'N/A',
    slowestFCP: measured.reduce(
      (max, r) => (r.fcp > (max?.fcp || 0) ? r : max),
      null,
    )?.name || 'N/A',
    slowestLCP: measured.reduce(
      (max, r) => (r.lcp > (max?.lcp || 0) ? r : max),
      null,
    )?.name || 'N/A',
  };

  // ── Scoring ────────────────────────────────────────────────────────
  function scoreMetric(value, good, poor) {
    if (value <= good) return 'good';
    if (value <= poor) return 'needs-improvement';
    return 'poor';
  }

  function scoreCLS(value) {
    if (value <= 0.1) return 'good';
    if (value <= 0.25) return 'needs-improvement';
    return 'poor';
  }

  for (const page of measured) {
    page.scores = {
      fcp: scoreMetric(page.fcp, 1800, 3000),
      lcp: scoreMetric(page.lcp, 2500, 4000),
      tbt: scoreMetric(page.tbt, 200, 600),
      cls: scoreCLS(page.cls),
    };
  }

  // ── Write report ───────────────────────────────────────────────────
  const report = {
    generatedAt: new Date().toISOString(),
    config: {
      viewport: `${VIEWPORT.width}×${VIEWPORT.height}`,
      userAgent: USER_AGENT,
      siteUrl: SITE_URL,
      adminUrl: ADMIN_URL,
      runs: RUNS,
    },
    summary,
    pages: allPageResults,
  };

  await writeFile(REPORT_PATH, JSON.stringify(report, null, 2), 'utf-8');

  // ── Print summary ─────────────────────────────────────────────────
  console.log(`\n${BOLD}──────────── Summary ─────────────${RESET}`);
  console.log(`  Avg FCP:        ${formatMs(summary.avgFCP)}`);
  console.log(`  Avg LCP:        ${formatMs(summary.avgLCP)}`);
  console.log(`  Avg TBT:        ${formatMs(summary.avgTBT)}`);
  console.log(`  Avg CLS:        ${summary.avgCLS.toFixed(3)}`);
  console.log(`  Total weight:   ${formatBytes(summary.totalPageWeight)}`);
  console.log(`  Heaviest page:  ${summary.heaviestPage}`);
  console.log(`  Slowest FCP:    ${summary.slowestFCP}`);
  console.log(`  Slowest LCP:    ${summary.slowestLCP}`);

  if (measured.length > 0) {
    console.log(`\n${BOLD}── Per-Page Scores ──${RESET}`);
    const scoreIcon = { good: '\x1b[32m●\x1b[0m', 'needs-improvement': '\x1b[33m●\x1b[0m', poor: '\x1b[31m●\x1b[0m' };

    for (const pg of measured) {
      const s = pg.scores;
      console.log(
        `  ${pg.name.padEnd(16)} FCP:${scoreIcon[s.fcp]} LCP:${scoreIcon[s.lcp]} TBT:${scoreIcon[s.tbt]} CLS:${scoreIcon[s.cls]}  ${DIM}${formatBytes(pg.totalTransferSize)}${RESET}`,
      );
    }
  }

  if (skipped.length > 0) {
    console.log(`\n${DIM}Skipped: ${skipped.map((s) => s.name).join(', ')}${RESET}`);
  }

  console.log(`\n${DIM}Report: ${REPORT_PATH}${RESET}\n`);
}

main().catch((error) => {
  console.error(`${FAIL} Fatal error: ${error.message}`);
  process.exit(1);
});
