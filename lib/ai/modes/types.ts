/**
 * Types and interfaces for AI chat modes
 */

export type ChatMode = 'sales' | 'assistant' | 'help';

export interface ChatModeConfig {
  mode: ChatMode;
  displayName: string;
  icon: string;
  badgeColor: string;
  placeholder: string;
  welcomeMessage: string;
  capabilities: ChatCapability[];
  systemPrompt: string;
  allowedActions: string[];
  showVoiceInput: boolean;
  showImageUpload: boolean;
  analyticsCategory: string;
}

export type ChatCapability =
  | 'product_questions'
  | 'feature_explanations'
  | 'pricing_info'
  | 'lead_capture'
  | 'demo_walkthrough'
  | 'action_execution'
  | 'data_access'
  | 'voice_input'
  | 'personalization';

export interface ModeTransitionEvent {
  fromMode: ChatMode;
  toMode: ChatMode;
  userId?: string;
  timestamp: Date;
  preserveHistory: boolean;
  triggerReason: 'login' | 'logout' | 'page_change';
}

export interface ChatModeState {
  currentMode: ChatMode;
  isTransitioning: boolean;
  previousMode?: ChatMode;
  canExecuteActions: boolean;
  canAccessUserData: boolean;
  features: {
    voiceInput: boolean;
    imageUpload: boolean;
    actionExecution: boolean;
    dataRetrieval: boolean;
  };
}
