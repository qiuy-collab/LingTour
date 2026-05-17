# 重构路线页 Routes：地图探索与路线高亮预览 — 执行总结

## 本次参考

- `project.md`：阶段 3「路线列表页重构为地图主导」
- `docs/routes-interaction-flow.md`：路线页用户流程：看地图 → 选地区 → 看路线 → 高亮预览 → 进入详情
- `outputs/home-events-calendar-summary.md`：承接首页 `/routes?event=xxx` 与 `relatedRouteSlugs` 导流
- `outputs/design-system-foundation-summary.md`：复用 `shopify-page-flow`、`lux-page-hero`、`route-map-panel`、`product-card`、`community-card`、`conversion-panel` 等 Shopify-luxury class

## 已调整 / 新增文件

1. `site/src/app/routes/page.tsx`
   - 将 `/routes` 外层切换为 `shopify-page-flow`，从传统卡片列表页升级为地图探索页。
   - 第一屏改为强视觉 Hero：强调“从广东地图开始选择一条故事路线”。
   - 接入 `useSearchParams()` 读取 `event` 查询参数，承接首页活动模块导流。
   - 接入 `getGuangdongEvents(locale)` 并按当前路线过滤，只保留可关联路线的活动。
   - 当用户从首页活动进入 `/routes?event=xxx` 时，在 Hero 显示“来自首页活动”的上下文提示，并把初始路线/区域传给地图组件。
   - 保留无路线空状态，引导用户预约定制支持。

2. `site/src/components/routes/RouteExplorerMap.tsx`
   - 新增地图主导路线探索组件。
   - 复用 `site/src/lib/map-projection.ts` 的 `getMapFeatures()`、`buildProjection()`、`featureToPath()` 绘制广东城市边界。
   - 内置大区域分组：全广东、珠三角 / 广府、粤东 / 潮汕、粤西 / 海岸、粤北 / 山地客家。
   - 根据 route `citySlugs` 映射城市 adcode，高亮当前区域、含路线城市与当前选中路线城市。
   - 使用 `route.itinerary` stop 的 `lat/lng` 直接生成 SVG polyline，第一版不依赖外部地图服务。
   - 支持 hover/click 路线 polyline：当前路线高亮、其他路线变淡、节点编号和节点名称出现。
   - 支持 hover/click 右侧路线卡：同步地图高亮与预览状态。
   - 选中路线后不直接跳转，而是在底部 `conversion-panel` 显示预览、关联活动、查看详情 CTA 与收藏占位按钮。
   - 右侧路线卡只做辅助说明，地图保持页面主视觉。

## 已实现的用户流程

1. 用户进入 `/routes`，先看到地图优先的 Hero 与“打开路线地图” CTA。
2. 用户进入地图区域后，可先选择全广东 / 珠三角 / 粤东 / 粤西 / 粤北区域。
3. 区域选择后，广东 SVG 地图同步高亮相关城市，并过滤右侧路线卡。
4. 用户 hover 地图 polyline 或路线卡，当前路线高亮、其他路线降低透明度。
5. 用户 click polyline 或路线卡，进入路线预览状态，节点编号与节点名称在地图上显示。
6. 用户从预览面板点击「查看路线详情」进入 `/routes/[slug]`。
7. 用户从首页活动 CTA 进入 `/routes?event=xxx` 时，页面会默认选中活动关联路线及其区域，形成 Home → Routes 的闭环。

## 响应式与信息密度控制

- 桌面端使用地图 + 右侧 sticky 预览卡结构，路线卡为辅助，不抢地图主视觉。
- 中小屏使用单列布局，区域按钮、地图和路线卡自然堆叠，避免地图/卡片横向溢出。
- 地图节点只在当前 active route 出现，默认状态保持低信息密度。
- 选中路线后统一在底部 `conversion-panel` 呈现完整预览，避免每张卡片堆叠过多文本。

## 验证情况

- 已运行本次 Routes 相关文件 ESLint：
  - `npm --prefix "E:/workspace/LingTour/site" run lint -- "E:/workspace/LingTour/site/src/app/routes/page.tsx" "E:/workspace/LingTour/site/src/components/routes/RouteExplorerMap.tsx"`
  - 结果：通过，无输出错误。
- 已运行 TypeScript 项目检查：
  - `"E:/workspace/LingTour/site/node_modules/.bin/tsc" --noEmit -p "E:/workspace/LingTour/site/tsconfig.json"`
  - 结果：仍被既有问题阻塞：`site/src/components/home/CultureGallery.tsx(29,25): Property 'href' does not exist on type 'CultureFeature'.`
  - 该问题已在 Home 阶段记录，不是本次 Routes 地图页新增引入。

## 后续真实道路 polyline 扩展点

1. 当前 `RouteExplorerMap` 的 polyline 来自 `route.itinerary` stops 直线连接，适合作为第一版视觉探索地图。
2. 后续 Data/API 阶段可在 `StoryRoute` 增加 `polyline?: [lng, lat][]` 或编码 polyline 字段。
3. `routePolyline()` 可优先读取后端真实道路轨迹；当 `polyline` 缺失时继续回退到 stop 直线连接，保证旧数据兼容。
4. 如果后续引入 Mapbox/Leaflet，也建议保留当前 SVG 视觉地图作为高端探索页主视觉，真实道路地图用于详情页或沉浸模式。

## 风险与后续建议

1. 当前真实路线数据仍只有 `southern-sea-table` 一条，区域筛选中大部分区域会显示策展中空状态；Data/API 阶段应补充更多 route seed 数据或后端数据。
2. 当前城市名称未直接从 GeoJSON properties 展示，因为现有 `CityFeature` 类型只暴露 adcode/center；后续可扩展城市名称映射，用于 hover tooltip。
3. 「收藏路线」目前是视觉占位按钮，后续需要账号/收藏 API 支持。
4. Route Detail 阶段需继续承接：进入 `/routes/[slug]` 后地图不能消失，应使用节点索引和路线地图联动内容。