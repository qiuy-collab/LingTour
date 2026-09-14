# Changelog

本项目的所有重要变更都记录在此文件中。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)。`1.0.0` 基线之后本项目采用 `workflow_dispatch` 滚动部署且不使用 git tag，因此已发布变更按**生产部署日期**分节（最新在上），每节以当时的根仓库 HEAD SHA 为锚点；admin-frontend 独立仓库的对应提交随各条目一并生效，双仓库对应关系见 `docs/CURRENT-STATE.md`。

## [Unreleased]

已提交/已验证但尚未部署到生产的变更；随下一次部署移入对应日期分节。当前为空。

## 2026-09-14 — 后台列表筛选与壳层打磨（root `e9f9914`）

### Fixed

- admin: 商品列表「在售/下架」筛选正确映射为 `published=true/false`，搜索关键词映射到后端 `q`。
- admin: 活动列表日期区间（`startDate`/`endDate`）由 API 实际读取并过滤；预约列表改用独立 `date=YYYY-MM-DD` 参数、按 `booking.serviceDate` 精确过滤，不再误用关键词搜索。
- api: `events` / `interpreting` / `shop` 列表接口落实上述筛选参数。
- admin: 统一响应式壳层断点（移动端 `max-width: 768px`、平板/桌面 `min-width: 769px`），消除 768px 设备上两套规则争抢；清理无效死选择器与重复遮罩规则。
- admin: 页面骨架屏改用 `--lt-*` 主题变量，暗色模式不再显示浅色骨架。

部署：`Deploy LingTour Docker Stack` run `34823168215` 成功（5m22s）；无迁移（生产 27/27 已应用，`migration:run` 为空操作）；部署前数据库备份 `/root/backups/lingtour-db-pre-adminfilters-20260914-163015.dump`。

## 2026-09-14 — 移动端布局修复（root `b1eadd7`）

### Fixed

- site: Culture / Routes / Interpreting 首屏在移动端保持并排布局；Interpreting 信息层级、Shop 详情 hero / story / related-products、Field Journal 登录按钮不再在窄屏被挤压或破坏（7 个未推送提交以 squash 方式合为单提交上线，内容零变化）。

部署：run `34813335316` 成功（8m24s）；无迁移。

## 2026-09-11 — culvoy.com 域名切换与积压批次上线（root `4e21907`）

### Changed

- 全仓：产品更名为 Culvoy（`5bec3bf`）；生产域名从 `lingfengtranstour.cn` 切换为 `culvoy.com` / `admin.culvoy.com` / `api.culvoy.com`（`4e21907`），nginx、部署与冒烟脚本、构建期域名同步更新；legacy 域名并行保留直至迁移关闭。
- site/api/admin: 2026-09-06 ~ 09-10 积压的已提交工作随本次部署首次上线（均核实为 `4e21907` 祖先）：culture Markdown 持久化与发布生命周期、admin 城市 Markdown 编辑、路线行程编辑强调与路线地图、staff onboarding 流程、移动端详情抽屉、Field Journal 编辑版式（Culture / Routes 列表与详情、登录入口）。
- site: 首页广东地图装饰路线改用真实城市质心与统一投影，修复硬编码坐标越界导致的裁切（`73aedc5`）。
- site: 移除虚构的 serviceCount 表达（`0ab3405`）；首页见证在 CMS 列表为空时回退为默认两条（`08a4e0c`）；全站文案替换 AI 残留表达（`8f6bdcd`）。
- ops: 2026-09-12 安装 Cloudflare Origin CA 证书（SAN `culvoy.com` + `*.culvoy.com`，有效期至 2041-09），三个 culvoy vhost 引用；legacy 域名 vhost 证书不变。

### Fixed

- admin: `I18nInput` / `I18nMarkdownEditor` 保存时保留既有 `zh` 字段（此前被清空，违反 legacy `zh` 兼容约束）；`CommunityBriefs` 载荷同步保留（`feb13b4`）。
- admin: EventsList 七列日历移动端规则——窄屏保留七列日期、隐藏格内活动条，活动信息经列表视图完整可达（`1b36ba5`）。
- site: 登录页移动端输入缩放修复（`f85281d`）。
- ops: 部署脚本 `tools/deploy-docker.sh` 在 `up -d` 后重启 nginx 重新解析 upstream，修复应用容器重建后的 502。

部署：服务器直接执行 `tools/deploy-docker.sh`，HEAD `4e21907`；部署前数据库备份 `/root/backups/lingtour-db-pre-domain-20260911-225953.dump`。

## [1.0.0] - 2026-09-05

首次公开基线：生产环境运行 LingTour 完整产品（公开站点、运营后台、API）。

### Added

- 城市文化、故事路线、陪同传译与预约、店铺与 Stripe 支付、社区等业务域（设计详见 `docs/backend/`）。
- 运营后台 CMS：内容编辑、审计、订单/预约、媒体与状态流转。
- 城市/路线/商品独立 SEO 标题与元数据。

### Security

- 支付链路改为服务端定价、Stripe webhook 原始体验签、订金与预订绑定（`SecureInterpretingDeposits` 迁移；代码已合入，是否已应用生产以服务器迁移状态为准）。

### Performance

- 公共内容与导航数据缓存（`perf(platform): cache public content and navigation data`）。
- 首页非关键加载延后（`perf(site): defer noncritical home loading`）。

### Fixed

- 全局 i18n 管道清空数组字段、Home 配置 PUT 清空自身 sections 等数据回归。
- 预览未保存草稿跨窗口握手、讲解员头像失败回退、预订完成与混合上传反馈。
- 首页视频手动播放恢复。

## 历史里程碑（2026-05 ~ 2026-07）

初始开发期的变更未按版本记录。关键节点查阅 Git 提交历史与 `docs/archive/` 内的 dated 文档（handoff、进度与旧部署手册）。
