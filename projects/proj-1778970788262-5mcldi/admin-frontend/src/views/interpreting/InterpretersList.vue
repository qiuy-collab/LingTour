<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { interpretersApi } from '@/api/interpreters'
import { InterpreterStatusMap, InterpreterStatusColorMap } from '@/types/interpreting'
import type { Interpreter } from '@/types/interpreting'

const router = useRouter()
const loading = ref(false)
const list = ref<Interpreter[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)
const statusFilter = ref('')

async function fetchList() {
  loading.value = true
  try {
    const res = await interpretersApi.getInterpreters({
      page: page.value,
      pageSize: pageSize.value,
      status: statusFilter.value,
    } as any)
    list.value = res.data.data.items
    total.value = res.data.data.total
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  page.value = 1
  fetchList()
}

function handlePageChange(p: number) {
  page.value = p
  fetchList()
}

function handleSizeChange(s: number) {
  pageSize.value = s
  page.value = 1
  fetchList()
}

function handleCreate() {
  router.push('/admin/interpreting/profiles/create')
}

function handleEdit(id: string) {
  router.push(`/admin/interpreting/profiles/${id}/edit`)
}

async function handleDelete(id: string, name: string) {
  try {
    await interpretersApi.deleteInterpreter(id)
    ElMessage.success(`口译员「${name}」已删除`)
    fetchList()
  } catch {
    ElMessage.error('删除失败')
  }
}

async function handleApprove(row: Interpreter) {
  try {
    await ElMessageBox.confirm(
      `确定审核通过「${row.name}」？通过后将变为已激活状态。`,
      '审核确认',
      { confirmButtonText: '通过', cancelButtonText: '取消', type: 'success' }
    )
    await interpretersApi.updateStatus(row.id, 'active')
    ElMessage.success(`${row.name} 审核通过，已激活`)
    fetchList()
  } catch { /* cancelled */ }
}

async function handleReject(row: Interpreter) {
  try {
    await ElMessageBox.confirm(
      `确定拒绝「${row.name}」的申请？拒绝后将变为已禁用状态。`,
      '拒绝确认',
      { confirmButtonText: '拒绝', cancelButtonText: '取消', type: 'warning' }
    )
    await interpretersApi.updateStatus(row.id, 'inactive')
    ElMessage.info(`${row.name} 已拒绝，状态变为已禁用`)
    fetchList()
  } catch { /* cancelled */ }
}

async function handleDisable(row: Interpreter) {
  try {
    await ElMessageBox.confirm(
      `确定禁用「${row.name}」？`,
      '禁用确认',
      { confirmButtonText: '禁用', cancelButtonText: '取消', type: 'warning' }
    )
    await interpretersApi.updateStatus(row.id, 'inactive')
    ElMessage.info(`${row.name} 已禁用`)
    fetchList()
  } catch { /* cancelled */ }
}

async function handleEnable(row: Interpreter) {
  await interpretersApi.updateStatus(row.id, 'active')
  ElMessage.success(`${row.name} 已启用`)
  fetchList()
}

onMounted(() => {
  fetchList()
})
</script>

<template>
  <div class="page-container">
    <div class="page-header">
      <h2>口译员管理</h2>
      <el-button type="primary" @click="handleCreate">新增口译员</el-button>
    </div>

    <div class="search-bar">
      <el-select v-model="statusFilter" placeholder="状态筛选" clearable style="width: 160px" @change="handleSearch">
        <el-option label="全部" value="" />
        <el-option label="待审核" value="pending_review" />
        <el-option label="已激活" value="active" />
        <el-option label="已禁用" value="inactive" />
      </el-select>
    </div>

    <el-table :data="list" v-loading="loading" stripe>
      <el-table-column label="头像" width="70">
        <template #default="{ row }">
          <el-avatar v-if="row.avatar" :src="row.avatar" :size="40" />
          <el-avatar v-else :size="40">{{ row.name.charAt(0) }}</el-avatar>
        </template>
      </el-table-column>
      <el-table-column prop="name" label="姓名" width="100" />
      <el-table-column prop="language" label="服务语种" width="200" show-overflow-tooltip />
      <el-table-column label="专注领域" min-width="180">
        <template #default="{ row }">
          <div>{{ row.focus }}</div>
          <div style="font-size: 12px; color: #909399">{{ row.focusEn }}</div>
        </template>
      </el-table-column>
      <el-table-column label="能力标签" min-width="200">
        <template #default="{ row }">
          <el-tag v-for="h in row.helps" :key="h" size="small" style="margin: 2px 2px">{{ h }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="city" label="服务城市" width="100" align="center" />
      <el-table-column label="状态" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="(InterpreterStatusColorMap as Record<string, string>)[row.status]" size="small">
            {{ (InterpreterStatusMap as Record<string, string>)[row.status] }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="280" fixed="right">
        <template #default="{ row }">
          <el-button size="small" @click="handleEdit(row.id)">编辑</el-button>
          <template v-if="row.status === 'pending_review'">
            <el-button size="small" type="success" @click="handleApprove(row)">通过</el-button>
            <el-button size="small" type="warning" @click="handleReject(row)">拒绝</el-button>
          </template>
          <template v-if="row.status === 'active'">
            <el-button size="small" type="warning" @click="handleDisable(row)">禁用</el-button>
          </template>
          <template v-if="row.status === 'inactive'">
            <el-button size="small" type="success" @click="handleEnable(row)">启用</el-button>
          </template>
          <el-popconfirm title="确定删除该口译员？" @confirm="handleDelete(row.id, row.name)">
            <template #reference>
              <el-button size="small" type="danger">删除</el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-wrap" v-if="total > pageSize">
      <el-pagination
        v-model:current-page="page"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next"
        @current-change="handlePageChange"
        @size-change="handleSizeChange"
      />
    </div>
  </div>
</template>

<style scoped>
.page-container { padding: 20px; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.page-header h2 { margin: 0; font-size: 20px; }
.search-bar { display: flex; gap: 12px; margin-bottom: 16px; }
.pagination-wrap { margin-top: 16px; display: flex; justify-content: flex-end; }
</style>
