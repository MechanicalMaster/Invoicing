'use client'

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import supabase from '@/lib/supabase'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  status: 'sending' | 'sent' | 'error'
  sessionId?: string
  action?: any // AI action data if this message has an associated action
  actionId?: string // ID of the action if this is an action message
}

export interface ChatSession {
  id: string
  title: string
  createdAt: Date
  updatedAt: Date
  isActive: boolean
}

interface ChatContextType {
  isOpen: boolean
  messages: ChatMessage[]
  isLoading: boolean
  error: string | null
  currentSession: ChatSession | null
  unreadCount: number
  openChat: () => void
  closeChat: () => void
  sendMessage: (content: string) => Promise<void>
  clearHistory: () => Promise<void>
  loadMoreMessages: () => Promise<void>
  hasMore: boolean
  retryMessage: (messageId: string) => Promise<void>
  loadSession: (sessionId: string) => Promise<void>
  createNewSession: () => Promise<void>
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export function useChatContext() {
  const context = useContext(ChatContext)
  if (!context) {
    throw new Error('useChatContext must be used within a ChatProvider')
  }
  return context
}

interface ChatProviderProps {
  children: React.ReactNode
}

export function ChatProvider({ children }: ChatProviderProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null)
  const [hasMore, setHasMore] = useState(false)
  const [offset, setOffset] = useState(0)
  const [unreadCount, setUnreadCount] = useState(0)

  // Load chat history when opening chat
  const loadChatHistory = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Get or create active session
      const { data: { user }, error: userError } = await supabase.auth.getUser()

      if (userError) {
        console.error('Auth error:', userError)
        setError('Authentication failed')
        setIsLoading(false)
        return
      }

      if (!user) {
        setError('Not authenticated')
        setIsLoading(false)
        return
      }

      // Get active session
      const { data: sessions, error: sessionError } = await supabase
        .from('ai_chat_sessions')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('updated_at', { ascending: false })
        .limit(1)

      if (sessionError) {
        console.error('Session query error:', sessionError)
        // If table doesn't exist, show helpful error
        if (sessionError.message?.includes('relation') || sessionError.message?.includes('does not exist')) {
          setError('Chat tables not found. Please run the database migration.')
          setIsLoading(false)
          return
        }
        throw sessionError
      }

      let session = sessions?.[0]

      // Create new session if none exists
      if (!session) {
        const { data: newSession, error: createError } = await supabase
          .from('ai_chat_sessions')
          .insert({
            user_id: user.id,
            title: 'New Chat',
            is_active: true,
          })
          .select()
          .single()

        if (createError) {
          console.error('Session creation error:', createError)
          throw createError
        }
        session = newSession
      }

      if (!session) {
        setError('Failed to create chat session')
        setIsLoading(false)
        return
      }

      setCurrentSession({
        id: session.id,
        title: session.title,
        createdAt: new Date(session.created_at),
        updatedAt: new Date(session.updated_at),
        isActive: session.is_active,
      })

      // Load messages for this session
      const { data: messagesData, error: messagesError, count } = await supabase
        .from('ai_chat_messages')
        .select('*', { count: 'exact' })
        .eq('session_id', session.id)
        .order('created_at', { ascending: true })
        .range(0, 49)

      if (messagesError) {
        console.error('Messages query error:', messagesError)
        // Don't throw - just show empty chat if no messages
        setMessages([])
        setHasMore(false)
        setOffset(0)
        setIsLoading(false)
        return
      }

      const formattedMessages: ChatMessage[] = (messagesData || []).map((msg: any) => ({
        id: msg.id,
        role: msg.role as 'user' | 'assistant' | 'system',
        content: msg.content,
        timestamp: new Date(msg.created_at),
        status: 'sent' as const,
        sessionId: msg.session_id,
      }))

      setMessages(formattedMessages)
      setHasMore((count || 0) > 50)
      setOffset(50)
    } catch (err) {
      console.error('Failed to load chat history:', err)
      setError(err instanceof Error ? err.message : 'Failed to load chat history')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const openChat = useCallback(() => {
    setIsOpen(true)
    setUnreadCount(0)
    if (messages.length === 0) {
      loadChatHistory()
    }
  }, [loadChatHistory, messages.length])

  const closeChat = useCallback(() => {
    setIsOpen(false)
  }, [])

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim()) {
        return
      }

      // If no session exists, load it first
      if (!currentSession) {
        await loadChatHistory()
        // Wait a bit for state to update, then retry
        setTimeout(() => {
          sendMessage(content)
        }, 500)
        return
      }

      const tempId = `temp-${Date.now()}`
      const userMessage: ChatMessage = {
        id: tempId,
        role: 'user',
        content: content.trim(),
        timestamp: new Date(),
        status: 'sending',
        sessionId: currentSession.id,
      }

      // Optimistically add user message
      setMessages((prev) => [...prev, userMessage])
      setError(null)
      setIsLoading(true)

      try {
        // Get auth session for token
        const { data: { session } } = await supabase.auth.getSession()
        const token = session?.access_token

        const response = await fetch('/api/ai/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
          },
          body: JSON.stringify({
            message: content.trim(),
            sessionId: currentSession.id,
          }),
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || 'Failed to send message')
        }

        const data = await response.json()

        // Update user message status
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === tempId
              ? { ...msg, id: data.userMessageId || msg.id, status: 'sent' as const }
              : msg
          )
        )

        // Add assistant response
        const assistantMessage: ChatMessage = {
          id: data.messageId,
          role: 'assistant',
          content: data.response,
          timestamp: new Date(),
          status: 'sent',
          sessionId: currentSession.id,
          action: data.type === 'action' ? data.action : undefined,
          actionId: data.action?.id,
        }

        setMessages((prev) => [...prev, assistantMessage])

        // If chat is closed, increment unread count
        if (!isOpen) {
          setUnreadCount((prev) => prev + 1)
        }
      } catch (err) {
        console.error('Failed to send message:', err)
        const errorMessage = err instanceof Error ? err.message : 'Failed to send message'
        setError(errorMessage)

        // Mark user message as error
        setMessages((prev) =>
          prev.map((msg) => (msg.id === tempId ? { ...msg, status: 'error' as const } : msg))
        )
      } finally {
        setIsLoading(false)
      }
    },
    [currentSession, loadChatHistory, isOpen]
  )

  const retryMessage = useCallback(
    async (messageId: string) => {
      const message = messages.find((msg) => msg.id === messageId)
      if (!message || message.role !== 'user') return

      // Remove the failed message
      setMessages((prev) => prev.filter((msg) => msg.id !== messageId))

      // Resend
      await sendMessage(message.content)
    },
    [messages, sendMessage]
  )

  const clearHistory = useCallback(async () => {
    if (!currentSession) return

    try {
      setIsLoading(true)
      const { error: deleteError } = await supabase
        .from('ai_chat_messages')
        .delete()
        .eq('session_id', currentSession.id)

      if (deleteError) throw deleteError

      setMessages([])
      setError(null)
    } catch (err) {
      console.error('Failed to clear history:', err)
      setError('Failed to clear history')
    } finally {
      setIsLoading(false)
    }
  }, [currentSession, supabase])

  const loadMoreMessages = useCallback(async () => {
    if (!currentSession || !hasMore || isLoading) return

    try {
      setIsLoading(true)
      const { data: messagesData, error: messagesError, count } = await supabase
        .from('ai_chat_messages')
        .select('*', { count: 'exact' })
        .eq('session_id', currentSession.id)
        .order('created_at', { ascending: true })
        .range(offset, offset + 49)

      if (messagesError) throw messagesError

      const formattedMessages: ChatMessage[] = (messagesData || []).map((msg: any) => ({
        id: msg.id,
        role: msg.role as 'user' | 'assistant' | 'system',
        content: msg.content,
        timestamp: new Date(msg.created_at),
        status: 'sent' as const,
        sessionId: msg.session_id,
      }))

      setMessages((prev) => [...formattedMessages, ...prev])
      setHasMore((count || 0) > offset + 50)
      setOffset((prev) => prev + 50)
    } catch (err) {
      console.error('Failed to load more messages:', err)
      setError('Failed to load more messages')
    } finally {
      setIsLoading(false)
    }
  }, [currentSession, hasMore, isLoading, offset, supabase])

  // Load a specific session
  const loadSession = useCallback(async (sessionId: string) => {
    try {
      setIsLoading(true)
      setError(null)

      // Get session details
      const { data: session, error: sessionError } = await supabase
        .from('ai_chat_sessions')
        .select('*')
        .eq('id', sessionId)
        .single()

      if (sessionError || !session) {
        throw new Error('Session not found')
      }

      setCurrentSession({
        id: session.id,
        title: session.title,
        createdAt: new Date(session.created_at),
        updatedAt: new Date(session.updated_at),
        isActive: session.is_active,
      })

      // Load messages for this session
      const { data: messagesData, error: messagesError, count } = await supabase
        .from('ai_chat_messages')
        .select('*', { count: 'exact' })
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true })
        .range(0, 49)

      if (messagesError) {
        console.error('Messages query error:', messagesError)
        setMessages([])
        setHasMore(false)
        setOffset(0)
        setIsLoading(false)
        return
      }

      const formattedMessages: ChatMessage[] = (messagesData || []).map((msg: any) => ({
        id: msg.id,
        role: msg.role as 'user' | 'assistant' | 'system',
        content: msg.content,
        timestamp: new Date(msg.created_at),
        status: 'sent' as const,
        sessionId: msg.session_id,
      }))

      setMessages(formattedMessages)
      setHasMore((count || 0) > 50)
      setOffset(50)
    } catch (err) {
      console.error('Failed to load session:', err)
      setError(err instanceof Error ? err.message : 'Failed to load session')
    } finally {
      setIsLoading(false)
    }
  }, [supabase])

  // Create a new session
  const createNewSession = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError('Not authenticated')
        return
      }

      // Deactivate current active sessions
      await supabase
        .from('ai_chat_sessions')
        .update({ is_active: false })
        .eq('user_id', user.id)
        .eq('is_active', true)

      // Create new session
      const { data: newSession, error: createError } = await supabase
        .from('ai_chat_sessions')
        .insert({
          user_id: user.id,
          title: 'New Chat',
          is_active: true,
        })
        .select()
        .single()

      if (createError) throw createError

      setCurrentSession({
        id: newSession.id,
        title: newSession.title,
        createdAt: new Date(newSession.created_at),
        updatedAt: new Date(newSession.updated_at),
        isActive: newSession.is_active,
      })

      // Clear messages
      setMessages([])
      setHasMore(false)
      setOffset(0)
    } catch (err) {
      console.error('Failed to create new session:', err)
      setError(err instanceof Error ? err.message : 'Failed to create new session')
    } finally {
      setIsLoading(false)
    }
  }, [supabase])

  const value: ChatContextType = {
    isOpen,
    messages,
    isLoading,
    error,
    currentSession,
    unreadCount,
    openChat,
    closeChat,
    sendMessage,
    clearHistory,
    loadMoreMessages,
    hasMore,
    retryMessage,
    loadSession,
    createNewSession,
  }

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
}
