// components/ai-chat/action-confirmation-card.tsx

'use client'

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, CheckCircle, Loader2, FileText } from 'lucide-react'
import { AIAction, ValidationError } from '@/lib/ai/actions/types'

interface ActionConfirmationCardProps {
  action: AIAction
  onConfirm: () => void
  onCancel: () => void
  onEdit?: () => void
  isExecuting?: boolean
  children?: React.ReactNode // For action-specific preview
}

export function ActionConfirmationCard({
  action,
  onConfirm,
  onCancel,
  onEdit,
  isExecuting = false,
  children
}: ActionConfirmationCardProps) {

  const hasErrors = action.validationErrors.some(e => e.severity === 'error')
  const hasWarnings = action.validationErrors.some(e => e.severity === 'warning')

  return (
    <Card className="border-amber-200 shadow-lg">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {getActionIcon(action.type)}
              {getActionTitle(action.type)}
            </CardTitle>
            <CardDescription>
              Please review and confirm the action
            </CardDescription>
          </div>
          <Badge variant={hasErrors ? 'destructive' : hasWarnings ? 'secondary' : 'default'}>
            {action.status}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Validation Messages */}
        {action.validationErrors.length > 0 && (
          <div className="space-y-2">
            {action.validationErrors.map((error, index) => (
              <div
                key={index}
                className={`flex items-start gap-2 p-3 rounded-md ${
                  error.severity === 'error'
                    ? 'bg-red-50 text-red-900 border border-red-200 dark:bg-red-950 dark:text-red-100'
                    : 'bg-yellow-50 text-yellow-900 border border-yellow-200 dark:bg-yellow-950 dark:text-yellow-100'
                }`}
              >
                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <span className="font-medium">{error.field}: </span>
                  {error.message}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Action-specific preview (children) */}
        {children}

        {/* Missing fields prompt */}
        {action.missingFields.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3 dark:bg-blue-950 dark:border-blue-800">
            <p className="text-sm text-blue-900 dark:text-blue-100">
              <strong>Missing information:</strong> {action.missingFields.join(', ')}
            </p>
            <p className="text-xs text-blue-700 mt-1 dark:text-blue-300">
              Please provide these details to continue.
            </p>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex gap-2">
        <Button
          variant="outline"
          onClick={onCancel}
          disabled={isExecuting}
        >
          Cancel
        </Button>

        {onEdit && (
          <Button
            variant="secondary"
            onClick={onEdit}
            disabled={isExecuting}
          >
            Edit
          </Button>
        )}

        <Button
          onClick={onConfirm}
          disabled={hasErrors || action.missingFields.length > 0 || isExecuting}
          className="ml-auto bg-amber-600 hover:bg-amber-700"
        >
          {isExecuting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <CheckCircle className="mr-2 h-4 w-4" />
              Confirm & Create
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}

function getActionIcon(type: string) {
  return <FileText className="h-5 w-5" />
}

function getActionTitle(type: string) {
  const titles: Record<string, string> = {
    create_invoice: 'Create New Invoice',
    add_customer: 'Add New Customer',
    add_stock: 'Add Stock Item',
  }
  return titles[type] || 'Action'
}
