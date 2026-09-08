# Changelog

本项目的所有重要变更都记录在此文件中。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)，版本号遵循 [Semantic Versioning](https://semver.org/lang/zh-CN/)。

## [Unreleased]

工作区中已实现并验证、但尚未提交/发布的内容。提交时按逻辑拆分为独立的 Conventional Commits（规范见 `docs/development.md`）。

### Added

- site: 路线详情页 "Route Complete" 区右侧改为嵌入 mapcn 风格交互地图（react-leaflet），按站点坐标 `fitBounds` 渲染，marker 完整显示、坐标不再被挤压。

### Fixed

- site: 首页见证文案在 home 配置为空时回退为默认两条（含 `- 署名` 格式），任何环境均不再出现空白见证区。
- site: 文化详情页收敛为 HEAD 原实现，仅保留中部翻页区的 Markdown 渲染；数据改为 CMS/数据库驱动，不再读取仓库内本地 md 文件（`content/culture/shaoguan.en.md` 已移除）。
- site: 首页广东地图装饰路线改用真实城市质心与统一投影生成，修复硬编码旧坐标超出 viewBox 导致的裁切（移动端几乎完全不可见）。
- admin: `I18nInput` / `I18nMarkdownEditor` 保存时保留既有 `zh` 字段（此前会被清空，违反 legacy `zh` 兼容约束）；`CommunityBriefs` 保存载荷同步保留 `zh`。
- admin: 新增 `EventsList` 七列日历的移动端规则（`styles/responsive.css`）：窄屏保留七列日期、隐藏格内活动条，活动信息经列表视图完整可达。
- site: `RoutesPageClient` 竖排徽标（`lg:-rotate-90`）改为横向排列。

### Changed

- site: 文化页全量重构为纯 Markdown 排版，前台/后台/后端三层贯通：新增 `content_markdown` 幂等迁移（含 text→jsonb 类型对齐）、城市实体/DTO/service 字段、后台 "Content Markdown" 编辑面板，前台所有城市统一 md 渲染并移除翻页组件。
- site: 全站文案去 AI 残留表达（Culture / Routes / Shop CTA、Community 主副标题、Interpreting 预约区等），统一为面向客户的高级简约表达。

> 注：onboarding 相关 WIP（`AdminLayout.vue`、`OnboardingTour.vue`、`theme.css`、`Dashboard.vue`、`constants/onboarding.ts`、新增 `useIsMobile.ts` 等）属于进行中的独立工作，评审阻塞项与提交节奏见 `docs/CURRENT-STATE.md`，暂不计入本段。

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
