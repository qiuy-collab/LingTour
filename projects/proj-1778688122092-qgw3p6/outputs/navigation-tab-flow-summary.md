# 重构全站导航 Tab：页面闭环与转化路径 — 执行总结

## 本次参考

- `docs/navigation-tab-flow.md`：全站入口应从“功能罗列”转为“用户意图入口”。
- `project.md`：路线、文化、口译、社区需要形成商业闭环。
- 已完成页面产物：Home、Routes、Route Detail、Culture、Interpreting、Posts/Community 的输出总结。

## 已调整 / 校准文件

1. `site/src/data/navigation.ts`
   - 一级导航顺序已校准为：`Home → Routes → Culture → Interpreting → Traveler Notes`。
   - `Store` 与 `About` 保留为次级导航，不再打断“路线探索 → 文化种草 → 服务加购 → 社区背书”的主链路。

2. `site/src/components/layout/SiteHeader.tsx`
   - 桌面端左侧主导航只展示五个核心入口：Home、Routes、Culture、Interpreting、Traveler Notes。
   - 右侧保留 Store / About / Account / Language，作为次级入口。
   - 顶部强 CTA 使用 `Plan a route` 并指向 `/routes`，避免用户还没选择路线就直接进入预约。
   - 移动端同样保留 `Plan a route` 主 CTA，避免窄屏导航拥挤。

3. `site/src/components/layout/SiteFooter.tsx`
   - Footer 主导航区只列出 Routes、Culture、Interpreting、Traveler Notes。
   - Store / About 不混入主旅程栏目，降低底部信息噪音。

4. `site/src/components/layout/RoutesMegaMenu.tsx`
   - Routes mega menu 继续作为地图探索增强入口。
   - 对暂无 route 的 region，链接落到 `/routes?region=...`，保留区域意图。

5. `site/src/app/page.tsx`
   - Home Traveler Notes 卡片已统一使用当前真实社区锚点 `#route-community`。

6. `site/src/app/routes/page.tsx`
   - `/routes` 除承接 `/routes?event=xxx` 外，也承接 `/routes?culture=...`、`/routes?theme=...`、`/routes?region=...`。
   - Hero 会显示来源上下文：活动、文化主题或地区索引。
   - 当前阶段先做导航语义承接；真实多路线筛选交给后续 Data/API 模型化阶段。

7. `site/src/app/posts/page.tsx`
   - 已读取 URL query 初始化筛选：`route`、`city` / `region`、`culture` / `theme` / `tag`、`event`。
   - 支持 Culture → `/posts?culture=...`、Route Detail → `/posts?route=...` 等链路进入后保持筛选语义。
   - 筛选匹配已做大小写兼容。

8. `site/src/data/routes.ts`、`site/src/data/zh/routes.ts`、`site/src/lib/api-data.ts`
   - 验证时发现 Data/API 前置改动造成 TypeScript 兼容问题：中文 route seed 与 API mapper 缺少 `region`、`eventTags`、`allowPosts`、stop fallbacks 等字段。
   - 已补齐中文 route 的 route-level 字段与 stop fallback 映射。
   - 已让 API mapper 对 `region`、`subregion`、`eventTags`、`polyline`、`allowPosts` 做空值兼容，并复用 `createStopFallbacks()` 生成 `id`、`nodeLabel`、`arrangements`、`links`。
   - 同时清理了 `api-data.ts` 中既有 `any` 与 unused 变量，保证本轮目标文件 lint 通过。

## 校准后的核心导航路径

```text
Home
  → Routes：从地图选择路线
  → Culture：按文化主题种草
  → Interpreting：独立服务入口
  → Traveler Notes：社区背书

Culture
  → Routes?culture=... / Routes?region=...
  → Posts?culture=...
  → Interpreting?route=...#booking

Routes
  → Route Detail
  → Route Detail#route-community

Route Detail
  → Interpreting?route=...#booking
  → Posts?route=...
  → Route Community

Traveler Notes
  → Routes/[slug]#route-community
  → Users/[id]/posts
```

## 主要死链 / 断点修复

- 已确认当前代码中不再存在旧锚点 `#community`；统一使用 `#route-community`。
- 修复 `/posts?culture=...`、`/posts?route=...` 曾经只铺链接但页面不读取 query 的问题。
- 补齐 `/routes?culture=...`、`/routes?region=...` 的页面语义反馈，避免 Culture / Navigation 链接进入 Routes 后完全无上下文。
- 验证时顺手修复 route 类型扩展后暴露出的中文数据与 API mapper 兼容断点，为后续 Data/API 阶段减少阻塞。

## 仍需后续 Data/API 阶段处理

1. `/routes?culture=...&experience=...` 当前只显示来源语义，还没有按 culture / experience 做真实过滤；需要等 `StoryRoute.region`、`subregion`、`eventTags`、`cultureTags` 等字段模型化后再精确匹配。
2. `/posts?culture=coastal` 与现有静态 post tags（如 `Seafood`、`Market`）不是完全同一套 taxonomy；本阶段做大小写兼容，后续需要统一 `CultureTheme` 与 `RoutePost.tags/eventTags` 字段。
3. Routes mega menu 的 region query 使用展示标题生成，后续建议改为稳定 region slug（例如 `west`、`east`、`pearl`、`north`），并由 Routes 页面真实消费。
4. Header 右侧 Store / About 仍存在，但已作为次级入口；如果未来要进一步 Shopify 化，可给 Store 做与路线/文化内容的商品关联，而不是独立商城孤岛。

## 验证结果

已运行本次导航与兼容修复相关文件 ESLint：

```bash
npm --prefix "E:/workspace/LingTour/site" run lint -- "E:/workspace/LingTour/site/src/data/navigation.ts" "E:/workspace/LingTour/site/src/components/layout/SiteHeader.tsx" "E:/workspace/LingTour/site/src/components/layout/SiteFooter.tsx" "E:/workspace/LingTour/site/src/components/layout/RoutesMegaMenu.tsx" "E:/workspace/LingTour/site/src/app/page.tsx" "E:/workspace/LingTour/site/src/app/routes/page.tsx" "E:/workspace/LingTour/site/src/app/posts/page.tsx" "E:/workspace/LingTour/site/src/data/routes.ts" "E:/workspace/LingTour/site/src/data/zh/routes.ts" "E:/workspace/LingTour/site/src/lib/api-data.ts"
```

结果：通过。

已运行全量 TypeScript 检查：

```bash
"E:/workspace/LingTour/site/node_modules/.bin/tsc" --noEmit -p "E:/workspace/LingTour/site/tsconfig.json"
```

结果：通过。
