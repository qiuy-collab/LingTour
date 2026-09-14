# 发布指南

发布流程、服务器与进程配置、数据库迁移与上线后验证。授权边界见 [`../AGENT.md`](../AGENT.md)；开发环境见 [`development.md`](development.md)。

## 1. 发布通道

当前生产以 **Docker 栈**为准：宿主机 Nginx（TLS，宝塔面板）→ `127.0.0.1:8088` → `lingtour-nginx` Docker 网关，按 Host 路由到 `site` / `api` / `admin` 容器。服务器上的 PM2 进程已退役并保持停止状态，仅作历史参考。

1. **标准通道**：GitHub Actions `Deploy LingTour Docker Stack` 工作流（`workflow_dispatch`-only）→ SSH 到服务器执行 `tools/deploy-docker.sh`。
   - **push 根仓库 `main` 只触发 CI，永不触发部署**；部署必须显式 dispatch 该工作流，且必须获得明确授权。
   - 依赖仓库 Secrets：`SERVER_HOST`、`SERVER_USER`、`SERVER_SSH_KEY`、`SERVER_PORT`（可选，默认 22）。
2. **手动（授权后）**：在服务器上直接执行：

   ```bash
   ssh Ravi-server "cd /root/LingTour && bash tools/deploy-docker.sh"
   ```

   `tools/deploy-docker.sh` 是 Docker 部署的**唯一权威脚本**：备份服务器 Git 状态、`ff-only` 拉取、构建镜像、执行待迁移（`migration:run`）、重启容器并做健康检查；构建后在 `up -d` 之后重启 nginx 以重新解析 upstream（修复应用容器重建后的 502）。**其 Git 备份不是数据库备份。**

CI（`.github/workflows/ci.yml`）：api（tsc + test + build，含 Postgres 16 service）、site（tsc + build）；push main 只做构建验证，不做部署。

> 已知部署风险：2 GB 内存主机上同时构建 site/admin 镜像可能触发内存耗尽（2026-09-11 曾致约 6 分钟主机冻结，靠 swap 吸收峰值）；构建缓存冷时 `deploy.yml` 曾在 ssh-action 10 分钟默认超时内失败（2026-09-14）。失败后先检查残留容器再重试，缓存温热时通常可成功。

## 2. 服务器与运行拓扑

- 服务器：SSH 别名 `Ravi-server`，仓库路径 `/root/LingTour`。
- 生产域名：`https://culvoy.com`（site）、`https://admin.culvoy.com`（admin）、`https://api.culvoy.com`（api），经 Cloudflare（Origin CA 证书，SAN 覆盖 `culvoy.com` + `*.culvoy.com`）→ 宿主机 Nginx（宝塔 vhost）→ `127.0.0.1:8088` → `lingtour-nginx` Docker 网关按 Host 分发；legacy `lingfengtranstour.cn` 域名族并行保留直至迁移关闭。
- 容器：`site` / `api` / `admin` / `redis` 由根目录 `docker-compose.prod.yml` 管理；**PostgreSQL 不在 Compose 内**——API 直连宿主机 PostgreSQL（`host.docker.internal:5432`），数据库备份须在宿主机执行 `pg_dump -Fc`。
- API 健康检查：`https://api.culvoy.com/health`。
- 已知健康检查误报：`lingtour-site-1` 常报 Docker `unhealthy` 而实际服务正常——healthcheck 以 5 秒超时执行 `node -e fetch(...)`，负载下 node 启动即超时；以站点实际 200 响应为准。
- 服务器上存在未跟踪产物（历史部署 `*.bundle`、`site/public/assets/` 等）：未经引用核查与授权不得删除，详见 `docs/CURRENT-STATE.md`。
- 部署相关路径速查另见根目录 `BT-DEPLOY-PATHS.md`（宝塔口径）。

## 3. 发布前检查

1. 三端验证全绿（命令见 `development.md` §3），两仓库 `git diff --check` 通过。
2. 核对两仓库状态与未推送提交，记录 root 与 admin 的 SHA。
3. 更新 `CHANGELOG.md`：把 `[Unreleased]` 条目移入本次部署的日期分节（以 root HEAD SHA 为锚），部署信息（workflow run、迁移、备份文件）写入节尾——分节约定见 `CHANGELOG.md` 头部说明；即使是全新内容也照此新增分节，防止 CHANGELOG 再次失实。
4. 审查每个待上库的 TypeORM 迁移：**只新增、不重写已执行迁移**；`api/src/database/data-source.ts` 保持 `synchronize: false`。
5. 备份目标数据库，并做**只读**迁移状态检查（已应用迁移数以服务器实时状态为准）。
6. 确认 `docs/CURRENT-STATE.md` 无未解决的部署阻塞项。

## 4. 发布步骤（授权后）

1. 先 push 独立 admin 仓库 `main`，再 push 根仓库 `main`（顺序不可颠倒，保证服务器拉取时双仓库内容一致）。
2. dispatch `Deploy LingTour Docker Stack` 工作流并跟踪部署日志。
3. 部署后确认版本与容器状态：

   ```bash
   ssh Ravi-server "cd /root/LingTour && git rev-parse --short HEAD && docker compose -f docker-compose.prod.yml --env-file .env ps"
   ```

4. 执行冒烟（§5）。

## 5. 发布后冒烟

- API `/health` 返回 200 且数据库 `up`。
- 公开站点：首页、文化列表/详情、路线列表/详情、传译与预约、店铺与 Checkout、登录/个人资料、社区。
- 运营后台：本次变更涉及的创建/编辑/保存/预览/状态流转，并经刷新与重登验证持久化；后台预览必须走真实公开页面/预览路由。
- 涉及迁移时，确认迁移已应用且相关接口读写正常。

## 6. 回滚

- 代码回滚：在服务器上把仓库切回上一个已验证 SHA 后重新执行 `tools/deploy-docker.sh`。执行前确认服务器工作区已备份（含未跟踪产物），由运维执行，不在本地仓库演示危险命令。
- 数据回滚：迁移不提供 down；以发布前数据库备份（宿主机 `pg_dump -Fc` 产物）恢复，且必须先停写。
- 任何回滚都在 `docs/CURRENT-STATE.md` 记录原因与结果。

## 7. 生产环境变量

只在服务器/Secrets 中管理；文档与提交中只出现变量名，绝不写值。

- site：`NEXT_PUBLIC_API_URL`（生产为 `https://api.culvoy.com/api/v1`）、`INTERNAL_API_ORIGIN`、`PORT`、`HOST`、`NEXT_OUTPUT`。
- admin：`VITE_API_ORIGIN`、`VITE_SITE_ORIGIN` 或 `VITE_SITE_PREVIEW_ORIGIN`、`VITE_MEDIA_ORIGIN`、`PORT`、`HOST`。
- api：数据库 `DB_*`、`JWT_SECRET`、Stripe 密钥与 webhook secret、媒体/上传相关配置；完整清单见仓库根目录 `.env.production.example`。
- Actions：仓库 Secrets `SERVER_HOST` / `SERVER_USER` / `SERVER_SSH_KEY` / `SERVER_PORT`。

> 端口口径：本地开发 site 3000 / admin 5173 / api 8000；生产 PM2 内部端口 site 3001 / admin 4173 / api 8000，对外统一经 Nginx 443 反代。
