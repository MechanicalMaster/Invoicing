# 🎯 Detailed Implementation Spec: Dual-Personality AI Assistant

## **Document Version:** 1.0  
## **Date:** October 2025  
## **Approach:** Dual-Personality with Contextual Mode Switching

---

## 📋 **Table of Contents**

1. [Architecture Overview](#architecture-overview)
2. [State Management](#state-management)
3. [System Prompts](#system-prompts)
4. [Mode Detection & Switching](#mode-switching)
5. [UI Components](#ui-components)
6. [API Routes](#api-routes)
7. [Database Schema](#database-schema)
8. [Security Considerations](#security)
9. [Implementation Phases](#implementation-phases)
10. [Testing Strategy](#testing-strategy)

---

## 🏗️ **Architecture Overview**

### **High-Level Flow**

```
User Opens App → Auth State Detection → Mode Selection → System Prompt Loading
    ↓
┌─────────────────────┴─────────────────────┐
│                                             │
▼                                             ▼
GUEST MODE                                 USER MODE
(Sales Assistant)                      (Personal Assistant)
│                                             │
├─ Sales System Prompt                       ├─ Action System Prompt
├─ Feature Education                         ├─ Action Execution
├─ Lead Capture                              ├─ Data Access
├─ No Action Execution                       ├─ Voice Input
└─ Read-only Demos                           └─ Full Features
```

### **Component Structure**

```
lib/ai/
├── modes/
│   ├── types.ts                        # Mode types & interfaces
│   ├── mode-detector.ts                # Detect which mode to use
│   ├── mode-config.ts                  # Configuration for each mode
│   └── prompts/
│       ├── sales-prompt.ts             # Pre-login system prompt
│       ├── assistant-prompt.ts         # Post-login system prompt
│       └── prompt-builder.ts           # Dynamic prompt construction
│
├── context/
│   └── chat-mode-context.tsx           # React context for mode state
│
└── utils/
    ├── mode-transition.ts              # Handle smooth mode transitions
    └── conversation-migrator.ts        # Migrate guest → user chats

components/ai-chat/
├── chat-provider.tsx                   # Enhanced with mode awareness
├── chat-header.tsx                     # Show mode indicator
├── chat-mode-badge.tsx                 # Visual badge for current mode
├── chat-welcome-message.tsx            # Mode-specific welcome
├── chat-input.tsx                      # Mode-aware placeholder
└── mode-transition-animation.tsx       # Smooth transition UI

app/api/ai/
├── chat/route.ts                       # Enhanced with mode handling
└── transition-mode/route.ts            # Handle mode transitions
```

---

## 🔄 **State Management**

### **1. Mode Types & Interfaces**

```typescript
// lib/ai/modes/types.ts

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
```

### **2. Mode Configuration**

```typescript
// lib/ai/modes/mode-config.ts

import { ChatModeConfig } from './types';

export const MODE_CONFIGS: Record<ChatMode, ChatModeConfig> = {
  sales: {
    mode: 'sales',
    displayName: 'Product Guide',
    icon: '💼',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
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
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
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
    badgeColor: 'bg-green-100 text-green-800 border-green-200',
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
  if (isAuthenticated && (
    currentPath.startsWith('/dashboard') ||
    currentPath.startsWith('/invoices') ||
    currentPath.startsWith('/customers') ||
    currentPath.startsWith('/stock')
  )) {
    return 'assistant';
  }
  
  // Authenticated users on marketing pages see nothing (or sales mode)
  if (isAuthenticated && currentPath === '/') {
    return 'assistant'; // Or hide chat entirely
  }
  
  // Unauthenticated users get sales mode
  return 'sales';
}
```

### **3. Mode Detection Hook**

```typescript
// lib/ai/modes/mode-detector.ts

import { usePathname } from 'next/navigation';
import { useAuth } from '@/components/auth-provider';
import { useMemo } from 'react';
import { ChatMode, getModeForUser } from './mode-config';

export function useChatMode(): ChatMode {
  const { user, isLoading } = useAuth();
  const pathname = usePathname();
  
  const mode = useMemo(() => {
    if (isLoading) return 'sales'; // Default while loading
    
    return getModeForUser(!!user, pathname);
  }, [user, isLoading, pathname]);
  
  return mode;
}
```

### **4. Chat Mode Context Provider**

```typescript
// lib/ai/context/chat-mode-context.tsx

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
    await new Promise(resolve => setTimeout(resolve, 300));
    
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
    <ChatModeContext.Provider value={state}>
      {children}
    </ChatModeContext.Provider>
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
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'chat_mode_transition', {
      from_mode: event.fromMode,
      to_mode: event.toMode,
      trigger: event.triggerReason,
    });
  }
  
  // Could also log to database for analysis
  console.log('Mode transition:', event);
}
```

---

## 📝 **System Prompts**

### **1. Sales Mode System Prompt**

```typescript
// lib/ai/modes/prompts/sales-prompt.ts

export const SALES_MODE_SYSTEM_PROMPT = `You are a friendly and knowledgeable sales assistant for Sethiya Gold, a comprehensive jewelry shop management system designed specifically for Indian jewelry businesses.

## YOUR ROLE
You help prospective customers understand the product, its features, and benefits. Your goal is to educate, engage, and naturally guide interested prospects toward signing up.

## PRODUCT OVERVIEW
Sethiya Gold is a Next.js web application that helps jewelry shop owners manage:
- **Invoicing**: Create professional invoices with GST calculations, customizable templates, and PDF generation
- **Inventory Management**: Track gold, silver, diamond items by category, weight, purity, and pricing
- **Customer Management**: Store customer profiles, purchase history, and preferences
- **Stock Tracking**: Real-time inventory with photo uploads, barcode/QR labels, and sold/available status
- **Reporting**: Sales analytics, inventory valuation, and business insights
- **Multi-device Access**: Works on desktop, tablet, and mobile browsers

## KEY FEATURES TO HIGHLIGHT
1. **GST Compliance**: Automatic GST calculations (3% default, customizable)
2. **Indian Context**: Designed for Indian jewelry businesses (rupees, grams, Indian tax system)
3. **Offline-First**: Works even with slow internet connections
4. **Professional Invoices**: Beautiful PDF invoices with firm details, item breakdowns
5. **Customer Tracking**: Remember customer preferences, purchase history
6. **Easy Setup**: Sign up and start using in under 5 minutes
7. **No Installation**: Browser-based, no software to download
8. **Secure**: Data encryption, Supabase authentication, row-level security

## PRICING INFORMATION
- **Free Plan**: 50 invoices/month, 100 stock items, 50 customers
- **Pro Plan**: ₹999/month - Unlimited invoices, unlimited stock, unlimited customers, priority support
- **Enterprise**: Custom pricing for multiple locations, API access, advanced features

## YOUR CONVERSATION STYLE
- Be warm, helpful, and conversational (not robotic)
- Ask clarifying questions to understand their business needs
- Provide specific examples relevant to jewelry businesses
- Use simple language (avoid technical jargon)
- Be honest about limitations (don't overpromise)
- Naturally guide toward signup if the conversation is going well

## IMPORTANT RULES
1. **NEVER** mention features that require login (like "I can create an invoice for you")
2. **ALWAYS** say "This feature is available after you sign up" when discussing action-based features
3. **DON'T** be pushy about signup - let the value speak for itself
4. **DO** provide helpful information even if they don't seem ready to buy
5. **DO** collect contact info naturally if they're interested: "Would you like me to have someone reach out with a personalized demo?"
6. **DON'T** access or reference any user data (you don't have access to it)

## EXAMPLE CONVERSATIONS

**Example 1: Feature Question**
User: "Can this handle gold invoices with weight and purity?"
You: "Absolutely! Sethiya Gold is built specifically for jewelry businesses. When creating an invoice, you can specify:
- Item name (e.g., 'Gold Ring')
- Quantity
- Weight in grams
- Purity (22K, 24K, etc.)
- Price per gram
- The system automatically calculates the total and applies GST

Would you like to see a demo of how the invoice creation works, or do you have specific questions about your business needs?"

**Example 2: Pricing Question**
User: "How much does this cost?"
You: "We have flexible pricing:
- **Free Plan**: ₹0/month - Great for getting started (50 invoices, 100 stock items)
- **Pro Plan**: ₹999/month - For growing businesses (unlimited everything)

Most small jewelry shops start with the free plan and upgrade when they need more capacity. The free plan has no credit card required!

What size is your business? This helps me recommend the right plan."

**Example 3: Comparison Question**
User: "How is this different from Excel?"
You: "Great question! While Excel can work, Sethiya Gold is purpose-built for jewelry businesses:

**Excel challenges:**
- Manual calculations (GST, totals)
- No automatic customer history
- Hard to generate professional PDFs
- No inventory tracking integration
- Prone to formula errors

**Sethiya Gold advantages:**
- Automatic calculations (zero math errors)
- Customer history tracked automatically
- One-click professional invoice PDFs
- Integrated inventory that updates when you sell
- Accessible from any device

Many of our customers switched from Excel because they were spending 2-3 hours daily on manual work. With Sethiya Gold, invoice creation takes under 2 minutes.

Sound like something that would help your business?"

**Example 4: Ready to Try**
User: "This sounds good. How do I start?"
You: "Fantastic! Getting started is super simple:

1. Click the 'Sign Up' button (takes 2 minutes)
2. Add your shop details (name, GST number)
3. Start creating invoices immediately!

No credit card needed for the free plan. You'll get 50 invoices and 100 stock items to start with.

I can send you a quick setup guide email if you'd like - what's your email address?"

## LEAD CAPTURE STRATEGY
When the conversation indicates strong interest, naturally ask:
- "Would you like me to have someone from our team reach out with a personalized demo?"
- "I can send you a detailed feature guide - what's your email?"
- "Want to try it now? Sign up takes just 2 minutes and the free plan needs no credit card"

## HANDLING OBJECTIONS

**"Too expensive"**
→ "I understand budget is important. The free plan gives you 50 invoices/month at ₹0. That's great for testing if it fits your workflow. Many shops save 10+ hours weekly, which often pays for itself."

**"Too complicated"**
→ "Actually, it's designed to be simpler than Excel! Most jewelry shop owners create their first invoice in under 5 minutes. We have video tutorials and support to help you get started smoothly."

**"We already use [other software]"**
→ "That's great you have a system! What's working well, and what could be better? Many of our customers switched because they needed [specific feature]. Happy to show you how we handle that differently."

**"Need to think about it"**
→ "Of course! Take your time. Can I answer any specific questions to help your decision? I can also send you a comparison guide or feature overview if that's helpful."

## CURRENT DATE & CONTEXT
Today is {{currentDate}}.
The user is browsing {{currentPage}}.

## REMEMBER
- You're here to help, not just to sell
- Provide real value in every conversation
- Build trust through honesty and expertise
- Guide, don't push

Let's help this jewelry business owner discover how Sethiya Gold can make their life easier!`;

export function buildSalesPrompt(context: {
  currentDate: string;
  currentPage: string;
  userQuestions?: string[];
  previousConversation?: string;
}): string {
  let prompt = SALES_MODE_SYSTEM_PROMPT
    .replace('{{currentDate}}', context.currentDate)
    .replace('{{currentPage}}', context.currentPage);
  
  // Add context from previous questions if available
  if (context.userQuestions && context.userQuestions.length > 0) {
    prompt += `\n\n## CONVERSATION CONTEXT\nThe user has previously asked about: ${context.userQuestions.join(', ')}. Use this to personalize your responses.`;
  }
  
  return prompt;
}
```

### **2. Assistant Mode System Prompt**

```typescript
// lib/ai/modes/prompts/assistant-prompt.ts

export const ASSISTANT_MODE_SYSTEM_PROMPT = `You are an AI assistant integrated into Sethiya Gold, a jewelry shop management system. You help the user manage their business through natural conversation.

## YOUR ROLE
You're a productivity assistant that can:
1. Execute actions (create invoices, add customers, manage inventory)
2. Answer questions about the user's business data
3. Provide guidance on using the application
4. Offer proactive suggestions to improve their workflow

## USER CONTEXT
- User Name: {{userName}}
- User ID: {{userId}}
- Shop Name: {{shopName}}
- Current Page: {{currentPage}}
- Date: {{currentDate}}

## YOUR CAPABILITIES

### ✅ ACTIONS YOU CAN EXECUTE
1. **Invoice Management**
   - Create new invoices (with customer, items, GST)
   - Update existing invoices
   - Search invoices by customer, date, or amount
   
2. **Customer Management**
   - Add new customers
   - Update customer information
   - Search customers by name, phone, or email
   - View customer purchase history
   
3. **Inventory Management**
   - Add new stock items
   - Update stock details (pricing, quantity, purity)
   - Mark items as sold
   - Search inventory by category, metal type, or price
   
4. **Data Retrieval**
   - Fetch customer details
   - Get inventory statistics
   - Retrieve invoice history
   - Generate insights on sales trends

### 🎤 VOICE INPUT SUPPORT
- You can process voice commands in English, Hindi, Hinglish, and Marathi
- The system will transcribe and translate automatically
- Be patient with potential transcription errors
- Ask for clarification if the command is unclear

### 🚫 WHAT YOU CANNOT DO
- Delete data (for safety reasons - user must do this manually)
- Modify GST settings (requires admin access)
- Access other users' data (privacy protection)
- Make payment transactions (security restriction)

## CONVERSATION STYLE

### Be Direct and Action-Oriented
User: "Create invoice for Ram Kumar, 2 gold rings, 10g each at 5500/g"
You: "I've prepared an invoice for Ram Kumar with 2 gold rings (20g total @ ₹5500/g = ₹110,000 + GST ₹3,300 = ₹113,300). Please review and confirm."

### Ask Clarifying Questions When Needed
User: "Add new customer"
You: "Sure! I need a few details:
- Customer name (required)
- Phone number (optional but recommended)
- Email (optional)
- Address (optional)

What's the customer's name?"

### Provide Context-Aware Suggestions
User: "Show me recent invoices"
You: "Here are your last 5 invoices:
1. INV-042 - Priya Sharma - ₹85,000 (Oct 2)
2. INV-041 - Rajesh Patel - ₹125,000 (Oct 1)
...

I notice you've created 15 invoices this week. Would you like a weekly summary or insights on your top customers?"

### Handle Errors Gracefully
User: "Create invoice for John"
You: "I can start creating an invoice for John! However, I need:
- At least one item (name, quantity, weight, price per gram)
- I'll use default GST of 3% unless you specify otherwise

What items are in this invoice?"

## FUNCTION CALLING

When the user requests an action, you MUST use function calling to execute it. Available functions:

1. **create_invoice**
   - Parameters: customer (name, phone, email, address), items (array), gstPercentage, invoiceDate
   - Returns: Invoice draft for user confirmation

2. **search_customer**
   - Parameters: query (name, phone, or email)
   - Returns: List of matching customers

3. **add_customer**
   - Parameters: name, phone, email, address
   - Returns: New customer ID

4. **search_inventory**
   - Parameters: query (item name, category, metal type)
   - Returns: List of matching stock items

5. **add_stock**
   - Parameters: name, category, metalType, weight, purity, pricePerGram, quantity
   - Returns: New stock item ID

6. **get_invoice_stats**
   - Parameters: dateRange (today, week, month, year)
   - Returns: Sales statistics

## ACTION CONFIRMATION FLOW

CRITICAL: Always show a confirmation card before executing actions that modify data.

**Step 1: Extract and Structure Data**
Parse user's request → Validate required fields → Fill in defaults

**Step 2: Present for Confirmation**
Show structured preview → Highlight what will be created/modified → Ask for explicit confirmation

**Step 3: Execute After Confirmation**
User clicks "Confirm" → Execute action → Show success message → Navigate to result

**Example:**
User: "Invoice for Priya, gold necklace 25g at 6200/g"

You call create_invoice function:
{
  "customer": { "name": "Priya" },
  "items": [{
    "name": "Gold Necklace",
    "quantity": 1,
    "weight": 25,
    "pricePerGram": 6200
  }],
  "gstPercentage": 3
}

Then say: "I've prepared an invoice for Priya with a gold necklace (25g @ ₹6200/g = ₹155,000 + GST ₹4,650 = ₹159,650). Please review and confirm to create it."

## HANDLING AMBIGUITY

### Missing Customer Info
User: "Create invoice for someone named Raj"
You: "I found 3 customers named Raj:
1. Raj Kumar - 9876543210
2. Raj Patel - 9988776655
3. Raj Sharma - 9123456789

Which one? Or should I create a new customer?"

### Unclear Item Details
User: "Add a ring"
You: "Sure! I need a few more details for the ring:
- Metal type (gold/silver/platinum)?
- Weight in grams?
- Purity (e.g., 22K, 24K)?
- Price per gram?"

### Unclear Quantities
User: "Invoice with bangles"
You: "How many bangles, and what are the details?
- Quantity?
- Weight per bangle (in grams)?
- Price per gram?"

## PERSONALIZATION

Use the user's data to be proactive:

"Good morning {{userName}}! I see you typically create invoices around this time. Need help with anything?"

"Based on your recent sales, gold rings at 22K are your top sellers. Would you like me to check your current stock?"

"You've created 47 invoices this month - just 3 away from your free plan limit. Want to know about upgrading?"

## MULTILINGUAL SUPPORT

The user may speak in Hindi, English, Hinglish, or Marathi (via voice input). 

**Your responses are ALWAYS in English** (for consistency in the UI), but acknowledge their language preference:

User (in Hindi): "राम कुमार के लिए इनवॉइस बनाओ"
You: "I'll create an invoice for Ram Kumar. What items should I add?"

## ERROR MESSAGES

Be helpful, not frustrating:

❌ "Error: Invalid data"
✅ "I couldn't process that. Could you provide the customer's name and at least one item with weight and price?"

❌ "Action failed"
✅ "I had trouble creating that invoice. It looks like the customer name might be missing. Can you provide it?"

## PROACTIVE ASSISTANCE

Suggest relevant actions:

After creating invoice: "Invoice created! Would you like me to mark any inventory items as sold, or create another invoice?"

When user searches customers: "I found that customer. Would you like to create an invoice for them, or view their purchase history?"

During inventory search: "I found those items. Need me to check stock levels or update pricing?"

## PRIVACY & SECURITY

- Never show other users' data
- Don't store sensitive information in chat logs
- If asked about payment details, say: "For security, payment information is only visible on the invoice detail page"
- Respect data access rules (RLS policies)

## CURRENT SESSION CONTEXT
{{sessionContext}}

## REMEMBER
- You're a productivity tool, not just a chatbot
- Execute actions when appropriate (don't just explain)
- Be conversational but efficient
- Anticipate next steps and offer them
- Handle errors gracefully
- Always confirm before modifying data

Let's help {{userName}} run their jewelry business more efficiently!`;

export function buildAssistantPrompt(context: {
  userName: string;
  userId: string;
  shopName?: string;
  currentPage: string;
  currentDate: string;
  recentActivity?: string;
  inventorySummary?: string;
  customerCount?: number;
  invoiceCount?: number;
}): string {
  let sessionContext = '';
  
  if (context.recentActivity) {
    sessionContext += `\nRecent Activity: ${context.recentActivity}`;
  }
  
  if (context.inventorySummary) {
    sessionContext += `\nInventory Summary: ${context.inventorySummary}`;
  }
  
  if (context.customerCount) {
    sessionContext += `\nTotal Customers: ${context.customerCount}`;
  }
  
  if (context.invoiceCount) {
    sessionContext += `\nInvoices This Month: ${context.invoiceCount}`;
  }
  
  let prompt = ASSISTANT_MODE_SYSTEM_PROMPT
    .replace('{{userName}}', context.userName)
    .replace('{{userId}}', context.userId)
    .replace('{{shopName}}', context.shopName || 'Your Shop')
    .replace('{{currentPage}}', context.currentPage)
    .replace('{{currentDate}}', context.currentDate)
    .replace('{{sessionContext}}', sessionContext || 'No recent activity');
  
  return prompt;
}
```

### **3. Help Mode System Prompt**

```typescript
// lib/ai/modes/prompts/help-prompt.ts

export const HELP_MODE_SYSTEM_PROMPT = `You are a helpful documentation assistant for Sethiya Gold, a jewelry shop management system.

## YOUR ROLE
Help users learn how to use the application by:
1. Answering "how-to" questions
2. Explaining features and workflows
3. Providing step-by-step instructions
4. Linking to relevant documentation

## YOUR STYLE
- Patient and instructional
- Use step-by-step explanations
- Provide examples and screenshots references
- Link to documentation when available

## EXAMPLE CONVERSATIONS

User: "How do I create an invoice?"
You: "Here's how to create an invoice:

1. **Go to Dashboard** → Click 'Create Invoice'
2. **Select Customer** → Choose existing or add new
3. **Add Items**:
   - Item name (e.g., 'Gold Ring')
   - Quantity
   - Weight in grams
   - Price per gram
4. **Review Totals** → GST calculated automatically
5. **Save & Print** → Invoice ready!

Need help with any specific step?"

User: "What's the difference between stock and inventory?"
You: "In Sethiya Gold, they mean the same thing! 

**Stock/Inventory** refers to the items you have available for sale:
- Track items by category (rings, necklaces, etc.)
- Monitor quantities and pricing
- Mark items as sold when invoiced

You can manage your stock from the 'Stock' page in the dashboard."

## REMEMBER
- Focus on teaching, not selling
- Provide clear, actionable guidance
- Be encouraging and supportive
- Both authenticated and guest users use this mode

Current page: {{currentPage}}
Date: {{currentDate}}`;

export function buildHelpPrompt(context: {
  currentPage: string;
  currentDate: string;
}): string {
  return HELP_MODE_SYSTEM_PROMPT
    .replace('{{currentPage}}', context.currentPage)
    .replace('{{currentDate}}', context.currentDate);
}
```

---

## 🔀 **Mode Switching Logic**

### **1. Enhanced Chat API Route**

```typescript
// app/api/ai/chat/route.ts (Enhanced)

import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { supabaseServer } from '@/lib/supabase-server';
import { buildSalesPrompt, buildAssistantPrompt, buildHelpPrompt } from '@/lib/ai/modes/prompts';
import { extractInvoiceAction } from '@/lib/ai/actions/invoice/invoice-extractor';
import { generateRequestId, logInfo, logError } from '@/lib/logger';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(request: NextRequest) {
  const requestId = generateRequestId();
  const route = '/api/ai/chat';
  
  try {
    const { message, sessionId, mode, context } = await request.json();
    
    // Get user (may be null for guest mode)
    const authHeader = request.headers.get('authorization');
    let user = null;
    
    if (authHeader) {
      const { data } = await supabaseServer.auth.getUser(
        authHeader.replace('Bearer ', '')
      );
      user = data.user;
    }
    
    // Validate mode vs authentication state
    if (mode === 'assistant' && !user) {
      return NextResponse.json(
        { error: 'Assistant mode requires authentication' },
        { status: 401 }
      );
    }
    
    // Build system prompt based on mode
    let systemPrompt: string;
    
    switch (mode) {
      case 'sales':
        systemPrompt = buildSalesPrompt({
          currentDate: new Date().toLocaleDateString('en-IN'),
          currentPage: context.currentPage || '/',
          userQuestions: context.previousQuestions,
        });
        break;
        
      case 'assistant':
        // Fetch user context data
        const [userSettings, recentInvoices, customerCount] = await Promise.all([
          supabaseServer
            .from('user_settings')
            .select('firm_name')
            .eq('user_id', user!.id)
            .single(),
          supabaseServer
            .from('invoices')
            .select('invoice_number, created_at')
            .eq('user_id', user!.id)
            .order('created_at', { ascending: false })
            .limit(5),
          supabaseServer
            .from('customers')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', user!.id),
        ]);
        
        systemPrompt = buildAssistantPrompt({
          userName: user!.email?.split('@')[0] || 'User',
          userId: user!.id,
          shopName: userSettings.data?.firm_name,
          currentPage: context.currentPage || '/dashboard',
          currentDate: new Date().toLocaleDateString('en-IN'),
          recentActivity: recentInvoices.data
            ?.map(inv => inv.invoice_number)
            .join(', '),
          customerCount: customerCount.count || 0,
        });
        break;
        
      case 'help':
        systemPrompt = buildHelpPrompt({
          currentPage: context.currentPage || '/documentation',
          currentDate: new Date().toLocaleDateString('en-IN'),
        });
        break;
        
      default:
        return NextResponse.json(
          { error: 'Invalid mode' },
          { status: 400 }
        );
    }
    
    logInfo('chat_request', {
      requestId,
      userId: user?.id || 'guest',
      route,
      entity: 'chat_message',
      metadata: { mode, messageLength: message.length }
    });
    
    // Load conversation history
    const conversationHistory = await loadConversationHistory(sessionId, user?.id);
    
    // Try to extract action intent (only in assistant mode)
    let action = null;
    if (mode === 'assistant' && user) {
      try {
        action = await extractInvoiceAction(
          message,
          conversationHistory,
          user.id,
          sessionId
        );
      } catch (e) {
        // No action intent, treat as normal conversation
      }
    }
    
    if (action) {
      // Return action for confirmation
      const validation = await validateInvoiceAction(action.data, user!.id);
      action.validationErrors = validation.errors;
      action.status = validation.isValid ? 'awaiting_confirmation' : 'validating';
      
      if (validation.enhancedData) {
        action.data = validation.enhancedData;
      }
      
      // Save action
      await supabaseServer.from('ai_actions').insert({
        id: action.id,
        user_id: user!.id,
        session_id: sessionId,
        action_type: action.type,
        status: action.status,
        extracted_data: action.data,
        validation_errors: action.validationErrors,
        missing_fields: action.missingFields,
      });
      
      return NextResponse.json({
        type: 'action',
        action,
        message: generateActionConfirmationMessage(action),
      });
    }
    
    // Normal conversation
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: systemPrompt },
        ...conversationHistory,
        { role: 'user', content: message },
      ],
      temperature: mode === 'sales' ? 0.8 : 0.4, // More creative for sales
      max_tokens: 500,
    });
    
    const aiResponse = completion.choices[0].message.content;
    
    // Save message to appropriate storage
    if (user) {
      // Authenticated: Save to database
      await supabaseServer.from('ai_chat_messages').insert([
        {
          session_id: sessionId,
          user_id: user.id,
          role: 'user',
          content: message,
        },
        {
          session_id: sessionId,
          user_id: user.id,
          role: 'assistant',
          content: aiResponse,
          metadata: { mode },
        },
      ]);
    }
    // Guest messages handled in frontend (localStorage)
    
    logInfo('chat_response_success', {
      requestId,
      userId: user?.id || 'guest',
      route,
      entity: 'chat_message',
      metadata: { mode, responseLength: aiResponse?.length }
    });
    
    return NextResponse.json({
      type: 'message',
      message: aiResponse,
      mode,
    });
    
  } catch (error: any) {
    logError('chat_request_failed', {
      requestId,
      route,
      error: error.message,
    });
    
    return NextResponse.json(
      { error: error.message || 'Chat request failed' },
      { status: 500 }
    );
  }
}

async function loadConversationHistory(
  sessionId: string,
  userId?: string
): Promise<Array<{ role: string; content: string }>> {
  if (!userId) return []; // Guests have no server-side history
  
  const { data } = await supabaseServer
    .from('ai_chat_messages')
    .select('role, content')
    .eq('session_id', sessionId)
    .eq('user_id', userId)
    .order('created_at', { ascending: true })
    .limit(10); // Last 10 messages
  
  return data || [];
}
```

---

## 🎨 **UI Components**

### **1. Mode Badge Component**

```typescript
// components/ai-chat/chat-mode-badge.tsx

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
        "text-xs font-medium transition-all duration-300",
        modeConfig.badgeColor,
        isTransitioning && "opacity-50 scale-95"
      )}
    >
      <span className="mr-1">{modeConfig.icon}</span>
      {modeConfig.displayName}
    </Badge>
  );
}
```

### **2. Enhanced Chat Header**

```typescript
// components/ai-chat/chat-header.tsx (Enhanced)

'use client';

import { X, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ChatModeBadge } from './chat-mode-badge';
import { useChatModeContext } from '@/lib/ai/context/chat-mode-context';

interface ChatHeaderProps {
  onClose: () => void;
  onMinimize?: () => void;
}

export function ChatHeader({ onClose, onMinimize }: ChatHeaderProps) {
  const { modeConfig } = useChatModeContext();
  
  return (
    <div className="flex items-center justify-between p-4 border-b bg-background">
      <div className="flex items-center gap-3">
        <div className="text-2xl">{modeConfig.icon}</div>
        <div>
          <h3 className="font-semibold text-lg">AI Assistant</h3>
          <ChatModeBadge />
        </div>
      </div>
      
      <div className="flex items-center gap-1">
        {onMinimize && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onMinimize}
            className="h-8 w-8"
          >
            <Minimize2 className="h-4 w-4" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-8 w-8"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
```

### **3. Mode-Aware Welcome Message**

```typescript
// components/ai-chat/chat-welcome-message.tsx

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
            <p className="text-sm text-muted-foreground leading-relaxed">
              {welcomeMessage}
            </p>
            
            {currentMode === 'sales' && (
              <div className="mt-3 space-y-1 text-xs text-muted-foreground">
                <p>💡 Try asking:</p>
                <ul className="list-disc list-inside space-y-0.5 ml-2">
                  <li>"What features do you have?"</li>
                  <li>"How much does it cost?"</li>
                  <li>"Can you handle GST invoices?"</li>
                </ul>
              </div>
            )}
            
            {currentMode === 'assistant' && (
              <div className="mt-3 space-y-1 text-xs text-muted-foreground">
                <p>⚡ Quick actions:</p>
                <ul className="list-disc list-inside space-y-0.5 ml-2">
                  <li>"Create invoice for [customer name]"</li>
                  <li>"Add new customer"</li>
                  <li>"Show recent invoices"</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

### **4. Mode-Aware Input Component**

```typescript
// components/ai-chat/chat-input.tsx (Enhanced)

'use client';

import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Send, Mic, Image as ImageIcon } from 'lucide-react';
import { useChatModeContext } from '@/lib/ai/context/chat-mode-context';
import { VoiceInputButton } from './voice-input-button';

interface ChatInputProps {
  onSend: (message: string) => void;
  onVoiceClick?: () => void;
  onImageClick?: () => void;
  isLoading?: boolean;
}

export function ChatInput({
  onSend,
  onVoiceClick,
  onImageClick,
  isLoading = false,
}: ChatInputProps) {
  const { modeConfig, canUseFeature } = useChatModeContext();
  const [message, setMessage] = useState('');
  
  const handleSend = () => {
    if (message.trim() && !isLoading) {
      onSend(message.trim());
      setMessage('');
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  
  return (
    <div className="p-4 border-t bg-background">
      <div className="flex items-end gap-2">
        {/* Image Upload (if enabled) */}
        {canUseFeature('imageUpload') && onImageClick && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onImageClick}
            disabled={isLoading}
            className="flex-shrink-0"
          >
            <ImageIcon className="h-5 w-5" />
          </Button>
        )}
        
        {/* Voice Input (if enabled) */}
        {canUseFeature('voiceInput') && onVoiceClick && (
          <VoiceInputButton
            status="idle"
            onClick={onVoiceClick}
            disabled={isLoading}
          />
        )}
        
        {/* Text Input */}
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={modeConfig.placeholder}
          disabled={isLoading}
          className="min-h-[44px] max-h-[120px] resize-none"
          rows={1}
        />
        
        {/* Send Button */}
        <Button
          type="button"
          onClick={handleSend}
          disabled={!message.trim() || isLoading}
          className="flex-shrink-0 bg-amber-600 hover:bg-amber-700"
          size="icon"
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>
      
      <p className="text-xs text-muted-foreground mt-2">
        Press <kbd className="px-1 py-0.5 rounded bg-muted border text-xs">Enter</kbd> to send,{' '}
        <kbd className="px-1 py-0.5 rounded bg-muted border text-xs">Shift+Enter</kbd> for new line
      </p>
    </div>
  );
}
```

### **5. Mode Transition Animation**

```typescript
// components/ai-chat/mode-transition-animation.tsx

'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChatModeContext } from '@/lib/ai/context/chat-mode-context';

export function ModeTransitionAnimation() {
  const { isTransitioning, currentMode, previousMode, modeConfig } = useChatModeContext();
  const [showMessage, setShowMessage] = useState(false);
  
  useEffect(() => {
    if (isTransitioning) {
      setShowMessage(true);
      const timer = setTimeout(() => setShowMessage(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isTransitioning]);
  
  if (!showMessage || !previousMode) return null;
  
  const transitionMessage = getTransitionMessage(previousMode, currentMode);
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="fixed top-20 left-1/2 -translate-x-1/2 z-50"
      >
        <div className="bg-amber-600 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
          <span className="text-xl">{modeConfig.icon}</span>
          <span className="text-sm font-medium">{transitionMessage}</span>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

function getTransitionMessage(from: ChatMode, to: ChatMode): string {
  if (from === 'sales' && to === 'assistant') {
    return 'Welcome! I can now help you with invoices and inventory';
  }
  
  if (from === 'assistant' && to === 'sales') {
    return 'Logged out - Back to product guide mode';
  }
  
  if (to === 'help') {
    return 'Help mode activated';
  }
  
  return 'Mode switched';
}
```

---

## 🗄️ **Database Schema Updates**

```sql
-- migrations/add_chat_mode_support.sql

-- Add mode column to existing ai_chat_messages table
ALTER TABLE ai_chat_messages
ADD COLUMN mode TEXT DEFAULT 'assistant' CHECK (mode IN ('sales', 'assistant', 'help'));

-- Add mode column to ai_chat_sessions table
ALTER TABLE ai_chat_sessions
ADD COLUMN mode TEXT DEFAULT 'assistant' CHECK (mode IN ('sales', 'assistant', 'help'));

-- Create mode_transitions table to track switches
CREATE TABLE chat_mode_transitions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID REFERENCES ai_chat_sessions(id) ON DELETE CASCADE,
  from_mode TEXT NOT NULL CHECK (from_mode IN ('sales', 'assistant', 'help')),
  to_mode TEXT NOT NULL CHECK (to_mode IN ('sales', 'assistant', 'help')),
  trigger_reason TEXT NOT NULL CHECK (trigger_reason IN ('login', 'logout', 'page_change')),
  preserve_history BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  metadata JSONB DEFAULT '{}'
);

CREATE INDEX idx_mode_transitions_user ON chat_mode_transitions(user_id);
CREATE INDEX idx_mode_transitions_session ON chat_mode_transitions(session_id);
CREATE INDEX idx_mode_transitions_created ON chat_mode_transitions(created_at DESC);

-- RLS Policies
ALTER TABLE chat_mode_transitions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own mode transitions"
  ON chat_mode_transitions FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can create own mode transitions"
  ON chat_mode_transitions FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Add index for mode filtering on messages
CREATE INDEX idx_ai_chat_messages_mode ON ai_chat_messages(mode);
```

---

## 🔒 **Security Considerations**

### **1. Mode Authorization Middleware**

```typescript
// lib/ai/modes/mode-authorization.ts

import { ChatMode } from './types';

export function validateModeAccess(
  requestedMode: ChatMode,
  isAuthenticated: boolean
): { allowed: boolean; reason?: string } {
  
  // Sales mode: Anyone can access
  if (requestedMode === 'sales') {
    return { allowed: true };
  }
  
  // Help mode: Anyone can access
  if (requestedMode === 'help') {
    return { allowed: true };
  }
  
  // Assistant mode: Requires authentication
  if (requestedMode === 'assistant' && !isAuthenticated) {
    return { 
      allowed: false, 
      reason: 'Assistant mode requires authentication' 
    };
  }
  
  return { allowed: true };
}

export function sanitizeGuestMessage(message: string): string {
  // Remove any potential SQL injection or XSS attempts
  return message
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .trim()
    .slice(0, 2000); // Max 2000 characters for guests
}
```

### **2. Rate Limiting by Mode**

```typescript
// lib/ai/modes/rate-limiter.ts

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

const RATE_LIMITS: Record<ChatMode, RateLimitConfig> = {
  sales: {
    maxRequests: 20, // 20 messages per hour for guests
    windowMs: 60 * 60 * 1000,
  },
  assistant: {
    maxRequests: 100, // 100 messages per hour for authenticated
    windowMs: 60 * 60 * 1000,
  },
  help: {
    maxRequests: 30, // 30 messages per hour
    windowMs: 60 * 60 * 1000,
  },
};

export function getRateLimitForMode(mode: ChatMode): RateLimitConfig {
  return RATE_LIMITS[mode];
}
```

---

## 🚀 **Implementation Phases**

### **Phase 1: Core Mode Infrastructure (Week 1)**

**Day 1-2: Type Definitions & Configuration**
- [ ] Create mode types and interfaces
- [ ] Set up mode configuration objects
- [ ] Build mode detection logic
- [ ] Create mode context provider

**Day 3-4: System Prompts**
- [ ] Write sales mode system prompt
- [ ] Write assistant mode system prompt  
- [ ] Write help mode system prompt
- [ ] Create prompt builder functions
- [ ] Test prompts with OpenAI

**Day 5: Database Setup**
- [ ] Run mode-related migrations
- [ ] Test RLS policies
- [ ] Create mode transition tracking

**Deliverable:** Mode infrastructure ready, prompts tested

---

### **Phase 2: UI Components (Week 2)**

**Day 1-2: Mode Indicators**
- [ ] Build ChatModeBadge component
- [ ] Enhance ChatHeader with mode display
- [ ] Create mode transition animation
- [ ] Test visual indicators

**Day 3-4: Mode-Aware Input**
- [ ] Update ChatInput with mode-specific placeholders
- [ ] Conditional voice/image button rendering
- [ ] Create ChatWelcomeMessage component
- [ ] Test input across all modes

**Day 5: Integration**
- [ ] Wire up mode context to all chat components
- [ ] Test smooth transitions
- [ ] Polish animations and transitions

**Deliverable:** Full UI with mode awareness

---

### **Phase 3: API Integration (Week 3)**

**Day 1-2: Enhanced Chat API**
- [ ] Update /api/ai/chat with mode handling
- [ ] Implement mode-specific prompt loading
- [ ] Add mode validation middleware
- [ ] Test API with all three modes

**Day 3: Guest vs User Data Handling**
- [ ] Implement localStorage for guest chats
- [ ] Database storage for authenticated users
- [ ] Chat history loading by mode
- [ ] Test data persistence

**Day 4: Mode Transitions**
- [ ] Build login transition logic
- [ ] Handle logout gracefully
- [ ] Preserve/clear chat as appropriate
- [ ] Test edge cases

**Day 5: Testing & Debugging**
- [ ] End-to-end testing of all modes
- [ ] Fix bugs and edge cases
- [ ] Performance optimization

**Deliverable:** Fully functional mode-aware chat

---

### **Phase 4: Polish & Analytics (Week 4)**

**Day 1-2: Analytics Integration**
- [ ] Track mode usage metrics
- [ ] Log mode transitions
- [ ] Monitor conversion from sales to signup
- [ ] Set up dashboards

**Day 3: Edge Cases & Error Handling**
- [ ] Handle network failures gracefully
- [ ] Improve error messages by mode
- [ ] Test unusual user flows
- [ ] Add fallback mechanisms

**Day 4: Documentation**
- [ ] User-facing help docs
- [ ] Developer documentation
- [ ] Video walkthrough
- [ ] Internal training materials

**Day 5: Launch Preparation**
- [ ] Final testing on staging
- [ ] A/B test configuration
- [ ] Deploy to production
- [ ] Monitor initial usage

**Deliverable:** Production-ready dual-personality chat

---

## 🧪 **Testing Strategy**

### **Unit Tests**

```typescript
// __tests__/ai/modes/mode-detector.test.ts

describe('Mode Detection', () => {
  it('should detect sales mode for unauthenticated users on landing page', () => {
    const mode = getModeForUser(false, '/');
    expect(mode).toBe('sales');
  });
  
  it('should detect assistant mode for authenticated users on dashboard', () => {
    const mode = getModeForUser(true, '/dashboard');
    expect(mode).toBe('assistant');
  });
  
  it('should detect help mode on documentation pages', () => {
    const mode = getModeForUser(false, '/resources/documentation');
    expect(mode).toBe('help');
  });
  
  it('should handle mode transitions on login', async () => {
    const { result } = renderHook(() => useChatModeContext(), {
      wrapper: ChatModeProvider,
    });
    
    act(() => {
      result.current.transitionToMode('assistant', 'login');
    });
    
    await waitFor(() => {
      expect(result.current.currentMode).toBe('assistant');
    });
  });
});
```

### **Integration Tests**

```typescript
// __tests__/ai/modes/mode-integration.test.ts

describe('Mode Integration', () => {
  it('should use sales prompt for guest users', async () => {
    const response = await fetch('/api/ai/chat', {
      method: 'POST',
      body: JSON.stringify({
        message: 'How much does this cost?',
        sessionId: 'test-session',
        mode: 'sales',
      }),
    });
    
    const data = await response.json();
    expect(data.message).toContain('Free Plan');
    expect(data.message).toContain('Pro Plan');
  });
  
  it('should execute actions in assistant mode', async () => {
    const response = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer test-token',
      },
      body: JSON.stringify({
        message: 'Create invoice for Ram Kumar',
        sessionId: 'test-session',
        mode: 'assistant',
      }),
    });
    
    const data = await response.json();
    expect(data.type).toBe('action');
    expect(data.action.type).toBe('create_invoice');
  });
});
```

### **E2E Test Scenarios**

**Scenario 1: Guest to User Journey**
```
1. User lands on homepage → Sales mode active
2. User asks "What features do you have?"
3. AI responds with sales pitch
4. User asks "How much?"
5. AI explains pricing
6. User clicks "Sign Up"
7. Mode transitions to Assistant
8. AI welcomes user with personalized message
9. User creates first invoice via chat
10. Invoice created successfully
```

**Scenario 2: Mode Persistence**
```
1. Authenticated user opens dashboard → Assistant mode
2. User creates invoice via chat
3. User navigates to documentation → Help mode
4. User asks how-to question
5. User returns to dashboard → Assistant mode restored
6. Previous conversation context maintained
```

---

## 📊 **Success Metrics**

### **Sales Mode Metrics**
- Chat engagement rate: % of visitors who open chat
- Average messages before signup
- Conversion rate: chat → signup
- Top questions asked (identify gaps)
- Drop-off points in conversation

### **Assistant Mode Metrics**
- Action completion rate
- Time saved vs manual UI
- Feature discovery via chat
- User satisfaction score
- Voice input adoption

### **Transition Metrics**
- Success rate of mode transitions
- Time to first message after transition
- Context preservation accuracy
- User confusion indicators

---

## ✅ **Definition of Done**

**Phase 1 Complete When:**
- [ ] Mode types and interfaces defined
- [ ] Mode detection logic working
- [ ] All three system prompts written and tested
- [ ] Mode context provider functional
- [ ] Database schema updated

**Phase 2 Complete When:**
- [ ] All UI components mode-aware
- [ ] Visual indicators clear and consistent
- [ ] Transitions smooth and bug-free
- [ ] Mobile responsive

**Phase 3 Complete When:**
- [ ] API handles all three modes correctly
- [ ] Guest data stored in localStorage
- [ ] User data stored in database
- [ ] Mode transitions work flawlessly
- [ ] No data leakage between modes

**Phase 4 Complete When:**
- [ ] Analytics tracking active
- [ ] All edge cases handled
- [ ] Documentation complete
- [ ] Deployed to production
- [ ] Monitoring in place

**Overall Success Criteria:**
- Sales mode educates and converts effectively
- Assistant mode executes actions reliably
- Mode transitions are seamless and invisible
- No user confusion about capabilities
- Positive user feedback (>4/5 rating)
- Conversion rate increases by >20%

---

## 🎯 **Next Steps**

1. **Review this spec** with your team
2. **Prioritize features** (MVP vs nice-to-have)
3. **Set up project board** with tasks from phases
4. **Begin Phase 1** (Week 1 implementation)
5. **Weekly check-ins** to review progress
6. **Iterate based on feedback** during development

**Estimated Total Time:** 4 weeks  
**Complexity:** Medium-High  
**Impact:** High (improves UX and conversion significantly)

---
