# 长期记忆

## 2026-05-17
- 用户偏好：前端技术栈选择了 Vue 3 + Element Plus (推荐方案) 来构建。
- 重要决策：首期暂不需要复杂的权限控制机制 (RBAC)，要求实现所有业务实体模块（Dashboard、用户、城市、路线、商城、翻译、订单等）的全面 CRUD 管理。
- 任务拆解：已按照产品和技术路线拆解并创建了前端初始化到全面 CRUD 的分阶开发任务。
- 深度调研：通过对 site/ 前端代码全面分析，将管理后台从最初计划的 7 个模块扩展至 **15 个模块**。新增模块包括：活动/节庆管理、社区帖子管理、首页内容管理、系统设置、口译预约管理、FAQ 管理。原"商城管理"拆分为"系列管理 + 商品管理"，原"翻译服务管理"拆分为"服务模式 + 口译员 + 预约 + FAQ"四个子模块。
- 关键发现：路线(Routes)包含 stops 嵌套编辑（每站含经纬度/文化解读/餐食等15+字段），城市(Cities)包含 sections 嵌套编辑，商品(Products)包含 originTrace 产地溯源（6个子字段）。这些嵌套结构是后台开发的核心难点。
- API 规划：明确了 16 组管理后台 API 端点（含文件上传），覆盖全部 15 个业务模块。
- 产出物：完整调研设计文档 `outputs/admin-backend-research.md`（含字段清单、实体关系图、页面路由树、技术要点）。

## 2026-05-17 任务重设计（第二轮）
- **审查发现**：对7个自动任务进行了完整性审计，发现12项严重问题（缺失验收标准、无浏览器验证步骤、缺少前置阅读指令、5分钟等待未落地、登录认证无归属、文件上传无归属、TypeScript类型无归属、任务描述过于精简等）和18项主要问题。
- **重设计结果**：全部7个任务已完整重写，每个任务现在包含：
  1. 明确的前置阅读指令（指定 research doc 具体章节）
  2. 分步骤的开发清单（TypeScript类型→API服务→Mock数据→页面组件→路由注册）
  3. 具体的嵌套编辑实现方案（stops用el-drawer抽屉、sections用动态card列表、originTrace用独立el-card区块）
  4. 可测试的验收标准（每任务5-12项勾选清单）
  5. 逐项的浏览器验证步骤（含精确URL和操作流程）
  6. 明确的 sleep 300 等待指令
- **关键补充**：
  - 阶段一新增：登录页、路由守卫、Axios拦截器、ImageUpload组件、Mock基础设施、TypeScript基础类型、Pinia auth store
  - 全局覆盖：文件上传（ImageUpload组件在所有编辑页复用）、富文本（阶段先用textarea）、ECharts图表（Dashboard折线图+饼图+柱状图）
  - 阶段七：46项详细测试检查清单 + test-report.md 输出要求

## 2026-05-17 自动提取
- 用户指出后台设计不够完善，要求调研后台需要哪些数据
- 助手对凌云游 Next.js 项目代码进行全面分析，将管理后台模块从 7 个扩展为 15 个
- 新增模块：活动/节庆管理、社区帖子管理、首页内容管理、系统设置、FAQ 管理、口译预约管理
- 拆分模块：商城管理拆为系列管理与商品管理；翻译服务管理拆为服务模式、口译员、预约、FAQ
- 核心技术难点已识别：路线 stops 嵌套编辑、城市 sections 嵌套编辑、商品 originTrace 嵌套、双语文案管理
- 调研文档已保存至 outputs/admin-backend-research.md
- 用户要求重新设计任务：经过全面审计后重写了全部7个阶段任务的描述，补全了验收标准、浏览器验证步骤、前置阅读指令、5分钟等待机制等关键缺失

## 2026-05-17 自动提取
- 用户要求审查任务设计的完整性与可用性，发现12项严重问题（如无验收标准、浏览器验证模糊、缺少前置阅读等）和18项主要问题（如缺少路由注册说明、Mock数据创建计划等）
- 所有7个任务已根据审查结果完整重写，每项严重问题均已修复（如增加验收清单、明确浏览器验证步骤、补充前置阅读指令、实现5分钟等待机制等）
- 重设计后的任务文档已同步更新至项目文档系统，确保全局一致性
- 审查中确认15个模块在7个任务中的分配正确无误，但原有任务描述深度不足，agent可能无法明确执行步骤
- 用户偏好系统性审查方法：先深度检查，再分类问题（严重/主要），最后通过并行更新任务和文档完成修复

## 2026-05-17 阶段一完成
- **阶段一已交付**：Vue 3 + Vite + Element Plus + TypeScript 管理后台骨架搭建完成。
- 产出 18 个源文件，覆盖项目脚手架、TypeScript类型、Pinia store、Axios封装、路由(含守卫)、AdminLayout(5分组15菜单项)、Login页面、ImageUpload组件、Mock基础设施。
- 构建验证：`npm run build` 零 TypeScript 错误通过，`vue-tsc` 类型检查 + Vite 生产构建均成功。
- 修复：补充了原始的 events/create 和 events/:id/edit 路由（原路由器缺少此2条路由）。
- 技术栈版本：Vue 3.5, Vite 8.0, Element Plus 2.14, Pinia 3.0, Vue Router 4.6, TypeScript 6.0, Axios 1.16。
- 关键设计决策：Mock 通过 Axios 拦截器 request→reject→response 短路实现，无需额外 Mock 库；路由守卫用 Pinia store 的 isLoggedIn getter 判断登录态；Sidebar 使用 el-menu-item-group 分组。

## 2026-05-17 阶段二完成
- **阶段二已交付**：城市管理（含 sections 嵌套编辑）和路线管理（含 stops el-drawer 嵌套编辑）完整实现。
- 产出 10 个文件（约1200+行代码）：TypeScript类型(City/Route及其子结构)、API服务层(cities/routes CRUD)、3条城市Mock(各含2个完整section)、3条路线Mock(8个stops各含13+字段)、Mock拦截器(含分页/筛选/搜索)、CitiesList(表格/搜索/分页/删除)、CityEdit(el-card动态sections列表上移下移删除)、RoutesList(状态筛选/文化标签/上下架)、RouteEdit(el-drawer抽屉编辑stop的13+字段)。
- 关键设计模式确立：
  - **sections 嵌套编辑**: el-card 动态列表 + card header 操作按钮(上移/下移/删除)
  - **stops 嵌套编辑**: el-table 概览列表 + el-drawer(600px) 侧边抽屉完整编辑
  - **双语方案**: 中英字段并存(name/nameEn, title/titleEn)，共用图片资源
  - 后续阶段（商品 originTrace、口译模式等）可直接复用这些嵌套编辑模式
- 构建验证：vue-tsc 零类型错误 + vite build 成功。
- 修复：RoutesList.vue 缺失 computed import 导致 cityOptions 失效。

## 2026-05-17 阶段三完成
- **阶段三已交付**：商城系列管理、商品管理（含 originTrace 嵌套编辑）、订单管理完整实现。
- 产出 17 个文件：3个TypeScript类型 + 3个API服务 + 3个Mock数据 + 6个页面组件 + 2个修改文件（mock/index.ts + router/index.ts）。
- originTrace 嵌套编辑采用独立 el-card 卡片区块（左侧蓝色边框高亮），内部 el-row+el-col 双列布局，7个子字段包含3个 textarea。
- 商品 Mock 含 6 条真实感双语产品数据，每条含完整 originTrace（非遗工艺描述/原料来源/制作流程）。
- 订单覆盖全部 6 种状态，el-steps 步骤条可视化展示订单流转，支持发货/退款快捷操作。
- 所有页面中英双语字段分离（name/nameEn, title/titleEn 模式），共用图片资源。
- 构建验证：vue-tsc 零错误 + vite build 零错误，6个商城 chunk 全部正常产出。

## 2026-05-17 阶段四完成
- **阶段四已交付**：口译服务模式管理、口译员管理、口译预约管理、FAQ管理完整实现。
- 产出 14 个文件：1个TypeScript类型 + 4个API服务 + 1个Mock数据 + 7个页面组件 + 修改文件(mock/index.ts + router/index.ts)。
- 关键设计模式：
  - **状态流转**: Interpreter 三态流转（pending_review→active↔inactive），Booking 四态流转（pending→confirmed→completed/cancelled）
  - **动态Tag输入**: includes/helps 使用 el-tag + input 回车添加/关闭删除模式
  - **Drawer详情**: BookingsList 使用 el-drawer(520px) + el-descriptions + 口译员分配select
  - **排序机制**: ServiceModes/FAQs 使用 sortOrder + 上移/下移交换值模式
- ServiceMode.price 为 string 类型（如"$180 / 小时"），是合理的设计选择
- 所有 Stage 4 文件在审查前已存在且实现完整——代码质量高，无需修复
- 构建验证：vue-tsc 零错误 + vite build 零错误，4个口译 chunk 全部正常产出

## 2026-05-17 阶段五完成
- **阶段五已交付**：活动管理、社区帖子管理、首页内容管理完整实现。
- 产出 11 个文件：3个TypeScript类型(event/community/home) + 3个API服务 + 1个Mock数据(operations.ts含3活动+5帖子+完整首页配置) + 5个页面组件(EventsList/EventEdit/CommunityPostsList/PostDetail/HomeConfig) + 修改文件(mock/index.ts + router/index.ts)。
- 关键设计模式：
  - **活动日历视图**: 列表视图 + 日历视图（CSS Grid 7列布局，展示当月活动el-tag）
  - **活动状态流转**: draft→upcoming→ongoing→past，操作按钮随状态动态显示
  - **帖子审核流程**: pending_review → published/hidden，详情页含审核按钮组
  - **首页6区块配置**: 6个el-card折叠面板，每个含动态增删列表项（heroStats/trustMetrics/entryCards/featuredRoutes/cultureHighlights/testimonials）
  - **中文频道名称**: FieldNotes→田野笔记, FoodMap→美食地图, HiddenStop→秘境停靠, CultureDesk→文化台
- 构建验证：vue-tsc 零类型错误 + vite build 零错误，6个stage5 chunk全部正常产出

## 2026-05-17 后端联调
- 用户要求管理后台对接真实的 NestJS 后端（运行于 `http://localhost:8000`）。
- **配置变更**：在 `admin-frontend/src/main.ts` 中去除了 mock 数据的开发环境加载，并在 `admin-frontend/vite.config.ts` 的 server 配置中添加了 proxy：将 `/api` 请求代理到 `http://localhost:8000`。
- **当前状态**：管理后台所有 API 请求现在真实对接 NestJS 接口（API base 为 `/api/admin`）。

## 2026-05-17 自动提取
- 管理后台前端开发服务器端口为 5173（若被占用，Vite 会自动尝试 5174）


## 2026-05-17 自动提取
- 用户明确要求使用真实后端数据，禁止 Mock
- 后端登录凭据：admin@lingtour.cn / LingTour2026!
- 开发环境 API 代理配置：/api/admin/auth/* → localhost:8000/api/v1/auth/*；/api/admin/* → localhost:8000/api/v1/admin/*
- 登录表单字段使用 email 而非 username
- 已禁用 Mock 数据导入（注释 main.ts 中的 import('./mock')）
- 数据类型适配后端响应格式（AdminUser 含 id/accountId/email/name/role；LoginResponse 含 access_token/user）

## 2026-05-21 P0 审计修复
- **全量审计完成**：审计报告保存至 `outputs/admin-audit-report.md`，评分 API 75%/字段 70%/操控性 60%/规范性 65%
- **P0 修复已完成**（6项全部通过 vue-tsc + vite build 零错误）：
  1. **后端订单写端点**：在 NestJS `api/src/modules/orders/` 新增 3 个 PATCH 端点（status/ship/refund），含状态流转校验、DTO 验证、entity 新增 updatedAt/trackingNo/refundReason 列
  2. **Interpreter 字段类型**：`InterpreterFormData.name/language/city` 从 `string` 改为 `I18nObject`，InterpreterEdit.vue 改用 `<I18nInput>` + `toI18n()` 加载
  3. **ServiceMode.price 类型**：从 `string` 改为 `I18nObject`，ServiceModeEdit.vue 改用 `<I18nInput>`
  4. **Booking 状态保留**：`BookingStatus` 扩展为 8 种（new/read/contacted/confirmed/completed/cancelled/deposit_pending/deposit_paid），删除 normalizeBooking 中的状态合并逻辑
  5. **表单校验**：RouteEdit/CityEdit/ProductEdit/EventEdit 均添加 `:rules` + `formRef.validate()`，slug 含 kebab-case 正则校验
  6. **关联字段下拉**：RouteEdit.citySlugs 和 HomeConfig.featuredRoutes 从裸文本 tag-input 改为 `el-select multiple filterable`，onMounted 加载选项列表
- **待后续处理**（P1/P2）：双语字段统一删除 xxxEn 冗余、全局 formatDate、AdminTable 抽象、日历视图全月加载等
