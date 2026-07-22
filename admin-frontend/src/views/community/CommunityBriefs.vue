<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, reactive, ref } from 'vue'
import { Delete, Edit, Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { gsap } from 'gsap'
import {
  createCommunityBrief,
  deleteCommunityBrief,
  getCommunityBriefs,
  updateCommunityBrief,
} from '@/api/community-briefs'
import type { CommunityBrief, CommunityBriefPayload } from '@/types/community-brief'
import { extractErrorMessage } from '@/utils/i18n'
import { formatDateTime } from '@/utils/format'
import { prefersReducedMotion } from '@/utils/motion'

const formRef = ref<FormInstance>()
const listRef = ref<HTMLElement | null>(null)
const loading = ref(false)
const saving = ref(false)
const dialogVisible = ref(false)
const editingId = ref('')
const briefs = ref<CommunityBrief[]>([])
let motionContext: ReturnType<typeof gsap.context> | null = null

const channels = ['Field Notes', 'Food Map', 'Hidden Stop', 'Culture Desk']
const form = reactive<CommunityBriefPayload>({
  slug: '',
  title: { zh: '', en: '' },
  prompt: { zh: '', en: '' },
  channel: 'Field Notes',
  location: '',
  route: '',
  mood: '',
  sortOrder: 0,
  active: true,
})

const dialogTitle = computed(() => (editingId.value ? '编辑发帖引导' : '新增发帖引导'))
const previewTitle = computed(() => form.title.zh || form.title.en || '引导标题')
const previewPrompt = computed(() => form.prompt.zh || form.prompt.en || '引导用户记录什么？')

const rules: FormRules<CommunityBriefPayload> = {
  slug: [
    { required: true, message: '请输入唯一标识', trigger: 'blur' },
    {
      pattern: /^[a-z0-9](?:[a-z0-9-]{0,78}[a-z0-9])?$/,
      message: '仅使用小写字母、数字和连字符',
      trigger: 'blur',
    },
  ],
  channel: [{ required: true, message: '请选择社区栏目', trigger: 'change' }],
}

function resetForm() {
  editingId.value = ''
  Object.assign(form, {
    slug: '',
    title: { zh: '', en: '' },
    prompt: { zh: '', en: '' },
    channel: 'Field Notes',
    location: '',
    route: '',
    mood: '',
    sortOrder: briefs.value.length,
    active: true,
  })
  formRef.value?.clearValidate()
}

async function animateRows() {
  await nextTick()
  motionContext?.revert()
  if (!listRef.value || prefersReducedMotion()) return
  motionContext = gsap.context(() => {
    gsap.fromTo(
      '[data-brief-row]',
      { autoAlpha: 0, y: 10 },
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.34,
        stagger: 0.04,
        ease: 'power2.out',
        clearProps: 'all',
      },
    )
  }, listRef.value)
}

async function fetchBriefs() {
  loading.value = true
  try {
    const response = await getCommunityBriefs()
    briefs.value = response.data.data.data || []
    await animateRows()
  } catch (error) {
    ElMessage.error(extractErrorMessage(error, '发帖引导加载失败'))
  } finally {
    loading.value = false
  }
}

function openCreate() {
  resetForm()
  dialogVisible.value = true
}

function openEdit(brief: CommunityBrief) {
  editingId.value = brief.id
  Object.assign(form, {
    slug: brief.slug,
    title: { ...brief.title },
    prompt: { ...brief.prompt },
    channel: brief.channel,
    location: brief.location || '',
    route: brief.route || '',
    mood: brief.mood || '',
    sortOrder: brief.sortOrder,
    active: brief.active,
  })
  dialogVisible.value = true
}

async function submitForm() {
  if (!(await formRef.value?.validate().catch(() => false))) return
  if (!form.title.zh.trim() || !form.title.en.trim()) {
    ElMessage.warning('请填写中英文标题')
    return
  }
  if (!form.prompt.zh.trim() || !form.prompt.en.trim()) {
    ElMessage.warning('请填写中英文引导文案')
    return
  }

  saving.value = true
  try {
    const payload: CommunityBriefPayload = {
      ...form,
      slug: form.slug.trim(),
      title: { zh: form.title.zh.trim(), en: form.title.en.trim() },
      prompt: { zh: form.prompt.zh.trim(), en: form.prompt.en.trim() },
      location: form.location.trim(),
      route: form.route.trim(),
      mood: form.mood.trim(),
    }
    if (editingId.value) {
      await updateCommunityBrief(editingId.value, payload)
      ElMessage.success('发帖引导已更新')
    } else {
      await createCommunityBrief(payload)
      ElMessage.success('发帖引导已创建')
    }
    dialogVisible.value = false
    await fetchBriefs()
  } catch (error) {
    ElMessage.error(extractErrorMessage(error, '保存失败'))
  } finally {
    saving.value = false
  }
}

async function removeBrief(brief: CommunityBrief) {
  try {
    await ElMessageBox.confirm(`确定删除“${brief.title.zh || brief.title.en}”？`, '删除发帖引导', {
      type: 'warning',
      confirmButtonText: '删除',
      cancelButtonText: '取消',
    })
    await deleteCommunityBrief(brief.id)
    ElMessage.success('发帖引导已删除')
    await fetchBriefs()
  } catch (error: any) {
    if (error === 'cancel' || error?.toString?.().includes('cancel')) return
    ElMessage.error(extractErrorMessage(error, '删除失败'))
  }
}

void fetchBriefs()
onBeforeUnmount(() => motionContext?.revert())
</script>

<template>
  <div class="brief-page">
    <header class="brief-header">
      <div>
        <p>社区内容</p>
        <h2>发帖引导</h2>
        <span>管理社区页向用户展示的记录主题和预填信息。</span>
      </div>
      <el-button type="primary" :icon="Plus" @click="openCreate">新增引导</el-button>
    </header>

    <section ref="listRef" v-loading="loading" class="brief-list">
      <div class="brief-table-head" aria-hidden="true">
        <span>标题与文案</span><span>栏目</span><span>排序</span><span>状态</span><span>更新</span><span>操作</span>
      </div>
      <article v-for="brief in briefs" :key="brief.id" class="brief-row" data-brief-row>
        <div class="brief-copy">
          <strong>{{ brief.title.zh || brief.title.en }}</strong>
          <span>{{ brief.prompt.zh || brief.prompt.en }}</span>
          <small>{{ brief.slug }}</small>
        </div>
        <div><span class="mobile-label">栏目</span>{{ brief.channel }}</div>
        <div><span class="mobile-label">排序</span>{{ brief.sortOrder }}</div>
        <div>
          <span class="mobile-label">状态</span>
          <el-tag :type="brief.active ? 'success' : 'info'">{{ brief.active ? '已上线' : '已下线' }}</el-tag>
        </div>
        <div class="brief-date"><span class="mobile-label">更新</span>{{ formatDateTime(brief.updatedAt) }}</div>
        <div class="brief-actions">
          <el-button text :icon="Edit" @click="openEdit(brief)">编辑</el-button>
          <el-button text type="danger" :icon="Delete" @click="removeBrief(brief)">删除</el-button>
        </div>
      </article>
      <el-empty v-if="!loading && briefs.length === 0" description="还没有发帖引导" />
    </section>

    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="min(920px, calc(100vw - 32px))"
      destroy-on-close
    >
      <div class="dialog-layout">
        <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
          <el-form-item label="唯一标识" prop="slug">
            <el-input v-model="form.slug" placeholder="例如：morning-market-story" />
            <small class="field-hint">保存后尽量不要修改，用于稳定识别这条引导。</small>
          </el-form-item>

          <div class="locale-grid">
            <el-form-item label="中文标题"><el-input v-model="form.title.zh" /></el-form-item>
            <el-form-item label="English title"><el-input v-model="form.title.en" /></el-form-item>
          </div>
          <div class="locale-grid">
            <el-form-item label="中文引导文案">
              <el-input v-model="form.prompt.zh" type="textarea" :rows="4" />
            </el-form-item>
            <el-form-item label="English prompt">
              <el-input v-model="form.prompt.en" type="textarea" :rows="4" />
            </el-form-item>
          </div>

          <div class="meta-grid">
            <el-form-item label="社区栏目" prop="channel">
              <el-select v-model="form.channel" style="width: 100%">
                <el-option v-for="channel in channels" :key="channel" :label="channel" :value="channel" />
              </el-select>
            </el-form-item>
            <el-form-item label="排序"><el-input-number v-model="form.sortOrder" :min="0" /></el-form-item>
            <el-form-item label="上线状态"><el-switch v-model="form.active" /></el-form-item>
          </div>
          <div class="meta-grid">
            <el-form-item label="默认地点"><el-input v-model="form.location" /></el-form-item>
            <el-form-item label="默认路线"><el-input v-model="form.route" /></el-form-item>
            <el-form-item label="默认氛围"><el-input v-model="form.mood" /></el-form-item>
          </div>
        </el-form>

        <aside class="brief-preview" aria-label="前台内容预览">
          <span>前台预览</span>
          <small>{{ form.channel }}</small>
          <h3>{{ previewTitle }}</h3>
          <p>{{ previewPrompt }}</p>
          <div>
            <em v-if="form.location">{{ form.location }}</em>
            <em v-if="form.route">{{ form.route }}</em>
            <em v-if="form.mood">{{ form.mood }}</em>
          </div>
        </aside>
      </div>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="submitForm">保存引导</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.brief-page {
  display: grid;
  min-width: 0;
  gap: 20px;
}

.brief-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
}

.brief-header p,
.brief-header h2,
.brief-header span {
  margin: 0;
}

.brief-header p {
  color: var(--lt-primary);
  font-size: 11px;
  font-weight: 750;
  letter-spacing: 0.14em;
}

.brief-header h2 {
  margin-block: 5px 7px;
  color: var(--lt-text-primary);
  font-size: clamp(24px, 3vw, 34px);
  letter-spacing: -0.03em;
}

.brief-header span,
.brief-date {
  color: var(--lt-text-secondary);
}

.brief-list {
  min-height: 180px;
  overflow: hidden;
  border: 1px solid var(--lt-border-light);
  border-radius: var(--lt-radius-lg);
  background: var(--lt-bg-card);
}

.brief-table-head,
.brief-row {
  display: grid;
  grid-template-columns: minmax(280px, 1.5fr) 120px 70px 100px 150px 150px;
  align-items: center;
  gap: 14px;
}

.brief-table-head {
  padding: 12px 18px;
  border-bottom: 1px solid var(--lt-border-light);
  color: var(--lt-text-secondary);
  font-size: 11px;
  font-weight: 700;
}

.brief-row {
  min-height: 96px;
  padding: 15px 18px;
  border-bottom: 1px solid var(--lt-border-light);
}

.brief-row:last-child {
  border-bottom: 0;
}

.brief-copy {
  display: grid;
  min-width: 0;
  gap: 4px;
}

.brief-copy strong,
.brief-copy span,
.brief-copy small {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.brief-copy span,
.brief-copy small,
.brief-date {
  font-size: 12px;
}

.brief-copy span {
  color: var(--lt-text-secondary);
}

.brief-copy small {
  color: var(--lt-text-placeholder);
}

.brief-actions {
  display: flex;
  justify-content: flex-end;
}

.mobile-label {
  display: none;
}

.dialog-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(240px, 0.55fr);
  gap: 22px;
}

.locale-grid,
.meta-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0 14px;
}

.meta-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.field-hint {
  margin-top: 5px;
  color: var(--lt-text-secondary);
}

.brief-preview {
  align-self: start;
  padding: 22px;
  border: 1px solid color-mix(in srgb, var(--lt-primary) 18%, var(--lt-border-color));
  border-radius: var(--lt-radius-xl);
  background: color-mix(in srgb, var(--lt-primary-soft) 38%, var(--lt-bg-card));
}

.brief-preview > span {
  color: var(--lt-primary);
  font-size: 10px;
  font-weight: 750;
  letter-spacing: 0.12em;
}

.brief-preview > small {
  display: block;
  margin-top: 24px;
  color: var(--lt-text-secondary);
}

.brief-preview h3 {
  margin: 8px 0 14px;
  color: var(--lt-text-primary);
  font-size: 24px;
  line-height: 1.25;
}

.brief-preview p {
  color: var(--lt-text-regular);
  line-height: 1.7;
}

.brief-preview div {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 18px;
}

.brief-preview em {
  padding: 5px 8px;
  border-radius: 999px;
  background: var(--lt-bg-card);
  color: var(--lt-text-secondary);
  font-size: 10px;
  font-style: normal;
}

@media (max-width: 980px) {
  .brief-table-head {
    display: none;
  }

  .brief-list {
    display: grid;
    gap: 12px;
    overflow: visible;
    border: 0;
    background: transparent;
  }

  .brief-row {
    grid-template-columns: repeat(4, minmax(0, 1fr));
    border: 1px solid var(--lt-border-light);
    border-radius: var(--lt-radius-lg);
    background: var(--lt-bg-card);
  }

  .brief-copy,
  .brief-actions {
    grid-column: 1 / -1;
  }

  .brief-copy {
    padding-bottom: 12px;
    border-bottom: 1px solid var(--lt-border-light);
  }

  .brief-actions {
    justify-content: flex-start;
  }

  .mobile-label {
    display: block;
    margin-bottom: 5px;
    color: var(--lt-text-secondary);
    font-size: 10px;
  }

  .dialog-layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .brief-header {
    align-items: stretch;
    flex-direction: column;
  }

  .brief-row {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    padding: 14px;
  }

  .locale-grid,
  .meta-grid {
    grid-template-columns: 1fr;
  }
}
</style>
