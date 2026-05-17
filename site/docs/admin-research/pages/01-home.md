# 首页（/）后台数据调研

## 页面目标
展示品牌主叙事、城市地图、活动日历、精选商品、口译入口、文化入口。

## 前端需要后台管理的数据
- 首页聚合配置（`/public/home`建议）：
  - hero 文案：标题、副标题、主CTA、副CTA
  - 信任指标：value/label 列表
  - 首页入口卡片：id/title/body/href
  - 文化高亮：slug/title/body/href
- 城市数据（`/public/cities`）：name/label/narrative/image/tags/adcode
- 路线数据（`/public/routes`）：slug/title/culture/duration/audience/summary/image
- 商品数据（`/public/shop/products`）：slug/name/tag/price/currency/image/collection
- 首页活动数据（建议新增 `/public/events`）：用于日历和轮播

## 后台设计
- 模块：`首页配置管理`
  - Banner区、指标区、入口卡区、文化区、活动区开关与排序
- 模块：`内容引用配置`
  - 精选城市、精选路线、精选商品（手动选择 + 自动规则）
- 模块：`多语言`
  - 中文/英文字段分离，支持草稿与发布

## 后台用户流程
1. 运营进入“首页配置”编辑 hero 与 CTA。
2. 在“精选引用”选择要展示的城市/路线/商品。
3. 设置日历活动可见范围与排序。
4. 预览中英版本，提交审核。
5. 审核通过后发布，首页即时生效（建议带缓存刷新按钮）。
