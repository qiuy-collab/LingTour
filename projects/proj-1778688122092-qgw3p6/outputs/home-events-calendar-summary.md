# 重构首页 Home：事件路线轮播与广东活动日历 — 执行总结

## 本次参考

- `project.md`：阶段 2「首页：事件路线推荐轮播 + 广东活动日历」
- `docs/home-interaction-flow.md`：首页用户流程：进入首页 → 被近期事件激发兴趣 → 浏览推荐路线 / 活动日历 → 进入路线详情或社区内容 → 形成预约 / 收藏 / 咨询转化
- `outputs/design-system-foundation-summary.md`：已完成的 Shopify-luxury 设计系统基础

## 已调整 / 新增文件

1. `site/src/app/page.tsx`
   - 将首页外层切换为 `shopify-page-flow`，统一接入第一阶段的 Shopify 高端页面节奏。
   - Hero 从“平台说明 + 预约口译”调整为“探索路线 + 查看近期活动”，让首页第一屏更像灵感入口，而不是功能堆叠页。
   - 移除首页调试 `console.log`，避免生产页面输出无关日志。
   - 接入 `getGuangdongEvents(locale)`，根据当前可用路线筛选活动，形成近期事件推荐数据。
   - 新增 Traveler Notes / 旅行者手记轻量入口，使用当前路线数据生成 3 条精选手记卡，导向 `/routes/[slug]#community`、`/posts` 与 `/routes`。
   - 将原有入口卡、口译、商店、评价、底部转化模块改用 `product-card`、`story-card`、`community-card`、`conversion-panel`、`module-header` 等统一 class。

2. `site/src/data/events.ts`
   - 新增 `GuangdongEvent` 数据模型：`id`、`title`、`citySlug`、`cityName`、`region`、`category`、`startDate`、`endDate`、`summary`、`image`、`relatedRouteSlugs`、`recommendedWindow`。
   - 新增活动分类：`festival`、`folk`、`market`、`performance`、`food`、`seasonal`，并提供中英文 label。
   - 新增近期活动样例：湛江夏季海鲜季、雷州端午龙舟水巡游、霞山港口夜市周、湖光岩火山湖清晨步道。
   - 新增工具函数：`getGuangdongEvents`、`getEventRoute`、`getRelativeEventTime`、`formatEventDateRange`。

3. `site/src/components/home/EventRoutesCarousel.tsx`
   - 新增首页“近期正在发生什么”事件路线推荐轮播。
   - 支持 activeIndex 横向切换、上一张 / 下一张、指示点切换。
   - 卡片展示倒计时（还有几天 / 约几周后 / 正在发生 / 已结束）、活动日期、活动地区、活动摘要、关联路线、推荐出行时间。
   - CTA 支持直接进入 `/routes/[slug]` 或 `/routes?event=xxx`。
   - 无近期活动或无可关联路线时提供空状态，引导用户进入 `/routes`。

4. `site/src/components/home/GuangdongEventCalendar.tsx`
   - 新增广东活动日历模块。
   - 支持月份切换、分类筛选、日历日期事件点、当月活动列表、活动详情卡。
   - 活动详情卡展示区域、时间、摘要和“查看相关路线”CTA。
   - 分类无活动时提供空状态，避免页面断层。

## 实现后的首页用户流程

1. 用户进入首页，首先看到大幅 Hero、强主张与两个核心 CTA：探索路线 / 查看近期活动。
2. 点击“查看近期活动”滚动到事件路线推荐轮播。
3. 用户通过倒计时感知近期活动窗口，左右切换活动，点击进入相关路线详情或活动筛选路线。
4. 用户继续在广东活动日历中按月份 / 分类计划出行，点击当天活动或当月列表查看详情。
5. 用户通过 Traveler Notes 看到真实体验背书，进入路线社区锚点、全站手记页或路线探索页。
6. 首页最终仍保留口译、商店、评价与底部转化模块，但信息层级更收敛，不再抢占“近期事件 → 路线转化”的主线。

## 验证情况

- 已运行 `npm --prefix E:/workspace/LingTour/site run lint`。
- 当前 lint 仍未全通过，但失败来自既有 Shop / Store / api-data 中的 `no-explicit-any`、未使用变量与 `<img>` warning 等历史问题；本次 Home 任务新增文件没有出现 `any`、`console.log` 或 TODO。
- 已尝试对本次 Home 相关文件单独执行 ESLint；从 `site` 目录执行的单文件 lint 未输出错误。
- 当前项目已有记录：这些历史 lint 问题将在 Data/API、Polish 或 Final QA 阶段统一收敛，不阻断 Home 模块继续推进。

## 未完成风险与后续建议

1. 当前活动数据为前端静态数据，后续 Data/API 阶段应迁移到 mapper 或后端 events API，并补充空值兼容。
2. 当前可关联路线只有 `southern-sea-table`，因此活动推荐均聚焦湛江；Routes 阶段和数据扩展阶段应补充更多城市 / 区域路线。
3. `/posts` 与路线详情 `#community` 目标页后续仍需 Posts / Route Detail 任务落地，否则 Traveler Notes 入口会先作为导流占位。
4. 活动日历第一版按活动开始月份归档；如后续跨月活动增多，应改成“活动日期范围与当前月份有交集”来展示。
5. 首页图片当前使用远程背景图 URL，Final QA 阶段需重点检查加载性能、移动端裁切和 LCP 表现。
