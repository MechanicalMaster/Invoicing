'use client'

import { useEffect, useRef } from 'react'
import { format, isToday, isYesterday, isThisWeek } from 'date-fns'
import { useChatContext } from '@/lib/contexts/chat-context'
import { ChatMessageItem } from './chat-message-item'
import { ChatLoading } from './chat-loading'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'

function getDateLabel(date: Date): string {
  if (isToday(date)) return 'Today'
  if (isYesterday(date)) return 'Yesterday'
  if (isThisWeek(date)) return format(date, 'EEEE')
  return format(date, 'MMM d, yyyy')
}

export function ChatMessages() {
  const { messages, isLoading, hasMore, loadMoreMessages, retryMessage, error } = useChatContext()
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Group messages by date
  const groupedMessages = messages.reduce(
    (groups, message) => {
      const dateLabel = getDateLabel(message.timestamp)
      if (!groups[dateLabel]) {
        groups[dateLabel] = []
      }
      groups[dateLabel].push(message)
      return groups
    },
    {} as Record<string, typeof messages>
  )

  return (
    <ScrollArea className="flex-1 bg-[#F7F7F8] dark:bg-[#212121]">
      <div className="mx-auto flex max-w-3xl flex-col px-4 py-4 md:px-6">
        {hasMore && (
          <div className="flex justify-center py-2">
            <Button
              variant="outline"
              size="sm"
              onClick={loadMoreMessages}
              disabled={isLoading}
            >
              Load More
            </Button>
          </div>
        )}

        {error && messages.length === 0 && !isLoading && (
          <div className="flex flex-col items-center justify-center gap-4 py-12 text-center px-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
              <span className="text-2xl">⚠️</span>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-red-600 dark:text-red-400">Setup Required</h3>
              <p className="text-sm text-muted-foreground max-w-[320px]">
                {error}
              </p>
              {error.includes('migration') && (
                <p className="text-xs text-muted-foreground max-w-[320px] pt-2">
                  Run the SQL migration file: <code className="bg-muted px-1 py-0.5 rounded">migrations/create_ai_chat_tables.sql</code>
                </p>
              )}
            </div>
          </div>
        )}

        {messages.length === 0 && !isLoading && !error && (
          <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#EA7317]">
              <span className="text-2xl font-bold text-white">AI</span>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-[#353740] dark:text-[#ECECF1]">
                Welcome to AI Assistant
              </h3>
              <p className="max-w-[320px] text-sm text-[#6E6E80]">
                Ask me anything about invoices, inventory, customers, or how to use the app.
              </p>
            </div>
          </div>
        )}

        {Object.entries(groupedMessages).map(([dateLabel, msgs]) => (
          <div key={dateLabel} className="space-y-1">
            <div className="flex justify-center py-3">
              <span className="rounded-full bg-white/50 px-3 py-1 text-xs font-medium text-[#6E6E80] dark:bg-[#2A2B32]">
                {dateLabel}
              </span>
            </div>
            {msgs.map((message) => (
              <ChatMessageItem
                key={message.id}
                message={message}
                onRetry={retryMessage}
              />
            ))}
          </div>
        ))}

        {isLoading && messages.length > 0 && <ChatLoading />}

        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  )
}
