<script setup lang="ts">
import { ref } from 'vue'
import { Download, ArrowDown } from '@element-plus/icons-vue'
import { exportCSV, exportExcel, type ExportColumn } from '@/composables/useExport'
import { ElMessage } from 'element-plus'

const props = defineProps<{
  /** File name without extension */
  filename: string
  /** Column definitions for export */
  columns: ExportColumn[]
  /** Current page data */
  currentData: any[]
  /** Function to fetch all data (for "export all") */
  fetchAllData?: () => Promise<any[]>
}>()

const exporting = ref(false)

async function handleExport(format: 'csv' | 'excel', scope: 'current' | 'all') {
  exporting.value = true
  try {
    let data: any[]
    if (scope === 'all' && props.fetchAllData) {
      ElMessage.info('Loading all records...')
      data = await props.fetchAllData()
    } else {
      data = props.currentData
    }

    if (data.length === 0) {
      ElMessage.warning('There is no data to export')
      return
    }

    const options = {
      filename: props.filename,
      columns: props.columns,
      data,
    }

    if (format === 'csv') {
      exportCSV(options)
    } else {
      exportExcel(options)
    }
  } catch (err) {
    ElMessage.error('Export failed')
  } finally {
    exporting.value = false
  }
}

function handleCommand(cmd: string) {
  const [format, scope] = cmd.split('-') as ['csv' | 'excel', 'current' | 'all']
  handleExport(format, scope)
}
</script>

<template>
  <el-dropdown :disabled="exporting" @command="handleCommand">
    <el-button :icon="Download" :loading="exporting">
      Export<el-icon class="el-icon--right"><ArrowDown /></el-icon>
    </el-button>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item command="excel-current">Current page as Excel</el-dropdown-item>
        <el-dropdown-item command="csv-current">Current page as CSV</el-dropdown-item>
        <el-dropdown-item v-if="fetchAllData" divided command="excel-all">All records as Excel</el-dropdown-item>
        <el-dropdown-item v-if="fetchAllData" command="csv-all">All records as CSV</el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>
