# AI Chat Assistant - Setup & Usage Guide

## Overview

The AI Chat Assistant is a floating chat interface integrated with OpenAI that provides contextual assistance for the Sethiya Gold jewelry shop management system. Users can ask questions, get guidance on features, and receive help with invoices, inventory, and customers.

## Features Implemented

### ✅ Core Features
- **Floating Chat Button**: Always accessible button on all authenticated pages
- **Responsive Design**:
  - Desktop: Side panel (440px width)
  - Mobile: Fullscreen experience
- **Real-time Messaging**: Send and receive messages with AI assistant
- **Message History**: Persistent chat history stored in database
- **Session Management**: Automatic session creation and management
- **Error Handling**: Comprehensive error handling with retry functionality
- **Rate Limiting**: 10 messages per minute per user
- **Unread Badge**: Shows unread message count when chat is closed

### 🎨 UI Components
- `ChatFloatingButton`: Animated floating button with unread badge
- `ChatPanel`: Main chat container with responsive layout
- `ChatHeader`: Header with title and controls (clear history, close)
- `ChatMessages`: Scrollable message list with date grouping
- `ChatMessageItem`: Individual message bubble with user/assistant styling
- `ChatInput`: Auto-expanding textarea with character limit
- `ChatLoading`: Animated typing indicator

## Setup Instructions

### 1. Install Dependencies

Dependencies are already installed:
```bash
pnpm add openai react-textarea-autosize
```

### 2. Environment Variables

Add your OpenAI API key to `.env`:

```bash
OPENAI_API_KEY=sk-your-openai-api-key-here
```

Get your API key from: https://platform.openai.com/api-keys

### 3. Database Migration

Run the migration to create the required tables:

```bash
# Using Supabase CLI
supabase migration up

# Or run the SQL directly in Supabase dashboard
# File: migrations/create_ai_chat_tables.sql
```

This creates:
- `ai_chat_sessions` table
- `ai_chat_messages` table
- Indexes for performance
- Row Level Security (RLS) policies

### 4. Verify Setup

1. Start the development server:
```bash
pnpm dev
```

2. Navigate to any authenticated page
3. Look for the floating amber chat button in the bottom-right corner
4. Click to open the chat panel
5. Send a test message

## Architecture

### Database Schema

#### `ai_chat_sessions`
- `id` (UUID, PK)
- `user_id` (UUID, FK to auth.users)
- `title` (TEXT)
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)
- `is_active` (BOOLEAN)

#### `ai_chat_messages`
- `id` (UUID, PK)
- `session_id` (UUID, FK to ai_chat_sessions)
- `user_id` (UUID, FK to auth.users)
- `role` (TEXT: 'user' | 'assistant' | 'system')
- `content` (TEXT)
- `metadata` (JSONB)
- `tokens_used` (INTEGER)
- `created_at` (TIMESTAMPTZ)

### API Routes

#### `POST /api/ai/chat`
Send a message and receive AI response
- Request: `{ message: string, sessionId?: string }`
- Response: `{ response: string, sessionId: string, messageId: string, tokensUsed: number }`

#### `GET /api/ai/chat/history`
Fetch chat history for a session
- Query: `?sessionId=xxx&limit=50&offset=0`
- Response: `{ messages: [], session: {}, hasMore: boolean }`

#### `POST /api/ai/chat/new-session`
Create a new chat session
- Response: `{ sessionId: string, title: string }`

#### `DELETE /api/ai/chat/session/:id`
Delete a chat session and all its messages
- Response: `{ success: boolean }`

### State Management

Uses React Context API (`ChatProvider`) to manage:
- Chat open/closed state
- Message list
- Loading states
- Error handling
- Session management
- Unread count

### AI Configuration

The AI assistant uses:
- Model: `gpt-4o-mini` (fast and cost-effective)
- Max tokens: 1000
- Temperature: 0.7
- Context window: Last 10 messages

System prompt configured for:
- Jewelry shop management context
- Indian business terminology (GST, rupees)
- Professional yet friendly tone
- Feature guidance and navigation help

## Usage Guide

### For Users

1. **Opening Chat**: Click the floating amber button
2. **Sending Messages**:
   - Type in the input field
   - Press Enter to send
   - Shift+Enter for new line
3. **Closing Chat**: Click X button or press ESC
4. **Clearing History**: Click trash icon in header
5. **Retry Failed Messages**: Click retry button on error messages

### For Developers

#### Accessing Chat Context

```tsx
import { useChatContext } from '@/lib/contexts/chat-context'

function MyComponent() {
  const {
    isOpen,
    messages,
    sendMessage,
    openChat,
    closeChat
  } = useChatContext()

  // Use context values
}
```

#### Adding Custom Functionality

The chat system is extensible. You can:
- Modify the system prompt in `/app/api/ai/chat/route.ts`
- Add custom message metadata
- Implement message actions (future: create invoice from chat)
- Extend the ChatMessage interface for additional fields

## Customization

### Styling

Chat styles are defined using Tailwind CSS. Key color scheme:
- Primary: Amber 600/700 (matches brand)
- Background: Uses theme background
- Messages: User (amber), Assistant (muted)

### AI Behavior

Edit the system prompt in `/app/api/ai/chat/route.ts`:
```typescript
const SYSTEM_PROMPT = `You are an AI assistant for Sethiya Gold...`
```

### Rate Limiting

Adjust rate limits in `/app/api/ai/chat/route.ts`:
```typescript
// Current: 10 requests per minute
if (userLimit.count >= 10) {
  return false
}
```

## Troubleshooting

### Chat button not appearing
- Verify you're on an authenticated page
- Check that `ChatProvider` is in the layout
- Check browser console for errors

### Messages not sending
- Verify OpenAI API key is set in `.env`
- Check API key has credits
- Check network tab for API errors
- Verify database tables exist

### Database errors
- Run the migration file
- Check RLS policies are enabled
- Verify user is authenticated

### Rate limit errors
- Wait 60 seconds before retrying
- Check if multiple tabs are open
- Adjust rate limit in code if needed

## Performance Considerations

- Messages are paginated (50 per load)
- Auto-scroll disabled for older messages
- Images/rich content not yet supported
- Streaming responses not yet implemented

## Security

- All API routes check authentication
- RLS policies ensure users only see their data
- Rate limiting prevents abuse
- User input sanitized before sending to OpenAI
- OpenAI API key never exposed to client

## Future Enhancements

Planned features from the specification:
- [ ] Voice input/output capabilities
- [ ] Image analysis (jewelry photos)
- [ ] Action execution (create invoice via chat)
- [ ] Real-time message streaming
- [ ] Message search functionality
- [ ] Multi-session management UI
- [ ] Export chat history
- [ ] Smart suggestions/quick replies

## Cost Estimation

Using GPT-4o-mini:
- ~$0.15 per 1M input tokens
- ~$0.60 per 1M output tokens
- Average chat session: ~2,000 tokens
- Cost per session: ~$0.001-0.002

With 100 active users sending 10 messages/day:
- Daily cost: ~$1-2
- Monthly cost: ~$30-60

## Support

For issues or questions:
1. Check this documentation
2. Review the code in `/components/ai-chat/`
3. Check API routes in `/app/api/ai/chat/`
4. Review chat specification in `/chat.md`

## Credits

Built with:
- Next.js 15
- OpenAI API
- Supabase (database & auth)
- Tailwind CSS
- Radix UI components
