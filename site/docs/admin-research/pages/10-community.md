# 社区页（/community）后台数据调研

## 页面目标
展示用户帖子流、频道、搜索、发布（当前前端含本地mock与localStorage）。

## 前端需要后台管理的数据
- 帖子流（建议新增 `/public/community/posts`）
  - user、title、excerpt、image、location、route、channel、tags、mood
  - likes/comments/saves、发布时间
- 频道与brief配置
  - channel 列表、brief 模板、routeRooms 统计
- 发布接口（建议）
  - `POST /community/posts`、`PATCH /community/posts/:id/*`

## 后台设计
- 模块：`社区内容管理`
  - 审核、屏蔽、置顶、频道归类
- 模块：`社区配置`
  - 频道、brief、社区引导文案
- 模块：`互动运营`
  - 点赞/评论/收藏统计与风控

## 后台用户流程
1. 运营维护频道与brief模板。
2. 用户发帖进入待审核。
3. 审核通过后出现在帖子流。
4. 运营按活动做置顶与话题运营。
