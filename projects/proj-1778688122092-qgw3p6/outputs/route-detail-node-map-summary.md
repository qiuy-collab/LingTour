# 重构路线详情页：节点索引地图与安排详情 — 执行总结

## 本次参考

- `project.md`：阶段 4「路线详情页重构为节点索引 + 地图 + 社区」
- `docs/routes-interaction-flow.md`：详情页原则：进入 `/routes/[slug]` 后地图不能消失，节点作为内容索引
- `outputs/routes-map-explorer-summary.md`：承接 Routes 地图探索页的 stop 坐标、polyline 与 Home 活动导流闭环
- `outputs/design-system-foundation-summary.md`：复用 `shopify-page-flow`、`route-map-panel`、`community-card`、`conversion-panel`、统一 CTA 和高端卡片体系

## 已调整 / 确认文件

1. `site/src/app/routes/[slug]/RouteDetailClient.tsx`
   - 详情页已切换为 `shopify-page-flow`，保留 `IntroHero` 作为沉浸式开场。
   - Hero 下增加 sticky route overview：展示时长、城市、节点数、适合人群，并提供 `Book this route`、`Traveler notes`、`Back to map` CTA。
   - 页面主体采用桌面端左右结构：左侧 sticky 地图 + 节点索引，右侧节点内容；移动端自然降级为小地图 + 横向节点索引 + 内容流。
   - 使用 `IntersectionObserver` 监听节点内容滚动，同步 `activeStopIndex`，修正 observer 索引逻辑，避免过滤空 ref 后索引错位。
   - 城市关联卡片改用 `next/image`，减少 route detail 相关 lint warning。

2. `site/src/components/routes/RoutePolylineMap.tsx`
   - 展示当前路线 polyline，并用广东 SVG 城市边界作为背景。
   - 每个 stop 使用 `lat/lng` 投影为地图节点；点击节点可滚动到对应节点内容。
   - 当前节点有高亮圈、编号和节点标题；滚动内容时地图当前节点同步高亮。
   - 坐标判断逻辑为 `typeof lat/lng === "number"`，避免未来 0 坐标被误判为无坐标。

3. `site/src/components/routes/RouteNodeIndex.tsx`
   - 节点索引组件：Stop 01/02/03 以卡片化目录呈现。
   - 桌面端作为左侧 sticky 列表，移动端横向滚动，点击后跳转到对应节点。
   - 当前 active 节点通过金色边框和浅金背景高亮。

4. `site/src/components/routes/RouteNodeArrangement.tsx`
   - 每个节点固定展示：节点图片、时间、节点名、One-line brief、Cultural story、Today’s arrangement、Related places。
   - Related places 第一版根据现有 stop 字段生成：Attraction、Food、Hotel、Transit、Map。
   - 地点链接当前用 Google Maps/search URL 作为可点击定位入口；后续 Data/API 阶段可替换为结构化 `arrangements` 与官方链接。
   - 节点图片使用 `next/image`，并设置 `sizes` 与首节点 `priority`。

5. `site/src/components/routes/RouteCommunitySection.tsx`
   - 详情页底部加入路线级 Traveler notes / comments 区块。
   - 第一版明确采用 route-level posts/comments，不做 node-level 评论，避免业务模型过早复杂化。
   - 展示三种评论权限状态：未登录、已登录但未预订、已预订本路线。
   - 预约链接为 `/interpreting?route=${route.slug}#booking`，便于后续口译页预填路线。
   - 明确安全说明：前端状态只做 UX，真实评论权限必须由后端基于 paid / confirmed / completed 订单校验。

## 已实现的用户流程

1. 用户从 `/routes` 预览状态进入 `/routes/[slug]`。
2. 详情页先看到沉浸 Hero，再看到 sticky route overview 与 CTA。
3. 用户进入节点阅读区后，左侧地图持续保留，不会在详情页消失。
4. 用户点击地图节点或节点索引，页面滚动到对应节点内容。
5. 用户滚动节点内容时，左侧地图和节点索引自动同步当前 active stop。
6. 每个节点展示故事、安排和地点链接，降低长文滚动的信息负担。
7. 节点内容后展示 route-level Traveler notes / comment 权限状态，用社区背书推动预订。
8. 页面底部通过 conversion panel 和移动端 sticky action 继续引导预约口译或返回路线地图。

## 验证情况

- 已运行本次 Route Detail 相关文件 ESLint：
  - `npm --prefix "E:/workspace/LingTour/site" run lint -- "E:/workspace/LingTour/site/src/app/routes/[slug]/RouteDetailClient.tsx" "E:/workspace/LingTour/site/src/components/routes/RoutePolylineMap.tsx" "E:/workspace/LingTour/site/src/components/routes/RouteNodeIndex.tsx" "E:/workspace/LingTour/site/src/components/routes/RouteNodeArrangement.tsx" "E:/workspace/LingTour/site/src/components/routes/RouteCommunitySection.tsx"`
  - 结果：通过，无 error / warning。
- 已运行 TypeScript 项目检查：
  - `"E:/workspace/LingTour/site/node_modules/.bin/tsc" --noEmit -p "E:/workspace/LingTour/site/tsconfig.json"`
  - 结果：仍被既有问题阻塞：`site/src/components/home/CultureGallery.tsx(29,25): Property 'href' does not exist on type 'CultureFeature'.`
  - 该问题已在 Home / Routes 阶段记录，不是本次 Route Detail 引入。

## 风险与后续建议

1. 当前 route stop 的地点数据仍较轻，Related places 是基于 `stop.stop`、`meal`、`hotel`、`transit` 等字段生成；Data/API 阶段应扩展 `arrangements`、`links`、`address`、`officialUrl`、`mapUrl`、`image`。
2. 当前 polyline 仍使用 stops 直线连接；后续可以在 `StoryRoute` 增加真实 `polyline` 字段，并在 `RoutePolylineMap` 中优先读取真实道路轨迹。
3. 社区区块目前是前端示意数据与权限状态展示；Posts/Community 阶段必须接入真实 posts/comments API，且评论权限必须由后端订单校验。
4. 详情页已用 `next/image` 优化本次触达图片，但外部远程图片域名需要确认 Next.js image config 是否已覆盖；如 build 阶段报 remotePatterns 问题，应在 Polish / Final QA 阶段集中处理。
5. 全量 TypeScript 仍被既有 `CultureGallery.tsx` 类型问题阻塞，建议在下一阶段 Culture 重构时修复。
