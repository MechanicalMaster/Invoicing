'use client'

import { MessageCircle, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useChatContext } from '@/lib/contexts/chat-context'
import { cn } from '@/lib/utils'

export function ChatFloatingButton() {
  const { openChat, unreadCount } = useChatContext()

  return (
    <div className="fixed bottom-6 right-6 z-50 md:bottom-6 md:right-6">
      <Button
        onClick={openChat}
        size="lg"
        className={cn(
          'group relative h-14 w-14 rounded-full shadow-lg transition-all duration-300',
          'bg-gradient-to-br from-[#EA7317] to-[#D97706] hover:from-[#D97706] hover:to-[#B45309]',
          'md:h-[60px] md:w-[60px]',
          'hover:scale-110 hover:shadow-xl',
          'active:scale-95',
          'border-2 border-white/20'
        )}
        aria-label="Open AI Chat"
      >
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

        <div className="relative flex items-center justify-center">
          <MessageCircle className="h-6 w-6 text-white transition-transform group-hover:scale-110" />
          <Sparkles className="absolute -right-1 -top-1 h-3 w-3 text-yellow-300 opacity-0 transition-all group-hover:opacity-100" />
        </div>

        {unreadCount > 0 && (
          <div className="absolute -right-1 -top-1 flex h-6 w-6 animate-bounce items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white shadow-lg ring-2 ring-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </div>
        )}
      </Button>

      {/* Pulsing ring animation */}
      <div className="absolute inset-0 -z-10 animate-ping rounded-full bg-[#EA7317] opacity-20" style={{ animationDuration: '2s' }} />
    </div>
  )
}
