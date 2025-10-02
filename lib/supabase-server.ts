import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Server-side Supabase client with service role key
// This should ONLY be used in server-side code (API routes, server components)
// NEVER expose this client to the browser
export const supabaseServer = createClient<Database>(
  supabaseUrl,
  supabaseServiceRole,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

