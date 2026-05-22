<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { CircleCheckFilled, WarningFilled, RefreshRight, DocumentChecked } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import type { AuditIssue, AuditReport } from '@/utils/contentAudit'
import { runContentAudit } from '@/utils/contentAudit'

const router = useRouter()
const loading = ref(false)
const report = ref<AuditReport | null>(null)
const severityFilter = ref<'all' | 'error' | 'warning'>('all')
const domainFilter = ref<'all' | AuditIssue['domain']>('all')

const domainLabelMap: Record<AuditIssue['domain'], string> = {
  city: '城市',
  route: '路线',
  collection: '系列',
  product: '商品',
  event: '活动',
  home: '首页',
}

function getDomainLabel(domain: AuditIssue['domain']) {
  return domainLabelMap[domain]
}

const filteredIssues = computed(() => {
  const issues = report.value?.issues || []
  return issues.filter((issue) => {
    const severityMatched = severityFilter.value === 'all' || issue.severity === severityFilter.value
    const domainMatched = domainFilter.value === 'all' || issue.domain === domainFilter.value
    return severityMatched && domainMatched
  })
})

const domainOptions = computed(() => {
  if (!report.value) return []
  const usedDomains = new Set<AuditIssue['domain']>(report.value.issues.map((issue) => issue.domain))
  return Array.from(usedDomains).map((domain: AuditIssue['domain']) => ({
    value: domain,
    label: domainLabelMap[domain],
  }))
})

async function loadReport() {
  loading.value = true
  try {
    report.value = await runContentAudit()
  } catch {
    ElMessage.error('数据体检加载失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

function openIssue(issue: AuditIssue) {
  router.push(issue.path)
}

onMounted(loadReport)
</script>

<template>
  <div class="audit-page" v-loading="loading">
    <div class="page-header">
      <div>
        <h2>数据体检</h2>
        <p>按前台真实依赖检查后台内容是否可展示、可关联、可发布。</p>
      </div>
      <el-button type="primary" :icon="RefreshRight" @click="loadReport">重新检查</el-button>
    </div>

    <el-row :gutter="16" class="summary-row">
      <el-col :xs="12" :md="6">
        <el-card shadow="hover" class="summary-card">
          <div class="summary-icon summary-total">
            <el-icon><DocumentChecked /></el-icon>
          </div>
          <div>
            <div class="summary-label">问题总数</div>
            <div class="summary-value">{{ report?.summary.total ?? 0 }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="12" :md="6">
        <el-card shadow="hover" class="summary-card">
          <div class="summary-icon summary-error">
            <el-icon><WarningFilled /></el-icon>
          </div>
          <div>
            <div class="summary-label">严重问题</div>
            <div class="summary-value">{{ report?.summary.errors ?? 0 }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="12" :md="6">
        <el-card shadow="hover" class="summary-card">
          <div class="summary-icon summary-warning">
            <el-icon><WarningFilled /></el-icon>
          </div>
          <div>
            <div class="summary-label">提醒项</div>
            <div class="summary-value">{{ report?.summary.warnings ?? 0 }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="12" :md="6">
        <el-card shadow="hover" class="summary-card">
          <div class="summary-icon summary-ok">
            <el-icon><CircleCheckFilled /></el-icon>
          </div>
          <div>
            <div class="summary-label">影响对象</div>
            <div class="summary-value">{{ report?.summary.affectedEntities ?? 0 }}</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-card shadow="never" class="filters-card">
      <div class="filters">
        <el-radio-group v-model="severityFilter">
          <el-radio-button value="all">全部级别</el-radio-button>
          <el-radio-button value="error">严重问题</el-radio-button>
          <el-radio-button value="warning">提醒项</el-radio-button>
        </el-radio-group>
        <el-select v-model="domainFilter" style="width: 180px">
          <el-option label="全部模块" value="all" />
          <el-option
            v-for="item in domainOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
        <span class="generated-at" v-if="report">最近检查：{{ report.generatedAt.replace('T', ' ').slice(0, 19) }}</span>
      </div>
    </el-card>

    <el-empty
      v-if="report && report.summary.total === 0"
      description="当前没有发现影响前台展示的数据问题"
      :image-size="80"
    />

    <el-card v-else shadow="never">
      <el-table :data="filteredIssues" stripe>
        <el-table-column label="级别" width="110">
          <template #default="{ row }">
            <el-tag :type="row.severity === 'error' ? 'danger' : 'warning'">
              {{ row.severity === 'error' ? '严重问题' : '提醒项' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="模块" width="100">
          <template #default="{ row }">{{ getDomainLabel(row.domain) }}</template>
        </el-table-column>
        <el-table-column prop="entityTitle" label="对象" min-width="180" />
        <el-table-column prop="message" label="问题" min-width="220" />
        <el-table-column prop="suggestion" label="建议处理" min-width="260" />
        <el-table-column label="操作" width="110" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="openIssue(row)">前往处理</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<style scoped>
.audit-page {
  padding-bottom: 24px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 16px;
}

.page-header h2 {
  margin: 0;
  font-size: 22px;
}

.page-header p {
  margin: 6px 0 0;
  color: #909399;
}

.summary-row {
  margin-bottom: 16px;
}

.summary-card {
  margin-bottom: 12px;
}

.summary-card :deep(.el-card__body) {
  display: flex;
  align-items: center;
  gap: 12px;
}

.summary-icon {
  width: 46px;
  height: 46px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
}

.summary-total {
  color: #409eff;
  background: rgba(64, 158, 255, 0.12);
}

.summary-error {
  color: #f56c6c;
  background: rgba(245, 108, 108, 0.12);
}

.summary-warning {
  color: #e6a23c;
  background: rgba(230, 162, 60, 0.12);
}

.summary-ok {
  color: #67c23a;
  background: rgba(103, 194, 58, 0.12);
}

.summary-label {
  color: #909399;
  font-size: 13px;
}

.summary-value {
  margin-top: 4px;
  font-size: 24px;
  font-weight: 700;
  color: #303133;
}

.filters-card {
  margin-bottom: 16px;
}

.filters {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.generated-at {
  color: #909399;
  font-size: 13px;
}
</style>
