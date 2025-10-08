"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2, AlertCircle, Info } from "lucide-react"
import { BillExtractionData } from "@/lib/ai/actions/purchase-bill/bill-action-schema"
import { format } from "date-fns"

interface ExtractionPreviewProps {
  data: BillExtractionData
}

export function ExtractionPreview({ data }: ExtractionPreviewProps) {
  const confidenceLevel = data.confidence >= 0.9 ? "high" : data.confidence >= 0.7 ? "medium" : "low"

  const getConfidenceBadge = () => {
    switch (confidenceLevel) {
      case "high":
        return <Badge variant="default" className="bg-green-600"><CheckCircle2 className="mr-1 h-3 w-3" /> High Confidence</Badge>
      case "medium":
        return <Badge variant="secondary"><Info className="mr-1 h-3 w-3" /> Medium Confidence</Badge>
      case "low":
        return <Badge variant="destructive"><AlertCircle className="mr-1 h-3 w-3" /> Low Confidence</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Confidence Alert */}
      {confidenceLevel !== "high" && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {confidenceLevel === "medium"
              ? "Please review the extracted information carefully. Some fields may need correction."
              : "The image quality may be low. Please verify all extracted information before saving."}
          </AlertDescription>
        </Alert>
      )}

      {/* Extraction Summary */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Extracted Information</CardTitle>
              <CardDescription>
                Review the information extracted from the bill photo
              </CardDescription>
            </div>
            {getConfidenceBadge()}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Supplier Info */}
          <div>
            <h3 className="text-sm font-semibold mb-3 text-muted-foreground">Supplier Information</h3>
            <div className="grid gap-2 md:grid-cols-2">
              <div>
                <p className="text-xs text-muted-foreground">Supplier Name</p>
                <p className="font-medium">{data.supplier.name}</p>
              </div>
              {data.supplier.phone && (
                <div>
                  <p className="text-xs text-muted-foreground">Phone</p>
                  <p className="font-medium">{data.supplier.phone}</p>
                </div>
              )}
              {data.supplier.email && (
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="font-medium">{data.supplier.email}</p>
                </div>
              )}
              {data.supplier.address && (
                <div className="md:col-span-2">
                  <p className="text-xs text-muted-foreground">Address</p>
                  <p className="font-medium">{data.supplier.address}</p>
                </div>
              )}
              {data.supplier.gstNumber && (
                <div>
                  <p className="text-xs text-muted-foreground">GST Number</p>
                  <p className="font-medium">{data.supplier.gstNumber}</p>
                </div>
              )}
            </div>
          </div>

          {/* Invoice Details */}
          <div>
            <h3 className="text-sm font-semibold mb-3 text-muted-foreground">Invoice Details</h3>
            <div className="grid gap-2 md:grid-cols-3">
              <div>
                <p className="text-xs text-muted-foreground">Invoice Number</p>
                <p className="font-medium">{data.invoiceNumber}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Invoice Date</p>
                <p className="font-medium">{format(new Date(data.invoiceDate), "PPP")}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Payment Status</p>
                <Badge variant={data.paymentStatus === "Paid" ? "default" : "secondary"}>
                  {data.paymentStatus}
                </Badge>
              </div>
            </div>
          </div>

          {/* Financial Details */}
          <div>
            <h3 className="text-sm font-semibold mb-3 text-muted-foreground">Financial Details</h3>
            <div className="grid gap-2 md:grid-cols-3">
              <div>
                <p className="text-xs text-muted-foreground">Total Amount</p>
                <p className="font-medium text-lg">₹{data.amount.toFixed(2)}</p>
              </div>
              {data.taxAmount && (
                <div>
                  <p className="text-xs text-muted-foreground">Tax Amount</p>
                  <p className="font-medium">₹{data.taxAmount.toFixed(2)}</p>
                </div>
              )}
              {data.discountAmount && (
                <div>
                  <p className="text-xs text-muted-foreground">Discount</p>
                  <p className="font-medium text-green-600">-₹{data.discountAmount.toFixed(2)}</p>
                </div>
              )}
              {data.numberOfItems && (
                <div>
                  <p className="text-xs text-muted-foreground">Number of Items</p>
                  <p className="font-medium">{data.numberOfItems}</p>
                </div>
              )}
            </div>
          </div>

          {/* Items Table */}
          {data.items && data.items.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold mb-3 text-muted-foreground">Items</h3>
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item Name</TableHead>
                      <TableHead className="text-right">Quantity</TableHead>
                      <TableHead className="text-right">Rate</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell className="text-right">{item.quantity || "-"}</TableCell>
                        <TableCell className="text-right">
                          {item.rate ? `₹${item.rate.toFixed(2)}` : "-"}
                        </TableCell>
                        <TableCell className="text-right">₹{item.amount.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {/* Notes */}
          {data.notes && (
            <div>
              <h3 className="text-sm font-semibold mb-2 text-muted-foreground">Notes</h3>
              <p className="text-sm bg-muted p-3 rounded-md">{data.notes}</p>
            </div>
          )}

          {/* Metadata */}
          <div className="pt-4 border-t">
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>Confidence: {(data.confidence * 100).toFixed(0)}%</span>
              {data.detectedLanguage && (
                <span>Language: {data.detectedLanguage.toUpperCase()}</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
