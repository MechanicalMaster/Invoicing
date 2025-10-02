'use client'

import { format } from 'date-fns'
import { AlertCircle, RefreshCw, Copy, ThumbsUp, ThumbsDown } from 'lucide-react'
import { ChatMessage } from '@/lib/contexts/chat-context'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { useState } from 'react'

interface ChatMessageItemProps {
  message: ChatMessage
  onRetry?: (messageId: string) => void
}

export function ChatMessageItem({ message, onRetry }: ChatMessageItemProps) {
  const isUser = message.role === 'user'
  const isError = message.status === 'error'
  const [showActions, setShowActions] = useState(false)

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

      <div className={cn('flex flex-col', isUser ? 'items-end' : 'items-start', 'max-w-[75%] md:max-w-[70%]')}>
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
