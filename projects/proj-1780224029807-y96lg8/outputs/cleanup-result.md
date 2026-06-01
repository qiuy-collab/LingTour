# 清理与后台迁移执行报告

生成时间：2026-05-31

## 1. 已执行的低风险清理

根据 `outputs/cleanup-candidates.md`，本次仅清理“无需二次确认”的低风险项：缓存/构建产物、日志、明确的临时手工测试文件。未删除正式测试资产。

- 已删除目录：7 个
- 已删除文件：35 个
- 删除失败/被占用：4 个

### 删除失败/被占用项

这些项通常是 node_modules 或运行时目录被进程/权限占用，后续可关闭相关编辑器、Node/Vite/浏览器进程后再清理：

- `.claude/worktrees/kind-swanson-b1f0a5/site/node_modules`：PermissionError(13, '另一个程序正在使用此文件，进程无法访问。')
- `api/node_modules`：PermissionError(13, '拒绝访问。')
- `projects/proj-1778970788262-5mcldi/admin-frontend/node_modules`：PermissionError(13, '拒绝访问。')
- `site/node_modules`：PermissionError(13, '拒绝访问。')

## 2. 管理员后台迁移

已将管理员后台主体从：

- `projects/proj-1778970788262-5mcldi/admin-frontend`

移动到根目录：

- `admin-frontend`

处理方式：

- 对已纳入根仓库管理的后台文件使用 Git move 方式迁移，根仓库状态显示为 rename。
- 保留并迁移后台自身仓库元数据到 `admin-frontend/.git`，其远程仍为 `https://github.com/qiuy-collab/LingTour-admin-frontend.git`。
- 同步移动已有本地改动文件和新增 `src/components/media/`。
- 旧目录目前只剩被占用/忽略的运行时内容：.tmp, node_modules。

## 3. 已更新的相关 Git/部署配置

已更新以下引用旧后台路径的配置/部署文档：

- `docker-compose.prod.yml`
- `ecosystem.config.js`
- `admin-frontend/Dockerfile`
- `BT-DEPLOY-PATHS.md`
- `docs/DEPLOYMENT.md`
- `docs/docker-deployment.md`

## 4. 历史项目目录清理进展

根据本轮确认，已将旧项目目录 `projects/proj-1778970788262-5mcldi` 视为迁移完成后的历史残留并继续清理。

- 已成功删除其 `CLAUDE.md`、`README.md`、`project.md`、`memory/`、`outputs/`、`test-api.js`、`test-proxy.js` 等项目记录与临时脚本。
- 本轮继续清理时，已定位并停止多个仍指向旧路径的历史 `npm run dev` / `npm run preview` / Vite 进程：端口包括 4173、4174、4175。
- 已成功清掉旧目录下原先残留的文件内容，包括 `.tmp/ssh-key` 和旧 `node_modules` 中的 rolldown 绑定文件。
- 当前旧项目目录只剩一个空目录句柄残留：
  - `projects/proj-1778970788262-5mcldi/admin-frontend/`
- 该空目录仍被 Windows 报告“另一个程序正在使用”，因此父目录 `projects/proj-1778970788262-5mcldi` 暂时还不能物理删除。当前已无项目记录、源码、临时脚本或 node_modules 文件内容残留。

## 5. Git 状态摘要

- 根仓库仍保留后台迁移相关 rename / modify 记录，说明 Git 已跟随迁移到新路径工作。
- 后台独立仓库位于 `admin-frontend/.git`，remote 仍为：
  - `https://github.com/qiuy-collab/LingTour-admin-frontend.git`
- `admin-frontend` 独立仓库当前存在未提交改动，说明 Git 仓库已迁移成功，但还不是干净工作区。

## 6. 后续建议

1. 若要彻底移除最后空目录，请关闭可能仍持有旧路径句柄的程序（编辑器窗口、终端、文件资源管理器、杀毒扫描、Newmax 历史任务），或重启系统后再删除 `projects/proj-1778970788262-5mcldi`。
2. 后台、API、站点依赖已重新安装，且三个项目构建均已通过。
3. 确认部署文档和服务器路径后再提交 Git 变更。
