# 长期记忆

## 2026-05-14
- 用户偏好：希望前端重构对标 Shopify 高端独立站设计，强调精简、高级感、强视觉、清晰转化，而不是内容堆叠。
- 重要决策：已进入并完成 plan mode，形成《前端页面重构实施计划》，用户已批准计划。
- 重要范围：核心方向包括首页事件路线推荐轮播/广东活动日历、地图化路线页、节点索引式路线详情、订单锁定的 posts/comments、口译套餐化与组合价格。
- 计划文档位置：已写入项目长期计划文档，后续实施将以该文档为准，优先推进首页事件轮播/日历与 UI 设计系统统一。

## 2026-05-14 路由页交互补充
- 路线页交互方向：从"路线卡片列表"改为"地图主导 + 路线探索 + 节点索引 + 详情转化"的流程。
- 路线页应以地图为主视觉、路线为主交互，卡片只作为辅助说明，详情页承载完整内容。

## 2026-05-14 文档沉淀
- 用户要求把各页面 / Tab 的"用户操作与交互流程详情"系统写入项目 `docs/` 目录。
- 已新增文档：`docs/README.md`、`docs/home-interaction-flow.md`、`docs/routes-interaction-flow.md`、`docs/culture-interaction-flow.md`、`docs/interpreting-interaction-flow.md`、`docs/posts-community-interaction-flow.md`、`docs/navigation-tab-flow.md`。

## 2026-05-14 模块自动任务设置
- 用户要求在当前长期任务中为每个前端重构模块设置自动任务，并要求任务提示词详细、丰富、链接到 `docs/*.md` 对应文档。
- 已批量创建 11 个自动任务。

## 2026-05-14 所有阶段完成总结
- 设计系统 ✅：`globals.css` 落地 Shopify-luxury tokens、lux-card/product-card/route-map-panel/calendar-card 等基础样式。
- Home ✅：事件路线轮播 + 广东活动日历 + Traveler Notes 入口。
- Routes ✅：广东 SVG 地图 + 城市边界 + stop 直线 polyline + hover/click 高亮 + 区域筛选。
- Route Detail ✅：Sticky polyline map + 节点索引联动 + stop 故事/安排/地点链接 + 社区区块 + CTA 导流。
- Culture ✅：4 文化主题产品卡片 + 地区索引 + 体验标签 → Routes/Posts/Interpreting 导流。
- Interpreting ✅：6 Scene Packages + 3 Interpreter Levels + Price Builder（¥1,600）+ Booking Form + FAQ。
- Posts/Community ✅：Traveler Notes `/posts` + 用户主页 `/users/[id]/posts` + Route Detail `#route-community` + verified booking badges。
- Navigation ✅：一级导航 Home→Routes→Culture→Interpreting→Traveler Notes，跨页参数链路统一。
- Data/API ✅：前端类型沉淀 + api-data.ts mapper 兼容 camelCase/snake_case/fallback。
- Polish ✅：Reveal re-render 修复、next/image 迁移、any 类型警告修复。
- Final QA ✅：发现并修复 Polish regression（interpreting/page.tsx 29 个 TS 错误），全部静态门禁通过，真实浏览器 7 页验证通过，综合评分 4.4/5.0。

## 2026-05-14 Final QA 关键发现 🔴
- **Polish 阶段 Regression**：`interpreting/page.tsx` 的 `selectedPackage`/`selectedLevel`/`packageOptions`/`levelOptions`/`apiProfiles`/`estimatedPrice`/`normalizedGroupSize`/`groupAdjustment`/`faqItems` 全部缺失派生声明，导致 29 个 TypeScript 错误。已通过在 `handleSubmit` 后插入完整派生变量块修复，并恢复 `calculateInterpretingPrice` 导入。
- **价格验证通过**：`/interpreting?route=southern-sea-table#booking` → ¥1,600 = ¥1,280 (Story route companion) + ¥320 (Mid-level) + ¥0 (2人 group adjustment)。
- **跨页链路全部可用**：10 条跨页参数链路（event→routes, culture→routes/posts, route→interpreting, route→community, posts→user）全部验证通过。
- **质量门禁全部通过**：TypeScript 零错误、ESLint 核心文件零错误、Next.js build 成功、6 页渲染正常、无严重 bug/白屏/报错。
- **后续建议**：替换 picsum 占位图为真实广东摄影、补充更多路线 seed 数据、补全后端 events/posts/comments/booking API 及订单锁定校验。


## 2026-05-15 自动提取
- 项目前端技术栈：Next.js 16 (App Router) + React 19 + TypeScript 5 + Tailwind CSS 4 + Framer Motion 12 + Leaflet + React-Leaflet，无额外 UI 组件库，样式手写 Tailwind
