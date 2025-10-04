/**
 * Voice Transcript Card Component
 */

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle, Edit2, RefreshCw, Languages } from 'lucide-react';
import { Transcription, SUPPORTED_LANGUAGES } from '@/lib/ai/voice/types';
import { useState } from 'react';

interface VoiceTranscriptCardProps {
  transcription: Transcription;
  onConfirm: (text: string) => void;
  onRetry: () => void;
  isProcessing?: boolean;
}

export function VoiceTranscriptCard({
  transcription,
  onConfirm,
  onRetry,
  isProcessing = false,
}: VoiceTranscriptCardProps) {

  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(transcription.text);

  const languageInfo = SUPPORTED_LANGUAGES[transcription.detectedLanguage];
  const confidenceColor = transcription.confidence > 0.8
    ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-950 dark:text-green-400 dark:border-green-900'
    : 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-400 dark:border-yellow-900';

  const handleConfirm = () => {
    onConfirm(editedText);
  };

  return (
    <Card className="border-amber-200 dark:border-amber-900 w-full overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <CardTitle className="flex items-center gap-2 text-base">
              <Languages className="h-4 w-4 shrink-0" />
              <span className="truncate">Voice Transcription</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Review and edit if needed
            </CardDescription>
          </div>
          <div className="flex gap-1 shrink-0 flex-wrap justify-end">
            <Badge variant="outline" className="text-xs">
              {languageInfo.nativeName}
            </Badge>
            <Badge variant="outline" className={`text-xs ${confidenceColor}`}>
              {Math.round(transcription.confidence * 100)}%
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 pb-3">
        {/* Transcribed Text */}
        <div>
          <label className="text-xs font-medium mb-1.5 block">
            Transcribed Text
          </label>
          {isEditing ? (
            <Textarea
              value={editedText}
              onChange={(e) => setEditedText(e.target.value)}
              rows={3}
              className="resize-none text-sm"
            />
          ) : (
            <div className="bg-gray-50 dark:bg-gray-900 p-2.5 rounded-md border min-h-[60px]">
              <p className="text-xs whitespace-pre-wrap break-words">{editedText}</p>
            </div>
          )}
        </div>

        {/* Translation Notice */}
        {transcription.needsTranslation && (
          <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-900 rounded-md p-2 text-xs text-blue-900 dark:text-blue-300">
            <p>
              <strong>Note:</strong> Processed in your chosen language.
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 flex-wrap">
          {isEditing ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsEditing(false);
                  setEditedText(transcription.text);
                }}
                className="flex-1 min-w-[80px]"
              >
                Cancel
              </Button>
              <Button
                onClick={() => setIsEditing(false)}
                className="flex-1 min-w-[100px] bg-amber-600 hover:bg-amber-700"
                size="sm"
              >
                Save
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={onRetry}
                disabled={isProcessing}
                size="sm"
                className="flex-1 min-w-[90px]"
              >
                <RefreshCw className="mr-1 h-3 w-3" />
                Retry
              </Button>

              <Button
                variant="outline"
                onClick={() => setIsEditing(true)}
                disabled={isProcessing}
                size="sm"
                className="flex-1 min-w-[70px]"
              >
                <Edit2 className="mr-1 h-3 w-3" />
                Edit
              </Button>

              <Button
                onClick={handleConfirm}
                disabled={isProcessing || !editedText.trim()}
                className="flex-1 min-w-[90px] bg-amber-600 hover:bg-amber-700"
                size="sm"
              >
                <CheckCircle className="mr-1 h-3 w-3" />
                Use
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
