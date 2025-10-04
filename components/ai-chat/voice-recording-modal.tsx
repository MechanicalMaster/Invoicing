/**
 * Voice Recording Modal Component
 */

'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mic, Square, X } from 'lucide-react';

interface VoiceRecordingModalProps {
  isOpen: boolean;
  onClose: () => void;
  duration: number;
  waveformData: number[];
  onStop: () => void;
  onCancel: () => void;
}

export function VoiceRecordingModal({
  isOpen,
  onClose,
  duration,
  waveformData,
  onStop,
  onCancel,
}: VoiceRecordingModalProps) {

  // Format duration as MM:SS
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mic className="h-5 w-5 text-red-600" />
            Recording Audio
          </DialogTitle>
          <DialogDescription>
            Speak clearly in your preferred language (Hindi, English, Marathi, or Hinglish)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Duration Display */}
          <div className="text-center">
            <div className="text-4xl font-bold text-red-600 font-mono">
              {formatDuration(duration)}
            </div>
            <Badge variant="secondary" className="mt-2">
              Recording...
            </Badge>
          </div>

          {/* Waveform Visualization */}
          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 h-24 flex items-center justify-center gap-1">
            {waveformData.length > 0 ? (
              waveformData.map((amplitude, index) => (
                <div
                  key={index}
                  className="w-1 bg-red-500 rounded-full transition-all duration-100"
                  style={{
                    height: `${Math.max(4, amplitude * 60)}px`,
                  }}
                />
              ))
            ) : (
              <div className="flex gap-1">
                {[...Array(20)].map((_, i) => (
                  <div
                    key={i}
                    className="w-1 bg-gray-300 dark:bg-gray-600 rounded-full h-8"
                  />
                ))}
              </div>
            )}
          </div>

          {/* Tips */}
          <div className="text-sm text-muted-foreground space-y-1">
            <p>💡 Tips for best results:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Speak clearly and at a normal pace</li>
              <li>Minimize background noise</li>
              <li>Keep recording under 60 seconds</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={onCancel}
              className="flex-1"
            >
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button
              onClick={onStop}
              className="flex-1 bg-red-600 hover:bg-red-700"
            >
              <Square className="mr-2 h-4 w-4" />
              Stop & Transcribe
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
