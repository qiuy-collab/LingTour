# 路线列表页（/routes）后台数据调研

## 页面目标
展示路线卡片集合，突出文化标签、时长与摘要。

## 前端需要后台管理的数据
- 路线列表（`/public/routes`）
  - slug/title/cultureTag/cityName/duration/summary/coverImage
  - itinerary 简版（前4个stop名）
  - 状态与排序（published/order）

## 后台设计
- 模块：`路线管理`
  - 列表筛选（文化、城市、状态）
  - 批量上下线、批量推荐
- 模块：`推荐位管理`
  - 列表顶部推荐路线配置

## 后台用户流程
1. 运营筛选路线并确认封面与摘要质量。
2. 调整列表排序与推荐位。
3. 批量发布或下线。
