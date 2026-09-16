# Changelog

本项目的所有重要变更都记录在此文件中。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)。`1.0.0` 基线之后本项目采用 `workflow_dispatch` 滚动部署且不使用 git tag，因此已发布变更按**生产部署日期**分节（最新在上），每节以当时的根仓库 HEAD SHA 为锚点；admin-frontend 独立仓库的对应提交随各条目一并生效，双仓库对应关系见 `docs/CURRENT-STATE.md`。

## [Unreleased]

已提交/已验证但尚未部署到生产的变更；随下一次部署移入对应日期分节。

### Changed

- site: 首页改为全宽海岸 Hero，首屏导航叠加在 Hero 上，滚动后恢复纸面导航；优化桌面与移动端标题、CTA、信息带和图片衔接。

## 2026-09-16 — English-only content contract (root `d52162b`)

### Changed

- platform: 下线业务内容多语言兼容，新增 `EnglishOnlyContent1762300000000` 迁移，将现有 JSONB 内容递归收敛为 English 值并移除 `zh/ZH`。
- api/site/admin: 内容 DTO、实体、预览、缓存键和编辑表单统一为英文单值；后台不再发送 `rawI18n` 或保留旧中文字段。独立 admin 仓库对应提交为 `38475be`。

部署：`Deploy LingTour Docker Stack` run `35063493183`（功能部署）及 `35064138513`（最终文档同步）；服务器 root `002708a`；生产迁移总数 29。
部署前数据库备份：`/root/backups/lingtour-db-pre-english-only-20260916.dump`（144856 bytes）。

验证：API/site/admin 容器健康；公网 site、admin、API health 返回 200；公开城市、路线、商品、系列、口译字段均为字符串；业务 JSON `zh` 键抽查为 0；390px 浏览器无横向溢出。

## 2026-09-16 — Review 缺陷修复上线（root `6216454`）

### Fixed

- api: 按生产代理跳数配置 `trust proxy`，避免所有访客共享全局限流桶；refresh 和 JWT 校验重新检查账号状态；事件状态收紧为 `draft/upcoming/ongoing/past`。
- api: 上传文件增加 magic-byte 校验并为静态上传响应增加 `nosniff`；修复 API 测试 mock 类型漂移。
- platform: 商城下单在事务内锁定并预留库存，支付失败或取消时释放；预约/定金提交支持 `Idempotency-Key`。
- site: SSR 失败不再伪装成稳定空数据；空 initial list 会重新请求；公开 server fetch 移除独立 Next Data Cache；兼容 collection 历史多语言字段；后台登录页不再请求未授权 settings。

部署：`Deploy LingTour Docker Stack` run `35015977643` 成功（6m09s）；服务器 root `6216454`，admin-frontend `228b55c`；新增迁移 `AddStockReservationsAndBookingIdempotency1762200000000` 已应用。部署前数据库备份：`/root/backups/lingtour-db-pre-review-fixes-20260916.dump`（144303 bytes）。

验证：API tsc、24 suites/161 tests/build；site tsc、18 suites/102 tests/build；admin build；site lint 0 errors/1084 warnings；前台和后台 1280/390px 浏览器回归通过；公网 API/页面 200，数据库 health `up`。

## 2026-09-16 — 品牌更名 Culvoy 与界面反馈修复（root `9cb4eb0`）

### Changed

- api/site/admin: 品牌全面更名为 Culvoy——API 面、邮件、cookie 与 localStorage 键（`lingtour_session` → `culvoy_session` 等）、预览通道、站点文案与全部指南文档；网关 `server_name` 收敛到 culvoy.com 家族，旧域名在宿主 TLS 层保持兼容。破坏性提示：访客需重新登录一次，本地购物车/收藏因键名变更而重置。
- admin: 独立仓库 `be74c41` 同步更名（预览通道、存储键、允许主机、vite 配置）。

### Fixed

- site: 文化列表卡片移除交错布局函数，统一 3 列网格，排版结构不再被打乱。
- site: Interpreting 页 hero 标题对齐其他页面样板——移除 `max-w-[18ch]` 窄约束并补桌面放大档位，左侧文字不再被挤压。
- site: 产品详情标题移除 `max-w-[12ch]` / `[14ch]` 窄栏约束，"Canton Porcelain Tea Cup" 等长标题恢复正常横排。
- site: 登录页左侧品牌分割线水平居中（`self-center`）。
- site: 验证码按钮文案精简为 "Email a code instead"。
- site: 删除登录页 "Sign in to return to your saved routes, field notes, and bookings." 描述段落。
- site: Header 登录入口改为 river-deep 描边按钮、Book 改为同色实底按钮，替代原先突兀的朱红双实底。

部署：`Deploy LingTour Docker Stack` run `34998367122`；服务器 HEAD `9cb4eb0`（admin `be74c41`）；无新增迁移。本批界面修复在部署前被并行会话卷入 rebrand 提交 `b51ca6e` 一并入库上线，部署后已在生产逐条实证 7/7（登录页 DOM 按钮/分割线/无旧段落、首页 Header 按钮类名、Interpreting hero、产品详情 h1、Culture 网格）。

## 2026-09-15 — Profile 一致性与注册验证码（root `b3df634`）

### Fixed

- site: Profile 页面 header 和 tab 栏改用统一的矿物纸底色；archive action 保持可点击范围并避免移动端拉伸。
- site: 已登录头像入口在用户有头像时显示真实头像，无头像时退回姓名缩写。

### Added

- site: 注册流程支持邮箱验证码注册，发送/验证的 `purpose` 区分登录与注册，并传递新用户姓名。
- site: 注册表单的国家和旅行偏好改用受控 listbox，保留键盘打开、方向键移动和 Escape 关闭。

部署：`Deploy LingTour Docker Stack` run `34937099768` 完成 build、迁移、容器重建与 nginx 重启后，在 health 等待阶段触发 ssh-action 10 分钟命令超时；人工确认服务器 HEAD `b3df634`，api/admin/nginx/redis 健康，站点 200。无新增迁移。

## 2026-09-15 — 站点审阅与 Profile 页面重构（root `008dbbf`）

### Fixed

- site: 账户入口改为独立圆形头像触点，不再使用方形容器包裹圆形头像。
- site: Culture / Route 详情移动端叠层统一使用页面矿物纸底色，Culture 的「All cities」链接移出内容卡片并缩小叠层容器。
- site: Culture 详情桌面首屏改用稳定的 `minmax(0, …)` 网格，避免标题与摘要列被媒体列挤压。
- site: Profile 统一页面底色与内容表面，移除空状态整屏撑高、白色大卡片和设置区割裂容器，补齐移动端字段与内容的宽度约束。

部署：`Deploy LingTour Docker Stack` run `34875955514` 成功（8m14s）；无迁移。部署前数据库备份 `/root/backups/lingtour-db-pre-profile-20260915-013724.dump`。

## 2026-09-14 — 公共站点移动端与档案状态修复（root `0303a42`）

### Fixed

- site: 登录入口改为高对比实心按钮，去掉窄屏局促的装饰菱形。
- site: Culture 移动端 hero 图文顶部对齐，标题不再被挤压截断；城市/路线卡片统一高度并保持底部 action 对齐。
- site: Interpreting 移动端标题不再三行挤压；“Choose support” 与 “Meet the interpreters” 保持横排。
- site: Profile 空状态底色与页面一致，去除割裂白块；不可读的深色 action 改为可读 outline 按钮。

部署：`Deploy LingTour Docker Stack` run `34829863128` 成功（4m19s）；无迁移。

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

- 全仓：产品更名为 Culvoy（`5bec3bf`）；生产域名从 `culvoy.com` 切换为 `culvoy.com` / `admin.culvoy.com` / `api.culvoy.com`（`4e21907`），nginx、部署与冒烟脚本、构建期域名同步更新；legacy 域名并行保留直至迁移关闭。
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

首次公开基线：生产环境运行 Culvoy 完整产品（公开站点、运营后台、API）。

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
