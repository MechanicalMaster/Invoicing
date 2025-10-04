/**
 * Voice Input Button Component
 */

'use client';

import { Mic, Square, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RecordingStatus } from '@/lib/ai/voice/types';
import { cn } from '@/lib/utils';

interface VoiceInputButtonProps {
  status: RecordingStatus;
  onClick: () => void;
  disabled?: boolean;
}

export function VoiceInputButton({
  status,
  onClick,
  disabled = false
}: VoiceInputButtonProps) {

  const isRecording = status === 'recording';
  const isProcessing = status === 'processing';

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={onClick}
      disabled={disabled || isProcessing}
      className={cn(
        "relative h-8 w-8 shrink-0 p-0 text-[#6E6E80] transition-all duration-300 hover:bg-transparent hover:text-[#353740]",
        isRecording && "bg-red-100 hover:bg-red-200 text-red-600 dark:bg-red-950 dark:hover:bg-red-900"
      )}
      aria-label={isRecording ? "Stop recording" : "Start voice input"}
    >
      {isProcessing ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : isRecording ? (
        <>
          <Square className="h-5 w-5 fill-current" />
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
        </>
      ) : (
        <Mic className="h-5 w-5" />
      )}
    </Button>
  );
}
