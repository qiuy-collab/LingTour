<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { Plus, Delete, ZoomIn } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const props = withDefaults(
  defineProps<{
    modelValue: string | string[]
    multiple?: boolean
    limit?: number
    accept?: string
  }>(),
  {
    multiple: false,
    limit: 1,
    accept: 'image/*',
  }
)

const emit = defineEmits<{
  'update:modelValue': [value: string | string[]]
}>()

// 处理 modelValue
const fileList = ref<any[]>([])

// 同步初始值
watch(
  () => props.modelValue,
  (val) => {
    if (!val) {
      fileList.value = []
      return
    }
    if (props.multiple && Array.isArray(val)) {
      fileList.value = val.map((url, index) => ({
        uid: index,
        name: `image-${index}`,
        url,
        status: 'success',
      }))
    } else if (!props.multiple && typeof val === 'string') {
      fileList.value = val
        ? [{ uid: 0, name: 'image-0', url: val, status: 'success' }]
        : []
    }
  },
  { immediate: true }
)

function handleSuccess(response: any) {
  const url = response?.data?.url || response?.url || ''
  if (props.multiple) {
    const urls = [...(Array.isArray(props.modelValue) ? props.modelValue : [])]
    urls.push(url)
    emit('update:modelValue', urls)
  } else {
    emit('update:modelValue', url)
  }
}

function handleRemove(index: number) {
  if (props.multiple && Array.isArray(props.modelValue)) {
    const urls = [...props.modelValue]
    urls.splice(index, 1)
    emit('update:modelValue', urls)
  } else {
    emit('update:modelValue', '')
  }
}

function beforeUpload(file: File) {
  const isImage = file.type.startsWith('image/')
  if (!isImage) {
    ElMessage.error('只能上传图片文件')
    return false
  }
  const isLt5M = file.size / 1024 / 1024 < 5
  if (!isLt5M) {
    ElMessage.error('图片大小不能超过 5MB')
    return false
  }
  return true
}

const uploadLimit = computed(() => {
  if (props.multiple) return props.limit
  return 1
})
</script>

<template>
  <div class="image-upload">
    <div class="image-preview-list">
      <div
        v-for="(item, index) in fileList"
        :key="item.uid"
        class="image-preview-item"
      >
        <el-image
          :src="item.url"
          fit="cover"
          class="preview-image"
          :preview-src-list="[item.url]"
          preview-teleported
        />
        <div class="image-overlay">
          <el-icon
            class="preview-icon"
            @click.stop="() => {}"
          >
            <ZoomIn />
          </el-icon>
          <el-icon class="delete-icon" @click.stop="handleRemove(index)">
            <Delete />
          </el-icon>
        </div>
      </div>

      <!-- 上传按钮 -->
      <el-upload
        v-if="fileList.length < uploadLimit"
        :action="'/api/admin/upload'"
        :show-file-list="false"
        :before-upload="beforeUpload"
        :on-success="handleSuccess"
        :accept="accept"
        class="upload-trigger"
      >
        <el-icon class="upload-icon"><Plus /></el-icon>
      </el-upload>
    </div>
  </div>
</template>

<style scoped>
.image-upload {
  width: 100%;
}

.image-preview-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.image-preview-item {
  width: 120px;
  height: 120px;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  overflow: hidden;
  position: relative;
  cursor: pointer;
}

.preview-image {
  width: 100%;
  height: 100%;
}

.image-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  opacity: 0;
  transition: opacity 0.2s;
}

.image-preview-item:hover .image-overlay {
  opacity: 1;
}

.preview-icon,
.delete-icon {
  color: #fff;
  font-size: 20px;
  cursor: pointer;
}

.delete-icon:hover {
  color: #f56c6c;
}

.upload-trigger {
  width: 120px;
  height: 120px;
  border: 1px dashed #dcdfe6;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: border-color 0.2s;
}

.upload-trigger:hover {
  border-color: #409eff;
}

.upload-icon {
  font-size: 28px;
  color: #c0c4cc;
}
</style>
