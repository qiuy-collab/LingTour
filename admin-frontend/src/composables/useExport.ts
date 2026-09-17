import { ElMessage } from 'element-plus'

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
 * Extract cell value from a row based on column definition
 */
function getCellValue(row: any, col: ExportColumn): any {
  if (col.accessor) return col.accessor(row)
  if (!col.key) return ''
  const value = row[col.key]
  if (value === null || value === undefined) return ''
  return value
}

/**
 * Guard against CSV formula injection (OWASP): spreadsheet apps interpret
 * cells starting with = + - @ or tab/CR as formulas (e.g. =HYPERLINK(...)).
 * Prefix such string values with `'` so they render literally. Numbers and
 * booleans (e.g. negative amounts) pass through untouched.
 */
function sanitizeCsvCell(value: unknown): string {
  const str = String(value ?? '')
  if (typeof value === 'number' || typeof value === 'boolean') return str
  if (/^[=+\-@\t\r]/.test(str)) {
    return `'${str}`
  }
  return str
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
            const str = sanitizeCsvCell(cell)
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
  void exportExcelAsync(options)
}

async function exportExcelAsync(options: ExportOptions): Promise<void> {
  try {
    const XLSX = await import('xlsx')
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
  }
}
