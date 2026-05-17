// QA Browser Test Script - Shopify Premium Standard Assessment
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const screenshotDir = join(__dirname, 'screenshots');
if (!existsSync(screenshotDir)) mkdirSync(screenshotDir, { recursive: true });

const BASE = 'http://localhost:3000';
const DESKTOP = { width: 1440, height: 900 };
const TABLET = { width: 768, height: 1024 };
const MOBILE = { width: 375, height: 812 };

const results = [];

function record(pageName, checks) {
  results.push({ page: pageName, ...checks, timestamp: new Date().toISOString() });
}

async function testPage(page, url, name, checks = []) {
  console.log(`\n=== Testing: ${name} ===`);
  console.log(`URL: ${url}`);

  const result = {
    loads: false,
    loadError: null,
    hasHero: false,
    hasCTA: false,
    noBrokenImages: true,
    brokenImages: [],
    noConsoleErrors: true,
    consoleErrors: [],
    contentComplete: false,
    layoutCorrect: false,
    visualQuality: 'unknown',
    notes: [],
  };

  try {
    // Navigate and wait for load
    const response = await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    result.loads = response && response.ok();
    if (!result.loads) {
      result.loadError = `HTTP ${response ? response.status() : 'no response'}`;
    }
  } catch (e) {
    result.loadError = e.message;
    record(name, result);
    return result;
  }

  // Check for console errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      result.consoleErrors.push(msg.text());
    }
  });
  page.on('pageerror', err => {
    result.consoleErrors.push(err.message);
  });

  // Wait a moment for React to settle
  await page.waitForTimeout(2000);

  // Check for hero section (common patterns: section with hero class, large heading, etc.)
  const heroHeading = await page.$('h1, [class*="hero"] h2, [class*="Hero"] h2');
  result.hasHero = heroHeading !== null;

  // Check for CTA buttons/links
  const ctaElements = await page.$$('a[href*="routes"], a[href*="interpreting"], a[href*="booking"], a[href*="#booking"], button, a[class*="cta"], a[class*="CTA"]');
  result.hasCTA = ctaElements.length > 0;

  // Check for broken images
  const images = await page.$$('img');
  for (const img of images) {
    const naturalWidth = await img.evaluate(el => el.naturalWidth);
    const src = await img.getAttribute('src') || 'unknown';
    if (naturalWidth === 0) {
      result.brokenImages.push(src);
    }
  }
  result.noBrokenImages = result.brokenImages.length === 0;

  // Check console errors
  await page.waitForTimeout(500);
  result.noConsoleErrors = result.consoleErrors.length === 0;

  // Content completeness: check for main content areas
  const mainContent = await page.$('main, [role="main"], .content, #content');
  const contentText = mainContent ? await mainContent.innerText() : await page.innerText('body');
  result.contentComplete = contentText.length > 200; // At least some content

  // Layout: check no horizontal overflow
  const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
  const viewportWidth = await page.evaluate(() => window.innerWidth);
  result.layoutCorrect = bodyWidth <= viewportWidth + 10;

  // Visual quality assessment (automated checks)
  const hasWhiteSpace = await page.evaluate(() => {
    const body = document.body;
    const style = window.getComputedStyle(body);
    return parseInt(style.paddingLeft) > 0 || parseInt(style.paddingRight) > 0;
  });

  // Take screenshot
  const safeName = name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  await page.screenshot({
    path: join(screenshotDir, `${safeName}_desktop.png`),
    fullPage: false
  });

  result.notes.push('Desktop screenshot captured');

  // Additional specific checks
  for (const check of checks) {
    try {
      await check(page, result);
    } catch (e) {
      result.notes.push(`Check failed: ${e.message}`);
    }
  }

  record(name, result);
  return result;
}

// Page-specific checks
async function homeChecks(page, result) {
  // Check event carousel exists
  const carousel = await page.$('[class*="carousel"], [class*="Carousel"], [class*="EventRoute"]');
  result.notes.push(`Event carousel: ${carousel ? 'found' : 'NOT found'}`);

  // Check calendar exists
  const calendar = await page.$('[class*="calendar"], [class*="Calendar"], [class*="EventCalendar"]');
  result.notes.push(`Calendar: ${calendar ? 'found' : 'NOT found'}`);

  // Check culture gallery
  const cultureGallery = await page.$('[class*="Culture"], [class*="culture"]');
  result.notes.push(`Culture section: ${cultureGallery ? 'found' : 'NOT found'}`);

  // Check travel notes section
  const travelNotes = await page.$('[class*="post"], [class*="Post"], [class*="community"], [class*="Community"], [class*="Traveler"]');
  result.notes.push(`Travel notes: ${travelNotes ? 'found' : 'NOT found'}`);
}

async function routesChecks(page, result) {
  // Check map
  const map = await page.$('svg, [class*="map"], [class*="Map"], [class*="RouteExplorer"]');
  result.notes.push(`Map/SVG: ${map ? 'found' : 'NOT found'}`);

  // Check region filters
  const filters = await page.$$('[class*="region"], [class*="Region"], button');
  result.notes.push(`Region filters: ${filters.length > 0 ? `${filters.length} elements found` : 'NOT found'}`);

  // Check route cards
  const cards = await page.$$('[class*="card"], [class*="Card"], [class*="route"]');
  result.notes.push(`Route cards: ${cards.length > 0 ? `${cards.length} cards found` : 'NOT found'}`);
}

async function routeDetailChecks(page, result) {
  // Check map
  const map = await page.$('svg, [class*="map"], [class*="Map"], [class*="Polyline"]');
  result.notes.push(`Route map: ${map ? 'found' : 'NOT found'}`);

  // Check node index
  const nodeIndex = await page.$('[class*="NodeIndex"], [class*="node-index"], [class*="stop"]');
  result.notes.push(`Node index: ${nodeIndex ? 'found' : 'NOT found'}`);

  // Check community section
  const community = await page.$('[class*="Community"], [class*="community"], #route-community');
  result.notes.push(`Community section: ${community ? 'found' : 'NOT found'}`);

  // Check arrangements
  const arrangements = await page.$('[class*="Arrangement"], [class*="arrangement"]');
  result.notes.push(`Arrangements: ${arrangements ? 'found' : 'NOT found'}`);
}

async function cultureChecks(page, result) {
  const themeCards = await page.$$('[class*="theme"], [class*="Theme"], [class*="card"]');
  result.notes.push(`Theme cards: ${themeCards.length > 0 ? `${themeCards.length} found` : 'NOT found'}`);

  // Check CTA links to routes
  const routeLinks = await page.$$('a[href*="routes"]');
  result.notes.push(`Routes CTA links: ${routeLinks.length > 0 ? `${routeLinks.length} found` : 'NOT found'}`);
}

async function interpretingChecks(page, result) {
  // Check packages
  const packages = await page.$$('[class*="package"], [class*="Package"], [class*="Scene"]');
  result.notes.push(`Scene packages: ${packages.length > 0 ? `${packages.length} found` : 'NOT found'}`);

  // Check levels
  const levels = await page.$$('[class*="level"], [class*="Level"], [class*="Interpreter"]');
  result.notes.push(`Interpreter levels: ${levels.length > 0 ? `${levels.length} found` : 'NOT found'}`);

  // Check price builder
  const priceBuilder = await page.$('[class*="price"], [class*="Price"], [class*="Builder"]');
  result.notes.push(`Price builder: ${priceBuilder ? 'found' : 'NOT found'}`);

  // Check booking form
  const bookingForm = await page.$('#booking, [class*="booking"], [class*="Booking"], form');
  result.notes.push(`Booking form: ${bookingForm ? 'found' : 'NOT found'}`);

  // Check FAQ
  const faq = await page.$('[class*="faq"], [class*="FAQ"], [class*="Faq"]');
  result.notes.push(`FAQ: ${faq ? 'found' : 'NOT found'}`);
}

async function postsChecks(page, result) {
  const postList = await page.$$('[class*="post"], [class*="Post"], article');
  result.notes.push(`Posts: ${postList.length > 0 ? `${postList.length} found` : 'NOT found'}`);

  const filters = await page.$$('[class*="filter"], [class*="Filter"], select');
  result.notes.push(`Filters: ${filters.length > 0 ? `${filters.length} found` : 'NOT found'}`);
}

async function userPostsChecks(page, result) {
  const profile = await page.$('[class*="profile"], [class*="Profile"], [class*="user"], [class*="User"], [class*="avatar"], [class*="Avatar"]');
  result.notes.push(`User profile: ${profile ? 'found' : 'NOT found'}`);

  const postList = await page.$$('[class*="post"], [class*="Post"], article');
  result.notes.push(`User posts: ${postList.length > 0 ? `${postList.length} found` : 'NOT found'}`);
}

async function main() {
  console.log('Starting QA Browser Tests...\n');
  console.log('=' .repeat(60));

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: DESKTOP });
  const page = await context.newPage();

  // Collect console errors globally
  const consoleErrors = [];
  page.on('pageerror', err => consoleErrors.push(err.message));

  try {
    // 1. Home Page
    await testPage(page, `${BASE}/`, 'Home Page', [homeChecks]);
    await page.waitForTimeout(1000);

    // 2. Routes Page
    await testPage(page, `${BASE}/routes/`, 'Routes Page', [routesChecks]);
    await page.waitForTimeout(1000);

    // 3. Route Detail
    await testPage(page, `${BASE}/routes/southern-sea-table/`, 'Route Detail Page', [routeDetailChecks]);
    await page.waitForTimeout(1000);

    // 4. Culture Page
    await testPage(page, `${BASE}/culture/`, 'Culture Page', [cultureChecks]);
    await page.waitForTimeout(1000);

    // 5. Interpreting Page
    await testPage(page, `${BASE}/interpreting/`, 'Interpreting Page', [interpretingChecks]);
    await page.waitForTimeout(1000);

    // 6. Posts Page
    await testPage(page, `${BASE}/posts/`, 'Posts Page', [postsChecks]);
    await page.waitForTimeout(1000);

    // 7. User Posts Page
    await testPage(page, `${BASE}/users/1/posts/`, 'User Posts Page', [userPostsChecks]);
    await page.waitForTimeout(1000);

    // Responsive tests (quick check on key pages)
    console.log('\n=== Testing Responsive Layouts ===');

    // Tablet - Home
    await page.setViewportSize(TABLET);
    await page.goto(`${BASE}/`, { waitUntil: 'networkidle', timeout: 20000 });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: join(screenshotDir, 'home_tablet.png'), fullPage: false });
    const tabletOverflow = await page.evaluate(() => document.body.scrollWidth <= window.innerWidth + 10);
    record('Home (Tablet 768px)', { layoutCorrect: tabletOverflow, loads: true });

    // Tablet - Routes
    await page.goto(`${BASE}/routes/`, { waitUntil: 'networkidle', timeout: 20000 });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: join(screenshotDir, 'routes_tablet.png'), fullPage: false });
    const routesTabletOverflow = await page.evaluate(() => document.body.scrollWidth <= window.innerWidth + 10);
    record('Routes (Tablet 768px)', { layoutCorrect: routesTabletOverflow, loads: true });

    // Mobile - Home
    await page.setViewportSize(MOBILE);
    await page.goto(`${BASE}/`, { waitUntil: 'networkidle', timeout: 20000 });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: join(screenshotDir, 'home_mobile.png'), fullPage: false });
    const mobileOverflow = await page.evaluate(() => document.body.scrollWidth <= window.innerWidth + 10);
    record('Home (Mobile 375px)', { layoutCorrect: mobileOverflow, loads: true });

    // Mobile - Routes
    await page.goto(`${BASE}/routes/`, { waitUntil: 'networkidle', timeout: 20000 });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: join(screenshotDir, 'routes_mobile.png'), fullPage: false });
    const routesMobileOverflow = await page.evaluate(() => document.body.scrollWidth <= window.innerWidth + 10);
    record('Routes (Mobile 375px)', { layoutCorrect: routesMobileOverflow, loads: true });

    // Mobile - Route Detail
    await page.goto(`${BASE}/routes/southern-sea-table/`, { waitUntil: 'networkidle', timeout: 20000 });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: join(screenshotDir, 'route_detail_mobile.png'), fullPage: false });
    const detailMobileOverflow = await page.evaluate(() => document.body.scrollWidth <= window.innerWidth + 10);
    record('Route Detail (Mobile 375px)', { layoutCorrect: detailMobileOverflow, loads: true });

    // Mobile - Interpreting
    await page.goto(`${BASE}/interpreting/`, { waitUntil: 'networkidle', timeout: 20000 });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: join(screenshotDir, 'interpreting_mobile.png'), fullPage: false });
    const interpMobileOverflow = await page.evaluate(() => document.body.scrollWidth <= window.innerWidth + 10);
    record('Interpreting (Mobile 375px)', { layoutCorrect: interpMobileOverflow, loads: true });

  } catch (e) {
    console.error('Fatal error during testing:', e.message);
    results.push({ page: 'FATAL', error: e.message });
  }

  // Write results
  const reportPath = join(__dirname, 'qa-raw-results.json');
  writeFileSync(reportPath, JSON.stringify(results, null, 2));
  console.log(`\n\nResults written to: ${reportPath}`);
  console.log(`Screenshots saved to: ${screenshotDir}`);
  console.log(`Total console errors captured: ${consoleErrors.length}`);

  await browser.close();
}

main().catch(err => {
  console.error('Unhandled error:', err);
  process.exit(1);
});
