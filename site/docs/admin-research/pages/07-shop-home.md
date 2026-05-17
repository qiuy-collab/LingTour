# 商店首页（/shop）后台数据调研

## 页面目标
展示系列（collections）与精选商品。

## 前端需要后台管理的数据
- 系列列表（`/public/shop/collections`）
  - slug/title/routeName/routeSlug/image/body/productCount
- 商品列表（`/public/shop/products`）
  - slug/name/tag/price/currency/image/collection

## 后台设计
- 模块：`系列管理`
  - 系列信息、封面、关联路线、描述
- 模块：`商品推荐`
  - 商店首页精选商品位
- 模块：`多币种价格`
  - 币种、税率策略（展示层）

## 后台用户流程
1. 商品运营先建系列并绑定路线。
2. 在商品库中设置首页精选。
3. 预览商店首页并发布。
