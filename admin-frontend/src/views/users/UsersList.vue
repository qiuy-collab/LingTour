<script setup lang="ts">
import { useRouter } from 'vue-router'
import { getUsers, banUser, unbanUser } from '@/api/users'
import type { ManagedUser, UserStatus } from '@/types/user'
import { UserStatusMap, UserStatusColorMap, LocaleMap } from '@/types/user'
import { ElMessage, ElMessageBox } from 'element-plus'
import { formatDate } from '@/utils/format'
import { useListPage } from '@/composables/useListPage'
import { ListToolbar } from '@/components/list'

const router = useRouter()

// ─── 列表数据 (useListPage) ─────────────
const {
  loading, list: users, total, page, pageSize,
  filters,
  handlePageChange, handleSizeChange,
  handleSearch, handleReset,
  fetchList,
} = useListPage<ManagedUser>({
  fetchApi: (params) => getUsers(params as any) as any,
  defaultFilters: { keyword: '', status: '' as UserStatus | '' },
})

// ─── 自定义操作 ──────────────────────────
function handleViewDetail(user: ManagedUser) {
  router.push(`/admin/users/${user.id}`)
}

async function handleBan(user: ManagedUser) {
  try {
    await ElMessageBox.confirm(
      `确定要封禁用户「${user.name}」吗?封禁后该用户将无法登录和使用服务。`,
      '封禁确认',
      { confirmButtonText: '确定封禁', cancelButtonText: '取消', type: 'warning' }
    )
    await banUser(user.id)
    ElMessage.success(`已封禁用户「${user.name}」`)
    fetchList()
  } catch (err: any) {
    if (err?.response) ElMessage.error(err.response.data?.message || '封禁失败')
  }
}

async function handleUnban(user: ManagedUser) {
  try {
    await ElMessageBox.confirm(`确定解封用户「${user.name}」?`, '解封确认', { type: 'success' })
    await unbanUser(user.id)
    ElMessage.success(`已解封用户「${user.name}」`)
    fetchList()
  } catch (err: any) {
    if (err?.response) ElMessage.error(err.response.data?.message || '解封失败')
  }
}
</script>

<template>
  <div class="users-page">
    <div class="page-header">
      <h2>用户管理</h2>
      <span class="page-desc">管理系统注册用户，查看用户详情，进行封禁/解封操作</span>
    </div>

    <!-- 筛选栏 -->
    <ListToolbar
      v-model="filters.keyword"
      search-placeholder="搜索用户名 / 邮箱"
      @search="handleSearch"
      @reset="handleReset"
    >
      <el-select
        v-model="filters.status"
        placeholder="用户状态"
        clearable
        style="width: 140px"
        @change="handleSearch"
      >
        <el-option label="全部" value="" />
        <el-option label="正常" value="active" />
        <el-option label="已封禁" value="banned" />
      </el-select>
    </ListToolbar>

    <!-- 用户表格 -->
    <el-card shadow="never" class="table-card">
      <el-table :data="users" v-loading="loading" stripe style="width: 100%">
        <el-table-column label="用户" min-width="200">
          <template #default="{ row }">
            <div class="user-cell">
              <el-avatar :src="row.avatar" :size="40" />
              <div class="user-info">
                <span class="user-name">{{ row.name }}</span>
                <span class="user-email">{{ row.email }}</span>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="locale" label="语言" width="90" align="center">
          <template #default="{ row }">
            <el-tag size="small" type="info">{{ LocaleMap[row.locale] || row.locale }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="注册时间" width="130" align="center">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column prop="bookingsCount" label="预约次数" width="90" align="center" />
        <el-table-column prop="ordersCount" label="订单次数" width="90" align="center" />
        <el-table-column prop="status" label="状态" width="90" align="center">
          <template #default="{ row }">
            <el-tag :type="(UserStatusColorMap as Record<string, string>)[row.status]" size="small">
              {{ (UserStatusMap as Record<string, string>)[row.status] }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" align="center" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="primary" link @click="handleViewDetail(row)">
              详情
            </el-button>
            <template v-if="row.status === 'active'">
              <el-button size="small" type="danger" link @click="handleBan(row)">封禁</el-button>
            </template>
            <template v-else>
              <el-button size="small" type="success" link @click="handleUnban(row)">
                解封
              </el-button>
            </template>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrap">
        <el-pagination
          v-model:current-page="page"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next"
          background
          @current-change="handlePageChange"
          @size-change="handleSizeChange"
        />
      </div>
    </el-card>
  </div>
</template>

<style scoped>
.users-page {
  padding: 0;
}

.page-desc {
  font-size: 13px;
  color: var(--lt-text-secondary, #909399);
}

.user-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-info {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--lt-text-primary, #303133);
}

.user-email {
  font-size: 12px;
  color: var(--lt-text-secondary, #909399);
  margin-top: 2px;
}
</style>
