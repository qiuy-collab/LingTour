# 城市 Sections 编辑功能修复报告

## 问题诊断

CityEdit 编辑模式下显示"编辑模式下暂不支持修改 Sections"，sections 区域为只读状态。

### 根因分析

通过 curl 直接测试后端 `PUT /api/v1/admin/cities/:id`：
- 不带 `sections` 字段 → 200 ✅
- 带 `sections` 字段（任何值，包括 `[]`） → 500 ❌

后端 `cities.service.ts` 第 207-229 行的逻辑有 bug：

```typescript
// 问题代码（修复前）
Object.assign(city, dto);  // city.sections = dto.sections（无 id 的新对象）
const saved = await queryRunner.manager.save(City, city);  
// ↑ cascade 尝试 INSERT 新 sections，但旧 sections 仍在 DB → ORM 冲突 → 500

if (dto.sections !== undefined) {
  await queryRunner.manager.delete(CityCultureSection, { cityId: id });  // 删除旧的
  // ... 插入新的
}
```

**根因**：`Object.assign` 把 `dto.sections` 赋给了 `city.sections`，然后 `save(City, city)` 因为 Entity 上有 `cascade: true`，会尝试级联保存这些无 id 的 section 对象。此时旧 sections 仍在数据库中，导致 ORM 冲突抛 500。

## 修复方案

### 后端修复（cities.service.ts）

在 `Object.assign` 之后、`save` 之前，删除 `city.sections` 属性，阻止级联保存：

```typescript
Object.assign(city, dto);
delete (city as any).sections;  // ← 新增：阻止 cascade 保存 sections
const saved = await queryRunner.manager.save(City, city);

// sections 仍由后续的 delete-and-recreate 逻辑正确处理
if (dto.sections !== undefined) {
  await queryRunner.manager.delete(CityCultureSection, { cityId: id });
  if (dto.sections.length > 0) {
    // ... 逐条创建新 sections
  }
}
```

### 前端修复（CityEdit.vue）

移除所有只读限制：
- 删除 `el-alert` 只读警告
- 删除 section 卡片上的"只读"标签
- 恢复"添加 Section"按钮
- 恢复上移/下移/删除按钮
- 删除 `originalSectionsSnapshot` / `serializeSections` 死代码
- 删除 `.repeat-item.readonly` CSS

## 验证结果

### curl 端到端测试
| 操作 | 结果 |
|---|---|
| PUT 修改 section title | 200 ✅ |
| PUT 添加新 section | 200 ✅（4 条） |
| PUT 删除 section | 200 ✅（3 条） |
| PUT 重排序 sections | 200 ✅ |
| GET 验证持久化 | 数据正确 ✅ |

### 浏览器验证
- CityEdit 编辑页加载正常，sections 区域可编辑
- 无只读 alert、无只读标签
- 添加/移动/删除按钮全部可用
- 保存后跳回列表（成功）
- 后端数据已持久化

### 构建
- vue-tsc: 零错误
- vite build: 1.30s 通过

## 改动文件
1. `site/server/src/modules/cities/cities.service.ts` — 1 行修复
2. `admin-frontend/src/views/cities/CityEdit.vue` — 移除只读限制 + 清理死代码
