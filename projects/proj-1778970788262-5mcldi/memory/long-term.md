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
- 完整重写 7 个阶段任务的描述，补全验收标准、浏览器验证步骤、前置阅读指令、5分钟等待机制。

## 2026-05-17 阶段一至阶段七完成
- 阶段一：Vue 3 + Vite + Element Plus + TS 骨架（18 文件）
- 阶段二：城市/路线（含 sections / stops 嵌套编辑）
- 阶段三：商城系列/商品（含 originTrace）/订单（el-steps 状态流转）
- 阶段四：服务模式/口译员/预约/FAQ
- 阶段五：活动/社区帖子/首页配置
- 阶段六：Dashboard/用户/系统设置
- 阶段七：全量功能测试 → outputs/test-report.md

## 2026-05-17 后端联调
- 接入真实 NestJS 后端 (localhost:8000)
- 禁用 Mock，main.ts 注释 import('./mock')
- 代理：/api/admin/auth/* → /api/v1/auth/*；/api/admin/* → /api/v1/admin/*
- 后端登录凭据：admin@lingtour.cn / LingTour2026!

## 2026-05-21 P0 审计修复（6 项）
- 后端补订单写端点 PATCH status/ship/refund
- Interpreter/ServiceMode 字段改 I18nObject
- Booking 状态保留 8 种
- 关键编辑页加 :rules + slug kebab-case
- 关联字段改 el-select 下拉

## 2026-05-24 数据完整性 + 操作流程优化
- **解决 P0 修复后留存的两类回归 bug**：
  1. InterpretersList/BookingsList 直接 row.name 渲染 I18nObject → `[object Object]`，已改 pickI18n
  2. Settings "默认语言" 误绑 defaultCurrency，已新增 defaultLocale 字段并独立绑定
- **新增 utils/format.ts**：formatDate/formatDateTime/formatMoney/truncate，兜底空对象 `{}` 显示
- **ImageUpload 加鉴权**：:headers 注入 Bearer token + Loading 状态 + 失败具体消息
- **Dashboard yAxis 动态化**：max 从硬编码 15 改为根据数据 Math.max(5, ceil((max+1)/5)*5)
- **路由守卫加固**：未登录跳 /login 带 redirect query；角色不足拒绝（不再放行到 dashboard）
- **15 个列表页统一标准化**
- **RouteEdit 经纬度范围校验**
- **构建验证**：vue-tsc 零错误 + vite build 998ms 通过
- **浏览器验证**：14 个核心页面访问正常

## 2026-05-24 编辑表单 UI/UX 全面优化
- 4 个旧版编辑器完整重写（CollectionEdit/FAQEdit/InterpreterEdit/ServiceModeEdit）
- 新建 utils/i18n.ts
- 9 个编辑器外观统一
- 构建：vue-tsc 零错误 + vite build 1.06s

## 2026-05-24 后台 API 端到端集成测试 + 修复
- 用 curl 直接打后端 21 个端点，建立"事实图谱"
- 4 个真实后端 bug（POST interpreter 500、sort 500×2、product status/stock 404）
- 前端 10 处关键修复（Settings payload 包装、Product PUT、FAQ/Mode 排序绕过、Orders 适配层、pickI18n JSON 解析、EventEdit slug、InterpreterEdit city 改 string、formatDate 兜底）
- 浏览器验证 17 页面全部通过
- 构建：vue-tsc 零错误 + vite build 939ms

## 2026-05-24 城市 Sections 编辑功能修复
- **根因**：后端 `cities.service.ts` 的 `Object.assign(city, dto)` 把 sections 赋给 city 后，`save(City, city)` 因 cascade 尝试 INSERT 无 id 的 sections，与数据库中已有 sections 冲突 → 500
- **后端修复**：在 save 前 `delete (city as any).sections`，阻止级联保存，sections 由后续 delete-and-recreate 逻辑正确处理
- **前端修复**：CityEdit.vue 移除所有只读限制（alert、只读标签、禁用按钮、死代码）
- **验证**：curl 测试 edit/add/delete/reorder 全部 200；浏览器保存成功并持久化
- **产出**：`outputs/city-sections-fix-report.md`
