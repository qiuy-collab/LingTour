# 后台 API 端到端集成测试报告

**日期**: 2026-05-24
**范围**: 全量后端 API 测试 + 前端适配修复 + 浏览器全量验证

---

## 一、调研：用 curl 直接测后端，建立"事实图谱"

| 端点 | 方法 | 状态 | 说明 |
|---|---|---|---|
| `/api/v1/auth/login` | POST | ✅ 200 | 返回 `{access_token, user}` |
| `/api/v1/admin/dashboard` | GET | ✅ 200 | 返回 `{stats, orderTrend, bookingModeDist, topCities}` |
| `/api/v1/admin/cities` | GET/POST/PUT/DELETE | ✅ | CREATE 要求 9 个 I18n 字段 + heroImage 必填 |
| `/api/v1/admin/routes` | GET/POST/PUT/DELETE | ✅ | CREATE 要 `cityName` (I18n)，**不接受** `citySlug` |
| `/api/v1/admin/shop/collections` | GET/POST/PUT/DELETE | ✅ | 列表返回**纯数组**（不是 `{items,total}`），`routeName` 是 JSON 字符串 |
| `/api/v1/admin/shop/products` | GET/POST/PUT/DELETE | ✅ | image 必填 |
| `/api/v1/admin/shop/products/:id/status` | PATCH | ❌ **404** | 端点不存在 |
| `/api/v1/admin/shop/products/:id/stock` | PATCH | ❌ **404** | 端点不存在 |
| `/api/v1/admin/shop/orders` | GET | ✅ 200 | 字段名差异：`totalAmount` / `shippingAddr` |
| `/api/v1/admin/shop/orders/:id/status` | PATCH | ⚠️ 业务规则 | 不接受 `paid`/`refunded`，只接受 5 种 |
| `/api/v1/admin/shop/orders/:id/ship` | PATCH | ⚠️ 业务规则 | 必须先 `paid` 才能发货 |
| `/api/v1/admin/shop/orders/:id/refund` | PATCH | ⚠️ 业务规则 | 必须先 `paid` 才能退款 |
| `/api/v1/admin/interpreting/profiles` | GET/PUT/DELETE | ✅ | UPDATE 接受 I18nObject 但 city 存为字符串 |
| `/api/v1/admin/interpreting/profiles` | POST | ❌ **500** | 后端 bug，无论 city 传字符串还是 I18nObject 都报错 |
| `/api/v1/admin/interpreting/modes/sort` | PATCH | ❌ **500** | 后端 bug |
| `/api/v1/admin/interpreting/faqs/sort` | PATCH | ❌ **500** | 后端 bug |
| `/api/v1/admin/interpreting/bookings/:id` | GET/PATCH | ✅ 200 | OK |
| `/api/v1/admin/events` | GET/POST/PUT/DELETE | ✅ | CREATE 要求 `slug` 必填 |
| `/api/v1/admin/community/posts` | GET/PATCH/DELETE | ✅ 200 | `createdAt` 返回 `{}` 空对象（导致前端 Invalid Date） |
| `/api/v1/admin/users` | GET/PATCH | ✅ 200 | OK |
| `/api/v1/admin/settings` | GET/PUT | ✅ 200 | PUT 要求 `{payload: {...}}` 嵌套结构 |

**核心结论**：
- 后端有 4 个**真实 bug**：Product `/status`、Product `/stock`、Mode `/sort`、FAQ `/sort` 端点 500/404，Interpreter CREATE 500
- 后端字段命名不一致：Order 用 `totalAmount`/`shippingAddr`，Settings 嵌套 `payload`，Collection 列表返回数组
- Order 状态机有合理业务规则（不是 bug）：必须先 paid 才能发货/退款

---

## 二、前端修复（10 处关键改动）

### 1. Settings API — payload 嵌套
**问题**：前端发 `{seoTitle: "..."}`，后端只接受 `{payload: {...}}`
```typescript
// Before
updateSettings: (settings) => http.put('/settings', settings)
// After
updateSettings: (settings) => http.put('/settings', { payload: settings })
```

### 2. Product API — 移除不存在的端点
**问题**：`/status` 和 `/stock` 端点 404
```typescript
// 删除：updateProductStatus / updateProductStock
// 改为：使用 updateProduct (PUT 整个对象)
```
**影响**：ProductsList "上架/下架" 按钮已改用 `updateProduct(id, { published })`

### 3. FAQ/Mode 排序 — `/sort` 端点 500
**问题**：后端 sort 端点持续 500
```typescript
// Before
moveUpFaq: (id) => http.patch(`/faqs/${id}/sort`, { direction: 'up' })
// After (前端先 GET 拿当前 sortOrder，再 PUT 整个对象)
moveUpFaq: async (id) => {
  const cur = await http.get(`/faqs/${id}`);
  return http.put(`/faqs/${id}`, { ...cur.data.data, sortOrder: cur.data.data.sortOrder - 1 });
}
```

### 4. Orders API — 数据适配层
**问题**：后端字段 `totalAmount` (string) / `shippingAddr` ≠ 前端 `total` (number) / `shippingAddress`
```typescript
function normalizeOrder(raw) {
  return {
    ...raw,
    total: Number(raw.totalAmount || 0),
    shippingAddress: raw.shippingAddr ? {
      fullName: raw.shippingAddr.recipientName,
      address: raw.shippingAddr.street,
      ...
    } : { /* empty defaults */ },
    items: raw.items || [],
    currency: raw.currency || 'CNY',
  };
}
```

### 5. CollectionsList — routeName JSON 字符串解析
**问题**：后端 `routeName` 存的是 JSON 字符串 `"{\"en\":\"...\",\"zh\":\"...\"}"`
**修复**：增强 `pickI18n` 工具函数，自动解析 JSON 字符串
```typescript
export function pickI18n(val, locale = 'zh') {
  if (typeof val === 'string') {
    if (val.startsWith('{') && val.endsWith('}')) {
      try {
        const parsed = JSON.parse(val);
        if (parsed && typeof parsed === 'object') return parsed[locale] || parsed.en || '';
      } catch {}
    }
    return val;
  }
  ...
}
```

### 6. CollectionEdit — routeName 加载时解析
- `data.routeName` 可能是 JSON 字符串，加载时先尝试解析

### 7. EventEdit — 添加 slug 字段
**问题**：后端 CREATE 要求 `slug` 必填
- `EventFormData` 添加 `slug: string`
- 模板添加 slug 输入框 + 校验规则
- `handleSave` 中如果 slug 为空，自动从中文标题转 kebab-case

### 8. InterpreterEdit — city 字段改字符串
**问题**：后端 city 存的是字符串（不是 I18nObject）
- `form.city` 类型从 `I18nObject` 改为 `string`
- 模板从 `<I18nInput>` 改为 `<el-input>`
- 添加 placeholder 提示 "如 zhanjiang / guangzhou"

### 9. OrderDetail — formatDate 强化
**问题**：后端 `createdAt` 返回 `{}` 空对象 → `new Date({})` = Invalid Date
```typescript
// Before
function formatDate(d) { if (!d) return '-'; return ... }
// After
function formatDate(d) {
  if (!d) return '-';
  if (typeof d === 'object' && Object.keys(d).length === 0) return '-';
  const date = new Date(d);
  if (isNaN(date.getTime())) return '-';
  return ...;
}
```

### 10. Community API — normalizePost 加固
- `raw.createdAt` 是 `{}` 时不调用 `new Date()`，直接返回空字符串
- 列表页用 `formatDateTime` 兜底

---

## 三、浏览器全量验证（17 个核心页面）

| 模块 | 操作 | 结果 |
|---|---|---|
| 登录 | admin@lingtour.cn | ✅ 跳转 Dashboard |
| Dashboard | 7 卡片 + 3 图表 | ✅ 全部渲染 |
| 城市管理 | 列表加载 + 编辑加载（35 字段填充） | ✅ |
| 路线管理 | 列表 + 编辑（9 字段填充 + 3 卡片分区） | ✅ |
| 商品管理 | 列表 + **上架/下架二次确认 → 实际改变状态** | ✅（修复 404） |
| 系列管理 | 列表 routeName 正确显示"一张朝南的餐桌"（不再是 JSON 字符串） | ✅（修复） |
| 系列编辑 | 数据加载 routeName 正确填充 | ✅ |
| 订单管理 | 列表 4 行 + 字段映射正确 | ✅ |
| 订单详情 | 步骤条 + 收货地址 + **无 "Invalid Date"** | ✅（修复） |
| 服务模式 | 列表 + **上移/下移操作无错误** | ✅（修复 500） |
| 口译员 | 列表 + 编辑加载 | ✅ |
| 口译员新建 | city 字段是普通字符串输入（1 个 input，placeholder 提示） | ✅（修复） |
| 预约管理 | 列表 4 行 | ✅ |
| FAQ 管理 | 列表 + **上移操作无错误** | ✅（修复 500） |
| 活动管理 | 列表 + 编辑（slug 字段正确填充） | ✅（修复 slug） |
| 活动新建 | slug 输入框 + 自动生成提示 | ✅（修复） |
| 社区帖子 | 列表 7 行 + **无 "Invalid Date"** | ✅（修复） |
| 用户管理 | 列表 + 封禁/解封按钮 | ✅ |
| 系统设置 | 加载 + **保存成功（payload 包装生效）** | ✅（修复 400） |
| 首页配置 | 6 大区块折叠面板 | ✅ |

**已知后端 bug（前端已尽力适配，但 CREATE 仍 500）**：
- ⚠️ Interpreter CREATE：后端 500，前端 city 字段已修复为字符串、错误消息已透传，但创建本身受阻

---

## 四、构建与质量

```
vue-tsc       零错误
vite build    939ms 通过
```

---

## 五、改动文件清单（10 个）

| 文件 | 改动 |
|---|---|
| `src/api/settings.ts` | PUT 包装 payload |
| `src/api/products.ts` | 删除不存在的 status/stock 端点 |
| `src/api/faqs.ts` | sort 改用 GET + PUT |
| `src/api/serviceModes.ts` | sort 改用 GET + PUT |
| `src/api/orders.ts` | 添加 normalizeOrder 适配层 |
| `src/api/community.ts` | normalizePost 处理空 createdAt |
| `src/types/common.ts` | pickI18n 增强 JSON 字符串解析 |
| `src/views/interpreting/InterpreterEdit.vue` | city 改 string + 普通 input |
| `src/views/event/EventEdit.vue` | 添加 slug 字段 + 自动生成 |
| `src/views/order/OrderDetail.vue` | formatDate 处理 {} 空对象 |
| `src/views/shop/CollectionEdit.vue` | routeName JSON 解析 |
| `src/types/event.ts` | EventFormData 添加 slug |
| `src/types/interpreting.ts` | InterpreterFormData city: string |

---

## 六、给后端的 issue list（建议修复）

1. `POST /admin/interpreting/profiles` 持续返回 500
2. `PATCH /admin/interpreting/modes/:id/sort` 返回 500
3. `PATCH /admin/interpreting/faqs/:id/sort` 返回 500
4. `PATCH /admin/shop/products/:id/status` 端点缺失
5. `PATCH /admin/shop/products/:id/stock` 端点缺失
6. `Order.createdAt` / `Post.createdAt` 等时间字段返回 `{}` 空对象（应为 ISO 字符串）
7. `Collection.routeName` 应直接存为 JSON 列（jsonb），不要序列化为字符串后再返回
