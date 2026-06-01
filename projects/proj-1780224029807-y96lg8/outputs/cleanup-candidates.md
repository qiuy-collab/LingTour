# 待清理候选清单

生成日期：2026-05-31

## 用户确认的策略

- 清理范围：整个工作区 `E:\workspace\LingTour`
- 执行方式：先列清单，确认后再删除
- 测试文件：仅删除临时测试文件；保留正式测试文件、单元测试、集成测试、E2E 测试

## 风险分级说明

- **低风险**：缓存、构建产物、依赖安装目录、日志，通常可重新生成。
- **中风险**：临时目录或历史项目输出，需要确认是否仍有参考价值。
- **高风险**：源码、配置、正式测试、文档、数据库文件；本次未列入删除建议。

## 建议删除：低风险目录（可重新生成）

这些目录通常体积较大，可通过安装依赖或重新构建恢复：

| 路径 | 类型 | 建议 |
|---|---|---|
| `node_modules` | 根依赖目录 | 可删除，之后需要重新安装依赖 |
| `.claude/worktrees/kind-swanson-b1f0a5/site/.next` | Next.js 构建缓存 | 可删除 |
| `.claude/worktrees/kind-swanson-b1f0a5/site/node_modules` | worktree 依赖目录 | 可删除 |
| `api/coverage` | 测试覆盖率产物 | 可删除 |
| `api/dist` | 构建产物 | 可删除 |
| `api/node_modules` | API 依赖目录 | 可删除，之后需要重新安装依赖 |
| `projects/proj-1778688122092-qgw3p6/outputs/node_modules` | 输出目录中的依赖目录 | 可删除 |
| `projects/proj-1778970788262-5mcldi/admin-frontend/dist` | 前端构建产物 | 可删除 |
| `projects/proj-1778970788262-5mcldi/admin-frontend/node_modules` | 前端依赖目录 | 可删除 |
| `site/.next` | Next.js 构建缓存 | 可删除 |
| `site/node_modules` | 站点依赖目录 | 可删除，之后需要重新安装依赖 |

## 建议确认后删除：中风险临时目录

| 路径 | 类型 | 风险说明 | 建议 |
|---|---|---|---|
| `tmp` | 临时目录 | 可能含近期调试输出 | 确认无用后删除 |
| `api/.codex-logs` | 工具日志目录 | 可能含历史调试日志 | 确认无用后删除 |
| `projects/proj-1778970788262-5mcldi/admin-frontend/.tmp` | 临时运行目录 | 可能含浏览器或开发服务日志 | 确认无用后删除 |

## 建议删除：日志文件

日志文件通常可安全删除；如需排查历史问题，可先备份。

- `api-dev.err.log`
- `api-dev.out.log`
- `api-node.err.log`
- `api-node.out.log`
- `site-dev.err.log`
- `site-dev.out.log`
- `site-start.err.log`
- `site-start.out.log`
- `api/dev-login.err.log`
- `api/dev-login.out.log`
- `projects/proj-1778970788262-5mcldi/outputs/admin-frontend-dev.log`
- `site/..dev.log`
- `site/dev-server.log`

## 临时测试文件候选（保留正式测试，仅建议删除临时/手工验证文件）

| 路径 | 判断依据 | 建议 |
|---|---|---|
| `.claude/worktrees/compassionate-pike-10f12f/screenshot-test.txt` | 截图/手工测试临时文件 | 删除 |
| `.claude/worktrees/compassionate-pike-10f12f/site/screenshot-test.txt` | 截图/手工测试临时文件 | 删除 |
| `.claude/worktrees/compassionate-pike-10f12f/site/public/test-save.txt` | test-save 临时验证文件 | 删除 |
| `.claude/worktrees/exciting-wing-3690c7/screenshot-test.txt` | 截图/手工测试临时文件 | 删除 |
| `.claude/worktrees/exciting-wing-3690c7/site/screenshot-test.txt` | 截图/手工测试临时文件 | 删除 |
| `.claude/worktrees/exciting-wing-3690c7/site/public/test-save.txt` | test-save 临时验证文件 | 删除 |
| `.claude/worktrees/gallant-tesla-b8c8f0/screenshot-test.txt` | 截图/手工测试临时文件 | 删除 |
| `.claude/worktrees/gallant-tesla-b8c8f0/site/screenshot-test.txt` | 截图/手工测试临时文件 | 删除 |
| `.claude/worktrees/gallant-tesla-b8c8f0/site/public/test-save.txt` | test-save 临时验证文件 | 删除 |
| `.claude/worktrees/intelligent-boyd-ab2538/screenshot-test.txt` | 截图/手工测试临时文件 | 删除 |
| `.claude/worktrees/intelligent-boyd-ab2538/site/screenshot-test.txt` | 截图/手工测试临时文件 | 删除 |
| `.claude/worktrees/intelligent-boyd-ab2538/site/public/test-save.txt` | test-save 临时验证文件 | 删除 |
| `.claude/worktrees/kind-swanson-b1f0a5/screenshot-test.txt` | 截图/手工测试临时文件 | 删除 |
| `.claude/worktrees/kind-swanson-b1f0a5/site/screenshot-test.txt` | 截图/手工测试临时文件 | 删除 |
| `.claude/worktrees/kind-swanson-b1f0a5/site/out/test-save.txt` | test-save 临时验证文件 | 删除 |
| `.claude/worktrees/kind-swanson-b1f0a5/site/public/test-save.txt` | test-save 临时验证文件 | 删除 |
| `.claude/worktrees/recursing-elbakyan-7ef8aa/screenshot-test.txt` | 截图/手工测试临时文件 | 删除 |
| `.claude/worktrees/recursing-elbakyan-7ef8aa/site/screenshot-test.txt` | 截图/手工测试临时文件 | 删除 |
| `.claude/worktrees/recursing-elbakyan-7ef8aa/site/public/test-save.txt` | test-save 临时验证文件 | 删除 |
| `projects/proj-1778970788262-5mcldi/test-api.js` | 项目根下 ad-hoc 测试脚本，非正式测试目录 | 建议确认后删除 |
| `projects/proj-1778970788262-5mcldi/test-proxy.js` | 项目根下 ad-hoc 测试脚本，非正式测试目录 | 建议确认后删除 |
| `projects/proj-1778970788262-5mcldi/outputs/test-report.md` | 历史测试报告输出 | 建议确认后删除 |
| `site/screenshot-test.txt` | 截图/手工测试临时文件 | 删除 |
| `site/out/test-save.txt` | test-save 临时验证文件 | 删除 |
| `site/public/test-save.txt` | test-save 临时验证文件 | 删除 |

## 明确不建议删除

- `package.json`、锁文件（`package-lock.json` / `pnpm-lock.yaml` / `yarn.lock`）
- `src/`、`app/`、`pages/`、`api/` 等源码目录
- `tests/`、`__tests__/`、`*.spec.*`、`*.test.*` 中的正式测试文件
- 数据库、迁移、配置、密钥样例、正式文档
- 当前项目目录下的 `memory/`、`outputs/`、`project.md`

## 下一步

请确认是否按以上清单执行删除。建议先删除“低风险目录 + 日志文件 + 明确临时测试文件”，对 `test-api.js`、`test-proxy.js`、历史测试报告和临时目录再单独确认。
