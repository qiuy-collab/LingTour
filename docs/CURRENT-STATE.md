# LingTour Current State

> **Live status source — 2026-09-07.** Update this file whenever Git, production, protected WIP, verification, deployment, recovery, or task status changes. [`LINGTOUR-HANDOFF-2026-07-26.md`](archive/LINGTOUR-HANDOFF-2026-07-26.md) and [`PROGRESS-2026-07-26-mobile-and-data-layer.md`](archive/PROGRESS-2026-07-26-mobile-and-data-layer.md) are historical snapshots now stored under [`archive/`](archive/). Stable operating rules live in [`../AGENT.md`](../AGENT.md); team guides in [`development.md`](development.md) and [`release.md`](release.md).

## 1. Production baseline

- Root production and root `origin/main`: `9b5dbfc9787d6bc5d200232bb6503bf3406c6057`.
- Server path: `/root/LingTour`.
- Production mode: PM2.
- `lingtour-api`, `lingtour-site`, and `lingtour-admin` were online on 2026-07-27.
- Public Site, Admin, and API health returned HTTP 200; API reported database `up`.
- Production has 21 applied migrations; all 21 reported `[X]`.
- Local code has a 22nd migration, `api/src/database/migrations/1761600000000-SecureInterpretingDeposits.ts`, in an unpushed commit and therefore not on production.
- Local `tools/deploy-pm2.sh` runs migrations after the API build and before service restart. The deployed `9b5dbfc` script does not yet contain that change.

Production has untracked artifacts that were not altered:

- `/root/LingTour/lingtour-deploy-20260709-retry.bundle`
- `/root/LingTour/lingtour-deploy-20260709.bundle`
- `/root/LingTour/lingtour-deploy-50fbca9.bundle`
- `/root/LingTour/site/public/assets/`

Do not delete production `site/public/assets/` without checking runtime references and whether it contains production-only media. PM2 showed high cumulative restart counts, especially `lingtour-site`; investigate separately rather than treating cumulative count as current downtime.

## 2. Local Git state before workspace cleanup

### Root repository

- Path: `E:/workspace/LingTour`
- Branch: `main`
- Local HEAD: `73f8c3a` (2026-09-05, "fix(site): restore manual home video playback") — refreshed 2026-09-07
- Upstream: in sync with `origin/main` (ahead 0, behind 0); the formerly unpushed commits below have been pushed
- Historical note: at the 2026-07-27 snapshot the HEAD was `deb12b1` ahead 7 of `origin/main@9b5dbfc`

Formerly unpushed commits (all pushed since; kept as record):

| SHA | Meaning |
| --- | --- |
| `7da7114` | Per-city, route, and product metadata/title generation |
| `56c5f40` | Dashboard user count matches traveler-only user management |
| `8c50c2f` | Booking completion DTO and mixed upload feedback fixes |
| `b109679` | Runtime fallback for broken interpreter portraits |
| `5cbe9cc` | Server-owned pricing, signed Stripe webhook validation, booking/deposit binding, new migration, and migration-aware deploy script |
| `713b8d3` | Public checkout/interpreting use the verified Stripe flow |
| `deb12b1` | Unsaved frontend-preview drafts handshake across windows |

### Independent admin repository

- Path: `E:/workspace/LingTour/admin-frontend`
- Branch: `main`
- Local HEAD: `acf770e` (2026-07-27, "fix(preview): send unsaved drafts to the popup window") — refreshed 2026-09-07
- Upstream: in sync with `origin/main` (ahead 0, behind 0); the formerly unpushed commits below have been pushed

Formerly unpushed commits (pushed since; kept as record):

| SHA | Meaning |
| --- | --- |
| `f750e62` | Mixed-upload success/failure reporting |
| `acf770e` | Unsaved draft delivery to popup preview |

The paired root/admin files have matching blobs. Before cleanup the complete tracked admin trees had zero differences except `.vscode/extensions.json`, which is intentionally tracked only by the independent admin repository.

## 3. Protected uncommitted onboarding work

The same physical admin files are visible as WIP from both repositories:

- Modified `admin-frontend/src/components/OnboardingTour.vue`
- Deleted `admin-frontend/src/components/OperationsGuide.vue`
- Added `admin-frontend/src/constants/onboarding.ts`
- Modified `admin-frontend/src/layout/AdminLayout.vue`
- Modified `admin-frontend/src/styles/theme.css`
- Modified `admin-frontend/src/views/dashboard/Dashboard.vue`

Implemented direction:

- Six spotlight steps with Next, Back, Skip, completion, and step count.
- Layout-level ownership and dashboard routing.
- Desktop/mobile navigation target.
- Versioned per-staff completion key `lingtour-admin-onboarding-v2:<staff-id>`.
- First-login opening and a global help re-entry button.
- Real target/popover geometry, focus entry/wrap/restore, Escape, reduced motion, and GSAP/observer/listener cleanup.
- Removal of the unreferenced static `OperationsGuide.vue`.
- Admin tokenized theme/z-index rather than arbitrary component values.

Build/browser evidence:

- Admin `vue-tsc` and production build passed.
- Browser work covered first open, all six steps, mobile targeting, persistence, re-entry, Escape/focus restore, and viewport geometry.

**Not ready to commit. Confirmed review blockers:**

High severity:

1. The tour overlay can cover and disable an unsaved-changes confirmation while route navigation is guarded.
2. During step activation the popover is unmounted and the modal focus trap disappears, allowing keyboard activation behind the overlay.

Medium severity:

1. `Ctrl+K` can focus the hidden command palette behind the tour.
2. The dialog references title/description elements that are absent while activation is pending.
3. External route changes can leave a stale spotlight/popover.
4. Crossing the mobile breakpoint does not reacquire the correct target.
5. The mobile charts target fills most of the viewport and removes meaningful dimming.
6. The mobile-nav copy asks users to click a target that the dim layer intercepts.
7. Dark-mode primary-button contrast is about 3.61:1, below WCAG AA for normal text.

No dedicated onboarding component/unit tests exist yet. Fix blockers, add focused tests, rerun visible-tab browser verification, and only then commit in both repositories.

## 4. Verification matrix

### 2026-07-26 mobile/data batch

- Site TypeScript/lint/tests/build passed at the time.
- API build passed.
- Admin `vue-tsc`/Vite build passed.
- Full browser sweep reached 7 widths × 13 pages; final sweep used 320, 375, 768, and 1280 across Home, Culture, Routes, Shop, Community, and Checkout.
- Final recorded results: zero page overflow, sticky-header failures, tested sub-44px touch targets, missing-copy markers, Chinese runtime-copy residue, or page-load errors.

Treat the old `147 total / 42 high` responsive source scan as historical, not a current count; rerun before using it as a backlog metric.

### 2026-07-27 current local validation

- API: 18/18 suites, 89/89 tests, production build passed.
- Site: 5/5 test files, 22/22 tests, production build passed.
- Site lint: zero errors and four pre-existing unused-code warnings in `site/src/lib/server-data.ts`.
- Site build warning: root metadata lacks `metadataBase`, so Open Graph/Twitter image resolution can fall back to `http://localhost:3000`.
- Admin production build passed; Vite reported large spreadsheet/chart vendor chunks as a performance warning.
- Preview handshake tests passed: configured opener origin receives ready, wrong sender is rejected, and the correct opener draft is accepted and persisted.

Focused payment tests cover server-owned price, DTO whitelist, immutable snapshots, raw-body/signature validation, metadata/amount/currency matching, webhook idempotency, late failure not downgrading paid/refunded orders, and atomic booking/deposit creation. Secure Stripe code is locally tested but not deployed or live-tested.

## 5. Production CRUD audit and recovery

Temporary audit evidence existed under `tmp/` and was consolidated here before cleanup.

Verified permissions/validation:

- Missing auth and invalid tokens returned HTTP 401.
- Invalid DTOs returned descriptive HTTP 400.
- Missing IDs returned HTTP 404.
- Audit logs were reachable and recorded the audit writes.
- All 23 audited admin GET endpoints returned HTTP 200.

Verified write flows and cleanup:

- Events, Community Briefs, Interpreting FAQs, and Interpreting service modes were created, refetched, updated, and deleted.
- Explicit audit records were cleaned up.
- Cities and Routes could be unpublished, republished, and restored to their original state.
- Orders, Bookings, Community Posts, Media, Notifications, and Staff lists were reachable.

Final unchanged-save losslessness passed 8/8:

1. Cities
2. Routes
3. Products
4. Collections
5. Interpreter profiles
6. Interpreting modes
7. Interpreting FAQs
8. Events

Recovery incidents:

- A Home round-trip exposed class-transformer coercion that emptied five `cultureHighlights`; commits `8867cf2` and `9b5dbfc` fixed the DTO/decorator behavior. Production content was restored to the pre-write content apart from expected timestamps. `trustMetrics`, `entryCards`, and `testimonials` were already empty before the audit.
- Route stop `details` exposed the same i18n-array conversion problem. Three route stops were restored byte-for-byte after ignoring regenerated IDs/timestamps. City sections and route stops are intentionally replaced on save, so child IDs change; no foreign keys, anchors, or bookmarks were found to depend on them.
- The initial City/Route/Product raw-save failures were audit-payload mistakes: server-managed fields were sent that the real admin form excludes.
- The Settings HTTP 400 was also an audit-script shape error: GET returns `{id, scope, payload}`, while PUT expects the payload contract. It is not a current product blocker.

## 6. Deployment queue

1. Fix onboarding review blockers and add focused automated coverage.
2. Validate admin build and visible-tab desktop/mobile/keyboard flows.
3. Commit onboarding precisely in the independent admin repository and root repository.
4. Push independent admin `main`.
5. Push root `main`.
6. Back up production PostgreSQL.
7. Confirm production still has only migrations 1–21 applied.
8. Deploy root `main` with `tools/deploy-pm2.sh` after reviewing the triggered GitHub Actions path.
9. Confirm `SecureInterpretingDeposits1761600000000` is applied.
10. Verify PM2 and external health.
11. Verify product checkout, interpreting deposit, Stripe webhook, order and booking state, popup draft preview, booking completion, mixed-media feedback, detail SEO titles, and onboarding.

Do not deploy unpushed code or run the new migration manually on the old production SHA.

## 7. Confirmed and pending backlog

### P0/P1 workflow and data verification

- `deposit_paid` bookings cannot proceed through the normal admin assignment/completion workflow; define the paid transition, likely to `confirmed` when assigned.
- Booking status updates need service-level transition validation; the current DTO/service shape can permit invalid transitions such as `new -> completed` or stale `cancelled -> completed`.
- Profile name/email/avatar persistence across refresh and re-login lacks a recorded production E2E.
- Media category persistence and the full video upload → poster → publish → public playback chain lack a recorded production-safe E2E.
- Slow-network image/video behavior remains untested.
- Secure Stripe code is not deployed or live-tested.
- Onboarding requires blocker fixes, tests, dual commit, deployment, and production verification.

### Product, SEO, accessibility, and operations

- Unknown route/city/product slugs render not-found UI with HTTP 200: soft 404.
- Root metadata lacks `metadataBase`.
- `site/src/app/interpreting/InterpretingPageClient.tsx` still fabricates interpreter dispatch counts.
- Rerun the responsive audit; historical hotspots include `CityArchivalBook`, admin `ProductEdit`, Dashboard, and responsive styles.
- Investigate high cumulative PM2 restart counts.
- Audit large Site/Admin vendor chunks and restore-time performance after functional blockers are closed.

## 8. Cleanup protection and recovery

Protected:

- Current session worktree: `E:/workspace/LingTour/.claude/worktrees/epic-lovelace-02e615`.
- `E:/workspace/LingTour/.claude/worktrees/compassionate-pike-10f12f`, which has three commits not on current main plus modified route pages and six untracked 3D route/map files.
- Root stash object `4650b3a0b398d187b94acf1d790e7c5574cb8032`, created 2026-05-16; preserve pending explicit review.
- Onboarding WIP listed above.
- `api/uploads/`, all local env/config, formal test suites, lockfiles, and committed operational tools.

A cleanup recovery package was created outside the workspace at `E:/workspace/LingTour-recovery-20260727` before deletion. It contains tracked patches, untracked-source archives, status baselines, stash identity, and SHA-256 checksums for onboarding and the protected 3D worktree. It intentionally contains no env values, token, private key, or uploads.

Cleanup rules:

- Never use broad `git clean`.
- Delete only explicit verified paths.
- Preserve formal `*.spec.ts`, `*.test.tsx`, integration/E2E tests, and tracked verification tools.
- Caches, dependency installations, build outputs, screenshots, browser profiles, one-off audit scripts, and results may be removed after their conclusions are recorded.
- Root and independent admin statuses must be rechecked after every shared-path deletion.

## 9. Historical documents

Historical evidence now lives under [`archive/`](archive/) — including `LINGTOUR-HANDOFF-2026-07-26.md`, `PROGRESS-2026-07-26-mobile-and-data-layer.md`, the old deployment manuals (`DEPLOYMENT.md`, `docker-deployment.md`, `site-deploy-checklist.md`), and process directories (`plans/`, `v1/`, `v2/`, prompt notes). Their SHA/WIP/deployment claims are superseded by this file. [`UI-OVERHAUL-2026.md`](UI-OVERHAUL-2026.md) and [`RESPONSIVE-SPEC.md`](RESPONSIVE-SPEC.md) stay at `docs/` root as design baselines; backend domain designs moved to [`backend/`](backend/).

## 10. Workspace cleanup receipt

Executed on 2026-07-27. No commit, push, deployment, migration, or production data mutation was performed.

Tracked additions/edits/deletions now pending review:

- Added root agent discovery and rules: `AGENT.md`, `AGENTS.md`, `CLAUDE.md`.
- Added this live status record: `docs/CURRENT-STATE.md`.
- Marked old handoff/progress docs as historical snapshots.
- Deleted byte-identical duplicate docs under `docs/v1`.
- Deleted stale `site/docs/admin-research` notes after their useful conclusions were consolidated.
- Deleted unused default Next starter SVGs: `file.svg`, `globe.svg`, `next.svg`, `vercel.svg`, `window.svg`.
- Deleted unused admin starter files in the shared admin tree: `HelloWorld.vue`, `PlaceholderPage.vue`, `hero.png`, `vite.svg`, `vue.svg`, `public/icons.svg`.
- Added `admin-frontend/.gitignore` rule for `.claude/` so temporary agent worktrees do not appear in the independent admin repository status.

Generated/untracked cleanup completed:

- Removed dependency installs: root, API, Site, and Admin `node_modules`.
- Removed build output and compiler caches: `site/.next`, `site/out`, `api/dist`, `admin-frontend/dist`, `*.tsbuildinfo`, and generated `next-env.d.ts`.
- Removed `tmp` audit scripts/results, browser profiles, screenshots, logs, old deployment bundles, route/home recovery scripts, Lark temporary exports, and HTML captures after consolidation.
- Removed `api/tmp/scan-dtos.mjs`, old ignored conversations, stale ignored evaluation project `projects/proj-1780569192701-vfh5qw`, empty `projects/proj-1778970788262-5mcldi`, and generated artifacts inside retained `projects/proj-1780224029807-y96lg8`.
- Removed completed admin agent worktree artifacts under `admin-frontend/.claude`.
- Removed six merged stale root worktrees and their local branches: `exciting-wing-3690c7`, `gallant-tesla-b8c8f0`, `goofy-raman-6431dd`, `intelligent-boyd-ab2538`, `kind-swanson-b1f0a5`, and `recursing-elbakyan-7ef8aa`.

Measured cleanup result:

- Before major cleanup: `tmp` 4.6 GiB, `site/.next` 2.4 GiB, Site deps 577 MiB, API deps 280 MiB, Admin deps 276 MiB, root deps 11 MiB, root worktrees 513 MiB, projects 41 MiB, conversations 34 MiB.
- After cleanup: workspace reported about 98 MiB; registered root worktrees reported about 20 MiB; retained projects reported about 256 KiB.
- One 17 KiB `tmp` directory remains because `tmp/server-key` is permission locked.

Skipped/residual cleanup:

- `E:/workspace/LingTour/tmp/server-key` remains. It is a 411-byte duplicate of the working SSH key stored outside the repo at `C:/Users/ASUS/Downloads/199.68.217.212_id_ed25519`; SSH to `lingtour-server` still works. Windows ACL grants only read access and rejected deletion without elevated privilege. Delete this file later from an elevated shell or by fixing its ACL. Do not commit it.
- Root `package.json` / `package-lock.json` remain, although root currently only declares `motion`; external/manual use was not conclusively disproven.
- `compassionate-pike-10f12f`, current `epic-lovelace-02e615`, and stash object `4650b3a0b398d187b94acf1d790e7c5574cb8032` were intentionally preserved.

Verification completed before dependency deletion:

- Site: `npx tsc --noEmit --skipLibCheck`, `npm run lint`, `npm run test:ci`, and `npm run build` passed. Lint still reported four pre-existing warnings in `site/src/lib/server-data.ts`. Next build still warned that `metadataBase` is missing.
- Admin: `npm run build` passed. Vite still warned about large spreadsheet/chart chunks.
- API: `npm test -- --runInBand` passed 18/18 suites and 89/89 tests; `npm run build` passed. `npx tsc --noEmit --skipLibCheck` still fails on pre-existing mock typing errors in `auth.service.spec.ts` and `cities.service.spec.ts`; formal tests were preserved.
- `git diff --check` passed for root and admin aside from LF-to-CRLF warnings.

Protected-state verification after cleanup:

- Onboarding working hashes match the pre-clean baseline for `OnboardingTour.vue`, `onboarding.ts`, `AdminLayout.vue`, `theme.css`, and `Dashboard.vue`; `OperationsGuide.vue` remains intentionally deleted in the WIP.
- `compassionate-pike-10f12f` still has its three unique commits, two modified route files, three old marker deletions, and six untracked 3D route/map files.
- The old stash object remains unchanged.
- Local env/config hashes were preserved.
- `api/uploads` remains and contains 24 files.
- Formal test sources remain tracked; 27 tracked formal test entries and 9 tracked operational tools were present after cleanup.
- Production remains `9b5dbfc`; SSH access works.

Dependency restoration before future development:

```bash
cd E:/workspace/LingTour/site && npm ci
```

```bash
cd E:/workspace/LingTour/api && npm ci
```

```bash
cd E:/workspace/LingTour/admin-frontend && npm ci
```

If root-level dependencies are needed, restore them separately with:

```bash
cd E:/workspace/LingTour && npm ci
```

## 11. 2026-09-06 culture-md / map / copy / admin-mobile batch (uncommitted)

- Site: culture detail restored to HEAD except the middle md section, now serialized from CMS fields (`shaoguan-article-document.ts`); `ShaoguanFieldArticle` renders admin-authored markdown; the local-file `content/culture/shaoguan.en.md` runtime bypass is gone.
- Site: culture/routes page clients restored to HEAD (SSR `initialData`, no hydration gate). Guangdong map route arcs projected from real city centroids; the clipped hardcoded coordinates are gone.
- Site copy: 13 AI-flavored strings replaced across `translations/`, `LoginPanel`, `TimeAxisItinerary`; fabricated "40+ Dispatches" removed; the only vertical text (routes hero badge `lg:-rotate-90`) is horizontal now.
- Admin: `I18nInput`/`I18nMarkdownEditor` preserve existing `zh` on edit (they wiped legacy `zh` before); `CommunityBriefs` payload keeps `zh`; new `useIsMobile` composable; booking/audit drawers go full-width on mobile.
- Verification: site tsc/lint(0 errors)/29 tests/build pass; admin build pass; local-API round-trip PASS (md write → public read-back; `zh` preserved); SSR checks: shaoguan md renders as h2/strong, routes detail renders full content without spinner, map paths stay inside the viewBox.
- Pending: real-browser sweep (multi-width, touch targets, reduced motion) — no browser tooling in session; admin large-table card view and breakpoint unification deferred because `AdminLayout.vue`/`theme.css` hold protected onboarding WIP; commit/push/migrate/deploy remain unauthorized.

## 12. 2026-09-07 repository housekeeping (uncommitted)

Documentation-only reorganization, executed after explicit user approval of the proposed plan. No source, schema, or business-logic change; nothing staged, committed, pushed, migrated, or deployed.

Moves (git shows delete + untracked add until committed):

- Five backend-design documents → `docs/backend/`.
- `DEPLOYMENT.md`, `docker-deployment.md`, `site-deploy-checklist.md`, `LINGTOUR-HANDOFF-2026-07-26.md`, `PROGRESS-2026-07-26-mobile-and-data-layer.md`, `后台Markdown编辑器与前台渲染提示词.md`, and the `plans/`, `v1/`, `v2/` directories → `docs/archive/`.

Deletions (all verified unreferenced; the png/md candidates were untracked so no history is lost):

- `docs/assets/lingtour-*-reference.png` ×3 — assistant-generated temporary visual references, zero references in code/docs.
- `site/content/culture/shaoguan.en.md` — runtime bypass already removed in the 2026-09-06 batch; `site/src` has zero references; empty `site/content/` directory removed.

Additions (untracked): `README.md`, `CHANGELOG.md` (Keep a Changelog, `1.0.0` baseline dated 2026-09-05 plus an `Unreleased` section), `docs/development.md` (environment, branches, code standards, Conventional Commits, dual-repo collaboration), `docs/release.md` (release channels, PM2 process table with real internal ports api 8000 / site 3001 / admin 4173 from `ecosystem.config.js`, migration rules, smoke tests, rollback).

Rewrites: `AGENT.md` (numbered sections, local/production address table, server/release pointers, archive links; every hard constraint preserved), the three application READMEs (scaffold defaults replaced with real project descriptions), and this file (date refresh, live Git state refresh below, and a numbering fix — the 2026-09-06 batch section was mis-numbered as a second `## 5` and is now `## 11`).

Live Git state refreshed on 2026-09-07:

- Root `main` in sync with `origin/main` at `73f8c3a` (2026-09-05); admin `main` in sync at `acf770e`. §2's old "ahead 7 / ahead 2" divergence is resolved; the tables remain as records.
- Production deploy SHA must be re-verified on the server; §1 numbers remain a 2026-07-27 snapshot.

Deferred owner decisions:

- `projects/proj-1780224029807-y96lg8` (9 tracked files) and `.impeccable/` (3 tracked files) are tracked tool artifacts. Untracking needs `git rm --cached` + `.gitignore` entries; deliberately not executed to keep this batch free of index changes.
- `tmp/server-key` remains per §10 (ACL-locked duplicate of the working SSH key); handle from an elevated shell. Never commit it.

## 13. 2026-09-07 housekeeping committed; origin diverged

The §12 batch is no longer uncommitted. Committed the same day after explicit user approval of §12's deferred decisions, using exact pathspec commits so the 21 foreign staged files were never included:

- `db90951` `docs: add repository guides and changelog` — README, CHANGELOG (its Unreleased section was also extended with the culture-md three-layer refactor, the route-detail map, and the testimonial fallback), AGENT/AGENTS/CLAUDE, `docs/development.md`, `docs/release.md`, this file.
- `c488ad3` `docs: reorganize docs into backend and archive` — 20 files: 11 pure renames into `docs/backend/` and `docs/archive/`, 2 renames that gained archive headers, the untracked prompt document added, and six `docs/v1/*` duplicate snapshots deleted (recoverable from this commit's parent). Empty `docs/archive/v1/` shells removed from disk.
- `94c1ced` `docs: replace scaffold READMEs` (root); the admin repository equivalent `75de4cf` was committed first per the dual-repo rule; both copies hash-identical.
- `aa5000b` + `ca6a035` `chore: untrack local tool working directories` — `projects/` and `.impeccable/` (12 files, 5459 lines) removed from the index only; files remain on disk and are now ignored via `.gitignore` rules `projects/` and `.impeccable/`. The split exists because a pathspec partial commit records working-tree content and cannot carry `rm --cached` deletions; `ca6a035` completes them through a temporary-index plumbing commit.

Unchanged per decision: `tmp/server-key` (never commit), `BT-DEPLOY-PATHS.md`, `ecosystem.config.js`, nginx configs (in place, indexed from `docs/release.md`).

Origin divergence discovered immediately after, read-only, not integrated:

- Root `main` is ahead 5 / behind 7; admin `main` ahead 1 / behind 1. The remote-only commits are collaborator `qiuy-collab` (2026-09-06 12:49 → 2026-09-07 19:04): culture Markdown persistence/rendering with a publication lifecycle, admin city Markdown authoring, itinerary editorial emphasis, and `site/src/components/mapcn/{map.tsx,LICENSE}` — the mapcn route map the user referenced exists on origin/main, not on the local branch.
- 15 files overlap between the remote changes and this workspace's uncommitted WIP (admin `CityEdit.vue`/`city.ts`, api cities entity/DTO/service and cache interceptor, site culture detail client, `TimeAxisItinerary`, `api-data.ts`, `server-api.ts`, `server-data.ts`, package manifests); the 8 newly committed guide documents also differ from origin.
- Consequence: pull/rebase/merge and push require an owner decision on integration strategy and were not executed. The 21 foreign staged files remain staged and untouched.

## 16. 2026-09-09 integration completed onto origin/main

Owner decision: remote-first with cherry-picks. Both repositories were reorganized without force-push and without `reset --hard`/`checkout --`/`stash`:

- Parallel implementation preserved on branches `backup/local-parallel-20260909` and `local-parallel` (root `0158d5e`+`365b51c`+`c497317`; admin same-named branches). Foreign WIP snapshotted there where a branch switch required it.
- Root `main` = `origin/main` + 12 cherry-picked commits (`73aedc5`..`08a4e0c`): housekeeping docs (6), home-map centroids, zh preservation, calendar mobile, de-AI copy, serviceCount removal, seeded-testimonials fallback. Skipped as superseded: local culture-md three-layer and react-leaflet route map.
- Admin `main` = `origin/main` + 3 (`d5de03a`..`e75d6a7`): README guide, zh preservation, calendar mobile. 141/142 tracked files byte-identical to root; the only intentional difference is `Dockerfile` (root builds from the repo root, admin from its own directory — pre-existing by design, like `.vscode/extensions.json`).
- Local DB aligned to the remote schema: `cities.content_markdown` converted jsonb→`text NOT NULL DEFAULT ''` (data was empty; backup in `tmp/content-markdown-backup-20260909.json`), `published_at` already present, stale `typeorm_migrations` row for the superseded `AddCityContentMarkdown1761700000000` removed. Remote migration `1761800000000` remains the single source of truth.
- Local env fix required by the remote `server-api.ts` contract: site `.env.local` `INTERNAL_API_ORIGIN` now carries the `/api/v1` suffix (untracked file, not committed).

Verification: api tsc clean (spec-mock typing warnings pre-existing per §11) + 144/144 tests + build; site tsc clean + 75/75 tests + lint 0 errors (5 pre-existing warnings) + build 18/18 pages; admin build clean. Browser (maplibre route map after "Load map"): map mounted 514×349, 4/4 markers rendered and `allInside: true`, coordinates complete; home testimonials fallback renders; home-map centroid paths present.

Nothing pushed. Root ahead 12, admin ahead 3. Push/deploy await authorization.

## 17. 2026-09-10 historical WIP committed

The owner approved merging the previously uncommitted onboarding, mobile-drawer, starter-artifact, and old research-document changes. They were committed with exact pathspecs; no unrelated worktree content was staged.

- Independent admin commits: `ee06ff3` (remove obsolete starter artifacts), `4e2ffbb` (centralize staff onboarding), `5455102` (mobile-friendly detail drawers), and `32b403a` (build-time service origins).
- Matching root commits: `79a7d41` (obsolete research and starter assets), `19a1d72` (staff onboarding), and `a829c0a` (mobile-friendly detail drawers). The root already tracked the same admin Dockerfile blob introduced by `32b403a`, so no duplicate root commit was necessary.
- Verification: `admin-frontend` production build passed; `git diff --check` passed in both repositories. The Vite build retained its existing large-chunk warning.
- Live Git state after the commits: root `main` is clean and ahead 3 of `origin/main`; independent admin `main` is clean and ahead 7 of `origin/main`.
- Nothing was pushed, deployed, migrated, or written to production. The earlier onboarding browser-review blockers were not re-exercised in this merge session; treat browser validation as required before any release.
