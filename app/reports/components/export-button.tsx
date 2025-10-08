"use client"

import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { exportToExcel, type ExportData } from "@/lib/utils/excel-export"
import { useToast } from "@/components/ui/use-toast"

interface ExportButtonProps {
  data: ExportData[]
  fileName: string
  sheetName?: string
  disabled?: boolean
}

export function ExportButton({
  data,
  fileName,
  sheetName = "Report",
  disabled = false,
}: ExportButtonProps) {
  const { toast } = useToast()

  const handleExport = () => {
    if (data.length === 0) {
      toast({
        title: "No data to export",
        description: "There is no data available to export.",
        variant: "destructive",
      })
      return
    }

    const result = exportToExcel(data, fileName, sheetName)

    if (result.success) {
      toast({
        title: "Export successful",
        description: `${fileName}.xlsx has been downloaded.`,
      })
    } else {
      toast({
        title: "Export failed",
        description: "There was an error exporting the data.",
        variant: "destructive",
      })
    }
  }

  return (
    <Button
      onClick={handleExport}
      disabled={disabled || data.length === 0}
      variant="outline"
      className="gap-2"
    >
      <Download className="h-4 w-4" />
      Export to Excel
    </Button>
  )
}
