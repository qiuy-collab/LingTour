<script setup lang="ts">
import MediaLibraryBrowser from "@/components/media/MediaLibraryBrowser.vue";
</script>

<template>
  <section class="media-page">
    <header class="media-page__header">
      <div>
        <p class="media-page__eyebrow">内容资产</p>
        <h1>媒体库</h1>
      </div>
      <p class="media-page__intro">
        集中管理网站使用的图片与视频。上传后的文件可以直接用于首页、城市、路线、商城和社区内容。
      </p>
    </header>
    <MediaLibraryBrowser mode="manage" />
  </section>
</template>

<style scoped>
.media-page__header {
  display: grid;
  grid-template-columns: minmax(220px, 0.7fr) minmax(320px, 1fr);
  gap: 32px;
  align-items: end;
  margin-bottom: 28px;
  padding-bottom: 24px;
  border-bottom: 1px solid var(--lt-border-light);
}

.media-page__eyebrow {
  margin: 0 0 8px;
  color: var(--lt-primary);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.18em;
}

.media-page h1 {
  margin: 0;
  color: var(--lt-text-primary);
  font-size: clamp(28px, 3vw, 42px);
  font-weight: 600;
  letter-spacing: -0.04em;
}

.media-page__intro {
  max-width: 680px;
  margin: 0;
  color: var(--lt-text-regular);
  font-size: 14px;
  line-height: 1.8;
}

@media (max-width: 720px) {
  .media-page__header {
    grid-template-columns: 1fr;
    gap: 10px;
    margin-bottom: 20px;
    padding-bottom: 18px;
  }
}
</style>
