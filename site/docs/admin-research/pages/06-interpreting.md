# 口译服务页（/interpreting）后台数据调研

## 页面目标
展示服务模式、口译员档案、FAQ，并支持预约下单。

## 前端需要后台管理的数据
- 口译聚合（`/public/interpreting`）
  - service_modes[]：title/price/bestFor/body/includes/accent/featured/sortOrder
  - profiles[]：name/language/focus/helps/sortOrder
  - faqs[]：question/answer/sortOrder
- 预约流程
  - 创建支付单：`POST /public/bookings/checkout`
  - 支付确认：`POST /public/bookings/:id/confirm-deposit`

## 后台设计
- 模块：`服务模式管理`
  - 场景卡片编辑、价格版本管理、推荐标记
- 模块：`口译员管理`
  - 个人档案、语言能力、服务城市、可用状态
- 模块：`FAQ管理`
  - 分类、排序、上下线
- 模块：`预约订单`
  - 线索池、支付状态、分配口译员、履约状态

## 后台用户流程
1. 运营维护服务模式与FAQ。
2. 供应侧维护口译员资料和排班。
3. 用户提交预约后进入“预约订单”看板。
4. 运营确认支付、分配口译员、推进履约状态。
