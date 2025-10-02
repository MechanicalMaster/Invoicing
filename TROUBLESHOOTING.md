# AI Chat Troubleshooting Guide

## Common Errors and Solutions

### ❌ "Chat tables not found. Please run the database migration."

**Cause**: The database tables for the AI chat feature haven't been created yet.

**Solution**:
1. Open your Supabase Dashboard
2. Go to SQL Editor
3. Copy the contents of `/migrations/create_ai_chat_tables.sql`
4. Paste and run the SQL
5. Refresh your app

**Or using Supabase CLI**:
```bash
supabase migration up
```

### ❌ "Failed to load chat history"

**Possible causes**:
1. Database tables don't exist (see above)
2. Network connection issues
3. Supabase credentials incorrect
4. RLS policies not configured

**Steps to debug**:
1. Check browser console for detailed error messages
2. Verify `.env` has correct Supabase credentials
3. Check Supabase dashboard for table existence
4. Verify RLS policies are enabled

### ❌ "Unauthorized" when sending messages

**Possible causes**:
1. Not logged in
2. Auth token expired
3. Missing Authorization header

**Solution**:
1. Log out and log back in
2. Check auth state in browser devtools
3. Verify auth provider is wrapping the app

### ❌ "Too many requests. Please wait a moment."

**Cause**: Rate limit exceeded (10 messages per minute)

**Solution**:
1. Wait 60 seconds
2. Try again
3. If persistent, check if multiple tabs are open

### ❌ "AI assistant is temporarily unavailable"

**Possible causes**:
1. OpenAI API key invalid
2. OpenAI API down
3. No credits on OpenAI account

**Solution**:
1. Check `.env` has valid `OPENAI_API_KEY`
2. Verify API key at https://platform.openai.com/api-keys
3. Check account credits at https://platform.openai.com/usage
4. Check OpenAI status at https://status.openai.com

### ❌ Chat button not appearing

**Possible causes**:
1. Not on an authenticated page
2. ChatProvider not in layout
3. JavaScript error

**Solution**:
1. Make sure you're logged in
2. Check browser console for errors
3. Verify `/app/layout.tsx` has ChatProvider
4. Clear browser cache and reload

### ❌ Messages not persisting

**Possible causes**:
1. Session creation failing
2. Database write permissions
3. RLS policies too restrictive

**Solution**:
1. Check browser console for errors
2. Verify RLS policies in Supabase dashboard
3. Check service role key is set in `.env`

## Debugging Tips

### Enable verbose logging

Open browser console (F12) and check for:
- `Auth error:` - Authentication issues
- `Session query error:` - Database query issues
- `Messages query error:` - Message loading issues

### Check database tables

Run this query in Supabase SQL Editor:
```sql
-- Check if tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name LIKE 'ai_chat%';

-- Check row count
SELECT
  (SELECT COUNT(*) FROM ai_chat_sessions) as sessions,
  (SELECT COUNT(*) FROM ai_chat_messages) as messages;
```

### Test API endpoint directly

```bash
# Get your auth token from browser devtools
# Application > Local Storage > supabase.auth.token

curl -X POST http://localhost:3000/api/ai/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"message": "test"}'
```

### Check environment variables

```bash
# Verify all required env vars are set
grep -E "OPENAI|SUPABASE" .env
```

Should show:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`

## Performance Issues

### Chat loading slowly

**Possible causes**:
1. Large message history
2. Slow network
3. Database queries not optimized

**Solution**:
1. Messages are paginated (50 per load)
2. Indexes should be created by migration
3. Check Supabase performance metrics

### AI responses taking too long

**Normal behavior**: 1-5 seconds depending on OpenAI API
**If > 10 seconds**:
1. Check OpenAI API status
2. Try with shorter messages
3. Check network latency

## Still Having Issues?

1. **Check logs**:
   - Browser console (F12)
   - Supabase logs (Dashboard > Logs)
   - Network tab for API requests

2. **Verify setup**:
   - Run through QUICKSTART_AI_CHAT.md again
   - Check all prerequisites are met

3. **Test with minimal setup**:
   - Create a fresh chat session
   - Try sending "Hello"
   - Check if response comes back

4. **Environment check**:
   ```bash
   # Make sure all dependencies are installed
   pnpm install

   # Make sure TypeScript compiles
   pnpm exec tsc --noEmit

   # Start fresh
   rm -rf .next
   pnpm dev
   ```

## Error Reference

| Error Message | Severity | Quick Fix |
|--------------|----------|-----------|
| Chat tables not found | High | Run migration |
| Unauthorized | Medium | Re-login |
| Too many requests | Low | Wait 60s |
| AI unavailable | High | Check API key |
| Failed to load | Medium | Check console |

## Getting Help

If none of these solutions work:

1. Check the full documentation in `AI_CHAT_SETUP.md`
2. Review the implementation details in `AI_CHAT_IMPLEMENTATION_SUMMARY.md`
3. Check the original spec in `chat.md`
4. Look for similar issues in project issues/discussions

## Prevention Tips

✅ **Always run database migrations before first use**
✅ **Keep OpenAI API key secure and funded**
✅ **Monitor API usage to avoid surprise costs**
✅ **Test after any deployment or environment changes**
✅ **Keep Supabase and dependencies updated**
