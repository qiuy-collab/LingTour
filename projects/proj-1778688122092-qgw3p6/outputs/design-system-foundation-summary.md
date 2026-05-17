# 重构基础：统一 Shopify 高端设计系统 — 执行总结

## 本次参考

- `project.md`：阶段 1「统一设计系统与信息层级」
- `docs/README.md`：总体交互原则，包括地图与视觉优先、少而精内容层级、Shopify 高端独立站风格、路线 / 口译 / 社区闭环

## 已调整文件

1. `site/src/app/globals.css`
   - 补充 Shopify-luxury 设计系统基础注释与全局 token。
   - 增加品牌语义 token：`--brand-night`、`--brand-paper`、`--brand-gold`、`--brand-cinnabar`、`--brand-jade`、`--brand-muted`。
   - 增加 surface / text / border / CTA / transition 语义 token：`--surface-raised`、`--surface-editorial`、`--surface-commerce`、`--surface-map`、`--text-heading`、`--text-body`、`--text-subtle`、`--border-soft`、`--border-gold`、`--transition-lux` 等。
   - 补充页面结构工具：`shopify-page-flow`、`lux-page-hero`、`lux-hero-media`、`lux-hero-scrim`、`lux-hero-content`、`module-header`、`module-header-split`、`conversion-panel`、`card-grid-lux`、`premium-divider`。
   - 统一卡片体系：`product-card`、`story-card`、`calendar-card`、`route-map-panel`、新增 `community-card`，并统一 hover、边框、阴影和高端轻动效。
   - 补充 CTA 状态：`btn-ghost-light`、`btn-block`、`btn-compact`，并统一 active / disabled 状态。
   - 增加 `--deep-blue` 兼容 token，避免旧组件引用缺失变量。

2. `site/src/components/ui/SectionHeading.tsx`
   - 从局部 Tailwind 标题样式升级为全局 `module-header` / `module-kicker` / `lux-section-title` / `module-description`。
   - 支持居中时 description 自动 `mx-auto`，便于后续 Home / Routes / Culture / Interpreting / Posts 统一接入。

3. `site/src/components/ui/EditorialIntro.tsx`
   - 保留原组件 API，不破坏现有调用。
   - 内部改用 `module-header-split`、`module-kicker`、`lux-section-title`、`module-description` / `lux-hero-subtitle`，使 editorial intro 与全局 Shopify-luxury 层级一致。

## 后续页面接入规范

页面默认信息结构建议统一为：

1. Hero：一句强主张 + 强视觉背景 / 地图 / 产品化场景 + 1-2 个 CTA。
2. Curated module：精选路线、事件、文化主题或口译套餐，使用 `product-card` / `story-card` / `calendar-card` / `route-map-panel`。
3. Conversion module：预约、查看路线、查看手记等，使用 `conversion-panel` 或 `sticky-action`。
4. Supporting proof：评论、手记、FAQ、空状态等辅助内容，使用 `community-card` 或轻量模块。

## 验收结论

- 已建立全站共用视觉 token 与模块样式基础。
- 已覆盖 CTA、卡片、地图面板、日历面板、社区卡片、转化面板的统一规范。
- 保留并增强现有 `EditorialIntro`、`SectionHeading`、`SpotlightPanel` 组合方式，未做大规模重写。
- 后续 Home / Routes / Route Detail / Culture / Interpreting / Posts 可直接复用这些 class，减少页面风格分裂。
