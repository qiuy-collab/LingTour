<script setup lang="ts">
import { computed } from 'vue'
import { Picture, VideoCamera } from '@element-plus/icons-vue'
import ImageUpload from '@/components/ImageUpload.vue'
import type { MediaAsset, MediaType } from '@/types/media'

const props = withDefaults(
  defineProps<{
    modelValue: MediaAsset | null
    legacyImage?: string
    module?: string
    entityType?: string
    entityId?: string
  }>(),
  {
    legacyImage: '',
    module: '',
    entityType: '',
    entityId: '',
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: MediaAsset | null]
}>()

const mediaType = computed<MediaType>({
  get: () => props.modelValue?.type || 'image',
  set: (type) => {
    const current = props.modelValue
    emit('update:modelValue', {
      type,
      url:
        current?.type === type
          ? current.url
          : type === 'image' && current?.type === 'video'
            ? current.poster || ''
            : '',
      poster:
        type === 'video'
          ? current?.type === 'video'
            ? current.poster
            : props.legacyImage || current?.url || ''
          : undefined,
      alt: current?.alt,
    })
  },
})

const mediaUrl = computed({
  get: () => props.modelValue?.url || '',
  set: (url: string) => {
    emit('update:modelValue', {
      type: mediaType.value,
      url,
      poster: mediaType.value === 'video' ? props.modelValue?.poster : undefined,
      alt: props.modelValue?.alt,
    })
  },
})

const posterUrl = computed({
  get: () => props.modelValue?.poster || '',
  set: (poster: string) => {
    emit('update:modelValue', {
      type: 'video',
      url: mediaUrl.value,
      poster,
      alt: props.modelValue?.alt,
    })
  },
})
</script>

<template>
  <div class="media-asset-input">
    <div class="media-type-switch" role="group" aria-label="Primary media type">
      <button
        type="button"
        class="media-type-option"
        :class="{ active: mediaType === 'image' }"
        :aria-pressed="mediaType === 'image'"
        @click="mediaType = 'image'"
      >
        <el-icon><Picture /></el-icon>
        <span>Image</span>
      </button>
      <button
        type="button"
        class="media-type-option"
        :class="{ active: mediaType === 'video' }"
        :aria-pressed="mediaType === 'video'"
        @click="mediaType = 'video'"
      >
        <el-icon><VideoCamera /></el-icon>
        <span>Video</span>
      </button>
    </div>

    <div class="media-field">
      <div class="media-field-heading">
        <strong>{{ mediaType === 'video' ? 'Video source' : 'Image source' }}</strong>
        <span>Choose from the library, upload a file, or paste a URL.</span>
      </div>
      <ImageUpload
        v-model="mediaUrl"
        :media-kind="mediaType"
        :module="module"
        :entity-type="entityType"
        :entity-id="entityId"
      />
      <el-input
        v-model="mediaUrl"
        clearable
        :placeholder="mediaType === 'video' ? 'https://.../story.mp4' : 'https://.../cover.webp'"
      />
    </div>

    <div v-if="mediaType === 'video'" class="media-field poster-field">
      <div class="media-field-heading">
        <strong>Poster fallback</strong>
        <span
          >Required before publishing; used on cards, reduced-motion devices, and while
          loading.</span
        >
      </div>
      <ImageUpload
        v-model="posterUrl"
        media-kind="image"
        :module="module"
        :entity-type="entityType"
        :entity-id="entityId"
      />
      <el-input v-model="posterUrl" clearable placeholder="https://.../poster.webp" />
      <el-alert
        v-if="mediaUrl && !posterUrl"
        title="Add a poster before publishing this video."
        type="warning"
        :closable="false"
        show-icon
      />
    </div>
  </div>
</template>

<style scoped>
.media-asset-input {
  display: grid;
  gap: 16px;
  width: 100%;
}

.media-type-switch {
  display: inline-grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  width: min(100%, 360px);
  padding: 4px;
  border: 1px solid var(--lt-border-light);
  border-radius: var(--lt-radius-lg);
  background: var(--lt-bg-hover);
}

.media-type-option {
  display: inline-flex;
  min-height: 42px;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: 0;
  border-radius: var(--lt-radius-md);
  background: transparent;
  color: var(--lt-text-secondary);
  cursor: pointer;
  transition:
    color 180ms ease,
    background-color 180ms ease,
    box-shadow 180ms ease;
}

.media-type-option.active {
  background: var(--lt-bg-card);
  color: var(--lt-primary);
  box-shadow: var(--lt-shadow-sm);
}

.media-field {
  display: grid;
  gap: 10px;
  padding: 16px;
  border: 1px solid var(--lt-border-light);
  border-radius: var(--lt-radius-md);
  background: var(--lt-bg-card);
}

.poster-field {
  background: color-mix(in srgb, var(--lt-bg-card) 92%, var(--lt-primary-soft));
}

.media-field-heading {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: 4px 16px;
}

.media-field-heading strong {
  color: var(--lt-text-primary);
  font-size: 13px;
}

.media-field-heading span {
  color: var(--lt-text-secondary);
  font-size: 12px;
}

@media (max-width: 767px) {
  .media-type-switch {
    width: 100%;
  }

  .media-field {
    padding: 12px;
  }
}
</style>
