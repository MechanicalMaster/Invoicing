/**
 * Chat Mode Context Provider
 * Manages mode state and transitions
 */

'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ChatMode, ChatModeState, ModeTransitionEvent } from '../modes/types';
import { useChatMode } from '../modes/mode-detector';
import { getModeConfig } from '../modes/mode-config';
import { useAuth } from '@/components/auth-provider';

interface ChatModeContextType extends ChatModeState {
  modeConfig: ReturnType<typeof getModeConfig>;
  transitionToMode: (newMode: ChatMode, reason: ModeTransitionEvent['triggerReason']) => void;
  isGuestMode: boolean;
  canUseFeature: (feature: keyof ChatModeState['features']) => boolean;
}

const ChatModeContext = createContext<ChatModeContextType | null>(null);

export function ChatModeProvider({ children }: { children: ReactNode }) {
  const detectedMode = useChatMode();
  const { user } = useAuth();
  const [currentMode, setCurrentMode] = useState<ChatMode>(detectedMode);
  const [previousMode, setPreviousMode] = useState<ChatMode | undefined>();
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Update mode when detection changes
  useEffect(() => {
    if (detectedMode !== currentMode) {
      handleModeTransition(detectedMode, 'page_change');
    }
  }, [detectedMode]);

  // Handle user login/logout
  useEffect(() => {
    if (user && currentMode === 'sales') {
      // User just logged in
      handleModeTransition('assistant', 'login');
    } else if (!user && currentMode === 'assistant') {
      // User just logged out
      handleModeTransition('sales', 'logout');
    }
  }, [user]);

  const handleModeTransition = async (
    newMode: ChatMode,
    reason: ModeTransitionEvent['triggerReason']
  ) => {
    setIsTransitioning(true);
    setPreviousMode(currentMode);

    // Animate transition (brief delay)
    await new Promise((resolve) => setTimeout(resolve, 300));

    setCurrentMode(newMode);

    // Log transition event
    logModeTransition({
      fromMode: currentMode,
      toMode: newMode,
      userId: user?.id,
      timestamp: new Date(),
      preserveHistory: reason === 'login',
      triggerReason: reason,
    });

    setIsTransitioning(false);
  };

  const modeConfig = getModeConfig(currentMode);

  const state: ChatModeContextType = {
    currentMode,
    previousMode,
    isTransitioning,
    canExecuteActions: currentMode === 'assistant',
    canAccessUserData: currentMode === 'assistant',
    features: {
      voiceInput: modeConfig.showVoiceInput,
      imageUpload: modeConfig.showImageUpload,
      actionExecution: currentMode === 'assistant',
      dataRetrieval: currentMode === 'assistant',
    },
    modeConfig,
    transitionToMode: handleModeTransition,
    isGuestMode: currentMode === 'sales',
    canUseFeature: (feature) => state.features[feature],
  };

  return (
    <ChatModeContext.Provider value={state}>{children}</ChatModeContext.Provider>
  );
}

export function useChatModeContext() {
  const context = useContext(ChatModeContext);
  if (!context) {
    throw new Error('useChatModeContext must be used within ChatModeProvider');
  }
  return context;
}

async function logModeTransition(event: ModeTransitionEvent) {
  // Log to analytics
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'chat_mode_transition', {
      from_mode: event.fromMode,
      to_mode: event.toMode,
      trigger: event.triggerReason,
    });
  }

  // Log to console for debugging
  console.log('Mode transition:', event);
}
