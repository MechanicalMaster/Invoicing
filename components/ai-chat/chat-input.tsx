'use client'

import { useState, KeyboardEvent } from 'react'
import TextareaAutosize from 'react-textarea-autosize'
import { Send, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useChatContext } from '@/lib/contexts/chat-context'
import { useVoiceInput } from '@/hooks/useVoiceInput'
import { VoiceInputButton } from './voice-input-button'
import { VoiceRecordingModal } from './voice-recording-modal'
import { VoiceTranscriptCard } from './voice-transcript-card'
import { cn } from '@/lib/utils'

const MAX_LENGTH = 2000

export function ChatInput() {
  const { sendMessage, isLoading, currentSession } = useChatContext()
  const [input, setInput] = useState('')

  // Voice input
  const voiceInput = useVoiceInput(currentSession?.id || '')

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const message = input.trim()
    setInput('')
    await sendMessage(message)
  }

  // Handle voice input
  const handleVoiceClick = () => {
    if (voiceInput.isRecording) {
      voiceInput.stopAndTranscribe()
    } else {
      voiceInput.startVoiceInput()
    }
  }

  // Handle transcript confirmation
  const handleTranscriptConfirm = async (text: string) => {
    voiceInput.resetTranscription()
    setInput(text)
    await sendMessage(text)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const isNearLimit = input.length > MAX_LENGTH * 0.9
  const isOverLimit = input.length > MAX_LENGTH

  return (
    <>
      {/* Voice Recording Modal */}
      <VoiceRecordingModal
        isOpen={voiceInput.showRecordingModal}
        onClose={voiceInput.cancelRecording}
        duration={voiceInput.recordingDuration}
        waveformData={voiceInput.waveformData}
        onStop={voiceInput.stopAndTranscribe}
        onCancel={voiceInput.cancelRecording}
      />

      <div className="border-t border-[#D1D5DB] bg-white p-4 dark:border-[#4E4F60] dark:bg-[#212121]">
        <div className="mx-auto max-w-3xl">
          <div className="flex flex-col gap-2">
            {/* Voice Transcript Card */}
            {voiceInput.transcription && (
              <VoiceTranscriptCard
                transcription={voiceInput.transcription}
                onConfirm={handleTranscriptConfirm}
                onRetry={() => {
                  voiceInput.resetTranscription()
                  voiceInput.startVoiceInput()
                }}
                isProcessing={isLoading}
              />
            )}

            {/* Main input container - pill shaped */}
            <div
              className={cn(
                'flex items-end gap-3 rounded-[28px] border bg-white px-4 py-2.5 shadow-sm transition-all',
                'border-[#D1D5DB] focus-within:border-[#EA7317] focus-within:shadow-md',
                'dark:border-[#4E4F60] dark:bg-[#2A2B32]',
                isOverLimit && 'border-red-500 focus-within:border-red-500'
              )}
            >
              {/* Attachment button */}
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 shrink-0 p-0 text-[#6E6E80] hover:bg-transparent hover:text-[#353740]"
                aria-label="Add attachment"
              >
                <Plus className="h-5 w-5" />
              </Button>

              {/* Text input */}
              <TextareaAutosize
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Message AI Assistant..."
                className={cn(
                  'flex-1 resize-none border-0 bg-transparent text-[15px] text-[#353740] placeholder:text-[#9CA3AF]',
                  'focus:outline-none focus:ring-0',
                  'disabled:cursor-not-allowed disabled:opacity-50',
                  'dark:text-[#ECECF1] dark:placeholder:text-[#6E6E80]'
                )}
                maxRows={6}
                minRows={1}
                disabled={isLoading}
              />

              {/* Voice button (when no text) */}
              {!input.trim() && (
                <VoiceInputButton
                  status={voiceInput.isRecording ? 'recording' : voiceInput.isTranscribing ? 'processing' : 'idle'}
                  onClick={handleVoiceClick}
                  disabled={isLoading}
                />
              )}

              {/* Send button (when text is entered) */}
              {input.trim() && (
                <Button
                  size="sm"
                  onClick={handleSend}
                  disabled={isLoading || isOverLimit}
                  className={cn(
                    'h-8 w-8 shrink-0 rounded-full p-0 transition-all',
                    'bg-[#EA7317] hover:bg-[#D97706] active:scale-95',
                    'disabled:opacity-50'
                  )}
                  aria-label="Send message"
                >
                  <Send className="h-4 w-4 text-white" />
                </Button>
              )}
            </div>

            {/* Helper text and character count */}
            <div className="flex items-center justify-between px-3 text-xs text-[#6E6E80]">
              <span className="hidden md:block">
                Press <kbd className="rounded bg-[#F7F7F8] px-1.5 py-0.5 dark:bg-[#2A2B32]">Enter</kbd> to send
              </span>

              {isNearLimit && (
                <span
                  className={cn(
                    'ml-auto',
                    isOverLimit ? 'font-semibold text-red-500' : 'text-[#6E6E80]'
                  )}
                >
                  {input.length}/{MAX_LENGTH}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
