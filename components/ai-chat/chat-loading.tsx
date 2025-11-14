'use client'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'

export function ChatLoading() {
  return (
    <div className="w-full border-b border-[#E5E7EB] bg-[#F7F7F8] dark:border-[#2A2B32] dark:bg-[#2A2B32] animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
      <div className="mx-auto flex w-full max-w-3xl items-start gap-4 px-4 py-6 md:gap-6 md:px-6">
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarFallback className="bg-[#10A37F] text-sm font-semibold text-white">
            AI
          </AvatarFallback>
        </Avatar>

        <div className="flex items-center gap-1.5 pt-1">
          <div
            className="h-2 w-2 animate-bounce rounded-full bg-[#6E6E80] dark:bg-[#9CA3AF]"
            style={{ animationDelay: '0ms' }}
          />
          <div
            className="h-2 w-2 animate-bounce rounded-full bg-[#6E6E80] dark:bg-[#9CA3AF]"
            style={{ animationDelay: '150ms' }}
          />
          <div
            className="h-2 w-2 animate-bounce rounded-full bg-[#6E6E80] dark:bg-[#9CA3AF]"
            style={{ animationDelay: '300ms' }}
          />
        </div>
      </div>
    </div>
  )
}
