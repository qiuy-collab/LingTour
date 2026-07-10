import { ref, reactive, onMounted, type Ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { AxiosResponse } from 'axios'

export interface ListPageOptions<T = any> {
  /** API function to fetch list data. Receives merged params (filters + pagination). */
  fetchApi: (params: Record<string, any>) => Promise<AxiosResponse>
  /** API function to delete a single item by ID */
  deleteApi?: (id: string) => Promise<AxiosResponse>
  /** Default filter values */
  defaultFilters?: Record<string, any>
  /** Default page size */
  defaultPageSize?: number
  /** Whether to fetch on mount (default: true) */
  immediate?: boolean
  /** Transform raw API items before storing */
  transform?: (items: any[]) => T[]
}

export function useListPage<T = any>(options: ListPageOptions<T>) {
  const {
    fetchApi,
    deleteApi,
    defaultFilters = {},
    defaultPageSize = 10,
    immediate = true,
    transform,
  } = options

  // --- State ---
  const loading = ref(false)
  const list = ref<T[]>([]) as Ref<T[]>
  const total = ref(0)
  const page = ref(1)
  const pageSize = ref(defaultPageSize)
  const filters = reactive<Record<string, any>>({ ...defaultFilters })

  // Batch selection
  const selectedRows = ref<T[]>([]) as Ref<T[]>
  const selectedIds = ref<string[]>([])

  // First load flag (for skeleton display)
  const isFirstLoad = ref(true)

  // --- Core fetch ---
  async function fetchList() {
    loading.value = true
    try {
      const params: Record<string, any> = {
        page: page.value,
        pageSize: pageSize.value,
        ...filters,
      }
      // Remove empty string / null / undefined filters
      Object.keys(params).forEach((key) => {
        if (params[key] === '' || params[key] === null || params[key] === undefined) {
          delete params[key]
        }
      })

      const res = await fetchApi(params)
      const data = res.data?.data || res.data
      const items = data?.data || data || []
      list.value = transform ? transform(items) : items
      total.value = data?.total ?? items.length
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to load data'
      ElMessage.error(msg)
      list.value = []
      total.value = 0
    } finally {
      loading.value = false
      isFirstLoad.value = false
    }
  }

  // --- Pagination ---
  function handlePageChange(newPage: number) {
    page.value = newPage
    fetchList()
  }

  function handleSizeChange(newSize: number) {
    pageSize.value = newSize
    page.value = 1
    fetchList()
  }

  // --- Search / Filter ---
  function handleSearch() {
    page.value = 1
    fetchList()
  }

  function handleReset() {
    Object.keys(filters).forEach((key) => {
      filters[key] = defaultFilters[key] ?? ''
    })
    page.value = 1
    fetchList()
  }

  // --- Selection ---
  function handleSelectionChange(rows: T[]) {
    selectedRows.value = rows
    selectedIds.value = rows.map((r: any) => r.id || r._id)
  }

  function clearSelection() {
    selectedRows.value = []
    selectedIds.value = []
  }

  // --- Delete ---
  async function handleDelete(id: string, name?: string) {
    if (!deleteApi) return
    try {
      await ElMessageBox.confirm(
        `Delete ${name ? `"${name}"` : 'this item'}? This action cannot be undone.`,
        'Confirm deletion',
        { confirmButtonText: 'Delete', cancelButtonText: 'Cancel', type: 'warning' }
      )
      await deleteApi(id)
      ElMessage.success('Deleted successfully')
      // If current page becomes empty after delete, go to previous page
      if (list.value.length === 1 && page.value > 1) {
        page.value--
      }
      fetchList()
      clearSelection()
    } catch (err: any) {
      if (err === 'cancel' || err?.toString?.().includes('cancel')) return
      if (err?.response) {
        ElMessage.error(err.response.data?.message || 'Deletion failed')
      }
    }
  }

  // --- Batch Delete ---
  async function handleBatchDelete() {
    if (!deleteApi || selectedIds.value.length === 0) return
    try {
      await ElMessageBox.confirm(
        `Delete the ${selectedIds.value.length} selected items? This action cannot be undone.`,
        'Confirm bulk deletion',
        { confirmButtonText: 'Delete selected', cancelButtonText: 'Cancel', type: 'warning' }
      )
      const ids = [...selectedIds.value]
      let successCount = 0
      for (const id of ids) {
        try {
          await deleteApi(id)
          successCount++
        } catch {
          // continue with remaining
        }
      }
      ElMessage.success(`Deleted ${successCount} items`)
      clearSelection()
      fetchList()
    } catch (err: any) {
      if (err === 'cancel' || err?.toString?.().includes('cancel')) return
    }
  }

  // --- Export data accessor ---
  function getExportData(): T[] {
    return list.value
  }

  async function getAllData(): Promise<T[]> {
    try {
      const params: Record<string, any> = {
        page: 1,
        pageSize: 9999,
        ...filters,
      }
      Object.keys(params).forEach((key) => {
        if (params[key] === '' || params[key] === null || params[key] === undefined) {
          delete params[key]
        }
      })
      const res = await fetchApi(params)
      const data = res.data?.data || res.data
      const items = data?.data || data || []
      return transform ? transform(items) : items
    } catch {
      ElMessage.error('Failed to load all records')
      return []
    }
  }

  // --- Lifecycle ---
  if (immediate) {
    onMounted(() => {
      fetchList()
    })
  }

  return {
    // State
    loading,
    list,
    total,
    page,
    pageSize,
    filters,
    isFirstLoad,
    // Selection
    selectedRows,
    selectedIds,
    // Methods
    fetchList,
    handlePageChange,
    handleSizeChange,
    handleSearch,
    handleReset,
    handleSelectionChange,
    clearSelection,
    handleDelete,
    handleBatchDelete,
    // Export
    getExportData,
    getAllData,
  }
}
