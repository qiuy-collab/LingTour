# 文化详情页（/culture/[slug]）后台数据调研

## 页面目标
展示单城市深度内容：叙事、图集、分段文章、美食、关联路线。

## 前端需要后台管理的数据
- 城市详情（`/public/cities/:slug`）
  - hero：name/label/image/narrative
  - intro：editorIntro
  - gallery：galleryImages[]
  - sections[]：title/body/sortOrder
  - breath 信息：breathImage/breathQuote
  - food：foodTitle/foodDescription/foodImages[]
  - routes 关联：routeSlugs[]

## 后台设计
- 模块：`城市章节编辑器`
  - 支持 Markdown + 预览
  - section 拖拽排序
- 模块：`媒体资产`
  - 图库、呼吸图、食物图分组管理
- 模块：`路线关联`
  - 从已发布路线中多选关联

## 后台用户流程
1. 编辑在城市详情中维护章节与图片。
2. 配置美食区与呼吸段落。
3. 绑定推荐路线。
4. 预览详情页滚动结构，发布。
