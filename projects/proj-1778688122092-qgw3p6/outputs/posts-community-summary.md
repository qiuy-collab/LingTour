# 重构社区 Posts：旅行者手记与订单锁定评论 — 执行总结

## 本次参考

- `project.md`：阶段 5「帖子/评论与订单锁定业务」
- `docs/posts-community-interaction-flow.md`：全站 `/posts`、路线详情内嵌 Community、用户主页 `/users/[id]/posts` 与订单锁定流程
- `outputs/route-detail-node-map-summary.md`：Route Detail 已预留 `#route-community` 区块与 route-level posts/comments 方向
- 已完成的设计系统、Home、Routes、Culture、Interpreting 阶段产物

## 已实现 / 调整文件

1. `site/src/data/community.ts`
   - 新增/确认社区前端数据模型：`RoutePost`、`RouteComment`、`CommunityUser`、`CommunityPermissionState`。
   - 提供 `routePosts`、`routeComments`、`communityUsers` 静态数据，作为 Data/API 阶段前的 UI 种子数据。
   - 提供工具函数：`getRoutePosts()`、`getRouteComments()`、`getUserPosts()`、`getCommunityUser()`、`getRouteForPost()`、`getCommunityFilters()`。
   - `getCommunityFilters()` 已扩展返回 route / city / theme / eventTags，支撑 `/posts` 的路线、城市、文化主题、节庆/事件筛选。

2. `site/src/app/posts/page.tsx`
   - 新增/确认全站 Traveler Notes 入口页。
   - 页面定位为“真实路线体验、文化现场与旅行建议”的公开内容入口，而不是工具化 Comment 页。
   - Hero 使用 featured verified note 与路线导流卡，主 CTA 指向笔记列表与 `/routes` 地图探索。
   - 内容列表支持 route、city、theme、festival/event、sort 筛选。
   - 每张 note 卡片包含图片、作者、发布时间、阅读时长、标题、摘要、标签、关联路线与收藏数。
   - 作者头像导向 `/users/[id]/posts`，关联路线导向 `/routes/[slug]` 或 `#route-community`。
   - 增加空状态与权限说明区：明确阅读公开，发布/评论必须后端 booking 校验。
   - 增加四种发布状态展示：未登录、未预订对应路线、已预订可发布、已发布。

3. `site/src/app/users/[id]/posts/page.tsx`
   - 新增/确认用户公开笔记页。
   - 展示用户头像、昵称、位置、简介与该用户所有公开 route posts。
   - 每条 post 保持关联路线入口，用户可从个人主页回到对应路线详情的 Community 区块。
   - 无公开内容时提供空状态。

4. `site/src/components/routes/RouteCommunitySection.tsx`
   - 路线详情页内嵌 Community 区块从示意进一步靠近真实结构。
   - 使用 `getRoutePosts(route.slug)` 与 `getRouteComments(route.slug)` 展示当前路线的 verified notes/comments。
   - 权限状态从 3 类扩展为 4 类：未登录、已登录未预订、已预订本路线、已发布。
   - CTA 串联 `/posts`、`/posts?route=${route.slug}`、`/users/maya-chen/posts`、`/interpreting?route=${route.slug}#booking`。
   - 保持安全提示：前端状态只做 UX，真实权限必须由后端按 paid / confirmed / completed booking 校验，并校验 routeSlug 与 bookingId 匹配。

5. `site/src/data/navigation.ts`
   - 已存在 `Traveler Notes` 导航入口 `/posts`，本阶段确认该入口符合社区模块命名与导流要求。

## 已实现用户闭环

1. Home / Culture 可通过 `/posts` 或 `/posts?culture=...` 进入 Traveler Notes。
2. `/posts` 中用户可以按路线、城市、文化主题、节庆事件浏览公开手记。
3. 用户点击路线标签进入 `/routes/[slug]` 或对应 `#route-community`。
4. 路线详情页展示该 route 的 verified notes 与 route-level comments。
5. 用户点击作者头像进入 `/users/[id]/posts` 浏览该作者公开手记。
6. 发布/评论入口按 UX 展示未登录、未预订、已预订、已发布状态。
7. 页面文案持续强调：前端隐藏按钮不是安全边界，后端必须拒绝伪造 bookingId 或 routeSlug 不匹配请求。

## API / 后端需求

后续 Data/API 阶段应落地以下接口，并保持当前 UI 数据结构兼容：

- `GET /public/routes/:slug/posts`
- `GET /public/routes/:slug/comments`
- `POST /me/routes/:slug/comments`
- `POST /me/posts`
- `GET /users/:userId/posts`
- `GET /me/bookings?routeSlug=xxx`

核心安全规则：

```text
canComment(routeSlug) =
  user is authenticated
  + booking exists for same routeSlug
  + booking.status in paid / confirmed / completed
```

必须由后端校验：用户预订 A 路线，只能发布 / 评论 A 路线相关内容，不能通过前端伪造 routeSlug 或 bookingId 评论 B 路线。

## 验证情况

- 已运行本次社区相关文件 ESLint：
  - `npm --prefix "E:/workspace/LingTour/site" run lint -- "E:/workspace/LingTour/site/src/app/posts/page.tsx" "E:/workspace/LingTour/site/src/app/users/[id]/posts/page.tsx" "E:/workspace/LingTour/site/src/components/routes/RouteCommunitySection.tsx" "E:/workspace/LingTour/site/src/data/community.ts"`
  - 结果：通过。
- 已运行全量 TypeScript 检查：
  - `"E:/workspace/LingTour/site/node_modules/.bin/tsc" --noEmit -p "E:/workspace/LingTour/site/tsconfig.json"`
  - 结果：通过。

## 后续建议

1. Data/API 阶段将 `community.ts` 静态数据迁移到 mapper 或真实 API，保留空值兼容。
2. 后端新增 posts/comments 模块，并在 controller/service 层做订单锁定校验。
3. 若需要 post 详情页，可后续新增 `/posts/[id]`；当前第一版先以全站列表、用户页、路线详情内嵌区块形成闭环。
4. Polish 阶段应检查 `/posts` 筛选 query 参数（如 `culture`、`event`、`route`）是否需要自动预选，目前主要以 UI 筛选器承载。
