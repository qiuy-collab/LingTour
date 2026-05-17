# 前端重构页面交互文档索引

本目录用于沉淀本次前端重构中各个页面 / Tab 的用户操作路径、交互流程、页面结构和转化逻辑。内容依据当前 `project.md` 的《前端页面重构实施计划》整理，并补充了路线页、首页、文化页、口译页、社区页等页面的用户体验细节。

## 文档清单

1. `home-interaction-flow.md`  
   首页用户操作与交互流程：事件路线推荐轮播、广东活动日历、轻量社区入口、路线/口译转化入口。

2. `routes-interaction-flow.md`  
   路线页与路线详情页用户操作与交互流程：广东大地图、区域小地图、多路线 polyline、高亮预览、节点索引、路线 posts/comments。

3. `culture-interaction-flow.md`  
   文化 / Culture 页面用户操作与交互流程：文化主题浏览、节庆活动、地区文化索引、关联路线转化。

4. `interpreting-interaction-flow.md`  
   口译页用户操作与交互流程：场景套餐、口译员等级、组合价格、预约表单、路线预填。

5. `posts-community-interaction-flow.md`  
   旅行者手记 / Posts / Comments 用户操作与交互流程：全站 post 浏览、路线级内容、用户主页 post、订单锁定评论权限。

6. `navigation-tab-flow.md`  
   全站导航与 Tab 关系：Home、Routes、Culture、Interpreting、Stories 等入口之间的流转关系。

## 总体交互原则

- **地图与视觉优先**：路线相关页面从“内容列表”转为“地图探索 + 精准预览”。
- **少而精的内容层级**：每屏只解决一个问题，减少长篇信息堆叠。
- **Shopify 高端独立站风格**：大图、留白、精品卡片、明确 CTA、轻动效。
- **路线 / 口译 / 社区闭环**：路线激发兴趣，详情完成理解，口译增强服务，post/comment 提供信任背书。
- **权限逻辑后端兜底**：订单锁定评论只能作为前端 UX 提示，真实校验必须由后端完成。
