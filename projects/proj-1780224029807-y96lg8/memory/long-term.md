# 长期记忆

（项目初始化中，尚无记忆。）

## 2026-05-31
- 用户偏好：清理范围为整个工作区 `E:\workspace\LingTour`。
- 用户偏好：清理执行方式必须先生成候选清单并等待确认，再进行删除。
- 用户偏好：测试文件只删除临时测试文件，正式单元测试、集成测试、端到端测试等质量保障文件必须保留。
- 项目原则：清理过程需可追溯，清理前输出候选清单，清理后输出结果报告。
- 初始化结果：已创建项目计划、任务拆解，并生成 `outputs/cleanup-candidates.md` 作为删除前确认清单。


## 2026-05-31 自动提取
- 用户创建了新的长期放养项目，目标是初始化项目后清除本地无用文件和测试文件。
- 用户要求按照 `project-init` 技能流程初始化项目文档并进行任务拆解。
- 项目清理原则已确定为先生成待清理清单并等待确认，不直接删除文件。
- 正式测试文件不应作为删除目标。

## 2026-05-31
- 用户询问“把后台主体移到根目录，git会变吗”，说明后续可能涉及项目目录重组；需在移动前提醒使用 `git mv`/分步移动以保留重命名历史，并在清理/迁移前查看 `git status`。
- 清理候选清单已生成并完成任务标记；后续删除必须继续等待用户明确确认，尤其是中风险临时目录、历史测试脚本和历史测试报告。

## 2026-05-31
- 用户确认可先按清单清理“无需确定删除”的低风险项，并要求将管理员后台文件夹移动到根目录、同步相关 Git 配置。
- 已将管理员后台主体迁移到根目录 `admin-frontend/`；根仓库中大部分文件显示为 rename，后台自身 `.git` 也已移动到 `admin-frontend/.git`，其 remote 仍指向 `https://github.com/qiuy-collab/LingTour-admin-frontend.git`。
- 已更新 `docker-compose.prod.yml`、`ecosystem.config.js`、`admin-frontend/Dockerfile`、`BT-DEPLOY-PATHS.md`、`docs/DEPLOYMENT.md`、`docs/docker-deployment.md` 中的后台路径引用。
- 本轮低风险清理删除了部分可重建目录、日志和明确临时测试文件；部分 `node_modules` / `.tmp` 因进程或权限占用未删除，需关闭相关进程后再处理。


## 2026-05-31 自动提取
- 已按删除清单清理无需二次确认的低风险文件，并生成 `outputs/cleanup-execution.json` 与 `outputs/cleanup-result.md`。
- 管理员后台已从 `projects/proj-1778970788262-5mcldi/admin-frontend` 移动到根目录 `admin-frontend`。
- 后台独立仓库 `.git` 已保留在 `admin-frontend/.git`，remote 为 `https://github.com/qiuy-collab/LingTour-admin-frontend.git`。
- 已更新相关 Git/部署配置：`docker-compose.prod.yml`、`ecosystem.config.js`、`admin-frontend/Dockerfile`、`BT-DEPLOY-PATHS.md`、`docs/DEPLOYMENT.md`、`docs/docker-deployment.md`。
- 项目文档和记忆已更新：`project.md`、`memory/long-term.md`、`memory/2026-05-31.md`。
- 构建验证尚未执行，建议下一步在 `admin-frontend` 中运行 `npm ci` 和 `npm run build`。

## 2026-05-31
- 验证阶段应优先区分“源码被误删”与“依赖目录缺失/损坏”两类问题；当前项目的基础验证已确认关键源码目录仍在，构建失败主要由依赖状态异常引起。
- 后续若继续做构建复验，应先在 `admin-frontend`、`api`、`site` 中重新安装依赖，再执行 build，以免把依赖缺失误判为清理破坏源码。

## 2026-05-31 自动提取
- 用户希望清理旧的无用项目目录，例如 `E:\workspace\LingTour\projects\proj-1778669319626-wwrjdy` 这类历史项目。

## 2026-05-31
- 用户确认：如果旧项目内容都已迁移，则旧项目目录可以一起删除，只保留当前项目 `proj-1780224029807-y96lg8`。
- 已确认后台 Git 保留在根目录 `admin-frontend/.git`，其 remote 未变化，继续作为后台唯一 Git 仓库。
- 已删除旧项目 `projects/proj-1778970788262-5mcldi` 中绝大多数记录与临时文件；当前仅剩被占用的 `.tmp/ssh-key` 和 `node_modules/@rolldown/...node` 阻止整目录彻底删除。

## 2026-05-31
- 复验结果：`api` 与 `site` 在重新安装依赖后已成功构建。
- 复验结果：`admin-frontend` 构建失败不是依赖问题，而是迁移到根目录后 `src/constants/guangdongRegions.ts` 仍使用旧相对路径 `../../../../../shared/route-regions.json`，实际被解析到 `E:\shared\route-regions.json`。
- 后续若继续修复后台构建，应优先更新共享 JSON 的导入路径，再重新执行后台 build。

## 2026-05-31
- 已修复 `admin-frontend/src/constants/guangdongRegions.ts` 的共享 JSON 导入路径，并同步修复 `admin-frontend/tsconfig.app.json` 中的 shared JSON include 路径。
- 修复后 `admin-frontend` 已重新构建通过；当前 `admin-frontend`、`api`、`site` 三个项目均已完成构建验证。
- `admin-frontend` 当前仍存在 Vite chunk size 警告，但不影响本轮迁移修复与构建通过。

## 2026-06-01
- 用户要求继续“清残留”。本轮已定位并停止多个仍指向旧路径 `projects/proj-1778970788262-5mcldi/admin-frontend` 的历史 Node/Vite 进程，包括 dev/preview 端口 4173、4174、4175。
- 已成功清除旧项目中原先卡住的 `.tmp/ssh-key` 与旧 `node_modules`/rolldown 文件内容。
- 当前旧项目只剩一个被 Windows 句柄占用的空目录 `projects/proj-1778970788262-5mcldi/admin-frontend/`，父目录暂时仍无法物理删除；重启系统或关闭仍持有该目录句柄的程序后可最终删除。


## 2026-06-01 自动提取
- 旧项目 `E:\workspace\LingTour\projects\proj-1778970788262-5mcldi` 的内容已清理干净，仅剩 Windows 目录句柄占用导致的空目录残留。
- 已更新清理相关记录：`outputs/cleanup-result.md`、`project.md`、`memory/long-term.md`、`memory/2026-06-01.md`。
