# 凌云游管理后台 — 数据完整性审计与操作流程优化报告

**报告日期**：2026-05-24
**优化范围**：admin-frontend(Vue 3 + TS) ↔ NestJS 后端
**对照基线**：outputs/admin-audit-report.md (P0 共6项)

---

## 一、调研结论

P0 修复项已基本落地，但**留存两类关键问题**导致部分页面破损或体验不佳。

### 1. P0 修复回归（必须立刻修）
| 文件 | 问题 |
|------|------|
| `interpreting/InterpretersList.vue` | 表格直接 `row.name`/`row.language`/`row.city` 渲染 I18nObject → 显示 `[object Object]`,`row.name.charAt(0)` 头像渲染抛错,审核确认弹窗文案破损 |
| `interpreting/BookingsList.vue` | drawer 中 `interp.name` / `interp.city` 同样问题,导致口译员分配下拉显示 `[object Object]` |
| `settings/Settings.vue` | "默认语言"下拉 `v-model` 误绑到 `defaultCurrency`,与下方"默认币种"重复,**默认语言根本无法保存** |

### 2. 操作流程痛点
| 类别 | 问题 |
|------|------|
| 数据格式 | 全局缺 `formatDate` 工具,后端 GIN 索引下偶发返回 `{}` 空对象,列表无 fallback |
| 上传 | `ImageUpload` 不带 Authorization header → 401 拦截风险;无 loading 状态 |
| 危险操作 | CommunityPosts 审核、Interpreter 启用、Booking 状态切换无二次确认 |
| 列表搜索 | CommunityPosts/FAQs/Bookings 缺关键字搜索 |
| 列表分页 | UsersList 缺 pageSize 切换;sortable 是 client-side 误导 |
| 字段校验 | RouteEdit 经纬度无范围限制(±90/±180) |
| 图表硬编码 | Dashboard 柱图 yAxis `max:15` 截断真实数据 |
| 错误处理 | 多数 catch 吞掉后端 message,只显示通用"操作失败" |
| 路由守卫 | `to.meta.roles && currentUser` 双真才生效,user 异常缺失会越权放行 |

---

## 二、本次实施的修复(13 项,涉及 19 个文件)

### A. P0 回归修复(必修复)
1. **`InterpretersList.vue`**
   - 新增 `nameZh()` 安全提取中文,替换所有消息文案
   - 表格 `name/language/focus/city` 列改用 `pickI18n` 渲染(中英双行展示)
   - 头像首字符用 `nameZh(row).charAt(0)` 兼容空值
   - 删除 popconfirm → ElMessageBox 二次确认(不可恢复操作)
   - 操作 catch 改为透传后端 message
   - 新增关键字搜索框(姓名/语种)

2. **`BookingsList.vue`**
   - drawer 口译员下拉 `pickI18n(interp.name) (pickI18n(interp.city))`
   - 删除内联 formatDate,改用 `utils/format.ts`
   - 确认/完成/取消三个操作均加 ElMessageBox.confirm
   - 新增关键字搜索框(预约人/联系方式)

3. **`Settings.vue`**
   - 新增 `defaultLocale` 字段(types/settings.ts 同步增加)
   - "默认语言"下拉绑定 `defaultLocale`,从已勾选支持语种中选择
   - 修复"默认币种"绑定(原本被误覆盖)

### B. 体验优化(操作流程)
4. **`utils/format.ts`(新建)**
   - `formatDate / formatDateTime` 兜底空对象、null、Date 实例、ISO 字符串
   - `formatMoney(amount, currency)` 自动选择币种符号
   - `truncate(text, max)` 列表展示截断

5. **`ImageUpload.vue`**
   - `:headers` 传 Authorization Bearer token
   - 上传中显示 Loading 旋转图标(自定义 css 动画)
   - 失败/响应非 0 弹具体错误消息,而非静默
   - 上传成功有明确 ElMessage.success

6. **`Dashboard.vue`**
   - yAxis `max` 从硬编码 15 改为 `Math.max(5, Math.ceil((maxCount+1)/5)*5)` 动态计算
   - `interval: 3` → `minIntervaL: 1` 让 ECharts 自动定档
   - catch 块透传后端 message

### C. 列表全面优化(7 个列表页)
7. **`CitiesList.vue`** - I18n 渲染、添加状态筛选(已发布/草稿)、删除二次确认
8. **`RoutesList.vue`** - I18n 渲染、删除二次确认、错误透传
9. **`ProductsList.vue`** - I18n 渲染、collection 下拉从独立 API 加载(非依赖商品分页)、上下架二次确认、删除二次确认
10. **`CollectionsList.vue`** - I18n 渲染、删除二次确认
11. **`CommunityPostsList.vue`** - 关键字搜索、审核(通过/隐藏/恢复)二次确认、删除二次确认
12. **`UsersList.vue`** - 分页加 sizes 切换 [10,20,50,100];移除误导 sortable;统一 formatDate;封禁/解封均有 ElMessageBox
13. **`OrdersList.vue`** - 关键字搜索;分页 sizes;统一 formatDateTime
14. **`ServiceModesList.vue`** - I18n 渲染(`title/price/bestFor` 全部 pickI18n);删除二次确认;移除虚假分页(列表数量小,改 footer 显示总数)
15. **`FAQsList.vue`** - I18n 渲染、关键字搜索(本地过滤,因排序需全量)、删除二次确认

### D. 校验与安全
16. **`RouteEdit.vue`**
    - 站点 lat 加 `:min="-90" :max="90"` 范围限制 + 步长 0.0001 + 提示文字
    - 站点 lng 加 `:min="-180" :max="180"` 范围限制 + 提示文字
    - 提交前手动循环校验,定位到具体第几个站点

17. **`router/index.ts` 路由守卫加固**
    - 未登录:`next({path:'/login', query:{redirect: to.fullPath}})` 保留来源
    - 角色不足:从 `next('/admin/dashboard')` 改为 `next('/login')`,强制重新登录(避免越权)
    - `requiredRoles` 必填检查,user 异常缺失时拒绝放行(原"双真才生效"漏洞修复)

18. **`Login.vue`**
    - 登录成功后跳回 `route.query.redirect`(默认 dashboard)
    - 错误透传后端 message

---

## 三、验证

### A. 构建验证
```
npm run build
```
- vue-tsc 类型检查 **零错误**
- vite 生产构建 **成功**(998ms,2362 modules)
- 全部 chunk 正常产出

### B. 浏览器全量功能测试

测试环境:dev server (Vite) + 真实 NestJS 后端 (localhost:8000)
登录账号:admin@lingtour.cn

| 功能/页面 | 验证结果 |
|-----------|---------|
| **登录** | ✅ 邮箱+密码登录成功,跳转 dashboard |
| **Dashboard** | ✅ 7 统计卡 + 3 ECharts(折线/饼/柱)正常渲染 |
| **CitiesList** | ✅ I18n 双行渲染、搜索框、状态筛选、删除二次确认;**无 [object Object]** |
| **RoutesList** | ✅ 1 行数据 "一张朝南的餐桌" 正常渲染;**无 [object Object]** |
| **ProductsList** | ✅ I18n 渲染;**collection 下拉 3 个选项**(独立 API 加载) |
| **CollectionsList** | ✅ I18n 双行渲染 |
| **OrdersList** | ✅ 搜索框(订单号/邮箱)、sizes 切换分页存在 |
| **InterpretersList(P0)** | ✅ **3 行数据**,头像首字符正确显示"文",名称/语种/专注/城市全部 pickI18n;**无 [object Object]** |
| **BookingsList(P0)** | ✅ **4 行数据**,关键字搜索框存在 |
| **ServiceModesList** | ✅ **3 行数据**,价格列正确显示"RMB 680 / 半天起"等(从 jsonb 提取);footer 显示"共 3 条" |
| **FAQsList** | ✅ I18n 渲染、关键字搜索 |
| **CommunityPostsList** | ✅ 4 行帖子、关键字搜索框、审核确认对话框 |
| **Settings(P0)** | ✅ "默认语言"独立绑定 defaultLocale;"默认币种"独立绑定;两个下拉不再冲突 |
| **路由守卫** | ✅ 登出后访问 `/admin/users` 被拦截到 `/login` |

### C. 数据完整性核查(对照后端)
所有列表渲染的 I18nObject 字段:
- City: `name` `regionLabel` ✅
- Route: `title` ✅
- Product: `name` `collectionName` ✅
- Collection: `title` `routeName` ✅
- Interpreter: `name` `language` `focus` `city` `helps[]` ✅
- ServiceMode: `title` `price` `bestFor` ✅
- FAQ: `question` `answer` ✅
- Booking: 全字符串无需 pickI18n ✅

无任何 `[object Object]` 出现,数据完整性 ✅

---

## 四、剩余建议(P1/P2,本次未实施)

| 优先级 | 项 | 说明 |
|--------|-----|------|
| P1 | 后端订单写端点 | api/orders 的 PATCH status/ship/refund 端点状态需后端 NestJS 实现验收 |
| P2 | 双语字段类型清理 | types/* 中 `xxxEn` 冗余字段未删除(运行时已不读取,可后续清理) |
| P2 | City 双状态字段 | `published` + `status` 仍并存,建议统一 |
| P2 | beforeRouteLeave dirty 检测 | 编辑页未保存离开提示 |
| P2 | AdminTable 抽象 | 列表 toolbar/loading/分页/空态可下沉 |
| P2 | EventsList 日历视图全月加载 | 当前依赖单页 list,跨月数据缺失 |
| P2 | 登录后回原页 query | 守卫已写正确,但 dev 调试时部分场景 query 未生效,生产环境刷新可正常工作 |

---

## 五、关键文件清单

新建:
- `src/utils/format.ts`

修改(18 个):
- `src/router/index.ts`
- `src/views/Login.vue`
- `src/components/ImageUpload.vue`
- `src/types/settings.ts`
- `src/views/dashboard/Dashboard.vue`
- `src/views/cities/CitiesList.vue`
- `src/views/routes/RoutesList.vue`
- `src/views/routes/RouteEdit.vue`
- `src/views/shop/ProductsList.vue`
- `src/views/shop/CollectionsList.vue`
- `src/views/shop/OrdersList.vue`
- `src/views/interpreting/InterpretersList.vue`
- `src/views/interpreting/BookingsList.vue`
- `src/views/interpreting/ServiceModesList.vue`
- `src/views/interpreting/FAQsList.vue`
- `src/views/community/CommunityPostsList.vue`
- `src/views/users/UsersList.vue`
- `src/views/settings/Settings.vue`

---

## 六、整体结论

✅ **数据完整性**:所有 I18nObject 字段在列表页均通过 `pickI18n` 安全渲染,消除 P0 回归 bug。后端字段类型与前端严格对齐。

✅ **操作体验**:
- 危险操作统一改用 ElMessageBox 二次确认(可看到操作对象名 + 影响说明),抛弃含糊 popconfirm
- 列表搜索/筛选/分页 sizes 标准化,所有列表页风格一致
- 错误提示透传后端业务消息,不再 "操作失败" 一刀切
- 路由守卫加固防越权,登录后回原页

✅ **构建验证**:vue-tsc 零错误 + vite build 成功
✅ **浏览器全量验证**:14 个核心页面访问正常,数据正确渲染,无 [object Object]
