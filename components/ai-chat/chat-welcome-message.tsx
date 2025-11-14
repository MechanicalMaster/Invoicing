/**
 * Chat Welcome Message Component
 * Mode-specific welcome message with suggestions
 */

'use client';

import { useEffect, useState } from 'react';
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
    <div className="mx-auto max-w-3xl px-6 py-12">
      <div className="text-center space-y-6">
        <div className="flex justify-center">
          <div className="text-6xl">{modeConfig.icon}</div>
        </div>

        <div className="space-y-3">
          <h1 className="text-2xl font-semibold text-[#353740] dark:text-[#ECECF1]">
            How can I help you today?
          </h1>
          <p className="text-sm text-[#6E6E80] dark:text-[#9CA3AF] max-w-md mx-auto">
            {welcomeMessage}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 mt-8">
          {currentMode === 'sales' && (
            <>
              <button className="rounded-xl border border-[#E5E7EB] bg-white p-4 text-left transition-all hover:bg-[#F7F7F8] dark:border-[#2A2B32] dark:bg-[#212121] dark:hover:bg-[#2A2B32]">
                <p className="text-sm text-[#353740] dark:text-[#ECECF1]">What features do you have?</p>
              </button>
              <button className="rounded-xl border border-[#E5E7EB] bg-white p-4 text-left transition-all hover:bg-[#F7F7F8] dark:border-[#2A2B32] dark:bg-[#212121] dark:hover:bg-[#2A2B32]">
                <p className="text-sm text-[#353740] dark:text-[#ECECF1]">How much does it cost?</p>
              </button>
              <button className="rounded-xl border border-[#E5E7EB] bg-white p-4 text-left transition-all hover:bg-[#F7F7F8] dark:border-[#2A2B32] dark:bg-[#212121] dark:hover:bg-[#2A2B32]">
                <p className="text-sm text-[#353740] dark:text-[#ECECF1]">Can you handle GST invoices?</p>
              </button>
            </>
          )}

          {currentMode === 'assistant' && (
            <>
              <button className="rounded-xl border border-[#E5E7EB] bg-white p-4 text-left transition-all hover:bg-[#F7F7F8] dark:border-[#2A2B32] dark:bg-[#212121] dark:hover:bg-[#2A2B32]">
                <p className="text-sm text-[#353740] dark:text-[#ECECF1]">Create invoice for a customer</p>
              </button>
              <button className="rounded-xl border border-[#E5E7EB] bg-white p-4 text-left transition-all hover:bg-[#F7F7F8] dark:border-[#2A2B32] dark:bg-[#212121] dark:hover:bg-[#2A2B32]">
                <p className="text-sm text-[#353740] dark:text-[#ECECF1]">Add new customer</p>
              </button>
              <button className="rounded-xl border border-[#E5E7EB] bg-white p-4 text-left transition-all hover:bg-[#F7F7F8] dark:border-[#2A2B32] dark:bg-[#212121] dark:hover:bg-[#2A2B32]">
                <p className="text-sm text-[#353740] dark:text-[#ECECF1]">Show recent invoices</p>
              </button>
            </>
          )}

          {currentMode === 'help' && (
            <>
              <button className="rounded-xl border border-[#E5E7EB] bg-white p-4 text-left transition-all hover:bg-[#F7F7F8] dark:border-[#2A2B32] dark:bg-[#212121] dark:hover:bg-[#2A2B32]">
                <p className="text-sm text-[#353740] dark:text-[#ECECF1]">How do I create an invoice?</p>
              </button>
              <button className="rounded-xl border border-[#E5E7EB] bg-white p-4 text-left transition-all hover:bg-[#F7F7F8] dark:border-[#2A2B32] dark:bg-[#212121] dark:hover:bg-[#2A2B32]">
                <p className="text-sm text-[#353740] dark:text-[#ECECF1]">How to add customers?</p>
              </button>
              <button className="rounded-xl border border-[#E5E7EB] bg-white p-4 text-left transition-all hover:bg-[#F7F7F8] dark:border-[#2A2B32] dark:bg-[#212121] dark:hover:bg-[#2A2B32]">
                <p className="text-sm text-[#353740] dark:text-[#ECECF1]">How does GST calculation work?</p>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
