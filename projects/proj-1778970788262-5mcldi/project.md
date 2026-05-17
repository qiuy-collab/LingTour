# 凌云游 (LingTour) 管理后台项目计划

## 1. 项目背景与目标
为凌云游 (LingTour) 项目的客户端应用提供配套的 Web 管理后台。主要用于对系统内的核心业务数据进行管理（增删改查），满足初期运营和维护的需求。

## 2. 技术选型
*   **前端框架**: Vue 3 + Vite
*   **UI 组件库**: Element Plus
*   **路由管理**: Vue Router
*   **状态管理**: Pinia
*   **网络请求**: Axios
*   **样式方案**: TailwindCSS / SCSS
*   **权限管理**: MVP 阶段暂不引入复杂的 RBAC 细粒度权限控制，仅需统一后台管理员登录，登录后可管理所有模块。

## 3. 功能模块设计 (15个模块 — 基于前端代码调研)

### 3.1 仪表盘 (Dashboard)
- 核心统计卡片（用户数/城市数/路线数/商品数/口译员数/待处理预约/待处理订单）
- 近30天订单金额趋势图
- 口译预约按模式分布、热门城市 Top5

### 3.2 城市管理 (Cities)
- 包含：slug、城市名、地区标签、行政区划代码、头图、叙述文案、标签集、编辑推荐语、图片集、美食标题/描述/图片、长文章段落(sections)、数据亮点、金句引语
- 嵌套编辑：sections（段落标题/正文/配图/数据标签/呼吸引图/sortOrder）
- 操作：新增、编辑、删除/下架

### 3.3 路线管理 (Routes)
- 包含：slug、标题、文化标签(Guangfu/Chaoshan/Hakka/Coastal/BayArea/Mountain)、城市、时长、目标人群、摘要、总述、封面图
- 核心嵌套：stops（时间/站点名/计划/故事/文化解读/要点列表/经纬度/餐食/住宿/交通/地点详述/sortOrder）
- 操作：新增、编辑（含站点拖拽排序）、上下架

### 3.4 商城系列管理 (Store Collections)
- 包含：slug、系列名、关联路线、封面图、描述、商品数量
- 操作：新增、编辑、查看系列下商品

### 3.5 商品管理 (Products)
- 包含：slug、商品名、所属系列、价格/币种、标签、主图、商品故事、材质/尺寸/产地/保养说明、详情图集、库存、产地溯源(originTrace - 7个子字段)
- 操作：新增、编辑、上下架、库存调整

### 3.6 口译服务模式管理 (Service Modes)
- 包含：排序、模式名称、价格、适用场景、描述、服务清单、卡片色调、是否推荐
- 操作：排序调整、编辑、新增

### 3.7 口译员管理 (Interpreters)
- 包含：排序、姓名、服务语种、专注领域、能力标签、头像、简介、状态(active/inactive/pending_review)、服务城市
- 操作：新增、编辑、审核、禁用

### 3.8 口译预约管理 (Interpreting Bookings)
- 包含：预约人/联系方式/城市/日期/模式/人数/需求、是否快速通道、状态(pending/confirmed/completed/cancelled)、分配口译员
- 操作：查看、确认、分配、完成/取消

### 3.9 常见问题管理 (FAQs)
- 包含：排序、问题、答案、分类
- 操作：新增、编辑、排序

### 3.10 活动/节庆管理 (Events)
- 包含：活动名、日期/结束日期、城市、标签、摘要、详细描述、关联路线、封面图、状态(upcoming/ongoing/past/draft)
- 操作：新增、编辑、活动日历视图

### 3.11 订单管理 (Orders)
- 商城订单：订单号、用户、商品明细、金额、运费、税费、收货地址、状态(pending/paid/shipped/delivered/refunded/cancelled)
- 操作：筛选查看、改状态（发货/退款）

### 3.12 用户管理 (Users)
- 包含：姓名/邮箱/头像/语言偏好/注册时间、状态(active/banned)、预约次数、订单次数、收藏列表
- 操作：查看列表、查看详情、拉黑/解封

### 3.13 社区帖子管理 (Community Posts)
- 包含：用户信息、标题/摘要/正文、地点/路线、频道(FoodMap/FieldNotes/HiddenStop/CultureDesk)、标签、点赞/评论/收藏数、状态(published/pending_review/hidden)
- 操作：审核、精选、隐藏/删除

### 3.14 首页内容管理 (Home Page)
- 可配置区块：Hero统计卡片、信任指标、入口卡片、精选路线、文化亮点、评价展示
- 操作：选择展示内容、编辑文案

### 3.15 系统设置 (Settings)
- SEO标题/描述、语种设置、币种、税率、运费模板、服务城市列表

## 4. 后端 API 规划 (管理后台侧)
- 认证：`/admin/auth`
- 城市CRUD：`/admin/cities`
- 路线CRUD（含站点）：`/admin/routes`
- 系列CRUD：`/admin/shop/collections`
- 商品CRUD：`/admin/shop/products`
- 口译模式CRUD：`/admin/interpreting/modes`
- 口译员CRUD：`/admin/interpreting/profiles`
- 预约管理(R+U)：`/admin/interpreting/bookings`
- FAQ CRUD：`/admin/interpreting/faqs`
- 活动CRUD：`/admin/events`
- 订单管理(R+U)：`/admin/orders`
- 用户管理(R+U)：`/admin/users`
- 帖子管理(R+U+D)：`/admin/community/posts`
- 首页配置(R+U)：`/admin/home`
- 仪表盘统计：`/admin/dashboard`
- 系统设置：`/admin/settings`
- 文件上传：`/admin/upload`

## 5. 实施里程碑

* ✅ **阶段一：环境搭建与管理后台骨架**（已完成 2026-05-17）
    * 搭建 Vue 3 + Vite + Element Plus 框架，实现全局 Sidebar 和 Header。
    * 产出 18 个源文件，含登录页、路由守卫、Mock、ImageUpload 组件等基础设施。
* ✅ **阶段二：城市与路线管理模块**（已完成 2026-05-17）
    * 实现城市 sections 嵌套编辑（el-card 动态列表 + 上移/下移/删除）。
    * 实现路线 stops 嵌套编辑（el-drawer 抽屉完整编辑 13+ 字段）。
    * 产出 10 个文件(类型/API/Mock/页面/路由)，vue-tsc + vite build 零错误。
* ✅ **阶段三：商城系列、商品与订单管理**（已完成 2026-05-17）
    * 实现商品 originTrace 的嵌套编辑（el-card 独立卡片区块，7个子字段）。
    * 实现订单状态流转（el-steps 步骤条 + 发货/退款快捷操作）。
    * 产出 17 个文件（3类型+3API+3Mock+6页面+2修改），vue-tsc + vite build 零错误。
* ✅ **阶段四：口译服务相关模块**（已完成 2026-05-17）
    * 实现服务模式（排序/色调/推荐/动态tag清单）、口译员（状态流转 pending_review→active↔inactive）、预约管理（el-drawer详情+分配口译员+全状态流转）、FAQ（排序/分类筛选）。
    * 产出 14 个文件（1类型+4API+1Mock+2修改+7页面），vue-tsc + vite build 零错误。
* ✅ **阶段五：运营内容管理模块**（已完成 2026-05-17）
    * 实现活动管理（列表+日历双视图、draft→upcoming→ongoing→past 状态流转）。
    * 实现社区帖子管理（4频道筛选、pending_review→published↔hidden 审核流程）。
    * 实现首页内容管理（6大区块折叠面板、动态增删列表项）。
    * 产出 11 个文件（3类型+3API+1Mock+5页面+2修改），vue-tsc + vite build 零错误。
* ✅ **阶段六：仪表盘、用户与系统设置**（已完成 2026-05-17）
    * 实现 Dashboard 仪表盘（7统计卡片 + 3 ECharts 图表：折线/饼图/柱状图）。
    * 实现用户管理（列表+详情+封禁/解封、收藏展示、活动统计）。
    * 实现系统设置（SEO/语言/币种/税率/运费模板编辑/服务城市管理）。
    * 产出 15 个文件（3类型+3API+3Mock+4页面+2修改），vue-tsc + vite build 零错误。
* ✅ **阶段七：全量功能测试与交付**（已完成 2026-05-17）
    * 执行构建并在浏览器中全量验证所有功能。
    * 构建 `dist/` 产物无错误，输出 `outputs/test-report.md` 测试报告。

## 6. 项目约束
* 产出物统一存放在当前工作区 `admin-frontend/` 目录下。
* 保持 UI 简洁直观，尽量使用 Element Plus 默认组件完成管理表格、表单。
* 详细调研设计见 `outputs/admin-backend-research.md`