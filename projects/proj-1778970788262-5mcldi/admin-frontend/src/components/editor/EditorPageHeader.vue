<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft } from '@element-plus/icons-vue'

const props = withDefaults(
  defineProps<{
    title: string
    backTo?: string
    backLabel?: string
    saveLabel?: string
    saving?: boolean
    dirty?: boolean
    dirtyLabel?: string
  }>(),
  {
    backTo: '',
    backLabel: '返回',
    saveLabel: '保存',
    saving: false,
    dirty: false,
    dirtyLabel: '有未保存修改',
  },
)

const emit = defineEmits<{
  save: []
  cancel: []
}>()

const router = useRouter()
const showDirty = computed(() => props.dirty)

function handleBack() {
  emit('cancel')
  if (props.backTo) {
    router.push(props.backTo)
  }
}
</script>

<template>
  <div class="editor-page-header">
    <div class="header-main">
      <el-button :icon="ArrowLeft" @click="handleBack">{{ backLabel }}</el-button>
      <div class="title-wrap">
        <h2>{{ title }}</h2>
        <span v-if="showDirty" class="dirty-pill">{{ dirtyLabel }}</span>
      </div>
    </div>
    <div class="header-actions">
      <slot name="actions" />
      <el-button @click="handleBack">取消</el-button>
      <el-button type="primary" :loading="saving" @click="emit('save')">{{ saveLabel }}</el-button>
    </div>
  </div>
</template>

<style scoped>
.editor-page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-bottom: 18px;
}

.header-main,
.header-actions,
.title-wrap {
  display: flex;
  align-items: center;
  gap: 12px;
}

.title-wrap {
  flex-wrap: wrap;
}

.title-wrap h2 {
  margin: 0;
  font-size: 24px;
  line-height: 1.1;
  color: #18212f;
}

.dirty-pill {
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  padding: 0 12px;
  border-radius: 999px;
  background: rgba(230, 162, 60, 0.12);
  color: #a86808;
  font-size: 12px;
  font-weight: 600;
}

@media (max-width: 960px) {
  .editor-page-header {
    flex-direction: column;
    align-items: stretch;
  }

  .header-main,
  .header-actions {
    justify-content: space-between;
    flex-wrap: wrap;
  }
}
</style>
