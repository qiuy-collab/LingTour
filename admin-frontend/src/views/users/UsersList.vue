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
      `Ban "${user.name}"? They will no longer be able to sign in or use the service.`,
      'Confirm ban',
      { confirmButtonText: 'Ban user', cancelButtonText: 'Cancel', type: 'warning' }
    )
    await banUser(user.id)
    ElMessage.success(`Banned "${user.name}"`)
    fetchList()
  } catch (err: any) {
    if (err?.response) ElMessage.error(err.response.data?.message || 'Failed to ban user')
  }
}

async function handleUnban(user: ManagedUser) {
  try {
    await ElMessageBox.confirm(`Unban "${user.name}"?`, 'Confirm unban', { type: 'success' })
    await unbanUser(user.id)
    ElMessage.success(`Unbanned "${user.name}"`)
    fetchList()
  } catch (err: any) {
    if (err?.response) ElMessage.error(err.response.data?.message || 'Failed to unban user')
  }
}
</script>

<template>
  <div class="users-page">
    <div class="page-header">
      <h2>Users</h2>
      <span class="page-desc">Review registered accounts and manage access.</span>
    </div>

    <!-- 筛选栏 -->
    <ListToolbar
      v-model="filters.keyword"
      search-placeholder="Search by name or email"
      @search="handleSearch"
      @reset="handleReset"
    >
      <el-select
        v-model="filters.status"
        placeholder="Account status"
        clearable
        style="width: 140px"
        @change="handleSearch"
      >
        <el-option label="All" value="" />
        <el-option label="Active" value="active" />
        <el-option label="Banned" value="banned" />
      </el-select>
    </ListToolbar>

    <!-- 用户表格 -->
    <el-card shadow="never" class="table-card">
      <el-table :data="users" v-loading="loading" stripe style="width: 100%">
        <el-table-column label="User" min-width="200">
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
        <el-table-column prop="locale" label="Locale" width="90" align="center">
          <template #default="{ row }">
            <el-tag size="small" type="info">{{ LocaleMap[row.locale] || row.locale }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="Joined" width="130" align="center">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column prop="bookingsCount" label="Bookings" width="90" align="center" />
        <el-table-column prop="ordersCount" label="Orders" width="90" align="center" />
        <el-table-column prop="status" label="Status" width="90" align="center">
          <template #default="{ row }">
            <el-tag :type="(UserStatusColorMap as Record<string, string>)[row.status]" size="small">
              {{ (UserStatusMap as Record<string, string>)[row.status] }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Actions" width="200" align="center" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="primary" link @click="handleViewDetail(row)">
              Details
            </el-button>
            <template v-if="row.status === 'active'">
              <el-button size="small" type="danger" link @click="handleBan(row)">Ban</el-button>
            </template>
            <template v-else>
              <el-button size="small" type="success" link @click="handleUnban(row)">
                Unban
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
