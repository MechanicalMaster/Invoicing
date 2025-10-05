/**
 * Chat Welcome Message Component
 * Mode-specific welcome message with suggestions
 */

'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useChatModeContext } from '@/lib/ai/context/chat-mode-context';
import { useAuth } from '@/components/auth-provider';

export function ChatWelcomeMessage() {
  const { modeConfig, currentMode } = useChatModeContext();
  const { user } = useAuth();
  const [welcomeMessage, setWelcomeMessage] = useState('');

  useEffect(() => {
    // Personalize welcome message
    let message = modeConfig.welcomeMessage;

    if (currentMode === 'assistant' && user) {
      const userName = user.email?.split('@')[0] || 'there';
      message = message.replace('{{userName}}', userName);
    }

    setWelcomeMessage(message);
  }, [modeConfig, currentMode, user]);

  return (
    <Card className="border-none shadow-none bg-muted/30">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="text-3xl">{modeConfig.icon}</div>
          <div className="flex-1">
            <p className="text-sm text-muted-foreground leading-relaxed">{welcomeMessage}</p>

            {currentMode === 'sales' && (
              <div className="mt-3 space-y-1 text-xs text-muted-foreground">
                <p>💡 Try asking:</p>
                <ul className="list-disc list-inside space-y-0.5 ml-2">
                  <li>&quot;What features do you have?&quot;</li>
                  <li>&quot;How much does it cost?&quot;</li>
                  <li>&quot;Can you handle GST invoices?&quot;</li>
                </ul>
              </div>
            )}

            {currentMode === 'assistant' && (
              <div className="mt-3 space-y-1 text-xs text-muted-foreground">
                <p>⚡ Quick actions:</p>
                <ul className="list-disc list-inside space-y-0.5 ml-2">
                  <li>&quot;Create invoice for [customer name]&quot;</li>
                  <li>&quot;Add new customer&quot;</li>
                  <li>&quot;Show recent invoices&quot;</li>
                </ul>
              </div>
            )}

            {currentMode === 'help' && (
              <div className="mt-3 space-y-1 text-xs text-muted-foreground">
                <p>📚 Popular topics:</p>
                <ul className="list-disc list-inside space-y-0.5 ml-2">
                  <li>&quot;How do I create an invoice?&quot;</li>
                  <li>&quot;How to add customers?&quot;</li>
                  <li>&quot;How does GST calculation work?&quot;</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
