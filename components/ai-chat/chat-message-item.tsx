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
        'group mb-4 flex animate-in fade-in-0 slide-in-from-bottom-2 duration-300',
        isUser ? 'justify-end' : 'items-start gap-3'
      )}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {!isUser && (
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarFallback className="bg-[#EA7317] text-sm font-semibold text-white">
            AI
          </AvatarFallback>
        </Avatar>
      )}

      <div className={cn('flex flex-col', isUser ? 'items-end' : 'items-start', hasAction ? 'w-full max-w-[90%]' : 'max-w-[75%] md:max-w-[70%]')}>
        {!hasAction && (
          <div
            className={cn(
              'rounded-[18px] px-4 py-3 transition-all',
              isUser
                ? 'bg-[#EA7317] text-white shadow-sm'
                : 'bg-[#F7F7F8] text-[#353740] dark:bg-[#2A2B32] dark:text-[#ECECF1]',
              isError && 'border-2 border-red-500',
              'hover:brightness-105'
            )}
          >
            <p className="whitespace-pre-wrap break-words text-[15px] leading-[1.6] md:text-base md:leading-[1.7]">
              {message.content}
            </p>
          </div>
        )}

        {/* Action Confirmation Card */}
        {hasAction && message.action.type === 'create_invoice' && (
          <div className="w-full">
            <div className="rounded-[18px] px-4 py-3 mb-3 bg-[#F7F7F8] text-[#353740] dark:bg-[#2A2B32] dark:text-[#ECECF1]">
              <p className="whitespace-pre-wrap break-words text-[15px] leading-[1.6] md:text-base md:leading-[1.7]">
                {message.content}
              </p>
            </div>
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
        <div className="mt-1 flex items-center gap-2 px-1">
          <span className="text-[11px] text-[#6E6E80] opacity-65">
            {format(message.timestamp, 'h:mm a')}
          </span>

          {isError && (
            <div className="flex items-center gap-1">
              <AlertCircle className="h-3 w-3 text-red-500" />
              <span className="text-xs text-red-500">Failed</span>
              {onRetry && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRetry(message.id)}
                  className="h-auto p-0 text-xs text-red-500 hover:text-red-600"
                >
                  <RefreshCw className="mr-1 h-3 w-3" />
                  Retry
                </Button>
              )}
            </div>
          )}

          {message.status === 'sending' && (
            <span className="text-xs text-[#6E6E80]">Sending...</span>
          )}
        </div>

        {/* Action icons for AI messages */}
        {!isUser && message.status === 'sent' && (
          <div
            className={cn(
              'mt-1 flex items-center gap-2 px-1 transition-opacity',
              showActions ? 'opacity-100' : 'opacity-0'
            )}
          >
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0 text-[#6E6E80] hover:text-[#353740]"
              onClick={() => navigator.clipboard.writeText(message.content)}
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0 text-[#6E6E80] hover:text-[#353740]"
            >
              <ThumbsUp className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0 text-[#6E6E80] hover:text-[#353740]"
            >
              <ThumbsDown className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
