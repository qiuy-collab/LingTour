# LingTour Agent Guide

This is the canonical operating guide for `E:/workspace/LingTour`. Read it before inspecting, editing, testing, cleaning, committing, pushing, migrating, or deploying. Read [`docs/CURRENT-STATE.md`](docs/CURRENT-STATE.md) for the live Git, production, verification, WIP, and backlog state; documents under [`docs/archive/`](docs/archive/) are historical evidence, not current status.

Companion guides: [`docs/development.md`](docs/development.md) covers environment setup, branches, code standards, commit conventions, and collaboration; [`docs/release.md`](docs/release.md) covers the release process, server configuration, migrations, and smoke tests. Long-standing documents (this guide, `CURRENT-STATE.md`, `PRODUCT.md`, `DESIGN.md`) are English; newer team-facing guides are Chinese. Both languages are authoritative for their own topics.

## 1. Product and repositories

LingTour is a full-stack Guangdong cultural-travel product for international travellers: city culture, story routes, interpreting and bookings, shop and Stripe payments, community, accounts, and a real operations/CMS admin.

| Path | Application | Stack |
| --- | --- | --- |
| `site/` | Public site | Next.js 16, React 19, Tailwind CSS 4, GSAP |
| `api/` | API | NestJS 11, TypeORM, PostgreSQL, JWT, Stripe |
| `admin-frontend/` | Admin | Vue 3, Vite, Element Plus, GSAP |

The public site is brand-first: an evolved Field Journal / Living Field Atlas—editorial, tactile, cinematic, calm, and culturally specific. The admin is a focused workflow product; design serves operational clarity.

## 2. Environment addresses

Keep local and production addresses strictly separate. Never point local work at production write endpoints.

| Environment | Public site | Admin | API |
| --- | --- | --- | --- |
| Local development | `http://localhost:3000` | `http://localhost:5173` | `http://localhost:8000` |
| Production | `https://culvoy.com` | `https://admin.culvoy.com` | `https://api.culvoy.com` |

- API health: production `https://api.culvoy.com/health`; local `http://localhost:8000/health`.
- Production topology: host Nginx (TLS, BT panel) → `127.0.0.1:8088` → the `lingtour-nginx` Docker gateway, which routes by Host to the `site`/`api`/`admin` containers. Pushing to root `main` triggers GitHub Actions, which runs `tools/deploy-docker.sh`. PM2 processes on the server are retired and kept stopped. See [`docs/release.md`](docs/release.md) for deployment channels and rollback.
- Domain migration (2026-09): `culvoy.com` / `admin.culvoy.com` / `api.culvoy.com` are the production domains. The legacy `lingfengtranstour.cn` family is kept in parallel (server_name and smoke checks) during the transition and must not be removed until the migration is closed.

## 3. Mandatory startup

Before editing, inspect both repositories:

```bash
git -C E:/workspace/LingTour status --short --branch
git -C E:/workspace/LingTour log -12 --oneline --decorate
git -C E:/workspace/LingTour/admin-frontend status --short --branch
git -C E:/workspace/LingTour/admin-frontend log -12 --oneline --decorate
```

Then read, in order:

1. `E:/workspace/LingTour/PRODUCT.md`
2. `E:/workspace/LingTour/DESIGN.md`
3. `E:/workspace/LingTour/docs/UI-OVERHAUL-2026.md`
4. `E:/workspace/LingTour/docs/RESPONSIVE-SPEC.md`
5. `E:/workspace/LingTour/AGENT.md`
6. `E:/workspace/LingTour/docs/CURRENT-STATE.md`
7. Dated files under `E:/workspace/LingTour/docs/archive/` (handoffs, progress records) only when historical context is needed

Archived documents are historical context. Recheck every SHA, status claim, completed item, and deployment claim against live Git/code/production before relying on it.

When touching the site, also read:

- `E:/workspace/LingTour/site/CLAUDE.md`
- `E:/workspace/LingTour/site/AGENTS.md`
- Relevant guides under `E:/workspace/LingTour/site/node_modules/next/dist/docs/`; this Next.js version has breaking changes.

Read the relevant `package.json`, current implementation, API DTO/entity, and migration before changing a contract. Current code, schema, package scripts, and live Git state override old design or deployment notes.

## 4. Double-repository workflow

`E:/workspace/LingTour/admin-frontend` is an independent Git repository, while the root repository also tracks its files as ordinary files; it is not a submodule.

For every admin change:

1. Protect existing changes in both repositories.
2. Check status and diff from both repository roots.
3. Validate the admin build and real browser flow.
4. If commits were requested, commit the precise files in the admin repository first.
5. Commit the matching `admin-frontend/...` files in the root repository.
6. Keep the changes logically and byte-wise equivalent and report both SHAs.

The only known intentional tracked-tree difference is `admin-frontend/.vscode/extensions.json`, tracked by the independent admin repository but ignored by the root repository.

Never use broad staging. Use exact paths:

```bash
git -C E:/workspace/LingTour/admin-frontend add -- src/path/a src/path/b
git -C E:/workspace/LingTour add -- admin-frontend/src/path/a admin-frontend/src/path/b
```

Do not commit, push, deploy, migrate, or mutate production data unless requested or durably authorized. A push to root `main` can be production-affecting through GitHub Actions.

## 5. Protect the workspace

Never run or use:

- `git reset --hard`
- `git checkout -- <path>`
- broad `git restore`
- `git clean -fd`, `git clean -fdX`, `git clean -fdx`, or variants with a second `-f`
- `git stash` without explicit approval
- `git add -A`, `git add .`, or broad staging
- broad formatting, auto-fix, generated-file rewrites, or deletion based only on ignored status
- deletion/replacement of changes whose ownership is unclear
- edits inside unrelated `.claude/worktrees`
- secrets, private keys, tokens, database credentials, or `.env` values in commits, logs, prompts, or documentation

A root Git clean can delete untracked business source, local config, uploads, assistant state, and files tracked only by the nested admin repository. Cleanup must use an explicit reviewed path manifest.

Before destructive cleanup:

1. Record status from both repositories and all registered worktrees.
2. Protect current WIP and untracked source with an external recovery copy.
3. Distinguish generated test results from tracked regression tests.
4. Delete only named paths after checking Git ownership, references, symlinks/junctions, and active processes.
5. Recheck both repository statuses after every cleanup group.

Preserve formal tests. Never delete a failing test to make a task green. `npm run lint` in `api/package.json` uses `--fix`, and `npm run format` writes files; neither is a read-only validation command.

Use `admin-frontend/.env.local`, not an unignored plain `.env`, for local admin configuration. Respect root and package-level `.gitignore` files, but ignored does not mean disposable: `api/uploads`, local env/config, tool configuration, and worktrees are examples.

## 6. Data, API, and content rules

- Use the real API and production-shaped data; do not introduce fake, placeholder, screenshot-only, or local-only business data.
- Local site/admin visual work normally reads from `https://api.culvoy.com`; explain impact and obtain authorization before writing production data.
- Site variables: `NEXT_PUBLIC_API_URL=https://api.culvoy.com/api/v1` and `INTERNAL_API_ORIGIN=https://api.culvoy.com`.
- Admin variables: `VITE_API_ORIGIN`, `VITE_SITE_ORIGIN` or `VITE_SITE_PREVIEW_ORIGIN`, and `VITE_MEDIA_ORIGIN`.
- The admin client calls `/api/admin`; Vite/Nginx rewrite it to `/api/v1/admin`. Preserve this proxy contract.
- Start the local API only for API work; do not start or reset it merely to obtain data for UI work.
- Admin labels, field names, help, and operational messages are Chinese. Business body content is authored once in English and displayed verbatim by the public site.
- The database still contains legacy `{ en, zh }` JSONB fields. Editing English must preserve existing `zh` values until an approved migration removes them.
- Admin save success is insufficient: verify the request, persistence after refresh/re-login, audit/state transitions, and resulting public output.
- Admin previews must use the real public page/preview route, including unsaved draft transfer. Never build an approximate fake preview in the admin.
- Preserve routes, slugs, auth flows, SEO entry points, public API paths, image-only records, and compatibility fields unless an explicit migration changes them.
- Mixed image/video changes must preserve existing image records; videos require validated type, poster fallback, controls, and public playback verification.

Never run:

- `npm run seed:reset`
- any seed/import/sync command containing `--apply` without explicit confirmation of target and backup
- a TypeORM migration against any database until the target, backup, existing migration state, and migration plan are confirmed
- destructive E2E against production without explicit approval and cleanup/recovery design

Never rewrite an already-executed migration; add a new migration. `api/src/database/data-source.ts` has `synchronize: false`; keep it that way.

## 7. Mandatory UI and design process

For public-site visual, layout, interaction, or motion work, invoke/read before implementation:

- `taste-skill`
- `gsap-core`
- `gsap-react`
- `gsap-scrolltrigger`
- `gsap-performance`
- `fixing-accessibility`
- `fixing-motion-performance`

Use `agent-browser`, `playwright`, or `webapp-testing` for browser validation. Impeccable is an auxiliary audit tool, not a replacement for Taste, accessibility, GSAP, or real browser testing.

Process:

1. State the design read and preserve the product language.
2. Use current CSS/tokens and real production content as the baseline.
3. Fix hierarchy, spacing, grids, states, and component-responsive behavior first.
4. Add GSAP only where motion explains hierarchy, direction, state, or narrative.
5. Review accessibility, cleanup, reduced motion, and low-end/mobile performance.

Design dials:

- Public site: `DESIGN_VARIANCE=7`, `MOTION_INTENSITY=7`, `VISUAL_DENSITY=4`
- Admin: `DESIGN_VARIANCE=4`, `MOTION_INTENSITY=4`, `VISUAL_DENSITY=6`

Public pages must not become generic SaaS grids, glass cards, gradient text, excessive pills, repetitive tape/rotation/grain, or simple desktop stacks. Admin changes preserve Element Plus and prioritize workflow clarity. All text stays horizontal; decorative small-angle rotations that belong to the Field Journal language are acceptable, vertical text is not.

Use `useGSAP()` with a scoped root in React. In Vue use `gsap.context()` and `ctx.revert()`. Use `gsap.matchMedia()` for responsive variants, animate transforms/opacity rather than layout, and clean up every tween and ScrollTrigger. Reduced-motion users must receive immediately visible content with no pin/scrub or decorative continuous motion.

## 8. Development and validation commands

Local development:

```bash
cd E:/workspace/LingTour/site && npm run dev
cd E:/workspace/LingTour/admin-frontend && npm run dev
cd E:/workspace/LingTour/api && npm run start:dev
```

Default URLs are site `http://localhost:3000`, admin `http://localhost:5173`, and API `http://localhost:8000`.

Validate every touched application. Do not repair unrelated pre-existing failures silently.

Site:

```bash
cd E:/workspace/LingTour/site
npx tsc --noEmit --skipLibCheck
npm run lint
npm run test:ci
npm run build
```

Admin:

```bash
cd E:/workspace/LingTour/admin-frontend
npm run build
```

API:

```bash
cd E:/workspace/LingTour/api
npx tsc --noEmit --skipLibCheck
npm test -- --runInBand
npm run build
```

Repository checks:

```bash
git -C E:/workspace/LingTour diff --check
git -C E:/workspace/LingTour diff -- <task-files>
git -C E:/workspace/LingTour/admin-frontend diff --check
git -C E:/workspace/LingTour/admin-frontend diff -- <task-files>
```

The root package has no build/test scripts; run commands in the three application directories. The site has no `npm run type-check`; use the explicit TypeScript command above.

## 9. Browser verification

Builds and screenshots alone are insufficient. Use a real browser and exercise changed flows, requests, console, loading, error, empty, success, refresh, and back/forward behavior.

For responsive UI, test relevant pages at `320, 375, 390, 430, 768, 834, 1280, 1440, 1920` CSS pixels.

Check:

- no page-level horizontal overflow, overlap, clipped actions, or crushed text
- 44px touch targets and at least 16px mobile form controls
- keyboard navigation, visible focus, dialog focus containment/restoration, Escape behavior, and background shortcut isolation
- reduced motion and hidden/background-tab resilience
- real navigation, filters, carousels, forms, login, dialogs, preview, save, and refresh
- broken images/video, poster fallback, controls, slow loading, and network/API errors
- GSAP cleanup after route/component teardown

`tools/mobile-verify.mjs` and `tools/mobile-perf.mjs` are supplemental only. They cover a subset of viewports, may require undeclared Puppeteer, and write temporary reports/screenshots that must not be committed.

## 10. Deployment and migrations

Full details—release channels, PM2 process table, environment variables, rollback—live in [`docs/release.md`](docs/release.md). Non-negotiable rules:

1. Verify tests/builds and both repository statuses.
2. Review every migration; add rather than rewrite migrations.
3. Back up the target database and run a read-only migration status check.
4. Push the independent admin repository and root repository only with authorization.
5. Inspect any GitHub Actions deployment triggered by root `main`.

Approved manual deployment:

```bash
ssh lingtour-server "cd /root/LingTour && git pull --ff-only origin main && bash tools/deploy-pm2.sh"
```

`tools/deploy-pm2.sh` is the PM2 deployment source of truth. It can reset a dirty server worktree, builds API/site/admin, runs pending TypeORM migrations, restarts PM2, and performs health checks. Its Git backup is not a database backup. Never place unpushed source only on the server.

Post-deploy:

```bash
ssh lingtour-server "cd /root/LingTour && git rev-parse --short HEAD && pm2 status"
```

Then verify production API health, Home, changed pages, representative Culture/Route details, Interpreting/booking, Shop/Checkout, Login/Profile, Community, and changed admin create/edit/save/preview/status flows.

## 11. Definition of done

A development task is done only when:

- unrelated work is preserved and the diff contains only the task
- required skills and design process were followed
- relevant type checks, tests, builds, and `git diff --check` pass
- required browser widths and real interactions pass
- accessibility, reduced motion, loading/error/empty states, and media fallbacks pass
- data changes use the real API, survive refresh/re-login, and produce the expected public result
- admin changes remain synchronized in both repositories
- exact validation results and pre-existing failures are recorded

If commit/release was explicitly requested, done additionally requires one logical change per precise commit, correct remotes, synchronized admin/root commits, approved database backup/migration/deployment, production smoke tests, and reporting both repository SHAs plus the deployed root SHA. Otherwise report commit, push, migration, and deployment as pending; never perform them automatically.

## 12. Current work pointer

Read `docs/CURRENT-STATE.md` before every task. It contains the dated live state, protected WIP, unpushed changes, verification evidence, deployment queue, and backlog. Update it whenever responsibility, Git state, production state, or cleanup/recovery state materially changes.
