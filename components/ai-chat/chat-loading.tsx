'use client'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'

export function ChatLoading() {
  return (
    <div className="mb-4 flex animate-in fade-in-0 slide-in-from-bottom-2 items-start gap-3 duration-300">
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarFallback className="bg-[#EA7317] text-sm font-semibold text-white">
          AI
        </AvatarFallback>
      </Avatar>

      <div className="flex items-center gap-1 rounded-[18px] bg-[#F7F7F8] px-4 py-3 dark:bg-[#2A2B32]">
        <div
          className="h-2 w-2 animate-bounce rounded-full bg-[#6E6E80]"
          style={{ animationDelay: '0ms' }}
        />
        <div
          className="h-2 w-2 animate-bounce rounded-full bg-[#6E6E80]"
          style={{ animationDelay: '150ms' }}
        />
        <div
          className="h-2 w-2 animate-bounce rounded-full bg-[#6E6E80]"
          style={{ animationDelay: '300ms' }}
        />
      </div>
    </div>
  )
}
