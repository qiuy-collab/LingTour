# 商品列表页（/shop/products）后台数据调研

## 页面目标
按系列/标签筛选商品，进入商品详情与购买。

## 前端需要后台管理的数据
- 商品列表（`/public/shop/products`）
  - slug/name/tag/price/currency/image, collection.title
  - 可筛选字段：collection/tag/status

## 后台设计
- 模块：`商品库`
  - SKU/SPU结构（建议）
  - 标签体系、库存状态、上架状态
- 模块：`筛选配置`
  - 前台可见筛选项及排序

## 后台用户流程
1. 运营录入商品并打标签。
2. 设置系列归属与上架状态。
3. 配置筛选项后发布。
