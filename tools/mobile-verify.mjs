#!/usr/bin/env node

/**
 * LingTour Mobile Viewport Verification
 *
 * Launches Puppeteer at multiple viewport sizes, navigates key pages,
 * takes screenshots, and checks for horizontal overflow / broken images.
 *
 * Usage:
 *   node tools/mobile-verify.mjs
 *   node tools/mobile-verify.mjs --site-url http://localhost:3001 --admin-url http://localhost:4173
 *   node tools/mobile-verify.mjs --auth-token eyJhbG...
 *   node tools/mobile-verify.mjs --skip-admin
 */

import { mkdir, writeFile } from 'node:fs/promises';
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

// ── ANSI helpers ───────────────────────────────────────────────────────
const PASS = '\x1b[32m✓\x1b[0m';
const FAIL = '\x1b[31m✗\x1b[0m';
const SKIP = '\x1b[33m▘\x1b[0m';
const DIM = '\x1b[2m';
const BOLD = '\x1b[1m';
const RESET = '\x1b[0m';

// ── Viewport definitions ───────────────────────────────────────────────
const VIEWPORTS = [
  { name: 'iPhone SE',           width: 375,  height: 667,  deviceScaleFactor: 2, isMobile: true,  hasTouch: true  },
  { name: 'iPhone 12/13/14',     width: 390,  height: 844,  deviceScaleFactor: 3, isMobile: true,  hasTouch: true  },
  { name: 'iPhone 14 Pro Max',   width: 430,  height: 932,  deviceScaleFactor: 3, isMobile: true,  hasTouch: true  },
  { name: 'iPad Mini',           width: 768,  height: 1024, deviceScaleFactor: 2, isMobile: false, hasTouch: true  },
];

// ── Page definitions ───────────────────────────────────────────────────
const SITE_PAGES = [
  { name: 'Home',            path: '/' },
  { name: 'Culture',         path: '/culture' },
  { name: 'Route Detail',    path: '/routes/southern-sea-table' },
  { name: 'Interpreting',    path: '/interpreting' },
  { name: 'Shop',            path: '/shop' },
];

const ADMIN_PAGES = [
  { name: 'Login',           path: '/login',              requiresAuth: false },
  { name: 'Dashboard',       path: '/admin/dashboard',    requiresAuth: true  },
  { name: 'Cities List',     path: '/admin/cities',       requiresAuth: true  },
];

// ── Directories ────────────────────────────────────────────────────────
const SCREENSHOT_DIR = resolve(__dirname, 'screenshots');
const REPORT_PATH = resolve(__dirname, 'mobile-report.json');

// ── Helpers ────────────────────────────────────────────────────────────

function sanitize(name) {
  return name.replace(/[^a-zA-Z0-9_-]/g, '_');
}

async function ensureDir(dir) {
  await mkdir(dir, { recursive: true });
}

async function checkPage(page, url, viewportName, pageName) {
  const result = {
    page: pageName,
    viewport: viewportName,
    url,
    timestamp: new Date().toISOString(),
    overflow: { detected: false, scrollWidth: 0, clientWidth: 0 },
    failedImages: [],
    consoleErrors: [],
    screenshotPath: null,
    ok: true,
  };

  // Collect console errors
  const consoleErrors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  try {
    const response = await page.goto(url, { waitUntil: 'networkidle2', timeout: 30_000 });

    if (!response || !response.ok()) {
      result.ok = false;
      result.error = `HTTP ${response?.status() ?? 'no response'}`;
      return result;
    }

    // Wait a bit for late layout shifts
    await new Promise((r) => setTimeout(r, 500));

    // Check horizontal overflow
    const overflow = await page.evaluate(() => {
      const body = document.body;
      const html = document.documentElement;
      const scrollW = Math.max(body.scrollWidth, html.scrollWidth);
      const clientW = html.clientWidth;
      return { scrollWidth: scrollW, clientWidth: clientW };
    });

    result.overflow.scrollWidth = overflow.scrollWidth;
    result.overflow.clientWidth = overflow.clientWidth;

    if (overflow.scrollWidth > overflow.clientWidth + 1) {
      result.overflow.detected = true;
      result.ok = false;
    }

    // Check for elements overflowing the viewport
    const overflowingElements = await page.evaluate((viewportWidth) => {
      const elements = document.querySelectorAll('*');
      const overflowing = [];
      for (const el of elements) {
        const rect = el.getBoundingClientRect();
        if (rect.right > viewportWidth + 2 || rect.left < -2) {
          // Ignore fixed/sticky elements and overlays
          const style = window.getComputedStyle(el);
          if (style.position === 'fixed' || style.position === 'sticky') continue;
          // Ignore elements with overflow hidden on an ancestor
          if (style.overflow === 'hidden' || style.overflowX === 'hidden') continue;
          // Only report if the element is visible
          if (rect.width === 0 || rect.height === 0) continue;
          // Only report the first 5
          if (overflowing.length >= 5) break;
          overflowing.push({
            tag: el.tagName.toLowerCase(),
            id: el.id || null,
            classes: el.className?.toString?.().slice(0, 80) || null,
            width: Math.round(rect.width),
            right: Math.round(rect.right),
          });
        }
      }
      return overflowing;
    }, overflow.clientWidth);

    if (overflowingElements.length > 0) {
      result.overflow.detected = true;
      result.overflow.elements = overflowingElements;
      result.ok = false;
    }

    // Check for failed images
    const failedImages = await page.evaluate(() => {
      const imgs = Array.from(document.querySelectorAll('img'));
      return imgs
        .filter((img) => !img.complete || img.naturalWidth === 0)
        .map((img) => ({ src: img.src?.slice(0, 200), alt: img.alt?.slice(0, 80) || '' }))
        .slice(0, 10);
    });
    result.failedImages = failedImages;

    // Collect console errors
    result.consoleErrors = consoleErrors.filter(
      // Filter out benign DevTools / HMR noise
      (msg) => !msg.includes('DevTools') && !msg.includes('HMR') && !msg.includes('[vite]'),
    );

    // Take screenshot
    const ssName = `${sanitize(pageName)}-${sanitize(viewportName)}.png`;
    const ssPath = resolve(SCREENSHOT_DIR, ssName);
    await page.screenshot({ path: ssPath, fullPage: true });
    result.screenshotPath = ssPath;

  } catch (error) {
    result.ok = false;
    result.error = error.message;
  }

  return result;
}

// ── Main ───────────────────────────────────────────────────────────────

async function main() {
  console.log(`${BOLD}\n═══ LingTour Mobile Viewport Verification ═══${RESET}`);
  console.log(`${DIM}Site:  ${SITE_URL}${RESET}`);
  console.log(`${DIM}Admin: ${ADMIN_URL}${RESET}`);
  if (SKIP_ADMIN) console.log(`${DIM}Admin pages: skipped${RESET}`);
  console.log('');

  await ensureDir(SCREENSHOT_DIR);

  // Dynamic import of puppeteer (not a hard dep — bail gracefully)
  let puppeteer;
  try {
    puppeteer = await import('puppeteer');
  } catch {
    console.error(`${FAIL} puppeteer is not installed. Run: npm i -D puppeteer`);
    process.exit(1);
  }

  const allResults = [];

  const browser = await puppeteer.default.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    for (const viewport of VIEWPORTS) {
      console.log(`${BOLD}── ${viewport.name} (${viewport.width}×${viewport.height}) ──${RESET}`);

      const context = await browser.createBrowserContext();
      const page = await context.newPage();

      await page.setViewport({
        width: viewport.width,
        height: viewport.height,
        deviceScaleFactor: viewport.deviceScaleFactor,
        isMobile: viewport.isMobile,
        hasTouch: viewport.hasTouch,
      });

      // Set mobile user agent for phone viewports
      if (viewport.isMobile) {
        await page.setUserAgent(
          'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
        );
      }

      // ── Site pages ──
      for (const pg of SITE_PAGES) {
        const url = `${SITE_URL}${pg.path}`;
        const result = await checkPage(page, url, viewport.name, pg.name);
        allResults.push(result);

        const icon = result.ok ? PASS : FAIL;
        const detail = result.overflow.detected
          ? ` ${DIM}overflow: ${result.overflow.scrollWidth} > ${result.overflow.clientWidth}${RESET}`
          : '';
        console.log(`  ${icon} ${pg.name}${detail}`);
      }

      // ── Admin pages ──
      if (!SKIP_ADMIN) {
        for (const pg of ADMIN_PAGES) {
          if (pg.requiresAuth && !AUTH_TOKEN) {
            console.log(`  ${SKIP} ${pg.name} ${DIM}(no --auth-token)${RESET}`);
            allResults.push({
              page: pg.name,
              viewport: viewport.name,
              url: `${ADMIN_URL}${pg.path}`,
              skipped: true,
              reason: 'no auth token',
              ok: true,
            });
            continue;
          }

          const url = `${ADMIN_URL}${pg.path}`;
          const result = await checkPage(page, url, viewport.name, pg.name);

          // Inject auth cookie for admin pages that need it
          if (pg.requiresAuth && AUTH_TOKEN) {
            await page.setCookie({
              name: 'token',
              value: AUTH_TOKEN,
              domain: new URL(ADMIN_URL).hostname,
              path: '/',
            });
            // Re-navigate after setting cookie
            const retry = await checkPage(page, url, viewport.name, pg.name);
            Object.assign(result, retry);
          }

          allResults.push(result);
          const icon = result.ok ? PASS : FAIL;
          console.log(`  ${icon} ${pg.name}`);
        }
      }

      await context.close();
    }
  } finally {
    await browser.close();
  }

  // ── Build report ───────────────────────────────────────────────────
  const overflowResults = allResults.filter((r) => r.overflow?.detected);
  const failedImageResults = allResults.filter((r) => r.failedImages?.length > 0);
  const errorResults = allResults.filter((r) => r.consoleErrors?.length > 0);

  const report = {
    generatedAt: new Date().toISOString(),
    siteUrl: SITE_URL,
    adminUrl: ADMIN_URL,
    viewportsTested: VIEWPORTS.map((v) => v.name),
    totalChecks: allResults.length,
    overflowDetected: overflowResults.length,
    failedImagesCount: failedImageResults.reduce((sum, r) => sum + r.failedImages.length, 0),
    consoleErrorCount: errorResults.reduce((sum, r) => sum + r.consoleErrors.length, 0),
    passed: overflowResults.length === 0,
    results: allResults,
  };

  await writeFile(REPORT_PATH, JSON.stringify(report, null, 2), 'utf-8');

  // ── Summary table ──────────────────────────────────────────────────
  console.log(`\n${BOLD}──────────── Summary ─────────────${RESET}`);

  // Print per-viewport summary
  for (const vp of VIEWPORTS) {
    const vpResults = allResults.filter((r) => r.viewport === vp.name && !r.skipped);
    const passed = vpResults.filter((r) => r.ok).length;
    const failed = vpResults.filter((r) => !r.ok).length;
    const icon = failed === 0 ? PASS : FAIL;
    console.log(`  ${icon} ${vp.name.padEnd(22)} ${passed} passed, ${failed} failed`);
  }

  console.log(`${BOLD}──────────────────────────────────────${RESET}`);

  if (overflowResults.length > 0) {
    console.log(`  ${FAIL}${BOLD} Overflow detected on ${overflowResults.length} page(s):${RESET}`);
    for (const r of overflowResults) {
      console.log(`     ${r.page} @ ${r.viewport}: ${r.overflow.scrollWidth}px > ${r.overflow.clientWidth}px`);
      if (r.overflow.elements) {
        for (const el of r.overflow.elements) {
          console.log(`       <${el.tag}${el.id ? ` #${el.id}` : ''}${el.classes ? ` .${el.classes}` : ''}> width=${el.width} right=${el.right}`);
        }
      }
    }
  } else {
    console.log(`  ${PASS}${BOLD} No horizontal overflow detected.${RESET}`);
  }

  if (failedImageResults.length > 0) {
    const total = failedImageResults.reduce((sum, r) => sum + r.failedImages.length, 0);
    console.log(`  ${FAIL} ${total} image(s) failed to load.`);
  }

  console.log(`\n${DIM}Report: ${REPORT_PATH}${RESET}`);
  console.log(`${DIM}Screenshots: ${SCREENSHOT_DIR}${RESET}\n`);

  // Exit code
  process.exit(overflowResults.length > 0 ? 1 : 0);
}

main().catch((error) => {
  console.error(`${FAIL} Fatal error: ${error.message}`);
  process.exit(1);
});
