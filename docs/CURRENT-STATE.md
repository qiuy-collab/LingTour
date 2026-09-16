# Culvoy Current State

> **Live status source — 2026-09-16.** Update this file whenever Git, production, protected WIP, verification, deployment, recovery, or task status changes. [`LINGTOUR-HANDOFF-2026-07-26.md`](archive/LINGTOUR-HANDOFF-2026-07-26.md) and [`PROGRESS-2026-07-26-mobile-and-data-layer.md`](archive/PROGRESS-2026-07-26-mobile-and-data-layer.md) are historical snapshots now stored under [`archive/`](archive/). Stable operating rules live in [`../AGENT.md`](../AGENT.md); team guides in [`development.md`](development.md) and [`release.md`](release.md).

## 1. Production baseline

- Production deployed application commit: `002708a`; homepage redesign `92a4f96` is pending deployment.
- Server path: `/root/LingTour`.
- Production mode: Docker Compose (`docker-compose.prod.yml`).
- `lingtour-api`, `lingtour-site`, `lingtour-admin`, `lingtour-nginx`, and Redis are healthy after the 2026-09-16 deployment.
- Public Site, Admin, and API health returned HTTP 200; API reported database `up`.
- Production has 29 applied migrations; all reported `[X]`, including `EnglishOnlyContent1762300000000`.
- The deployed release was built and migrated through `tools/deploy-docker.sh`; PM2 was not used.

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
- Local HEAD: `92a4f96` homepage redesign on top of the English-only production rollout.
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
- Local HEAD: `38475be` (2026-09-16, English-only content editing)
- Upstream: in sync with `origin/main` (ahead 0, behind 0); the formerly unpushed commits below have been pushed

Formerly unpushed commits (pushed since; kept as record):

| SHA | Meaning |
| --- | --- |
| `f750e62` | Mixed-upload success/failure reporting |
| `acf770e` | Unsaved draft delivery to popup preview |

The paired root/admin files have matching blobs. Before cleanup the complete tracked admin trees had zero differences except `.vscode/extensions.json`, which is intentionally tracked only by the independent admin repository.

## 3. Protected uncommitted work

No protected uncommitted source changes remain in either repository. The remaining root untracked items are reference/review artifacts and local preview source preserved by policy.

### 2026-09-16 English-only content rollout

- Functional commits: root `0a94b70` (API and migration), root `6a7e0f8` (site and shared contract), root `1f53eaa` (admin mirror); independent admin `38475be`.
- Local validation passed: API tsc, 22 suites/98 tests/build; site tsc, 18 suites/101 tests/build; admin build; 390px browser smoke for site and admin login.
- Production backup `/root/backups/lingtour-db-pre-english-only-20260916.dump` (144856 bytes), read-only status (28 applied before deployment), deployment runs `35063493183` and `35064138513`, and post-deploy smoke all passed.

### 2026-09-16 Homepage redesign

- Root commit `92a4f96`; no API or database changes. Local site tsc, tests, lint, build, and 390px/1440px browser smoke passed. Deployment is pending.

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

1. Recheck public English-only payloads and admin create/edit/save/refresh flows after any future content changes.

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
- Local branch `claude/compassionate-pike-10f12f` (three commits not on current main). Its worktree was removed on 2026-09-13 (see below); the branch itself is retained.
- Root stash object `4650b3a0b398d187b94acf1d790e7c5574cb8032`, created 2026-05-16; preserve pending explicit review.
- Onboarding WIP listed above.
- `api/uploads/`, all local env/config, formal test suites, lockfiles, and committed operational tools.

A cleanup recovery package was created outside the workspace at `E:/workspace/LingTour-recovery-20260727` before deletion. It contains tracked patches, untracked-source archives, status baselines, stash identity, and SHA-256 checksums for onboarding and the protected 3D worktree. It intentionally contains no env values, token, private key, or uploads.

Worktree cleanup on 2026-09-13 (owner-approved; branches retained, no commit/push/deploy): removed two stale dirty worktrees whose uncommitted changes were older than two weeks — `stoic-dijkstra-eb7870` (detached at `deb12b1`; Shaoguan culture-article WIP last touched 2026-08-24) and `compassionate-pike-10f12f` (3D route/map experiment last touched 2026-05-16; its three unique commits stay on the retained branch). Before removal, every modified/untracked file plus HEAD/status and the full diff patch were copied to `E:/workspace/LingTour/.claude/backups/stale-worktrees-20260913/` (ignored; 271 KiB). Remaining auxiliary worktrees: `blissful-mendel-b2030c`, `epic-lovelace-02e615`, `inspiring-mestorf-0bde0d` (login refactor WIP, 2026-09-05/06), `musing-elbakyan-5e8d76`, `optimistic-ellis-4598a1`, `recursing-wozniak-71f4a1`.

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

## 18. 2026-09-10 public-site editorial work restored locally

The owner identified the intended public-site work as the Claude worktree branch `claude/optimistic-ellis-4598a1`. Its three continuous commits were cherry-picked cleanly into root `main`:

- `04199be` `refactor(site): restore field journal priority surfaces`
- `01c3c1b` `refactor(site): simplify public editorial copy`
- `b13f8f0` `fix(site): keep editorial page content immediately visible`

The batch covers Culture list/detail, Routes list/detail, the traveler login entry, Markdown and related-content presentation, route brief/map/itinerary hierarchy, and copy simplification across public surfaces. No admin repository change was made in this batch.

Verification passed: site TypeScript, 14 test files / 78 tests, and production build. Site lint exited successfully with zero errors; it reports generated MapLibre worker warnings plus pre-existing application warnings. The root public site was rebuilt and restarted on local port 3000 with its existing local configuration; `/login` returned HTTP 200.

Local Culture detail is currently HTTP 500 because its server-side request correctly targets `127.0.0.1:8000`, but the Culvoy API is not running. The local API's PostgreSQL connection was rejected with authentication error `28P01`; port 5432 is occupied by a host PostgreSQL instance, no Culvoy Compose services, data volume, or restorable local database backup was found. Do not seed, reset, overwrite that database, or change credentials without identifying the intended Culvoy local database and providing/repairing its connection configuration.

Nothing was pushed, deployed, migrated, or written to production.

## 19. 2026-09-10 local empty database stack started

The owner confirmed replacement of the unavailable host database with a fresh, isolated local instance. The Windows `postgresql-x64-16` service that owned port 5432 was stopped with administrator authorization; it remains stopped. Culvoy Docker Compose then created the `lingtour_pgdata` volume and started `lingtour-postgres-1` on port 5432.

- The local API database and role were created from the existing local API configuration without exposing credentials. The database was confirmed empty before initialization.
- All 25 tracked TypeORM migrations were applied successfully. The first attempt rolled back at the historical `AddAdminNotifications` step because the new database lacked `uuid-ossp`; the extension was created on the isolated local container and the full migration set then completed. No seed, import, reset, or `--apply` script was run.
- The API is running locally on port 8000 and `/health` returns HTTP 200. The public site remains on port 3000; `/culture/` now returns HTTP 200 instead of HTTP 500. A historical detail URL such as `/culture/shaoguan` returns HTTP 404 because the new local database contains no city, route, user, or media records.

Nothing was pushed, deployed, or written to production. Restoring historical local Culture content requires a known Culvoy database backup or an explicitly approved data source; it cannot be reconstructed from the empty volume.

Follow-up check: the prior Windows PostgreSQL service still has its data directory at `C:\Program Files\PostgreSQL\16\data`; it was not deleted. The service was temporarily started for a read-only verification, but the database credentials in the repository's existing local configuration were rejected. Its contents therefore remain unconfirmed and inaccessible without the original credentials or a backup. The Windows service was stopped again and the Docker local database was restored as the active port-5432 instance.

## 20. 2026-09-10 detailed local preview content

The owner authorized detailed preview content for the isolated localhost database. `api/src/database/seeds/seed-local-preview.ts` is guarded against non-local hosts and writes one connected Zhanjiang preview set: city and three culture sections, route and four stops, collection and product, service mode, interpreter, FAQ, event, community post and brief, home config, settings, local preview accounts, booking, order, favorite, notification, audit record, and media record. No existing seed/reset command was run and nothing was written outside the local Docker database.

- Six real images were downloaded from Wikimedia Commons to `api/uploads/preview/`; attribution and license metadata are retained locally in `ATTRIBUTION.jsonl`. Public data references only `/uploads/preview/...` paths, never external image URLs.
- API public city, route, and product endpoints returned HTTP 200. Culture, routes, shop detail, interpreting, and community public pages returned HTTP 200. Local images returned HTTP 200 through both API and site origins.
- API TypeScript still reports existing test-mock typing errors; the new seed script itself compiled and ran through `ts-node` successfully. Browser automation was unavailable because the local browser automation token was missing.

Nothing was committed, pushed, deployed, migrated, or written to production.

## 21. 2026-09-11 culvoy.com domain migration deployed

The owner created proxied Cloudflare A records for `culvoy.com`, `admin.culvoy.com`, and `api.culvoy.com` pointing at `199.68.217.212` and authorized the full cutover with legacy parallel support.

- Repository: 13 active files replaced `culvoy.com` with `culvoy.com` (compose environment/build args, `nginx.docker.conf` server names, deploy and smoke scripts, site/admin build-time domains, guides); `nginx.docker.conf` keeps legacy domains alongside the new ones; `hello@culvoy.cn` unified to `hello@culvoy.com`. Committed as `5bec3bf` (brand) and `4e21907` (domains) in both repositories and pushed.
- Server: `/root/LingTour/.env` (`GOOGLE_CALLBACK_URL`) and `api/.env` (`FRONTEND_URL`) switched after backup to `/root/backups/env-*-pre-domain-*.bak`; BT-panel vhosts `html_culvoy.com.conf`, `html_admin.culvoy.com.conf`, and `api.culvoy.com.conf` were derived from the legacy confs (proxy cache zone renamed to avoid a duplicate-zone collision, well-known includes created) and reloaded; the database was backed up to `/root/backups/lingtour-db-pre-domain-20260911-225953.dump`.
- Deploy: `deploy.yml` is `workflow_dispatch`-only, so the AGENT.md claim that pushing to `main` triggers deployment is wrong; deployment ran `tools/deploy-docker.sh` directly on the server and HEAD is now `4e21907`. Site and admin image builds on the 2 GB host caused a roughly six-minute memory-exhaustion outage (TCP ports answered but userland froze); the host self-recovered and the build completed with swap absorbing the peak. The script's health check reported 502 because `lingtour-nginx-1` (up 2 days) kept stale upstream DNS after the app containers were recreated; `docker restart lingtour-nginx-1` fixed it. `tools/deploy-docker.sh` now restarts nginx after `up -d` to re-resolve upstreams.
- Verification over Cloudflare: `https://culvoy.com` 200 (title "Culvoy Guangdong"), `https://admin.culvoy.com` 200 ("Culvoy Admin"), `https://api.culvoy.com/health` 200 JSON; the legacy `culvoy.com` family stays 200 in parallel; the new homepage contains zero `lingtour` strings.
- Pending: CI remains red on `Build Site image` (pre-existing; `7046446` failed the same way), while server-side builds succeed. Recommended follow-up for the zone owner: switch Cloudflare SSL/TLS mode to Full (strict) — see the 2026-09-12 origin certificate entry below.
- 2026-09-12 origin certificate: the owner-provided Cloudflare Origin CA (SAN `culvoy.com` + `*.culvoy.com`, valid 2026-09-11 to 2041-09-07; key match verified by public-key sha256; upload verified by matching local/server md5) is installed at `/www/server/panel/vhost/cert/culvoy.com/` (`fullchain.pem` 644, `privkey.pem` 600). The three culvoy vhosts now reference it; the prior confs are backed up in `/root/conf-backup-cert-20260912/`. `nginx -t` passed and nginx reloaded; SNI handshakes on `127.0.0.1:443` return the new certificate for all three hostnames, and the Cloudflare end-to-end checks stay 200 (site title "Culvoy Guangdong", api health JSON `database: up`). The legacy `culvoy.com` vhosts keep serving their own legacy certificate unchanged.

## 22. 2026-09-14 mobile fixes squashed and deployed

Owner requested squash of the seven unpushed mobile commits and a production deploy; both executed with authorization.

- Squash: seven unpushed commits (`8c22aff`..`7879eac`, culture/routes/interpreting hero side-by-side on mobile, interpreting hierarchy, shop detail hero/story/related-products, field-journal login button) became single commit `b1eadd7` `fix(site): preserve hero and shop layouts on mobile` via `git reset --soft 10d8378` + re-commit. Tree SHA verified identical before (`d534488e…`) and after — zero content change. 8 files, +16/−12.
- Pre-push validation: site `tsc --noEmit` clean, lint 0 errors (1083 pre-existing warnings incl. generated MapLibre worker file; the `InterpretingPageClient.tsx:191` useMemo warning verified pre-existing at `10d8378`), 18/18 test files and 101/101 tests passed, production build passed (18 routes).
- Deploy: pushed `10d8378..b1eadd7` to root `origin/main`; dispatched `Deploy LingTour Docker Stack` run `34813335316` — **success in 8m24s**. Server HEAD confirmed `b1eadd7`; api/admin containers healthy, nginx restarted, no migration ran (none added).
- Context: the previous dispatch (run `34773015658`, 2026-09-13 17:54) failed with `Run Command Timeout` after 10m11s inside appleboy/ssh-action while image builds were still running; containers surviving from that attempt were `Up 11 hours` before this deploy. The 8m24s success suggests build cache absorbed the difference; the 10-minute ssh-action default remains a real risk for cache-cold builds.
- Smoke (2026-09-14 06:24–06:36 UTC): api `/health` 200 `database: up`; site, culture, routes, interpreting, shop, shop product detail, route detail, community all 200 via Cloudflare (trailing-slash 308s are expected normalization); admin 200; production interpreting HTML contains the new hero class `grid-cols-[minmax(0,1.1fr)_minmax(8.5rem,0.9fr)]`, confirming the squashed build is live; home title "Culvoy Guangdong".
- Known issue (pre-existing, unchanged): `lingtour-site-1` reports Docker `unhealthy` while actually serving (host-side nginx fetch 200 in ~0.1s). The healthcheck runs `node -e fetch('http://127.0.0.1:3000')` with a 5s timeout; node startup plus request exceeds 5s under load. Consider a lighter checker and a longer timeout. Log noise `Failed to find Server Action "x"` is stale-client post-deploy noise.
- No new commits remain unpushed; root `main` in sync with `origin/main` at `b1eadd7`; admin repository untouched. Untracked root items unchanged (reference png, `seed-local-preview.ts`, `lingtour-frontend-documentation/`).

## 23. 2026-09-14 admin filter fixes and shell polish deployed

Owner requested deploy of the admin list-filter and backoffice polish batch; pushed and deployed with authorization.

- Pushed: admin repository `e1888b4..a9430cf` (3 commits: wire list filters, unify responsive breakpoints, theme page skeleton); root `b1eadd7..e9f9914` (the 3 matching admin commits plus `e9f9914` `fix(api): honor admin list filters`). All 5 admin files verified byte-identical across both repositories. No migrations in range (`b1eadd7..HEAD` migrations diff = 0).
- Pre-deploy validation rerun: admin production build passed (3.25s, pre-existing large-chunk warning only); API 23/23 suites, 154/154 tests passed; API production build passed; `git diff --check` clean in both repositories.
- Database: backed up before deploy to `/root/backups/lingtour-db-pre-adminfilters-20260914-163015.dump` (144K, custom format). Read-only `migration:show` on production reported all migrations `[X]` through `27 AddEmailVerificationCodes1762150000000`; deploy's `migration:run` was a no-op.
- Deploy: dispatched `Deploy LingTour Docker Stack` run `34823168215` — **success in 5m22s**. Server HEAD confirmed `e9f9914`; api/admin healthy after recreation, nginx restarted, redis untouched.
- Smoke (2026-09-14 08:31–08:41 UTC): api `/health` 200 `database: up`; `/api/v1/public/cities` and `/api/v1/public/cities/shaoguan` 200; site title "Culvoy Guangdong"; admin.culvoy.com 200; `/culture/shaoguan` 308→200 (trailing-slash normalization, expected); no-credential probes of `/api/v1/admin/shop/products?published=true`, `/api/v1/admin/events?startDate&endDate`, `/api/v1/admin/bookings?date` all 401 — routes live with guards.
- Not verified in production: authenticated filter results for shop status, event date range, and booking date (requires staff credentials; left to a staff-logged-in check).
- Known pre-existing: `lingtour-site-1` reports Docker `unhealthy` while serving 200 (same healthcheck-timeout false alarm as §22).
- Untracked root items unchanged: reference png, `seed-local-preview.ts`, `lingtour-frontend-documentation/`; this file's prior uncommitted edits preserved (only §23 appended).
- Follow-up (2026-09-14): `c642e4e` `docs: backfill changelog with deployed releases` re-anchored `CHANGELOG.md` to deploy-date sections (root SHA anchors `e9f9914`/`b1eadd7`/`4e21907`; integrated-batch entries verified as ancestors of `4e21907` via git ancestry, superseded local implementations removed rather than reported as shipped). Root `main` is now ahead 1 of `origin/main`, unpushed.
- Follow-up 2 (2026-09-14): after owner approval, `docs/release.md` was realigned with the live Docker deployment reality (`be5bbef`: Docker gateway topology, workflow_dispatch-only `Deploy LingTour Docker Stack`, `tools/deploy-docker.sh` as sole authoritative script, `Ravi-server` alias, host-side `pg_dump` for the non-Compose PostgreSQL, site healthcheck false alarm, known 2 GB build risks), and the release checklist now mandates the CHANGELOG deploy-date step (`05c04cd`). All three documentation commits `c642e4e..05c04cd` are pushed; root `main` in sync with `origin/main`. No deploy was dispatched — documentation only, production unchanged at `e9f9914`.
- Follow-up 3 (2026-09-14): owner added the GitHub Release requirement. `docs/release.md` §4 step 5 (`c886caf`, pushed) now mandates creating a GitHub Release after every successful deploy: tag the deployed root HEAD `deploy-YYYY-MM-DD-<shortsha>` (date+SHA, no SemVer), title/notes from the matching `CHANGELOG.md` section, admin-frontend SHA noted, root repository only. The three historical deploys were backfilled on GitHub: tags `deploy-2026-09-11-4e21907` (admin `e1888b4` — the admin-side domain commit verified distinct from root `4e21907`), `deploy-2026-09-14-b1eadd7` (admin untouched), `deploy-2026-09-14-e9f9914` (admin `a9430cf`); all three Releases created from the CHANGELOG sections, `e9f9914` marked Latest matching the current production HEAD.

## 24. 2026-09-14 public-site mobile polish deployed

Owner requested commit and deploy of the browser-review UI fixes; both executed with authorization.

- Commit: `0303a42` `fix(site): polish mobile heroes and archive states`; 5 site files, +26/−32. No admin repository change.
- Pre-deploy validation: site `tsc --noEmit` clean; 18/18 test files and 101/101 tests passed; production build passed (19 routes); lint 0 errors with the existing 1083 warnings; `git diff --check` clean for the task files.
- Deploy: pushed `c886caf..0303a42` to root `origin/main`; dispatched `Deploy LingTour Docker Stack` run `34829863128` — **success in 4m19s**. Server HEAD confirmed `0303a42`; api/admin containers healthy, nginx and redis healthy; no migration was added.
- Smoke (2026-09-14): api `/health`, Home, Culture, Interpreting, route detail, product detail, and Profile all returned 200 via Cloudflare. Production HTML contains the new Culture hero sizing and Interpreting one-line heading classes. `lingtour-site-1` still reports Docker `unhealthy` while serving 200; this is the documented healthcheck false alarm.
- Documentation: `CHANGELOG.md` gained the matching `2026-09-14` deployment section, and a GitHub Release was created at the deployed root SHA.

## 25. 2026-09-15 site review and Profile refactor deployed

Owner requested the browser-review fixes and a structural Profile page refactor, followed by a production deployment.

- Commits: `97039b5` `fix(site): resolve layout review notes`; `008dbbf` `refactor(site): unify profile page surfaces`; `4f2bc30` `docs(release): record profile polish deployment`. The independent admin repository was unchanged at `a9430cf`.
- Pre-deploy validation: site TypeScript passed; 18/18 test files and 101/101 tests passed; production build passed; lint exited with 0 errors and the existing generated MapLibre/application warnings; root and admin `git diff --check` passed.
- Browser validation: local Profile notes/routes/collection/bookings/settings passed at 320, 375, 390, 430, 768, 834, and 1280 CSS pixels with no horizontal overflow or console errors; Culture and Route detail passed at 320, 375, 390, 430, 768, 834, 1280, 1440, and 1920 with no horizontal overflow. The local preview login was used only against localhost. Profile's legacy direct-child height rule was removed for the content panel, and the circular avatar entry was verified.
- Database: production backup `/root/backups/lingtour-db-pre-profile-20260915-013724.dump` completed before deployment (144143 bytes). Read-only `migration:show` reported all 27 migrations applied; the deploy migration step was a no-op.
- Deploy: root `main` was pushed through `4f2bc30`; `Deploy LingTour Docker Stack` run `34875955514` succeeded in 8m14s. Server HEAD is `4f2bc30`; admin remains `a9430cf`.
- Smoke: `https://api.culvoy.com/health` returned 200 with database `up`; Home, Culture detail, Route detail, Shop, Login, Profile route, and Admin returned 200. Unauthenticated Profile correctly returned 307 to Login. `lingtour-site-1` remains Docker `unhealthy` while serving successfully, matching the documented healthcheck false alarm.
- Release: GitHub Release/tag `deploy-2026-09-15-4f2bc30` was created from deployed root HEAD. No production data, migration, or admin code changed.

## 26. 2026-09-15 profile consistency and signup email code deployed

Owner requested categorized commits, merge, and production deployment.

- Commits: `fd22880` `fix(site): align profile surfaces and avatar entry`; `0c02161` `feat(site): support email-code signup`; `b3df634` `docs(release): record profile and signup changes`. The independent admin repository remained unchanged at `a9430cf`.
- Pre-deploy validation: site TypeScript passed; 18/18 test files and 101/101 tests passed (initial Vitest run lost workers to local memory pressure, then passed with one worker and file parallelism disabled); lint passed with 0 errors and the existing 1083 warnings; production build passed after the local server-data origin was overridden to the read-only production API because local Docker/Postgres was unavailable.
- Deploy: root `main` was pushed through `b3df634` and `Deploy LingTour Docker Stack` run `34937099768` completed build, migration, container recreation, and nginx restart steps but hit the 10-minute ssh-action command timeout during the final health wait. Manual server confirmation showed root HEAD `b3df634`; api/admin/nginx/redis healthy and site serving 200 while its container healthcheck was still starting.
- Smoke: API health, Home, Culture detail, Route detail, Interpreting, Shop, product detail, Login, Profile, Community, and Admin returned 200 via Cloudflare. Production `/login` was checked in a real 390px browser: signup mode, full name, verification code, and country controls rendered with zero console errors. No account was submitted or created.
- Release: GitHub Release/tag `deploy-2026-09-15-b3df634` was created from the deployed root HEAD.

## 27. 2026-09-15 de-AI review batch committed and deployed

Owner requested categorized fixes from the de-AI review report, then deployment.

- Root commits (in order): `8939d61` picsum route covers → verified real imagery (api seed); `9f45d23` fabricated testimonials and padded expert counts removed — the home roster line renders only a real API count; `3b52960` list heroes given four distinct archival gestures (Culture polaroid kept, Routes manifest ticket, Shop catalogue plate, product Object-file header); `358df0a` dark-surface contrast lifted to WCAG AA and currency unified on ¥; `5a34ad5` community settled into the archive language (square toolbar, traveller wording, honest empty state); `f19daf9` template metadata and noun-list ledes rewritten; `2480edc` hero media preloaded onto parchment underlays; `66d31fc` interpreter language dedupe strips "support" suffix; `9114e93` site healthcheck exits explicitly on success.
- Independent admin commit `2dba4d5` mirrored in root as `9697466`: last hardcoded #409EFF stragglers (order notification, PRD map marker, post excerpt stripe, dashboard fallback) moved to brand green; the one remaining `409eff` in production assets is Element Plus's own variable declaration, overridden at runtime by `theme.css`.
- Validation: site tsc/lint/test (101/101)/build green; api tsc/test/build green; admin build green; local Playwright sweep 30/30 (content assertions, 5 widths × 9 pages overflow, zero console errors). The sweep initially failed roster/RMB/counts assertions for two environment reasons: rewrite destination is baked at build time (fix: build with `INTERNAL_API_ORIGIN=https://api.culvoy.com/api/v1`), and `page.content()` includes RSC payload while CMS seed price strings still read "From RMB 680" — visible DOM is unified on ¥. The production CMS `service_modes.price` strings are still legacy and should be updated via admin; they are not user-visible.
- Deploys: run `34964987686` deployed `66d31fc` (all site/api/admin changes; site container `unhealthy` was a pre-existing healthcheck keep-alive bug, not a service fault); run `34966820692` deployed `9114e93` and the site container now reports healthy. Server HEAD: `9114e93` (root), `2dba4d5` (admin).
- Production smoke: 18/18 — trust layer (no fake counts/testimonials/picsum, roster shows real count), hero variations, preload links, ¥ notation, community counts from live data, 320px overflow spot-check, zero console errors.
- Known follow-up: update the legacy CMS `service_modes.price` strings ("From RMB 680 / half day") through the admin to match the ¥ notation.

## 28. 2026-09-15 production traveler login restored (gateway forward fix)

Owner reported `Cannot POST /api/auth/session` in production.

- Root cause: the gateway `nginx.docker.conf` has forwarded every `/api/*` request to the API backend since the Docker cutover (`c39ac17`). The site's own `/api/auth/session` handler (`app/api/auth/session/route.ts`, present and working inside the site container) never received production traffic, so traveler login, register, Google sign-in, email-code sign-in, and logout all failed with the API's 404. Not introduced by the de-AI batch. The general forward must stay: browsers rely on it for direct `/api/v1/*` calls.
- Fix: commit `3343209` added exact-match locations for `/api/auth/session` (and its trailing-slash form) proxying to `site_frontend`; syntax pre-checked on the server with a one-off `nginx:alpine nginx -t`.
- Deploy: run `34993271372`; server root HEAD `3343209`; gateway conf md5 matches the repo; site container healthy.
- Verification 7/7 against production: POST wrong credentials → 401 "Invalid email or password" (real auth flow reached); POST invalid action → 400 from the site handler; DELETE → `{ok:true}` cookie cleared; direct `/api/v1/auth/login` forward unaffected; a real browser on `/login` submitting bad credentials shows the visible auth error with no "Cannot POST" and zero page errors. A successful login was not exercised (no production credentials; success and failure share the same handler forward branch).

## 31. 2026-09-16 Review fixes deployed

Owner requested targeted fixes from `review/9-16/report.md`, categorized commits, and production deployment.

- Root commits: `fa8f5ce` API request/content boundaries; `d2d2640` commerce and booking writes; `8202c8d` public content recovery; `af2992a` admin mirror; `6216454` API test mock types. Independent admin commit: `228b55c`.
- Validation before push: API tsc, 24 suites/161 tests, build; site tsc, 18 suites/102 tests, build; admin build; site lint 0 errors with 1084 warnings; browser regression passed for public pages and admin login at 1280px and 390px.
- Database backup before deployment: `/root/backups/lingtour-db-pre-review-fixes-20260916.dump` (144303 bytes, custom format). Read-only migration status before deploy reported 27/27 applied.
- Deploy: `Deploy LingTour Docker Stack` run `35015977643` succeeded in 6m09s. Server root HEAD `6216454`; migration 28 `AddStockReservationsAndBookingIdempotency1762200000000` is applied. API, site, admin, nginx, and Redis containers are healthy.
- Production smoke: API health returned database `up`; public API cities/routes/shop/interpreting returned 200; Home/Culture/Routes/Shop/Interpreting/Community/Login returned 200. Cache-busted upload response returned `x-content-type-options: nosniff`. No production CRUD, payment, or content write was performed.
- Remaining verification: authenticated admin CRUD, inventory concurrency, duplicate booking behavior against staging, and successful production login/payment require dedicated credentials and should be run by operations.

## 29. 2026-09-16 full rebrand to Culvoy deployed, legacy domains kept compatible

Owner requested renaming every `lingtour` brand reference to `Culvoy` and consolidating on the `culvoy.com` domains. Confirmed boundary: brand copy, domains, and technical keys renamed; infrastructure identifiers kept (`qiuy-collab/LingTour`, `/root/LingTour`, database name, `lingtour-*` container names, retired PM2 names); migration files untouched; historical docs rewritten; gateway `server_name` restricted to the `culvoy.com` family with legacy-domain compatibility preserved at the host layer.

- Root commits (in order): `728b382` API rebrand (API surface, emails, seeds, cookie `lingtour_session` → `culvoy_session`, `lingtour-*` localStorage keys, event names, BroadcastChannel → `culvoy-*`); `b51ca6e` site rebrand; `dbda668` admin rebrand mirror (independent admin `be74c41`: preview channel, storage keys, allowed hosts, vite config); `686b5c4` gateway `server_names` restricted to the culvoy family; `9cb4eb0` guides/tools/archive docs renamed. Breaking note: existing visitors are signed out once and local carts/favorites reset because cookie/localStorage keys changed.
- Validation: site tsc/lint (0 errors, baseline warnings)/tests 101/101/build green; api tsc/tests 154/154/build green (pre-existing `cities.service.spec.ts` mock type error unrelated); admin build green.
- Deploy: run `34998367122`; server root HEAD `9cb4eb0`; api/site/admin/nginx containers healthy.
- Production smoke: 13/14 then 14/14 in substance — the single FAIL was the smoke script's own request-body format; a `node fetch` retest with the correct protocol returned 401 "Invalid email or password" from the real NestJS auth chain, and `/api/v1/*` direct forwards were unaffected.
- Legacy-domain compatibility: restricting gateway `server_names` silently pushed legacy `admin.`/`api.lingfengtranstour.cn` onto the `_` default (admin served main-site content; API `/health` → 308). Fixed in the host TLS layer (BT panel vhosts, not in repo, not overwritten by deploys): the three `lingfengtranstour.cn` vhosts now send `proxy_set_header Host culvoy.com|admin.culvoy.com|api.culvoy.com` instead of `$http_host` (server-side backups `*.bak-culvoy-compat-<ts>`). Verified via the host TLS layer: legacy site 200, legacy admin 200 with `<title>Culvoy Admin</title>`, legacy API `/health` 200 `{"status":"ok","database":"up"}`; culvoy family regression 200 ×3.

## 30. 2026-09-16 UI feedback fixes verified live; records backfilled

Owner requested "categorized commit and go live" for the seven-item browser-review UI feedback batch. Verification showed the fixes had already been committed (folded into rebrand commit `b51ca6e` by a parallel session) and deployed with run `34998367122` (§29), so no new deploy was needed; the work became live verification plus record backfill.

- Production evidence 7/7: `/login` DOM (Playwright) has buttons `Show / Log in / Email a code instead / Create account`, no "Sign in to return to your saved routes" copy, and the `w-14 self-center` divider (feedback 4/5/6); home HTML carries the Login outline class `border-[var(--river-deep)]/45` and Book solid class `bg-[var(--river-deep)] px-4 py-2` (feedback 8); `/interpreting` has no `max-w-[18ch]` and carries `lg:text-6xl` (feedback 2); `/shop/products/canton-porcelain-cup` h1 renders horizontally `text-3xl sm:text-4xl lg:text-5xl` with no `max-w-[12ch]` (feedback 3); `/culture` grid is a uniform `grid-cols-2 → lg:grid-cols-3` with no interleaving (feedback 1).
- Smoke: API health `database: up`; admin 200; community 308 (trailing-slash normalization, expected); shop list renders product titles normally — the raw `{"EN":…,"ZH":…}` JSON seen locally is a `seed-local-preview.ts` local-data artifact only, absent in production CMS data.
- Records backfilled: CHANGELOG gained the `2026-09-16` deployment section (rebrand + the seven UI fixes); GitHub Release `deploy-2026-09-16-9cb4eb0` created for the deployed root HEAD (admin `be74c41`).
- Root worktree: no uncommitted source changes. Untracked items intentionally kept per standing practice: `review/`, `reviews/`, `api/src/database/seeds/seed-local-preview.ts`, `lingtour-frontend-documentation/`, `admin-backoffice-visual-reference.png`.
- Local environment note: the shared localhost dev server's rendering worker intermittently crashes (`Jest worker encountered 2 child process exceptions` on SSR of some routes); local API `npm run start:dev` has a watch/start race (`Cannot find module dist/main`) — `node dist/main.js` after compilation works. Both are local-only inconveniences, unrelated to production.

