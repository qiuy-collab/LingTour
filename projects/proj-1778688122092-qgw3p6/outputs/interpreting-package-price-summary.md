# 重构 Interpreting：套餐等级组合价格与预约流程 — 执行总结

## 本次参考

- `project.md`：阶段 6「口译页套餐化与价格组合」
- `docs/interpreting-interaction-flow.md`：用户路径 `选场景套餐 → 选口译员等级 → 看组合价格 → 填写预约 → 提交需求`
- Route Detail / Culture 已形成的导流约定：`/interpreting?route=${route.slug}#booking`
- 设计系统阶段提供的 `shopify-page-flow`、`lux-page-hero`、`product-card`、`route-map-panel`、`conversion-panel`、统一 CTA 与移动端 sticky action

## 已调整文件

- `site/src/app/interpreting/page.tsx`

本阶段没有继续沿用原页面中较长的服务模式、匹配说明、流程长叙事与人员展示堆叠，而是把页面收敛为高转化预约结构：Hero、Scene Packages、Interpreter Levels、Price Builder、Booking Form、FAQ。

## 页面结构与用户流程

### 1. Hero：先告诉用户如何购买/预约

新版 Hero 聚焦一句主张：选择场景，查看报价。核心 CTA 为：

- `Choose package` → 跳到套餐卡片区；
- `Submit request` → 跳到预约表单；

如果 URL 带有 `route` 参数，例如：

```text
/interpreting?route=southern-sea-table#booking
```

页面会读取现有 routes 数据，显示 route prefilled 面板，并推荐：

- Package：`Story route companion`
- Level：`Mid-level`
- City：route.city
- Notes：自动写入“想为该路线预约口译支持”的上下文

### 2. Scene Packages：套餐卡片产品化

本次在页面内定义第一版前端套餐数据结构：

```ts
type ScenePackage = {
  id: string;
  scene: string;
  title: string;
  bestFor: string;
  duration: string;
  basePrice: number;
  includes: string[];
  recommendedForRoutes?: boolean;
};
```

当前套餐包括：

- Food market companion：¥680 / 4 hours
- Slow cultural walk：¥780 / 4 hours
- Story route companion：¥1280 / 8 hours
- Business / study support：¥1680 / 8 hours
- Half-day practical support：¥480 / 3 hours
- Festival live support：¥980 / 5 hours

用户点击套餐后，卡片高亮，并同步更新 Price Builder。

### 3. Interpreter Levels：等级与价格清晰化

本次在页面内定义第一版等级数据结构：

```ts
type InterpreterLevel = {
  id: string;
  level: string;
  label: string;
  levelPrice: number;
  languages: string;
  focus: string;
  serviceCount: number;
};
```

当前等级包括：

- Junior：日常沟通，等级加价 ¥0
- Mid-level：路线与文化解释，等级加价 ¥320
- Senior：商务 / 研学 / 复杂场景，等级加价 ¥680

页面仍会读取后端 `/public/interpreting` 返回的 profiles，并在等级区下方显示最多 3 个代表 profile，保留后端内容展示能力，但不再让 profile 展示主导页面长度。

### 4. Price Builder：组合估算价格

价格公式为：

```text
estimatedPrice = package.basePrice + interpreter.levelPrice + groupAdjustment
```

其中：

```text
groupAdjustment = max(0, groupSize - 2) * 120
```

Price Builder 在 Hero 右侧和 Booking 区左侧都有摘要展示，用户修改套餐、等级或人数后会实时更新。

### 5. Booking Form：预约字段与 API payload 思路

表单字段已收敛为：

- name
- contact
- date
- city
- language
- groupSize
- notes
- 隐含关联：packageId、levelId、routeSlug、estimatedPrice

表单目前仍是前端 submitted 状态，与原 `MultiStepForm` 的本地提交一致；但页面明确展示 payload 思路：

```text
packageId: xxx · levelId: xxx · routeSlug: xxx · estimatedPrice: xxx
```

后续接后端时应提交这些字段，但后端必须忽略或仅参考前端 estimatedPrice，最终由后端重新计算并保存 price snapshot。

## 价格与安全规则

本阶段明确保留以下安全边界：

1. 前端价格只做用户预期展示，不可信。
2. 后端 booking API 应接受 `packageId`、`profileId/levelId`、`routeSlug?`、`groupSize`、`date` 等字段。
3. 后端创建 booking 时必须重新计算最终价格，并保存价格快照，防止用户篡改前端价格。
4. 如果 routeSlug 存在，后端应校验路线是否存在，并按路线时长、城市、节庆活动等因素决定是否增加费用或推荐等级。

## 与其他模块的闭环

- Route Detail 已使用 `/interpreting?route=${route.slug}#booking`，本阶段已经消费该 query 并预填路线语境。
- Culture 页也已提供 `/interpreting?route=...#booking` 导流，本阶段可承接。
- Data/API 阶段应把当前页面内的 `ScenePackage` / `InterpreterLevel` 抽到统一数据模型或 API mapper，并让 booking endpoint 支持对应字段。
- Posts/Community 阶段可在用户完成路线预约后，用订单状态作为评论权限依据。

## 验证结果

已运行 Interpreting 页面 ESLint：

```bash
npm --prefix "E:/workspace/LingTour/site" run lint -- "E:/workspace/LingTour/site/src/app/interpreting/page.tsx"
```

结果：通过。

已运行 TypeScript 全量检查：

```bash
"E:/workspace/LingTour/site/node_modules/.bin/tsc" --noEmit -p "E:/workspace/LingTour/site/tsconfig.json"
```

结果：通过。

## 后续建议

1. Data/API 阶段新增 `InterpretingPackage`、`InterpreterLevel/Profile`、`BookingPriceSnapshot` 类型。
2. 后端 `api/src/modules/interpreting/*` 或 orders booking DTO 增加：`packageId`、`profileId` / `levelId`、`routeSlug?`、`groupSize`、`computedPriceSnapshot`。
3. 当前旧组件 `MultiStepForm`、`InterpreterShowcase`、`InterpreterFlipCard` 仍存在，但新版 page 已不再依赖前两个；后续 Polish 阶段可决定删除、复用或拆分为更小组件。
4. 真实浏览器 QA 阶段应重点检查：`/interpreting`、`/interpreting?route=southern-sea-table#booking`、移动端 sticky actions、套餐/等级点击后的价格联动与滚动位置。
