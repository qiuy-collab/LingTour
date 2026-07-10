<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { FormInstance } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { citiesApi } from '@/api/cities'
import { eventsApi } from '@/api/events'
import { routesApi } from '@/api/routes'
import type { EventFormData } from '@/types/event'
import { EventStatusMap } from '@/types/event'
import { pickI18n, toI18n } from '@/types/common'
import { extractErrorMessage } from '@/utils/i18n'
import { useDirtyForm } from '@/composables/useDirtyForm'
import EditorPageHeader from '@/components/editor/EditorPageHeader.vue'
import EditorWorkspace, { type EditorWorkspaceTab } from '@/components/editor/EditorWorkspace.vue'
import I18nInput from '@/components/I18nInput.vue'
import I18nMarkdownEditor from '@/components/I18nMarkdownEditor.vue'
import ImageUpload from '@/components/ImageUpload.vue'

const router = useRouter()
const route = useRoute()
const isEdit = computed(() => !!route.params.id)
const loading = ref(false)
const saving = ref(false)
const formRef = ref<FormInstance>()
const cityOptions = ref<Array<{ slug: string; name: string; adcode: number }>>([])
const routeOptions = ref<Array<{ slug: string; title: string }>>([])
const newTag = ref('')
const activeWorkspace = ref('summary')

const rules = {
  slug: [
    { required: true, message: 'Enter a slug', trigger: 'blur' },
    { pattern: /^[a-z0-9]+(-[a-z0-9]+)*$/, message: 'Slug must use kebab-case', trigger: 'blur' },
  ],
  'title.en': [{ required: true, message: 'Enter the event name', trigger: 'blur' }],
  date: [{ required: true, message: 'Select a start date', trigger: 'change' }],
}

const form = reactive<EventFormData>({
  slug: '',
  title: { zh: '', en: '' },
  date: '',
  endDate: '',
  city: '',
  citySlug: '',
  adcode: 440100,
  tags: [],
  summary: { zh: '', en: '' },
  description: { zh: '', en: '' },
  relatedRouteSlugs: [],
  image: '',
  status: 'draft',
})

const { isDirty, resetDirty, disableDirtyCheck } = useDirtyForm({ form })

const statusOptions = computed(() =>
  Object.entries(EventStatusMap).map(([value, label]) => ({ value, label })),
)

const selectedCity = computed(() =>
  cityOptions.value.find((item) => item.slug === form.citySlug),
)

const selectedRoutes = computed(() =>
  form.relatedRouteSlugs
    .map((slug) => routeOptions.value.find((item) => item.slug === slug))
    .filter(Boolean) as Array<{ slug: string; title: string }>,
)

const checklist = computed(() => [
  { label: 'Event name', done: Boolean(form.title.en.trim()) },
  { label: 'Start date', done: Boolean(form.date) },
  { label: 'Linked city', done: Boolean(form.citySlug || form.city.trim()) },
  { label: 'Cover image', done: Boolean(form.image) },
  { label: 'Summary', done: Boolean(form.summary.en.trim()) },
  { label: 'Description', done: Boolean(form.description.en.trim()) },
])

const workspaceTabs = computed<EditorWorkspaceTab[]>(() => [
  { key: 'summary', label: 'Summary' },
  { key: 'description', label: 'Description' },
])

function addTag() {
  const value = newTag.value.trim()
  if (!value || form.tags.includes(value)) return
  form.tags.push(value)
  newTag.value = ''
}

function removeTag(index: number) {
  form.tags.splice(index, 1)
}

function handleCityChange(slug: string) {
  const city = cityOptions.value.find((item) => item.slug === slug)
  if (!city) return
  form.citySlug = city.slug
  form.city = city.name
  form.adcode = city.adcode
}

function fillFromApi(data: any) {
  Object.assign(form, {
    slug: data.slug || '',
    title: toI18n(data.title),
    date: data.date || '',
    endDate: data.endDate || '',
    city: data.city || '',
    citySlug: data.citySlug || '',
    adcode: Number(data.adcode || 0),
    tags: Array.isArray(data.tags) ? [...data.tags] : [],
    summary: toI18n(data.summary),
    description: toI18n(data.description),
    relatedRouteSlugs: Array.isArray(data.relatedRouteSlugs) ? [...data.relatedRouteSlugs] : [],
    image: data.image || '',
    status: data.status || 'draft',
  })
}

onMounted(async () => {
  loading.value = true
  try {
    const [citiesRes, routesRes] = await Promise.all([
      citiesApi.getCities({ page: 1, pageSize: 200 }),
      routesApi.getRoutes({ page: 1, pageSize: 200 }),
    ])

    cityOptions.value = (citiesRes.data.data.data || []).map((item: any) => ({
      slug: item.slug,
      name: pickI18n(item.name) || item.slug,
      adcode: Number(item.adcode || 0),
    }))

    routeOptions.value = (routesRes.data.data.data || []).map((item: any) => ({
      slug: item.slug,
      title: pickI18n(item.title) || item.slug,
    }))

    if (isEdit.value) {
      const res = await eventsApi.getEvent(route.params.id as string)
      fillFromApi(res.data.data)
    }

    resetDirty()
  } catch (err: any) {
    ElMessage.error(extractErrorMessage(err, 'Failed to load event data'))
    router.push('/admin/events')
  } finally {
    loading.value = false
  }
})

async function handleSave() {
  try {
    await formRef.value?.validate()
  } catch {
    ElMessage.warning('Complete the required fields')
    return
  }

  if (form.endDate && form.date) {
    const start = new Date(form.date)
    const end = new Date(form.endDate)
    if (!Number.isNaN(end.getTime()) && end < start) {
      ElMessage.error('End date cannot be earlier than start date')
      return
    }
  }

  saving.value = true
  try {
    if (isEdit.value) {
      await eventsApi.updateEvent(route.params.id as string, form)
      ElMessage.success('Event updated')
    } else {
      await eventsApi.createEvent(form)
      ElMessage.success('Event created')
    }
    disableDirtyCheck()
    router.push('/admin/events')
  } catch (error: any) {
    ElMessage.error(extractErrorMessage(error, 'Save failed'))
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="edit-page" v-loading="loading">
    <EditorPageHeader
      :title="isEdit ? 'Edit Event' : 'Create Event'"
      back-to="/admin/events"
      :saving="saving"
      :dirty="isDirty"
      @save="handleSave"
    />

    <div class="editor-shell">
      <el-form ref="formRef" :model="form" :rules="rules" class="editor-form" label-position="top">
        <el-card shadow="never" class="section-card">
          <template #header>Basic Information</template>
          <el-form-item label="Slug" prop="slug">
            <el-input v-model="form.slug" placeholder="dragon-boat-2026" />
          </el-form-item>
          <el-form-item label="Event Name" prop="title.en">
            <I18nInput v-model="form.title" />
          </el-form-item>
          <el-row :gutter="16">
            <el-col :span="8">
              <el-form-item label="Start Date" prop="date">
                <el-date-picker v-model="form.date" type="date" value-format="YYYY-MM-DD" style="width: 100%" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="End Date">
                <el-date-picker v-model="form.endDate" type="date" value-format="YYYY-MM-DD" style="width: 100%" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="Event Status">
                <el-select v-model="form.status" style="width: 100%">
                  <el-option v-for="opt in statusOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
        </el-card>

        <el-card shadow="never" class="section-card">
          <template #header>City & Routes</template>
          <el-row :gutter="16">
            <el-col :span="8">
              <el-form-item label="Linked City">
                <el-select
                  v-model="form.citySlug"
                  clearable
                  filterable
                  style="width: 100%"
                  @change="handleCityChange"
                >
                  <el-option
                    v-for="city in cityOptions"
                    :key="city.slug"
                    :label="`${city.name} (${city.slug})`"
                    :value="city.slug"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="Display City">
                <el-input v-model="form.city" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="Map Adcode">
                <el-input-number v-model="form.adcode" :min="0" :max="999999" style="width: 100%" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item label="Linked Routes">
            <el-select
              v-model="form.relatedRouteSlugs"
              multiple
              filterable
              collapse-tags
              collapse-tags-tooltip
              style="width: 100%"
            >
              <el-option
                v-for="routeItem in routeOptions"
                :key="routeItem.slug"
                :label="`${routeItem.title} (${routeItem.slug})`"
                :value="routeItem.slug"
              />
            </el-select>
          </el-form-item>

          <div v-if="selectedRoutes.length" class="selected-grid">
            <div v-for="routeItem in selectedRoutes" :key="routeItem.slug" class="selected-card">
              <strong>{{ routeItem.title }}</strong>
              <span>{{ routeItem.slug }}</span>
            </div>
          </div>
        </el-card>

        <el-card shadow="never" class="section-card">
          <template #header>Cover & Tags</template>
          <el-form-item label="Event Cover">
            <ImageUpload v-model="form.image" module="events" />
          </el-form-item>
          <el-form-item label="Event Tags">
            <div class="tag-list">
              <el-tag v-for="(tag, index) in form.tags" :key="tag" closable @close="removeTag(index)">
                {{ tag }}
              </el-tag>
            </div>
            <div class="tag-input-row">
              <el-input v-model="newTag" placeholder="Festival / Market / Heritage" @keyup.enter="addTag" />
              <el-button :icon="Plus" @click="addTag">Add</el-button>
            </div>
          </el-form-item>
        </el-card>

        <EditorWorkspace
          v-model="activeWorkspace"
          eyebrow="Event Content Workspace"
          title="Event Content"
          description="Edit the English summary and event description."
          :active-label="workspaceTabs.find((item) => item.key === activeWorkspace)?.label || 'Summary'"
          :tabs="workspaceTabs"
        >
          <div v-if="activeWorkspace === 'summary'" class="workspace-panel">
            <div class="panel-title">Event Summary</div>
            <el-form-item label="Summary Copy">
              <I18nMarkdownEditor v-model="form.summary" :rows="6" />
            </el-form-item>
          </div>

          <div v-else class="workspace-panel">
            <div class="panel-title">Event Description</div>
            <el-form-item label="Description">
              <I18nMarkdownEditor v-model="form.description" :rows="10" />
            </el-form-item>
          </div>
        </EditorWorkspace>
      </el-form>

      <aside class="editor-aside">
        <el-card shadow="never" class="aside-card">
          <template #header>Publishing Summary</template>
          <div class="info-list">
            <div class="info-row">
              <span>Status</span>
              <strong>{{ EventStatusMap[form.status] }}</strong>
            </div>
            <div class="info-row">
              <span>Start</span>
              <strong>{{ form.date || 'Not set' }}</strong>
            </div>
            <div class="info-row">
              <span>End</span>
              <strong>{{ form.endDate || 'Not set' }}</strong>
            </div>
            <div class="info-row">
              <span>Tags</span>
              <strong>{{ form.tags.length }}</strong>
            </div>
          </div>
        </el-card>

        <el-card shadow="never" class="aside-card">
          <template #header>Linked Content</template>
          <div class="aside-stack">
            <div class="selected-card">
              <strong>{{ selectedCity?.name || form.city || 'No city selected' }}</strong>
              <span>{{ form.citySlug || 'No slug' }}</span>
            </div>
            <div class="route-count">{{ selectedRoutes.length }} linked routes</div>
          </div>
        </el-card>

        <el-card shadow="never" class="aside-card">
          <template #header>Completeness</template>
          <div class="check-list">
            <div v-for="item in checklist" :key="item.label" class="check-row">
              <span>{{ item.label }}</span>
              <strong :class="item.done ? 'done' : 'pending'">{{ item.done ? 'Complete' : 'Missing' }}</strong>
            </div>
          </div>
        </el-card>
      </aside>
    </div>
  </div>
</template>

<style scoped>
@import '@/assets/editor-common.css';

/* EventEdit uses a narrower aside (no FrontendPagePreview) */
.editor-shell {
  grid-template-columns: minmax(0, 1fr) minmax(320px, 26vw);
}

.section-card,
.aside-card {
  margin-bottom: 16px;
}

.editor-aside {
  position: sticky;
  top: 20px;
  align-self: start;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  min-height: 28px;
  margin-bottom: 10px;
}

.tag-input-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 8px;
}

.aside-stack,
.check-list,
.info-list {
  display: grid;
  gap: 12px;
}

.info-row,
.check-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.route-count {
  color: #606266;
  font-size: 13px;
}

.done {
  color: #67c23a;
}

.pending {
  color: #e6a23c;
}

@media (max-width: 1200px) {
  .editor-shell {
    grid-template-columns: 1fr;
  }

  .editor-aside {
    position: static;
  }
}
</style>
