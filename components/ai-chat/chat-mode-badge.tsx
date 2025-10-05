/**
 * Chat Mode Badge Component
 * Displays current mode with icon and color
 */

'use client';

import { Badge } from '@/components/ui/badge';
import { useChatModeContext } from '@/lib/ai/context/chat-mode-context';
import { cn } from '@/lib/utils';

export function ChatModeBadge() {
  const { modeConfig, isTransitioning } = useChatModeContext();

  return (
    <Badge
      variant="outline"
      className={cn(
        'text-xs font-medium transition-all duration-300',
        modeConfig.badgeColor,
        isTransitioning && 'opacity-50 scale-95'
      )}
    >
      <span className="mr-1">{modeConfig.icon}</span>
      {modeConfig.displayName}
    </Badge>
  );
}
