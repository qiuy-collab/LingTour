<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { CopyDocument, Delete, Search, Warning } from '@element-plus/icons-vue'
import { queryMediaFiles, getOrphanFiles, deleteMediaFile, uploadMediaFile } from '@/api/media'
import type { MediaFile } from '@/api/media'
import { resolveMediaUrl } from '@/utils/media'

const loading = ref(false)
const files = ref<MediaFile[]>([])
const total = ref(0)
const page = ref(1)
const limit = ref(30)
const moduleFilter = ref('')
const searchQuery = ref('')
const uploading = ref(false)
const uploadProgress = ref(0)
const uploadStatusText = ref('')
const selectedFiles = ref<Set<string>>(new Set())
const showOrphans = ref(false)
const orphanCount = ref(0)

const modules = ['', 'cities', 'routes', 'shop', 'community', 'events', 'home', 'avatars']

async function fetchFiles() {
  loading.value = true
  try {
    if (showOrphans.value) {
      const res = await getOrphanFiles()
      const d = res.data?.data ?? res.data
      files.value = d.data ?? []
      total.value = d.total ?? 0
    } else {
      const res = await queryMediaFiles({
        page: page.value,
        limit: limit.value,
        module: moduleFilter.value || undefined,
        search: searchQuery.value || undefined,
      })
      const d = res.data?.data ?? res.data
      files.value = d.data ?? []
      total.value = d.total ?? 0
    }
  } catch {
    ElMessage.error('获取媒体文件失败')
  } finally {
    loading.value = false
  }
}

async function checkOrphanCount() {
  try {
    const res = await getOrphanFiles()
    const d = res.data?.data ?? res.data
    orphanCount.value = d.total ?? 0
  } catch {
    // ignore
  }
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function getFullUrl(file: MediaFile): string {
  return resolveMediaUrl(file.url)
}

function copyUrl(file: MediaFile) {
  navigator.clipboard.writeText(getFullUrl(file))
  ElMessage.success('URL 已复制到剪贴板')
}

async function handleDelete(file: MediaFile) {
  try {
    await ElMessageBox.confirm(
      `确定删除文件 "${file.filename}" 吗？此操作不可恢复。`,
      '删除确认',
      { type: 'warning' },
    )
    await deleteMediaFile(file.filename)
    ElMessage.success('文件已删除')
    fetchFiles()
  } catch {
    // cancelled
  }
}

async function handleBatchDelete() {
  if (selectedFiles.value.size === 0) return
  try {
    await ElMessageBox.confirm(
      `确定删除选中的 ${selectedFiles.value.size} 个文件吗？`,
      '批量删除',
      { type: 'warning' },
    )
    const promises = Array.from(selectedFiles.value).map((f) => deleteMediaFile(f))
    await Promise.allSettled(promises)
    selectedFiles.value.clear()
    ElMessage.success('批量删除完成')
    fetchFiles()
  } catch {
    // cancelled
  }
}

function toggleSelect(filename: string) {
  if (selectedFiles.value.has(filename)) {
    selectedFiles.value.delete(filename)
  } else {
    selectedFiles.value.add(filename)
  }
}

async function handleUpload(event: Event) {
  const input = event.target as HTMLInputElement
  const fileList = input.files
  if (!fileList || fileList.length === 0) return

  const filesArr = Array.from(fileList)
  uploading.value = true
  uploadProgress.value = 0
  const totalCount = filesArr.length
  let completedCount = 0

  try {
    const results = await Promise.allSettled(
      filesArr.map(async (file) => {
        const res = await uploadMediaFile(file, moduleFilter.value || undefined)
        completedCount++
        uploadProgress.value = Math.round((completedCount / totalCount) * 100)
        uploadStatusText.value = `${completedCount} / ${totalCount}`
        return res
      }),
    )

    const failedCount = results.filter((r) => r.status === 'rejected').length
    if (failedCount === 0) {
      ElMessage.success(`${totalCount} 个文件上传成功`)
    } else if (completedCount - failedCount > 0) {
      ElMessage.warning(`${totalCount - failedCount} 个成功，${failedCount} 个失败`)
    } else {
      ElMessage.error('全部上传失败')
    }
    fetchFiles()
  } catch {
    ElMessage.error('上传失败')
  } finally {
    uploading.value = false
    uploadProgress.value = 0
    uploadStatusText.value = ''
    input.value = ''
  }
}

function handlePageChange(newPage: number) {
  page.value = newPage
  fetchFiles()
}

onMounted(() => {
  fetchFiles()
  checkOrphanCount()
})
</script>

<template>
  <div class="media-library" v-loading="loading">
    <!-- Toolbar -->
    <div class="toolbar">
      <div class="toolbar-left">
        <el-select v-model="moduleFilter" placeholder="全部模块" clearable @change="fetchFiles" style="width: 140px">
          <el-option label="全部" value="" />
          <el-option v-for="m in modules.filter(Boolean)" :key="m" :label="m" :value="m" />
        </el-select>

        <el-input
          v-model="searchQuery"
          placeholder="搜索文件名..."
          clearable
          style="width: 200px"
          @keyup.enter="fetchFiles"
          @clear="fetchFiles"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>

        <el-button
          v-if="orphanCount > 0"
          :type="showOrphans ? 'warning' : 'default'"
          size="small"
          @click="showOrphans = !showOrphans; page = 1; fetchFiles()"
        >
          <el-icon style="margin-right: 4px"><Warning /></el-icon>
          {{ showOrphans ? '返回全部' : `孤立文件 (${orphanCount})` }}
        </el-button>

        <el-button
          v-if="selectedFiles.size > 0"
          type="danger"
          size="small"
          @click="handleBatchDelete"
        >
          删除选中 ({{ selectedFiles.size }})
        </el-button>
      </div>

      <div class="toolbar-right">
        <span class="file-count">共 {{ total }} 个文件</span>
        <label class="upload-btn">
          <el-button type="primary" :loading="uploading">
            {{ uploading ? '上传中...' : '上传文件' }}
          </el-button>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
            hidden
            @change="handleUpload"
          />
        </label>
      </div>
    </div>

    <!-- Upload progress -->
    <div v-if="uploading" class="upload-progress-bar">
      <el-progress
        :percentage="uploadProgress"
        :stroke-width="6"
        :format="() => uploadStatusText"
        status="success"
      />
    </div>

    <!-- Grid -->
    <div class="media-grid" v-if="files.length > 0">
      <div
        v-for="file in files"
        :key="file.filename"
        class="media-card"
        :class="{ selected: selectedFiles.has(file.filename), orphan: showOrphans }"
        @click="toggleSelect(file.filename)"
      >
        <div class="media-thumb">
          <img :src="getFullUrl(file)" :alt="file.filename" loading="lazy" />
          <div class="media-overlay">
            <el-button size="small" circle @click.stop="copyUrl(file)">
              <el-icon><CopyDocument /></el-icon>
            </el-button>
            <el-button size="small" circle type="danger" @click.stop="handleDelete(file)">
              <el-icon><Delete /></el-icon>
            </el-button>
          </div>
        </div>
        <div class="media-info">
          <p class="media-name" :title="file.filename">{{ file.filename.split('/').pop() }}</p>
          <p class="media-meta">{{ formatSize(file.size_bytes ?? file.size) }}</p>
          <p class="media-detail" v-if="file.module || file.entity_type">
            <span v-if="file.module" class="tag">{{ file.module }}</span>
            <span v-if="file.entity_type" class="tag entity">{{ file.entity_type }}{{ file.entity_id ? ':' + file.entity_id.slice(0, 8) : '' }}</span>
          </p>
        </div>
      </div>
    </div>

    <el-empty v-else :description="showOrphans ? '没有孤立文件' : '暂无媒体文件'" />

    <!-- Pagination -->
    <div class="pagination" v-if="total > limit && !showOrphans">
      <el-pagination
        :current-page="page"
        :page-size="limit"
        :total="total"
        layout="prev, pager, next"
        @current-change="handlePageChange"
      />
    </div>
  </div>
</template>

<style scoped>
.media-library {
  padding: 0;
}

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 12px;
}

.toolbar-left,
.toolbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.file-count {
  font-size: 13px;
  color: #909399;
}

.upload-btn {
  cursor: pointer;
}

.upload-progress-bar {
  margin-bottom: 16px;
  max-width: 400px;
}

.media-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 16px;
}

.media-card {
  border: 2px solid transparent;
  border-radius: 8px;
  overflow: hidden;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  cursor: pointer;
  transition: all 0.2s;
}

.media-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.media-card.selected {
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

.media-card.orphan {
  border-color: #e6a23c;
}

.media-card.orphan.selected {
  border-color: #409eff;
}

.media-thumb {
  position: relative;
  width: 100%;
  padding-top: 100%;
  background: #f5f7fa;
}

.media-thumb img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.media-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: rgba(0, 0, 0, 0.4);
  opacity: 0;
  transition: opacity 0.2s;
}

.media-card:hover .media-overlay {
  opacity: 1;
}

.media-info {
  padding: 8px 10px;
}

.media-name {
  font-size: 12px;
  color: #303133;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin: 0;
}

.media-meta {
  font-size: 11px;
  color: #909399;
  margin: 4px 0 0;
}

.media-detail {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
  margin: 4px 0 0;
}

.tag {
  display: inline-block;
  font-size: 10px;
  padding: 1px 6px;
  border-radius: 3px;
  background: #ecf5ff;
  color: #409eff;
  line-height: 1.4;
}

.tag.entity {
  background: #fdf6ec;
  color: #e6a23c;
}

.pagination {
  margin-top: 24px;
  display: flex;
  justify-content: center;
}
</style>
