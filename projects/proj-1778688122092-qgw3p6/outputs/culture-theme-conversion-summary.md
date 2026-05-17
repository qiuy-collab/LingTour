# Culture 文化主题转化流程重构总结

## 本次目标

本阶段基于 `project.md`、`docs/README.md` 与 `docs/culture-interaction-flow.md`，将 `/culture` 从“城市文化列表 / 内容阅读页”重构为更接近 Shopify 高端独立站的文化主题集合页。核心目标是：用户进入 Culture 后不再陷入百科式长文，而是通过 **文化主题 → 地区 / 活动 → 相关路线 → Traveler Notes / 口译预约** 的路径完成下一步转化。

## 已调整文件

- `site/src/app/culture/page.tsx`
- `site/src/types/content.ts`
- 间接修复：`site/src/components/home/CultureGallery.tsx` 依赖的 `CultureFeature.href` 类型问题

## 页面信息层级

### 1. 第一屏 Hero：文化不是百科，而是路线入口

新版 Hero 使用强视觉背景与短文案：

- 主张：用路线进入岭南现场；
- CTA：探索文化主题、查看文化路线；
- 右侧精选主题面板展示当前主题的地区数与路线数；
- 支持从 URL 参数进入特定主题：`/culture?theme=coastal`、`/culture?culture=coastal`；
- 支持从活动进入主题：`/culture?event=xxx` 会按活动城市匹配主题。

### 2. 文化主题卡片：像产品集合页一样选择文化

新增前端主题集合：

- Coastal / 海岸生活与渔港餐桌；
- Guangfu / 广府城市手艺；
- Chaoshan / 潮汕仪式节奏；
- Hakka / 客家山地待客之道。

每张主题卡片只保留选择所需信息：

- 主题名；
- 一句话说明；
- 核心体验标签；
- 相关路线数量；
- 近期活动数量。

点击主题卡片会在当前页更新主题详情、地区索引、活动列表与转化模块。

### 3. 主题详情：主题 → 体验标签 → 路线筛选

主题详情使用 sticky `route-map-panel` 结构，避免长文堆叠。核心体验标签会导向：

- `/routes?culture={themeId}&experience={experience}`

这为后续 Routes / Data API 阶段提供明确筛选参数。

### 4. 地区文化索引：主题 → 地区 → 路线地图

地区卡片不再只是进入 `/culture/[slug]` 阅读城市长文，而是优先导向路线地图：

- `/routes?region={citySlug}&culture={themeId}`

这样 Culture 页能承接用户“我对某种文化感兴趣，但还不知道去哪里”的需求，并把选择结果交给 Routes 地图探索页。

### 5. 近期文化活动：主题 → 活动 → 路线高亮

Culture 页复用首页新增的 `getGuangdongEvents()` 数据，按主题城市匹配活动。活动卡片导向：

- `/routes?event={eventId}`

与已完成的 Home → Routes 活动导流保持一致。

### 6. 转化模块：推荐路线 + 文化口译预约

底部转化模块根据当前主题选择第一条相关路线：

- 有相关路线时进入 `/routes/[slug]`；
- 也可直接进入 `/interpreting?route={slug}#booking`，为后续 Interpreting 套餐预约阶段预留 route query。

## 与 Home / Routes / Posts 的关系

- **Home → Culture**：首页的 CultureGallery 类型问题已修复，Culture 主题页可承接首页文化入口。
- **Home/Event → Routes**：Culture 使用同一份 `events.ts` 活动数据，活动 CTA 与首页一致导向 `/routes?event=xxx`。
- **Culture → Routes**：新增 `/routes?culture=xxx`、`/routes?region=xxx&culture=xxx`、`/routes?culture=xxx&experience=xxx` 三类导流。
- **Culture → Posts**：主题详情提供 `/posts?culture=xxx` 入口，后续 Posts/Community 阶段可接真实筛选。
- **Culture → Interpreting**：推荐路线支持 `/interpreting?route=xxx#booking`，与 Route Detail 已落地的预约导流保持一致。

## 修复的问题

- `CultureFeature` 类型缺少 `href` 字段，导致 `CultureGallery.tsx` 中 `culture.href` TypeScript 报错。本次在 `site/src/types/content.ts` 中补充 `href?: string`，与 `fetchHomeData()` 已返回的 `href` 字段保持一致。

## 验证结果

已运行针对本次相关文件的 ESLint：

```bash
npm --prefix "E:/workspace/LingTour/site" run lint -- "E:/workspace/LingTour/site/src/app/culture/page.tsx" "E:/workspace/LingTour/site/src/types/content.ts" "E:/workspace/LingTour/site/src/components/home/CultureGallery.tsx"
```

结果：通过，无新增 lint error。

已运行 TypeScript 项目检查：

```bash
"E:/workspace/LingTour/site/node_modules/.bin/tsc" --noEmit -p "E:/workspace/LingTour/site/tsconfig.json"
```

结果：通过。此前由 `CultureFeature.href` 引起的全量 TypeScript 阻塞点已解除。

## 后续需要补充的数据字段

1. 后端 / API mapper 可新增 `CultureTheme` 模型：
   - `id`、`title`、`summary`、`image`、`citySlugs`、`routeCultureTags`、`experienceTags`、`eventTags`。
2. Routes 阶段后续可读取：
   - `culture`、`experience`、`region` 查询参数并真实过滤路线。
3. Posts/Community 阶段可读取：
   - `culture` 查询参数，展示主题相关 Traveler Notes。
4. Event 数据目前仍为前端静态数据，Data/API 阶段应迁移到 API 或 mapper，并保持空值兼容。
5. 未来如要保留 `/culture/[slug]` 城市长文页，应在城市详情页顶部增加同样的路线 / 活动 / posts 转化入口，避免回到百科阅读模式。
