# 凌云游管理后台 — 全量审计报告

**审计日期**：2026-05-21
**审计范围**：admin-frontend (Vue 3 + TS) ↔ NestJS 后端（`/api/v1/admin/*`）
**审计维度**：①数据完整性 ②前端操控性 ③数据规范性 ④优化清单

---

## 一、整体评分

| 维度 | 评分 | 说明 |
|------|------|------|
| API 端点匹配 | 🟡 **75%** | 6 个前端调用端点后端缺失，5 个后端能力前端未接入 |
| 字段完整性 | 🟡 **70%** | 双语字段双轨混乱（`title` + `titleEn`），`Interpreter.name` 后端 jsonb 但前端 `string` |
| 前端操控性 | 🟡 **60%** | 表单校验普遍缺失，关联字段裸文本输入易拼错，列宽/筛选不全 |
| 数据规范性 | 🟡 **65%** | Booking 状态前端合并丢失信息；时间字段空对象无兜底；`status` + `published` 双源 |

---

## 二、API 端点审计（前端调用 vs 后端实际）

### 🔴 前端调用但后端缺失（404 风险）

| 模块 | 前端调用 | 影响 |
|------|---------|------|
| auth | `POST /auth/logout` | 退出登录请求 404，但前端只清 token 仍可正常退出 |
| **orders** | `PATCH /orders/:id/status` | **订单状态切换不可用** |
| **orders** | `PATCH /orders/:id/ship` | **发货按钮无效** |
| **orders** | `PATCH /orders/:id/refund` | **退款按钮无效** |
| products | `PATCH /shop/products/:id/status` | 上下架失效 |
| products | `PATCH /shop/products/:id/stock` | 库存调整失效 |

> **订单管理整个模块在后端只有 GET，写操作全缺失。** 需要后端补 OrdersService.updateStatus / ship / refund。

### 🟡 后端有但前端未接入

- `POST /admin/upload`（统一上传，前端 ImageUpload 现接其他路径）
- `GET /admin/shop/featured`、`PUT /admin/shop/featured`（首页推荐商品管理）
- `PUT /admin/interpreting/{service-modes,profiles,faqs}` 批量更新接口

### ✅ 端点正常（27 个）
所有 cities/routes/collections/products(R+C+U+D)/events/community/users/dashboard/settings/home/interpreting(modes/profiles/faqs/bookings) CRUD 路径前后端一致。

---

## 三、数据完整性审计（按模块）

### 🔴 严重问题

| 模块 | 问题 | 详情 |
|------|------|------|
| **Interpreter** | 类型矛盾 | 后端 `name/language/focus/bio/helps` 全 jsonb (I18n)，前端 `InterpreterFormData.name: string`，编辑后写回会丢 `{en,zh}` 结构 |
| **ServiceMode** | price 类型错位 | 后端 `price` 是 jsonb，前端 `string`，保存时直接覆写为字符串 |
| **Booking** | 状态合并 | 前端 `bookings.ts:23` 把后端 `new`/`deposit_pending`/`deposit_paid` 三态合并为 `pending`，**管理员无法看到"已收定金"中间态** |
| **City** | 双状态字段 | 同时存在 `published: boolean` 和 `status: draft\|published`，二者易不同步 |

### 🟡 重要问题

| 模块 | 字段冗余 |
|------|---------|
| Route | `title:any` + `titleEn:string` 双字段（应统一 I18nObject） |
| City | `name`+`nameEn`、`regionLabel`+`regionLabelEn` 等 5 对冗余 |
| Product | `name/tag/story/material/dimensions/origin/care` 7 对 `xxx`+`xxxEn` 冗余 |
| Collection | `title/body` 双字段 |
| Event | `title/summary/description` 双字段 |

### 🟢 时间字段
后端 `createdAt/updatedAt` 在 GIN 索引开启时常返回 `{}` 空对象，前端类型声明 `string`，列表展示直接 `[object Object]`。需封装 `formatDate(val)` 兜底。

---

## 四、前端操控性审计

### 🔴 严重缺陷（功能失效或会出错）

1. **`shop/ProductEdit.vue`**
   - 完全无 `:rules` 表单校验，slug/name/price/collectionId 都未必填
   - `originTrace.location/citySlug/cityName` 等嵌套对象用裸文本，无 I18nInput

2. **`routes/RouteEdit.vue`**
   - 无表单校验（slug/title/citySlug/coverImage 都未必填）
   - 经纬度无范围校验（lat: -90~90 / lng: -180~180）
   - `citySlugs` 仅文本输入，无下拉，**易拼错导致首页关联失败**

3. **`interpreting/InterpreterEdit.vue` (L19-29)**
   - `name`/`language`/`city` 用 `string`（与后端 jsonb 冲突）
   - 编辑后保存会破坏后端 I18nObject 结构

4. **`home/HomeConfig.vue`**
   - 6 大区块无排序按钮，只能删除重加
   - `featuredRoutes`/`citySlug`/`link` 是裸文本，未联动 routes/cities 下拉

5. **`shop/OrdersList.vue`**
   - `row.status='shipped'` 仅前端改值，**真后端不会改**（端点缺失）
   - 缺订单号/用户搜索框

### 🟡 重要问题

| 文件 | 问题 |
|------|------|
| `cities/CityEdit.vue` | 无 `:rules`；slug 未做 kebab-case 校验；`adcode` 默认 0 无验证 |
| `cities/CitiesList.vue` | 缺状态筛选；缺发布/下架快捷按钮；region 标签颜色硬编码 |
| `routes/RoutesList.vue` | `cityOptions` 只取当前页，分页后下拉跳变 |
| `shop/CollectionEdit.vue` | rules 仅 3 项；`routeName/routeSlug` 应做 routes 下拉而非裸输入 |
| `interpreting/InterpretersList.vue` | 缺关键字搜索；`focus`/`focusEn` 列分两行未限宽；操作列 280px 按钮挤压 |
| `interpreting/(ServiceModes\|FAQs)List.vue` | `pageSize: 999` 强行拉全量，**禁用真分页** |
| `events/EventsList.vue` | 日历视图依赖单页 list（默认 10 条），跨月数据缺失 |
| `events/EventEdit.vue` | 用 `el-input` 输 URL 而非 ImageUpload，与其他模块风格不一致 |
| `community/CommunityPostsList.vue` | 无关键字搜索；通过/隐藏审核操作无二次确认 |
| `interpreting/BookingsList.vue` | 行内 async 副作用绑定状态，多次点击会污染 drawer 选中项 |
| `users/UsersList.vue` | 分页缺 `sizes` 切换；client-side 排序仅当前页，误导 |

### 🟢 优化建议

- 全局封装 `<AdminTable>` 复用 toolbar/loading/分页/空态
- 状态 tag 颜色集中到 `types/*` ColorMap（events/users 已做，cities/routes 应统一）
- 编辑页加 `beforeRouteLeave` dirty 提示
- 统一图片字段用 `ImageUpload` 组件（EventEdit 当前用 el-input 输 URL）
- 长字段统一 `I18nMarkdownEditor`（CollectionEdit body 当前用 I18nInput textarea）
- 列宽：CommunityPostsList.title / OrdersList.items / InterpretersList.focus 加 `min-width` 或 `show-overflow-tooltip`
- HomeConfig 折叠改用 `el-collapse`

---

## 五、数据规范性审计

### 5.1 双语字段（jsonb `{en, zh}`）

| Entity | 一致性 | 说明 |
|--------|--------|------|
| City | 🟡 部分 | 后端纯 jsonb，前端类型保留 `xxxEn` 冗余字段 |
| Route | 🟡 部分 | 同上，`stops[].title/story` 等 11 字段 |
| Product | 🟡 部分 | 7 对冗余字段 |
| Collection | 🟡 部分 | `title/body` 冗余 |
| ServiceMode | 🔴 错位 | `price` 后端 jsonb，前端 string |
| **Interpreter** | 🔴 错位 | `name/language/city` 后端 jsonb，前端 string |
| Event | 🟡 部分 | `title/summary/description` 冗余字段 |
| Booking | ✅ 一致 | 全是纯字符串 |
| FAQ | 🟢 待查 | `question/answer` 后端 jsonb，前端类型需确认 |

### 5.2 状态枚举

| Entity | 后端值 | 前端值 | 一致性 |
|--------|-------|--------|-------|
| Booking | `new\|deposit_pending\|deposit_paid\|confirmed\|completed\|cancelled` | `pending\|confirmed\|completed\|cancelled` | 🔴 信息丢失 |
| Event | varchar 无约束 | `upcoming\|ongoing\|past\|draft` | 🟡 弱约束 |
| Interpreter | `active\|inactive\|pending_review` | 同 | ✅ |
| City | `published: boolean` | `published` + `status` 双字段 | 🟡 双源 |
| Route | `published: boolean` | 同 | ✅ |
| Order | `pending\|paid\|shipped\|delivered\|refunded\|cancelled` | 同 | ✅（但写操作端点缺失） |

### 5.3 关联字段

| 关联 | 前端 | 后端 | 说明 |
|------|------|------|------|
| City ↔ Route | `routeSlugs[]` / `citySlugs[]` (slug) | `route_city_links` 存 uuid | API 层做转换，运行正常 |
| City → 相关城市 | `relatedCitySlugs` (slug) | `related_city_slugs` jsonb | ✅ 一致 |
| Product → Collection | `collectionId` (uuid) | `collection_id` uuid | ✅ |
| Event → Route | `relatedRouteSlugs` | `related_route_slugs` jsonb | ✅ |
| Event → City | `citySlug` + `city` | 同 | ✅ |

### 5.4 图片字段
全部一致：`heroImage / coverImage / image / avatar / galleryImages / foodImages`，无重命名问题。

### 5.5 时间字段
后端 `@CreateDateColumn` 在带 GIN 索引时偶发返回 `{}` 空对象，前端类型声明 `string`，列表无 fallback。**需封装 formatDate**。

---

## 六、优先级修复清单

### P0 — 必须立即修复（功能失效）

1. **后端补订单写端点**：`PATCH /admin/orders/:id/status`、`/ship`、`/refund`，否则订单页所有按钮形同虚设
2. **修 Interpreter 字段类型**：将 `InterpreterFormData.name/language/city` 改为 I18nObject，避免保存破坏后端结构
3. **修 ServiceMode.price 类型**：FormData 改 I18nObject
4. **修 Booking 状态映射**：保留 `new/deposit_pending/deposit_paid` 原值，列表多一个状态列展示原始
5. **后端补商品状态/库存端点** 或前端去掉 ProductsList 的发布开关、库存按钮
6. **关键编辑页加 `:rules`**：RouteEdit / CityEdit / ProductEdit / EventEdit 必填项校验

### P1 — 数据规范化（一周内）

7. 统一双语字段：删除所有 `xxxEn` 冗余字段，改用 I18nObject 单字段
8. City 取消 `status` 字段，统一用 `published: boolean`
9. 全局 formatDate 封装兜底空对象
10. 关联字段（citySlugs / collectionId / relatedRouteSlugs）改用下拉选择器
11. ImageUpload 统一替换 EventEdit 的 el-input URL 输入

### P2 — 体验提升（按需）

12. 全局 `<AdminTable>` 抽象
13. HomeConfig 区块加排序按钮、改 `el-collapse`
14. ServiceModes/FAQs 启用真分页（去掉 pageSize:999）
15. EventsList 日历视图独立加载全月数据
16. 列表页统一加关键字搜索框
17. 编辑页加 `beforeRouteLeave` dirty 检测

---

## 七、整体结论

管理后台的**数据流和路由**已基本跑通，CRUD 列表+编辑+分页+预览齐全。但存在三类系统性问题：

1. **后端能力缺口**：订单/商品的写操作端点缺失，前端这些按钮为空架（P0）
2. **类型双轨**：双语字段 `xxx` + `xxxEn` 冗余，Interpreter/ServiceMode 字段类型与后端错位（P0/P1）
3. **校验和体验**：5 个核心编辑页无表单校验，关联字段裸文本输入易出错（P0/P1）

建议按上述优先级清单分阶段修复。本审计报告已保存至 `outputs/admin-audit-report.md`。
