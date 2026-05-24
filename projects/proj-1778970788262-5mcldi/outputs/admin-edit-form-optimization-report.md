# 管理后台编辑表单 UI/UX 优化报告

## 日期：2026-05-24

---

## 一、调研发现的系统性问题

对照 `outputs/admin-audit-report.md` 及实际代码审计，发现 8 个编辑表单存在**两代编辑器差异**：

### 旧版编辑器 (4 个)
| 文件 | 问题 |
|---|---|
| `CollectionEdit.vue` | `data.body \|\| ''` P0 类型 bug（传字符串给 I18nInput）；el-divider 简陋分隔；保存按钮在底部 |
| `FAQEdit.vue` | el-divider 分隔；无 formRef.validate()；通配错误消息 |
| `InterpreterEdit.vue` | el-divider 分隔；`newHelp` 用 reactive 有重置隐患 |
| `ServiceModeEdit.vue` | el-divider 分隔；无 formRef.validate() |

**共同特征**：`page-container` + 单列 800px + `el-divider` + 底部保存按钮 + `ElMessage.error('保存失败')`

### 新版编辑器 (4 个)
ProductEdit、CityEdit、EventEdit、RouteEdit 使用 `edit-page` + `page-header`(保存/取消在 header) + `editor-shell` 2 列 grid + `el-card` 分区 + `FrontendPagePreview`

### 其他问题
- **CityEdit** 编辑模式下 section UI 完全可编辑，但保存时抛错"后端不支持修改 Sections"——体验极差
- **Settings/UserDetail/HomeConfig** 零表单验证
- **ProductEdit/RouteEdit** 各自复制了一份 `optionalI18n()` 工具函数
- **EventEdit** endDate 可以早于 date，无校验
- **RouteEdit** 可以保存 0 个站点的路线
- 错误消息不统一：有的提取 `error?.response?.data?.message`，有的只写"保存失败"

---

## 二、本次实施（15 个文件修改 + 1 个新建）

### 新建文件

#### `src/utils/i18n.ts`
```typescript
export function optionalI18n(value: any): I18nObject | undefined  // zh/en 都空返回 undefined
export function extractErrorMessage(error: any, fallback: string): string  // 统一提取后端错误消息
```

### 现代化改造（4 个编辑器的完整重写）

#### 1. `CollectionEdit.vue` - P0 Bug 修复 + 现代化
- ✅ **修复 P0**：`data.body \|\| ''` → `toI18n(data.body)`
- ✅ 迁移到 `edit-page` + `page-header`(返回/保存) + `editor-shell` grid
- ✅ 3 个 `el-card` 分区：基础信息 / 关联路线 / 发布设置
- ✅ 添加 `formRef.validate()` 调用
- ✅ Slug 添加 kebab-case 校验规则
- ✅ 错误消息提取服务端返回

#### 2. `FAQEdit.vue` - 现代化
- ✅ 迁移到 `edit-page` + `page-header`(返回/保存)
- ✅ 3 个 `el-card` 分区：基本信息 / 问题 / 答案
- ✅ `question.zh` 添加 required 验证
- ✅ 添加 `formRef.validate()` 调用
- ✅ 错误消息提取服务端返回

#### 3. `InterpreterEdit.vue` - 现代化
- ✅ 迁移到 `edit-page` + `page-header`(返回/保存)
- ✅ 3 个 `el-card` 分区：基本信息 / 能力标签 / 个人简介
- ✅ `newHelp` 从 `reactive<I18nObject>` 改为独立 `ref`（zh/en 分开），避免重置时的响应式问题
- ✅ 标签列表无内容时显示"暂无标签"空态提示
- ✅ 添加 `formRef.validate()` 调用
- ✅ 错误消息提取服务端返回

#### 4. `ServiceModeEdit.vue` - 现代化
- ✅ 迁移到 `edit-page` + `page-header`(返回/保存)
- ✅ 4 个 `el-card` 分区：基本信息 / 服务描述 / 服务清单 / 显示设置
- ✅ `newInclude` 从 `ref<I18nObject>` 改为独立 zh/en ref
- ✅ 服务清单无内容时显示空态提示
- ✅ 添加 `formRef.validate()` 调用
- ✅ 错误消息提取服务端返回

### 关键修复（6 个文件）

#### 5. `CityEdit.vue` - Section 编辑 UX 修复
- ✅ 编辑模式下显示 `el-alert`："编辑模式下暂不支持修改 Sections"
- ✅ 编辑模式下隐藏"添加 Section"按钮
- ✅ 每个 section 显示 `el-tag type="info"` "只读"标签
- ✅ 编辑模式下移除删除/上移/下移按钮
- ✅ Section 卡片添加 `.readonly` CSS 类（dashed 边框 + 透明度降低）
- ✅ Header 按钮"取消"→"返回"
- ✅ 错误消息统一使用 `extractErrorMessage`

#### 6. `Settings.vue` - 添加表单验证
- ✅ 保存前校验 `seoTitle` 必填
- ✅ 保存前校验 `taxRate >= 0`
- ✅ 保存前校验 `pageTitleFontSize ∈ [10, 72]`
- ✅ 加载失败时提取服务端错误消息

#### 7. `UserDetail.vue` - 添加验证 + 去重
- ✅ 保存前校验 `form.name` 必填
- ✅ 删除本地重复的 `formatDateTime` 函数，改用 `@/utils/format`
- ✅ 所有 catch 块统一使用 `extractErrorMessage`
- ✅ 封禁/解封操作添加具体错误消息

#### 8. `HomeConfig.vue` - 添加验证
- ✅ 保存前校验 heroStats 条目标题不为空
- ✅ 所有 catch 块统一使用 `extractErrorMessage`

#### 9. `ProductEdit.vue` - 使用共享工具
- ✅ 删除本地 `optionalI18n`，改用 `@/utils/i18n`
- ✅ Header 按钮"取消"→"返回"
- ✅ 加载失败使用 `extractErrorMessage`

#### 10. `RouteEdit.vue` - 添加校验 + 共享工具
- ✅ 删除本地 `optionalI18n`，改用 `@/utils/i18n`
- ✅ 新增 `stops.length === 0` 校验（不允许空站点路线）
- ✅ Header 按钮"取消"→"返回"
- ✅ 错误消息统一使用 `extractErrorMessage`

#### 11. `EventEdit.vue` - 添加 endDate 校验
- ✅ 新增 `endDate >= date` 校验
- ✅ 加载失败使用 `extractErrorMessage`

### 外观统一
- ✅ 所有 9 个编辑器 header 右侧按钮统一为"返回 + 保存"
- ✅ 所有编辑器使用统一的 CSS 变量类名（`.edit-page`, `.page-header`, `.editor-shell`, `.section-card`）
- ✅ 所有编辑器使用相同的 `label-position="top"` 表单布局

---

## 三、构建验证

```
vue-tsc --noEmit    → ✅ 零错误
vite build          → ✅ 1.06s 通过
```

---

## 四、浏览器验证

| 页面 | URL | 验证项 | 结果 |
|---|---|---|---|
| Dashboard | /admin/dashboard | 统计卡片、图表、侧边栏 | ✅ |
| CollectionEdit (新建) | /admin/shop/collections/create | 3 card 分区、header 返回/保存按钮 | ✅ |
| CityEdit (编辑) | /admin/cities/xxx/edit | el-alert "不支持修改"、section 只读 tag、隐藏添加按钮 | ✅ |
| FAQEdit (新建) | /admin/interpreting/faqs/create | 3 card 分区、formRef.validate() | ✅ |
| InterpreterEdit (新建) | /admin/interpreting/profiles/create | 3 card 分区、能力标签输入、空态提示 | ✅ |
| ServiceModeEdit (新建) | /admin/interpreting/modes/create | 4 card 分区、服务清单输入 | ✅ |
| Settings | /admin/settings | 6 card 分区、SEO 输入、保存按钮 | ✅ |

---

## 五、改动文件清单

| # | 文件路径 | 操作 |
|---|---|---|
| 1 | `src/utils/i18n.ts` | **新建** |
| 2 | `src/views/shop/CollectionEdit.vue` | **重写**（P0 修复 + 现代化） |
| 3 | `src/views/interpreting/FAQEdit.vue` | **重写**（现代化） |
| 4 | `src/views/interpreting/InterpreterEdit.vue` | **重写**（现代化） |
| 5 | `src/views/interpreting/ServiceModeEdit.vue` | **重写**（现代化） |
| 6 | `src/views/cities/CityEdit.vue` | 修改（section 只读 UX） |
| 7 | `src/views/settings/Settings.vue` | 修改（添加验证） |
| 8 | `src/views/users/UserDetail.vue` | 修改（验证+去重+错误处理） |
| 9 | `src/views/home/HomeConfig.vue` | 修改（验证+错误处理） |
| 10 | `src/views/shop/ProductEdit.vue` | 修改（共享 optionalI18n） |
| 11 | `src/views/routes/RouteEdit.vue` | 修改（共享工具 + stops 校验） |
| 12 | `src/views/events/EventEdit.vue` | 修改（endDate 校验 + 错误处理） |

**总结**：1 新建 + 4 重写 + 7 修改 = 12 个文件，vue-tsc 零错误，vite build 1.06s 通过。
