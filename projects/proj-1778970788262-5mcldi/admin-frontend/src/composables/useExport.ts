import { ElMessage } from 'element-plus'
import * as XLSX from 'xlsx'

export interface ExportColumn {
  /** Column header label */
  header: string
  /** Field key or accessor function */
  key?: string
  /** Custom value accessor */
  accessor?: (row: any) => any
  /** Width in characters (for Excel) */
  width?: number
}

export interface ExportOptions {
  /** File name without extension */
  filename: string
  /** Column definitions */
  columns: ExportColumn[]
  /** Data rows */
  data: any[]
  /** Sheet name (Excel only, default: 'Sheet1') */
  sheetName?: string
}

/**
 * Pick i18n value for export (zh preferred, fallback to en)
 */
function pickI18nForExport(value: any): string {
  if (!value) return ''
  if (typeof value === 'string') return value
  if (typeof value === 'object') {
    return value.zh || value.en || ''
  }
  return String(value)
}

/**
 * Extract cell value from a row based on column definition
 */
function getCellValue(row: any, col: ExportColumn): any {
  if (col.accessor) return col.accessor(row)
  if (!col.key) return ''
  const value = row[col.key]
  // Auto-detect I18nObject
  if (value && typeof value === 'object' && !Array.isArray(value) && ('zh' in value || 'en' in value)) {
    return pickI18nForExport(value)
  }
  if (value === null || value === undefined) return ''
  return value
}

/**
 * Convert data to 2D array for export
 */
function toSheetData(options: ExportOptions): any[][] {
  const { columns, data } = options
  const headers = columns.map((c) => c.header)
  const rows = data.map((row) => columns.map((col) => getCellValue(row, col)))
  return [headers, ...rows]
}

/**
 * Export data as CSV file
 */
export function exportCSV(options: ExportOptions): void {
  try {
    const sheetData = toSheetData(options)
    const csvContent = sheetData
      .map((row) =>
        row
          .map((cell: any) => {
            const str = String(cell ?? '')
            // Escape quotes and wrap in quotes if contains comma, quote, or newline
            if (str.includes(',') || str.includes('"') || str.includes('\n')) {
              return `"${str.replace(/"/g, '""')}"`
            }
            return str
          })
          .join(',')
      )
      .join('\n')

    // Add BOM for Excel to recognize UTF-8
    const blob = new Blob(['﻿' + csvContent], { type: 'text/csv;charset=utf-8;' })
    downloadBlob(blob, `${options.filename}.csv`)
    ElMessage.success('CSV 导出成功')
  } catch (err) {
    ElMessage.error('CSV 导出失败')
    console.error('CSV export error:', err)
  }
}

/**
 * Export data as Excel (.xlsx) file
 */
export function exportExcel(options: ExportOptions): void {
  try {
    const sheetData = toSheetData(options)
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.aoa_to_sheet(sheetData)

    // Set column widths
    ws['!cols'] = options.columns.map((col) => ({
      wch: col.width || Math.max(col.header.length * 2, 12),
    }))

    XLSX.utils.book_append_sheet(wb, ws, options.sheetName || 'Sheet1')
    const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })
    downloadBlob(blob, `${options.filename}.xlsx`)
    ElMessage.success('Excel 导出成功')
  } catch (err) {
    ElMessage.error('Excel 导出失败')
    console.error('Excel export error:', err)
  }
}

/**
 * Helper to trigger file download from Blob
 */
function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.style.display = 'none'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  setTimeout(() => URL.revokeObjectURL(url), 100)
}

/**
 * Composable for use in list pages
 */
export function useExport() {
  return {
    exportCSV,
    exportExcel,
    pickI18nForExport,
  }
}
