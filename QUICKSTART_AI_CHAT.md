# AI Chat - Quick Start Guide

## ⚡ Get Started in 3 Steps

### Step 1: Add OpenAI API Key

1. Get your API key from https://platform.openai.com/api-keys
2. Add it to your `.env` file:

```bash
# Add this line to .env
OPENAI_API_KEY=sk-your-actual-key-here
```

### Step 2: Run Database Migration

Open your Supabase dashboard SQL editor and run:

```sql
-- Copy and paste the contents of migrations/create_ai_chat_tables.sql
-- Or use Supabase CLI:
supabase migration up
```

The migration file is located at: `/migrations/create_ai_chat_tables.sql`

### Step 3: Start the App

```bash
pnpm dev
```

Navigate to any authenticated page and click the amber floating button in the bottom-right corner!

## ✅ Verify It's Working

1. You should see a floating amber chat button
2. Click it to open the chat panel
3. Type "Hello" and press Enter
4. You should receive a response from the AI assistant

## 🔥 That's It!

The AI Chat Assistant is now active on all authenticated pages.

## 🐛 Troubleshooting

**Button not appearing?**
- Check browser console for errors
- Verify you're logged in
- Check that ChatProvider is in layout

**Messages not sending?**
- Verify OPENAI_API_KEY is set correctly
- Check API key has credits: https://platform.openai.com/usage
- Check network tab for API errors

**Database errors?**
- Make sure migration was run successfully
- Check Supabase dashboard for table creation
- Verify RLS policies are enabled

## 📖 Full Documentation

- **Setup Guide**: AI_CHAT_SETUP.md
- **Implementation Details**: AI_CHAT_IMPLEMENTATION_SUMMARY.md
- **Original Spec**: chat.md

## 💬 Example Questions to Ask

- "How do I create a new invoice?"
- "What is GST and how does it apply to jewelry?"
- "How do I add a new customer?"
- "Where can I find my inventory?"
- "How do I track gold rates?"

## 🎨 Customization

To modify the AI's behavior, edit the system prompt in:
`/app/api/ai/chat/route.ts`

```typescript
const SYSTEM_PROMPT = `You are an AI assistant for Sethiya Gold...`
```

---

**Need help?** Check the full documentation or open an issue on GitHub.
