'use client'

import { useEffect, useState } from 'react'
import { useChatContext } from '@/lib/contexts/chat-context'
import { ChatHeader } from './chat-header'
import { ChatMessages } from './chat-messages'
import { ChatInput } from './chat-input'
import { ChatSidebar } from './chat-sidebar'
import { cn } from '@/lib/utils'

export function ChatPanel() {
  const { isOpen, closeChat, error } = useChatContext()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  // Handle ESC key to close chat
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        if (isSidebarOpen) {
          setIsSidebarOpen(false)
        } else {
          closeChat()
        }
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, isSidebarOpen, closeChat])

  if (!isOpen) return null

  return (
    <>
      {/* Chat Sidebar */}
      <ChatSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Backdrop for desktop */}
      <div
        className="fixed inset-0 z-40 hidden bg-black/30 backdrop-blur-sm md:block"
        onClick={closeChat}
        aria-hidden="true"
      />

      {/* Chat Panel */}
      <div
        className={cn(
          'fixed z-50 flex flex-col',
          // Mobile: fullscreen
          'bottom-0 left-0 right-0 top-0 h-screen w-screen',
          // Desktop: side panel on the RIGHT
          'md:bottom-4 md:right-4 md:top-4 md:left-auto md:h-[calc(100vh-2rem)] md:w-[480px] md:max-w-[calc(100vw-2rem)] md:rounded-2xl md:shadow-2xl md:border md:border-[#E5E7EB] dark:md:border-[#2A2B32]',
          // Background
          'bg-white dark:bg-[#212121]',
          // Animation
          'animate-in slide-in-from-bottom duration-300',
          'md:slide-in-from-right'
        )}
      >
        <ChatHeader onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

        {error && (
          <div className="border-b border-red-200 bg-red-50 px-4 py-2 dark:border-red-900 dark:bg-red-950">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        <ChatMessages />

        <ChatInput />
      </div>
    </>
  )
}
