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
      ElMessage.info('正在获取全部数据...')
      data = await props.fetchAllData()
    } else {
      data = props.currentData
    }

    if (data.length === 0) {
      ElMessage.warning('没有可导出的数据')
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
    ElMessage.error('导出失败')
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
      导出<el-icon class="el-icon--right"><ArrowDown /></el-icon>
    </el-button>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item command="excel-current">导出当前页 Excel</el-dropdown-item>
        <el-dropdown-item command="csv-current">导出当前页 CSV</el-dropdown-item>
        <el-dropdown-item v-if="fetchAllData" divided command="excel-all">导出全部 Excel</el-dropdown-item>
        <el-dropdown-item v-if="fetchAllData" command="csv-all">导出全部 CSV</el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>
