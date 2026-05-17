# Data/API Mapper 扩展总结

## 任务范围

本阶段基于 `project.md` 阶段 7，以及 Home / Routes / Route Detail / Culture / Interpreting / Posts 前序页面闭环，继续把前端页面已经使用的字段沉淀为稳定数据模型，并增强 API mapper 对旧后端数据、蛇形字段、JSON 字符串字段、逗号分隔字段的兼容能力。

## 已确认/补强的数据模型

### 1. StoryRoute 与 Route Stop

核心文件：

- `site/src/data/routes.ts`
- `site/src/data/zh/routes.ts`
- `site/src/lib/api-data.ts`

`StoryRoute` 已具备：

- `region`
- `subregion?`
- `eventTags`
- `polyline?: [number, number][]`
- `allowPosts`
- `citySlugs`

`StoryRouteStop` 已具备：

- `id?`
- `nodeLabel?`
- `arrangements?: RouteStopArrangement[]`
- `links?: RoutePlaceLink[]`
- `meal?` / `hotel?` / `transit?`
- `lat` / `lng`

本次重点增强了 `site/src/lib/api-data.ts` 的 `mapRoute()`：

- 同时兼容 camelCase 与 snake_case 字段：`cultureTag/culture_tag`、`cityName/city_name`、`citySlugs/city_slugs`、`routeCityLinks/route_city_links`、`allowPosts/allow_posts`、`eventTags/event_tags`。
- `details` 支持数组、JSON 字符串、逗号分隔字符串。
- stop 坐标支持 `lng`、`lon`、`longitude`。
- `arrangements` 和 `links` 支持数组或 JSON 字符串。
- `allowPosts` 支持 boolean、`"true"/"false"`、`1/0`、`yes/no`。
- `polyline` 支持 `[lng, lat][]`、对象数组、JSON 字符串；缺失时回退到 stop 坐标直线连接。
- `culture` 做白名单归一化，未知值回退 `Coastal`，避免页面因后端 taxonomy 未统一而报错。

### 2. GuangdongEvent

核心文件：

- `site/src/data/events.ts`
- `site/src/lib/api-data.ts`

`GuangdongEvent` 已具备：

- `id`
- `title`
- `citySlug`
- `cityName`
- `region`
- `category`
- `startDate` / `endDate`
- `summary`
- `image`
- `relatedRouteSlugs`
- `eventTags`
- `recommendedWindow`
- `source?: "static" | "api"`

本次增强：

- `related_route_slugs` / `event_tags` 支持数组、JSON 字符串、逗号分隔字符串。
- `category` 做白名单归一化，未知值回退 `seasonal`。
- `/public/events` 与 `/public/routes/:slug/events` 失败或空数据时继续回退到 `getGuangdongEvents(locale)` 静态数据。

### 3. RoutePost / RouteComment / CommunityUser

核心文件：

- `site/src/data/community.ts`
- `site/src/lib/api-data.ts`

`RoutePost` 已具备：

- 用户、路线、订单字段：`userId`、`routeSlug`、`bookingId?`
- 内容字段：`title`、`excerpt`、`content`、`image`、`images`
- 筛选字段：`city`、`tags`、`eventTags`
- 展示字段：`publishedAt`、`readingMinutes`、`likes`、`featured`
- 权限/溯源字段：`bookingStatus`、`source`

`RouteComment` 已具备：

- `routeSlug`
- `userId?`
- `bookingId?`
- `author`
- `rating?`
- `content`
- `createdAt`
- `bookingStatus`
- `source`

本次增强：

- `tags`、`eventTags/event_tags` 支持数组、JSON 字符串、逗号分隔字符串。
- `bookingStatus/booking_status` 做 verified 状态白名单归一化，只接受 `paid` / `confirmed` / `completed`，未知值回退 `confirmed`。
- `/public/posts`、`/public/routes/:slug/posts`、`/public/routes/:slug/comments`、`/users/:userId/posts` 失败时继续回退静态种子数据，保证 Posts 与 Route Detail 社区区块空/旧数据安全。

### 4. InterpretingPackage / InterpreterLevel / InterpreterProfile

核心文件：

- `site/src/data/interpreting.ts`
- `site/src/lib/api-data.ts`
- `site/src/app/interpreting/page.tsx`

已沉淀类型：

- `InterpretingPackage`
- `InterpreterLevel`
- `InterpreterProfile`
- `BookingPriceSnapshot`
- `InterpretingBookingPayload`

本次增强：

- `base_price`、`level_price`、`service_count` 支持 number 或数字字符串。
- `recommended_for_routes` 支持 boolean、`"true"/"false"`、`1/0`。
- `includes`、`helps`、`event_tags` 支持数组、JSON 字符串、逗号分隔字符串。
- `sort_order` 支持 number 或数字字符串。
- `/public/interpreting` 若缺少 `packages` 或 `levels`，继续回退 `scenePackages` / `interpreterLevels`。

## Mock / fallback 策略

当前后端可能尚未完全提供 events、posts/comments、interpreting packages/levels、route stop arrangements 等字段，因此采取以下策略：

1. **API 优先**：如果接口返回有效数据，mapper 统一归一化为前端类型。
2. **旧字段兼容**：camelCase、snake_case、JSON 字符串、逗号分隔字符串均尽量兼容。
3. **静态种子回退**：接口失败或关键列表为空时，回退：
   - routes：`storyRoutes` / `zhStoryRoutes`
   - events：`getGuangdongEvents(locale)`
   - community：`routePosts` / `routeComments`
   - interpreting：`scenePackages` / `interpreterLevels`
4. **页面安全默认值**：标题、图片、内容、标签、坐标、权限状态全部给默认值，避免空字段导致页面崩溃。

## 最终后端 API 字段需求

### Routes

建议 `/public/routes` 与 `/public/routes/:slug` 最终返回：

- `slug`
- `title`
- `culture` 或 `cultureTag`
- `cityName`
- `citySlugs`
- `region`
- `subregion`
- `eventTags`
- `polyline?: [lng, lat][]`
- `allowPosts`
- `duration`
- `audience`
- `summary`
- `story`
- `coverImage`
- `stops[]`：包含 `id`、`nodeLabel`、`time`、`stopName`、`plan`、`story`、`details`、`culturalStory`、`lat`、`lng`、`meal`、`hotel`、`transit`、`arrangements[]`、`links[]`

### Events

建议新增或完善：

- `GET /public/events`
- `GET /public/routes/:slug/events`

字段：`id`、`title`、`citySlug`、`cityName`、`region`、`category`、`startDate`、`endDate`、`summary`、`image`、`relatedRouteSlugs`、`eventTags`、`recommendedWindow`。

### Community

建议新增或完善：

- `GET /public/posts`
- `GET /public/routes/:slug/posts`
- `GET /public/routes/:slug/comments`
- `POST /me/posts`
- `POST /me/routes/:slug/comments`
- `GET /users/:userId/posts`
- `GET /me/bookings?routeSlug=xxx`

安全要求：发布 post/comment 必须由后端校验当前用户 booking 与 `routeSlug` 匹配，且订单状态为 `paid` / `confirmed` / `completed`。前端隐藏按钮只做 UX，不是安全边界。

### Interpreting

建议 `/public/interpreting` 增加：

- `packages[]`
- `levels[]`
- `profiles[]` 中补 `levelId`、`serviceCount`、`languages[]`

Booking 创建接口建议接收：

- `packageId`
- `levelId`
- `profileId?`
- `routeSlug?`
- `groupSize`
- `serviceDate`
- `city`
- `language`
- `contact`
- `notes?`

后端必须重新计算价格并保存 `BookingPriceSnapshot`，不能信任前端 `estimatedPrice`。

## 验证结果

已执行：

```bash
"E:/workspace/LingTour/site/node_modules/.bin/tsc" --noEmit -p "E:/workspace/LingTour/site/tsconfig.json"
```

结果：通过。

已执行：

```bash
npm --prefix "E:/workspace/LingTour/site" run lint -- "E:/workspace/LingTour/site/src/lib/api-data.ts" "E:/workspace/LingTour/site/src/data/routes.ts" "E:/workspace/LingTour/site/src/data/events.ts" "E:/workspace/LingTour/site/src/data/community.ts" "E:/workspace/LingTour/site/src/data/interpreting.ts"
```

结果：通过。

## 后续建议

1. Polish 阶段继续检查页面在真实空数据、单条数据、多条数据下的响应式表现。
2. Final QA 阶段用真实浏览器走：Home event → Routes event/culture/region filter → Route Detail → Interpreting booking → Route Community → Posts filter。
3. 后端实施 Community 时优先做订单锁定安全校验，避免前端假权限变成真实权限漏洞。
4. 后端实施 Interpreting booking 时优先做服务端价格重算与 price snapshot。