# 路线详情页（/routes/[slug]）后台数据调研

## 页面目标
呈现路线故事与行程站点（itinerary）细节。

## 前端需要后台管理的数据
- 路线详情（`/public/routes/:slug`）
  - 基础：title/summary/story/image/cultureTag
  - itinerary[]：time/stop/plan/story/culturalStory/details[]
  - 地图：lat/lng
  - 扩展：meal/hotel/transit/placeDetail

## 后台设计
- 模块：`路线行程编辑器`
  - Stop 子表管理（新增、排序、复制）
  - 字段模板（交通/餐饮/住宿）
  - Markdown 编辑与预览（story/culturalStory/placeDetail）
- 模块：`质量校验`
  - 检查 stop 数量、缺图、经纬度空值

## 后台用户流程
1. 路线策划创建路线基础信息。
2. 逐站点录入 itinerary 并排序。
3. 通过质检规则后提交审核。
4. 审核通过发布。
