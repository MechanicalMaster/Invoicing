'use client'

import { X, MessageSquarePlus, ChevronDown, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useChatContext } from '@/lib/contexts/chat-context'
import { useChatModeContext } from '@/lib/ai/context/chat-mode-context'
import { ChatModeBadge } from './chat-mode-badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface ChatHeaderProps {
  onToggleSidebar: () => void
}

export function ChatHeader({ onToggleSidebar }: ChatHeaderProps) {
  const { closeChat, clearHistory, createNewSession } = useChatContext()
  const { modeConfig } = useChatModeContext()

  return (
    <div className="flex items-center justify-between border-b border-[#D1D5DB] bg-white p-3 dark:border-[#4E4F60] dark:bg-[#212121]">
      {/* Left side - Menu */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggleSidebar}
        className="h-9 w-9 text-[#6E6E80] hover:bg-[#F7F7F8] hover:text-[#353740] dark:hover:bg-[#2A2B32]"
        aria-label="Menu"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Center - Mode name with dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex items-center gap-1 text-[15px] font-medium text-[#353740] hover:bg-[#F7F7F8] dark:text-[#ECECF1] dark:hover:bg-[#2A2B32]"
          >
            <span className="mr-1">{modeConfig.icon}</span>
            AI Assistant
            <ChevronDown className="h-4 w-4 text-[#6E6E80]" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="center" className="w-48">
          <DropdownMenuItem className="text-[13px]">
            <span className="flex items-center gap-2">
              <ChatModeBadge />
            </span>
          </DropdownMenuItem>
          <DropdownMenuItem className="text-[13px]">
            <span className="flex items-center gap-2">
              <span className="text-[#EA7317]">●</span>
              GPT-4o Mini
            </span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-[13px]" onClick={clearHistory}>
            Clear conversation
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Right side - New chat and close buttons */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-[#6E6E80] hover:bg-[#F7F7F8] hover:text-[#353740] dark:hover:bg-[#2A2B32]"
          aria-label="New chat"
          onClick={createNewSession}
        >
          <MessageSquarePlus className="h-5 w-5" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={closeChat}
          className="h-9 w-9 text-[#6E6E80] hover:bg-[#F7F7F8] hover:text-[#353740] dark:hover:bg-[#2A2B32]"
          aria-label="Close chat"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>
    </div>
  )
}
