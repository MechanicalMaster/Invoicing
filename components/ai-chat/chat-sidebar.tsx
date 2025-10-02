'use client'

import { useEffect, useState } from 'react'
import { MessageSquare, Trash2, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useChatContext } from '@/lib/contexts/chat-context'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import supabase from '@/lib/supabase'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

interface ChatSession {
  id: string
  title: string
  updated_at: string
  message_count?: number
}

interface ChatSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function ChatSidebar({ isOpen, onClose }: ChatSidebarProps) {
  const { currentSession, loadSession, createNewSession } = useChatContext()
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Fetch all sessions
  const fetchSessions = async () => {
    try {
      setIsLoading(true)

      // Get auth token
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token

      const response = await fetch('/api/ai/chat/sessions', {
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch sessions')
      }

      const data = await response.json()
      setSessions(data.sessions || [])
    } catch (error) {
      console.error('Failed to fetch sessions:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Load sessions on mount and when sidebar opens
  useEffect(() => {
    if (isOpen) {
      fetchSessions()
    }
  }, [isOpen])

  // Handle session selection
  const handleSelectSession = async (sessionId: string) => {
    if (currentSession?.id === sessionId) {
      onClose()
      return
    }

    await loadSession(sessionId)
    onClose()
  }

  // Handle new chat
  const handleNewChat = async () => {
    await createNewSession()
    onClose()
    fetchSessions() // Refresh list
  }

  // Handle delete session
  const handleDeleteSession = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation()

    try {
      // Get auth token
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token

      const response = await fetch(`/api/ai/chat/session/${sessionId}`, {
        method: 'DELETE',
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      })

      if (!response.ok) {
        throw new Error('Failed to delete session')
      }

      // If deleted current session, create new one
      if (currentSession?.id === sessionId) {
        await createNewSession()
      }

      // Refresh sessions list
      fetchSessions()
    } catch (error) {
      console.error('Failed to delete session:', error)
    }
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[60] bg-black/20 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <div
        className={cn(
          'fixed left-0 top-0 z-[70] flex h-full w-[280px] flex-col',
          'bg-white shadow-2xl dark:bg-[#212121]',
          'animate-in slide-in-from-left duration-300'
        )}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between border-b border-[#D1D5DB] p-4 dark:border-[#4E4F60]">
          <h3 className="text-sm font-semibold text-[#353740] dark:text-[#ECECF1]">
            Chat History
          </h3>
          <Button
            size="sm"
            onClick={handleNewChat}
            className="h-8 bg-[#EA7317] text-xs text-white hover:bg-[#D97706]"
          >
            New Chat
          </Button>
        </div>

        {/* Sessions List */}
        <ScrollArea className="flex-1 p-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-sm text-[#6E6E80]">Loading...</div>
            </div>
          ) : sessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
              <MessageSquare className="h-8 w-8 text-[#6E6E80] opacity-50" />
              <p className="text-sm text-[#6E6E80]">No chat history yet</p>
              <p className="text-xs text-[#6E6E80]">Start a new conversation!</p>
            </div>
          ) : (
            <div className="space-y-1">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className={cn(
                    'group relative flex cursor-pointer items-start gap-2 rounded-lg p-3 transition-colors',
                    'hover:bg-[#F7F7F8] dark:hover:bg-[#2A2B32]',
                    currentSession?.id === session.id &&
                      'bg-[#F7F7F8] dark:bg-[#2A2B32]'
                  )}
                  onClick={() => handleSelectSession(session.id)}
                >
                  <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-[#6E6E80]" />

                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-[#353740] dark:text-[#ECECF1]">
                      {session.title}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-[#6E6E80]">
                      <Clock className="h-3 w-3" />
                      {formatDistanceToNow(new Date(session.updated_at), {
                        addSuffix: true,
                      })}
                      {session.message_count && (
                        <span className="ml-1">· {session.message_count} msgs</span>
                      )}
                    </div>
                  </div>

                  {/* Delete button */}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={cn(
                          'h-7 w-7 shrink-0 p-0 opacity-0 transition-opacity',
                          'text-[#6E6E80] hover:bg-red-50 hover:text-red-600',
                          'group-hover:opacity-100'
                        )}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete conversation?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete this conversation and all its messages.
                          This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={(e) => handleDeleteSession(session.id, e)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Footer with count */}
        {sessions.length > 0 && (
          <div className="border-t border-[#D1D5DB] p-3 text-center dark:border-[#4E4F60]">
            <p className="text-xs text-[#6E6E80]">
              {sessions.length} conversation{sessions.length !== 1 ? 's' : ''}
            </p>
          </div>
        )}
      </div>
    </>
  )
}
