<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, reactive, ref, watch } from 'vue'
import { Delete, Edit, Plus, Search } from '@element-plus/icons-vue'
import {
  ElMessage,
  ElMessageBox,
  type FormInstance,
  type FormRules,
} from 'element-plus'
import { gsap } from 'gsap'
import {
  createStaffAccount,
  deleteStaffAccount,
  getStaffAccounts,
  updateStaffAccount,
} from '@/api/staff'
import type {
  StaffAccount,
  StaffAccountPayload,
  StaffRole,
  StaffStatus,
} from '@/types/staff'
import { formatDateTime } from '@/utils/format'
import { extractErrorMessage } from '@/utils/i18n'
import { useAuthStore } from '@/store/auth'

const authStore = useAuthStore()
const listRef = ref<HTMLElement | null>(null)
const formRef = ref<FormInstance>()
const loading = ref(false)
const saving = ref(false)
const dialogVisible = ref(false)
const editingId = ref('')
const accounts = ref<StaffAccount[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(20)
const filters = reactive<{
  keyword: string
  role: StaffRole | ''
  status: StaffStatus | ''
}>({
  keyword: '',
  role: '',
  status: '',
})
const form = reactive<StaffAccountPayload>({
  email: '',
  name: '',
  role: 'editor',
  status: 'active',
  password: '',
})

let listAnimation: ReturnType<typeof gsap.context> | null = null

const isEditing = computed(() => Boolean(editingId.value))
const dialogTitle = computed(() =>
  isEditing.value ? '编辑管理员账号' : '添加管理员账号',
)

const rules: FormRules<StaffAccountPayload> = {
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' },
    { min: 2, max: 100, message: '姓名长度为 2–100 个字符', trigger: 'blur' },
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入有效邮箱', trigger: 'blur' },
  ],
  role: [{ required: true, message: '请选择角色', trigger: 'change' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }],
  password: [
    {
      validator: (_rule, value: string, callback) => {
        if (!value && isEditing.value) return callback()
        if (!value) return callback(new Error('请输入初始密码'))
        if (
          value.length < 10 ||
          !/[a-z]/.test(value) ||
          !/[A-Z]/.test(value) ||
          !/\d/.test(value)
        ) {
          return callback(new Error('至少 10 位，并包含大小写字母和数字'))
        }
        callback()
      },
      trigger: 'blur',
    },
  ],
}

async function animateList() {
  await nextTick()
  listAnimation?.revert()
  if (!listRef.value) return
  listAnimation = gsap.context(() => {
    const media = gsap.matchMedia()
    media.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.fromTo(
        '[data-staff-row]',
        { autoAlpha: 0, y: 10 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.35,
          stagger: 0.035,
          ease: 'power2.out',
          clearProps: 'all',
        },
      )
    })
    return () => media.revert()
  }, listRef.value)
}

async function fetchAccounts() {
  loading.value = true
  try {
    const response = await getStaffAccounts({
      page: page.value,
      pageSize: pageSize.value,
      keyword: filters.keyword || undefined,
      role: filters.role || undefined,
      status: filters.status || undefined,
    })
    const payload = response.data.data
    accounts.value = payload.data || []
    total.value = payload.total || 0
    await animateList()
  } catch (error) {
    ElMessage.error(extractErrorMessage(error, '管理员账号加载失败'))
  } finally {
    loading.value = false
  }
}

function resetForm() {
  editingId.value = ''
  Object.assign(form, {
    email: '',
    name: '',
    role: 'editor',
    status: 'active',
    password: '',
  })
  formRef.value?.clearValidate()
}

function openCreate() {
  resetForm()
  dialogVisible.value = true
}

function openEdit(account: StaffAccount) {
  editingId.value = account.id
  Object.assign(form, {
    email: account.email,
    name: account.name,
    role: account.role,
    status: account.status,
    password: '',
  })
  dialogVisible.value = true
}

async function submitForm() {
  if (!(await formRef.value?.validate().catch(() => false))) return
  saving.value = true
  try {
    const payload: StaffAccountPayload = {
      email: form.email.trim(),
      name: form.name.trim(),
      role: form.role,
      status: form.status,
      ...(form.password ? { password: form.password } : {}),
    }
    if (editingId.value) {
      await updateStaffAccount(editingId.value, payload)
      ElMessage.success('管理员账号已更新')
    } else {
      await createStaffAccount(payload)
      ElMessage.success('管理员账号已创建')
    }
    dialogVisible.value = false
    await fetchAccounts()
  } catch (error) {
    ElMessage.error(extractErrorMessage(error, '保存失败'))
  } finally {
    saving.value = false
  }
}

async function removeAccount(account: StaffAccount) {
  try {
    await ElMessageBox.confirm(
      `确定删除“${account.name}”的后台账号？此操作不可恢复。`,
      '删除管理员账号',
      { type: 'warning', confirmButtonText: '删除', cancelButtonText: '取消' },
    )
    await deleteStaffAccount(account.id)
    ElMessage.success('管理员账号已删除')
    await fetchAccounts()
  } catch (error: any) {
    if (error === 'cancel' || error?.toString?.().includes('cancel')) return
    ElMessage.error(extractErrorMessage(error, '删除失败'))
  }
}

function applyFilters() {
  page.value = 1
  void fetchAccounts()
}

watch(page, () => void fetchAccounts(), { immediate: true })
onBeforeUnmount(() => listAnimation?.revert())
</script>

<template>
  <div class="staff-page">
    <header class="staff-header">
      <div>
        <p class="staff-eyebrow">系统权限</p>
        <h2>管理员账号</h2>
        <p>管理可进入后台的管理员与内容编辑账号。</p>
      </div>
      <el-button type="primary" :icon="Plus" @click="openCreate"
        >添加账号</el-button
      >
    </header>

    <section class="staff-toolbar" aria-label="账号筛选">
      <el-input
        v-model="filters.keyword"
        :prefix-icon="Search"
        clearable
        placeholder="搜索姓名或邮箱"
        @keyup.enter="applyFilters"
        @clear="applyFilters"
      />
      <el-select
        v-model="filters.role"
        clearable
        placeholder="全部角色"
        @change="applyFilters"
      >
        <el-option label="管理员" value="admin" />
        <el-option label="内容编辑" value="editor" />
      </el-select>
      <el-select
        v-model="filters.status"
        clearable
        placeholder="全部状态"
        @change="applyFilters"
      >
        <el-option label="启用" value="active" />
        <el-option label="停用" value="banned" />
      </el-select>
      <el-button @click="applyFilters">查询</el-button>
    </section>

    <section ref="listRef" class="staff-list" v-loading="loading">
      <div class="staff-table-head" aria-hidden="true">
        <span>账号</span><span>角色</span><span>状态</span><span>创建时间</span
        ><span>操作</span>
      </div>
      <article
        v-for="account in accounts"
        :key="account.id"
        data-staff-row
        class="staff-row"
      >
        <div class="staff-identity">
          <span class="staff-avatar">{{
            account.name.slice(0, 1).toUpperCase()
          }}</span>
          <div>
            <strong>{{ account.name }}</strong>
            <span>{{ account.email }}</span>
          </div>
        </div>
        <div>
          <span class="mobile-label">角色</span
          ><el-tag effect="plain">{{
            account.role === 'admin' ? '管理员' : '内容编辑'
          }}</el-tag>
        </div>
        <div>
          <span class="mobile-label">状态</span
          ><el-tag :type="account.status === 'active' ? 'success' : 'info'">{{
            account.status === 'active' ? '启用' : '停用'
          }}</el-tag>
        </div>
        <div class="staff-date">
          <span class="mobile-label">创建</span
          >{{ formatDateTime(account.createdAt) }}
        </div>
        <div class="staff-actions">
          <el-button text :icon="Edit" @click="openEdit(account)"
            >编辑</el-button
          >
          <el-button
            text
            type="danger"
            :icon="Delete"
            :disabled="account.id === authStore.currentUser?.id"
            @click="removeAccount(account)"
            >删除</el-button
          >
        </div>
      </article>
      <el-empty
        v-if="!loading && accounts.length === 0"
        description="没有符合条件的管理员账号"
      />
    </section>

    <el-pagination
      v-if="total > pageSize"
      v-model:current-page="page"
      :page-size="pageSize"
      :total="total"
      layout="prev, pager, next"
      class="staff-pagination"
    />

    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="min(560px, calc(100vw - 32px))"
      destroy-on-close
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
        <div class="form-grid">
          <el-form-item label="姓名" prop="name"
            ><el-input v-model="form.name"
          /></el-form-item>
          <el-form-item label="邮箱" prop="email"
            ><el-input v-model="form.email"
          /></el-form-item>
          <el-form-item label="角色" prop="role">
            <el-select v-model="form.role" style="width: 100%">
              <el-option label="管理员（完整权限）" value="admin" />
              <el-option label="内容编辑（内容与订单）" value="editor" />
            </el-select>
          </el-form-item>
          <el-form-item label="状态" prop="status">
            <el-select v-model="form.status" style="width: 100%">
              <el-option label="启用" value="active" />
              <el-option label="停用" value="banned" />
            </el-select>
          </el-form-item>
        </div>
        <el-form-item
          :label="isEditing ? '重置密码（选填）' : '初始密码'"
          prop="password"
        >
          <el-input
            v-model="form.password"
            type="password"
            show-password
            autocomplete="new-password"
          />
          <p class="password-hint">至少 10 位，并包含大小写字母和数字。</p>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="submitForm"
          >保存账号</el-button
        >
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.staff-page {
  display: grid;
  gap: 20px;
  min-width: 0;
}
.staff-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
}
.staff-header h2 {
  margin: 4px 0 6px;
  color: var(--lt-text-primary);
  font-size: clamp(24px, 3vw, 34px);
  letter-spacing: -0.03em;
}
.staff-header p {
  margin: 0;
  color: var(--lt-text-secondary);
}
.staff-eyebrow {
  color: var(--lt-primary) !important;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}
.staff-toolbar {
  display: grid;
  grid-template-columns: minmax(220px, 1fr) 150px 150px auto;
  gap: 10px;
  padding: 14px;
  border: 1px solid var(--lt-border-light);
  border-radius: var(--lt-radius-lg);
  background: var(--lt-bg-card);
}
.staff-list {
  min-height: 180px;
  overflow: hidden;
  border: 1px solid var(--lt-border-light);
  border-radius: var(--lt-radius-lg);
  background: var(--lt-bg-card);
}
.staff-table-head,
.staff-row {
  display: grid;
  grid-template-columns: minmax(260px, 1.4fr) 130px 110px 170px 160px;
  align-items: center;
  gap: 16px;
}
.staff-table-head {
  padding: 12px 18px;
  border-bottom: 1px solid var(--lt-border-light);
  color: var(--lt-text-secondary);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
}
.staff-row {
  min-height: 82px;
  padding: 14px 18px;
  border-bottom: 1px solid var(--lt-border-light);
}
.staff-row:last-child {
  border-bottom: 0;
}
.staff-identity {
  display: flex;
  align-items: center;
  min-width: 0;
  gap: 12px;
}
.staff-avatar {
  display: grid;
  width: 42px;
  height: 42px;
  flex: 0 0 auto;
  place-items: center;
  border-radius: 50%;
  background: var(--lt-primary-soft);
  color: var(--lt-primary);
  font-weight: 700;
}
.staff-identity div {
  display: grid;
  min-width: 0;
  gap: 3px;
}
.staff-identity strong,
.staff-identity span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.staff-identity span,
.staff-date {
  color: var(--lt-text-secondary);
  font-size: 12px;
}
.staff-actions {
  display: flex;
  justify-content: flex-end;
}
.staff-pagination {
  justify-self: end;
}
.mobile-label {
  display: none;
}
.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0 16px;
}
.password-hint {
  margin: 6px 0 0;
  color: var(--lt-text-secondary);
  font-size: 12px;
}

@media (max-width: 980px) {
  .staff-table-head {
    display: none;
  }
  .staff-list {
    display: grid;
    gap: 12px;
    border: 0;
    background: transparent;
    overflow: visible;
  }
  .staff-row {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 14px;
    border: 1px solid var(--lt-border-light);
    border-radius: var(--lt-radius-lg);
    background: var(--lt-bg-card);
  }
  .staff-identity {
    grid-column: 1 / -1;
    padding-bottom: 12px;
    border-bottom: 1px solid var(--lt-border-light);
  }
  .staff-actions {
    grid-column: 1 / -1;
    justify-content: flex-start;
  }
  .mobile-label {
    display: block;
    margin-bottom: 5px;
    color: var(--lt-text-secondary);
    font-size: 11px;
  }
}

@media (max-width: 640px) {
  .staff-header {
    align-items: stretch;
    flex-direction: column;
  }
  .staff-toolbar {
    grid-template-columns: 1fr 1fr;
  }
  .staff-toolbar :deep(.el-input) {
    grid-column: 1 / -1;
  }
  .staff-row {
    grid-template-columns: 1fr 1fr;
    padding: 14px;
  }
  .staff-date {
    grid-column: 1 / -1;
  }
  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
