# 发布指南

发布流程、服务器与进程配置、数据库迁移与上线后验证。授权边界见 [`../AGENT.md`](../AGENT.md)；开发环境见 [`development.md`](development.md)。

## 1. 发布通道

当前生产以 **PM2** 为准；Docker 为已准备的未来路径（`docker-compose*.yml`、各端 Dockerfile、CI 镜像构建均已就绪，但不是默认部署路径）。

1. **自动（主通道）**：push 根仓库 `main` → GitHub Actions `deploy.yml` → SSH 到服务器执行部署。
   - 依赖仓库 Secrets：`SERVER_HOST`、`SERVER_USER`、`SERVER_SSH_KEY`、`SERVER_PORT`（可选，默认 22）。
   - 因此 **push root `main` 即可影响生产**，必须获得明确授权。
2. **手动（授权后）**：

   ```bash
   ssh lingtour-server "cd /root/LingTour && git pull --ff-only origin main && bash tools/deploy-pm2.sh"
   ```

   `tools/deploy-pm2.sh` 是 PM2 部署的**唯一权威脚本**：可重置服务器脏工作区、构建 API/site/admin、执行待迁移、重启 PM2 并做健康检查。**其 Git 备份不是数据库备份。**

CI（`.github/workflows/ci.yml`）：api（tsc + test + build，含 Postgres 16 service）、site（tsc + build）、push main 时构建 API/Site Docker 镜像做验证。

## 2. 服务器与进程配置

- 服务器：SSH 别名 `lingtour-server`，仓库路径 `/root/LingTour`。
- 进程管理：PM2，定义见根目录 `ecosystem.config.js`。

| PM2 进程 | 应用 | 启动文件 | 内部端口 | 备注 |
| --- | --- | --- | --- | --- |
| `lingtour-api` | api | `api/dist/main.js` | 8000 | `NODE_ENV=production` |
| `lingtour-site` | site | `site/server.cjs` | 3001 | 对外由 Nginx 反代 |
| `lingtour-admin` | admin-frontend | `admin-frontend/server.cjs` | 4173 | `VITE_API_ORIGIN=https://api.culvoy.com` |

- 对外域名：`https://culvoy.com`（site）、`https://admin.culvoy.com`（admin）、`https://api.culvoy.com`（api），经 Nginx 反代到上表内部端口。
- API 健康检查：`https://api.culvoy.com/health`。
- 服务器上存在未跟踪产物（历史部署 `*.bundle`、`site/public/assets/` 等）：未经引用核查与授权不得删除，详见 `docs/CURRENT-STATE.md`。
- 部署相关路径速查另见根目录 `BT-DEPLOY-PATHS.md`（宝塔口径，内部端口与上表一致）。

## 3. 发布前检查

1. 三端验证全绿（命令见 `development.md` §3），两仓库 `git diff --check` 通过。
2. 核对两仓库状态与未推送提交，记录 root 与 admin 的 SHA。
3. 审查每个待上库的 TypeORM 迁移：**只新增、不重写已执行迁移**；`api/src/database/data-source.ts` 保持 `synchronize: false`。
4. 备份目标数据库，并做**只读**迁移状态检查（已应用迁移数以服务器实时状态为准）。
5. 确认 `docs/CURRENT-STATE.md` 无未解决的部署阻塞项。

## 4. 发布步骤（授权后）

1. 先 push 独立 admin 仓库 `main`，再 push 根仓库 `main`（顺序不可颠倒，保证服务器拉取时双仓库内容一致）。
2. 跟踪 GitHub Actions `deploy.yml` 的部署日志。
3. 部署后确认版本与进程：

   ```bash
   ssh lingtour-server "cd /root/LingTour && git rev-parse --short HEAD && pm2 status"
   ```

4. 执行冒烟（§5）。

## 5. 发布后冒烟

- API `/health` 返回 200 且数据库 `up`。
- 公开站点：首页、文化列表/详情、路线列表/详情、传译与预约、店铺与 Checkout、登录/个人资料、社区。
- 运营后台：本次变更涉及的创建/编辑/保存/预览/状态流转，并经刷新与重登验证持久化；后台预览必须走真实公开页面/预览路由。
- 涉及迁移时，确认迁移已应用且相关接口读写正常。

## 6. 回滚

- 代码回滚：在服务器上把仓库切回上一个已验证 SHA 后重新执行 `tools/deploy-pm2.sh`。执行前确认服务器工作区已备份（含未跟踪产物），由运维执行，不在本地仓库演示危险命令。
- 数据回滚：迁移不提供 down；以发布前数据库备份恢复，且必须先停写。
- 任何回滚都在 `docs/CURRENT-STATE.md` 记录原因与结果。

## 7. 生产环境变量

只在服务器/Secrets 中管理；文档与提交中只出现变量名，绝不写值。

- site：`NEXT_PUBLIC_API_URL`（生产为 `https://api.culvoy.com/api/v1`）、`INTERNAL_API_ORIGIN`、`PORT`、`HOST`、`NEXT_OUTPUT`。
- admin：`VITE_API_ORIGIN`、`VITE_SITE_ORIGIN` 或 `VITE_SITE_PREVIEW_ORIGIN`、`VITE_MEDIA_ORIGIN`、`PORT`、`HOST`。
- api：数据库 `DB_*`、`JWT_SECRET`、Stripe 密钥与 webhook secret、媒体/上传相关配置；完整清单见仓库根目录 `.env.production.example`。
- Actions：仓库 Secrets `SERVER_HOST` / `SERVER_USER` / `SERVER_SSH_KEY` / `SERVER_PORT`。

> 端口口径：本地开发 site 3000 / admin 5173 / api 8000；生产 PM2 内部端口 site 3001 / admin 4173 / api 8000，对外统一经 Nginx 443 反代。
