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
  const { closeChat, clearHistory, createNewSession, isAuthenticated } = useChatContext()
  const { modeConfig } = useChatModeContext()

  return (
    <div className="flex items-center justify-between border-b border-[#E5E7EB] bg-white px-4 py-3 dark:border-[#2A2B32] dark:bg-[#212121]">
      {/* Left side - Menu (only show for authenticated users) */}
      <div className="flex items-center gap-2">
        {isAuthenticated && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleSidebar}
            className="h-8 w-8 text-[#6E6E80] hover:bg-[#F7F7F8] hover:text-[#353740] dark:hover:bg-[#2A2B32]"
            aria-label="Menu"
          >
            <Menu className="h-4 w-4" />
          </Button>
        )}

        {/* Center - Mode name with dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center gap-1.5 text-sm font-semibold text-[#353740] hover:bg-[#F7F7F8] dark:text-[#ECECF1] dark:hover:bg-[#2A2B32]"
            >
              ChatGPT
              <ChevronDown className="h-3.5 w-3.5 text-[#6E6E80]" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuItem className="text-xs">
              <span className="flex items-center gap-2">
                <ChatModeBadge />
              </span>
            </DropdownMenuItem>
            <DropdownMenuItem className="text-xs">
              <span className="flex items-center gap-2">
                <span className="text-[#10A37F]">●</span>
                GPT-4o Mini
              </span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-xs" onClick={clearHistory}>
              Clear conversation
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Right side - New chat and close buttons */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-[#6E6E80] hover:bg-[#F7F7F8] hover:text-[#353740] dark:hover:bg-[#2A2B32]"
          aria-label="New chat"
          onClick={createNewSession}
        >
          <MessageSquarePlus className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={closeChat}
          className="h-8 w-8 text-[#6E6E80] hover:bg-[#F7F7F8] hover:text-[#353740] dark:hover:bg-[#2A2B32]"
          aria-label="Close chat"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
