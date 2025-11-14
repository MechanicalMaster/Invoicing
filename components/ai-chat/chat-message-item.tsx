'use client'

import { format } from 'date-fns'
import { AlertCircle, RefreshCw, Copy, ThumbsUp, ThumbsDown } from 'lucide-react'
import { ChatMessage } from '@/lib/contexts/chat-context'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { ActionConfirmationCard } from './action-confirmation-card'
import { InvoicePreviewCard } from './invoice-preview-card'
import { InvoiceActionData } from '@/lib/ai/actions/invoice/invoice-action-schema'
import { useRouter } from 'next/navigation'
import supabase from '@/lib/supabase'

interface ChatMessageItemProps {
  message: ChatMessage
  onRetry?: (messageId: string) => void
}

export function ChatMessageItem({ message, onRetry }: ChatMessageItemProps) {
  const isUser = message.role === 'user'
  const isError = message.status === 'error'
  const [showActions, setShowActions] = useState(false)
  const [isExecuting, setIsExecuting] = useState(false)
  const router = useRouter()

  const hasAction = !isUser && message.action

  const handleConfirmAction = async () => {
    if (!message.actionId) {
      console.error('No actionId found in message:', message)
      alert('No action ID found. Please try creating the invoice again.')
      return
    }

    console.log('Executing action with ID:', message.actionId)
    setIsExecuting(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token

      const response = await fetch('/api/ai/execute-action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({ actionId: message.actionId }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to execute action')
      }

      const result = await response.json()

      if (result.success && result.redirectUrl) {
        router.push(result.redirectUrl)
      }
    } catch (error) {
      console.error('Failed to execute action:', error)
      alert(error instanceof Error ? error.message : 'Failed to execute action')
    } finally {
      setIsExecuting(false)
    }
  }

  const handleCancelAction = () => {
    // Just close/hide the action card - no API call needed
    console.log('Action cancelled')
  }

  return (
    <div
      className={cn(
        'group w-full border-b border-[#E5E7EB] dark:border-[#2A2B32] animate-in fade-in-0 slide-in-from-bottom-2 duration-300',
        isUser ? 'bg-white dark:bg-[#212121]' : 'bg-[#F7F7F8] dark:bg-[#2A2B32]'
      )}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="mx-auto flex w-full max-w-3xl items-start gap-4 px-4 py-6 md:gap-6 md:px-6">
        {/* Avatar - always on left for both user and AI */}
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarFallback className={cn(
            "text-sm font-semibold",
            isUser
              ? "bg-[#EA7317] text-white"
              : "bg-[#10A37F] text-white"
          )}>
            {isUser ? 'You' : 'AI'}
          </AvatarFallback>
        </Avatar>

        <div className="flex min-w-0 flex-1 flex-col">
          {!hasAction && (
            <div className="w-full">
              <p className="whitespace-pre-wrap break-words text-[15px] leading-[1.75] text-[#353740] dark:text-[#ECECF1]">
                {message.content}
              </p>
              {isError && (
                <div className="mt-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 dark:border-red-900 dark:bg-red-950">
                  <p className="text-sm text-red-600 dark:text-red-400">Failed to send message</p>
                </div>
              )}
            </div>
          )}

          {/* Action Confirmation Card */}
          {hasAction && message.action.type === 'create_invoice' && (
            <div className="w-full">
              <p className="mb-4 whitespace-pre-wrap break-words text-[15px] leading-[1.75] text-[#353740] dark:text-[#ECECF1]">
                {message.content}
              </p>
              <ActionConfirmationCard
                action={message.action}
                onConfirm={handleConfirmAction}
                onCancel={handleCancelAction}
                isExecuting={isExecuting}
              >
                <InvoicePreviewCard data={message.action.data as InvoiceActionData} />
              </ActionConfirmationCard>
            </div>
          )}

          {/* Timestamp and actions */}
          <div className="mt-2 flex items-center gap-3">
            <span className="text-xs text-[#6E6E80] dark:text-[#9CA3AF]">
              {format(message.timestamp, 'h:mm a')}
            </span>

            {isError && onRetry && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRetry(message.id)}
                className="h-auto px-2 py-1 text-xs text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950"
              >
                <RefreshCw className="mr-1 h-3 w-3" />
                Retry
              </Button>
            )}

            {message.status === 'sending' && (
              <span className="text-xs text-[#6E6E80] dark:text-[#9CA3AF]">Sending...</span>
            )}

            {/* Action icons for AI messages */}
            {!isUser && message.status === 'sent' && (
              <div
                className={cn(
                  'flex items-center gap-1 transition-opacity',
                  showActions ? 'opacity-100' : 'opacity-0'
                )}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 text-[#6E6E80] hover:bg-[#E5E7EB] hover:text-[#353740] dark:hover:bg-[#374151]"
                  onClick={() => navigator.clipboard.writeText(message.content)}
                  title="Copy"
                >
                  <Copy className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 text-[#6E6E80] hover:bg-[#E5E7EB] hover:text-[#353740] dark:hover:bg-[#374151]"
                  title="Like"
                >
                  <ThumbsUp className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 text-[#6E6E80] hover:bg-[#E5E7EB] hover:text-[#353740] dark:hover:bg-[#374151]"
                  title="Dislike"
                >
                  <ThumbsDown className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
