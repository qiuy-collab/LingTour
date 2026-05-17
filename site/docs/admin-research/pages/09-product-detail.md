# 商品详情页（/shop/products/[slug]）后台数据调研

## 页面目标
展示商品故事、图集、材质说明、相关推荐。

## 前端需要后台管理的数据
- 商品详情（`/public/shop/products/:slug`）
  - product.name/tag, price/currency
  - image/gallery[]
  - story/materialNotes
  - collection 信息
- 相关推荐：同系列或人工推荐（当前前端是同列表截取）

## 后台设计
- 模块：`商品详情编辑器`
  - Markdown story、材质说明、图集排序
- 模块：`相关推荐策略`
  - 自动（同系列/同标签）+ 人工置顶

## 后台用户流程
1. 编辑维护商品故事与图集。
2. 配置相关推荐规则。
3. 预览并发布商品详情页。
