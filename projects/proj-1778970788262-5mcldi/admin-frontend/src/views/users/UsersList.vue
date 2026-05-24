<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getUsers, banUser, unbanUser } from '@/api/users'
import type { ManagedUser, UserStatus } from '@/types/user'
import { UserStatusMap, UserStatusColorMap, LocaleMap } from '@/types/user'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import { formatDate } from '@/utils/format'

const router = useRouter()

const users = ref<ManagedUser[]>([])
const loading = ref(false)
const total = ref(0)

const filters = reactive({
  keyword: '',
  status: '' as UserStatus | '',
  page: 1,
  pageSize: 10,
})

async function fetchUsers() {
  loading.value = true
  try {
    const params: Record<string, unknown> = {
      page: filters.page,
      pageSize: filters.pageSize,
    }
    if (filters.keyword) params.keyword = filters.keyword
    if (filters.status) params.status = filters.status
    const res = await getUsers(params as any)
    const data = res.data.data
    users.value = data.items
    total.value = data.total
  } catch (err: any) {
    ElMessage.error(err?.response?.data?.message || '获取用户列表失败')
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  filters.page = 1
  fetchUsers()
}

function handlePageChange(page: number) {
  filters.page = page
  fetchUsers()
}

function handleSizeChange(size: number) {
  filters.pageSize = size
  filters.page = 1
  fetchUsers()
}

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
    fetchUsers()
  } catch (err: any) {
    if (err?.response) ElMessage.error(err.response.data?.message || '封禁失败')
  }
}

async function handleUnban(user: ManagedUser) {
  try {
    await ElMessageBox.confirm(`确定解封用户「${user.name}」?`, '解封确认', { type: 'success' })
    await unbanUser(user.id)
    ElMessage.success(`已解封用户「${user.name}」`)
    fetchUsers()
  } catch (err: any) {
    if (err?.response) ElMessage.error(err.response.data?.message || '解封失败')
  }
}

onMounted(() => {
  fetchUsers()
})
</script>

<template>
  <div class="users-page">
    <div class="page-header">
      <h2>用户管理</h2>
      <span class="page-desc">管理系统注册用户，查看用户详情，进行封禁/解封操作</span>
    </div>

    <!-- 筛选栏 -->
    <el-card shadow="never" class="filter-card">
      <el-row :gutter="16" align="middle">
        <el-col :xs="24" :sm="8" :md="6">
          <el-input
            v-model="filters.keyword"
            placeholder="搜索用户名 / 邮箱"
            clearable
            :prefix-icon="Search"
            @keyup.enter="handleSearch"
            @clear="handleSearch"
          />
        </el-col>
        <el-col :xs="12" :sm="6" :md="4">
          <el-select
            v-model="filters.status"
            placeholder="用户状态"
            clearable
            @change="handleSearch"
            style="width: 100%"
          >
            <el-option label="全部" value="" />
            <el-option label="正常" value="active" />
            <el-option label="已封禁" value="banned" />
          </el-select>
        </el-col>
        <el-col :xs="12" :sm="4" :md="3">
          <el-button type="primary" @click="handleSearch">搜索</el-button>
        </el-col>
      </el-row>
    </el-card>

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
          v-model:current-page="filters.page"
          v-model:page-size="filters.pageSize"
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

.filter-card {
  margin-bottom: 16px;
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
