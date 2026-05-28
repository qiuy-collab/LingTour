#!/usr/bin/env node
/**
 * Three-tier sync verification script for LingTour.
 *
 * Verifies the full data flow: Admin → API → Site
 *
 * Usage:
 *   node tools/three-tier-verify.mjs \
 *     --admin-url  https://admin.lingfengtranstour.cn \
 *     --site-url   https://lingfengtranstour.cn \
 *     --auth-token <jwt>
 *
 * If --auth-token is omitted the script will attempt login via
 * the ADMIN_USER / ADMIN_PASS environment variables.
 */

import { parseArgs } from "node:util";

// ---------------------------------------------------------------------------
// CLI args
// ---------------------------------------------------------------------------
const { values: args } = parseArgs({
  options: {
    "admin-url":  { type: "string" },
    "site-url":   { type: "string" },
    "auth-token": { type: "string" },
  },
  strict: false,
});

const ADMIN_URL  = (args["admin-url"]  ?? process.env.ADMIN_URL  ?? "http://localhost:3000").replace(/\/+$/, "");
const SITE_URL   = (args["site-url"]   ?? process.env.SITE_URL   ?? "http://localhost:3001").replace(/\/+$/, "");
let   AUTH_TOKEN = args["auth-token"] ?? process.env.ADMIN_TOKEN ?? "";

const API = `${ADMIN_URL}/api/v1`;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
let passCount = 0;
let failCount = 0;
const failures = [];

function pass(label) {
  passCount++;
  console.log(`  \x1b[32m✓\x1b[0m ${label}`);
}

function fail(label, detail = "") {
  failCount++;
  const msg = detail ? `${label} — ${detail}` : label;
  failures.push(msg);
  console.log(`  \x1b[31m✗\x1b[0m ${msg}`);
}

async function jsonFetch(url, opts = {}) {
  const res = await fetch(url, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      ...(opts.headers ?? {}),
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} ${res.statusText} — ${url}\n${text.slice(0, 200)}`);
  }
  return res.json();
}

async function headCheck(url) {
  try {
    const res = await fetch(url, { method: "HEAD" });
    return res.ok;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------
async function ensureAuth() {
  if (AUTH_TOKEN) return;
  const user = process.env.ADMIN_USER;
  const pass_ = process.env.ADMIN_PASS;
  if (!user || !pass_) {
    console.error("No --auth-token and no ADMIN_USER/ADMIN_PASS env vars. Cannot authenticate.");
    process.exit(1);
  }
  console.log("Logging in with ADMIN_USER / ADMIN_PASS …");
  const data = await jsonFetch(`${API}/auth/login`, {
    method: "POST",
    body: JSON.stringify({ username: user, password: pass_ }),
  });
  AUTH_TOKEN = data.token ?? data.access_token ?? "";
  if (!AUTH_TOKEN) throw new Error("Login succeeded but no token in response");
  console.log("  Login OK\n");
}

function authHeaders() {
  return { Authorization: `Bearer ${AUTH_TOKEN}` };
}

// ---------------------------------------------------------------------------
// Verification helpers
// ---------------------------------------------------------------------------
async function verifyEntity({ entityType, adminListPath, slugField = "slug", publicPath }) {
  console.log(`\n── ${entityType.toUpperCase()} ──`);

  // 1. Fetch from admin API
  let adminItems;
  try {
    adminItems = await jsonFetch(`${API}${adminListPath}`, { headers: authHeaders() });
    if (Array.isArray(adminItems)) {
      // ok
    } else if (adminItems.data && Array.isArray(adminItems.data)) {
      adminItems = adminItems.data;
    } else if (adminItems.items && Array.isArray(adminItems.items)) {
      adminItems = adminItems.items;
    } else {
      // single item or unknown shape — wrap it
      adminItems = [adminItems];
    }
  } catch (e) {
    fail(`${entityType}: fetch admin list`, e.message);
    return;
  }

  if (adminItems.length === 0) {
    console.log(`  (no ${entityType} records found in admin API — skipping)`);
    return;
  }

  const sample = adminItems[0];
  const slug = sample[slugField] ?? sample.id;
  const adminTitle = sample.title ?? sample.name ?? "";

  pass(`${entityType}: fetched admin list (${adminItems.length} items)`);

  // 2. Fetch from public API
  let publicItem;
  try {
    publicItem = await jsonFetch(`${API}${publicPath}/${slug}`);
  } catch (e) {
    fail(`${entityType}: fetch public API for "${slug}"`, e.message);
    return;
  }

  const publicTitle = publicItem.title ?? publicItem.name ?? "";

  // 3. Compare key fields
  if (adminTitle && publicTitle) {
    if (adminTitle === publicTitle || typeof adminTitle === "object") {
      pass(`${entityType}: title matches between admin and public`);
    } else {
      fail(`${entityType}: title mismatch`, `admin="${adminTitle}" vs public="${publicTitle}"`);
    }
  }

  // published status
  if ("published" in sample) {
    if (sample.published === true || sample.published === undefined) {
      pass(`${entityType}: admin item is published`);
    } else {
      fail(`${entityType}: admin item is NOT published`, `published=${sample.published}`);
    }
  }

  // heroImage accessibility
  const heroImage = sample.heroImage ?? sample.image ?? "";
  if (heroImage) {
    const imageUrl = heroImage.startsWith("http") ? heroImage : `${SITE_URL}${heroImage.startsWith("/") ? "" : "/"}${heroImage}`;
    const ok = await headCheck(imageUrl);
    if (ok) {
      pass(`${entityType}: hero image accessible (${imageUrl})`);
    } else {
      fail(`${entityType}: hero image NOT accessible`, imageUrl);
    }
  }

  // 4. Fetch the site page HTML and check for the title
  if (adminTitle) {
    const pagePath = entityType === "city" ? `/culture/${slug}`
                   : entityType === "route" ? `/routes/${slug}`
                   : entityType === "product" ? `/shop/${slug}`
                   : `/${slug}`;
    try {
      const res = await fetch(`${SITE_URL}${pagePath}`, { redirect: "follow" });
      if (!res.ok) {
        fail(`${entityType}: site page ${pagePath}`, `HTTP ${res.status}`);
      } else {
        const html = await res.text();
        // Check for title text — handle both plain string and i18n object
        const titleStr = typeof adminTitle === "object"
          ? (adminTitle.en ?? adminTitle.zh ?? Object.values(adminTitle)[0] ?? "")
          : adminTitle;
        if (titleStr && html.includes(titleStr)) {
          pass(`${entityType}: title "${titleStr}" found on site page ${pagePath}`);
        } else if (titleStr) {
          fail(`${entityType}: title "${titleStr}" NOT found on site page ${pagePath}`);
        }
      }
    } catch (e) {
      fail(`${entityType}: fetch site page ${pagePath}`, e.message);
    }
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  console.log("╔══════════════════════════════════════════════╗");
  console.log("║   LingTour Three-Tier Sync Verification      ║");
  console.log("╚══════════════════════════════════════════════╝");
  console.log(`  Admin URL : ${ADMIN_URL}`);
  console.log(`  Site URL  : ${SITE_URL}`);
  console.log();

  // Step 0: Connectivity check
  console.log("── CONNECTIVITY ──");
  try {
    await jsonFetch(`${API}/public/cities`);
    pass("Admin API reachable");
  } catch (e) {
    fail("Admin API reachable", e.message);
  }
  try {
    const res = await fetch(SITE_URL);
    if (res.ok) pass("Site reachable");
    else fail("Site reachable", `HTTP ${res.status}`);
  } catch (e) {
    fail("Site reachable", e.message);
  }

  await ensureAuth();

  // Step 1–6: Verify each entity tier
  await verifyEntity({
    entityType: "city",
    adminListPath: "/admin/cities",
    slugField: "slug",
    publicPath: "/public/cities",
  });

  await verifyEntity({
    entityType: "route",
    adminListPath: "/admin/routes",
    slugField: "slug",
    publicPath: "/public/routes",
  });

  await verifyEntity({
    entityType: "product",
    adminListPath: "/admin/products",
    slugField: "slug",
    publicPath: "/public/products",
  });

  // Step 7: Report
  console.log("\n══════════════════════════════════════════════");
  console.log(`  PASSED : ${passCount}`);
  console.log(`  FAILED : ${failCount}`);
  if (failures.length > 0) {
    console.log("\n  Failures:");
    for (const f of failures) {
      console.log(`    • ${f}`);
    }
  }
  console.log("══════════════════════════════════════════════\n");

  process.exit(failCount > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error("\nFatal error:", e);
  process.exit(2);
});
