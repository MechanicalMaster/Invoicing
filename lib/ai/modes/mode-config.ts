/**
 * Configuration for each chat mode
 */

import { ChatMode, ChatModeConfig } from './types';

export type { ChatMode };

export const MODE_CONFIGS: Record<ChatMode, ChatModeConfig> = {
  sales: {
    mode: 'sales',
    displayName: 'Product Guide',
    icon: '💼',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950 dark:text-blue-400 dark:border-blue-900',
    placeholder: 'Ask about features, pricing, or how Sethiya Gold works...',
    welcomeMessage: 'Hi! I can help you learn about Sethiya Gold jewelry management system. What would you like to know?',
    capabilities: [
      'product_questions',
      'feature_explanations',
      'pricing_info',
      'lead_capture',
      'demo_walkthrough',
    ],
    systemPrompt: '', // Loaded from prompts/sales-prompt.ts
    allowedActions: [], // No actions in sales mode
    showVoiceInput: false,
    showImageUpload: false,
    analyticsCategory: 'sales_chat',
  },

  assistant: {
    mode: 'assistant',
    displayName: 'AI Assistant',
    icon: '⚡',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-900',
    placeholder: 'Create invoice, add customer, manage inventory, or ask anything...',
    welcomeMessage: 'Hi {{userName}}! Ready to create an invoice, manage inventory, or need help with something?',
    capabilities: [
      'product_questions',
      'feature_explanations',
      'action_execution',
      'data_access',
      'voice_input',
      'personalization',
    ],
    systemPrompt: '', // Loaded from prompts/assistant-prompt.ts
    allowedActions: [
      'create_invoice',
      'add_customer',
      'add_stock',
      'update_invoice',
      'search_customer',
      'search_inventory',
    ],
    showVoiceInput: true,
    showImageUpload: true,
    analyticsCategory: 'assistant_chat',
  },

  help: {
    mode: 'help',
    displayName: 'Help Center',
    icon: '📚',
    badgeColor: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-950 dark:text-green-400 dark:border-green-900',
    placeholder: 'Ask me how to use any feature...',
    welcomeMessage: 'Hi! I can help you learn how to use Sethiya Gold. What do you need help with?',
    capabilities: [
      'product_questions',
      'feature_explanations',
      'demo_walkthrough',
    ],
    systemPrompt: '', // Loaded from prompts/help-prompt.ts
    allowedActions: [], // No actions in help mode
    showVoiceInput: false,
    showImageUpload: false,
    analyticsCategory: 'help_chat',
  },
};

export function getModeConfig(mode: ChatMode): ChatModeConfig {
  return MODE_CONFIGS[mode];
}

export function getModeForUser(
  isAuthenticated: boolean,
  currentPath: string
): ChatMode {
  // Documentation pages always use help mode
  if (currentPath.startsWith('/resources/documentation')) {
    return 'help';
  }

  // Authenticated users in app pages get assistant mode
  if (
    isAuthenticated &&
    (currentPath.startsWith('/dashboard') ||
      currentPath.startsWith('/invoices') ||
      currentPath.startsWith('/customers') ||
      currentPath.startsWith('/stock') ||
      currentPath.startsWith('/bookings') ||
      currentPath.startsWith('/purchases') ||
      currentPath.startsWith('/reports') ||
      currentPath.startsWith('/settings') ||
      currentPath.startsWith('/profile') ||
      currentPath.startsWith('/create-invoice'))
  ) {
    return 'assistant';
  }

  // Authenticated users on marketing pages get assistant mode
  if (isAuthenticated && currentPath === '/') {
    return 'assistant';
  }

  // Unauthenticated users get sales mode
  return 'sales';
}
