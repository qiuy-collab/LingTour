<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Plus, Delete, Top, Bottom, ArrowLeft, Edit } from '@element-plus/icons-vue'
import { routesApi } from '@/api/routes'
import type { RouteStop, RouteFormData, CultureTag } from '@/types/route'
import ImageUpload from '@/components/ImageUpload.vue'

const router = useRouter()
const route = useRoute()

// ─── 模式判断 ──────────────────────────────
const isEdit = computed(() => !!route.params.id)
const pageTitle = computed(() => (isEdit.value ? '编辑路线' : '新增路线'))

// ─── 文化标签选项 ──────────────────────────
const cultureTagOptions: { value: CultureTag; label: string; color: string }[] = [
  { value: 'Guangfu', label: '广府 (Guangfu)', color: '#409EFF' },
  { value: 'Chaoshan', label: '潮汕 (Chaoshan)', color: '#E6A23C' },
  { value: 'Hakka', label: '客家 (Hakka)', color: '#67C23A' },
  { value: 'Coastal', label: '滨海 (Coastal)', color: '#00B5AD' },
  { value: 'BayArea', label: '湾区 (Bay Area)', color: '#9C27B0' },
  { value: 'Mountain', label: '山川 (Mountain)', color: '#FF5722' },
]

// ─── 表单数据 ──────────────────────────────
const loading = ref(false)
const saving = ref(false)

const form = reactive<RouteFormData>({
  slug: '',
  title: '',
  titleEn: '',
  cultureTag: 'Guangfu',
  cityName: '',
  duration: '',
  audience: '',
  summary: '',
  story: '',
  coverImage: '',
  stops: [],
  routeCityLinks: [],
  status: 'draft',
  price: 0,
})

// ─── Stops 站点管理（★★★核心★★★）────────────────
const stopDrawerVisible = ref(false)
const editingStopIndex = ref(-1)
const editingStop = reactive<RouteStop>({
  id: '',
  sortOrder: 0,
  time: '',
  stopName: '',
  plan: '',
  story: '',
  culturalStory: '',
  details: [],
  image: '',
  lat: 0,
  lng: 0,
  meal: '',
  hotel: '',
  transit: '',
  placeDetail: '',
})

function generateStop(sortOrder: number): RouteStop {
  return {
    id: 'stop-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 7),
    sortOrder,
    time: '',
    stopName: '',
    plan: '',
    story: '',
    culturalStory: '',
    details: [],
    image: '',
    lat: 0,
    lng: 0,
    meal: '',
    hotel: '',
    transit: '',
    placeDetail: '',
  }
}

function addStop() {
  const maxSort = form.stops.length ? Math.max(...form.stops.map((s) => s.sortOrder)) : 0
  form.stops.push(generateStop(maxSort + 1))
}

function removeStop(index: number) {
  form.stops.splice(index, 1)
}

function moveStop(index: number, direction: 'up' | 'down') {
  const arr = form.stops
  if (direction === 'up' && index > 0) {
    ;[arr[index - 1], arr[index]] = [arr[index], arr[index - 1]]
    ;[arr[index - 1].sortOrder, arr[index].sortOrder] = [arr[index].sortOrder, arr[index - 1].sortOrder]
  } else if (direction === 'down' && index < arr.length - 1) {
    ;[arr[index], arr[index + 1]] = [arr[index + 1], arr[index]]
    ;[arr[index].sortOrder, arr[index + 1].sortOrder] = [arr[index + 1].sortOrder, arr[index].sortOrder]
  }
}

// ─── 打开站点编辑抽屉 ─────────────────────
function openStopDrawer(index: number) {
  editingStopIndex.value = index
  const stop = form.stops[index]
  Object.assign(editingStop, {
    id: stop.id,
    sortOrder: stop.sortOrder,
    time: stop.time,
    stopName: stop.stopName,
    plan: stop.plan,
    story: stop.story,
    culturalStory: stop.culturalStory,
    details: [...stop.details],
    image: stop.image,
    lat: stop.lat,
    lng: stop.lng,
    meal: stop.meal,
    hotel: stop.hotel,
    transit: stop.transit,
    placeDetail: stop.placeDetail,
  })
  stopDrawerVisible.value = true
}

function saveStopFromDrawer() {
  if (editingStopIndex.value >= 0 && editingStopIndex.value < form.stops.length) {
    Object.assign(form.stops[editingStopIndex.value], {
      id: editingStop.id,
      sortOrder: editingStop.sortOrder,
      time: editingStop.time,
      stopName: editingStop.stopName,
      plan: editingStop.plan,
      story: editingStop.story,
      culturalStory: editingStop.culturalStory,
      details: [...editingStop.details],
      image: editingStop.image,
      lat: editingStop.lat,
      lng: editingStop.lng,
      meal: editingStop.meal,
      hotel: editingStop.hotel,
      transit: editingStop.transit,
      placeDetail: editingStop.placeDetail,
    })
  }
  stopDrawerVisible.value = false
}

// ─── 抽屉内详情管理 ───────────────────────
const newDetail = ref('')
function addDetail() {
  const d = newDetail.value.trim()
  if (d && !editingStop.details.includes(d)) {
    editingStop.details.push(d)
    newDetail.value = ''
  }
}
function removeDetail(index: number) {
  editingStop.details.splice(index, 1)
}

// ─── 关联城市链接 ─────────────────────────
const newCityName = ref('')
const newCitySlug = ref('')
function addCityLink() {
  const name = newCityName.value.trim()
  const slug = newCitySlug.value.trim()
  if (name && slug) {
    form.routeCityLinks.push({ cityName: name, citySlug: slug })
    newCityName.value = ''
    newCitySlug.value = ''
  }
}
function removeCityLink(index: number) {
  form.routeCityLinks.splice(index, 1)
}

// ─── 加载编辑数据 ──────────────────────────
onMounted(async () => {
  if (isEdit.value) {
    loading.value = true
    try {
      const res = await routesApi.getRoute(route.params.id as string)
      const r = res.data.data
      Object.assign(form, {
        id: r.id,
        slug: r.slug,
        title: r.title,
        titleEn: r.titleEn,
        cultureTag: r.cultureTag,
        cityName: r.cityName,
        duration: r.duration,
        audience: r.audience,
        summary: r.summary,
        story: r.story,
        coverImage: r.coverImage,
        stops: r.stops.map((s: RouteStop) => ({ ...s, details: [...s.details] })),
        routeCityLinks: r.routeCityLinks ? r.routeCityLinks.map((l: any) => ({ ...l })) : [],
        status: r.status,
        price: r.price,
      })
    } catch {
      ElMessage.error('加载路线数据失败')
      router.back()
    } finally {
      loading.value = false
    }
  }
})

// ─── 保存 ──────────────────────────────
async function handleSave() {
  saving.value = true
  try {
    if (isEdit.value) {
      await routesApi.updateRoute(route.params.id as string, form)
      ElMessage.success('路线更新成功')
    } else {
      await routesApi.createRoute(form)
      ElMessage.success('路线创建成功')
    }
    router.push('/admin/routes')
  } catch {
    ElMessage.error('保存失败')
  } finally {
    saving.value = false
  }
}

function handleCancel() {
  router.push('/admin/routes')
}
</script>

<template>
  <div class="route-edit" v-loading="loading">
    <!-- 页面标题 -->
    <div class="page-header">
      <el-button :icon="ArrowLeft" @click="handleCancel">返回</el-button>
      <h2>{{ pageTitle }}</h2>
    </div>

    <el-form label-width="120px" label-position="top">
      <!-- ============ 基本信息 ============ -->
      <el-card shadow="never" class="form-card">
        <template #header>
          <span class="card-title">基本信息</span>
        </template>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="Slug" required>
              <el-input v-model="form.slug" placeholder="URL 标识，如 zhujiang-new-town" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="路线标题（中文）" required>
              <el-input v-model="form.title" placeholder="如：珠江新城：从稻田到天际线" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="路线标题（英文）">
              <el-input v-model="form.titleEn" placeholder="如：From Rice Fields to Skyline" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="文化标签" required>
              <el-select v-model="form.cultureTag" style="width: 100%">
                <el-option
                  v-for="opt in cultureTagOptions"
                  :key="opt.value"
                  :label="opt.label"
                  :value="opt.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="所属城市" required>
              <el-input v-model="form.cityName" placeholder="如：广州" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="时长">
              <el-input v-model="form.duration" placeholder="如：1 day / half day" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="价格 (¥)">
              <el-input-number
                v-model="form.price"
                :min="0"
                :precision="2"
                controls-position="right"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="目标人群">
              <el-input v-model="form.audience" placeholder="如：城市文化爱好者、摄影爱好者" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="封面图">
              <ImageUpload v-model="form.coverImage" :multiple="false" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="摘要">
          <el-input v-model="form.summary" type="textarea" :rows="2" placeholder="路线摘要" />
        </el-form-item>
        <el-form-item label="路线总述">
          <el-input v-model="form.story" type="textarea" :rows="3" placeholder="路线故事/总述" />
        </el-form-item>
      </el-card>

      <!-- ============ 路线站点 (Stops) ★★★ 核心嵌套编辑 ★★★ ============ -->
      <el-card shadow="never" class="form-card">
        <template #header>
          <div class="card-header-row">
            <span class="card-title">路线站点 (Stops)</span>
            <el-button type="primary" size="small" :icon="Plus" @click="addStop">
              添加站点
            </el-button>
          </div>
        </template>

        <div v-if="form.stops.length === 0" class="empty-hint">
          暂无站点，点击「添加站点」按钮新增
        </div>

        <el-table v-else :data="form.stops" stripe row-key="id" style="width: 100%">
          <el-table-column label="序号" width="60" align="center">
            <template #default="{ row }">{{ row.sortOrder }}</template>
          </el-table-column>

          <el-table-column prop="time" label="时间" width="90" />

          <el-table-column prop="stopName" label="站点名" min-width="140" />

          <el-table-column prop="plan" label="计划" min-width="200">
            <template #default="{ row }">
              <span class="text-ellipsis">{{ row.plan }}</span>
            </template>
          </el-table-column>

          <el-table-column label="详情字段" width="120" align="center">
            <template #default="{ row }">
              <el-tag size="small" :type="row.image ? 'success' : 'info'">
                {{ row.image ? '已配图' : '无图' }}
              </el-tag>
              <el-tag size="small" style="margin-left: 4px">
                {{ row.details?.length || 0 }} 要点
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column label="操作" width="280" fixed="right">
            <template #default="{ $index }">
              <el-button type="primary" link :icon="Edit" size="small" @click="openStopDrawer($index)">
                编辑
              </el-button>
              <el-button
                size="small"
                :icon="Top"
                :disabled="$index === 0"
                @click="moveStop($index, 'up')"
              >
                上移
              </el-button>
              <el-button
                size="small"
                :icon="Bottom"
                :disabled="$index === form.stops.length - 1"
                @click="moveStop($index, 'down')"
              >
                下移
              </el-button>
              <el-button
                type="danger"
                link
                :icon="Delete"
                size="small"
                @click="removeStop($index)"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <div v-if="form.stops.length > 0" class="add-more-row">
          <el-button :icon="Plus" @click="addStop">添加站点</el-button>
        </div>
      </el-card>

      <!-- ============ 关联城市 ============ -->
      <el-card shadow="never" class="form-card">
        <template #header>
          <span class="card-title">关联城市</span>
        </template>
        <div class="city-link-list">
          <el-tag
            v-for="(link, idx) in form.routeCityLinks"
            :key="idx"
            closable
            size="default"
            style="margin: 4px"
            @close="removeCityLink(idx)"
          >
            {{ link.cityName }} ({{ link.citySlug }})
          </el-tag>
        </div>
        <div class="city-link-input-row">
          <el-input
            v-model="newCityName"
            placeholder="城市名"
            size="small"
            style="width: 140px"
          />
          <el-input
            v-model="newCitySlug"
            placeholder="Slug"
            size="small"
            style="width: 140px"
          />
          <el-button size="small" :icon="Plus" @click="addCityLink">添加</el-button>
        </div>
      </el-card>

      <!-- ============ 发布状态 ============ -->
      <el-card shadow="never" class="form-card">
        <template #header>
          <span class="card-title">发布状态</span>
        </template>
        <el-radio-group v-model="form.status">
          <el-radio value="draft">草稿</el-radio>
          <el-radio value="published">已发布</el-radio>
          <el-radio value="archived">已下架</el-radio>
        </el-radio-group>
      </el-card>

      <!-- ============ 保存/取消 ============ -->
      <div class="form-actions">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" :loading="saving" @click="handleSave">保存</el-button>
      </div>
    </el-form>

    <!-- ============ ★★★ 站点编辑抽屉 ★★★ ============ -->
    <el-drawer
      v-model="stopDrawerVisible"
      :title="`编辑站点: ${editingStop.stopName || '新增'}`"
      size="600px"
      direction="rtl"
      destroy-on-close
    >
      <el-form label-width="100px" label-position="top">
        <el-row :gutter="16">
          <el-col :span="8">
            <el-form-item label="排序号">
              <el-input-number
                v-model="editingStop.sortOrder"
                :min="1"
                controls-position="right"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="时间">
              <el-input v-model="editingStop.time" placeholder="如 08:30" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="站点名">
              <el-input v-model="editingStop.stopName" placeholder="站点名称" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="纬度">
              <el-input-number
                v-model="editingStop.lat"
                :min="-90"
                :max="90"
                :precision="4"
                controls-position="right"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="经度">
              <el-input-number
                v-model="editingStop.lng"
                :min="-180"
                :max="180"
                :precision="4"
                controls-position="right"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="计划简述">
          <el-input v-model="editingStop.plan" placeholder="本站在路线中的定位与计划" />
        </el-form-item>

        <el-form-item label="站点故事">
          <el-input
            v-model="editingStop.story"
            type="textarea"
            :rows="2"
            placeholder="站点背后的故事"
          />
        </el-form-item>

        <el-form-item label="文化深度解读">
          <el-input
            v-model="editingStop.culturalStory"
            type="textarea"
            :rows="4"
            placeholder="文化层面的解读（富文本）"
          />
        </el-form-item>

        <el-form-item label="配图">
          <ImageUpload v-model="editingStop.image" :multiple="false" />
        </el-form-item>

        <!-- 体验要点 -->
        <el-form-item label="体验要点">
          <div class="detail-tags">
            <el-tag
              v-for="(d, idx) in editingStop.details"
              :key="idx"
              closable
              size="default"
              style="margin: 4px"
              @close="removeDetail(idx)"
            >
              {{ d }}
            </el-tag>
          </div>
          <div class="detail-input-row">
            <el-input
              v-model="newDetail"
              placeholder="输入要点，按回车添加"
              size="small"
              style="width: 300px"
              @keyup.enter="addDetail"
            />
            <el-button size="small" :icon="Plus" @click="addDetail">添加</el-button>
          </div>
        </el-form-item>

        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="餐食安排">
              <el-input v-model="editingStop.meal" placeholder="如：午餐推荐..." />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="住宿安排">
              <el-input v-model="editingStop.hotel" placeholder="如：推荐住宿..." />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="交通方式">
          <el-input v-model="editingStop.transit" placeholder="如：地铁1号线 体育中心站" />
        </el-form-item>

        <el-form-item label="地点详述">
          <el-input
            v-model="editingStop.placeDetail"
            type="textarea"
            :rows="3"
            placeholder="关于此地点的详细补充信息"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="drawer-footer">
          <el-button @click="stopDrawerVisible = false">取消</el-button>
          <el-button type="primary" @click="saveStopFromDrawer">确定</el-button>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<style scoped>
.route-edit {
  max-width: 1100px;
  margin: 0 auto;
  padding-bottom: 40px;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
  font-size: 20px;
  color: #303133;
}

.form-card {
  margin-bottom: 20px;
}

.card-title {
  font-weight: 600;
  font-size: 15px;
}

.card-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.empty-hint {
  text-align: center;
  color: #909399;
  padding: 40px 0;
}

.add-more-row {
  text-align: center;
  margin-top: 16px;
}

.text-ellipsis {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px;
}

/* 关联城市 */
.city-link-list {
  margin-bottom: 12px;
  min-height: 32px;
}

.city-link-input-row {
  display: flex;
  gap: 8px;
  align-items: center;
}

/* 抽屉内详情标签 */
.detail-tags {
  margin-bottom: 12px;
  min-height: 32px;
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.detail-input-row {
  display: flex;
  gap: 8px;
  align-items: center;
}

.drawer-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* 保存按钮区 */
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 0;
}
</style>
