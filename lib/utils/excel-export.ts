import * as XLSX from 'xlsx'

export interface ExportData {
  [key: string]: string | number | boolean | null | undefined
}

export function exportToExcel(
  data: ExportData[],
  fileName: string,
  sheetName: string = 'Sheet1'
) {
  try {
    // Create a new workbook
    const workbook = XLSX.utils.book_new()

    // Convert data to worksheet
    const worksheet = XLSX.utils.json_to_sheet(data)

    // Auto-size columns
    const columnWidths = Object.keys(data[0] || {}).map((key) => {
      const maxLength = Math.max(
        key.length,
        ...data.map((row) => String(row[key] || '').length)
      )
      return { wch: Math.min(maxLength + 2, 50) }
    })
    worksheet['!cols'] = columnWidths

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)

    // Generate Excel file and trigger download
    XLSX.writeFile(workbook, `${fileName}.xlsx`)

    return { success: true }
  } catch (error) {
    console.error('Error exporting to Excel:', error)
    return { success: false, error }
  }
}

export function formatCurrency(amount: number): string {
  return `₹${amount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

export function formatDate(date: string | Date): string {
  if (!date) return ''
  const d = new Date(date)
  return d.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}
